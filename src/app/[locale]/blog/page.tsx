import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import SimplePage from '@/components/SimplePage';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/blog', seo('blogTitle'), seo('blogDescription'));
}

export default async function BlogPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'blog'});
  return <SimplePage eyebrow="Blog" title={t('h1')} intro={t('intro')} cards={['Electric Surfboard Buying Guide', 'Water Sports Rental Business', 'Electric vs Fuel-Powered Boards']} />;
}
