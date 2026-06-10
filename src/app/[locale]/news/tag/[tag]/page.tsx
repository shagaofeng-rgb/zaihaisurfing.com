import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {getNewsTag, getNewsTags} from '@/lib/newsFeed';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (await getNewsTags()).map((tag) => ({tag: tag.slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; tag: string}>;
}): Promise<Metadata> {
  const {locale, tag} = await params;
  const group = await getNewsTag(tag);
  if (!group) notFound();
  return localizedMetadata(
    locale,
    `/news/tag/${tag}`,
    `${group.name} Insights | ZAIHAI SURFING`,
    `Source-attributed ZAIHAI news and buyer insight tagged ${group.name}.`
  );
}

export default async function NewsTagPage({params}: {params: Promise<{locale: Locale; tag: string}>}) {
  const {locale, tag} = await params;
  const group = await getNewsTag(tag);
  if (!group) notFound();
  setRequestLocale(locale);

  return (
    <main>
      <section className="page-hero news-hero">
        <div>
          <Link href="/news" className="text-link">Back to News</Link>
          <p className="eyebrow">News Tag</p>
          <h1>{group.name}</h1>
          <p>Curated ZAIHAI articles connected to this buyer intent and market signal.</p>
        </div>
      </section>
      <section className="section news-section" aria-labelledby="tag-news-title">
        <div className="section-heading">
          <p className="eyebrow">Articles</p>
          <h2 id="tag-news-title">{group.name} Articles</h2>
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
