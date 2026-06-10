import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {newsArticles} from '@/lib/news';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return localizedMetadata(
    locale,
    '/news',
    'News & Insights | ZAIHAI SURFING',
    'Water sports equipment news, electric surfboard market analysis, resort operation insights and cited industry sources from ZAIHAI SURFING.'
  );
}

export default async function NewsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const featured = newsArticles[0];
  const latest = newsArticles.slice(1);

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <p className="eyebrow">News & Insights</p>
          <h1>Water Sports Market Updates for Buyers</h1>
          <p>Original ZAIHAI editorial analysis based on public sources, with image attribution and references for every article.</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="news-list-title">
        <div className="section-heading">
          <p className="eyebrow">Featured Article</p>
          <h2 id="news-list-title">Industry Signals With Source Attribution</h2>
          <p>Each article connects public market signals with resort, rental, marina and distributor buying decisions.</p>
        </div>
        {featured ? (
          <Link href={`/news/${featured.slug}`} className="news-card news-featured-card">
            <img src={featured.hero} alt={featured.heroAlt} />
            <div>
              <time dateTime={featured.date}>{featured.date}</time>
              <h3>{featured.title}</h3>
              <p>{featured.excerpt}</p>
              <span>{featured.category} | {featured.readTime} | {featured.sources.length} cited sources</span>
            </div>
          </Link>
        ) : null}
        <div className="section-heading compact">
          <p className="eyebrow">Latest News</p>
          <h2>Latest Water Sports Insights</h2>
        </div>
        <div className="news-grid">
          {latest.map((article) => (
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
