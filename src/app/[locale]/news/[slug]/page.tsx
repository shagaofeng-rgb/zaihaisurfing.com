import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getAllNewsSlugs, getNewsArticleBySlug} from '@/lib/newsFeed';
import {siteUrl} from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (await getAllNewsSlugs()).map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();
  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
  return englishOnlyEditorialMetadata(locale, `/news/${slug}`, `${article.title} | ZAIHAI News`, article.excerpt, {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: article.heroAlt
  });
}

export default async function NewsArticlePage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();
  setRequestLocale(locale);

  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt,
    image: [imageUrl],
    author: {'@type': 'Organization', name: 'ZAIHAI SURFING'},
    publisher: {'@type': 'Organization', name: 'ZAIHAI SURFING'},
    mainEntityOfPage: `${siteUrl}/en/news/${article.slug}`,
    articleSection: article.category,
    keywords: article.tags.join(', '),
    citation: article.sources.map((source) => source.url)
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="news-detail-hero">
        <div>
          <Link href="/news" className="text-link">Back to News</Link>
          <p className="eyebrow">News & Insights</p>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div className="news-meta">
            <time dateTime={article.date}>{article.date}</time>
            <span>Updated {article.updatedAt}</span>
            <span>{article.readTime}</span>
            {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <figure className="news-hero-figure">
          <img src={article.hero} alt={article.heroAlt} />
          <figcaption>
            Image/source material: <a href={article.imageCredit.sourceUrl} target="_blank" rel="noreferrer">{article.imageCredit.publisher}</a>. {article.imageCredit.note}
          </figcaption>
        </figure>
      </section>
      <article className="news-article">
        <div className="source-note">
          <strong>Editorial note</strong>
          <p>This is an original ZAIHAI SURFING article based on public industry sources. Part of the image/source material is taken from {article.imageCredit.publisher}, with attribution shown on this page. We summarize and interpret market signals for overseas buyers without republishing copyrighted article text.</p>
        </div>
        <section className="key-takeaways">
          <h2>Key Takeaways</h2>
          <ul>{article.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        {article.body.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <section className="product-fit-box">
          <h2>How this connects to ZAIHAI products</h2>
          <p>{article.productFit}</p>
          <Link href="/products" className="button primary">View matching products</Link>
        </section>
        <section>
          <h2>Sources and attribution</h2>
          <ul className="source-list">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.name}: {source.title}</a>
                <p>Published: {source.publishedDate}. Accessed: {source.accessedDate}. {source.note}</p>
              </li>
            ))}
            <li>
              <a href={article.imageCredit.sourceUrl} target="_blank" rel="noreferrer">Image source: {article.imageCredit.publisher}</a>
              <p>Image URL: {article.imageCredit.imageUrl}. Accessed: {article.imageCredit.accessedDate}. {article.imageCredit.note}</p>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}
