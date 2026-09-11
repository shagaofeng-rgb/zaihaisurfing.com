import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';

type ResortPartnershipHomeProps = {
  locale: Locale;
};

const whatsappUrl = 'https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0';

const businessModels = [
  {title: 'Resorts', text: 'Create memorable waterfront activities for your guests.', href: '/applications', image: '/assets/banners/market-asia-optimized.jpg', alt: 'Island resort beside blue water'},
  {title: 'Rental Businesses', text: 'Build an easy-to-operate water attraction fleet.', href: '/applications', image: '/assets/banners/market-north-america-optimized.jpg', alt: 'Water sports activity at a lakeside destination'},
  {title: 'Distributors & Yacht Clubs', text: 'Grow with a product range designed for commercial buyers.', href: '/factory#oem-distributor', image: '/assets/banners/market-middle-east-optimized.jpg', alt: 'Yacht marina and waterfront destination'}
];

const productCategories = [
  {title: 'Electric Surfboards', text: 'Silent. Powerful. Premium.', href: '/products/x1-pro', image: '/assets/catalog/home-thumbs/x1-pro.webp', alt: 'ZAIHAI X1 Pro electric surfboard'},
  {title: 'Electric Go-Kart Boats', text: 'Fun for everyone. Built for business.', href: '/products/rage-shark-x', image: '/assets/catalog/home-thumbs/rage-shark-x.webp', alt: 'ZAIHAI Rage Shark X electric go-kart boat'},
  {title: 'Fuel-Powered Surfboards', text: 'Pro performance. No limits.', href: '/products/p1-pro', image: '/assets/catalog/home-thumbs/p1-pro.webp', alt: 'ZAIHAI P1 Pro fuel-powered surfboard'}
];

export default function ResortPartnershipHome({locale}: ResortPartnershipHomeProps) {
  const copy = uiCopy[locale];

  return (
    <main className="resort-home">
      <section className="resort-hero" id="top" aria-labelledby="resort-hero-title">
        <div className="resort-hero-copy">
          <p className="resort-kicker">Water experiences. Real business value.</p>
          <h1 id="resort-hero-title">Complete Water Attraction Solutions for Resorts &amp; Partners</h1>
          <p className="resort-hero-intro">ZAIHAI brings electric surfboards, fuel-powered surfboards and electric go-kart boats together with the support your operation needs.</p>
          <div className="resort-hero-actions">
            <Link className="resort-button resort-button-primary" href="/contact">{copy.nav.quote}</Link>
            <Link className="resort-button resort-button-secondary" href="/products">{copy.hero.shop}</Link>
          </div>
          <ul className="resort-proof-list" aria-label="ZAIHAI buyer support">
            <li>Commercial-ready equipment</li><li>Project and operation support</li><li>Global shipping assistance</li>
          </ul>
          <p className="resort-script">More guests<br />on the water</p>
          <p className="resort-script-caption">A brighter tomorrow</p>
        </div>
        <div className="resort-hero-media">
          <img src="/assets/home-resort/resort-hero-rider.jpg" alt="Rider enjoying an electric surfboard near a tropical resort" width="1122" height="1402" fetchPriority="high" decoding="async" />
          <p className="resort-hero-label">Resorts<br />Rentals<br />Yacht clubs<br />Distributors</p>
        </div>
      </section>

      <section className="resort-section resort-business" aria-labelledby="business-model-title">
        <div className="resort-section-head resort-business-head">
          <div><p className="resort-kicker">Choose your business model</p><h2 id="business-model-title">Different Goals.<br />One Trusted Partner.</h2></div>
          <p>Whether you run a resort, a rental business, a yacht club or a distribution network, ZAIHAI helps you plan a water experience that fits your operation.</p>
        </div>
        <div className="resort-business-grid">
          {businessModels.map((model) => (
            <Link className="resort-business-card" href={model.href} key={model.title} prefetch={false}>
              <img src={model.image} alt={model.alt} width="1100" height="733" loading="lazy" decoding="async" />
              <div><h3>{model.title}</h3><p>{model.text}</p><span>Explore</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="resort-section resort-partnership" aria-labelledby="partnership-title">
        <article className="resort-equipment-image">
          <img src="/assets/catalog/rage-shark-x/hero-angle.png" alt="ZAIHAI electric go-kart boat ready for commercial water activities" width="1200" height="800" loading="lazy" decoding="async" />
          <p>Proven equipment<br />for real-world operations</p>
        </article>
        <div className="resort-partnership-copy">
          <h2 id="partnership-title">From Planning<br />to Performance</h2>
          <p>From product selection and layout planning to training, after-sales support and long-term partnership, our team is ready to help.</p>
          <ul><li>Site consultation and fleet planning</li><li>Training and operation guidance</li><li>Spare parts and after-sales support</li><li>Shipping and documentation support</li></ul>
          <Link href="/factory" className="resort-inline-link">Our partnership services</Link>
        </div>
        <div className="resort-video-quote">
          <div className="resort-video-card" id="riding-video">
            <video controls muted loop playsInline preload="none" poster="/assets/banners/zaihai-video-poster-card.jpg" aria-label="ZAIHAI electric surfboard riding video" width="640" height="360"><source src="/assets/banners/zaihai-video-home-faststart.mp4" type="video/mp4" /></video>
            <p>Watch the riding video</p>
          </div>
          <blockquote>“Reliable equipment.<br />Happier guests.<br />A stronger business.”<cite>ZAIHAI SURFING</cite></blockquote>
        </div>
      </section>

      <section className="resort-section resort-products" aria-labelledby="core-products-title">
        <div className="resort-products-head">
          <div><p className="resort-kicker">Explore our core products</p><h2 id="core-products-title">Three Proven Categories<br />for Expanding Water Fun</h2></div>
          <Link href="/products" className="resort-inline-link">View all products</Link>
        </div>
        <div className="resort-category-grid">
          {productCategories.map((category) => (
            <Link className="resort-category-card" href={category.href} key={category.title} prefetch={false}>
              <img src={category.image} alt={category.alt} width="440" height="300" loading="lazy" decoding="async" />
              <div><h3>{category.title}</h3><p>{category.text}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="resort-project" aria-labelledby="project-title">
        <div className="resort-project-image"><img src="/assets/banners/market-asia-optimized.jpg" alt="Tropical resort destination by the water" width="1100" height="733" loading="lazy" decoding="async" /><p>Real partnerships.<br />Brighter destinations.</p></div>
        <div className="resort-project-copy">
          <h2 id="project-title">Let&apos;s Build Your<br />Water Attraction Project</h2>
          <p>Talk to our team about your resort, rental fleet, yacht club or distribution opportunity.</p>
          <div className="resort-project-actions"><Link className="resort-button resort-button-primary" href="/contact">{copy.nav.quote}</Link><a className="resort-button resort-button-secondary" data-whatsapp-placement="home_resort_project" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></div>
        </div>
      </section>
    </main>
  );
}
