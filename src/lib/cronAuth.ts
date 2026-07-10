export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return !process.env.VERCEL;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}
