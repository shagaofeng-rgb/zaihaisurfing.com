import {cookies} from 'next/headers';
import {adminCookieOptions, ADMIN_COOKIE_NAME, createAdminSession, verifyAdminCredentials} from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let email = '';
  let password = '';

  if (contentType.includes('application/json')) {
    const payload = await request.json().catch(() => ({}));
    email = String(payload.email || '');
    password = String(payload.password || '');
  } else {
    const formData = await request.formData();
    email = String(formData.get('email') || '');
    password = String(formData.get('password') || '');
  }

  if (!verifyAdminCredentials(email, password)) {
    return Response.redirect(new URL('/admin/login?error=1', request.url), 303);
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSession(email), adminCookieOptions());
  return Response.redirect(new URL('/admin', request.url), 303);
}
