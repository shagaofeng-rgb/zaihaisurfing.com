import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import SupportPage from '@/components/SupportPage';
import {localizedMetadata} from '@/lib/metadata';
import {supportPages} from '@/lib/supportPages';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const page = supportPages.warranty;
  return localizedMetadata(locale, '/warranty', `${page.title} | ZAIHAI SURFING`, page.intro);
}

export default async function WarrantyPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <SupportPage slug="warranty" />;
}
