import {Link} from '@/i18n/navigation';
import {products, productSlugs, type ProductSlug} from '@/lib/site';

const productHighlights: Record<ProductSlug, string> = {
  x1: 'Balanced commercial electric surfboard for resort demos, lake rentals and distributors.',
  'x1-pro': 'Flagship 12 kW electric surfboard for premium resorts, yacht clubs and video demos.',
  'rage-shark-x': 'Easy-drive electric go-kart boat for water parks, scenic lakes and family attractions.',
  p1: 'Fuel-powered surfboard for open-water projects and longer outdoor ride sessions.',
  'p1-pro': 'Premium fuel-powered model for adventure operators and distributor showrooms.'
};

const recommendedSlugs = productSlugs.slice(0, 8);

export default function HomeRecommendedProducts() {
  return (
    <section className="home-recommend-products" aria-labelledby="home-recommend-products-title">
      <div className="section-heading centered">
        <p className="eyebrow">ZAIHAI SURFING</p>
        <h2 id="home-recommend-products-title">推荐产品</h2>
        <p>Explore our main electric surfboards, electric go-kart boat and fuel-powered surfboard models for commercial buyers.</p>
      </div>
      <div className="home-recommend-grid">
        {recommendedSlugs.map((slug) => {
          const product = products[slug];
          return (
            <Link className="home-recommend-card" href={`/products/${slug}`} key={slug}>
              <span className="home-recommend-image">
                <img src={product.image} alt={`${product.name} recommended product`} loading="lazy" />
              </span>
              <span className="home-recommend-body">
                <span className="tag">{product.category}</span>
                <strong>{product.name}</strong>
                <em>{product.specs.slice(0, 3).join(' / ')}</em>
                <span>{productHighlights[slug]}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
