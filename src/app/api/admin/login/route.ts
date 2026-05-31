import {cookies} from 'next/headers';
import {adminCookieOptions, ADMIN_COOKIE_NAME, createAdminSession, verifyAdminCredentials} from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  if (!verifyAdminCredentials(email, password)) {
    return Response.redirect(new URL('/admin/login?error=1', request.url), 303);
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSession(email), adminCookieOptions());
  return Response.redirect(new URL('/admin', request.url), 303);
}
