import crypto from 'node:crypto';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'zaihai_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_JWT_SECRET || 'zaihai-local-admin-secret';
}

function base64Url(input: string) {
  return Buffer.from(input).toString('base64url');
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || 'davidsha@zaihaisurfing.com').trim().toLowerCase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || normalizedEmail !== adminEmail || !password) return false;
  if (process.env.ADMIN_PASSWORD) return password === process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV !== 'production' && password === 'zaihai-admin-demo';
}

export function createAdminSession(email: string) {
  const payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSession(token?: string) {
  if (!token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = sign(encodedPayload);
  if (!signature || signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      email?: string;
      exp?: number;
    };
    if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  };
}
