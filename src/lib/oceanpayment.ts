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

const alpha3ToAlpha2: Record<string, string> = {
  ARE: 'AE',
  AUS: 'AU',
  CAN: 'CA',
  CHE: 'CH',
  CHN: 'CN',
  DEU: 'DE',
  ESP: 'ES',
  FRA: 'FR',
  GBR: 'GB',
  ITA: 'IT',
  JPN: 'JP',
  KOR: 'KR',
  MDV: 'MV',
  NLD: 'NL',
  NZL: 'NZ',
  SGP: 'SG',
  SAU: 'SA',
  THA: 'TH',
  USA: 'US'
};

const countryNameToAlpha2: Record<string, string> = {
  america: 'US',
  australia: 'AU',
  britain: 'GB',
  canada: 'CA',
  china: 'CN',
  deutschland: 'DE',
  france: 'FR',
  germany: 'DE',
  italy: 'IT',
  japan: 'JP',
  maldives: 'MV',
  netherlands: 'NL',
  'new zealand': 'NZ',
  singapore: 'SG',
  'south korea': 'KR',
  korea: 'KR',
  spain: 'ES',
  thailand: 'TH',
  'united arab emirates': 'AE',
  uae: 'AE',
  dubai: 'AE',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  'united states': 'US',
  usa: 'US',
  'united states of america': 'US',
  'saudi arabia': 'SA',
  saudi: 'SA'
};

function normalizeLookupKey(value: string) {
  return clean(value, 120)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function countryCode(value: string) {
  const raw = clean(value, 80);
  const upper = raw.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) return upper;
  if (/^[A-Z]{3}$/.test(upper) && alpha3ToAlpha2[upper]) return alpha3ToAlpha2[upper];
  const normalized = normalizeLookupKey(raw);
  return countryNameToAlpha2[normalized] || '';
}

const usSubdivisionCodes: Record<string, string> = {
  alabama: 'US-AL',
  al: 'US-AL',
  alaska: 'US-AK',
  ak: 'US-AK',
  arizona: 'US-AZ',
  az: 'US-AZ',
  arkansas: 'US-AR',
  ar: 'US-AR',
  california: 'US-CA',
  ca: 'US-CA',
  colorado: 'US-CO',
  co: 'US-CO',
  connecticut: 'US-CT',
  ct: 'US-CT',
  delaware: 'US-DE',
  de: 'US-DE',
  florida: 'US-FL',
  fl: 'US-FL',
  georgia: 'US-GA',
  ga: 'US-GA',
  hawaii: 'US-HI',
  hi: 'US-HI',
  idaho: 'US-ID',
  id: 'US-ID',
  illinois: 'US-IL',
  il: 'US-IL',
  indiana: 'US-IN',
  in: 'US-IN',
  iowa: 'US-IA',
  ia: 'US-IA',
  kansas: 'US-KS',
  ks: 'US-KS',
  kentucky: 'US-KY',
  ky: 'US-KY',
  louisiana: 'US-LA',
  la: 'US-LA',
  maine: 'US-ME',
  me: 'US-ME',
  maryland: 'US-MD',
  md: 'US-MD',
  massachusetts: 'US-MA',
  ma: 'US-MA',
  michigan: 'US-MI',
  mi: 'US-MI',
  minnesota: 'US-MN',
  mn: 'US-MN',
  mississippi: 'US-MS',
  ms: 'US-MS',
  missouri: 'US-MO',
  mo: 'US-MO',
  montana: 'US-MT',
  mt: 'US-MT',
  nebraska: 'US-NE',
  ne: 'US-NE',
  nevada: 'US-NV',
  nv: 'US-NV',
  'new hampshire': 'US-NH',
  nh: 'US-NH',
  'new jersey': 'US-NJ',
  nj: 'US-NJ',
  'new mexico': 'US-NM',
  nm: 'US-NM',
  'new york': 'US-NY',
  ny: 'US-NY',
  'north carolina': 'US-NC',
  nc: 'US-NC',
  'north dakota': 'US-ND',
  nd: 'US-ND',
  ohio: 'US-OH',
  oh: 'US-OH',
  oklahoma: 'US-OK',
  ok: 'US-OK',
  oregon: 'US-OR',
  or: 'US-OR',
  pennsylvania: 'US-PA',
  pa: 'US-PA',
  'rhode island': 'US-RI',
  ri: 'US-RI',
  'south carolina': 'US-SC',
  sc: 'US-SC',
  'south dakota': 'US-SD',
  sd: 'US-SD',
  tennessee: 'US-TN',
  tn: 'US-TN',
  texas: 'US-TX',
  tx: 'US-TX',
  utah: 'US-UT',
  ut: 'US-UT',
  vermont: 'US-VT',
  vt: 'US-VT',
  virginia: 'US-VA',
  va: 'US-VA',
  washington: 'US-WA',
  wa: 'US-WA',
  'west virginia': 'US-WV',
  wv: 'US-WV',
  wisconsin: 'US-WI',
  wi: 'US-WI',
  wyoming: 'US-WY',
  wy: 'US-WY'
};

const caSubdivisionCodes: Record<string, string> = {
  alberta: 'CA-AB',
  ab: 'CA-AB',
  'british columbia': 'CA-BC',
  bc: 'CA-BC',
  manitoba: 'CA-MB',
  mb: 'CA-MB',
  'new brunswick': 'CA-NB',
  nb: 'CA-NB',
  'newfoundland and labrador': 'CA-NL',
  nl: 'CA-NL',
  'nova scotia': 'CA-NS',
  ns: 'CA-NS',
  ontario: 'CA-ON',
  on: 'CA-ON',
  'prince edward island': 'CA-PE',
  pe: 'CA-PE',
  quebec: 'CA-QC',
  qc: 'CA-QC',
  saskatchewan: 'CA-SK',
  sk: 'CA-SK'
};

