import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {getNewsArticle, newsSlugs} from '@/lib/news';
import {siteUrl} from '@/lib/site';

export function generateStaticParams() {
  return newsSlugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = getNewsArticle(slug);
  if (!article) notFound();
  return localizedMetadata(locale, `/blog/${slug}`, `${article.title} | ZAIHAI News`, article.excerpt);
}

export default async function NewsArticlePage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  const article = getNewsArticle(slug);
  if (!article) notFound();
  setRequestLocale(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    image: [`${siteUrl}${article.hero}`],
    author: {
      '@type': 'Organization',
      name: 'ZAIHAI SURFING'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ZAIHAI SURFING'
    },
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${article.slug}`,
    citation: article.sources.map((source) => source.url)
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="news-detail-hero">
        <div>
          <Link href="/blog" className="text-link">
            Back to News
          </Link>
          <p className="eyebrow">Industry news interpretation</p>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div className="news-meta">
            <time dateTime={article.date}>{article.date}</time>
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <img src={article.hero} alt={`${article.title} visual reference`} />
      </section>
      <article className="news-article">
        <div className="source-note">
          <strong>Editorial note</strong>
          <p>This is an original ZAIHAI SURFING article based on public industry sources. We summarize and interpret the market signals for overseas B2B buyers without republishing copyrighted articles.</p>
        </div>
        {article.body.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <section className="product-fit-box">
          <h2>How this connects to ZAIHAI products</h2>
          <p>{article.productFit}</p>
          <Link href="/products" className="button primary">
            View matching products
          </Link>
        </section>
        <section>
          <h2>Sources and attribution</h2>
          <ul className="source-list">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                </a>
                <p>{source.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
