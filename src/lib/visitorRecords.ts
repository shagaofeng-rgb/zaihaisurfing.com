import {createHash} from 'node:crypto';
import {readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder} from '@/lib/commerceStore';
import {durableStoreStatus} from '@/lib/durableStore';
import {zhCountry, zhTrafficPlatform, zhTrafficSource} from '@/lib/adminLabels';
import {classifyTraffic, type AttributionSnapshot, type TrafficTouch} from '@/lib/trafficAttribution';

export type VisitorProfileSummary = {
  profileId: string;
  customerNo: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  device: string;
  browser: string;
  source: string;
  sourcePlatform: string;
  sourceDetail: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastPage: string;
  customerTag: string;
  periodVisits: number;
  totalVisits: number;
  sessions: number;
  pages: number;
  visitDays: number;
  formSubmissions: number;
  whatsappClicks: number;
  orderCount: number;
  ip: string;
};

export type VisitorProfileDetail = {
  profile: VisitorProfileSummary;
  identities: string[];
  events: AnalyticsEvent[];
  orders: StoreOrder[];
  formEvents: AnalyticsEvent[];
  countries: string[];
  devices: string[];
  ips: string[];
};

type Filter = {
  from?: Date;
  to?: Date;
  q?: string;
  country?: string;
  source?: string;
  limit?: number;
  page?: number;
  perPage?: number;
};

type ProfileGroup = {
  identities: Set<string>;
  events: AnalyticsEvent[];
  orders: StoreOrder[];
};

const GATEWAY_EVENTS = new Set(['payment_notice', 'payment_return']);
const INTERNAL_VISITORS = new Set(['payment-gateway', 'admin', 'local-test', 'checkout']);
const FORM_EVENT_PATTERN = /contact_inquiry|form_submit|submit/i;
const CHECKOUT_EVENT_PATTERN = /checkout/i;
const WHATSAPP_EVENT_PATTERN = /whatsapp/i;

class IdentityGraph {
  private parent = new Map<string, string>();

  add(value: string) {
    if (value && !this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    this.add(value);
    const parent = this.parent.get(value) || value;
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  union(left: string, right: string) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) this.parent.set(rightRoot, leftRoot);
  }
}

function inRange(timestamp: string, filter: Filter) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;
  if (filter.from && time < filter.from.getTime()) return false;
  if (filter.to && time > filter.to.getTime()) return false;
  return true;
}

function compact(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function eventIdentityIds(event: AnalyticsEvent) {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  const ids = compact([attribution?.visitorId, event.visitorId, event.sessionId]);
  return ids.length ? ids : [`event:${event.id}`];
}

function orderIdentityIds(order: StoreOrder) {
  const attribution = order.attribution as AttributionSnapshot | null | undefined;
  const ids = compact([attribution?.visitorId, order.userId]);
  return ids.length ? ids : [`order:${order.id}`];
}

function normalizedEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return email && email.includes('@') ? email : '';
}

function normalizedPhone(value: unknown) {
  const phone = String(value || '').replace(/[^\d+]/g, '');
  return phone.replace(/\D/g, '').length >= 7 ? phone : '';
}

function contactNodes(email: unknown, phone: unknown) {
  return compact([
    normalizedEmail(email) ? `contact-email:${normalizedEmail(email)}` : '',
    normalizedPhone(phone) ? `contact-phone:${normalizedPhone(phone)}` : ''
  ]);
}

function stableVisitorId(event: AnalyticsEvent) {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  return attribution?.visitorId || event.visitorId || event.sessionId || `event:${event.id}`;
}

function touchFor(event: AnalyticsEvent): TrafficTouch {
  const attribution = event.attribution as AttributionSnapshot | null | undefined;
  return attribution?.lastTouch || attribution?.sessionTouch || classifyTraffic({
    url: event.page,
    referrer: event.referrer,
    locale: String(event.payload?.language || ''),
    countryCode: event.country,
    deviceType: event.device,
    browser: event.browser,
    now: event.timestamp
  });
}

function isRealVisitorEvent(event: AnalyticsEvent) {
  if (GATEWAY_EVENTS.has(event.type)) return false;
  if (event.type.startsWith('admin_')) return false;
  const visitorId = stableVisitorId(event);
  if (INTERNAL_VISITORS.has(visitorId) || INTERNAL_VISITORS.has(event.visitorId)) return false;
  if (event.device === 'Gateway' || event.browser === 'Gateway') return false;
  return true;
}

function platformLabel(touch: TrafficTouch) {
  const source = (touch.source || '').toLowerCase();
  const click = (touch.clickIdType || '').toLowerCase();
  if (source.includes('google') || ['gclid', 'gbraid', 'wbraid'].includes(click)) return 'Google Ads';
  if (source === 'meta' || source.includes('facebook') || source.includes('instagram') || click === 'fbclid') return 'Meta Ads';
  if (source.includes('linkedin') || click === 'li_fat_id') return 'LinkedIn';
  if (source.includes('tiktok') || click === 'ttclid') return 'TikTok';
  if (source.includes('bing') || click === 'msclkid') return 'Microsoft Ads';
  if (source === 'direct') return 'Direct';
  if (touch.referrerDomain) return touch.referrerDomain;
  return touch.source || 'Unknown';
}

