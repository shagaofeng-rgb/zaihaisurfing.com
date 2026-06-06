import {cookies} from 'next/headers';
import {createCustomerSession, customerCookieOptions, verifyCustomerCredentials} from '@/lib/customerAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const user = await verifyCustomerCredentials(email, password);
  if (!user) return Response.json({message: 'Invalid email or password.'}, {status: 401});
  const cookieStore = await cookies();
  cookieStore.set('zaihai_customer_session', createCustomerSession(user), customerCookieOptions());
  return Response.json({ok: true, user: {id: user.id, email: user.email, name: user.name}});
}
