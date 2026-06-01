import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import {products, productSlugs} from '@/lib/site';

const bestFor: Record<string, string[]> = {
  x1: ['Rentals', 'Resorts', 'Distributors'],
  'x1-pro': ['Resorts', 'Yacht Clubs', 'Premium Demos'],
  'rage-shark-x': ['Water Parks', 'Family Attractions', 'Rentals'],
  p1: ['Adventure Operators', 'Longer Rides', 'Distributors'],
  'p1-pro': ['Premium Fuel Board', 'Outdoor Projects', 'Distributors']
};

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
      <div className="catalog-product-grid" id="product-list">
        {productSlugs.map((slug) => {
          const product = products[slug];
          const compareAt = Math.round(product.priceAmount * 1.18 / 100) * 100;
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
                <div className="catalog-price-row">
                  <strong>{product.price}</strong>
                  <span>USD {compareAt.toLocaleString()}</span>
                </div>
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
    </>
  );
}
