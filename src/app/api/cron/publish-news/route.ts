import {publishNextAutomatedNews} from '@/lib/newsPublisher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get('authorization') || '';
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  try {
    const result = await publishNextAutomatedNews();
    return Response.json({ok: true, ...result});
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown cron publish error'
    }, {status: 500});
  }
}
