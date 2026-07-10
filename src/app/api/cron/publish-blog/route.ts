import {publishDailyAutomatedBlog, repairBlogImageDiversity} from '@/lib/blogPublisher';
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
