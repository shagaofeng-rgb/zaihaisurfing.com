import {unstable_cache} from 'next/cache';
import {gzipSync, gunzipSync} from 'node:zlib';
import {cache} from 'react';
import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder} from '@/lib/commerceStore';

/**
 * A single, conservative eligibility rule for management reporting.
 * Raw records remain intact for compliance and troubleshooting; this only
 * prevents operational probes and internal traffic from becoming business KPIs.
 */
const INTERNAL_ID = /(?:^|[-_:])(admin|local-test|payment-gateway|health-check|test-contact-form)(?:$|[-_:])/i;
const INTERNAL_EVENT = /^(?:payment_notice|payment_return|checkout_duplicate_submit)$/i;

export function isBusinessAnalyticsEvent(event: AnalyticsEvent) {
  return [event.id, event.visitorId, event.sessionId].every((value) => !INTERNAL_ID.test(String(value || '')))
    && !INTERNAL_EVENT.test(event.type);
}

export function isBusinessOrder(order: StoreOrder) {
  return [order.id, order.userId, order.customer.email].every((value) => !INTERNAL_ID.test(String(value || '')));
}

const readCachedBusinessCommerceData = unstable_cache(
  async () => {
    const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
    const data = {
      orders: orders.filter(isBusinessOrder),
      events: events.filter(isBusinessAnalyticsEvent)
    };
    // Next.js rejects data-cache entries above 2 MB. The live event history
    // already exceeds that limit, so the previous cache silently missed and
    // every admin navigation re-read the entire durable event file.
    return gzipSync(JSON.stringify(data)).toString('base64');
  },
  ['zaihai-admin-business-data-v3-gzip-filter'],
  {revalidate: 30}
);

/**
 * Compact, shared source for all admin reports. The 30-second server cache
 * prevents each navigation and filter adjustment from re-reading the full
 * durable event files while keeping the underlying data authoritative.
 */
export const readAdminBusinessData = cache(async (): Promise<{
  orders: StoreOrder[];
  events: AnalyticsEvent[];
}> => {
  const packed = await readCachedBusinessCommerceData();
  return JSON.parse(gunzipSync(Buffer.from(packed, 'base64')).toString('utf8'));
});
