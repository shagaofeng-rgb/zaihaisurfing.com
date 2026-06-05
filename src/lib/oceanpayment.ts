import crypto from 'node:crypto';
import {siteUrl} from '@/lib/site';
import type {PaymentMethod, StoreOrder} from '@/lib/commerceStore';

export type OceanpaymentMethod = 'credit-card' | 'google-pay' | 'apple-pay';
export type OceanpaymentScene = '3d' | 'non-3d';

const scriptUrls = {
  jquery: 'https://secure.oceanpayment.com/pub/js/jquery/jq.js',
  'credit-card': 'https://secure.oceanpayment.com/pages/js/oceanpayment.js',
  'google-pay': 'https://secure.oceanpayment.com/gateway/js/googlepay_ec.js',
  'apple-pay': 'https://secure.oceanpayment.com/gateway/js/applepay_ec.js'
} as const;

export function oceanpaymentConfig() {
  const account = process.env.OCEANPAYMENT_ACCOUNT || process.env.OCEANPAYMENT_MERCHANT_NO || '';
  const terminal = process.env.OCEANPAYMENT_TERMINAL || process.env.OCEANPAYMENT_TERMINAL_NO || '';
  const secureCode = process.env.OCEANPAYMENT_SECURE_CODE || '';
  const publicKey = process.env.OCEANPAYMENT_PUBLIC_KEY || '';
  const endpoint = process.env.OCEANPAYMENT_GATEWAY_URL || 'https://secure.oceanpayment.com/gateway/service/test';
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteUrl).replace(/\/$/, '');
  return {
    account,
    terminal,
    secureCode,
    publicKey,
    endpoint,
    baseUrl,
    environment: process.env.OCEANPAYMENT_ENV || 'test',
    configured: Boolean(account && terminal && secureCode && publicKey)
  };
}

export function paymentMethodToOceanpayment(value: string): OceanpaymentMethod {
  if (value === 'oceanpayment_google_pay') return 'google-pay';
  if (value === 'oceanpayment_apple_pay') return 'apple-pay';
  return 'credit-card';
}

