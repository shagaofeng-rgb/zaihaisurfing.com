import {requireAdminApiSession} from '@/lib/adminAuth';
import {getAdminDashboardData} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const data = await getAdminDashboardData();
  return Response.json({funnel: data.funnel});
}
