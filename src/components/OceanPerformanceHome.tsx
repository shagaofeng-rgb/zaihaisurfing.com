import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import HomeRidingVideo from './HomeRidingVideo';

type OceanPerformanceHomeProps = {
  locale: Locale;
};

const productCategories = [
  {title: 'Electric Surfboards', description: 'Silent. Powerful. Easy to operate.', href: '/products/x1-pro', image: '/assets/home-ocean/products/electric-surfboard.webp', alt: 'ZAIHAI electric surfboard', specs: [['50+', 'min runtime'], ['Up to 55 km/h', 'top speed'], ['Multiple models', 'for rental & resort']]},
  {title: 'Electric Go-Kart Boats', description: 'Fun for everyone. Built for business.', href: '/products/rage-shark-x', image: '/assets/home-ocean/products/go-kart-boat.webp', alt: 'ZAIHAI electric go-kart boat', specs: [['2–4', 'seats'], ['Up to 30 km/h', 'top speed'], ['Stable design', 'for family & resort']]},
  {title: 'Fuel-Powered Surfboards', description: 'Pro performance. No limits.', href: '/products/p1-pro', image: '/assets/home-ocean/products/fuel-surfboard.webp', alt: 'ZAIHAI fuel-powered surfboard', specs: [['Up to 80 km/h', 'top speed'], ['Long range', 'for extended use'], ['Pro-level', 'for experienced riders']]}
];

export default function OceanPerformanceHome({locale}: OceanPerformanceHomeProps) {
  const copy = uiCopy[locale];

  return (
    <main className="ocean-home">
      <section className="ocean-hero" id="top" aria-labelledby="ocean-hero-title">
        <picture className="ocean-hero-picture">
          <source media="(max-width: 760px)" srcSet="/assets/home-ocean/hero-template-one-mobile.webp" />
          <img className="ocean-hero-image" src="/assets/home-ocean/hero-template-one-desktop.webp" alt="Rider on a black electric surfboard crossing a mountain lake" width="2048" height="1152" fetchPriority="high" decoding="async" />
        </picture>
        <div className="ocean-hero-scrim" aria-hidden="true" />
        <div className="ocean-shell ocean-hero-content">
          <p className="ocean-kicker">Premium ocean sports equipment</p>
          <h1 id="ocean-hero-title">Electric surfboards<br />for a brighter tomorrow</h1>
          <p className="ocean-hero-intro">ZAIHAI helps resorts, rental operators, yacht clubs and distributors build high-attraction water entertainment projects with electric surfboards, fuel-powered surfboards and electric go-kart boats.</p>
          <div className="ocean-hero-actions">
            <Link className="ocean-button ocean-button-lime" href="/contact">Build your fleet</Link>
            <HomeRidingVideo />
          </div>
        </div>
        <p className="ocean-hero-note" aria-hidden="true">Clean energy<br />more possibilities</p>
        <div className="ocean-shell ocean-proof" aria-label="ZAIHAI advantages">
          <article><h2>Proven Performance</h2><p>Stable. Powerful. Fun.</p></article>
          <article><h2>Built for Business</h2><p>Higher guest attraction</p></article>
          <article><h2>Global Support</h2><p>OEM · Distributor · Export</p></article>
        </div>
      </section>

      <section className="ocean-products" aria-labelledby="ocean-products-title">
        <div className="ocean-shell ocean-products-head">
          <div><p className="ocean-kicker">Product lineup</p><h2 id="ocean-products-title">Three ways to<br />create more on the water</h2></div>
          <div className="ocean-products-aside"><p>Reliable equipment.<br />Higher utilization.<br />Stronger business.</p><Link href="/products" className="ocean-text-link">Explore all products <span aria-hidden="true">→</span></Link></div>
        </div>
        <div className="ocean-shell ocean-product-grid">
          {productCategories.map((product) => (
            <Link className="ocean-product-card" href={product.href} key={product.title} prefetch={false}>
              <div className="ocean-product-image-wrap"><img src={product.image} alt={product.alt} width="1254" height="1254" loading="eager" decoding="async" /></div>
              <h3>{product.title}</h3>
              <p className="ocean-product-description">{product.description}</p>
              <dl className="ocean-product-specs">{product.specs.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
              <p className="ocean-product-link">View {product.title} <span aria-hidden="true">→</span></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="ocean-partners" aria-labelledby="ocean-partners-title">
        <div className="ocean-shell ocean-partner-stats" aria-label="ZAIHAI partnership statistics">
          <div><strong>50+</strong><span>Countries<br />and regions</span></div>
          <div><strong>200+</strong><span>Business<br />partners</span></div>
          <div><strong>OEM</strong><span>Customization<br />supported</span></div>
          <div><strong>Global</strong><span>Export experience</span></div>
        </div>
        <div className="ocean-shell ocean-partners-grid">
          <div className="ocean-partners-copy">
            <p className="ocean-kicker">OEM &amp; Global partner</p>
            <h2 id="ocean-partners-title">Built to grow<br />together</h2>
            <p>From product customization to global shipping, ZAIHAI supports resorts, rental fleets, yacht clubs and distributors with reliable supply and dedicated service.</p>
            <Link href="/factory#oem-distributor" className="ocean-button ocean-button-dark">OEM &amp; Distributor Programs <span aria-hidden="true">→</span></Link>
          </div>
          <div className="ocean-partners-image"><img src="/assets/home-ocean/export-support.jpg" alt="Water sports equipment prepared for export at a waterside logistics dock" width="2048" height="1152" loading="lazy" decoding="async" /><p>From our factory<br />to a brighter<br />coastline</p></div>
        </div>
      </section>

      <section className="ocean-closing">
        <div className="ocean-shell ocean-closing-inner"><p className="ocean-kicker">READY WHEN YOU ARE</p><h2>Make more<br />of the water.</h2><Link className="ocean-button ocean-button-lime" href="/contact">{copy.nav.quote}</Link></div>
      </section>
    </main>
  );
}
