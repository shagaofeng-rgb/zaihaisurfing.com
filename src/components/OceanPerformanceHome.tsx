import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import HomeRidingVideo from './HomeRidingVideo';

type OceanPerformanceHomeProps = {
  locale: Locale;
};

const productCategories = [
  {eyebrow: '01 / ELECTRIC', title: 'Electric\nSurfboards', description: 'Quiet power for a fresh kind of ride.', href: '/products/x1-pro', image: '/assets/catalog/collection-electric-surfboard.png', alt: 'ZAIHAI electric surfboard'},
  {eyebrow: '02 / ELECTRIC', title: 'Electric\nGo-Kart Boats', description: 'A compact water attraction built for sharing.', href: '/products/rage-shark-x', image: '/assets/catalog/collection-go-kart-boat.png', alt: 'ZAIHAI electric go-kart boat'},
  {eyebrow: '03 / FUEL', title: 'Fuel-Powered\nSurfboards', description: 'Direct, high-energy performance on open water.', href: '/products/p1-pro', image: '/assets/catalog/collection-fuel-surfboard.png', alt: 'ZAIHAI fuel-powered surfboard'}
];

export default function OceanPerformanceHome({locale}: OceanPerformanceHomeProps) {
  const copy = uiCopy[locale];

  return (
    <main className="ocean-home">
      <section className="ocean-hero" id="top" aria-labelledby="ocean-hero-title">
        <img className="ocean-hero-image" src="/assets/home-ocean/hero-rider.jpg" alt="Rider on a black electric surfboard crossing a dark blue ocean" width="2048" height="1152" fetchPriority="high" decoding="async" />
        <div className="ocean-hero-scrim" aria-hidden="true" />
        <div className="ocean-shell ocean-hero-content">
          <p className="ocean-kicker">ZAIHAI SURFING / SINCE 2014</p>
          <h1 id="ocean-hero-title">Electric surfboards<br />for a brighter tomorrow</h1>
          <p className="ocean-hero-intro">Purpose-built electric surfboards, water karts and commercial support for the people building more time on the water.</p>
          <div className="ocean-hero-actions">
            <Link className="ocean-button ocean-button-lime" href="/contact">Build your fleet</Link>
            <HomeRidingVideo />
          </div>
        </div>
        <div className="ocean-shell ocean-proof" aria-label="ZAIHAI advantages">
          <article><span>01</span><h2>Proven performance</h2><p>Engineered for repeated real-world riding.</p></article>
          <article><span>02</span><h2>Built for business</h2><p>Flexible product choices for operators and partners.</p></article>
          <article><span>03</span><h2>Global support</h2><p>Practical product, logistics and after-sales guidance.</p></article>
        </div>
      </section>

      <section className="ocean-products" aria-labelledby="ocean-products-title">
        <div className="ocean-shell ocean-products-head">
          <div><p className="ocean-kicker">THE ZAIHAI RANGE</p><h2 id="ocean-products-title">Three ways to create<br />more on the water</h2></div>
          <Link href="/products" className="ocean-text-link">View all products <span aria-hidden="true">→</span></Link>
        </div>
        <div className="ocean-shell ocean-product-grid">
          {productCategories.map((product) => (
            <Link className="ocean-product-card" href={product.href} key={product.title} prefetch={false}>
              <p>{product.eyebrow}</p>
              <div className="ocean-product-image-wrap"><img src={product.image} alt={product.alt} width="1254" height="1254" loading="eager" decoding="async" /></div>
              <h3>{product.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h3>
              <div className="ocean-product-meta"><span>{product.description}</span><span aria-hidden="true">→</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ocean-partners" aria-labelledby="ocean-partners-title">
        <div className="ocean-shell ocean-partners-grid">
          <div className="ocean-partners-copy">
            <p className="ocean-kicker">OEM / DISTRIBUTOR / OPERATOR</p>
            <h2 id="ocean-partners-title">Built to grow<br />together</h2>
            <p>Bring a clear commercial idea. We will help you select the right water products and connect the next practical steps for your project.</p>
            <Link href="/factory#oem-distributor" className="ocean-button ocean-button-dark">Explore partnership</Link>
            <dl className="ocean-partner-facts">
              <div><dt>OEM</dt><dd>Customization options</dd></div>
              <div><dt>GLOBAL</dt><dd>Export-ready support</dd></div>
              <div><dt>PROJECT</dt><dd>Fleet planning</dd></div>
              <div><dt>DIRECT</dt><dd>Factory connection</dd></div>
            </dl>
          </div>
          <div className="ocean-partners-image"><img src="/assets/home-ocean/export-support.jpg" alt="Water sports equipment prepared for export at a waterside logistics dock" width="2048" height="1152" loading="lazy" decoding="async" /></div>
        </div>
      </section>

      <section className="ocean-closing">
        <div className="ocean-shell ocean-closing-inner"><p className="ocean-kicker">READY WHEN YOU ARE</p><h2>Make more<br />of the water.</h2><Link className="ocean-button ocean-button-lime" href="/contact">{copy.nav.quote}</Link></div>
      </section>
    </main>
  );
}
