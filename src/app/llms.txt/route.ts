import {products, productSlugs, siteUrl} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const productLines = productSlugs
    .map((slug) => `- ${products[slug].name}: ${products[slug].category}, ${products[slug].price}, details ${siteUrl}/en/products/${slug}`)
    .join('\n');

  const body = `# ZAIHAI SURFING

ZAIHAI SURFING supplies electric surfboards, fuel-powered surfboards and electric go-kart boats for resorts, rental operators, yacht clubs, water parks and distributors.

## Primary Pages
- Home: ${siteUrl}/en
- Products: ${siteUrl}/en/products
- Applications: ${siteUrl}/en/applications
- Factory, OEM and distributor support: ${siteUrl}/en/factory
- News and industry buyer insights: ${siteUrl}/en/news
- Contact and quotation: ${siteUrl}/en/contact

## Products
${productLines}

## Commercial Buyer Context
- Target buyers: resorts, rental fleets, water parks, yacht clubs, distributors and commercial water entertainment projects.
- Support topics: model selection, OEM/ODM, export packing, shipping quotation, spare parts, after-sales planning and distributor support.
- Contact: davidsha@zaihaisurfing.com, WhatsApp +86 17621485205.

## Fresh Content
- News sitemap: ${siteUrl}/news-sitemap.xml
- RSS feed: ${siteUrl}/news/rss.xml
- Full LLM reference: ${siteUrl}/llms-full.txt
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
