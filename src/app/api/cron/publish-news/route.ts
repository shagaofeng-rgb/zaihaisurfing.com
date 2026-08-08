import {repairNewsImageDiversity} from '@/lib/newsPublisher';
import {cronAuthorized} from '@/lib/cronAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('repair') === '1') {
      const result = await repairNewsImageDiversity();
      return Response.json({ok: true, repaired: true, ...result});
    }
    return Response.json({
      ok: true,
      status: 'paused_for_editorial_review',
      message: 'Automatic News publishing is paused. Publish reviewed News items manually from the admin console.'
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown cron publish error'
    }, {status: 500});
  }
}
