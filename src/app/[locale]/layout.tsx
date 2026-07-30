import type {Metadata} from 'next';
import {Inter, Manrope, Montserrat, Oxanium, Rajdhani, Sora} from 'next/font/google';
import {Suspense} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales, isLocale, type Locale} from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import MobileBottomCta from '@/components/MobileBottomCta';
import BackToTopButton from '@/components/BackToTopButton';
import FloatingWidgetGuard from '@/components/FloatingWidgetGuard';
import DelayedThirdPartyScript from '@/components/DelayedThirdPartyScript';
import {siteUrl} from '@/lib/site';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-manrope',
  display: 'swap'
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-sora',
  display: 'swap'
});

const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-oxanium',
  display: 'swap'
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '900'],
  variable: '--font-montserrat',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap'
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-rajdhani',
  display: 'swap'
});

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{url: '/assets/brand-mark.png', type: 'image/png', sizes: '512x512'}],
    shortcut: '/assets/brand-mark.png',
    apple: [{url: '/assets/apple-touch-icon.png', type: 'image/png', sizes: '512x512'}]
  },
  manifest: '/manifest.webmanifest'
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages({locale});
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ZAIHAI SURFING',
    url: siteUrl,
    logo: `${siteUrl}/assets/brand-logo.png`,
    email: 'davidsha@zaihaisurfing.com',
    telephone: '+86 17621485205',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District',
      addressLocality: 'Quzhou',
      addressRegion: 'Zhejiang',
      addressCountry: 'CN'
    },
    sameAs: [
      `${siteUrl}/en/contact`
    ],
    makesOffer: [
      'Electric surfboards',
      'Fuel-powered surfboards',
      'Electric go-kart boats',
      'OEM and distributor water sports equipment support'
    ]
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ZAIHAI SURFING',
    url: siteUrl,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/products?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    hasPart: [
      {
        '@type': 'WebPage',
        name: 'Electric surfboards and go-kart boats',
        url: `${siteUrl}/${locale}/products`
      },
      {
        '@type': 'WebPage',
        name: 'Water sports industry news and buyer insights',
        url: `${siteUrl}/${locale}/news`
      },
      {
        '@type': 'WebPage',
        name: 'Project quotation and distributor contact',
        url: `${siteUrl}/${locale}/contact`
      }
    ]
  };

  return (
    <html lang={locale} dir={dir} className={`${manrope.variable} ${sora.variable} ${oxanium.variable} ${montserrat.variable} ${inter.variable} ${rajdhani.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(organizationSchema)}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale as Locale} />
          {children}
          <Footer locale={locale as Locale} />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <WhatsAppFloatingButton />
          <BackToTopButton />
          <MobileBottomCta locale={locale as Locale} />
          <FloatingWidgetGuard />
          <DelayedThirdPartyScript />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