function sourceDetail(touch: TrafficTouch) {
  const parts = [
    touch.source ? `source=${touch.source}` : '',
    touch.medium ? `medium=${touch.medium}` : '',
    touch.campaign ? `campaign=${touch.campaign}` : '',
    touch.term ? `term=${touch.term}` : '',
    touch.content ? `content=${touch.content}` : '',
    touch.clickIdType ? `click_id=${touch.clickIdType}` : '',
    touch.referrerDomain ? `referrer=${touch.referrerDomain}` : ''
  ].filter(Boolean);
  return parts.join(' / ') || 'direct';
}

function profileIdentity(group: ProfileGroup) {
  const earliestEvent = [...group.events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
  if (earliestEvent) return stableVisitorId(earliestEvent);
  const earliestOrder = [...group.orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return earliestOrder ? orderIdentityIds(earliestOrder)[0] : [...group.identities].sort()[0];
}

function profileKeys(group: ProfileGroup) {
  const digest = createHash('sha256').update(profileIdentity(group)).digest('hex');
  return {profileId: `v-${digest.slice(0, 16)}`, customerNo: `CUS-${digest.slice(0, 8).toUpperCase()}`};
}

function buildProfileGroups(events: AnalyticsEvent[], orders: StoreOrder[]) {
  const graph = new IdentityGraph();
  const eventIds = new Map<string, string[]>();
  const orderIds = new Map<string, string[]>();

  events.forEach((event) => {
    const ids = eventIdentityIds(event);
    const contacts = contactNodes(event.payload?.email, event.payload?.phone);
    [...ids, ...contacts].forEach((id) => graph.add(id));
    [...ids.slice(1), ...contacts].forEach((id) => graph.union(ids[0], id));
    eventIds.set(event.id, ids);
  });

  orders.forEach((order) => {
    const ids = orderIdentityIds(order);
    const contacts = contactNodes(order.customer.email || order.checkout.contact, order.customer.phone);
    [...ids, ...contacts].forEach((id) => graph.add(id));
    [...ids.slice(1), ...contacts].forEach((id) => graph.union(ids[0], id));
    orderIds.set(order.id, ids);
  });

  const groups = new Map<string, ProfileGroup>();
  const ensure = (root: string) => {
    const existing = groups.get(root);
    if (existing) return existing;
    const created: ProfileGroup = {identities: new Set(), events: [], orders: []};
    groups.set(root, created);
    return created;
  };

  events.forEach((event) => {
    const ids = eventIds.get(event.id) || eventIdentityIds(event);
    const group = ensure(graph.find(ids[0]));
    ids.forEach((id) => group.identities.add(id));
    group.events.push(event);
  });

  orders.forEach((order) => {
    const ids = orderIds.get(order.id) || orderIdentityIds(order);
    const group = ensure(graph.find(ids[0]));
    ids.forEach((id) => group.identities.add(id));
    group.orders.push(order);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    events: group.events.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    orders: group.orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }));
}

function lastValue<T>(values: T[], select: (value: T) => unknown) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = String(select(values[index]) || '').trim();
    if (value) return value;
  }
  return '';
}

function profileSummary(group: ProfileGroup, periodEvents: AnalyticsEvent[]): VisitorProfileSummary {
  const {profileId, customerNo} = profileKeys(group);
  const allEvents = group.events;
  const latestEvent = periodEvents.at(-1) || allEvents.at(-1);
  const latestOrder = group.orders.at(-1);
  const touch = latestEvent ? touchFor(latestEvent) : classifyTraffic({url: '/'});
  const formEvents = allEvents.filter((event) => FORM_EVENT_PATTERN.test(event.type));
  const hasCheckout = allEvents.some((event) => CHECKOUT_EVENT_PATTERN.test(event.type));
  const totalPageViews = allEvents.filter((event) => event.type === 'page_view').length || allEvents.length;
  const periodPageViews = periodEvents.filter((event) => event.type === 'page_view').length || periodEvents.length;
  const name = lastValue(allEvents, (event) => event.payload?.name) || latestOrder?.customer.name || '';
  const email = lastValue(allEvents, (event) => event.payload?.email) || latestOrder?.customer.email || latestOrder?.checkout.contact || '';
  const phone = lastValue(allEvents, (event) => event.payload?.phone) || latestOrder?.customer.phone || '';
  const company = lastValue(allEvents, (event) => event.payload?.company) || latestOrder?.customer.company || '';
  const lastIp = lastValue(periodEvents.length ? periodEvents : allEvents, (event) => event.ip);
  const country = lastValue(periodEvents.length ? periodEvents : allEvents, (event) => event.country) || latestOrder?.customer.country || touch.countryCode || 'Unknown';
  const device = lastValue(periodEvents.length ? periodEvents : allEvents, (event) => event.device) || touch.deviceType || 'Unknown';
  const browser = lastValue(periodEvents.length ? periodEvents : allEvents, (event) => event.browser) || 'Unknown';
  const firstSeenAt = allEvents[0]?.timestamp || group.orders[0]?.createdAt || '';
  const lastSeenAt = latestEvent?.timestamp || latestOrder?.updatedAt || latestOrder?.createdAt || firstSeenAt;

  return {
    profileId,
    customerNo,
    name,
    email,
    phone,
    company,
    country,
    device,
    browser,
    source: touch.channel || 'unknown',
    sourcePlatform: platformLabel(touch),
    sourceDetail: sourceDetail(touch),
    firstSeenAt,
    lastSeenAt,
    lastPage: latestEvent?.page || touch.currentUrl || touch.landingPage || '/',
    customerTag: group.orders.length ? '已下单客户' : formEvents.length ? '已留资客户' : hasCheckout ? '结账意向客户' : totalPageViews > 1 ? '回访访客' : '新访客',
    periodVisits: periodPageViews,
    totalVisits: totalPageViews,
    sessions: new Set(allEvents.map((event) => event.sessionId).filter(Boolean)).size,
    pages: new Set(allEvents.map((event) => event.page).filter(Boolean)).size,
    visitDays: new Set(allEvents.map((event) => event.timestamp.slice(0, 10))).size,
    formSubmissions: formEvents.length,
    whatsappClicks: allEvents.filter((event) => WHATSAPP_EVENT_PATTERN.test(event.type)).length,
    orderCount: group.orders.length,
    ip: lastIp
  };
}

