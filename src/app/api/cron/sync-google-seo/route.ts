import {syncGoogleSeoSnapshot} from '@/lib/googleSeo';
import {cronAuthorized} from '@/lib/cronAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  const snapshot = await syncGoogleSeoSnapshot();
  const acceptable = snapshot.status === 'ok' || snapshot.status === 'not_configured';
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
