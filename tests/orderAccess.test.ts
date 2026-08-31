import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOrderAccessToken,
  hashOrderAccessToken,
  orderAccessCookieName,
  orderAccessCookieOptions,
  orderTokenMatches
} from '../src/lib/orderAccess';

test('order access tokens are random, hashed, and matched without exposing the token', () => {
  const first = createOrderAccessToken();
  const second = createOrderAccessToken();
  assert.notEqual(first, second);
  assert.equal(hashOrderAccessToken(first).length, 64);
  assert.equal(orderTokenMatches({orderAccessTokenHash: hashOrderAccessToken(first)}, first), true);
  assert.equal(orderTokenMatches({orderAccessTokenHash: hashOrderAccessToken(first)}, second), false);
  assert.equal(orderTokenMatches({orderAccessTokenHash: ''}, first), false);
});

test('order access cookies are scoped, httpOnly, and stable per order', () => {
  assert.equal(orderAccessCookieName('ZH-100'), orderAccessCookieName('ZH-100'));
  assert.notEqual(orderAccessCookieName('ZH-100'), orderAccessCookieName('ZH-101'));
  assert.match(orderAccessCookieName('ZH-100'), /^zaihai_order_access_[a-f0-9]{20}$/);
  assert.equal(orderAccessCookieOptions().httpOnly, true);
  assert.equal(orderAccessCookieOptions().sameSite, 'lax');
  assert.equal(orderAccessCookieOptions().path, '/');
  assert.equal(orderAccessCookieOptions().maxAge, 86_400);
});
