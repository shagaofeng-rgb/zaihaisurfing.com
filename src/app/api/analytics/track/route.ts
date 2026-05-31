import {appendAnalyticsEvent, type AnalyticsEvent} from '@/lib/commerceStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  try {
    const payload = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: String(payload.type || 'page_view'),
      visitorId: String(payload.visitorId || 'anonymous').slice(0, 80),
      sessionId: String(payload.sessionId || 'session').slice(0, 80),
      page: String(payload.page || '/').slice(0, 240),
      pageTitle: String(payload.pageTitle || '').slice(0, 180),
      referrer: String(payload.referrer || '').slice(0, 240),
      country: request.headers.get('x-vercel-ip-country') || 'Unknown',
      city: request.headers.get('x-vercel-ip-city') || '',
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOs(userAgent),
      timestamp: String(payload.timestamp || new Date().toISOString()),
      payload
    };
    await appendAnalyticsEvent(event);
    return Response.json({ok: true});
  } catch (error) {
    console.error('Analytics tracking failed', error);
    return Response.json({ok: false}, {status: 400});
  }
}
