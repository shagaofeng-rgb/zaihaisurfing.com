import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {products, productSlugs} from '@/lib/site';

export default async function ProductGrid({locale}: {locale: Locale}) {
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <div className="catalog-product-grid">
      {productSlugs.map((slug) => {
        const product = products[slug];
        return (
          <article className="catalog-product-card" key={slug}>
            <Link href={`/products/${slug}`}>
              <img src={product.image} alt={alt(slug)} />
            </Link>
            <div>
              <p className="tag">{product.category}</p>
              <h3>
                <Link href={`/products/${slug}`}>{names(slug)}</Link>
              </h3>
              <dl>
                <div>
                  <dt>Price</dt>
                  <dd>{product.price}</dd>
                </div>
                <div>
                  <dt>Specs</dt>
                  <dd>{product.specs.slice(0, 2).join(' / ')}</dd>
                </div>
              </dl>
              <Link className="text-link" href={`/products/${slug}`}>
                {common('viewDetails')}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
