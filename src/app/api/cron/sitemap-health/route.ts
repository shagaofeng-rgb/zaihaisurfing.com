import {cronAuthorized} from '@/lib/cronAuth';
import {runSitemapMaintenance} from '@/lib/sitemapMaintenance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function canonicalSiteOrigin(requestOrigin: string) {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  try {
    const url = new URL(configured);
    return url.protocol === 'https:' ? url.origin : requestOrigin;
  } catch {
    return requestOrigin;
  }
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  }
  const url = new URL(request.url);
  const output = await runSitemapMaintenance({
    trigger: url.searchParams.get('trigger') === 'content-change' ? 'content-change' : url.searchParams.get('trigger') === 'manual' ? 'manual' : 'cron',
    // Vercel Cron invokes a deployment URL. Validate and submit the public
    // canonical domain instead, so an internal deployment alias cannot make a
    // healthy public sitemap look unavailable.
    origin: canonicalSiteOrigin(url.origin),
    force: url.searchParams.get('force') === '1',
    dryRun: url.searchParams.get('dryRun') === '1',
    submit: url.searchParams.get('submit') === '1'
  });
  if (output.locked) {
    return Response.json({success: false, error: 'Sitemap maintenance is already running.'}, {status: 409});
  }
  console.info('[sitemap-health]', JSON.stringify({
    success: output.result?.success || false,
    changed: output.result?.changed || false,
    errorCount: output.result?.errorCount || 0,
    googleSubmission: output.result?.googleSubmission,
    googleReadback: output.result?.googleReadback,
    errors: output.result?.errors || []
  }));
  return Response.json({success: output.result?.success || false, data: output.result}, {status: output.result?.success ? 200 : 500});
}
