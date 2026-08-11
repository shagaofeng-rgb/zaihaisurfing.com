import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsAutopilot} from '@/lib/newsAutopilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === '1';
  const result = await runNewsAutopilot('cron', dryRun, {activate: url.searchParams.get('activate') === '1'});
  console.info('[news-autopilot]', JSON.stringify({mode: result.mode, status: result.status, publishedSlug: result.publishedSlug || null, reason: result.reason}));
  return Response.json({success: true, data: result});
}
