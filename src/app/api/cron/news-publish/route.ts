import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsPublish} from '@/lib/newsAutopilot';
import {defaultNewsSite, getNewsSite} from '@/lib/newsSiteConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const url = new URL(request.url);
  const siteId = url.searchParams.get('siteId') || defaultNewsSite()?.site_id || '';
  const site = getNewsSite(siteId);
  if (!site?.news.enabled || !site.publishing.production_enabled) return Response.json({success: false, error: 'News automation is disabled.'}, {status: 410});
  const result = await runNewsPublish(siteId, 'cron', url.searchParams.get('dryRun') === '1');
  console.info('[news-publish]', JSON.stringify({siteId: result.siteId, status: result.status, publishedSlug: result.publishedSlug || null, reason: result.reason}));
  return Response.json({success: true, data: result});
}
