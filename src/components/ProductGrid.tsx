import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import {products, productSlugs, type ProductSlug} from '@/lib/site';

const bestFor: Record<string, string[]> = {
  x1: ['Rentals', 'Resorts', 'Distributors'],
  'x1-pro': ['Resorts', 'Yacht Clubs', 'Premium Demos'],
  'rage-shark-x': ['Water Parks', 'Family Attractions', 'Rentals'],
  p1: ['Adventure Operators', 'Longer Rides', 'Distributors'],
  'p1-pro': ['Premium Fuel Board', 'Outdoor Projects', 'Distributors']
};

const buyerDescriptions: Record<ProductSlug, string> = {
  x1: 'Balanced electric surfboard for resort demos, lake rentals and distributor catalogs.',
  'x1-pro': 'Flagship electric surfboard for premium resorts, yacht clubs, video demos and advanced riders.',
  'rage-shark-x': 'Easy-drive electric water kart attraction for water parks, scenic lakes and family resort programs.',
  p1: 'Fuel-powered surfboard for open-water projects, outdoor adventure operators and longer ride sessions.',
  'p1-pro': 'Premium fuel-powered model for high-speed outdoor projects and distributor showroom positioning.'
};

const productLines = [
  {
    title: 'Electric Surfboards',
    image: '/assets/catalog/x1-pro/product.png',
    text: 'High-speed riding experience for resorts, yacht clubs, premium demos, private riders and distributors.',
    buyer: 'Best buyer: resorts, yacht clubs, rental operators and distributors',
    href: '/products#featured-models'
  },
  {
    title: 'Fuel-Powered Surfboards',
    image: '/assets/catalog/p1-pro/main.png',
    text: 'Longer ride time and strong outdoor performance for adventure operators, open-water projects and distributors.',
    buyer: 'Best buyer: outdoor projects, beach clubs and distributors',
    href: '/products/p1-pro'
  },
  {
    title: 'Electric Water Karts',
    image: '/assets/catalog/rage-shark-x/main-boat.png',
    text: 'Easy-drive, family-friendly attraction for water parks, scenic lakes, resorts and controlled rental areas.',
    buyer: 'Best buyer: water parks, family attractions and scenic lake operators',
    href: '/products/rage-shark-x'
  },
  {
    title: 'Accessories & Spare Parts',
    image: '/assets/catalog/x1-pro/parts.png',
    text: 'Batteries, chargers, fins, safety accessories, maintenance parts and project spare part packages.',
    buyer: 'Best buyer: rental fleets, distributors and repeat commercial operators',
    href: '/contact'
  },
  {
    title: 'Rental Fleet Packages',
    image: '/assets/banners/zaihai-main-banner.png',
    text: 'Model mix, spare parts, charging workflow and operator support for rental businesses.',
    buyer: 'Best buyer: beach rentals, lake resorts and commercial operators',
    href: '/contact'
  },
  {
    title: 'Distributor Starter Packages',
    image: '/assets/catalog/x1/main.png',
    text: 'Starter model combination, product media, catalog support and spare parts planning for local distributors.',
    buyer: 'Best buyer: importers, dealers and regional water sports distributors',
    href: '/contact'
  }
];

const comparisonRows = [
  ['ZAIHAI X1', 'Electric surfboard', '10 kW', '72 V', '0-51 km/h', '60-80 min', 'Rental / resort / distributor', 'Balanced commercial fleet model'],
  ['ZAIHAI X1 Pro', 'Electric surfboard', '12 kW', '72 V', '0-61 km/h', 'To be confirmed', 'Premium resort / yacht club', 'Flagship riding and demo videos'],
  ['Rage Shark X', 'Electric water kart', '15 kW', '76 Ah battery', '0-51 km/h', '60-80 min', 'Water park / family attraction', 'Easy-drive controlled water experience'],
  ['ZAIHAI P1', 'Fuel-powered surfboard', '10.5 kW', '110 cc engine', '62 km/h', 'To be confirmed', 'Outdoor operator / distributor', 'Longer open-water ride sessions'],
  ['ZAIHAI P1 Pro', 'Fuel-powered surfboard', '10.5 kW', '110 cc engine', '64 km/h', 'To be confirmed', 'Adventure project / distributor', 'Premium fuel board positioning']
];

