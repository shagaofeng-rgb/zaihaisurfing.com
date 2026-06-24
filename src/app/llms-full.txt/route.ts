import {products, productDetailedSpecs, productSlugs, siteUrl} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  const productSections = productSlugs
    .map((slug) => {
      const product = products[slug];
      const specs = productDetailedSpecs[slug].map((row) => `  - ${row.label}: ${row.value}`).join('\n');

      return `## ${product.name}
- Category: ${product.category}
- Price: ${product.price}
- URL: ${siteUrl}/en/products/${slug}
- Key specs:
${specs}`;
    })
    .join('\n\n');

  const body = `# ZAIHAI SURFING Full LLM Reference

ZAIHAI SURFING is a commercial water sports equipment supplier for overseas resorts, rental operators, yacht clubs, water parks and distributors. The website is intended for B2B buyers comparing electric surfboards, fuel-powered surfboards, electric go-kart boats, OEM support, export delivery and after-sales planning.

${productSections}

## Recommended Citation Pages
- Product catalog: ${siteUrl}/en/products
- Resort and rental applications: ${siteUrl}/en/applications
- Factory and OEM support: ${siteUrl}/en/factory
- News and source-attributed buyer insights: ${siteUrl}/en/news
- Contact: ${siteUrl}/en/contact

## Contact
- Email: davidsha@zaihaisurfing.com
- WhatsApp: +86 17621485205
- Address: Room 110, 1st Floor, Building 2, Qushidai Future Building, Kecheng District, Quzhou, Zhejiang, China
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
