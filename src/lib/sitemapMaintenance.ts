import crypto from 'node:crypto';
import {readGoogleSitemapStatus, submitSitemapToGoogle, googleSeoConfigStatus} from '@/lib/googleSeo';
import {buildSitemapManifest, sitemapStats} from '@/lib/sitemapData';
import {
  acquireSitemapLock,
  finishSitemapRun,
  readSitemapState,
  releaseSitemapLock,
  type SitemapRunResult
} from '@/lib/sitemapState';
import {renderSitemap, renderSitemapIndex, validateSitemapXml, type SitemapEntry} from '@/lib/sitemapXml';

type MaintenanceOptions = {
  trigger: SitemapRunResult['trigger'];
  origin: string;
  force?: boolean;
  dryRun?: boolean;
  submit?: boolean;
};

/**
 * A Sitemap PUT is idempotent, but it is still an external notification and
 * should describe a real change. The earlier time-based throttle meant a
 * newly published article could wait up to three days after its Sitemap had
 * changed before Search Console was notified. Conversely, an unchanged
 * Sitemap must not be submitted again on every daily health check.
 */
export function shouldAutomaticallySubmitSitemap(input: {
  generated: boolean;
  changed: boolean;
  hasPreviousSnapshot: boolean;
  submissionEnabled: boolean;
}) {
  return input.submissionEnabled && input.generated && (input.changed || !input.hasPreviousSnapshot);
}

function entryMap(entries: SitemapEntry[]) {
  return new Map(entries.map((entry) => [entry.url, entry.lastModified]));
}

function compareSnapshots(previous: SitemapEntry[], current: SitemapEntry[]) {
  const before = entryMap(previous);
  const after = entryMap(current);
  const added = current.filter((entry) => !before.has(entry.url)).map((entry) => entry.url);
  const modified = current.filter((entry) => before.has(entry.url) && before.get(entry.url) !== entry.lastModified).map((entry) => entry.url);
  const deleted = previous.filter((entry) => !after.has(entry.url)).map((entry) => entry.url);
  return {added, modified, deleted};
}

async function fetchPublicStatus(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {cache: 'no-store', signal: controller.signal});
    return {url, status: response.status, ok: response.ok, text: await response.text()};
  } catch (error) {
    return {url, status: 0, ok: false, text: '', error: error instanceof Error ? error.message : 'Request failed'};
  } finally {
    clearTimeout(timeout);
  }
}

export async function runSitemapMaintenance(options: MaintenanceOptions) {
  const token = options.dryRun ? 'dry-run' : await acquireSitemapLock();
  if (!token) return {locked: true as const, result: null};
  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  const state = await readSitemapState();

  try {
    const manifest = await buildSitemapManifest();
    const diffs = compareSnapshots(state.snapshot, manifest.entries);
    const changed = Boolean(state.dirtyAt || diffs.added.length || diffs.modified.length || diffs.deleted.length);
    const generated = Boolean(options.force || changed || !state.snapshot.length);
    const stats = sitemapStats(manifest.parts);
    const errors: string[] = [];

    const indexXml = renderSitemapIndex(manifest.parts);
    if (!validateSitemapXml(indexXml, 'sitemapindex')) errors.push('Generated sitemap index XML is invalid.');
    manifest.parts.forEach((part) => {
      if (!validateSitemapXml(renderSitemap(part.entries), 'urlset')) errors.push(`Generated XML is invalid: ${part.file}`);
    });

    const origin = options.origin.replace(/\/$/, '');
    const publicChecks = await Promise.all([
      fetchPublicStatus(`${origin}/sitemap.xml`),
      fetchPublicStatus(`${origin}/robots.txt`),
      ...manifest.parts.map((part) => fetchPublicStatus(`${origin}/sitemaps/${part.file}`))
    ]);
    publicChecks.filter((check) => !check.ok).forEach((check) => errors.push(`Public URL check failed (${check.status}): ${check.url}`));
    const robotsCheck = publicChecks.find((check) => check.url.endsWith('/robots.txt'));
    const robotsValid = Boolean(robotsCheck?.ok && robotsCheck.text.includes('Sitemap: https://www.zaihaisurfing.com/sitemap.xml'));
    if (!robotsValid) errors.push('robots.txt does not declare the canonical sitemap index.');

    const googleConfig = googleSeoConfigStatus();
    const shouldSubmit = Boolean(options.submit || shouldAutomaticallySubmitSitemap({
      generated,
      changed,
      hasPreviousSnapshot: state.snapshot.length > 0,
      submissionEnabled: googleConfig.sitemapSubmissionEnabled
    }));
    const googleSubmission = !shouldSubmit
      ? {attempted: false, success: false, status: 0, message: 'Submission was not requested.'}
      : errors.length
        ? {attempted: false, success: false, status: 0, message: 'Submission skipped because public sitemap validation failed.'}
        : await submitSitemapToGoogle(googleConfig.sitemapUrl);
    const googleReadback = await readGoogleSitemapStatus(googleConfig.sitemapUrl);

    const finishedAt = new Date().toISOString();
    const result: SitemapRunResult = {
      id: crypto.randomUUID(),
      trigger: options.trigger,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      success: errors.length === 0,
      dryRun: Boolean(options.dryRun),
      changed,
      generated,
      files: stats,
      processedUrls: manifest.entries.length,
      successfulUrls: manifest.entries.length,
      skippedUrls: 0,
      errorCount: errors.length,
      added: diffs.added,
      modified: diffs.modified,
      deleted: diffs.deleted,
      split: manifest.parts.some((part) => part.file.endsWith('-2.xml')),
      robotsValid,
      publicValidation: publicChecks.map(({url, status, ok, error}) => ({url, status, ok, ...(error ? {error} : {})})),
      googleSubmission,
      googleReadback,
      errors
    };
    if (!options.dryRun) await finishSitemapRun(token, result, manifest.entries);
    return {locked: false as const, result};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sitemap maintenance error';
    const result: SitemapRunResult = {
      id: crypto.randomUUID(),
      trigger: options.trigger,
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      success: false,
      dryRun: Boolean(options.dryRun),
      changed: false,
      generated: false,
      files: [],
      processedUrls: 0,
      successfulUrls: 0,
      skippedUrls: 0,
      errorCount: 1,
      added: [],
      modified: [],
      deleted: [],
      split: false,
      robotsValid: false,
      publicValidation: [],
      googleSubmission: {attempted: false, success: false, status: 0, message: 'Submission skipped because sitemap generation failed.'},
      googleReadback: {attempted: false, success: false, status: 0, sitemapUrl: googleSeoConfigStatus().sitemapUrl, message: 'Google status check skipped because sitemap generation failed.'},
      errors: [message]
    };
    if (!options.dryRun) await finishSitemapRun(token, result);
    return {locked: false as const, result};
  } finally {
    if (!options.dryRun) await releaseSitemapLock(token).catch(() => undefined);
  }
}
