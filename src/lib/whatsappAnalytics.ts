import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent} from '@/lib/commerceStore';
import {durableStoreStatus} from '@/lib/durableStore';
import {paginate} from '@/lib/adminPagination';
import {classifyTraffic, type AttributionSnapshot} from '@/lib/trafficAttribution';

type TimeRange = {from?: Date; to?: Date};

export type WhatsAppClickRecord = {
  id: string;
  time: string;
  visitorId: string;
  sessionId: string;
  placement: string;
  targetText: string;
  page: string;
  product: string;
  country: string;
  device: string;
  browser: string;
  source: string;
  campaign: string;
  isLegacy: boolean;
};

function inRange(timestamp: string, range?: TimeRange) {
  const value = new Date(timestamp).getTime();
  if (!Number.isFinite(value)) return false;
  if (range?.from && value < range.from.getTime()) return false;
  if (range?.to && value > range.to.getTime()) return false;
  return true;
}

function text(value: unknown, fallback = '') {
  const result = String(value || '').trim();
  return result || fallback;
}

function touchFor(event: AnalyticsEvent) {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  return attribution?.lastTouch || classifyTraffic({url: event.page, referrer: event.referrer});
}

function productFor(event: AnalyticsEvent) {
  const explicit = text(event.payload?.productSlug || event.payload?.product);
  if (explicit) return explicit;
  const match = event.page.match(/\/products\/([^/?#]+)/);
  return match?.[1] || '-';
}

function isWhatsAppClick(event: AnalyticsEvent) {
  return event.type === 'whatsapp_click' ||
    (event.type === 'commerce_click' && text(event.payload?.targetKind).toLowerCase() === 'whatsapp');
}

function toRecord(event: AnalyticsEvent): WhatsAppClickRecord {
  const touch = touchFor(event);
  const isLegacy = event.type !== 'whatsapp_click';
  return {
    id: event.id,
    time: event.timestamp,
    visitorId: text(event.visitorId, 'anonymous'),
    sessionId: text(event.sessionId, 'unknown'),
    placement: text(event.payload?.whatsappPlacement || event.payload?.placement, isLegacy ? '历史未标记入口' : '未标记入口'),
    targetText: text(event.payload?.targetText, 'WhatsApp'),
    page: text(event.page, '/'),
    product: productFor(event),
    country: text(event.country, 'Unknown'),
    device: text(event.device, 'Unknown'),
    browser: text(event.browser, 'Unknown'),
    source: text(touch.source, 'direct'),
    campaign: text(touch.campaign, '-'),
    isLegacy
  };
}

function topBy(records: WhatsAppClickRecord[], value: (record: WhatsAppClickRecord) => string) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const key = value(record) || '-';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({label, count}))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 8);
}

export async function getWhatsAppAnalytics(options: TimeRange & {page: number; perPage: number}) {
  const [events, orders] = await Promise.all([readAnalyticsEvents(), readStoreOrders()]);
  const scopedEvents = events.filter((event) => inRange(event.timestamp, options));
  const records = scopedEvents.filter(isWhatsAppClick).map(toRecord).sort((a, b) => b.time.localeCompare(a.time));
  const paged = paginate(records, options.page, options.perPage);
  const clickVisitors = new Set(records.map((record) => record.visitorId).filter((id) => id !== 'anonymous'));
  const firstClickAt = new Map<string, number>();
  records.forEach((record) => {
    const timestamp = new Date(record.time).getTime();
    const current = firstClickAt.get(record.visitorId);
    if (Number.isFinite(timestamp) && (current === undefined || timestamp < current)) firstClickAt.set(record.visitorId, timestamp);
  });

  const linkedLeadVisitors = new Set(
    scopedEvents
      .filter((event) => event.type === 'contact_inquiry' && clickVisitors.has(event.visitorId))
      .filter((event) => {
        const clickedAt = firstClickAt.get(event.visitorId);
        return clickedAt !== undefined && new Date(event.timestamp).getTime() >= clickedAt;
      })
      .map((event) => event.visitorId)
  );
  const linkedOrders = orders.filter((order) => {
    const visitorId = order.attribution?.visitorId || '';
    const clickedAt = firstClickAt.get(visitorId);
    return clickedAt !== undefined && new Date(order.createdAt).getTime() >= clickedAt;
  });
  const totalVisitors = new Set(scopedEvents.filter((event) => event.type === 'page_view').map((event) => event.visitorId)).size;
  const topPlacement = topBy(records, (record) => record.placement)[0]?.label || '-';

  return {
    generatedAt: new Date().toISOString(),
    store: durableStoreStatus(),
    metrics: {
      clicks: records.length,
      uniqueVisitors: clickVisitors.size,
      visitorClickRate: totalVisitors ? Math.round((clickVisitors.size / totalVisitors) * 1000) / 10 : 0,
      linkedLeads: linkedLeadVisitors.size,
      linkedOrders: linkedOrders.length,
      topPlacement
    },
    records: paged.items,
    page: paged.page,
    perPage: paged.perPage,
    total: paged.total,
    totalPages: paged.totalPages,
    placements: topBy(records, (record) => record.placement),
    pages: topBy(records, (record) => record.page),
    products: topBy(records, (record) => record.product),
    sources: topBy(records, (record) => record.source)
  };
}
