import {cookies} from 'next/headers';
import {bindOrdersToCustomer, createCustomerSession, createOrUpdateCustomerUser, customerCookieOptions} from '@/lib/customerAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(value: unknown, limit = 180) {
  return String(value || '').trim().slice(0, limit);
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const email = clean(payload.email).toLowerCase();
  const name = clean(payload.name || email, 120);
  const password = clean(payload.password, 120);
  if (!email || !email.includes('@') || password.length < 8) {
    return Response.json({message: 'Please enter a valid email and a password of at least 8 characters.'}, {status: 400});
  }
  const user = await createOrUpdateCustomerUser({email, name, password, activate: true});
  await bindOrdersToCustomer(email, user.id);
  const cookieStore = await cookies();
  cookieStore.set('zaihai_customer_session', createCustomerSession(user), customerCookieOptions());
  return Response.json({ok: true, user: {id: user.id, email: user.email, name: user.name}});
}