async function loadVisitorProfiles(filter: Filter = {}) {
  const [rawEvents, orders] = await Promise.all([readAnalyticsEvents(), readStoreOrders()]);
  const events = rawEvents.filter(isRealVisitorEvent);
  const groups = buildProfileGroups(events, orders);
  return groups.map((group) => {
    const periodEvents = group.events.filter((event) => inRange(event.timestamp, filter));
    return {group, periodEvents, summary: profileSummary(group, periodEvents)};
  });
}

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function getVisitorRecords(filter: Filter = {}) {
  const profiles = await loadVisitorProfiles(filter);
  const q = (filter.q || '').trim().toLowerCase();
  const country = (filter.country || '').trim().toLowerCase();
  const source = (filter.source || '').trim().toLowerCase();
  const filtered = profiles
    .filter(({periodEvents}) => periodEvents.length > 0)
    .map(({summary}) => summary)
    .filter((record) => {
      if (country && !`${record.country} ${zhCountry(record.country)}`.toLowerCase().includes(country)) return false;
      if (source && !`${record.source} ${zhTrafficSource(record.source)} ${record.sourcePlatform} ${zhTrafficPlatform(record.sourcePlatform)}`.toLowerCase().includes(source)) return false;
      if (!q) return true;
      return Object.values(record).some((value) => String(value).toLowerCase().includes(q));
    })
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));

  const perPage = Math.max(1, filter.perPage || filter.limit || 10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const page = Math.min(Math.max(1, filter.page || 1), totalPages);
  const start = (page - 1) * perPage;

  return {
    generatedAt: new Date().toISOString(),
    store: durableStoreStatus(),
    total: filtered.length,
    page,
    perPage,
    totalPages,
    records: filtered.slice(start, start + perPage)
  };
}

export async function getVisitorProfileDetail(profileId: string, filter: Filter = {}): Promise<VisitorProfileDetail | null> {
  const profiles = await loadVisitorProfiles(filter);
  const match = profiles.find(({summary}) => summary.profileId === profileId);
  if (!match) return null;
  const filteredEvents = match.group.events.filter((event) => inRange(event.timestamp, filter));
  return {
    profile: profileSummary(match.group, filteredEvents),
    identities: [...match.group.identities].sort(),
    events: filteredEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    orders: [...match.group.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    formEvents: match.group.events.filter((event) => FORM_EVENT_PATTERN.test(event.type)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    countries: compact(match.group.events.map((event) => event.country)),
    devices: compact(match.group.events.map((event) => [event.device, event.browser].filter(Boolean).join(' / '))),
    ips: compact(match.group.events.map((event) => event.ip || ''))
  };
}

export function visitorRecordsCsv(records: VisitorProfileSummary[]) {
  const headers = ['客户编号', '客户名称', '邮箱', '电话', '国家', '设备', '浏览器', '来源', '来源平台', '来源详情', '最近页面', '客户标签', '首次访问', '最近访问', '本期访问', '累计访问', '会话数', '页面数', '访问日', '表单数', 'WhatsApp点击', '订单数', '最近IP'];
  const rows = records.map((record) => [
    record.customerNo, record.name, record.email, record.phone, record.country, record.device, record.browser,
    record.source, record.sourcePlatform, record.sourceDetail, record.lastPage, record.customerTag,
    record.firstSeenAt, record.lastSeenAt, record.periodVisits, record.totalVisits, record.sessions,
    record.pages, record.visitDays, record.formSubmissions, record.whatsappClicks, record.orderCount, record.ip
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
