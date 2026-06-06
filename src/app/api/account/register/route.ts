import {cookies} from 'next/headers';
import {bindOrdersToCustomer, createCustomerSession, createOrUpdateCustomerUser, customerCookieOptions, findCustomerUserByEmail} from '@/lib/customerAuth';
import {sendRegistrationWelcomeEmail} from '@/lib/emailService';
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({message: 'Please enter a valid email.'}, {status: 400});
  }
  const existing = await findCustomerUserByEmail(email);
  const user = existing || await createOrUpdateCustomerUser({email, name: email, activate: true});
  await bindOrdersToCustomer(email, user.id);
  if (!existing) await sendRegistrationWelcomeEmail(user.email, user.name);
  const cookieStore = await cookies();
  cookieStore.set('zaihai_customer_session', createCustomerSession(user), customerCookieOptions());
  return Response.json({ok: true, isNewUser: !existing, user: {id: user.id, email: user.email, name: user.name}});
}
