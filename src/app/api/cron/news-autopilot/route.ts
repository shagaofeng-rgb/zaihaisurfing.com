import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsAutopilot} from '@/lib/newsAutopilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';
  const result = await runNewsAutopilot('cron', dryRun);
  return Response.json({success: true, data: result});
}
