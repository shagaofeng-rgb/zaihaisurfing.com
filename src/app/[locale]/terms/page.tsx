import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import SupportPage from '@/components/SupportPage';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {supportPages} from '@/lib/supportPages';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const page = supportPages.terms;
  return englishOnlyEditorialMetadata(locale, '/terms', `${page.title} | ZAIHAI SURFING`, page.intro);
}

export default async function TermsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  if (locale !== 'en') redirect('/en/terms');
  setRequestLocale(locale);
  return <SupportPage slug="terms" />;
}
