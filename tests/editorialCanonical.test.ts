import assert from 'node:assert/strict';
import test from 'node:test';
import {blogContentFingerprint} from '../src/lib/blogFeed';
import {newsContentFingerprint} from '../src/lib/newsFeed';

test('News fingerprint ignores publication-date and buyer-brief churn', () => {
  const first = newsContentFingerprint({
    title: 'After-Sales Planning Is Becoming Central to Fleet Buying - 2026-08-03 Buyer Brief 4',
    excerpt: 'A buyer-oriented market summary.'
  });
  const repeat = newsContentFingerprint({
    title: 'After-Sales Planning Is Becoming Central to Fleet Buying - 2026-08-06 Buyer Brief 4',
    excerpt: 'A buyer-oriented market summary.'
  });

  assert.equal(first, repeat);
});

test('Blog fingerprint ignores date-edition churn', () => {
  const first = blogContentFingerprint({
    title: 'Commercial Electric Surfboard Buying Checklist for Resorts (2026-07-27 Edition)',
    excerpt: 'A practical purchase guide.'
  });
  const repeat = blogContentFingerprint({
    title: 'Commercial Electric Surfboard Buying Checklist for Resorts (2026-07-28 Edition)',
    excerpt: 'A practical purchase guide.'
  });

  assert.equal(first, repeat);
});
