import {requireAdminApiSession} from '@/lib/adminAuth';
import {getCustomerLeadDetail} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, {params}: {params: Promise<{leadId: string}>}) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const {leadId} = await params;
  const detail = await getCustomerLeadDetail(decodeURIComponent(leadId));
  if (!detail) return Response.json({error: 'Lead not found.'}, {status: 404});
  return Response.json({detail});
}
