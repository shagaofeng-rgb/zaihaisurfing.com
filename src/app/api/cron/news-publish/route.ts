import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsPublish} from '@/lib/newsAutopilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const url = new URL(request.url);
  const result = await runNewsPublish(url.searchParams.get('siteId') || undefined, 'cron', url.searchParams.get('dryRun') === '1');
  console.info('[news-publish]', JSON.stringify({siteId: result.siteId, status: result.status, publishedSlug: result.publishedSlug || null, reason: result.reason}));
  return Response.json({success: true, data: result});
}
