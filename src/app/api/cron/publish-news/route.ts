import {archiveIrrelevantAutomatedNews, publishDailyAutomatedNews, publishNextAutomatedNews, repairNewsImageDiversity} from '@/lib/newsPublisher';
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
    const contentRepair = await archiveIrrelevantAutomatedNews();
    const imageRepair = {skipped: true, reason: 'Image repair runs only with repair=1 so daily publishing cannot be blocked by historical media repair.'};
    if (url.searchParams.get('single') === '1') {
      const result = await publishNextAutomatedNews();
      return Response.json({ok: true, contentRepair, imageRepair, ...result});
    }
    const target = url.searchParams.has('target')
      ? Number(url.searchParams.get('target'))
      : Number(process.env.NEWS_DAILY_TARGET || '');
    const result = Number.isFinite(target) ? await publishDailyAutomatedNews(target) : await publishDailyAutomatedNews();
    return Response.json({ok: true, contentRepair, imageRepair, ...result});
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown cron publish error'
    }, {status: 500});
  }
}
