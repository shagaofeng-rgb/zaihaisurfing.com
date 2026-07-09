import {publishDailyAutomatedBlog, repairBlogImageDiversity} from '@/lib/blogPublisher';

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
    const url = new URL(request.url);
    if (url.searchParams.get('repair') === '1') {
      const result = await repairBlogImageDiversity();
      return Response.json({ok: true, repaired: true, ...result});
    }
    const imageRepair = {skipped: true, reason: 'Image repair runs only with repair=1 so daily publishing cannot be blocked by historical media repair.'};
    const target = Number(url.searchParams.get('target') || process.env.BLOG_DAILY_TARGET || 1);
    const result = await publishDailyAutomatedBlog(target);
    return Response.json({ok: true, imageRepair, ...result});
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown cron blog publish error'
    }, {status: 500});
  }
}
