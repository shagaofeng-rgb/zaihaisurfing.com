import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import SimplePage from '@/components/SimplePage';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/factory', seo('factoryTitle'), seo('factoryDescription'));
}

export default async function FactoryPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'factory'});
  return <SimplePage eyebrow="Factory" title={t('h1')} intro={`${t('intro')} ${t('items')}`} cards={['OEM/ODM', 'Quality support', 'Export documents']} />;
}
