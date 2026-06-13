import {Link} from '@/i18n/navigation';
import type {NewsArticle} from '@/lib/news';

const PAGE_SIZE_OPTIONS = [15, 30, 45] as const;

type SearchParams = Record<string, string | string[] | undefined>;

type NewsArticleGridProps = {
  articles: NewsArticle[];
  basePath: string;
  searchParams?: SearchParams;
};

function numericParam(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function pageSizeFrom(searchParams?: SearchParams) {
  const requested = numericParam(searchParams?.perPage, 15);
  return PAGE_SIZE_OPTIONS.includes(requested as (typeof PAGE_SIZE_OPTIONS)[number]) ? requested : 15;
}

function hrefFor(basePath: string, page: number, perPage: number) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (perPage !== 15) params.set('perPage', String(perPage));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function NewsArticleGrid({articles, basePath, searchParams}: NewsArticleGridProps) {
  const perPage = pageSizeFrom(searchParams);
  const totalPages = Math.max(1, Math.ceil(articles.length / perPage));
  const requestedPage = numericParam(searchParams?.page, 1);
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * perPage;
  const visibleArticles = articles.slice(start, start + perPage);

  return (
    <>
      <div className="news-list-toolbar" aria-label="News list controls">
        <p>{articles.length} articles | Page {page} of {totalPages}</p>
        <form action={basePath}>
          <label htmlFor="news-per-page">Per page</label>
          <select id="news-per-page" name="perPage" defaultValue={String(perPage)}>
            {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <button type="submit">Apply</button>
        </form>
      </div>
      <div className="news-grid">
        {visibleArticles.map((article) => (
          <Link href={`/news/${article.slug}`} className="news-card" key={article.slug}>
            <img src={article.hero} alt={article.heroAlt} loading="lazy" />
            <div>
              <time dateTime={article.date}>{article.date}</time>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span>{article.category} | {article.readTime} | {article.sources.length} cited sources</span>
            </div>
          </Link>
        ))}
      </div>
      {totalPages > 1 ? (
        <nav className="news-pagination" aria-label="News pagination">
          <Link className={page <= 1 ? 'is-disabled' : ''} href={hrefFor(basePath, Math.max(1, page - 1), perPage)} aria-disabled={page <= 1}>Previous</Link>
          <div>
            {Array.from({length: totalPages}, (_, index) => index + 1)
              .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 2)
              .map((item, index, items) => (
                <span key={item}>
                  {index > 0 && item - items[index - 1] > 1 ? <span className="news-pagination-gap">...</span> : null}
                  <Link className={item === page ? 'is-active' : ''} href={hrefFor(basePath, item, perPage)} aria-current={item === page ? 'page' : undefined}>{item}</Link>
                </span>
              ))}
          </div>
          <Link className={page >= totalPages ? 'is-disabled' : ''} href={hrefFor(basePath, Math.min(totalPages, page + 1), perPage)} aria-disabled={page >= totalPages}>Next</Link>
        </nav>
      ) : null}
    </>
  );
}
