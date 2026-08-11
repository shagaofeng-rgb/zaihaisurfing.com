import {cronAuthorized} from '@/lib/cronAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  return Response.json({success: false, error: 'Retired endpoint. Use /api/cron/news-ingest or /api/cron/news-publish.'}, {status: 410});
}
