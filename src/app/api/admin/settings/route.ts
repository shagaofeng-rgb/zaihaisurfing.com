import {requireAdminApiSession} from '@/lib/adminAuth';
import {appendAuditLog} from '@/lib/adminExtraStore';
import {readAdminStore, writeAdminStore} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 600) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const store = await readAdminStore();
  return Response.json({settings: store.settings});
}

export async function POST(request: Request) {
  const {session, response} = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const contactEmail = text(formData, 'contactEmail', 160);
  const adminNotificationEmail = text(formData, 'adminNotificationEmail', 160);
  const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/[\r\n]/.test(value);
  if (!validEmail(contactEmail) || !validEmail(adminNotificationEmail)) {
    return Response.json({message: '请填写有效的联系邮箱和通知邮箱。'}, {status: 400});
  }
  const before = (await readAdminStore()).settings;
  const changedFields = [
    ['公司名称', before.companyName, text(formData, 'companyName', 160)],
    ['公开联系邮箱', before.contactEmail, contactEmail],
    ['后台通知邮箱', before.adminNotificationEmail, adminNotificationEmail],
    ['WhatsApp', before.whatsapp, text(formData, 'whatsapp', 80)],
    ['公司地址', before.address, text(formData, 'address', 600)],
    ['支付币种', before.paymentCurrency, text(formData, 'paymentCurrency', 12) || 'USD']
  ].filter(([, previous, next]) => previous !== next).map(([label]) => label);
  if (!changedFields.length) {
    return Response.redirect(new URL('/admin/settings?saved=1', request.url), 303);
  }
  await writeAdminStore((store) => ({
    ...store,
    settings: {
      ...store.settings,
      companyName: text(formData, 'companyName', 160),
      contactEmail,
      adminNotificationEmail,
      whatsapp: text(formData, 'whatsapp', 80),
      address: text(formData, 'address', 600),
      paymentCurrency: text(formData, 'paymentCurrency', 12) || 'USD',
      updatedAt: new Date().toISOString()
    }
  }));
  await appendAuditLog({actor: session?.email || 'admin', action: '修改系统设置', target: 'settings', detail: changedFields.join('、'), ip: ''});
  return Response.redirect(new URL('/admin/settings?saved=1', request.url), 303);
}
