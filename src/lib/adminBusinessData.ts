import {unstable_cache} from 'next/cache';
import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder} from '@/lib/commerceStore';

/**
 * A single, conservative eligibility rule for management reporting.
 * Raw records remain intact for compliance and troubleshooting; this only
 * prevents operational probes and internal traffic from becoming business KPIs.
 */
const INTERNAL_ID = /(?:^|[-_:])(admin|local-test|payment-gateway|health-check|test-contact-form)(?:$|[-_:])/i;
const INTERNAL_EVENT = /^(?:payment_notice|payment_return|checkout_duplicate_submit)$/i;

export function isBusinessAnalyticsEvent(event: AnalyticsEvent) {
  const identity = [event.id, event.visitorId, event.sessionId].join(' ');
  return !INTERNAL_ID.test(identity) && !INTERNAL_EVENT.test(event.type);
}

export function isBusinessOrder(order: StoreOrder) {
  return !INTERNAL_ID.test([order.id, order.userId, order.customer.email].join(' '));
}

const readCachedBusinessCommerceData = unstable_cache(
  async () => {
    const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
    return {
      orders: orders.filter(isBusinessOrder),
      events: events.filter(isBusinessAnalyticsEvent)
    };
  },
  ['zaihai-admin-business-data-v1'],
  {revalidate: 30}
);

/**
 * Compact, shared source for all admin reports. The 30-second server cache
 * prevents each navigation and filter adjustment from re-reading the full
 * durable event files while keeping the underlying data authoritative.
 */
export async function readAdminBusinessData() {
  return readCachedBusinessCommerceData();
}
