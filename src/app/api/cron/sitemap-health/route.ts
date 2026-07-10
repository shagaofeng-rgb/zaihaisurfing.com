import {cronAuthorized} from '@/lib/cronAuth';
import {runSitemapMaintenance} from '@/lib/sitemapMaintenance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  }
  const url = new URL(request.url);
  const output = await runSitemapMaintenance({
    trigger: url.searchParams.get('trigger') === 'content-change' ? 'content-change' : url.searchParams.get('trigger') === 'manual' ? 'manual' : 'cron',
    origin: url.origin,
    force: url.searchParams.get('force') === '1',
    dryRun: url.searchParams.get('dryRun') === '1',
    submit: url.searchParams.get('submit') === '1'
  });
  if (output.locked) {
    return Response.json({success: false, error: 'Sitemap maintenance is already running.'}, {status: 409});
  }
  return Response.json({success: output.result?.success || false, data: output.result}, {status: output.result?.success ? 200 : 500});
}
