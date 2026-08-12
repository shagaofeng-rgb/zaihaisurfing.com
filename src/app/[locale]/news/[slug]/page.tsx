import type {Metadata} from 'next';
import {notFound, permanentRedirect} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {EditorialContent} from '@/components/EditorialContent';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getAllNewsSlugs, getNewsArticleBySlug, getNewsCanonicalSlug} from '@/lib/newsFeed';
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
  if (!article) {
    const canonicalSlug = await getNewsCanonicalSlug(slug);
    if (canonicalSlug) permanentRedirect(`/en/news/${canonicalSlug}`);
    if (/^auto-202606\d{2}-/i.test(slug)) permanentRedirect('/en/news');
    notFound();
  }
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
  if (!article) {
    const canonicalSlug = await getNewsCanonicalSlug(slug);
    if (canonicalSlug) permanentRedirect(`/en/news/${canonicalSlug}`);
    if (/^auto-202606\d{2}-/i.test(slug)) permanentRedirect('/en/news');
    notFound();
  }
  setRequestLocale(locale);

  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
  const primarySource = article.sources[0];
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
    <main className="news-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="news-detail-hero">
        <div className="news-hero-copy">
          <Link href="/news" className="news-back-link">All news</Link>
          <p className="news-kicker">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="news-deck">{article.excerpt}</p>
          <div className="news-meta">
            <time dateTime={article.date}><b>Published</b>{article.date}</time>
            <span><b>Reading time</b>{article.readTime}</span>
            <span><b>Updated</b>{article.updatedAt}</span>
          </div>
          <ul className="news-topic-list" aria-label="Article topics">
            {article.tags.slice(0, 3).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <figure className="news-hero-figure">
          <div className="news-hero-media">
            <img src={article.hero} alt={article.heroAlt} />
          </div>
          <figcaption>
            Image/source material: <a href={article.imageCredit.sourceUrl} target="_blank" rel="noreferrer">{article.imageCredit.publisher}</a>. {article.imageCredit.note}
          </figcaption>
        </figure>
      </section>
      <div className="news-reading-layout">
        <aside className="news-reading-rail" aria-label="Article information">
          <div className="news-rail-card">
            <p className="news-rail-label">News brief</p>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{article.category}</dd>
              </div>
              <div>
                <dt>Original source</dt>
                <dd><a href={primarySource?.url ?? article.imageCredit.sourceUrl} target="_blank" rel="noreferrer">{primarySource?.name ?? 'Verified source'}</a></dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{article.date}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{article.updatedAt}</dd>
              </div>
            </dl>
          </div>
        </aside>
        <article className="news-article">
          <div className="source-note">
            <strong>Editorial disclaimer</strong>
            <p>{article.editorialDisclaimer}</p>
          </div>
          <section className="key-takeaways" id="key-takeaways">
            <p className="section-kicker">At a glance</p>
            <h2>Key Takeaways</h2>
            <ul>{article.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <EditorialContent sections={article.body} />
          {article.productFit ? <section className="product-fit-box">
            <p className="section-kicker">Editorial context</p>
            <h2>Industry relevance</h2>
            <p>{article.productFit}</p>
          </section> : null}
          <section id="sources">
            <p className="section-kicker">Verification</p>
            <h2>Sources and attribution</h2>
            <ul className="source-list">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">Original source: {source.name}: {source.title}</a>
                  <p>Original publication date: {source.publishedDate}. Site access date: {source.accessedDate}. {source.note}</p>
                </li>
              ))}
              <li>
                <a href={article.imageCredit.sourceUrl} target="_blank" rel="noreferrer">Image source: {article.imageCredit.publisher}</a>
                <p>Image URL: {article.imageCredit.imageUrl}. Accessed: {article.imageCredit.accessedDate}. {article.imageCredit.note}</p>
              </li>
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
