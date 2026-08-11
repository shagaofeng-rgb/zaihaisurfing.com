import {getAllBlogArticles} from '@/lib/blogFeed';
import {siteUrl} from '@/lib/site';

export const dynamic = 'force-dynamic';

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await getAllBlogArticles();
  const urls = articles.map((article) => `  <url><loc>${siteUrl}/en/blog/${xmlEscape(article.slug)}</loc><lastmod>${xmlEscape(article.updatedAt || article.date)}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, {
    headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'}
  });
}
