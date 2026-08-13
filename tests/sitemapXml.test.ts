import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chunkSitemapEntries,
  isIndexableRecord,
  renderSitemap,
  renderSitemapIndex,
  validateSitemapXml,
  xmlEscape,
  type SitemapEntry
} from '../src/lib/sitemapXml';
import {isIndexableNewsTaxonomy} from '../src/lib/newsFeed';

function entry(index: number): SitemapEntry {
  return {
    section: 'pages',
    url: `https://www.zaihaisurfing.com/en/page-${index}?a=1&b=2`,
    lastModified: '2026-07-08',
    alternates: {en: `https://www.zaihaisurfing.com/en/page-${index}`}
  };
}

test('renders valid sitemap XML with escaped absolute URLs and stable lastmod', () => {
  const xml = renderSitemap([entry(1)]);
  assert.equal(validateSitemapXml(xml, 'urlset'), true);
  assert.match(xml, /a=1&amp;b=2/);
  assert.match(xml, /<lastmod>2026-07-08<\/lastmod>/);
  assert.doesNotMatch(xml, new RegExp(new Date().toISOString().slice(0, 10)));
});

test('escapes every XML-sensitive character', () => {
  assert.equal(xmlEscape(`&<>"'`), '&amp;&lt;&gt;&quot;&apos;');
});

test('excludes drafts, deleted, noindex and non-canonical records', () => {
  assert.equal(isIndexableRecord({status: 'published'}), true);
  assert.equal(isIndexableRecord({status: 'draft'}), false);
  assert.equal(isIndexableRecord({status: 'published', deleted: true}), false);
  assert.equal(isIndexableRecord({status: 'published', noindex: true}), false);
  assert.equal(isIndexableRecord({status: 'published', canonicalSelf: false}), false);
});

test('splits sitemap entries before the URL limit', () => {
  const chunks = chunkSitemapEntries([entry(1), entry(2), entry(3)], 2, 10_000);
  assert.deepEqual(chunks.map((chunk) => chunk.length), [2, 1]);
});

test('renders a valid sitemap index', () => {
  const xml = renderSitemapIndex([{url: 'https://www.zaihaisurfing.com/sitemaps/pages-1.xml', lastModified: '2026-07-08'}]);
  assert.equal(validateSitemapXml(xml, 'sitemapindex'), true);
});

test('news taxonomy requires three distinct articles before it can be submitted', () => {
  const duplicateTagRecords = new Map<string, string>();
  duplicateTagRecords.set('article-1', '2026-08-01');
  duplicateTagRecords.set('article-1', '2026-08-01');
  duplicateTagRecords.set('article-2', '2026-08-02');
  assert.equal(isIndexableNewsTaxonomy(duplicateTagRecords.size), false);
  duplicateTagRecords.set('article-3', '2026-08-03');
  assert.equal(isIndexableNewsTaxonomy(duplicateTagRecords.size), true);
});
