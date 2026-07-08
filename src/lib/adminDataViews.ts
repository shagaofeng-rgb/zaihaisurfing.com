import {listAdminProducts, readAdminStore} from '@/lib/backendStore';
import {
  readAnalyticsEvents,
  readAuthorizationRecords,
  readEmailLogs,
  readPaymentNotifications,
  readRefundRecords,
  readShipmentRecords,
  readStoreOrders
} from '@/lib/commerceStore';
import {durableStoreConfigured} from '@/lib/durableStore';
import {listAuditLogs, listPromotions, listReviews} from '@/lib/adminExtraStore';

export function formatAdminDate(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function money(value: number) {
  return `USD ${Math.round(value).toLocaleString('en-US')}`;
}

export async function getRetailAdminHealth() {
  const [store, orders, events, refunds, shipments, notices, emails, products, promotions, reviews, audits] = await Promise.all([
    readAdminStore(),
    readStoreOrders(),
    readAnalyticsEvents(),
    readRefundRecords(),
    readShipmentRecords(),
    readPaymentNotifications(),
    readEmailLogs(),
    listAdminProducts(),
    listPromotions(),
    listReviews(),
    listAuditLogs()
  ]);
  const paid = orders.filter((order) => ['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status));
  const pending = orders.filter((order) => order.status === 'pending_payment');
  const lowStock = products.filter((product) => product.stock <= 5);
  return {
    store,
    orders,
    events,
    refunds,
    shipments,
    notices,
    emails,
    products,
    promotions,
    reviews,
    audits,
    persistentStore: durableStoreConfigured(),
    metrics: {
      revenue: paid.reduce((sum, order) => sum + order.total, 0),
      orders: orders.length,
      paid: paid.length,
      pending: pending.length,
      refunds: refunds.length,
      shipments: shipments.length,
      visitors: new Set(events.map((event) => event.visitorId)).size,
      pageViews: events.filter((event) => event.type === 'page_view').length,
      products: products.length,
      lowStock: lowStock.length,
      promotions: promotions.length,
      reviews: reviews.length,
      emails: emails.length,
      paymentNotices: notices.length
    },
    lowStock,
    authorizations: await readAuthorizationRecords()
  };
}
