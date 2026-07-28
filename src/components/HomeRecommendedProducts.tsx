import {Link} from '@/i18n/navigation';
import {productSlugs, type ProductSlug} from '@/lib/site';
import {listRuntimeCatalogProducts} from '@/lib/catalogRuntime';

const productHighlights: Record<ProductSlug, string> = {
  x1: 'Balanced commercial electric surfboard for resort demos, lake rentals and distributors.',
  'x1-pro': 'Flagship 12 kW electric surfboard for premium resorts, yacht clubs and video demos.',
  'rage-shark-x': 'Easy-drive electric go-kart boat for water parks, scenic lakes and family attractions.',
  p1: 'Fuel-powered surfboard for open-water projects and longer outdoor ride sessions.',
  'p1-pro': 'Premium fuel-powered model for adventure operators and distributor showrooms.'
};

export const homeRecommendedSlugs = productSlugs;
const homeThumbs: Record<ProductSlug, string> = {
  x1: '/assets/catalog/home-thumbs/x1.webp',
  'x1-pro': '/assets/catalog/home-thumbs/x1-pro.webp',
  'rage-shark-x': '/assets/catalog/home-thumbs/rage-shark-x.webp',
  p1: '/assets/catalog/home-thumbs/p1.webp',
  'p1-pro': '/assets/catalog/home-thumbs/p1-pro.webp'
};

export default async function HomeRecommendedProducts() {
  // Every published retail SKU belongs in the home catalog. The admin flag remains
  // available for future promotional modules, but must not hide core products here.
  const runtimeProducts = await listRuntimeCatalogProducts(homeRecommendedSlugs);
  return (
    <section className="home-recommend-products" aria-labelledby="home-recommend-products-title">
      <div className="section-heading centered">
        <p className="eyebrow">ZAIHAI SURFING</p>
        <h2 id="home-recommend-products-title">Recommended Products</h2>
        <p>Explore our main electric surfboards, electric go-kart boat and fuel-powered surfboard models for commercial buyers.</p>
      </div>
      <div className="home-recommend-grid">
        {runtimeProducts.map((product) => {
          const slug = product.slug as ProductSlug;
          return (
            <article className="home-recommend-card" key={slug}>
              <Link className="home-recommend-image" href={`/products/${slug}`} aria-label={`View ${product.name}`} prefetch={false}>
                <img src={homeThumbs[slug] || product.thumbnail} alt={`${product.name} recommended product`} loading="lazy" decoding="async" width="220" height="220" />
              </Link>
              <div className="home-recommend-body">
                <span className="tag">{product.category}</span>
                <Link className="home-recommend-title" href={`/products/${slug}`} prefetch={false}>{product.name}</Link>
                <em>{product.specs.slice(0, 3).join(' / ')}</em>
                <strong className="home-recommend-price">{product.price}</strong>
                <span>{productHighlights[slug]}</span>
                <div className="home-recommend-actions">
                  <Link className="button primary small" href={`/checkout?product=${slug}&qty=1`} prefetch={false}>Buy Now</Link>
                  <Link className="button dark small" href={`/products/${slug}`} prefetch={false}>View Details</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
