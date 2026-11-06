import {cronAuthorized} from '@/lib/cronAuth';
import {runSitemapMaintenance} from '@/lib/sitemapMaintenance';
import {siteUrl} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  }
  const url = new URL(request.url);
  const trigger = url.searchParams.get('trigger') === 'content-change' ? 'content-change' : url.searchParams.get('trigger') === 'manual' ? 'manual' : 'cron';
  const output = await runSitemapMaintenance({
    trigger,
    // Vercel Cron invokes a deployment URL. Validate and submit the public
    // canonical domain instead, so an internal deployment alias cannot make a
    // healthy public sitemap look unavailable.
    origin: new URL(siteUrl).origin,
    force: url.searchParams.get('force') === '1',
    dryRun: url.searchParams.get('dryRun') === '1',
    submit: trigger === 'cron' || url.searchParams.get('submit') === '1'
  });
  if (output.locked) {
    return Response.json({success: false, error: 'Sitemap maintenance is already running.'}, {status: 409});
  }
  console.info('[sitemap-health]', JSON.stringify({
    success: output.result?.success || false,
    validationPassed: output.result?.validationPassed || false,
    trigger,
    runId: output.result?.id,
    changed: output.result?.changed || false,
    errorCount: output.result?.errorCount || 0,
    googleSubmission: output.result?.googleSubmission,
    googleReadback: output.result?.googleReadback,
    errors: output.result?.errors || []
  }));
  return Response.json({success: output.result?.success || false, data: output.result}, {status: output.result?.success ? 200 : 500});
}
