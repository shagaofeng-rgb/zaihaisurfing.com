import {locales, pathnames} from '@/i18n/routing';
import {listAdminProducts} from '@/lib/backendStore';
import {getAllBlogArticles} from '@/lib/blogFeed';
import {getAllNewsArticles, isIndexableNewsTaxonomy} from '@/lib/newsFeed';
import {productSlugs, siteUrl} from '@/lib/site';
import {
  chunkSitemapEntries,
  isIndexableRecord,
  renderSitemap,
  type SitemapEntry,
  type SitemapPart,
  type SitemapSection
} from '@/lib/sitemapXml';

const STATIC_PAGE_LASTMOD = '2026-07-08';
const FALLBACK_PRODUCT_LASTMOD = '2026-06-24';
const PRODUCT_TEMPLATE_LASTMOD = '2026-08-08';

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeLastmod(value: string, fallback: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10);
}

function localizedAlternates(path: string) {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])),
    'x-default': `${siteUrl}/en${path}`
  };
}

function localizedEntries(section: SitemapSection, path: string, lastModified: string, onlyEnglish = false): SitemapEntry[] {
  const targetLocales = onlyEnglish ? ['en'] as const : locales;
  const alternates = onlyEnglish ? {'en': `${siteUrl}/en${path}`, 'x-default': `${siteUrl}/en${path}`} : localizedAlternates(path);
  return targetLocales.map((locale) => ({
    section,
    url: `${siteUrl}/${locale}${path}`,
    lastModified,
    alternates
  }));
}

function newestDate(values: string[], fallback: string) {
  return values.map((value) => normalizeLastmod(value, fallback)).sort().at(-1) || fallback;
}

function dedupeEntries(entries: SitemapEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values())
    .sort((a, b) => a.url.localeCompare(b.url));
}

export async function buildSitemapEntries() {
  const [adminProducts, newsArticles, blogArticles] = await Promise.all([
    listAdminProducts(),
    getAllNewsArticles(),
    getAllBlogArticles()
  ]);

  const englishOnlyEditorialPaths = new Set(['/news', '/blog']);
  const englishOnlySupportPaths = new Set(['/faq', '/shipping', '/warranty', '/returns', '/privacy', '/terms']);
  const publicStaticPaths = pathnames.filter((path) => {
    const value = String(path);
    return !value.startsWith('/products/') && !englishOnlyEditorialPaths.has(value);
  });
  const pages = publicStaticPaths.flatMap((path) => localizedEntries(
    'pages',
    String(path),
    STATIC_PAGE_LASTMOD,
    englishOnlySupportPaths.has(String(path))
  ));

  const newsLastmod = newestDate(newsArticles.map((article) => article.updatedAt || article.date), STATIC_PAGE_LASTMOD);
  const blogLastmod = newestDate(blogArticles.map((article) => article.updatedAt || article.date), STATIC_PAGE_LASTMOD);
  pages.push(...localizedEntries('pages', '/news', newsLastmod, true));
  pages.push(...localizedEntries('pages', '/blog', blogLastmod, true));

  const adminBySlug = new Map(adminProducts.map((product) => [product.slug, product]));
  const productEntries = productSlugs.flatMap((slug) => {
    const adminProduct = adminBySlug.get(slug);
    if (adminProduct && !isIndexableRecord({status: adminProduct.status})) return [];
    return localizedEntries(
      'products',
      `/products/${slug}`,
      newestDate([adminProduct?.updatedAt || '', PRODUCT_TEMPLATE_LASTMOD], FALLBACK_PRODUCT_LASTMOD),
      true
    );
  });

  const newsEntries = newsArticles.flatMap((article) => localizedEntries('news', `/news/${article.slug}`, normalizeLastmod(article.updatedAt || article.date, article.date), true));
  const blogEntries = blogArticles.flatMap((article) => localizedEntries('blog', `/blog/${article.slug}`, normalizeLastmod(article.updatedAt || article.date, article.date), true));

  const categoryArticles = new Map<string, Map<string, string>>();
  const tagArticles = new Map<string, Map<string, string>>();
  newsArticles.forEach((article) => {
    const date = article.updatedAt || article.date;
    const category = slugify(article.category);
    const categoryEntries = categoryArticles.get(category) || new Map<string, string>();
    categoryEntries.set(article.slug, date);
    categoryArticles.set(category, categoryEntries);

    // A publishing source can repeat a tag in one record. Count unique articles,
    // matching the taxonomy page's actual article list and its indexability rule.
    Array.from(new Set(article.tags.map(slugify))).forEach((tagSlug) => {
      const tagEntries = tagArticles.get(tagSlug) || new Map<string, string>();
      tagEntries.set(article.slug, date);
      tagArticles.set(tagSlug, tagEntries);
    });
  });
  const categoryEntries = [
    ...Array.from(categoryArticles.entries())
      .filter(([, articles]) => isIndexableNewsTaxonomy(articles.size))
      .flatMap(([slug, articles]) => localizedEntries('categories', `/news/category/${slug}`, newestDate([...articles.values()], newsLastmod), true)),
    ...Array.from(tagArticles.entries())
      .filter(([, articles]) => isIndexableNewsTaxonomy(articles.size))
      .flatMap(([slug, articles]) => localizedEntries('categories', `/news/tag/${slug}`, newestDate([...articles.values()], newsLastmod), true))
  ];

  return dedupeEntries([...pages, ...productEntries, ...newsEntries, ...blogEntries, ...categoryEntries]);
}

export async function buildSitemapManifest() {
  const entries = await buildSitemapEntries();
  const sections: SitemapSection[] = ['pages', 'products', 'news', 'blog', 'categories'];
  const parts: SitemapPart[] = [];

  for (const section of sections) {
    const sectionEntries = entries.filter((entry) => entry.section === section);
    chunkSitemapEntries(sectionEntries).forEach((chunk, index) => {
      const file = `${section}-${index + 1}.xml`;
      parts.push({
        section,
        file,
        url: `${siteUrl}/sitemaps/${file}`,
        lastModified: newestDate(chunk.map((entry) => entry.lastModified), STATIC_PAGE_LASTMOD),
        entries: chunk
      });
    });
  }

  return {entries, parts};
}

export function manifestFromSnapshot(entries: SitemapEntry[]) {
  const sections: SitemapSection[] = ['pages', 'products', 'news', 'blog', 'categories'];
  const parts: SitemapPart[] = [];
  for (const section of sections) {
    chunkSitemapEntries(entries.filter((entry) => entry.section === section)).forEach((chunk, index) => {
      const file = `${section}-${index + 1}.xml`;
      parts.push({
        section,
        file,
        url: `${siteUrl}/sitemaps/${file}`,
        lastModified: newestDate(chunk.map((entry) => entry.lastModified), STATIC_PAGE_LASTMOD),
        entries: chunk
      });
    });
  }
  return {entries, parts};
}

export function sitemapStats(parts: SitemapPart[]) {
  return parts.map((part) => ({
    file: part.file,
    urls: part.entries.length,
    bytes: Buffer.byteLength(renderSitemap(part.entries), 'utf8')
  }));
}
