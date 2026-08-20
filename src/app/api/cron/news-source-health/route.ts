import {cronAuthorized} from '@/lib/cronAuth';
import {runNewsSourceValidation} from '@/lib/newsSourceValidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({success: false, error: 'Unauthorized'}, {status: 401});
  const result = await runNewsSourceValidation();
  console.info('[news-source-health]', JSON.stringify(result));
  return Response.json({success: true, data: result});
}
