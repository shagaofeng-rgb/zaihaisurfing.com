import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsIngest} from '@/lib/newsAutopilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const url = new URL(request.url);
  const result = await runNewsIngest(url.searchParams.get('siteId') || undefined, 'cron', url.searchParams.get('dryRun') === '1');
  console.info('[news-ingest]', JSON.stringify({siteId: result.siteId, status: result.status, candidates: result.candidateCount, rejected: result.rejectedCount}));
  return Response.json({success: true, data: result});
}
