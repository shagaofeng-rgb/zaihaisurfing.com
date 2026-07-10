import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {NewsArticleGrid} from '@/components/NewsArticleGrid';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getNewsTag, getNewsTags} from '@/lib/newsFeed';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (await getNewsTags()).map((tag) => ({tag: tag.slug}));
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale; tag: string}>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const {locale, tag} = await params;
  const query = await searchParams;
  const group = await getNewsTag(tag);
  if (!group) notFound();
  const metadata = englishOnlyEditorialMetadata(
    locale,
    `/news/tag/${tag}`,
    `${group.name} Insights | ZAIHAI SURFING`,
    `Source-attributed ZAIHAI news and buyer insight tagged ${group.name}.`
  );
  if (query?.page || query?.perPage || locale !== 'en') {
    metadata.robots = {index: false, follow: true};
  }
  return metadata;
}

export default async function NewsTagPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale; tag: string}>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {locale, tag} = await params;
  const query = await searchParams;
  const group = await getNewsTag(tag);
  if (!group) notFound();
  setRequestLocale(locale);

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <Link href="/news" className="text-link">Back to News</Link>
          <p className="eyebrow">News Tag</p>
          <h1>{group.name}</h1>
          <p>Curated ZAIHAI articles connected to this buyer intent and market signal.</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="tag-news-title">
        <div className="section-heading">
          <p className="eyebrow">Articles</p>
          <h2 id="tag-news-title">{group.name} Articles</h2>
        </div>
        <NewsArticleGrid articles={group.articles} basePath={`/news/tag/${tag}`} articleBasePath="/news" searchParams={query} />
      </section>
    </main>
  );
}
