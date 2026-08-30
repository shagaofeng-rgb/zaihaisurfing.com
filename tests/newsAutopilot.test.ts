import assert from 'node:assert/strict';
import test from 'node:test';
import {candidateInIndustryScope, candidateStatusBlocksReevaluation, canPublishAt, lexicalSimilarity, newsModelRuntimeConfig, parseNewsFeed, scoreNewsCandidate, validateDraft} from '../src/lib/newsAutopilot';
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

test('News source thresholds preserve strict primary and separate fallback quality gates', () => {
  assert.ok(site);
  assert.equal(site!.news.candidate_max_age_hours, 120);
  assert.equal(site!.news.fallback_candidate_max_age_days, 14);
  assert.equal(site!.news.min_score, 58);
  assert.equal(site!.news.fallback_min_score, 55);
  assert.ok(site!.news.fallback_min_score <= site!.news.min_score);
});

test('active source pools exclude endpoints confirmed to return blocked or non-feed responses', () => {
  assert.ok(site);
  const domains = [...site!.sources.primary_whitelist, ...site!.sources.fallback_whitelist].map((source) => source.domain);
  for (const inactive of ['news.uscg.mil', 'theinertia.com', 'newatlas.com', 'gearjunkie.com', 'surfertoday.com', 'hospitalitynet.org', 'waterparks.org', 'marinebusinessworld.com']) {
    assert.equal(domains.includes(inactive), false);
  }
  assert.ok(site!.sources.primary_whitelist.length >= 6);
  assert.ok(site!.sources.fallback_whitelist.length >= 5);
});

test('industry scope blocks generic EV and incident news while allowing commercial marine operations', () => {
  assert.equal(candidateInIndustryScope('LG battery cells for grid storage and passenger EV production'), false);
  assert.equal(candidateInIndustryScope('Stolen sailboat hunt ends in tragedy after police search'), false);
  assert.equal(candidateInIndustryScope('Police investigation into stolen yacht tragedy includes a general safety reminder'), false);
  assert.equal(candidateInIndustryScope('PWC market trends shape marina rental fleets and dealer planning'), true);
  assert.equal(candidateInIndustryScope('Electric watercraft safety standard for resort operators'), true);
});

test('rejected candidates can be reevaluated after source or scoring repairs', () => {
  assert.equal(candidateStatusBlocksReevaluation('rejected'), false);
  assert.equal(candidateStatusBlocksReevaluation('candidate'), true);
  assert.equal(candidateStatusBlocksReevaluation('used'), true);
  assert.equal(candidateStatusBlocksReevaluation('retry_pending', 2), false);
});

test('news composition can use Vercel AI Gateway OIDC without a stored OpenAI key', () => {
  const config = newsModelRuntimeConfig({VERCEL_OIDC_TOKEN: 'test-oidc-token'});
  assert.equal(config?.endpoint, 'https://ai-gateway.vercel.sh/v1/chat/completions');
  assert.equal(config?.model, 'openai/gpt-5.4');
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