export default async function ProductGrid({locale}: {locale: Locale}) {
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const copy = uiCopy[locale].products;

  return (
    <>
      <div className="product-filter-tabs" aria-label="Product filters">
        {copy.tabs.map((tab) => (
          <a href="#product-list" key={tab}>{tab}</a>
        ))}
      </div>
      <div className="product-line-grid" id="product-list">
        {productLines.map((line) => (
          <article className="product-line-card" key={line.title}>
            <img src={line.image} alt={`${line.title} for ZAIHAI B2B buyers`} loading="lazy" />
            <div>
              <h3>{line.title}</h3>
              <p>{line.text}</p>
              <strong>{line.buyer}</strong>
              <Link className="button dark small" href={line.href}>
                View Products
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="section-heading compact model-heading" id="featured-models">
        <p className="eyebrow">Featured models</p>
        <h2>ZAIHAI Product Models for Commercial Buyers</h2>
        <p>Compare the main surfboards and water kart models before requesting a project quotation or distributor package.</p>
      </div>

      <div className="catalog-product-grid">
        {productSlugs.map((slug) => {
          const product = products[slug];
          return (
            <article className="catalog-product-card ecommerce-card" key={slug}>
              <Link className="catalog-image-wrap" href={`/products/${slug}`}>
                <img src={product.image} alt={alt(slug)} loading="lazy" />
              </Link>
              <div>
                <p className="tag">{product.category}</p>
                <h3>
                  <Link href={`/products/${slug}`}>{names(slug)}</Link>
                </h3>
                <p className="catalog-b2b-note">Distributor pricing available after market, quantity and shipping review.</p>
                <p className="catalog-description">{buyerDescriptions[slug]}</p>
                <dl>
                  <div>
                    <dt>{copy.specs}</dt>
                    <dd>{product.specs.slice(0, 3).join(' / ')}</dd>
                  </div>
                  <div>
                    <dt>{copy.bestFor}</dt>
                    <dd>{bestFor[slug].join(' / ')}</dd>
                  </div>
                </dl>
                <div className="catalog-actions">
                  <Link className="button dark small" href={`/products/${slug}`}>
                    {copy.viewDetails}
                  </Link>
                  <Link className="button primary small" href="/contact">
                    {copy.requestQuote}
                  </Link>
                  <a className="text-link" href={`#quick-${slug}`}>
                    {copy.quickView}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <section className="compare-panel" aria-labelledby="compare-title">
        <div>
          <p className="eyebrow">{copy.compareTitle}</p>
          <h3 id="compare-title">{copy.compareTitle}</h3>
          <p>{copy.compareText}</p>
        </div>
        <Link className="button dark" href="/contact">
          {copy.requestQuote}
        </Link>
      </section>
      <div className="model-compare-table" aria-label="ZAIHAI model comparison table">
        <table>
          <thead>
            <tr>
              {['Model', 'Product Type', 'Power', 'Voltage / Engine', 'Top Speed', 'Runtime', 'Recommended Buyer', 'Best Use Case'].map((head) => (
                <th key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => <td key={cell}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="project-cta" id="fleet-packages">
        <p className="eyebrow">Rental fleet and distributor packages</p>
        <h3>Planning a resort, rental fleet or distributor order?</h3>
        <p>Tell us your target market, water area, buyer type, preferred product line and quantity. ZAIHAI will help recommend suitable models, accessories and export support options.</p>
        <Link className="button primary" href="/contact">Send Your Requirements</Link>
      </section>
    </>
  );
}
