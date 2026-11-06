import {createHash, randomUUID} from 'node:crypto';
import {revalidateTag} from 'next/cache';
import {isLocale} from '@/i18n/routing';
import {ADMIN_BUSINESS_DATA_CACHE_TAG} from '@/lib/adminBusinessData';
import {appendAnalyticsEventOnce} from '@/lib/commerceStore';
import {parseContactInquiry, validContactInquiry, type InquiryFeedback} from '@/lib/contactInquiry';
import {durableStoreConfigured} from '@/lib/durableStore';
import {deliverInquiryNotification} from '@/lib/inquiryNotifications';
import {checkRateLimit, clientIp} from '@/lib/rateLimit';
import {productSlugs} from '@/lib/site';
import {classifyTraffic, compactAttribution, safeTrafficUrl} from '@/lib/trafficAttribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(value: unknown, limit = 300) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, limit);
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

export async function POST(request: Request) {
  const nativeForm = request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded') ?? false;
  let locale = 'en';
  let productSlug = '';
  function reply(feedback: InquiryFeedback, status: number, message: string, reference = '', emailStatus?: string) {
    if (nativeForm) {
      const query = new URLSearchParams({inquiry: feedback});
      if (productSlug) query.set('product', productSlug);
      if (reference) query.set('ref', reference);
      return new Response(null, {status: 303, headers: {
        Location: `/${locale}/contact?${query}#inquiry-form`,
        'Cache-Control': 'no-store'
      }});
    }
    return Response.json({ok: feedback === 'received', feedback, message, id: reference, emailStatus}, {
      status, headers: {'Cache-Control': 'no-store'}
    });
  }

  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return reply('invalid', 403, 'Please open the inquiry form on our website.');
  }
  if (!checkRateLimit(`contact-inquiry:${clientIp(request)}`, 8, 10 * 60_000)) {
    return reply('rateLimited', 429, 'Too many inquiries. Please try again later.');
  }

  try {
    if (Number(request.headers.get('content-length')) > 24_000) {
      return reply('invalid', 413, 'The inquiry is too long.');
    }
    const raw = await request.text();
    if (raw.length > 24_000) return reply('invalid', 413, 'The inquiry is too long.');
    let payload: Record<string, unknown>;
    try {
      const body = nativeForm ? Object.fromEntries(new URLSearchParams(raw)) : JSON.parse(raw);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
      payload = body;
    } catch {
      return reply('invalid', 400, 'Please complete the required fields.');
    }
    const requestedLocale = clean(payload.locale, 8);
    if (isLocale(requestedLocale)) locale = requestedLocale;
    productSlug = productSlugs.find((slug) => slug === payload.productSlug) || '';
    if (clean(payload.website, 80)) {
      return reply('received', 200, 'Thank you. We received your request.');
    }

    const inquiry = parseContactInquiry(payload);
    if (!validContactInquiry(inquiry)) {
      return reply('invalid', 400, 'Please complete the required fields.');
    }
    if (process.env.VERCEL_ENV === 'production' && !durableStoreConfigured()) {
      console.error('Inquiry storage is not configured');
      return reply('retry', 503, 'Inquiry submission failed. Please try again.');
    }

    const userAgent = request.headers.get('user-agent') || '';
    const key = clean(payload.submissionKey, 64) || randomUUID();
    const eventId = `contact-${createHash('sha256').update(JSON.stringify([key, inquiry])).digest('hex').slice(0, 32)}`;
    const tracked = compactAttribution(payload.attribution);
    const visitorId = clean(payload.visitorId, 80) || tracked?.visitorId || eventId;
    const sessionId = clean(payload.sessionId, 80) || tracked?.sessionId || eventId;
    const page = safeTrafficUrl(payload.page) || `/${locale}/contact`;
    const referrer = safeTrafficUrl(payload.referrer);
    const touch = classifyTraffic({url: page, referrer, locale});
    const attribution = tracked || {
      visitorId, sessionId, firstTouch: touch, lastTouch: touch, sessionTouch: touch
    };
    const added = await appendAnalyticsEventOnce({
      id: eventId,
      type: 'contact_inquiry',
      visitorId,
      sessionId,
      page,
      pageTitle: 'Contact inquiry',
      referrer,
      country: request.headers.get('x-vercel-ip-country') || 'Unknown',
      city: request.headers.get('x-vercel-ip-city') || '',
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOs(userAgent),
      ip: clientIp(request),
      timestamp: new Date().toISOString(),
      attribution,
      payload: inquiry
    });

    try {
      if (added) revalidateTag(ADMIN_BUSINESS_DATA_CACHE_TAG, {expire: 0});
    } catch (error) {
      console.warn('Inquiry saved; admin cache refresh deferred', error);
    }

    const emailStatus = await deliverInquiryNotification(eventId, inquiry).catch((error) => {
      console.warn('Inquiry notification status unavailable', {reference: eventId, error});
      return 'unknown';
    });
    console.info('[contact-inquiry]', {reference: eventId, added, emailStatus});
    return reply('received', emailStatus === 'sent' ? 200 : 202, 'Thank you. We received your request.', eventId, emailStatus);
  } catch (error) {
    console.error('Contact inquiry failed', error);
    return reply('retry', 500, 'Inquiry submission failed. Please try again.');
  }
}
