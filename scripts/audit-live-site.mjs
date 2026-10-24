#!/usr/bin/env node

// Read-only production smoke audit. No analytics events, forms or data writes.
const origin = process.argv[2] || 'https://www.zaihaisurfing.com';
const failures = [];
const notes = [];

async function get(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {signal: controller.signal, redirect: 'follow', headers: {'User-Agent': 'ZAIHAI-Site-Audit/1.0'}});
  } finally {
    clearTimeout(timer);
  }
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
}

const index = await get(`${origin}/sitemap.xml`);
if (!index.ok) throw new Error(`Sitemap index returned ${index.status}`);
const sitemapUrls = locs(await index.text());
const pageUrls = [];
for (const sitemapUrl of sitemapUrls) {
  const response = await get(sitemapUrl);
  if (!response.ok) {
    failures.push({url: sitemapUrl, issue: `Sitemap returned ${response.status}`});
    continue;
  }
  pageUrls.push(...locs(await response.text()));
}

let cursor = 0;
async function worker() {
  while (cursor < pageUrls.length) {
    const url = pageUrls[cursor++];
    try {
      const response = await get(url);
      if (!response.ok) {
        failures.push({url, issue: `HTTP ${response.status}`});
        continue;
      }
      if (response.url !== url) notes.push({url, issue: `Redirected to ${response.url}`});
      const html = await response.text();
      const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || '';
      if (!canonical) failures.push({url, issue: 'Missing canonical'});
      else if (canonical !== url) notes.push({url, issue: `Canonical is ${canonical}`});
      if (!/<h1(?:\s|>)/i.test(html)) failures.push({url, issue: 'Missing H1'});
      if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) failures.push({url, issue: 'Sitemap URL marked noindex'});
    } catch (error) {
      failures.push({url, issue: error instanceof Error ? error.message : 'Fetch failed'});
    }
  }
}

await Promise.all(Array.from({length: 5}, worker));
console.log(JSON.stringify({origin, sitemapCount: sitemapUrls.length, pageCount: pageUrls.length, failures, notes}, null, 2));
if (failures.length) process.exitCode = 1;
