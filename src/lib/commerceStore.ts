import fs from 'node:fs/promises';
import path from 'node:path';
import {products, type ProductSlug} from '@/lib/site';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'zaihai-commerce') : path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.jsonl');
const EVENTS_FILE = path.join(DATA_DIR, 'analytics-events.jsonl');

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod =
  | 'qianhai_card'
  | 'bank_transfer'
  | 'paypal'
  | 'manual_quote'
  | 'oceanpayment_card'
  | 'oceanpayment_google_pay'
  | 'oceanpayment_apple_pay';

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
  paymentMethod: PaymentMethod;
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
  checkout: {
    contact: string;
    firstName: string;
    lastName: string;
    apartment: string;
    city: string;
    state: string;
    zip: string;
    shippingMethod: string;
    couponCode: string;
    marketingOptIn: boolean;
    billingSameAsShipping: boolean;
    billingAddress: string;
    cardBrand: string;
    cardLast4: string;
    cardholderName: string;
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
  checkout?: Partial<StoreOrder['checkout']>;
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
    paymentGateway: input.paymentMethod?.startsWith('oceanpayment') ? 'oceanpayment' : input.paymentMethod === 'qianhai_card' ? 'qianhai' : 'manual',
    gatewayStatus: 'not_submitted',
    trackingNumber: '',
    logisticsStatus: '已收到订单，等待付款确认',
    customer: input.customer,
    checkout: {
      contact: input.checkout?.contact || input.customer.email,
      firstName: input.checkout?.firstName || '',
      lastName: input.checkout?.lastName || '',
      apartment: input.checkout?.apartment || '',
      city: input.checkout?.city || '',
      state: input.checkout?.state || '',
      zip: input.checkout?.zip || '',
      shippingMethod: input.checkout?.shippingMethod || 'standard_ocean_air_quote',
      couponCode: input.checkout?.couponCode || '',
      marketingOptIn: Boolean(input.checkout?.marketingOptIn),
      billingSameAsShipping: input.checkout?.billingSameAsShipping !== false,
      billingAddress: input.checkout?.billingAddress || '',
      cardBrand: input.checkout?.cardBrand || '',
      cardLast4: input.checkout?.cardLast4 || '',
      cardholderName: input.checkout?.cardholderName || ''
    },
    createdAt: now,
    updatedAt: now
  };
  await appendJsonLine(ORDERS_FILE, order);
  return order;
}

export async function readStoreOrders() {
  return readJsonLines<StoreOrder>(ORDERS_FILE);
}

export async function findStoreOrder(orderId: string) {
  const orders = await readStoreOrders();
  return orders.find((order) => order.id === orderId) || null;
}

export async function updateStoreOrderPayment(
  orderId: string,
  patch: Partial<Pick<StoreOrder, 'status' | 'paymentMethod' | 'paymentGateway' | 'gatewayStatus' | 'logisticsStatus'>> & {
    checkout?: Partial<StoreOrder['checkout']>;
  }
): Promise<StoreOrder | null> {
  await fs.mkdir(DATA_DIR, {recursive: true});
  const orders = await readStoreOrders();
  let updated: StoreOrder | null = null;
  const now = new Date().toISOString();
  const next = orders.map((order) => {
    if (order.id !== orderId) return order;
    updated = {
      ...order,
      ...patch,
      checkout: {...order.checkout, ...(patch.checkout || {})},
      updatedAt: now
    };
    return updated;
  });
  if (!updated) return null;
  await fs.writeFile(ORDERS_FILE, `${next.map((order) => JSON.stringify(order)).join('\n')}\n`, 'utf8');
  return updated;
}

export async function appendAnalyticsEvent(event: AnalyticsEvent) {
  await appendJsonLine(EVENTS_FILE, event);
}

export async function readAnalyticsEvents() {
  return readJsonLines<AnalyticsEvent>(EVENTS_FILE);
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
      provider: 'Oceanpayment embedded gateway',
      status: process.env.OCEANPAYMENT_ACCOUNT && process.env.OCEANPAYMENT_TERMINAL && process.env.OCEANPAYMENT_SECURE_CODE && process.env.OCEANPAYMENT_PUBLIC_KEY ? 'env_ready' : 'waiting_for_credentials',
      createEndpoint: '/api/payments/oceanpayment/create',
      notifyEndpoint: '/api/payments/oceanpayment/notice'
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
