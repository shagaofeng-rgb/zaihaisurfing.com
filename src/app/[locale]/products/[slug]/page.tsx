import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import RelatedProducts from '@/components/RelatedProducts';
import ShareButtons from '@/components/ShareButtons';
import {localizedMetadata} from '@/lib/metadata';
import {productSlugs, products, type ProductSlug} from '@/lib/site';
import {uiCopy} from '@/lib/uiCopy';

const productGalleries: Record<ProductSlug, string[]> = {
  x1: ['/assets/catalog/x1/main.png', '/assets/catalog/x1/product.png', '/assets/catalog/x1/parameters.png', '/assets/catalog/x1/parts.png'],
  'x1-pro': ['/assets/catalog/x1-pro/main.png', '/assets/catalog/x1-pro/product.png', '/assets/catalog/x1-pro/parameters.png', '/assets/catalog/x1-pro/parts.png'],
  'rage-shark-x': ['/assets/catalog/rage-shark-x/main.png', '/assets/catalog/rage-shark-x/main-boat.png', '/assets/catalog/rage-shark-x/front.png', '/assets/catalog/rage-shark-x/side.png'],
  p1: ['/assets/catalog/p1/main.png', '/assets/catalog/p1/hero.png', '/assets/catalog/p1/detail.png', '/assets/catalog/p1/bottom.png'],
  'p1-pro': ['/assets/catalog/p1-pro/main.png', '/assets/catalog/p1-pro/product.png', '/assets/catalog/p1-pro/scene-01.png', '/assets/catalog/p1-pro/scene-02.png']
};

