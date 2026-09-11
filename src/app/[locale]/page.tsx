import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {isLocale, type Locale} from '@/i18n/routing';
import ResortPartnershipHome from '@/components/ResortPartnershipHome';
import {localizedMetadata} from '@/lib/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '', seo('homeTitle'), seo('homeDescription'));
}

export default async function HomePage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return <ResortPartnershipHome locale={locale} />;
}
