import {cronAuthorized} from '@/lib/cronAuth';
import {runFacebookPagePublisher} from '@/lib/facebookPagePublisher';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({message: 'Unauthorized'}, {status: 401});
  try { return Response.json(await runFacebookPagePublisher('cron')); }
  catch (error) { return Response.json({status: 'failed', message: error instanceof Error ? error.message : 'Publisher failed'}, {status: 500}); }
}
