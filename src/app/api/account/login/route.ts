import {cookies} from 'next/headers';
import {bindOrdersToCustomer, createCustomerSession, createOrUpdateCustomerUser, customerCookieOptions, findCustomerUserByEmail, verifyCustomerCredentials} from '@/lib/customerAuth';
import {sendRegistrationWelcomeEmail} from '@/lib/emailService';
import {checkRateLimit, clientIp} from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!checkRateLimit(`account-login:${clientIp(request)}`, 10, 10 * 60_000)) {
    return Response.json({message: 'Too many login attempts. Please try again later.'}, {status: 429});
  }
  const payload = await request.json().catch(() => ({}));
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({message: 'Please enter a valid email.'}, {status: 400});
  }
  let user = password ? await verifyCustomerCredentials(email, password) : await findCustomerUserByEmail(email);
  if (password && !user) return Response.json({message: 'Invalid email or password.'}, {status: 401});
  const isNewUser = !user;
  if (!user) {
    user = await createOrUpdateCustomerUser({email, name: email, activate: true});
    await sendRegistrationWelcomeEmail(user.email, user.name);
  }
  await bindOrdersToCustomer(email, user.id);
  const cookieStore = await cookies();
  cookieStore.set('zaihai_customer_session', createCustomerSession(user), customerCookieOptions());
  return Response.json({ok: true, isNewUser, user: {id: user.id, email: user.email, name: user.name}});
}
