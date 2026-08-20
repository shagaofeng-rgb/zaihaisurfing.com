import rawQueue from '../../content/news-sites/zaihai-news-source-validation-queue.json';
import {readStoreObject, writeStoreObject} from '@/lib/durableStore';

const STORE_FILE = 'news-source-validation-v1.json';
const MAX_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 7_000;

type QueueEntry = {
  id: string;
  name: string;
  discovery_url: string;
  source_type: string;
  mode: 'publication-candidate' | 'already-active' | 'signal-only';
  topics: string[];
  language: string;
  status: string;
};

export type SourceValidationRecord = {
  sourceId: string;
  checkedAt: string;
  status: 'ready_for_review' | 'validating' | 'unsupported' | 'retry_pending' | 'skipped';
  feedUrl?: string;
  itemCount?: number;
  latestPublishedAt?: string;
  attempts: number;
  successes?: number;
  error?: string;
};

type ValidationState = {
  version: 1;
  records: Record<string, SourceValidationRecord>;
  runs: Array<{at: string; checked: number; ready: number; unsupported: number; retryPending: number}>;
};

const queue = rawQueue as {entries: QueueEntry[]};

function now() {
  return new Date().toISOString();
}

function compact(value: string, limit = 1_000) {
  return value.replace(/\s+/g, ' ').trim().slice(0, limit);
}

function htmlDecode(value: string) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function extractFeedUrl(html: string, sourceUrl: string) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  for (const link of links) {
    const type = (link.match(/\btype=["']([^"']+)["']/i)?.[1] || '').toLowerCase();
    const rel = (link.match(/\brel=["']([^"']+)["']/i)?.[1] || '').toLowerCase();
    const href = link.match(/\bhref=["']([^"']+)["']/i)?.[1] || '';
    if (!href || !/(rss|atom|feed)/i.test(type + ' ' + rel + ' ' + href)) continue;
    try {
      const candidate = new URL(htmlDecode(href), sourceUrl);
      if (candidate.protocol === 'https:') return candidate.toString();
    } catch {
      // Ignore malformed discovery hints and continue looking.
    }
  }
  return '';
}

function parseFeed(xml: string) {
  const entries = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((match) => match[2]);
  return entries.map((entry) => {
    const date = entry.match(/<(?:pubDate|published|updated)(?:\s[^>]*)?>([\s\S]*?)<\/(?:pubDate|published|updated)>/i)?.[1] || '';
    return Date.parse(compact(date));
  }).filter((timestamp) => Number.isFinite(timestamp));
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {'User-Agent': 'ZAIHAI-News-Source-Validation/1.0 (+https://www.zaihaisurfing.com)'},
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function sourceOrder(offset: number) {
  const candidates = queue.entries.filter((entry) => entry.mode !== 'signal-only');
  return [...candidates.slice(offset), ...candidates.slice(0, offset)];
}

export async function readNewsSourceValidationState(): Promise<ValidationState> {
  const state = await readStoreObject<ValidationState>(STORE_FILE);
  if (state?.version === 1 && state.records) return state;
  return {version: 1, records: {}, runs: []};
}

export async function runNewsSourceValidation(limit = 5) {
  const state = await readNewsSourceValidationState();
  const hour = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const candidates = sourceOrder(hour % Math.max(1, queue.entries.filter((entry) => entry.mode !== 'signal-only').length))
    .filter((entry) => {
      const existing = state.records[entry.id];
      return !existing || existing.status === 'validating' || existing.status === 'retry_pending' || existing.status === 'unsupported';
    })
    .slice(0, Math.max(1, Math.min(limit, 5)));

  const records = {...state.records};
  let ready = 0;
  let unsupported = 0;
  let retryPending = 0;

  for (const entry of candidates) {
    const previous = records[entry.id];
    const attempts = (previous?.attempts || 0) + 1;
    try {
      const page = await fetchText(entry.discovery_url);
      const feedUrl = extractFeedUrl(page, entry.discovery_url);
      if (!feedUrl) {
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', attempts, error: 'No HTTPS RSS or Atom discovery link was found.'};
        unsupported += 1;
        continue;
      }
      const feed = await fetchText(feedUrl);
      const dates = parseFeed(feed);
      if (!dates.length) {
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', feedUrl, attempts, error: 'The discovered feed did not contain timestamped items.'};
        unsupported += 1;
        continue;
      }
      const successes = (previous?.successes || 0) + 1;
      const status = successes >= 3 ? 'ready_for_review' : 'validating';
      records[entry.id] = {sourceId: entry.id, checkedAt: now(), status, feedUrl, itemCount: dates.length, latestPublishedAt: new Date(Math.max(...dates)).toISOString(), attempts: 0, successes};
      if (status === 'ready_for_review') ready += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation fetch failed.';
      records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: attempts >= MAX_ATTEMPTS ? 'unsupported' : 'retry_pending', attempts, error: message.slice(0, 500)};
      if (attempts >= MAX_ATTEMPTS) unsupported += 1; else retryPending += 1;
    }
  }

  const next: ValidationState = {
    version: 1,
    records,
    runs: [...state.runs, {at: now(), checked: candidates.length, ready, unsupported, retryPending}].slice(-90)
  };
  await writeStoreObject(STORE_FILE, next);
  return {checked: candidates.length, ready, unsupported, retryPending, records: candidates.map((entry) => records[entry.id])};
}
