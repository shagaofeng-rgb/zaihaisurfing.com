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
  return post.source.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, '') || `${siteUrl}/en/blog/${post.slug}`;
}

function postToBlogArticle(post: ContentPost): NewsArticle {
  const sourceUrl = sourceUrlFrom(post);
  const sourceName = post.source.split(':')[0]?.trim() || 'ZAIHAI editorial';
  const parsedSections = editorialSections(post.content, 'Buyer context');
  const takeawaySection = parsedSections.find((section) => /^(key )?takeaways?$/i.test(section.heading));
  const body = parsedSections.filter((section) => section !== takeawaySection);
  const textBlocks = body.flatMap((section) => section.paragraphs).filter((item) => !isListBlock(item));
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
      sourceUrl,
      imageUrl: post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`,
      note: 'Image was validated before publication and is kept with visible attribution when based on a public source.',
      accessedDate: post.updatedAt.slice(0, 10)
    },
    tags: post.tags,
    category: post.category || 'Buying Guide',
    readTime: '5 min read',
    sources: [{
      name: sourceName,
      title: post.title,
      url: sourceUrl,
      publishedDate: post.publishDate,
      accessedDate: post.updatedAt.slice(0, 10),
      note: 'Used for product education, buyer context and source attribution.'
    }],
    keyTakeaways: takeawaySection
      ? takeawaySection.paragraphs.flatMap((item) => isListBlock(item) ? listItems(item) : [item]).slice(0, 4)
      : textBlocks.slice(0, 3).length ? textBlocks.slice(0, 3) : [post.excerpt],
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
