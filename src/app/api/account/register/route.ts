import {cookies} from 'next/headers';
import {bindOrdersToCustomer, createCustomerSession, createOrUpdateCustomerUser, customerCookieOptions, findCustomerUserByEmail} from '@/lib/customerAuth';
import {checkRateLimit, clientIp} from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(value: unknown, limit = 180) {
  return String(value || '').trim().slice(0, limit);
}

export async function POST(request: Request) {
  if (!checkRateLimit(`account-register:${clientIp(request)}`, 5, 10 * 60_000)) {
    return Response.json({message: 'Too many registration attempts. Please try again later.'}, {status: 429});
  }
  const payload = await request.json().catch(() => ({}));
  const email = clean(payload.email).toLowerCase();
  const firstName = clean(payload.firstName, 80);
  const lastName = clean(payload.lastName, 80);
  const name = clean(payload.name || `${firstName} ${lastName}`.trim() || email, 120);
  const country = clean(payload.country, 120);
  const password = clean(payload.password, 120);
  const confirmPassword = clean(payload.confirmPassword, 120);
  const acceptedTerms = Boolean(payload.acceptedTerms);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password !== confirmPassword || !acceptedTerms) {
    return Response.json({message: 'Please enter a valid email, matching passwords of at least 8 characters, and accept the terms.'}, {status: 400});
  }
  const existing = await findCustomerUserByEmail(email);
  if (existing?.passwordHash && existing.status === 'active') {
    return Response.json({message: 'This email already has an account. Please log in or reset your password.'}, {status: 409});
  }
  const user = await createOrUpdateCustomerUser({email, name, firstName, lastName, country, password, activate: true});
  await bindOrdersToCustomer(email, user.id);
  const cookieStore = await cookies();
  cookieStore.set('zaihai_customer_session', createCustomerSession(user), customerCookieOptions());
  return Response.json({ok: true, user: {id: user.id, email: user.email, name: user.name}});
}
