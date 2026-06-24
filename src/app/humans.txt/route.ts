import {siteUrl} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const body = `ZAIHAI SURFING

Site: ${siteUrl}
Business: B2B water sports equipment supplier
Contact: davidsha@zaihaisurfing.com
AI reference: ${siteUrl}/llms.txt
Full AI reference: ${siteUrl}/llms-full.txt
News sitemap: ${siteUrl}/news-sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
