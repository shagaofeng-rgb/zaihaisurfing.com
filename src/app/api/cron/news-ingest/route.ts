import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsIngest} from '@/lib/newsAutopilot';
import {defaultNewsSite, getNewsSite} from '@/lib/newsSiteConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const url = new URL(request.url);
  const siteId = url.searchParams.get('siteId') || defaultNewsSite()?.site_id || '';
  if (!getNewsSite(siteId)?.news.enabled) return Response.json({success: false, error: 'News automation is disabled.'}, {status: 410});
  const result = await runNewsIngest(siteId, 'cron', url.searchParams.get('dryRun') === '1');
  console.info('[news-ingest]', JSON.stringify({siteId: result.siteId, status: result.status, candidates: result.candidateCount, rejected: result.rejectedCount, reason: result.reason}));
  return Response.json({success: true, data: result});
}
