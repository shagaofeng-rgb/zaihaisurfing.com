import assert from 'node:assert/strict';
import test from 'node:test';
import {canPublishAt, lexicalSimilarity, validateDraft} from '../src/lib/newsAutopilot';

test('News Autopilot enforces the 48-hour publication window', () => {
  const now = Date.UTC(2026, 7, 8, 12);
  assert.equal(canPublishAt(new Date(now - 47 * 60 * 60 * 1000).toISOString(), now), false);
  assert.equal(canPublishAt(new Date(now - 48 * 60 * 60 * 1000).toISOString(), now), true);
});

test('lexical similarity identifies substantially repeated editorial topics', () => {
  assert.ok(lexicalSimilarity('Electric surfboard rental fleet planning', 'Rental fleet planning for electric surfboards') > 0.6);
  assert.ok(lexicalSimilarity('Marina demo day', 'Fuel maintenance workflow') < 0.3);
});

test('quality gate rejects unapproved cover sources and missing compliance content', () => {
  const issues = validateDraft({id: 'x', title: 'Draft', slug: 'draft', excerpt: '', content: '## Source context', category: '', tags: [], productSlugs: ['x1'], industry: '', region: '', structure: '', keyword: '', source: {name: 'Source', url: 'http://invalid', publishedDate: '', accessedDate: '', note: ''}, coverImage: 'https://third-party.example/image.jpg', coverImageAlt: '', status: 'draft', seoTitle: '', seoDescription: '', contentHash: '', createdAt: '', updatedAt: '', languageStatus: {}, validation: []});
  assert.ok(issues.some((item) => item.includes('compliance')));
  assert.ok(issues.some((item) => item.includes('HTTPS')));
  assert.ok(issues.some((item) => item.includes('approved owned')));
});
