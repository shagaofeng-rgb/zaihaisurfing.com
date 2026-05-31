import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import SimplePage from '@/components/SimplePage';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/about', seo('aboutTitle'), seo('aboutDescription'));
}

export default async function AboutPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'about'});
  return <SimplePage eyebrow="About" title={t('h1')} intro={`${t('intro')} ${t('positioning')}`} cards={['Premium brand', 'OEM/ODM solution', 'Global buyers']} />;
}
