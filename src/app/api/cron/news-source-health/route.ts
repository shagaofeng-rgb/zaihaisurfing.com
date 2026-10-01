import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsSourceValidation} from '@/lib/newsSourceValidation';
import {defaultNewsSite} from '@/lib/newsSiteConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  if (!defaultNewsSite()?.news.enabled) return Response.json({success: false, error: 'News automation is disabled.'}, {status: 410});
  const result = await runNewsSourceValidation();
  console.info('[news-source-health]', JSON.stringify(result));
  return Response.json({success: true, data: result});
}
