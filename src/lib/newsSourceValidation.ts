import rawQueue from '../../content/news-sites/zaihai-news-source-validation-queue.json';
import {readStoreObject, writeStoreObject} from '@/lib/durableStore';
import type {NewsSourceConfig} from '@/lib/newsSiteConfig';

const STORE_FILE = 'news-source-validation-v1.json';
const MAX_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 7_000;
const RECENT_ITEM_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

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

type FeedItem = {timestamp: number; title: string; summary: string};

export type SourceValidationRecord = {
  sourceId: string;
  checkedAt: string;
  status: 'ready_for_review' | 'validating' | 'unsupported' | 'retry_pending' | 'skipped';
  feedUrl?: string;
  itemCount?: number;
  latestPublishedAt?: string;
  attempts: number;
  successes?: number;
  robotsStatus?: 'allowed' | 'not_found';
  recentItemCount?: number;
  relevantItemCount?: number;
  usageRestriction?: 'rss-summary-link-only';
  error?: string;
};

type ValidationState = {
  version: 1;
  records: Record<string, SourceValidationRecord>;
  runs: Array<{at: string; checked: number; ready: number; unsupported: number; retryPending: number}>;
};

const queue = rawQueue as {site_id?: string; entries: QueueEntry[]};

function now() { return new Date().toISOString(); }
function compact(value: string, limit = 1_000) { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit); }
function htmlDecode(value: string) { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }

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
    } catch { /* Ignore malformed discovery hints. */ }
  }
  return '';
}

function feedValue(entry: string, tag: string) {
  const match = entry.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
  return compact(htmlDecode(match?.[1] || ''));
}

export function parseSourceValidationFeed(xml: string): FeedItem[] {
  const entries = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].map((match) => match[2]);
  return entries.map((entry) => ({
    timestamp: Date.parse(feedValue(entry, 'pubDate') || feedValue(entry, 'published') || feedValue(entry, 'updated')),
    title: feedValue(entry, 'title'),
    summary: feedValue(entry, 'description') || feedValue(entry, 'summary') || feedValue(entry, 'content')
  })).filter((item) => Number.isFinite(item.timestamp) && Boolean(item.title));
}

function topicMatch(item: FeedItem, topics: string[]) {
  const text = (item.title + ' ' + item.summary).toLowerCase();
  const topicTokens = topics.flatMap((topic) => topic.toLowerCase().split(/[^a-z0-9]+/)).filter((token) => token.length >= 3);
  const marineTokens = ['surf', 'water', 'marine', 'boat', 'ocean', 'coast', 'foil', 'paddle', 'resort', 'rental', 'marina', 'battery', 'composite', 'weather', 'climate', 'safety'];
  return [...new Set([...topicTokens, ...marineTokens])].some((token) => text.includes(token));
}

