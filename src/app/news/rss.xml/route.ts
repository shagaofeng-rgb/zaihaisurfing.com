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
  const items = newsArticles.map((article) => `
    <item>
      <title>${xmlEscape(article.title)}</title>
      <link>${siteUrl}/en/news/${article.slug}</link>
      <guid>${siteUrl}/en/news/${article.slug}</guid>
      <description>${xmlEscape(article.excerpt)}</description>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${xmlEscape(article.category)}</category>
      <enclosure url="${xmlEscape(article.hero)}" type="image/jpeg" />
      <source url="${xmlEscape(article.imageCredit.sourceUrl)}">${xmlEscape(article.imageCredit.publisher)}</source>
    </item>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ZAIHAI News &amp; Insights</title>
    <link>${siteUrl}/en/news</link>
    <description>Water sports equipment news, resort operations insight and ZAIHAI editorial analysis.</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
