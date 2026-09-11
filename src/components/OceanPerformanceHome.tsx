import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import HomeRidingVideo from './HomeRidingVideo';

type OceanPerformanceHomeProps = {
  locale: Locale;
};

const productCategories = [
  {title: 'Electric Surfboards', description: 'Silent Power. Pure Freedom.', href: '/products/x1-pro', image: '/assets/home-ocean/resort-electric.webp', alt: 'Black electric surfboard above a water spray'},
  {title: 'Electric Go-Kart Boats', description: 'Fun for Everyone. Built for Business.', href: '/products/rage-shark-x', image: '/assets/home-ocean/resort-kart.webp', alt: 'Blue electric go-kart boat on water'},
  {title: 'Fuel-Powered Surfboards', description: 'Pro Performance. No Limits.', href: '/products/p1-pro', image: '/assets/home-ocean/resort-fuel.webp', alt: 'Black and neon yellow fuel-powered surfboard'}
];

export default function OceanPerformanceHome({locale}: OceanPerformanceHomeProps) {
  const copy = uiCopy[locale];

  return (
    <main className="ocean-home ocean-resort-home">
      <section className="resort-hero" id="top" aria-labelledby="resort-hero-title">
        <picture className="resort-hero-picture">
          <source media="(max-width: 760px)" srcSet="/assets/home-ocean/resort-hero-mobile.webp" />
          <img src="/assets/home-ocean/resort-hero.webp" alt="Rider on a black electric surfboard against a tropical mountain coast" width="2048" height="1152" fetchPriority="high" decoding="async" />
        </picture>
        <div className="resort-hero-shade" aria-hidden="true" />
        <div className="ocean-shell resort-hero-copy">
          <p className="ocean-kicker">Powering memorable water experiences</p>
          <h1 id="resort-hero-title">More thrills<br />for your resort.<br /><em>A stronger<br />business tomorrow.</em></h1>
          <p className="resort-hero-intro">Electric surfboards, go-kart boats and fuel-powered boards for resorts, rental fleets and distributors worldwide.</p>
          <div className="resort-hero-actions">
            <Link className="ocean-button ocean-button-lime" href="/contact">Get a quote <span aria-hidden="true">→</span></Link>
            <HomeRidingVideo />
          </div>
        </div>
        <div className="ocean-shell resort-business-fit" aria-label="Business applications">
          <p>Built for your business</p>
          <div>
            <article><h2>Resorts</h2><span>Attract more guests</span></article>
            <article><h2>Rental fleets</h2><span>Maximize utilization</span></article>
            <article><h2>Distributors</h2><span>Grow with a trusted brand</span></article>
          </div>
        </div>
        <p className="resort-hero-script" aria-hidden="true">Ride<br />a Brighter Tomorrow</p>
      </section>

      <section className="resort-products" aria-label="ZAIHAI product categories">
        <div className="ocean-shell resort-product-grid">
          {productCategories.map((product) => (
            <Link className="resort-product-card" href={product.href} key={product.title} prefetch={false}>
              <div className="resort-product-image"><img src={product.image} alt={product.alt} width="1456" height="1088" loading="eager" decoding="async" /></div>
              <h2>{product.title}</h2>
              <p>{product.description}<span aria-hidden="true">→</span></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="resort-results" aria-labelledby="resort-results-title">
        <div className="ocean-shell resort-results-grid">
          <div className="resort-results-copy">
            <p className="resort-overline">Real-world results</p>
            <h2 id="resort-results-title">Proven by operators<br />around the world.</h2>
            <p>ZAIHAI equipment helps resorts and rental businesses deliver higher guest satisfaction, longer session times and stronger revenue.</p>
            <dl>
              <div><dt>+40%</dt><dd>Longer guest sessions</dd></div>
              <div><dt>+35%</dt><dd>Higher repeat rate</dd></div>
              <div><dt>+50+</dt><dd>Global resort partners</dd></div>
            </dl>
            <Link href="/factory#oem-distributor" className="resort-outline-link">OEM &amp; Distributor Programs <span aria-hidden="true">→</span></Link>
          </div>
          <Link className="resort-feature-card" href="/products/x1-pro" prefetch={false}>
            <img src="/assets/home-ocean/hero-template-one-desktop.webp" alt="Electric surfboard rider on a mountain lake" width="2048" height="1152" loading="lazy" decoding="async" />
            <div><p>Featured product</p><h2>Electric<br />Surfboards</h2><span>Reliable. Easy to operate.<br />Built for high-traffic rentals.</span><b>Explore Electric Surfboards <i aria-hidden="true">→</i></b></div>
            <small>01 / 03</small>
          </Link>
        </div>
      </section>

      <section className="resort-closing">
        <div className="ocean-shell"><p>Ocean connects people <span>/</span> ZAIHAI powers opportunity</p></div>
      </section>

      <section className="ocean-closing">
        <div className="ocean-shell ocean-closing-inner"><p className="ocean-kicker">Ready when you are</p><h2>Make more<br />of the water.</h2><Link className="ocean-button ocean-button-lime" href="/contact">{copy.nav.quote}</Link></div>
      </section>
    </main>
  );
}