const productContent: Record<ProductSlug, {
  intro: string;
  badges: string[];
  sellingPoints: string[];
  useCases: string[];
  receive: string[];
  support: string[];
  inspection: string[];
}> = {
  x1: {
    intro: 'ZAIHAI X1 is a commercial electric surfboard for rental fleets, resort water sports centers and distributors who need a balanced model with approachable speed, stable endurance and clear accessory packaging.',
    badges: ['Rental fleet choice', '10 kW electric drive', '60-80 min endurance'],
    sellingPoints: ['Balanced speed and endurance', 'Easy commercial fleet positioning', 'Clear accessory package', 'Spare battery planning support'],
    useCases: ['Resort demos', 'Lake rental business', 'Distributor showroom', 'Private premium riders'],
    receive: ['X1 electric surfboard package with battery, charger and standard accessories.', 'Balanced performance for first-time electric surfboard buyers and rental operators.', 'Clear product media and specification support for distributor catalog listing.'],
    support: ['Recommended for lake resorts, beach clubs, marina rentals and entry-level premium water sports programs.', 'Optional color, logo and package discussion for distributors and project buyers.', 'Sales support for spare battery planning, charger quantity and operator training notes.'],
    inspection: ['Battery, charger, board surface and accessory set are checked before packing.', 'Export packaging photos and packing list can be provided before shipment.', 'Shipping documents are prepared according to destination and forwarder requirements.']
  },
  'x1-pro': {
    intro: 'ZAIHAI X1 Pro is built for higher-impact riding, premium resort demonstrations and buyers who need stronger performance for videos, advanced riders and flagship product displays.',
    badges: ['Flagship model', '12 kW high output', 'IP67 waterproof'],
    sellingPoints: ['Higher-impact riding performance', 'Premium visual attraction', 'Resort and yacht-club demo value', 'OEM/ODM branding support'],
    useCases: ['Premium resort demos', 'Yacht clubs', 'Distributor flagship display', 'Advanced riders'],
    receive: ['X1 Pro surfboard package with upgraded power system and matched accessories.', 'Premium visual impact for resorts, yacht clubs, promotional videos and distributor showrooms.', 'Detailed parameter sheets and product photos for commercial sales presentations.'],
    support: ['Best for high-end resort demos, private clubs, advanced rental packages and premium distributors.', 'Model comparison support when pairing X1 Pro with X1 or Rage Shark X in one catalog.', 'Advice on batteries, spare parts and rider safety accessories for commercial operations.'],
    inspection: ['Power system, waterproof areas, battery mounting and accessories are checked before shipment.', 'Pre-shipment photo confirmation and packing review can be shared with the buyer.', 'Export documentation support includes packing list, shipping size and lithium battery notes.']
  },
  'rage-shark-x': {
    intro: 'Rage Shark X is an electric water kart boat designed for scenic attractions, water parks, family-friendly resort activities and operators who want an easy-drive product with strong visual appeal.',
    badges: ['Family attraction', 'Electric water kart', 'Easy to operate'],
    sellingPoints: ['Easy-drive guest experience', 'Family-friendly attraction', 'Controlled water area fit', 'Fleet operation support'],
    useCases: ['Water parks', 'Scenic lakes', 'Family resort programs', 'Rental attractions'],
    receive: ['Rage Shark X water kart boat with matched electric system and standard accessory package.', 'Beginner-friendly ride experience for families, scenic lakes, resorts and water parks.', 'Commercial product images and specification references for ticketing or rental promotion.'],
    support: ['Suitable for operators who want faster guest turnover and lower learning difficulty than surfboards.', 'Fleet planning support for charging workflow, guest route and operating area.', 'Distributor support for positioning Rage Shark X as a water attraction product line.'],
    inspection: ['Hull appearance, steering, power system and accessory packing are checked before delivery.', 'Packaging and loading photos can be supplied before export.', 'Shipping plan can be coordinated for sample review or multi-unit fleet orders.']
  },
  p1: {
    intro: 'ZAIHAI P1 is a fuel-powered surfboard for outdoor adventure operators and buyers who need longer running time, independent refueling workflow and strong open-water usability.',
    badges: ['Fuel powered', 'Adventure operation', 'Longer ride time'],
    sellingPoints: ['Fuel-powered open-water operation', 'Longer session planning', 'Strong outdoor usability', 'Maintenance planning support'],
    useCases: ['Outdoor adventure parks', 'Beach clubs', 'Open-water projects', 'Distributor fuel-board line'],
    receive: ['P1 fuel-powered surfboard package with engine system, board body and standard accessories.', 'Longer ride planning for outdoor bases, island activities and adventure operators.', 'Product parameter support for distributors comparing fuel and electric models.'],
    support: ['Recommended for locations where charging infrastructure is limited or longer sessions are required.', 'Sales guidance for fuel workflow, maintenance planning and operator preparation.', 'Can be paired with electric models to build a broader water sports catalog.'],
    inspection: ['Engine area, board body, accessories and key fittings are checked before shipment.', 'Packing list and export dimensions can be confirmed before loading.', 'Use and maintenance notes can be prepared for operator training.']
  },
  'p1-pro': {
    intro: 'ZAIHAI P1 Pro is the stronger fuel-powered option for buyers who want maximum commercial attraction, higher top-speed positioning and a premium gasoline board for outdoor rental and distributor projects.',
    badges: ['Fuel flagship', 'High-speed appeal', 'Distributor model'],
    sellingPoints: ['Premium fuel-powered positioning', 'High-speed attraction value', 'Outdoor project fit', 'Distributor catalog support'],
    useCases: ['Adventure tourism projects', 'Premium outdoor rentals', 'Distributor showroom', 'Advanced private buyers'],
    receive: ['P1 Pro fuel-powered surfboard package with flagship product configuration.', 'Stronger commercial positioning for advanced riders, adventure tourism and premium product catalogs.', 'Detailed product visuals and specification support for overseas promotion.'],
    support: ['Best for distributors, outdoor adventure operators and projects where high-speed fuel boards are the main selling point.', 'Support for accessory planning, packaging details and model comparison with P1.', 'Export preparation for samples and destination-specific documentation.'],
    inspection: ['Engine, board structure, accessories and packaging are inspected before shipment.', 'Shipment photos and packing details can be shared for buyer confirmation.', 'Forwarder coordination and documents are prepared according to export requirements.']
  }
};

