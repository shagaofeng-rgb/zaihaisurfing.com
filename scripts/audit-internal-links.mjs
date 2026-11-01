#!/usr/bin/env node

// Read-only check of public links rendered on every sitemap page.
const origin = process.argv[2] || 'https://www.zaihaisurfing.com';
const failures = [];
const seen = new Set();
const pageUrls = [];
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'));
const get = async (url) => fetch(url, {redirect: 'follow', headers: {'User-Agent': 'ZAIHAI-Link-Audit/1.0'}});
const index = await get(`${origin}/sitemap.xml`);
if (!index.ok) throw new Error(`Sitemap index returned ${index.status}`);
for (const sitemapUrl of locs(await index.text())) {
  const response = await get(sitemapUrl);
  if (!response.ok) throw new Error(`${sitemapUrl} returned ${response.status}`);
  pageUrls.push(...locs(await response.text()));
}
let cursor = 0;
async function worker() {
  while (cursor < pageUrls.length) {
    const source = pageUrls[cursor++];
    const response = await get(source);
    if (!response.ok) continue;
    const html = await response.text();
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
      try {
        const target = new URL(match[1].replace(/&amp;/g, '&'), source);
        if (target.origin !== origin || /^\/(?:admin|account|api|checkout|cart|pricing-admin)(?:\/|$)/.test(target.pathname)) continue;
        target.hash = '';
        target.search = '';
        if (!seen.has(target.href)) seen.add(target.href);
      } catch { /* A non-HTTP link is outside this audit. */ }
    }
  }
}
await Promise.all(Array.from({length: 8}, worker));
const links = [...seen];
cursor = 0;
async function checkLinks() {
  while (cursor < links.length) {
    const url = links[cursor++];
    try {
      const response = await get(url);
      if (!response.ok) failures.push({url, status: response.status});
    } catch (error) {
      failures.push({url, error: error instanceof Error ? error.message : String(error)});
    }
  }
}
await Promise.all(Array.from({length: 8}, checkLinks));
console.log(JSON.stringify({pages: pageUrls.length, uniquePublicLinks: links.length, failures}, null, 2));
if (failures.length) process.exitCode = 1;