export function oceanpaymentToStoreMethod(value: OceanpaymentMethod): PaymentMethod {
  if (value === 'google-pay') return 'oceanpayment_google_pay';
  if (value === 'apple-pay') return 'oceanpayment_apple_pay';
  return 'oceanpayment_card';
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function amount(value: number) {
  return Math.max(0.01, value).toFixed(2);
}

function clean(value: unknown, limit = 120) {
  return String(value || '').trim().slice(0, limit);
}

function splitName(order: StoreOrder) {
  const firstName = clean(order.checkout.firstName || order.customer.name.split(/\s+/)[0] || 'Buyer', 80);
  const lastName = clean(order.checkout.lastName || order.customer.name.split(/\s+/).slice(1).join(' ') || 'Customer', 80);
  return {firstName, lastName};
}

function countryCode(value: string) {
  const normalized = value.toLowerCase();
  if (/united states|usa|america/.test(normalized)) return 'US';
  if (/united arab emirates|uae|dubai/.test(normalized)) return 'AE';
  if (/saudi/.test(normalized)) return 'SA';
  if (/australia/.test(normalized)) return 'AU';
  if (/spain/.test(normalized)) return 'ES';
  if (/france/.test(normalized)) return 'FR';
  if (/maldives/.test(normalized)) return 'MV';
  if (/thailand/.test(normalized)) return 'TH';
  if (/china/.test(normalized)) return 'CN';
  return value.length === 2 ? value.toUpperCase() : 'US';
}

export function buildOceanpaymentPayload({
  order,
  method,
  scene,
  locale,
  checkoutUrl,
  billingIp,
  forceTestMode
}: {
  order: StoreOrder;
  method: OceanpaymentMethod;
  scene: OceanpaymentScene;
  locale: string;
  checkoutUrl?: string;
  billingIp?: string;
  forceTestMode?: boolean;
}) {
  const config = oceanpaymentConfig();
  const {firstName, lastName} = splitName(order);
  const orderAmount = amount(order.total);
  const orderNumber = order.id;
  const orderCurrency = order.currency || 'USD';
  const billingEmail = clean(order.customer.email, 160);
  const signValue = sha256(
    `${config.account}${config.terminal}${orderNumber}${orderCurrency}${orderAmount}${firstName}${lastName}${billingEmail}${config.secureCode}`
  );
  const checkoutReturnUrl = checkoutUrl && /^https?:\/\//i.test(checkoutUrl)
    ? checkoutUrl
    : `${config.baseUrl}/${locale}/checkout?product=${encodeURIComponent(order.productSlug)}&qty=${order.quantity}`;
  const noticeUrl = `${config.baseUrl}/api/payments/oceanpayment/notice`;
  const methodName = method === 'credit-card' ? 'Credit Card' : method === 'google-pay' ? 'Google Pay' : 'Apple Pay';
  const testMode = forceTestMode || !/^prod(uction)?$/i.test(config.environment);

  return {
    gatewayUrl: config.endpoint,
    sdkUrl: scriptUrls[method],
    sdkUrls: method === 'credit-card' ? [scriptUrls.jquery, scriptUrls['credit-card']] : [scriptUrls[method]],
    configured: config.configured,
    testMode,
    requiredEnv: ['OCEANPAYMENT_ACCOUNT', 'OCEANPAYMENT_TERMINAL', 'OCEANPAYMENT_SECURE_CODE', 'OCEANPAYMENT_PUBLIC_KEY'],
    fields: {
      account: config.account,
      terminal: config.terminal,
      key: config.publicKey,
      order_number: orderNumber,
      order_currency: orderCurrency,
      order_amount: orderAmount,
      order_notes: order.productName,
      methods: methodName,
      payment_scenario: scene === '3d' ? '3D' : 'Non-3D',
      billing_firstName: firstName,
      billing_lastName: lastName,
      billing_email: billingEmail,
      billing_phone: clean(order.customer.phone, 40),
      billing_country: countryCode(order.customer.country),
      billing_state: clean(order.checkout.state || 'NA', 80),
      billing_city: clean(order.checkout.city || 'NA', 80),
      billing_address: clean(order.customer.address, 240),
      billing_zip: clean(order.checkout.zip || '00000', 32),
      ship_firstName: firstName,
      ship_lastName: lastName,
      ship_email: billingEmail,
      ship_phone: clean(order.customer.phone, 40),
      ship_country: countryCode(order.customer.country),
      ship_state: clean(order.checkout.state || 'NA', 80),
      ship_city: clean(order.checkout.city || 'NA', 80),
      ship_addr: clean(order.customer.address, 240),
      ship_zip: clean(order.checkout.zip || '00000', 32),
      productName: clean(order.productName, 180),
      productNum: String(order.quantity),
      productSku: clean(order.productSlug, 80),
      productPrice: amount(order.unitPrice),
      cart_info: `${clean(order.productName, 120)} x ${order.quantity}`,
      billing_ip: clean(billingIp || '127.0.0.1', 40),
      backUrl: checkoutReturnUrl,
      noticeUrl,
      signValue
    }
  };
}

export function verifyOceanpaymentReturn(fields: Record<string, string>) {
  const config = oceanpaymentConfig();
  const expected = sha256(
    `${fields.account || ''}${fields.terminal || ''}${fields.order_number || ''}${fields.order_currency || ''}${fields.order_amount || ''}${fields.order_notes || ''}${fields.card_number || ''}${fields.payment_id || ''}${fields.payment_authType || ''}${fields.payment_status || ''}${fields.payment_details || ''}${fields.payment_risk || ''}${config.secureCode}`
  );
  return Boolean(fields.signValue && expected.toLowerCase() === fields.signValue.toLowerCase());
}

export function oceanpaymentStatusToOrder(fields: Record<string, string>) {
  const status = (fields.payment_status || fields.status || '').toString();
  if (/^(1|success|paid|approved)$/i.test(status)) {
    return {status: 'paid' as const, gatewayStatus: 'success' as const, logisticsStatus: 'Payment confirmed by Oceanpayment. Sales team can arrange order processing.'};
  }
  if (/^(0|pending|processing)$/i.test(status)) {
    return {status: 'pending_payment' as const, gatewayStatus: 'pending' as const, logisticsStatus: 'Oceanpayment transaction is pending final confirmation.'};
  }
  return {status: 'pending_payment' as const, gatewayStatus: 'failed' as const, logisticsStatus: 'Oceanpayment transaction failed or was declined. Buyer may retry or contact sales.'};
}

export async function parseGatewayPayload(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await request.json();
    return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, clean(value, 500)]));
  }
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, clean(value, 500)]));
  }
  const text = await request.text();
  const xmlPairs = [...text.matchAll(/<([^/?][^>\s]*)[^>]*>([^<]*)<\/\1>/g)].map((match) => [match[1], clean(match[2], 500)]);
  if (xmlPairs.length) return Object.fromEntries(xmlPairs);
  return Object.fromEntries(new URLSearchParams(text).entries());
}
