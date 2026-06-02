import {requireAdminApiSession} from '@/lib/adminAuth';
import {getAdminDashboardData} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const data = await getAdminDashboardData();
  return Response.json({
    metrics: data.metrics,
    events: data.events,
    countries: data.countries,
    trafficSources: data.trafficSources,
    popularProducts: data.popularProducts
  });
}
