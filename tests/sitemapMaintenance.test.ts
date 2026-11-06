import assert from 'node:assert/strict';
import test from 'node:test';
import {shouldAutomaticallySubmitSitemap, sitemapRunErrors} from '../src/lib/sitemapMaintenance';

test('reports failed or disabled Google submission even when sitemap validation passed', () => {
  const rejected = {attempted: true, success: false, status: 403, message: 'Access denied'};
  assert.deepEqual(sitemapRunErrors([], true, rejected), ['Google sitemap submission: Access denied']);
  assert.deepEqual(sitemapRunErrors([], false, rejected), []);
  assert.deepEqual(sitemapRunErrors([], true, {...rejected, attempted: false, message: 'Disabled'}), ['Google sitemap submission: Disabled']);
  assert.deepEqual(sitemapRunErrors([], true, {...rejected, success: true, status: 204}), []);
  assert.deepEqual(sitemapRunErrors(['Invalid XML'], true, rejected), ['Invalid XML']);
});

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
