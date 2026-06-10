import {requireAdminApiSession} from '@/lib/adminAuth';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {getVisitorRecords, visitorRecordsCsv} from '@/lib/visitorRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const timeFilter = parseAdminTimeFilter(params);
  const report = await getVisitorRecords({
    from: timeFilter.from,
    to: timeFilter.to,
    q: url.searchParams.get('q') || '',
    country: url.searchParams.get('country') || '',
    source: url.searchParams.get('source') || '',
    limit: Number(url.searchParams.get('limit') || 1000)
  });

  if (url.searchParams.get('format') === 'csv') {
    return new Response(`\uFEFF${visitorRecordsCsv(report.records)}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="zaihai-visitor-records-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }

  return Response.json(
    {
      filter: {
        range: timeFilter.range,
        start: timeFilter.start,
        end: timeFilter.end,
        timezone: timeFilter.timezone
      },
      ...report
    },
    {headers: {'Cache-Control': 'no-store, no-cache, must-revalidate'}}
  );
}
