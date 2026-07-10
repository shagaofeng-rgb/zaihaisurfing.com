import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {NewsArticleGrid} from '@/components/NewsArticleGrid';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getAllBlogArticles} from '@/lib/blogFeed';

export const dynamic = 'force-dynamic';

function hasListParams(searchParams?: Record<string, string | string[] | undefined>) {
  return Boolean(searchParams?.page || searchParams?.perPage);
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const {locale} = await params;
  const query = await searchParams;
  const metadata = englishOnlyEditorialMetadata(
    locale,
    '/blog',
    'Buying Guides & Product Knowledge | ZAIHAI SURFING',
    'Commercial water sports buying guides for electric surfboards, fuel-powered surfboards, go-kart boats, resorts, rentals and distributors.'
  );
  if (hasListParams(query) || locale !== 'en') {
    metadata.robots = {index: false, follow: true};
  }
  return metadata;
}

export default async function BlogPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {locale} = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const articles = await getAllBlogArticles();
  const featured = articles[0];
  const latest = articles.slice(1);

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <p className="eyebrow">Buying Guides</p>
          <h1>Product Knowledge for Commercial Water Sports Buyers</h1>
          <p>Practical guides for resorts, rental fleets, water parks and distributors comparing ZAIHAI surfboards and go-kart boats.</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="blog-list-title">
        <div className="section-heading">
          <p className="eyebrow">Featured Guide</p>
          <h2 id="blog-list-title">Decision Guides With Product Context</h2>
          <p>Each guide links buyer questions to real ZAIHAI product categories, operation workflows and commercial use cases.</p>
        </div>
        {featured ? (
          <Link href={`/blog/${featured.slug}`} className="news-card news-featured-card">
            <img src={featured.hero} alt={featured.heroAlt} />
            <div>
              <time dateTime={featured.date}>{featured.date}</time>
              <h3>{featured.title}</h3>
              <p>{featured.excerpt}</p>
              <span>{featured.category} | {featured.readTime}</span>
            </div>
          </Link>
        ) : null}
        <div className="section-heading compact">
          <p className="eyebrow">Latest Guides</p>
          <h2>Latest Product Knowledge</h2>
        </div>
        <NewsArticleGrid articles={latest} basePath="/blog" searchParams={query} />
      </section>
    </main>
  );
}
