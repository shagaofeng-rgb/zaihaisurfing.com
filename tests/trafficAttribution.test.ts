import assert from 'node:assert/strict';
import {test} from 'node:test';
import {classifyTraffic, isMeaningfulMarketingTouch} from '../src/lib/trafficAttribution';

test('tracks Meta click identifiers without treating unlabelled clicks as ads', () => {
  const link = 'https://www.zaihaisurfing.com/en/products?fbclid=click-1';
  const referrer = 'https://www.facebook.com/feed';
  const unlabelled = classifyTraffic({url: link, referrer});
  assert.equal(unlabelled.source, 'facebook');
  assert.equal(unlabelled.channel, 'unknown');
  assert.equal(unlabelled.clickIdType, 'fbclid');
  assert.ok(isMeaningfulMarketingTouch(unlabelled));
  assert.equal(classifyTraffic({url: `${link}&utm_source=meta&utm_medium=cpc`, referrer}).channel, 'paid_social');
});

test('keeps search source and landing path while dropping query values from recorded URLs', () => {
  const touch = classifyTraffic({
    url: 'https://www.zaihaisurfing.com/en/contact?token=private',
    referrer: 'https://www.google.com/search?q=buyer'
  });
  assert.equal(touch.source, 'google');
  assert.equal(touch.channel, 'organic_search');
  assert.equal(touch.landingPage, 'https://www.zaihaisurfing.com/en/contact');
  assert.equal(touch.referrer, 'https://www.google.com/search');
  assert.equal(classifyTraffic({url: touch.currentUrl, referrer: 'https://zaihaisurfing.com/en'}).channel, 'direct');
});
