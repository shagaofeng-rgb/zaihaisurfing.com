import {siteUrl} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const body = `ZAIHAI SURFING AI-readable site summary

Primary language: English
Business type: B2B water sports equipment supplier
Products: electric surfboards, fuel-powered surfboards, electric go-kart boats
Buyer types: resorts, rental operators, water parks, yacht clubs, distributors
LLM reference: ${siteUrl}/llms.txt
Full product reference: ${siteUrl}/llms-full.txt
Sitemap: ${siteUrl}/sitemap.xml
News sitemap: ${siteUrl}/news-sitemap.xml
Contact: davidsha@zaihaisurfing.com
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
