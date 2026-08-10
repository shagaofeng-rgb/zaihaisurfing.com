import assert from 'node:assert/strict';
import test from 'node:test';
import {productFactLibrary, validateFacebookPostCandidate} from '@/lib/facebookPagePublisher';

test('Facebook product facts use only ZAIHAI owned media and product URLs', () => {
  const facts = productFactLibrary();
  assert.equal(facts.length, 5);
  for (const fact of facts) {
    assert.ok(fact.imageUrls.every((url) => url.startsWith('https://www.zaihaisurfing.com/assets/')));
    assert.ok(fact.sources.every((url) => url.startsWith('https://www.zaihaisurfing.com/')));
  }
});

test('Facebook validator rejects third party images and missing hashtags', () => {
  const fact = productFactLibrary()[0];
  const issues = validateFacebookPostCandidate({title: 'Test', body: 'Test', hashtags: ['#ZAIHAI'], product_name: fact.name, industry: 'Water Parks', image_url: 'https://example.com/image.jpg', landing_page_url: fact.landingPageUrl, cta: 'Explore', fact_sources: fact.sources, compliance_notes: ''}, fact, []);
  assert.ok(issues.some((item) => item.includes('Hashtag')));
  assert.ok(issues.some((item) => item.includes('media whitelist')));
});
