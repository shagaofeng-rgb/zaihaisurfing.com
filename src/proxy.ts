import createMiddleware from 'next-intl/middleware';
import {NextResponse, type NextRequest} from 'next/server';
import {locales, pathnames, routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const blockedCountries = new Set(['IN']);
const englishEditorialLocales = new Set(['es', 'fr', 'de', 'ar', 'pt', 'ru']);
const publicPathnames = new Set<string>(pathnames);
const englishOnlySupportPaths = new Set(['faq', 'shipping', 'warranty', 'returns', 'privacy', 'terms']);
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

  // Old editorial URLs without a locale are stable aliases of the English
  // content. Redirect before next-intl's temporary locale redirect so Google
  // receives a permanent canonical signal.
  const pathname = request.nextUrl.pathname;
  const pathParts = pathname.split('/');
  if ((request.method === 'GET' || request.method === 'HEAD') && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 308);
  }
  if ((request.method === 'GET' || request.method === 'HEAD') && publicPathnames.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url, 308);
  }
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    pathParts.length === 3 &&
    locales.some((locale) => locale !== 'en' && locale === pathParts[1]) &&
    englishOnlySupportPaths.has(pathParts[2])
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/en/${pathParts[2]}`;
    return NextResponse.redirect(url, 308);
  }
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    (pathname === '/news' || pathname.startsWith('/news/') || pathname === '/blog' || pathname.startsWith('/blog/'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  // News and Blog are currently authored in English only. Redirecting non-English
  // route variants avoids exposing duplicate, noindex pages through language links.
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
