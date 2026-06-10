import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {getNewsCategory, newsCategories} from '@/lib/news';

export function generateStaticParams() {
  return newsCategories.map((category) => ({category: category.slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; category: string}>;
}): Promise<Metadata> {
  const {locale, category} = await params;
  const group = getNewsCategory(category);
  if (!group) notFound();
  return localizedMetadata(
    locale,
    `/news/category/${category}`,
    `${group.name} News | ZAIHAI SURFING`,
    `Latest ZAIHAI news and sourced water sports insights for ${group.name}.`
  );
}

export default async function NewsCategoryPage({
  params
}: {
  params: Promise<{locale: Locale; category: string}>;
}) {
  const {locale, category} = await params;
  const group = getNewsCategory(category);
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
        <div className="news-grid">
          {group.articles.map((article) => (
            <Link href={`/news/${article.slug}`} className="news-card" key={article.slug}>
              <img src={article.hero} alt={article.heroAlt} />
              <div>
                <time dateTime={article.date}>{article.date}</time>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <span>{article.category} | {article.readTime} | {article.sources.length} cited sources</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
