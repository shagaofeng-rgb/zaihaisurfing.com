import crypto from 'node:crypto';
import {appendStoreLine, readStoreLines, readStoreObject, writeStoreObject} from '@/lib/durableStore';
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
  const state = await readSitemapState();
  await writeStoreObject(STATE_FILE, {
    ...state,
    dirtyAt: new Date().toISOString(),
    dirtyReason: reason.slice(0, 240)
  } satisfies SitemapState);
}

export async function acquireSitemapLock() {
  const state = await readSitemapState();
  if (!canAcquireSitemapLock(state.lock)) return null;
  const token = crypto.randomUUID();
  const acquiredAt = new Date();
  const next: SitemapState = {
    ...state,
    lock: {
      token,
      acquiredAt: acquiredAt.toISOString(),
      expiresAt: new Date(acquiredAt.getTime() + LOCK_TTL_MS).toISOString()
    }
  };
  await writeStoreObject(STATE_FILE, next);
  const verified = await readSitemapState();
  return verified.lock?.token === token ? token : null;
}

export async function finishSitemapRun(token: string, result: SitemapRunResult, snapshot?: SitemapEntry[]) {
  const state = await readSitemapState();
  if (state.lock?.token !== token) return;
  const next: SitemapState = {
    ...state,
    dirtyAt: result.success && !result.dryRun ? '' : state.dirtyAt,
    dirtyReason: result.success && !result.dryRun ? '' : state.dirtyReason,
    snapshot: result.success && !result.dryRun && snapshot ? snapshot : state.snapshot,
    lastRun: result,
    lock: undefined
  };
  await writeStoreObject(STATE_FILE, next);
  await appendStoreLine(LOG_FILE, result);
}

export async function releaseSitemapLock(token: string) {
  const state = await readSitemapState();
  if (state.lock?.token !== token) return;
  await writeStoreObject(STATE_FILE, {...state, lock: undefined});
}
