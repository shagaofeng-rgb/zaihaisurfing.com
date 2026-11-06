import {appendAnalyticsEvent, type AnalyticsEvent} from '@/lib/commerceStore';
import {checkRateLimit} from '@/lib/rateLimit';
import {classifyTraffic, compactAttribution, safeTrafficUrl} from '@/lib/trafficAttribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_TYPES = new Set([
  'page_view',
  'product_view',
  'checkout_start',
  'commerce_click',
  'whatsapp_click'
]);

const SENSITIVE_KEYS = /email|phone|name|message|address|contact|cardholder|token|password|secret/i;

function clean(value: unknown, limit = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, limit);
}

function isBot(userAgent = '') {
  return /bot|crawler|spider|crawling|lighthouse|pagespeed|headless|vercel|uptime|monitor|preview|facebookexternalhit|slurp|bingpreview/i.test(userAgent);
}

function sanitizePayload(payload: Record<string, unknown>) {
  const allowed = [
    'type',
    'page',
    'previousPage',
    'pageTitle',
    'language',
    'screen',
    'targetText',
    'targetKind',
    'whatsappPlacement',
    'productSlug',
    'paymentMethod',
    'cardBrand',
    'buyerType',
    'product',
    'quantity',
    'country',
    'utmSource',
    'utmMedium',
    'utmCampaign'
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => key in payload && !SENSITIVE_KEYS.test(key))
      .map((key) => {
        const value = payload[key];
        if (key === 'page' || key === 'previousPage') return [key, safeTrafficUrl(value)];
        return [key, typeof value === 'number' || typeof value === 'boolean' ? value : clean(value, 180)];
      })
  );
}

function detectDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return 'Tablet';
  if (/mobile|iphone|android/.test(ua)) return 'Mobile';
  return 'Desktop';
}

function detectBrowser(userAgent = '') {
  if (/edg/i.test(userAgent)) return 'Edge';
  if (/chrome|crios/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  return 'Other';
}

function detectOs(userAgent = '') {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
  if (/android/i.test(userAgent)) return 'Android';
  if (/mac os|macintosh/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Other';
}

function clientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    ''
  ).slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request) || 'unknown';
    if (!checkRateLimit(`analytics:${ip}`, 120, 60_000)) {
      return Response.json({ok: false, message: 'Rate limit exceeded'}, {status: 429});
    }
    const payload = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    if (isBot(userAgent)) {
      return Response.json({ok: true, skipped: 'bot'});
    }
    const type = clean(payload.type || 'page_view', 80);
    if (!EVENT_TYPES.has(type)) return Response.json({ok: false}, {status: 400});
    const safePayload = sanitizePayload(payload);
    const page = safeTrafficUrl(payload.page) || '/';
    const referrer = safeTrafficUrl(payload.referrer);
    const touch = classifyTraffic({url: clean(payload.page || '/', 500), referrer});
    const attribution = compactAttribution(payload.attribution) || {
      visitorId: clean(payload.visitorId || 'anonymous', 80),
      sessionId: clean(payload.sessionId || 'session', 80),
      firstTouch: touch, lastTouch: touch, sessionTouch: touch
    };
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      visitorId: clean(payload.visitorId || 'anonymous', 80),
      sessionId: clean(payload.sessionId || 'session', 80),
      page,
      pageTitle: clean(payload.pageTitle || '', 180),
      referrer,
      country: request.headers.get('x-vercel-ip-country') || 'Unknown',
      city: request.headers.get('x-vercel-ip-city') || '',
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOs(userAgent),
      ip: clientIp(request),
      timestamp: clean(payload.timestamp || new Date().toISOString(), 40),
      payload: safePayload,
      attribution
    };
    await appendAnalyticsEvent(event);
    return Response.json({ok: true});
  } catch (error) {
    console.error('Analytics tracking failed', error);
    return Response.json({ok: false}, {status: 400});
  }
}
