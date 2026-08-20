import assert from 'node:assert/strict';
import test from 'node:test';
import {parseSourceValidationFeed, robotsAllows} from '../src/lib/newsSourceValidation';

test('source validation only accepts timestamped feed entries', () => {
  const items = parseSourceValidationFeed('<rss><channel><item><title>Marine safety update</title><description>Water safety notice</description><pubDate>Mon, 10 Aug 2026 12:00:00 GMT</pubDate></item><item><title>Missing date</title></item></channel></rss>');
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'Marine safety update');
});

test('robots rules block disallowed paths but respect a specific allow rule', () => {
  const robots = 'User-agent: *\nDisallow: /private\nDisallow: /feed\nAllow: /feed/public';
  assert.equal(robotsAllows(robots, '/private/source'), false);
  assert.equal(robotsAllows(robots, '/feed/private'), false);
  assert.equal(robotsAllows(robots, '/feed/public/latest'), true);
  assert.equal(robotsAllows(robots, '/news'), true);
});
