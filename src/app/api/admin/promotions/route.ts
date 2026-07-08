import {requireAdminApiSession} from '@/lib/adminAuth';
import {appendAuditLog, createPromotion, listPromotions, updatePromotionStatus, type PromotionRecord} from '@/lib/adminExtraStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 240) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

function promotionStatus(value: string): PromotionRecord['status'] {
  return value === 'paused' || value === 'expired' ? value : 'active';
}

function promotionType(value: string): PromotionRecord['type'] {
  return value === 'fixed' || value === 'percent' ? value : 'quote_only';
}

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  return Response.json({promotions: await listPromotions()});
}

export async function POST(request: Request) {
  const {session, response} = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const action = text(formData, 'action', 40);
  if (action === 'status') {
    await updatePromotionStatus(text(formData, 'id', 120), promotionStatus(text(formData, 'status', 24)));
    await appendAuditLog({actor: session?.email || 'admin', action: '修改促销状态', target: text(formData, 'id', 120), detail: text(formData, 'status', 24), ip: ''});
  } else {
    const record = await createPromotion({
      name: text(formData, 'name', 160),
      code: text(formData, 'code', 80).toUpperCase(),
      type: promotionType(text(formData, 'type', 24)),
      value: Math.max(0, Number(text(formData, 'value', 24) || 0)),
      status: promotionStatus(text(formData, 'status', 24)),
      startsAt: text(formData, 'startsAt', 40),
      endsAt: text(formData, 'endsAt', 40),
      note: text(formData, 'note', 600)
    });
    await appendAuditLog({actor: session?.email || 'admin', action: '新建促销', target: record.code || record.id, detail: record.name, ip: ''});
  }
  return Response.redirect(new URL('/admin/promotions', request.url), 303);
}