function recentAndRelevantItems(items: FeedItem[], topics: string[]) {
  const recent = items.filter((item) => item.timestamp >= Date.now() - RECENT_ITEM_MAX_AGE_MS && item.timestamp <= Date.now() + 60 * 60 * 1000);
  return {recent, relevant: recent.filter((item) => topicMatch(item, topics))};
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

export function robotsAllows(robots: string, path: string, agent = 'zaihai-news-source-validation') {
  const groups: Array<{agents: string[]; rules: Array<{kind: 'allow' | 'disallow'; path: string}>}> = [];
  let current: {agents: string[]; rules: Array<{kind: 'allow' | 'disallow'; path: string}>} | null = null;
  for (const original of robots.split(/\r?\n/)) {
    const line = original.replace(/#.*/, '').trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!match) continue;
    const key = match[1].toLowerCase(); const value = match[2].trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = {agents: [], rules: []}; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if (current && (key === 'allow' || key === 'disallow') && value) {
      current.rules.push({kind: key, path: value});
    }
  }
  const lowerAgent = agent.toLowerCase();
  const matching = groups.filter((group) => group.agents.some((value) => value === lowerAgent || value === '*'));
  const exact = matching.filter((group) => group.agents.includes(lowerAgent));
  const rules = (exact.length ? exact : matching).flatMap((group) => group.rules).filter((rule) => path.startsWith(rule.path));
  if (!rules.length) return true;
  const best = rules.sort((a, b) => b.path.length - a.path.length || (a.kind === 'allow' ? -1 : 1))[0];
  return best.kind === 'allow';
}

async function readRobots(sourceUrl: string) {
  const robotsUrl = new URL('/robots.txt', sourceUrl).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(robotsUrl, {headers: {'User-Agent': 'ZAIHAI-News-Source-Validation/1.0 (+https://www.zaihaisurfing.com)'}, cache: 'no-store', signal: controller.signal});
    if (response.status === 404) return {status: 'not_found' as const, text: ''};
    if (!response.ok) throw new Error('robots.txt HTTP ' + response.status);
    return {status: 'allowed' as const, text: await response.text()};
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
  return state?.version === 1 && state.records ? state : {version: 1, records: {}, runs: []};
}

export async function runNewsSourceValidation(limit = 5) {
  const state = await readNewsSourceValidationState();
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const sourceCount = queue.entries.filter((entry) => entry.mode !== 'signal-only').length;
  const ordered = sourceOrder(day % Math.max(1, sourceCount));
  const repeat = ordered.filter((entry) => {
    const record = state.records[entry.id];
    return record?.status === 'validating' || (record?.status === 'retry_pending' && record.attempts < MAX_ATTEMPTS);
  });
  const fresh = ordered.filter((entry) => {
    const record = state.records[entry.id];
    return !record || (record.status === 'unsupported' && record.attempts < MAX_ATTEMPTS);
  });
  const candidates = [...repeat, ...fresh].slice(0, Math.max(1, Math.min(limit, 5)));
  const records = {...state.records};
  let ready = 0; let unsupported = 0; let retryPending = 0;

  for (const entry of candidates) {
    const previous = records[entry.id];
    const attempts = (previous?.attempts || 0) + 1;
    try {
      const robots = await readRobots(entry.discovery_url);
      if (robots.text && !robotsAllows(robots.text, new URL(entry.discovery_url).pathname || '/')) {
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', attempts, successes: 0, robotsStatus: robots.status, error: 'robots.txt does not permit this source path.'};
        unsupported += 1;
        continue;
      }
      const page = await fetchText(entry.discovery_url);
      const feedUrl = extractFeedUrl(page, entry.discovery_url);
      if (!feedUrl) {
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', attempts, successes: 0, robotsStatus: robots.status, error: 'No HTTPS RSS or Atom discovery link was found.'};
        unsupported += 1;
        continue;
      }
      if (robots.text && !robotsAllows(robots.text, new URL(feedUrl).pathname || '/')) {
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', feedUrl, attempts, successes: 0, robotsStatus: robots.status, error: 'robots.txt does not permit the discovered feed path.'};
        unsupported += 1;
        continue;
      }
      const items = parseSourceValidationFeed(await fetchText(feedUrl));
      const {recent, relevant} = recentAndRelevantItems(items, entry.topics);
      if (!items.length || !recent.length || !relevant.length) {
        const error = !items.length ? 'The discovered feed did not contain timestamped items.' : !recent.length ? 'The discovered feed has no items from the last 14 days.' : 'Recent feed items are outside the configured industry topics.';
        records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: 'unsupported', feedUrl, attempts, successes: 0, robotsStatus: robots.status, recentItemCount: recent.length, relevantItemCount: relevant.length, error};
        unsupported += 1;
        continue;
      }
      const successes = (previous?.successes || 0) + 1;
      const status = successes >= 3 ? 'ready_for_review' : 'validating';
      records[entry.id] = {sourceId: entry.id, checkedAt: now(), status, feedUrl, itemCount: items.length, latestPublishedAt: new Date(Math.max(...items.map((item) => item.timestamp))).toISOString(), attempts: 0, successes, robotsStatus: robots.status, recentItemCount: recent.length, relevantItemCount: relevant.length, usageRestriction: 'rss-summary-link-only'};
      if (status === 'ready_for_review') ready += 1;
    } catch (caught) {
      const error = caught instanceof Error ? caught.message : 'Validation fetch failed.';
      records[entry.id] = {sourceId: entry.id, checkedAt: now(), status: attempts >= MAX_ATTEMPTS ? 'unsupported' : 'retry_pending', attempts, successes: 0, error: error.slice(0, 500)};
      if (attempts >= MAX_ATTEMPTS) unsupported += 1; else retryPending += 1;
    }
  }

  const next: ValidationState = {version: 1, records, runs: [...state.runs, {at: now(), checked: candidates.length, ready, unsupported, retryPending}].slice(-90)};
  await writeStoreObject(STORE_FILE, next);
  return {checked: candidates.length, ready, unsupported, retryPending, records: candidates.map((entry) => records[entry.id])};
}

function trustScore(type: string) {
  if (type === 'official-association' || type === 'official-event' || type === 'government-science') return 92;
  if (type === 'research-institute' || type === 'trade-association') return 88;
  if (type === 'b2b-media' || type === 'materials-media' || type === 'specialist-media') return 80;
  if (type === 'nonprofit') return 76;
  return 72;
}

export async function getValidatedNewsSources(siteId: string): Promise<NewsSourceConfig[]> {
  if (queue.site_id && queue.site_id !== siteId) return [];
  const state = await readNewsSourceValidationState();
  return queue.entries.flatMap((entry) => {
    if (entry.mode === 'signal-only') return [];
    const record = state.records[entry.id];
    if (record?.status !== 'ready_for_review' || !record.feedUrl) return [];
    try {
      const domain = new URL(entry.discovery_url).hostname.replace(/^www\./, '');
      return [{domain, type: entry.source_type, allowed_topics: entry.topics, allowed_languages: [entry.language], rss_or_api_url: record.feedUrl, source_trust_score: trustScore(entry.source_type)}];
    } catch {
      return [];
    }
  });
}
