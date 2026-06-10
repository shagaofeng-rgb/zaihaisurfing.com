import {getAllNewsArticles} from '@/lib/newsFeed';
import {siteUrl} from '@/lib/site';

export const dynamic = 'force-dynamic';

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const newsArticles = await getAllNewsArticles();
  const urls = newsArticles.map((article) => `
  <url>
    <loc>${siteUrl}/en/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>ZAIHAI News &amp; Insights</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.date}</news:publication_date>
      <news:title>${xmlEscape(article.title)}</news:title>
    </news:news>
  </url>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