export function generateStaticParams() {
  return productSlugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!productSlugs.includes(slug as ProductSlug)) notFound();
  const names = await getTranslations({locale, namespace: 'productNames'});
  const seo = await getTranslations({locale, namespace: 'seo'});
  const title = `${names(slug as ProductSlug)} for Commercial Water Sports Projects | ZAIHAI SURFING`;
  return localizedMetadata(locale, `/products/${slug}`, title, seo('productsDescription'));
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!productSlugs.includes(slug as ProductSlug)) notFound();
  setRequestLocale(locale);
  const product = products[slug as ProductSlug];
  const productSlug = slug as ProductSlug;
  const gallery = productGalleries[productSlug];
  const content = productContent[productSlug];
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const copy = uiCopy[locale].productDetail;
  const specRows = [
    ['Model', names(productSlug)],
    ['Product type', product.category],
    ['Power', product.specs[0] || 'To be confirmed'],
    ['Voltage / Engine', product.specs[1] || 'To be confirmed'],
    ['Top speed', product.specs[2] || 'To be confirmed'],
    ['Runtime', product.specs[3] || 'To be confirmed'],
    ['Charging time', productSlug.includes('p1') ? 'Not applicable' : 'To be confirmed'],
    ['Board / hull material', 'To be confirmed'],
    ['Weight', 'To be confirmed'],
    ['Load capacity', 'To be confirmed'],
    ['Package size', 'To be confirmed'],
    ['Recommended use', content.useCases.join(' / ')]
  ];

  return (
    <main>
      <section className="product-hero">
        <div className="product-gallery">
          <img className="main-product-image" src={product.image} alt={alt(productSlug)} />
          <div className="product-thumbs" aria-label="Product detail images">
            {gallery.slice(1).map((image) => (
              <img src={image} alt={`${product.name} detail view`} key={image} />
            ))}
          </div>
        </div>
        <aside className="product-summary">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/products">Products</Link>
            <span>/</span>
            <span>{names(productSlug)}</span>
          </nav>
          <p className="eyebrow">{product.category}</p>
          <h1>{names(productSlug)}</h1>
          <div className="product-price-row b2b-price-row">
            <strong>Distributor pricing available</strong>
            <span>Quotation by model mix, target quantity, destination and package.</span>
            <em>{copy.priceBadge}</em>
          </div>
          <div className="buyer-rating" aria-label={copy.buyerRecommended}>
            <span>★★★★★</span>
            <strong>{copy.buyerRecommended}</strong>
          </div>
          <div className="product-buyer-badges">
            {content.badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <p>{content.intro}</p>
          <dl className="quick-specs">
            {product.specs.map((spec, index) => (
              <div key={spec}>
                <dt>{index === 0 ? 'Power' : index === 1 ? 'System' : index === 2 ? 'Speed' : 'Feature'}</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
          <div className="product-buy-form b2b-actions">
            <a className="button primary" href={`/${locale}/contact?product=${slug}`}>
              {copy.buyNow}
            </a>
            <a className="button dark" href={`/${locale}/contact`}>
              {copy.requestQuote}
            </a>
            <a className="button ghost light" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
              {copy.whatsapp}
            </a>
            <a className="button ghost light" href={`/${locale}/contact`}>
              {copy.download}
            </a>
          </div>
          <p className="secure-note">{copy.secure}</p>
          <ShareButtons title={product.name} />
        </aside>
      </section>

      <section className="product-detail-layout">
        <div className="section-heading">
          <p className="eyebrow">{copy.overview}</p>
          <h2>Commercial Product Overview</h2>
          <p>{content.intro}</p>
        </div>

        <div className="product-info-grid selling-points">
          {content.sellingPoints.map((point) => (
            <article key={point}>
              <h3>{point}</h3>
              <p>Designed to support real commercial operation, buyer evaluation and overseas project supply.</p>
            </article>
          ))}
        </div>

        <section className="technical-specs">
          <div className="section-heading compact">
            <p className="eyebrow">Technical specifications</p>
            <h2>Model Specifications</h2>
          </div>
          <table>
            <tbody>
              {specRows.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="use-case-strip">
          <p className="eyebrow">Best use cases</p>
          <div>
            {content.useCases.map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <div className="product-info-grid">
          <article>
            <h3>{copy.receive}</h3>
            <ul>
              {content.receive.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <h3>{copy.support}</h3>
            <ul>
              {content.support.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <h3>{copy.beforeShipment}</h3>
            <ul>
              {content.inspection.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>

        <div className="product-image-strip">
          {gallery.map((image) => (
            <img src={image} alt={`${product.name} commercial product detail`} key={`strip-${image}`} />
          ))}
        </div>

        <section className="product-faq">
          <div className="section-heading compact">
            <p className="eyebrow">FAQ</p>
            <h2>{copy.faqTitle}</h2>
          </div>
          <div className="faq-grid">
            {copy.faq.map((question) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>Contact our sales team with your target market, expected quantity, water area and shipping country for a project-specific answer.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="project-cta">
          <p className="eyebrow">Project quotation</p>
          <h3>Need distributor price, shipping cost or a rental fleet package?</h3>
          <p>Send your buyer type, destination country, preferred model and expected quantity. ZAIHAI will recommend suitable models, accessories and export support options.</p>
          <Link className="button primary" href="/contact">Request Quote / Get Distributor Price</Link>
        </section>
      </section>
      <RelatedProducts currentSlug={productSlug} />
    </main>
  );
}
