import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import SimplePage from '@/components/SimplePage';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/projects', seo('projectsTitle'), seo('projectsDescription'));
}

export default async function ProjectsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'projects'});
  return <SimplePage eyebrow="Projects" title={t('h1')} intro={t('intro')} cards={['Resort packages', 'Rental projects', 'Distributor cooperation']} />;
}
