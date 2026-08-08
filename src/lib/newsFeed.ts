import {listAdminPosts, type ContentPost} from '@/lib/backendStore';
import {newsArticles, type NewsArticle} from '@/lib/news';
import {siteUrl} from '@/lib/site';

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function isIndexableNewsTaxonomy(articleCount: number) {
  return articleCount >= 3;
}

export function newsContentFingerprint(article: Pick<NewsArticle, 'title' | 'excerpt'>) {
  return `${article.title} ${article.excerpt}`
    .toLowerCase()
    .replace(/\(\d{4}-\d{2}-\d{2}(?:\s+edition)?\)/g, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    .replace(/\bbuyer\s+brief\s*\d+\b/g, '')
    .replace(/\bdaily\s+seo\/geo\s+buyer\s+brief\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sourceUrlFrom(post: ContentPost) {
  return post.source.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, '') || `${siteUrl}/en/news/${post.slug}`;
}

function postToArticle(post: ContentPost): NewsArticle {
  const sourceUrl = sourceUrlFrom(post);
  const sourceName = post.source.split(':')[0]?.trim() || 'Public source';
  const paragraphs = post.content.split(/\n{2,}/).map((item) => item.replace(/^#+\s*/, '').trim()).filter(Boolean);
  return {
    slug: post.slug,
    date: post.publishDate,
    updatedAt: post.updatedAt.slice(0, 10),
    title: post.title,
    excerpt: post.excerpt,
    hero: post.coverImage,
    heroAlt: `${post.title} source-attributed news image`,
    imageCredit: {
      publisher: post.coverImageStatus === 'ai-illustrative' ? 'ZAIHAI AI illustration' : post.coverImageStatus === 'illustrative' ? 'Unsplash editorial illustration' : sourceName,
      sourceUrl: post.coverImageSourceUrl || sourceUrl,
      imageUrl: post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`,
      note: post.coverImageStatus === 'ai-illustrative'
        ? 'AI-generated illustrative image. It is not a depiction of the cited event.'
        : post.coverImageStatus === 'illustrative'
          ? 'Editorial illustrative image used because the cited source did not provide a reusable original image.'
          : 'Feature image was validated from the cited source before publication.',
      accessedDate: post.updatedAt.slice(0, 10)
    },
    tags: post.tags,
    category: post.category || 'Industry News',
    readTime: '4 min read',
    sources: [{
      name: sourceName,
      title: post.title,
      url: sourceUrl,
      publishedDate: post.publishDate,
      accessedDate: post.updatedAt.slice(0, 10),
      note: 'Used for source attribution and market context.'
    }],
    keyTakeaways: [
      'Public market signals continue to support commercial water sports planning.',
      'Buyers should compare equipment by guest use case, operating workflow and after-sales support.',
      'ZAIHAI keeps image and source attribution visible on every automated news item.'
    ],
    body: [
      {
        heading: 'What happened',
        paragraphs: paragraphs.slice(0, 2).length ? paragraphs.slice(0, 2) : [post.excerpt]
      },
      {
        heading: 'Why it matters for buyers',
        paragraphs: paragraphs.slice(2, 4).length ? paragraphs.slice(2, 4) : [
          'Resorts, rental operators and distributors need market information that connects public industry updates with practical equipment planning.'
        ]
      }
    ],
    productFit: 'Relevant to ZAIHAI electric surfboards and go-kart boats for resorts, rental fleets and distributor programs.'
  };
}

export async function getAllNewsArticles() {
  const adminPosts = await listAdminPosts('news');
  const published = adminPosts
    .filter((post) => post.status === 'published')
    .map(postToArticle);
  const seen = new Set<string>();
  const seenTopics = new Set<string>();
  const articles = [...published, ...newsArticles]
    .filter((article) => {
      if (seen.has(article.slug)) return false;
      const topic = newsContentFingerprint(article);
      if (seenTopics.has(topic)) return false;
      seen.add(article.slug);
      seenTopics.add(topic);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
  return articles;
}

export async function getAllNewsSlugs() {
  return (await getAllNewsArticles()).map((article) => article.slug);
}

export async function getNewsArticleBySlug(slug: string) {
  return (await getAllNewsArticles()).find((article) => article.slug === slug);
}

export async function getNewsCanonicalSlug(slug: string) {
  const post = (await listAdminPosts('news')).find((item) => item.status === 'published' && item.slug === slug);
  if (!post) return null;
  const fingerprint = newsContentFingerprint(postToArticle(post));
  return (await getAllNewsArticles()).find((article) => newsContentFingerprint(article) === fingerprint)?.slug || null;
}

export async function getNewsCategories() {
  return Array.from(new Map((await getAllNewsArticles()).map((article) => [slugify(article.category), article.category])))
    .map(([slug, name]) => ({slug, name}));
}

export async function getNewsTags() {
  return Array.from(new Map((await getAllNewsArticles()).flatMap((article) => article.tags.map((tag) => [slugify(tag), tag]))))
    .map(([slug, name]) => ({slug, name}));
}

export async function getNewsCategory(slug: string) {
  const articles = await getAllNewsArticles();
  const name = articles.find((article) => slugify(article.category) === slug)?.category;
  if (!name) return null;
  return {slug, name, articles: articles.filter((article) => slugify(article.category) === slug)};
}

export async function getNewsTag(slug: string) {
  const articles = await getAllNewsArticles();
  const name = articles.flatMap((article) => article.tags).find((tag) => slugify(tag) === slug);
  if (!name) return null;
  return {slug, name, articles: articles.filter((article) => article.tags.some((tag) => slugify(tag) === slug))};
}
