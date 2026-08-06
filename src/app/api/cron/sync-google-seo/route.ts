import {readGoogleSeoSnapshot, syncGoogleSeoSnapshot} from '@/lib/googleSeo';
import {cronAuthorized} from '@/lib/cronAuth';
import {appendStoreLine} from '@/lib/durableStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_SEO_SYNC_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  const previous = await readGoogleSeoSnapshot();
  const previousSync = new Date(previous.syncedAt).getTime();
  const shouldWait = previous.status === 'ok' && Number.isFinite(previousSync) && Date.now() - previousSync < GOOGLE_SEO_SYNC_INTERVAL_MS;
  if (shouldWait) {
    await appendStoreLine('google-seo-sync-runs.jsonl', {
      trigger: 'cron',
      executedAt: new Date().toISOString(),
      status: 'skipped_interval',
      siteUrl: previous.siteUrl,
      range: previous.range,
      pages: previous.pages.length,
      error: '',
      httpStatus: 200
    });
    return Response.json({
      ok: true,
      status: 'skipped_interval',
      syncedAt: previous.syncedAt,
      siteUrl: previous.siteUrl,
      range: previous.range,
      totals: previous.totals
    });
  }
  const snapshot = await syncGoogleSeoSnapshot();
  const acceptable = snapshot.status === 'ok' || snapshot.status === 'not_configured';
  await appendStoreLine('google-seo-sync-runs.jsonl', {
    trigger: 'cron',
    executedAt: new Date().toISOString(),
    status: snapshot.status,
    siteUrl: snapshot.siteUrl,
    range: snapshot.range,
    pages: snapshot.pages.length,
    error: snapshot.error || '',
    httpStatus: acceptable ? 200 : 500
  });
  return Response.json({
    ok: snapshot.status === 'ok',
    status: snapshot.status,
    syncedAt: snapshot.syncedAt,
    siteUrl: snapshot.siteUrl,
    range: snapshot.range,
    totals: snapshot.totals,
    error: snapshot.error
  }, {status: acceptable ? 200 : 500});
}
