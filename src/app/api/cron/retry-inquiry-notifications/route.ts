import {cronAuthorized} from '@/lib/cronAuth';
import {retryInquiryNotifications} from '@/lib/inquiryNotifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({ok: false}, {status: 401});
  const results = await retryInquiryNotifications();
  const ok = results.every(({status}) => status === 'sent');
  return Response.json({ok, results}, {status: ok ? 200 : 502});
}
