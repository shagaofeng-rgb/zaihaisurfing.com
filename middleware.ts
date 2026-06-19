import createMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const blockedCountries = new Set(['CN', 'IN']);

export default function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase() || '';
  if (blockedCountries.has(country)) {
    return new NextResponse('Access unavailable from this region.', {
      status: 403,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-zaihai-region-block': country
      }
    });
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
