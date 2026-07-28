import assert from 'node:assert/strict';
import test from 'node:test';
import {productSlugs, products} from '../src/lib/site';

test('the five retail catalog products remain published with their approved prices', () => {
  const expectedPrices = {
    x1: 3699,
    'x1-pro': 4099,
    'rage-shark-x': 4300,
    p1: 5999,
    'p1-pro': 6799
  };

  assert.deepEqual(productSlugs, Object.keys(expectedPrices));

  for (const [slug, price] of Object.entries(expectedPrices)) {
    const product = products[slug as keyof typeof expectedPrices];
    assert.ok(product.name);
    assert.ok(product.image);
    assert.equal(product.priceAmount, price);
  }
});
