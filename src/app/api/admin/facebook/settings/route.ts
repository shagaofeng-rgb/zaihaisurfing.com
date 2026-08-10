import {requireAdminApiSession} from '@/lib/adminAuth';
import {saveFacebookSettings} from '@/lib/facebookPagePublisher';

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if (auth.response) return auth.response;
  const form = await request.formData();
  try {
    await saveFacebookSettings({enabled: form.get('enabled') === 'true', timezone: String(form.get('timezone') || 'Asia/Manila'), publishTime: String(form.get('publishTime') || '09:00')});
    return Response.redirect(new URL('/admin/facebook?settings=saved', request.url), 303);
  } catch (error) {
    return Response.redirect(new URL(`/admin/facebook?settings=${encodeURIComponent(error instanceof Error ? error.message : 'Unable to save settings')}`, request.url), 303);
  }
}
