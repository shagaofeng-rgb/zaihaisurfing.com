import crypto from 'node:crypto';
import {cookies} from 'next/headers';
import type {StoreOrder} from '@/lib/commerceStore';
import {customerOwnsOrder, getCustomerSession} from '@/lib/customerAuth';

const ORDER_ACCESS_TTL_SECONDS = 60 * 60 * 24;

export function createOrderAccessToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashOrderAccessToken(token: string) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function orderAccessCookieName(orderId: string) {
  const suffix = crypto.createHash('sha256').update(orderId, 'utf8').digest('hex').slice(0, 20);
  return `zaihai_order_access_${suffix}`;
}

export function orderAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ORDER_ACCESS_TTL_SECONDS
  };
}

export function orderTokenMatches(order: Pick<StoreOrder, 'orderAccessTokenHash'>, token?: string) {
  if (!order.orderAccessTokenHash || !token) return false;
  const actual = hashOrderAccessToken(token);
  const expected = order.orderAccessTokenHash;
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function hasOrderAccess(order: StoreOrder) {
  const session = await getCustomerSession();
  if (session && customerOwnsOrder(order, session)) return true;
  const cookieStore = await cookies();
  return orderTokenMatches(order, cookieStore.get(orderAccessCookieName(order.id))?.value);
}

export function withoutOrderAccessHash(order: StoreOrder) {
  const {orderAccessTokenHash: _internalAccessHash, ...publicOrder} = order;
  return publicOrder;
}
