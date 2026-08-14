import assert from 'node:assert/strict';
import test from 'node:test';
import {candidateStatusBlocksReevaluation, canPublishAt, lexicalSimilarity, newsModelRuntimeConfig, parseNewsFeed, scoreNewsCandidate, validateDraft} from '../src/lib/newsAutopilot';
import {defaultNewsSite} from '../src/lib/newsSiteConfig';

const site = defaultNewsSite();

test('News publication enforces a 48-hour interval', () => {
  const now = Date.UTC(2026, 7, 8, 12);
  assert.equal(canPublishAt(new Date(now - 47 * 60 * 60 * 1000).toISOString(), now), false);
  assert.equal(canPublishAt(new Date(now - 48 * 60 * 60 * 1000).toISOString(), now), true);
});

test('lexical similarity identifies substantially repeated editorial topics', () => {
  assert.ok(lexicalSimilarity('Electric surfboard rental fleet planning', 'Rental fleet planning for electric surfboards') > 0.6);
  assert.ok(lexicalSimilarity('Marina demo day', 'Fuel maintenance workflow') < 0.3);
});

test('RSS parsing extracts only complete date-stamped items', () => {
  const items = parseNewsFeed('<rss><channel><item><title>Marine safety update</title><link>https://example.org/update</link><description>Verified safety information for operators.</description><pubDate>Mon, 10 Aug 2026 12:00:00 GMT</pubDate></item><item><title>Incomplete</title></item></channel></rss>');
  assert.equal(items.length, 1);
  assert.equal(items[0].url, 'https://example.org/update');
});

test('candidate scoring rewards current authoritative in-scope material', () => {
  assert.ok(site);
  const score = scoreNewsCandidate({
    title: 'Marine safety regulation updates electric watercraft operations',
    summary: 'A regulator announced a boating safety standard relevant to marina rental operators and battery-powered water sports equipment.',
    publishedAt: new Date().toISOString(),
    source: site!.sources.primary_whitelist[0]
  });
  assert.ok(score >= site!.news.min_score);
});

test('candidate scoring recognizes current electric marine technology coverage', () => {
  assert.ok(site);
  const score = scoreNewsCandidate({
    title: 'Marine manufacturers partner on electric yacht propulsion',
    summary: 'The companies will develop battery-powered watercraft technology for marina operators and commercial fleets.',
    publishedAt: new Date().toISOString(),
    source: site!.sources.primary_whitelist[1]
  });
  assert.ok(score >= site!.news.min_score);
});

test('rejected candidates can be reevaluated after source or scoring repairs', () => {
  assert.equal(candidateStatusBlocksReevaluation('rejected'), false);
  assert.equal(candidateStatusBlocksReevaluation('candidate'), true);
  assert.equal(candidateStatusBlocksReevaluation('used'), true);
});

test('news composition can use Vercel AI Gateway OIDC without a stored OpenAI key', () => {
  const config = newsModelRuntimeConfig({VERCEL_OIDC_TOKEN: 'test-oidc-token'});
  assert.equal(config?.endpoint, 'https://ai-gateway.vercel.sh/v1/chat/completions');
  assert.equal(config?.model, 'openai/gpt-4.1-mini');
});

test('quality gate rejects promotional and under-length News copy', () => {
  const issues = validateDraft({
    title: 'Discounted electric surfboards for sale',
    excerpt: 'Short deck.',
    content: '## News facts\nBuy now and request a quote.',
    tags: [],
    seoTitle: '',
    seoDescription: ''
  }, site);
  assert.ok(issues.some((item) => item.includes('Content must contain')));
  assert.ok(issues.some((item) => item.includes('prohibited sales CTA')));
});
