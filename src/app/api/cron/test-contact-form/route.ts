import {cronAuthorized} from '@/lib/cronAuth';
import {runContactFormHealthCheck} from '@/lib/contactFormHealth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  const result = await runContactFormHealthCheck();
  return Response.json(result, {status: result.ok ? 200 : 502});
}
