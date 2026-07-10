import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {englishOnlyEditorialMetadata} from '@/lib/metadata';
import {getAllBlogSlugs, getBlogArticleBySlug} from '@/lib/blogFeed';
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
  if (!article) notFound();
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
  if (!article) notFound();
  setRequestLocale(locale);

  const imageUrl = article.hero.startsWith('http') ? article.hero : `${siteUrl}${article.hero}`;
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <section className="news-detail-hero">
        <div>
          <Link href="/blog" className="text-link">Back to Blog</Link>
          <p className="eyebrow">Buying Guide</p>
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
          <h2>References</h2>
          <ul className="source-list">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">{source.name}: {source.title}</a>
                <p>Published: {source.publishedDate}. Accessed: {source.accessedDate}. {source.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
