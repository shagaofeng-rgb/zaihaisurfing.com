import {requireAdminApiSession} from '@/lib/adminAuth';
import {appendAuditLog} from '@/lib/adminExtraStore';
import {findStoreOrder} from '@/lib/commerceStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_request: Request, {params}: {params: Promise<{orderId: string}>}) {
  const {session, response} = await requireAdminApiSession();
  if (response) return response;
  const {orderId} = await params;
  if (!await findStoreOrder(orderId)) return Response.json({message: '订单不存在'}, {status: 404});

  await appendAuditLog({
    actor: session?.email || 'admin',
    action: '拒绝在线预授权操作',
    target: orderId,
    detail: '支付通道预授权接口尚未接通；订单和支付状态未更改。',
    ip: ''
  });
  return Response.json({message: '在线预授权尚未开通；订单状态未更改。'}, {status: 503});
}
