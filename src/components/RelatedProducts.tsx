import {Link} from '@/i18n/navigation';
import {products, type ProductSlug} from '@/lib/site';

const recommendationMap: Record<ProductSlug, ProductSlug[]> = {
  x1: ['x1-pro', 'rage-shark-x', 'p1-pro'],
  'x1-pro': ['rage-shark-x', 'x1', 'p1-pro'],
  'rage-shark-x': ['x1-pro', 'x1', 'p1'],
  p1: ['p1-pro', 'x1-pro', 'rage-shark-x'],
  'p1-pro': ['p1', 'x1-pro', 'rage-shark-x']
};

type RelatedProductsProps = {
  currentSlug: ProductSlug;
};

export default function RelatedProducts({currentSlug}: RelatedProductsProps) {
  const related = recommendationMap[currentSlug];

  return (
    <section className="related-products" aria-labelledby="related-products-title">
      <div className="section-heading compact">
        <p className="eyebrow">Recommended next</p>
        <h2 id="related-products-title">Explore More Water Sports Models</h2>
        <p>Compare a second ride option for resort packages, rental fleets or distributor catalogs.</p>
      </div>
      <div className="related-grid">
        {related.map((slug) => {
          const product = products[slug];
          return (
            <Link className="related-card" href={`/products/${slug}`} key={slug}>
              <img src={product.thumbnail} alt={`${product.name} product recommendation`} />
              <div>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.specs.slice(0, 3).join(' / ')}</p>
                <strong>{product.price}</strong>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
