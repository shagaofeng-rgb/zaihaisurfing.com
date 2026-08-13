import type {Metadata} from 'next';
import {notFound, permanentRedirect} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {EditorialContent} from '@/components/EditorialContent';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getAllBlogSlugs, getBlogArticleBySlug, getBlogCanonicalSlug} from '@/lib/blogFeed';
import {siteUrl} from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (await getAllBlogSlugs()).map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    const canonicalSlug = await getBlogCanonicalSlug(slug);
    if (canonicalSlug) permanentRedirect(`/en/blog/${canonicalSlug}`);
    notFound();
  }
  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
  return englishOnlyEditorialMetadata(locale, `/blog/${slug}`, `${article.title} | ZAIHAI Guide`, article.excerpt, {
    url: imageUrl,
    width: 1200,
    height: 630,
    alt: article.heroAlt
  });
}

export default async function BlogArticlePage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    const canonicalSlug = await getBlogCanonicalSlug(slug);
    if (canonicalSlug) permanentRedirect(`/en/blog/${canonicalSlug}`);
    notFound();
  }
  setRequestLocale(locale);

  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
  const visibleTags = article.tags.slice(0, 3);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt,
    image: [imageUrl],
    author: {'@type': 'Organization', name: 'ZAIHAI SURFING'},
    publisher: {'@type': 'Organization', name: 'ZAIHAI SURFING'},
    mainEntityOfPage: `${siteUrl}/en/blog/${article.slug}`,
    articleSection: article.category,
    keywords: article.tags.join(', '),
    citation: article.sources.map((source) => source.url)
  };

  return (
    <main className="blog-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="blog-detail-hero">
        <div className="blog-hero-copy">
          <Link href="/blog" className="blog-back-link">All buying guides</Link>
          <p className="blog-kicker">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="blog-deck">{article.excerpt}</p>
          <div className="blog-meta">
            <time dateTime={article.date}><b>Published</b>{article.date}</time>
            <span><b>Reading time</b>{article.readTime}</span>
            <span><b>Updated</b>{article.updatedAt}</span>
          </div>
          {visibleTags.length ? <ul className="blog-topic-list" aria-label="Article topics">
            {visibleTags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul> : null}
        </div>
        <figure className="blog-hero-figure">
          <div className="blog-hero-media">
            <img src={article.hero} alt={article.heroAlt} />
          </div>
        </figure>
      </section>
      <div className="blog-reading-layout">
        <aside className="blog-reading-rail" aria-label="Guide information">
          <div className="blog-rail-card">
            <p className="blog-rail-label">Guide details</p>
            <dl>
              <div><dt>Topic</dt><dd>{article.category}</dd></div>
              <div><dt>Reading time</dt><dd>{article.readTime}</dd></div>
              <div><dt>Published</dt><dd>{article.date}</dd></div>
              <div><dt>Updated</dt><dd>{article.updatedAt}</dd></div>
            </dl>
          </div>
        </aside>
        <article className="blog-article">
          <section className="blog-key-takeaways">
            <p className="blog-section-kicker">At a glance</p>
            <h2>Key takeaways</h2>
            <ul>{article.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <EditorialContent sections={article.body} />
          <section className="blog-product-context">
            <p className="blog-section-kicker">Product context</p>
            <h2>Explore suitable equipment</h2>
            <p>{article.productFit}</p>
            <Link href="/products" className="button primary">Explore products</Link>
          </section>
          {article.sources.length ? <section className="blog-references">
            <p className="blog-section-kicker">References</p>
            <h2>Sources used for this guide</h2>
            <ul>
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.name}: {source.title}</a>
                  <p>Published: {source.publishedDate}. Accessed: {source.accessedDate}. {source.note}</p>
                </li>
              ))}
            </ul>
          </section> : null}
        </article>
      </div>
    </main>
  );
}
