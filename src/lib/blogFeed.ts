import {listAdminPosts, type ContentPost} from '@/lib/backendStore';
import {editorialSections, isListBlock, listItems} from '@/lib/editorialContent';
import type {NewsArticle} from '@/lib/news';
import {siteUrl} from '@/lib/site';

export function blogContentFingerprint(article: Pick<NewsArticle, 'title' | 'excerpt'>) {
  return `${article.title} ${article.excerpt}`
    .toLowerCase()
    .replace(/\(\d{4}-\d{2}-\d{2}\s+edition\)/g, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sourceUrlFrom(post: ContentPost) {
  return post.sourceUrl || post.source.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, '') || '';
}

function displayTags(tags: string[]) {
  return tags.filter((tag) => {
    const value = tag.trim().toLowerCase();
    return Boolean(value) && value !== 'blog' && value !== 'webhook' && !value.startsWith('webhook:');
  }).slice(0, 4);
}

function conciseTakeaways(items: string[], fallback: string) {
  const candidates = items
    .flatMap((item) => isListBlock(item) ? listItems(item) : item.split(/(?<=[.!?])\s+/))
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length >= 24)
    .map((item) => item.length > 240 ? `${item.slice(0, 237).trimEnd()}...` : item);

  return (candidates.length ? candidates : [fallback]).slice(0, 3);
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function postToBlogArticle(post: ContentPost): NewsArticle {
  const sourceUrl = sourceUrlFrom(post);
  const sourceName = post.sourceName || (sourceUrl ? post.source.split(':')[0]?.trim() : '') || 'ZAIHAI editorial';
  const parsedSections = editorialSections(post.content, 'Buyer context');
  const takeawaySection = parsedSections.find((section) => /^(key )?takeaways?$/i.test(section.heading));
  const body = parsedSections.filter((section) => section !== takeawaySection);
  const textBlocks = body.flatMap((section) => section.paragraphs).filter((item) => !isListBlock(item));
  const tags = displayTags(post.tags);
  return {
    slug: post.slug,
    date: post.publishDate,
    updatedAt: post.updatedAt.slice(0, 10),
    title: post.title,
    excerpt: post.excerpt,
    hero: post.coverImage,
    heroAlt: `${post.title} B2B water sports buying guide image`,
    imageCredit: {
      publisher: sourceName,
      sourceUrl: post.coverImageSourceUrl || post.coverImagePageUrl || sourceUrl || post.coverImage,
      imageUrl: post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`,
      note: 'Cover image is validated before publication.',
      accessedDate: post.updatedAt.slice(0, 10)
    },
    tags,
    category: post.category === 'Blog' ? 'Buying Guide' : post.category || 'Buying Guide',
    readTime: readingTime(post.content),
    sources: sourceUrl ? [{
      name: sourceName,
      title: post.title,
      url: sourceUrl,
      publishedDate: post.publishDate,
      accessedDate: post.updatedAt.slice(0, 10),
      note: 'Used for product education, buyer context and source attribution.'
    }] : [],
    keyTakeaways: conciseTakeaways(takeawaySection?.paragraphs || textBlocks, post.excerpt),
    body,
    productFit: 'Relevant to ZAIHAI electric surfboards, fuel-powered surfboards and go-kart boats for resorts, rental fleets and distributors.'
  };
}

export async function getAllBlogArticles() {
  const adminPosts = await listAdminPosts('blog');
  const published = adminPosts.filter((post) => post.status === 'published').map(postToBlogArticle);
  const seen = new Set<string>();
  const seenTopics = new Set<string>();
  return published
    .filter((article) => {
      if (seen.has(article.slug)) return false;
      const fingerprint = blogContentFingerprint(article);
      if (seenTopics.has(fingerprint)) return false;
      seen.add(article.slug);
      seenTopics.add(fingerprint);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAllBlogSlugs() {
  return (await getAllBlogArticles()).map((article) => article.slug);
}

export async function getBlogArticleBySlug(slug: string) {
  return (await getAllBlogArticles()).find((article) => article.slug === slug);
}

export async function getBlogCanonicalSlug(slug: string) {
  const post = (await listAdminPosts('blog')).find((item) => item.status === 'published' && item.slug === slug);
  if (!post) return null;
  const fingerprint = blogContentFingerprint(postToBlogArticle(post));
  return (await getAllBlogArticles()).find((article) => blogContentFingerprint(article) === fingerprint)?.slug || null;
}