const auSubdivisionCodes: Record<string, string> = {
  'new south wales': 'AU-NSW',
  nsw: 'AU-NSW',
  queensland: 'AU-QLD',
  qld: 'AU-QLD',
  'south australia': 'AU-SA',
  sa: 'AU-SA',
  tasmania: 'AU-TAS',
  tas: 'AU-TAS',
  victoria: 'AU-VIC',
  vic: 'AU-VIC',
  'western australia': 'AU-WA',
  wa: 'AU-WA'
};

const cnSubdivisionCodes: Record<string, string> = {
  zhejiang: 'CN-ZJ',
  zj: 'CN-ZJ',
  '浙江': 'CN-ZJ',
  '浙江省': 'CN-ZJ',
  guangdong: 'CN-GD',
  gd: 'CN-GD',
  '广东': 'CN-GD',
  '广东省': 'CN-GD',
  shanghai: 'CN-SH',
  '上海': 'CN-SH',
  '上海市': 'CN-SH',
  beijing: 'CN-BJ',
  '北京': 'CN-BJ',
  '北京市': 'CN-BJ',
  jiangsu: 'CN-JS',
  js: 'CN-JS',
  '江苏': 'CN-JS',
  '江苏省': 'CN-JS'
};

const gbSubdivisionCodes: Record<string, string> = {
  england: 'GB-ENG',
  eng: 'GB-ENG',
  scotland: 'GB-SCT',
  sct: 'GB-SCT',
  wales: 'GB-WLS',
  wls: 'GB-WLS',
  'northern ireland': 'GB-NIR',
  nir: 'GB-NIR'
};

const subdivisionMaps: Record<string, Record<string, string>> = {
  AU: auSubdivisionCodes,
  CA: caSubdivisionCodes,
  CN: cnSubdivisionCodes,
  GB: gbSubdivisionCodes,
  US: usSubdivisionCodes
};

type BillingStateResult = {
  billingCountry: string;
  billingState: string;
  valid: boolean;
  warnings: string[];
  message?: string;
};

export function normalizeBillingState({
  country,
  state,
  city
}: {
  country: string;
  state?: string;
  city?: string;
}): BillingStateResult {
  const countryIso = countryCode(country);
  const warnings: string[] = [];
  if (!countryIso) {
    return {
      billingCountry: '',
      billingState: '',
      valid: false,
      warnings: ['Billing country could not be normalized to ISO 3166-1 alpha-2.'],
      message: 'Please complete your billing address country and state/province information.'
    };
  }
  const raw = clean(state, 80);
  const cityKey = normalizeLookupKey(city || '');
  if (!raw) {
    warnings.push('Missing state/province; using billing_country as ISO fallback until Oceanpayment confirms whether ISO 3166-1 or ISO 3166-2 is required.');
    return {billingCountry: countryIso, billingState: countryIso, valid: true, warnings};
  }
  const normalizedCode = raw.toUpperCase().replace(/_/g, '-');
  if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(normalizedCode)) {
    return {billingCountry: countryIso, billingState: normalizedCode, valid: true, warnings};
  }
  const rawAsCountry = countryCode(raw);
  if (rawAsCountry) {
    warnings.push('State/province looked like a country value; using ISO country fallback for billing_state.');
    return {billingCountry: countryIso, billingState: rawAsCountry, valid: true, warnings};
  }
  const key = normalizeLookupKey(raw);
  if (key && key === cityKey) {
    warnings.push('State/province matched city; using billing_country as ISO fallback.');
    return {billingCountry: countryIso, billingState: countryIso, valid: true, warnings};
  }
  const mapped = subdivisionMaps[countryIso]?.[key];
  if (mapped) return {billingCountry: countryIso, billingState: mapped, valid: true, warnings};
  if (/^[A-Z]{2,3}$/.test(normalizedCode) && subdivisionMaps[countryIso]) {
    return {billingCountry: countryIso, billingState: `${countryIso}-${normalizedCode}`, valid: true, warnings};
  }
  warnings.push('State/province was not recognized; using billing_country as ISO fallback.');
  return {billingCountry: countryIso, billingState: countryIso, valid: true, warnings};
}

export function validateOceanpaymentBillingState(billingState: string) {
  const value = clean(billingState, 40);
  if (!value) return false;
  if (/[\u4e00-\u9fff]/.test(value)) return false;
  if (/undefined|null|nan|\[object object\]/i.test(value)) return false;
  return /^[A-Z]{2}(?:-[A-Z0-9]{1,3})?$/.test(value);
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
  const billing = normalizeBillingState({
    country: order.customer.country,
    state: order.checkout.state,
    city: order.checkout.city
  });
  if (!billing.valid || !validateOceanpaymentBillingState(billing.billingState)) {
    throw new Error(billing.message || 'Please complete your billing address state/province information.');
  }
  const billingCountry = billing.billingCountry;
  const billingState = billing.billingState;

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
      billing_country: billingCountry,
      billing_state: billingState,
      billing_city: clean(order.checkout.city || 'NA', 80),
      billing_address: clean(order.customer.address, 240),
      billing_zip: clean(order.checkout.zip || '00000', 32),
      ship_firstName: firstName,
      ship_lastName: lastName,
      ship_email: billingEmail,
      ship_phone: clean(order.customer.phone, 40),
      ship_country: billingCountry,
      ship_state: billingState,
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
    },
    billing
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
  return {status: 'failed' as const, gatewayStatus: 'failed' as const, logisticsStatus: 'Oceanpayment transaction failed or was declined. Buyer may retry or contact sales.'};
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
