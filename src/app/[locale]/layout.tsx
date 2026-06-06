import type {Metadata} from 'next';
import {Manrope, Oxanium, Sora} from 'next/font/google';
import Script from 'next/script';
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
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap'
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap'
});

const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-oxanium',
  display: 'swap'
});

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zaihaisurfing.com')
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

  return (
    <html lang={locale} dir={dir} className={`${manrope.variable} ${sora.variable} ${oxanium.variable}`}>
      <body>
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
        </NextIntlClientProvider>
        <Script
          src="https://plugin-code.salesmartly.com/js/project_653905_759291_1780551668.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
