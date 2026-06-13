import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {NewsArticleGrid} from '@/components/NewsArticleGrid';
import {localizedMetadata} from '@/lib/metadata';
import {getNewsCategories, getNewsCategory} from '@/lib/newsFeed';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (await getNewsCategories()).map((category) => ({category: category.slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; category: string}>;
}): Promise<Metadata> {
  const {locale, category} = await params;
  const group = await getNewsCategory(category);
  if (!group) notFound();
  return localizedMetadata(
    locale,
    `/news/category/${category}`,
    `${group.name} News | ZAIHAI SURFING`,
    `Latest ZAIHAI news and sourced water sports insights for ${group.name}.`
  );
}

export default async function NewsCategoryPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale; category: string}>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {locale, category} = await params;
  const query = await searchParams;
  const group = await getNewsCategory(category);
  if (!group) notFound();
  setRequestLocale(locale);

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <Link href="/news" className="text-link">Back to News</Link>
          <p className="eyebrow">News Category</p>
          <h1>{group.name}</h1>
          <p>Source-attributed ZAIHAI editorial coverage for this water sports market segment.</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="category-news-title">
        <div className="section-heading">
          <p className="eyebrow">Articles</p>
          <h2 id="category-news-title">{group.name} Articles</h2>
        </div>
        <NewsArticleGrid articles={group.articles} basePath={`/news/category/${category}`} searchParams={query} />
      </section>
    </main>
  );
}
