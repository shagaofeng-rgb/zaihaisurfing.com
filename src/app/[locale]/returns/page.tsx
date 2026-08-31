import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import SupportPage from '@/components/SupportPage';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {supportPages} from '@/lib/supportPages';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const page = supportPages.returns;
  return englishOnlyEditorialMetadata(locale, '/returns', `${page.title} | ZAIHAI SURFING`, page.intro);
}

export default async function ReturnsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  if (locale !== 'en') redirect('/en/returns');
  setRequestLocale(locale);
  return <SupportPage slug="returns" />;
}
