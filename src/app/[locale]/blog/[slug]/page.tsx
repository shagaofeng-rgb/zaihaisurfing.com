import {permanentRedirect} from 'next/navigation';
import type {Locale} from '@/i18n/routing';

export default async function LegacyBlogArticlePage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  permanentRedirect(`/${locale}/news/${encodeURIComponent(slug)}`);
}
