import fs from 'node:fs/promises';
import path from 'node:path';
import {products, type ProductSlug} from '@/lib/site';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'zaihai-commerce') : path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.jsonl');
const EVENTS_FILE = path.join(DATA_DIR, 'analytics-events.jsonl');

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type StoreOrder = {
  id: string;
  productSlug: ProductSlug;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: 'USD';
  subtotal: number;
  shippingEstimate: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'qianhai_card' | 'bank_transfer' | 'paypal' | 'manual_quote';
  paymentGateway: string;
  gatewayStatus: 'not_submitted' | 'pending' | 'success' | 'failed';
  trackingNumber: string;
  logisticsStatus: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
    country: string;
    address: string;
    message: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsEvent = {
  id: string;
  type: string;
  visitorId: string;
  sessionId: string;
  page: string;
  pageTitle: string;
  referrer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

export type CommerceSnapshotFilter = {
  from?: Date;
  to?: Date;
};

function safeJson<T>(line: string): T | null {
  try {
    return JSON.parse(line) as T;
  } catch {
    return null;
  }
}

async function appendJsonLine(file: string, value: unknown) {
  await fs.mkdir(DATA_DIR, {recursive: true});
  await fs.appendFile(file, `${JSON.stringify(value)}\n`, 'utf8');
}

async function readJsonLines<T>(file: string) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return text.split(/\r?\n/).map((line) => safeJson<T>(line)).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

export function shippingEstimateFor(country: string) {
  const normalized = country.toLowerCase();
  if (/usa|united states|canada/.test(normalized)) return 680;
  if (/uae|saudi|qatar|oman|kuwait|middle east/.test(normalized)) return 620;
  if (/spain|france|italy|greece|germany|europe/.test(normalized)) return 720;
  if (/maldives|thailand|indonesia|singapore|australia/.test(normalized)) return 560;
  return 650;
}

export async function createStoreOrder(input: {
  productSlug: ProductSlug;
  quantity: number;
  paymentMethod?: StoreOrder['paymentMethod'];
  customer: StoreOrder['customer'];
}) {
  const product = products[input.productSlug];
  const quantity = Math.max(1, Math.min(99, Number(input.quantity || 1)));
  const subtotal = product.priceAmount * quantity;
  const shippingEstimate = shippingEstimateFor(input.customer.country);
  const now = new Date().toISOString();
  const order: StoreOrder = {
    id: `ZH-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    productSlug: input.productSlug,
    productName: product.name,
    quantity,
    unitPrice: product.priceAmount,
    currency: 'USD',
    subtotal,
    shippingEstimate,
    total: subtotal + shippingEstimate,
    status: 'pending_payment',
    paymentMethod: input.paymentMethod || 'qianhai_card',
    paymentGateway: 'qianhai',
    gatewayStatus: 'not_submitted',
    trackingNumber: '',
    logisticsStatus: 'Order received, waiting for payment confirmation',
    customer: input.customer,
    createdAt: now,
    updatedAt: now
  };
  await appendJsonLine(ORDERS_FILE, order);
  return order;
}

export async function readStoreOrders() {
  const orders = await readJsonLines<StoreOrder>(ORDERS_FILE);
  return orders.length ? orders : mockOrders();
}

export async function appendAnalyticsEvent(event: AnalyticsEvent) {
  await appendJsonLine(EVENTS_FILE, event);
}

export async function readAnalyticsEvents() {
  const events = await readJsonLines<AnalyticsEvent>(EVENTS_FILE);
  return events.length ? events : mockAnalytics();
}

function isInsideRange(value: string, filter?: CommerceSnapshotFilter) {
  if (!filter?.from && !filter?.to) return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  if (filter.from && time < filter.from.getTime()) return false;
  if (filter.to && time > filter.to.getTime()) return false;
  return true;
}

export async function getCommerceSnapshot(filter?: CommerceSnapshotFilter) {
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const filteredOrders = orders.filter((order) => isInsideRange(order.createdAt, filter));
  const filteredEvents = events.filter((event) => isInsideRange(event.timestamp, filter));
  const paidOrders = filteredOrders.filter((order) => order.status === 'paid' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered');
  const pendingOrders = filteredOrders.filter((order) => order.status === 'pending_payment');
  const shippedOrders = filteredOrders.filter((order) => order.status === 'shipped' || order.status === 'delivered');
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const checkoutEvents = filteredEvents.filter((event) => event.type === 'checkout_start' || event.type === 'checkout_submit');
  const countries = countBy([...filteredOrders.map((order) => order.customer.country), ...filteredEvents.map((event) => event.country)]);
  const productDemand = countBy(filteredOrders.map((order) => order.productName));

  return {
    generatedAt: new Date().toISOString(),
    filter: {
      from: filter?.from?.toISOString() || '',
      to: filter?.to?.toISOString() || ''
    },
    paymentGateway: {
      provider: 'Qianhai credit card gateway',
      status: process.env.QIANHAI_MERCHANT_ID ? 'env_ready' : 'waiting_for_credentials',
      createEndpoint: '/api/payments/qianhai/create',
      notifyEndpoint: '/api/payments/qianhai/notify'
    },
    metrics: {
      orders: filteredOrders.length,
      pendingPayment: pendingOrders.length,
      shipped: shippedOrders.length,
      revenue,
      visitors: new Set(filteredEvents.map((event) => event.visitorId)).size,
      checkoutEvents: checkoutEvents.length
    },
    countries,
    productDemand,
    recentOrders: filteredOrders.slice(-12).reverse(),
    recentEvents: filteredEvents.slice(-18).reverse()
  };
}

function countBy(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) || 0) + 1));
  return [...map.entries()].map(([label, value]) => ({label, value})).sort((a, b) => b.value - a.value).slice(0, 8);
}

function mockOrders(): StoreOrder[] {
  const now = Date.now();
  return [
    sampleOrder('ZH-DEMO-1001', 'x1-pro', 'UAE', 'pending_payment', now - 3600000),
    sampleOrder('ZH-DEMO-1002', 'rage-shark-x', 'United States', 'processing', now - 86400000),
    sampleOrder('ZH-DEMO-1003', 'p1-pro', 'Spain', 'shipped', now - 172800000)
  ];
}

function sampleOrder(id: string, productSlug: ProductSlug, country: string, status: OrderStatus, time: number): StoreOrder {
  const product = products[productSlug];
  const shippingEstimate = shippingEstimateFor(country);
  const quantity = productSlug === 'rage-shark-x' ? 2 : 1;
  const subtotal = product.priceAmount * quantity;
  return {
    id,
    productSlug,
    productName: product.name,
    quantity,
    unitPrice: product.priceAmount,
    currency: 'USD',
    subtotal,
    shippingEstimate,
    total: subtotal + shippingEstimate,
    status,
    paymentMethod: 'qianhai_card',
    paymentGateway: 'qianhai',
    gatewayStatus: status === 'pending_payment' ? 'pending' : 'success',
    trackingNumber: status === 'shipped' ? 'ZHSEA20260531001' : '',
    logisticsStatus: status === 'shipped' ? 'Packed and handed to forwarder' : 'Factory confirmation',
    customer: {
      name: 'Demo Buyer',
      email: 'buyer@example.com',
      phone: '+1 555 0100',
      company: 'Demo Resort Group',
      country,
      address: 'Commercial waterfront project',
      message: 'Demo order for dashboard preview'
    },
    createdAt: new Date(time).toISOString(),
    updatedAt: new Date(time).toISOString()
  };
}

function mockAnalytics(): AnalyticsEvent[] {
  return ['US', 'AE', 'ES', 'TH', 'AU'].map((country, index) => ({
    id: `demo-event-${index}`,
    type: index % 2 ? 'product_view' : 'page_view',
    visitorId: `demo-visitor-${index}`,
    sessionId: `demo-session-${index}`,
    page: index % 2 ? '/en/products/x1-pro' : '/en',
    pageTitle: 'ZAIHAI SURFING',
    referrer: index % 2 ? 'https://www.google.com/' : '',
    country,
    city: '',
    device: index % 2 ? 'Mobile' : 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    timestamp: new Date(Date.now() - index * 3600000).toISOString(),
    payload: {}
  }));
}
