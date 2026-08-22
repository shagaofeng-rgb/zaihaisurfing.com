import createMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const blockedCountries = new Set(['CN', 'IN']);
const englishEditorialLocales = new Set(['es', 'fr', 'de', 'ar', 'pt', 'ru']);
const crawlerUserAgentPattern = /\b(Googlebot(?:-Image|-News|-Video)?|GoogleOther(?:-Image|-Video)?|Google-InspectionTool|Storebot-Google|AdsBot-Google|Mediapartners-Google|Bingbot|DuckDuckBot|Applebot|YandexBot|Baiduspider)\b/i;

export default function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() || '';
  if (host === 'zaihaisurfing.com') {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.hostname = 'www.zaihaisurfing.com';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // The external publishing plugin validates custom webhooks against POST /.
  // Keep the public home page GET behavior unchanged and send only that POST
  // to the authenticated server-side webhook handler before geo restrictions.
  if (request.method === 'POST' && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/webhook/send_article';
    return NextResponse.rewrite(url);
  }

  // News and Blog are currently authored in English only. Redirecting non-English
  // route variants avoids exposing duplicate, noindex pages through language links.
  const pathParts = request.nextUrl.pathname.split('/');
  const isNonEnglishEditorialRoute =
    (request.method === 'GET' || request.method === 'HEAD') &&
    englishEditorialLocales.has(pathParts[1]) &&
    (pathParts[2] === 'news' || pathParts[2] === 'blog');
  if (isNonEnglishEditorialRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/en/${pathParts.slice(2).join('/')}`;
    return NextResponse.redirect(url, 308);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase() || '';
  if (blockedCountries.has(country) && !crawlerUserAgentPattern.test(userAgent)) {
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
  matcher: ['/', '/((?!api|admin|pricing-admin|account|_next|_vercel|.*\\..*).*)']
};
