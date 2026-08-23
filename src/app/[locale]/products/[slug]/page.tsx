import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import ProductGallery from '@/components/ProductGallery';
import RelatedProducts from '@/components/RelatedProducts';
import ShareButtons from '@/components/ShareButtons';
import {localizedMetadata} from '@/lib/metadata';
import {canonicalFor, productDetailedSpecs, productSlugs, siteUrl, type ProductSlug} from '@/lib/site';
import {uiCopy} from '@/lib/uiCopy';
import {getRuntimeCatalogProduct} from '@/lib/catalogRuntime';

const productGalleries: Record<ProductSlug, string[]> = {
  x1: ['/assets/catalog/x1/hero-angle.png', '/assets/catalog/x1/side-view.png', '/assets/catalog/x1/rear-view.png', '/assets/catalog/x1/tail-closeup.png', '/assets/catalog/x1/top-view.png'],
  'x1-pro': ['/assets/catalog/x1-pro/hero-angle.png', '/assets/catalog/x1-pro/side-view.png', '/assets/catalog/x1-pro/rear-view.png', '/assets/catalog/x1-pro/detail-closeup.png', '/assets/catalog/x1-pro/top-view.png'],
  'rage-shark-x': ['/assets/catalog/rage-shark-x/hero-angle.png', '/assets/catalog/rage-shark-x/side-view.png', '/assets/catalog/rage-shark-x/top-view.png', '/assets/catalog/rage-shark-x/head-closeup.png', '/assets/catalog/rage-shark-x/front-view.png'],
  p1: ['/assets/catalog/p1/hero-angle.png', '/assets/catalog/p1/side-view.png', '/assets/catalog/p1/bottom-view.png', '/assets/catalog/p1/rear-view.png', '/assets/catalog/p1/tail-closeup.png', '/assets/catalog/p1/detail-view.png'],
  'p1-pro': ['/assets/catalog/p1-pro/product.png', '/assets/catalog/p1-pro/detail.png', '/assets/catalog/p1-pro/bottom.png', '/assets/catalog/p1-pro/tail.png', '/assets/catalog/p1-pro/scene-01.png', '/assets/catalog/p1-pro/scene-02.png']
};

