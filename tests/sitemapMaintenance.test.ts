import assert from 'node:assert/strict';
import test from 'node:test';
import {shouldAutomaticallySubmitSitemap} from '../src/lib/sitemapMaintenance';

test('submits automatically when a configured sitemap changes', () => {
  assert.equal(shouldAutomaticallySubmitSitemap({
    generated: true,
    changed: true,
    hasPreviousSnapshot: true,
    submissionEnabled: true
  }), true);
});

test('does not resubmit an unchanged sitemap during the daily health check', () => {
  assert.equal(shouldAutomaticallySubmitSitemap({
    generated: false,
    changed: false,
    hasPreviousSnapshot: true,
    submissionEnabled: true
  }), false);
});

test('submits the first valid sitemap but never submits while disabled', () => {
  assert.equal(shouldAutomaticallySubmitSitemap({
    generated: true,
    changed: false,
    hasPreviousSnapshot: false,
    submissionEnabled: true
  }), true);
  assert.equal(shouldAutomaticallySubmitSitemap({
    generated: true,
    changed: true,
    hasPreviousSnapshot: true,
    submissionEnabled: false
  }), false);
});
