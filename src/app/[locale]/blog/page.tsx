import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {newsArticles} from '@/lib/news';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/blog', seo('blogTitle'), seo('blogDescription'));
}

export default async function BlogPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'blog'});

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <p className="eyebrow">News & Industry Signals</p>
          <h1>{t('h1')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="news-list-title">
        <div className="section-heading">
          <p className="eyebrow">Original ZAIHAI commentary</p>
          <h2 id="news-list-title">Water Sports Market Updates for Buyers</h2>
          <p>Each article connects public market signals with resort, rental, marina and distributor buying decisions.</p>
        </div>
        <div className="news-grid">
          {newsArticles.map((article) => (
            <Link href={`/blog/${article.slug}`} className="news-card" key={article.slug}>
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
