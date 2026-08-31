import crypto from 'node:crypto';
import {appendStoreLine, mutateStoreObject, readStoreLines, readStoreObject} from '@/lib/durableStore';
import type {SitemapEntry} from '@/lib/sitemapXml';

const STATE_FILE = 'sitemap-state.json';
const LOG_FILE = 'sitemap-runs.jsonl';
const LOCK_TTL_MS = 15 * 60 * 1000;

export type SitemapRunResult = {
  id: string;
  trigger: 'cron' | 'content-change' | 'manual';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  success: boolean;
  dryRun: boolean;
  changed: boolean;
  generated: boolean;
  files: {file: string; urls: number; bytes: number}[];
  processedUrls: number;
  successfulUrls: number;
  skippedUrls: number;
  errorCount: number;
  added: string[];
  modified: string[];
  deleted: string[];
  split: boolean;
  robotsValid: boolean;
  publicValidation: {url: string; status: number; ok: boolean; error?: string}[];
  googleSubmission: {
    attempted: boolean;
    success: boolean;
    status: number;
    message: string;
  };
  errors: string[];
};

export type SitemapState = {
  dirtyAt: string;
  dirtyReason: string;
  lock?: {token: string; acquiredAt: string; expiresAt: string};
  snapshot: SitemapEntry[];
  lastRun?: SitemapRunResult;
  lastSuccessfulGoogleSubmissionAt?: string;
};

const emptyState: SitemapState = {
  dirtyAt: '',
  dirtyReason: '',
  snapshot: []
};

export function canAcquireSitemapLock(lock: SitemapState['lock'], now = Date.now()) {
  if (!lock) return true;
  return new Date(lock.expiresAt).getTime() <= now;
}

export async function readSitemapState() {
  return (await readStoreObject<SitemapState>(STATE_FILE)) || emptyState;
}

export async function readSitemapRunLogs(limit = 30) {
  const rows = await readStoreLines<SitemapRunResult>(LOG_FILE);
  return rows.slice(-Math.max(1, Math.min(100, limit))).reverse();
}

export async function markSitemapDirty(reason: string) {
  await mutateStoreObject<SitemapState>(STATE_FILE, (stored) => ({
    ...(stored || emptyState),
    dirtyAt: new Date().toISOString(),
    dirtyReason: reason.slice(0, 240)
  } satisfies SitemapState));
}

export async function acquireSitemapLock() {
  const token = crypto.randomUUID();
  const acquiredAt = new Date();
  let acquired = false;
  await mutateStoreObject<SitemapState>(STATE_FILE, (stored) => {
    const state = stored || emptyState;
    if (!canAcquireSitemapLock(state.lock)) return state;
    acquired = true;
    return {
      ...state,
      lock: {
        token,
        acquiredAt: acquiredAt.toISOString(),
        expiresAt: new Date(acquiredAt.getTime() + LOCK_TTL_MS).toISOString()
      }
    };
  });
  return acquired ? token : null;
}

export async function finishSitemapRun(token: string, result: SitemapRunResult, snapshot?: SitemapEntry[]) {
  let finished = false;
  await mutateStoreObject<SitemapState>(STATE_FILE, (stored) => {
    const state = stored || emptyState;
    if (state.lock?.token !== token) return state;
    finished = true;
    return {
      ...state,
      dirtyAt: result.success && !result.dryRun ? '' : state.dirtyAt,
      dirtyReason: result.success && !result.dryRun ? '' : state.dirtyReason,
      snapshot: result.success && !result.dryRun && snapshot ? snapshot : state.snapshot,
      lastRun: result,
      lastSuccessfulGoogleSubmissionAt: result.googleSubmission.success
        ? result.finishedAt
        : state.lastSuccessfulGoogleSubmissionAt,
      lock: undefined
    };
  });
  if (!finished) return;
  await appendStoreLine(LOG_FILE, result);
}

export async function releaseSitemapLock(token: string) {
  await mutateStoreObject<SitemapState>(STATE_FILE, (stored) => {
    const state = stored || emptyState;
    return state.lock?.token === token ? {...state, lock: undefined} : state;
  });
}