const quickSpecLabels: Record<ProductSlug, string[]> = {
  x1: ['Power', 'Voltage', 'Speed', 'Endurance'],
  'x1-pro': ['Power', 'Voltage', 'Speed', 'Waterproof'],
  'rage-shark-x': ['Power', 'Battery', 'Speed', 'Endurance'],
  p1: ['Power', 'Max speed', 'Engine', 'Fuel tank'],
  'p1-pro': ['Power', 'Max speed', 'Engine', 'Fuel tank']
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
    intro: 'Rage Shark X is an electric go-kart boat designed for scenic attractions, water parks, family-friendly resort activities and operators who want an easy-drive product with strong visual appeal.',
    badges: ['Family attraction', 'Electric go-kart boat', 'Easy to operate'],
    sellingPoints: ['Easy-drive guest experience', 'Family-friendly attraction', 'Controlled water area fit', 'Fleet operation support'],
    useCases: ['Water parks', 'Scenic lakes', 'Family resort programs', 'Rental attractions'],
    receive: ['Rage Shark X electric go-kart boat with matched electric system and standard accessory package.', 'Beginner-friendly ride experience for families, scenic lakes, resorts and water parks.', 'Commercial product images and specification references for ticketing or rental promotion.'],
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

const productFaq: Record<ProductSlug, Array<{question: string; answer: string}>> = {
  x1: [
    {question: 'How long does the battery last?', answer: 'The listed endurance is 60-80 minutes. Actual operating time depends on rider weight, speed, water conditions and battery workflow.'},
    {question: 'Can I order one sample first?', answer: 'Yes. Share the destination country and intended use so the sample configuration, battery handling and export documents can be confirmed.'},
    {question: 'Is X1 suitable for rental business?', answer: 'X1 is positioned for resort and rental programs. Operators should still define rider screening, safety equipment, charging workflow and local operating rules.'}
  ],
  'x1-pro': [
    {question: 'What makes X1 Pro different from X1?', answer: 'X1 Pro has a 12 kW drive, higher listed top speed and IP67 waterproof rating. It is positioned for premium demonstrations and advanced riders.'},
    {question: 'What is the expected riding time?', answer: 'The listed endurance is 45 minutes. Actual time varies by speed, rider weight, conditions and battery condition.'},
    {question: 'Can it be included in a resort demo fleet?', answer: 'Yes. Premium demo fleets should set advanced-rider criteria, staff supervision, battery rotation and local safety procedures.'}
  ],
  'rage-shark-x': [
    {question: 'Is Rage Shark X suitable for family attractions?', answer: 'It is positioned for controlled water attractions. Operators must set their own age, size, route, supervision and local safety requirements.'},
    {question: 'How long does the battery last?', answer: 'The listed endurance is 60-80 minutes. Guest turnover, speed, water conditions and battery maintenance affect actual runtime.'},
    {question: 'What should a water park plan before purchase?', answer: 'Confirm the controlled operating area, guest route, charging workflow, life-jacket policy, supervision plan and local rules before ordering.'}
  ],
  p1: [
    {question: 'What fuel does P1 use?', answer: 'P1 is specified for unleaded gasoline No. 95 and above with a 50:1 fuel ratio. Follow the supplied operation and maintenance guidance.'},
    {question: 'How is P1 different from an electric surfboard?', answer: 'P1 uses a 110 cc two-stroke water-cooled engine and a 3.5 L fuel tank, so its operating and maintenance workflow differs from battery-powered models.'},
    {question: 'What should an outdoor operator confirm first?', answer: 'Confirm local waterway permissions, fuel storage and handling rules, rider training, safety equipment and maintenance capacity before operating.'}
  ],
  'p1-pro': [
    {question: 'What distinguishes P1 Pro from P1?', answer: 'P1 Pro is the premium fuel-powered option with a listed 64 km/h top speed. The final model choice should consider rider level, operating area and maintenance plan.'},
    {question: 'What fuel and engine does P1 Pro use?', answer: 'P1 Pro is specified with a 110 cc two-stroke water-cooled engine, unleaded gasoline No. 95 and above, a 50:1 fuel ratio and a 3.5 L tank.'},
    {question: 'Is P1 Pro suitable for rental operation?', answer: 'It can suit experienced outdoor operators when local permissions, supervised rider procedures, fuel handling and maintenance requirements are in place.'}
  ]
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
  const runtimeProduct = await getRuntimeCatalogProduct(slug as ProductSlug);
  if (!runtimeProduct) notFound();
  const names = await getTranslations({locale, namespace: 'productNames'});
  const seo = await getTranslations({locale, namespace: 'seo'});
  const title = runtimeProduct.seoTitle || `${names(slug as ProductSlug)} for Commercial Water Sports Projects | ZAIHAI SURFING`;
  const description = runtimeProduct.seoDescription || seo('productsDescription');
  const metadata = localizedMetadata(locale, `/products/${slug}`, title, description);
  if (locale !== 'en') {
    const canonical = canonicalFor('en', `/products/${slug}`);
    metadata.alternates = {canonical, languages: {en: canonical, 'x-default': canonical}};
    metadata.robots = {index: false, follow: true};
  }
  return metadata;
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{locale: Locale; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!productSlugs.includes(slug as ProductSlug)) notFound();
  setRequestLocale(locale);
  const productSlug = slug as ProductSlug;
  const product = await getRuntimeCatalogProduct(productSlug);
  if (!product) notFound();
  const gallery = product.galleryImages.length ? product.galleryImages : productGalleries[productSlug];
  const content = productContent[productSlug];
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const copy = uiCopy[locale].productDetail;
  const faqs = locale === 'en'
    ? productFaq[productSlug]
    : copy.faq.map((question) => ({
      question,
      answer: 'Contact our sales team with your target market, expected quantity, water area and shipping country for a project-specific answer.'
    }));
  const specRows = [
    ...productDetailedSpecs[productSlug].map((spec) => [spec.label, spec.value] as const),
    ['Recommended use', content.useCases.join(' / ')] as const
  ];
  const productUrl = `${siteUrl}/${locale}/products/${productSlug}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: content.intro,
    image: gallery.map((image) => `${siteUrl}${image}`),
    sku: `ZH-${productSlug.toUpperCase()}`,
    model: productDetailedSpecs[productSlug].find((spec) => spec.label.toLowerCase() === 'model')?.value || product.name,
    brand: {
      '@type': 'Brand',
      name: 'ZAIHAI SURFING'
    },
    offers: {
      '@type': 'Offer',
      price: product.priceAmount,
      priceCurrency: 'USD',
      availability: product.stock !== null && product.stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: productUrl
    },
    url: productUrl
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Products',
        item: `${siteUrl}/${locale}/products`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.name,
        item: productUrl
      }
    ]
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      <section className="product-hero">
        <ProductGallery images={gallery} mainAlt={alt(productSlug)} productName={product.name} />
        <aside className="product-summary">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/products">Products</Link>
            <span>/</span>
            <span>{names(productSlug)}</span>
          </nav>
          <p className="eyebrow">{product.category}</p>
          <h1>{names(productSlug)}</h1>
          <div className="product-price-row b2b-price-row">
            <strong>{product.price}</strong>
            <span>Commercial checkout available. Final shipping is confirmed by destination and quantity.</span>
            <em>Factory direct price</em>
          </div>
          <div className="buyer-rating" role="group" aria-label={copy.buyerRecommended}>
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
                <dt>{quickSpecLabels[productSlug][index] || `Spec ${index + 1}`}</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
          <div className="product-buy-form b2b-actions">
            {product.allowDirectOrder && (product.stock === null || product.stock > 0) ? (
              <a className="button primary" href={`/${locale}/checkout?product=${productSlug}&qty=1`}>
                Buy Now
              </a>
            ) : null}
            <a className="button dark" href={`/${locale}/contact`}>
              {copy.requestQuote}
            </a>
            <a className="button ghost light" data-whatsapp-placement="product_detail_cta" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
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
            {faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="project-cta">
          <p className="eyebrow">Project quotation</p>
          <h3>Need distributor price, shipping cost or a rental fleet package?</h3>
          <p>Send your buyer type, destination country, preferred model and expected quantity. ZAIHAI will recommend suitable models, accessories and export support options.</p>
          <div className="cta-actions">
            {product.allowDirectOrder && (product.stock === null || product.stock > 0) ? (
              <Link className="button primary" href={`/checkout?product=${productSlug}&qty=1`}>Buy Now</Link>
            ) : null}
            <Link className="button dark" href="/contact">Request Quote</Link>
          </div>
        </section>
      </section>
      <RelatedProducts currentSlug={productSlug} />
    </main>
  );
}
