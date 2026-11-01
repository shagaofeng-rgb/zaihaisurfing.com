#!/usr/bin/env node

// Read-only comparison of Search Console's exported examples against the live site.
import {readFile, writeFile} from 'node:fs/promises';

const input = process.argv[2] || 'reports/gsc-2026-11-01-urls.csv';
const output = process.argv[3] || 'reports/gsc-2026-11-01-live.json';
const lines = (await readFile(input, 'utf8')).trim().split(/\r?\n/).slice(1);
const records = lines.map((line) => {
  const fields = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((match) => match[1].replace(/""/g, '"'));
  return {category: fields[0], url: fields[1], lastCrawled: fields[2], gscStatus: fields[3]};
});
const sensitivePath = /^\/(?:api|admin|account|checkout|cart|user|leproxy|base|capture|recommendations)(?:\/|$)/i;
const sensitiveParameter = /(?:token|order|payment|secret|key|session|auth|code)=/i;
const uniqueUrls = [...new Set(records.map((record) => record.url))];
const results = new Map();
let cursor = 0;

async function checkUrl(url) {
  const initial = new URL(url);
  if (sensitivePath.test(initial.pathname) || sensitiveParameter.test(initial.search)) {
    return {url, disposition: 'sensitive_path_not_fetched'};
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const chain = [];
  let current = url;
  try {
    for (let hop = 0; hop < 6; hop++) {
      const response = await fetch(current, {
        redirect: 'manual', signal: controller.signal,
        headers: {'User-Agent': 'ZAIHAI-Indexing-Audit/1.0'}
      });
      const status = response.status;
      if (status >= 300 && status < 400) {
        const location = response.headers.get('location');
        if (!location) return {url, status, chain, disposition: 'redirect_without_location'};
        const next = new URL(location, current).toString();
        chain.push({status, from: current, to: next});
        current = next;
        continue;
      }
      if (status !== 200 || !response.headers.get('content-type')?.includes('text/html')) {
        return {url, status, finalUrl: current, chain};
      }
      const html = await response.text();
      const canonicalTag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] || '';
      const canonical = canonicalTag.match(/\bhref=["']([^"']+)/i)?.[1] || '';
      const robotsTag = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0] || '';
      const robots = robotsTag.match(/\bcontent=["']([^"']+)/i)?.[1] || '';
      const headerRobots = response.headers.get('x-robots-tag') || '';
      return {url, status, finalUrl: current, chain, canonical, robots, headerRobots};
    }
    return {url, chain, disposition: 'redirect_chain_too_long'};
  } catch (error) {
    return {url, chain, error: error instanceof Error ? error.message : String(error)};
  } finally {
    clearTimeout(timer);
  }
}

async function worker() {
  while (cursor < uniqueUrls.length) {
    const url = uniqueUrls[cursor++];
    results.set(url, await checkUrl(url));
  }
}

await Promise.all(Array.from({length: 8}, worker));
const rows = records.map((record) => ({...record, ...results.get(record.url)}));
await writeFile(output, JSON.stringify({checkedAt: new Date().toISOString(), rows}, null, 2) + '\n');
const summary = {};
for (const row of rows) {
  const key = `${row.category}:${row.disposition || row.status || 'error'}`;
  summary[key] = (summary[key] || 0) + 1;
}
console.log(JSON.stringify({total: rows.length, unique: uniqueUrls.length, summary, output}, null, 2));
