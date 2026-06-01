import type {Metadata} from 'next';
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
import '../globals.css';

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
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale as Locale} />
          {children}
          <Footer locale={locale as Locale} />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <WhatsAppFloatingButton />
          <MobileBottomCta locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
