import Image from 'next/image';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import ProductGallery from '@/components/ProductGallery';
import VisualIcon, {type VisualIconName} from '@/components/VisualIcon';
import ProductStickyInquiry from '@/components/ProductStickyInquiry';
import {productPresentation, seriesFields, summaryFields} from '@/lib/productPresentation';
import '@/app/product-review.css';
import {localizedMetadata} from '@/lib/metadata';
import {canonicalFor, productDetailedSpecs, productSlugs, siteUrl, type ProductSlug} from '@/lib/site';
import {uiCopy} from '@/lib/uiCopy';
import {getRuntimeCatalogProduct} from '@/lib/catalogRuntime';

const productGalleries: Record<ProductSlug, string[]> = {
  'x1': ['/assets/catalog/x1/hero-angle.png', '/assets/catalog/x1/side-view.png', '/assets/catalog/x1/top-view.png', '/assets/catalog/x1/tail-closeup.png'],
  'x1-pro': ['/assets/catalog/x1-pro/hero-angle.png', '/assets/catalog/x1-pro/side-view.png', '/assets/catalog/x1-pro/top-view.png', '/assets/catalog/x1-pro/detail-closeup.png'],
  'rage-shark-x': ['/assets/catalog/rage-shark-x/hero-angle.png', '/assets/catalog/rage-shark-x/side-view.png', '/assets/catalog/rage-shark-x/top-view.png', '/assets/catalog/rage-shark-x/head-closeup.png'],
  'p1': ['/assets/catalog/p1/hero-angle.png', '/assets/catalog/p1/side-view.png', '/assets/catalog/p1/bottom-view.png', '/assets/catalog/p1/tail-closeup.png'],
  'p1-pro': ['/assets/catalog/p1-pro/product.png', '/assets/catalog/p1-pro/detail.png', '/assets/catalog/p1-pro/bottom.png', '/assets/catalog/p1-pro/tail.png']
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
  const approvedGallery = productGalleries[productSlug];
  const publishedGallery = product.galleryImages;
  const isDefaultGallery = publishedGallery[0] === approvedGallery[0] && approvedGallery.every((image) => publishedGallery.includes(image));
  const gallery = isDefaultGallery
    ? [...new Set([...approvedGallery, ...publishedGallery])]
    : publishedGallery.length ? publishedGallery : approvedGallery;
  const content = productPresentation[productSlug];
  const specs = productDetailedSpecs[productSlug];
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const copy = uiCopy[locale].productDetail;
  const title = locale === 'en' ? content.short : names(productSlug);
  const quoteHref = `/${locale}/contact?product=${productSlug}#inquiry-form`;
  const canBuy = product.allowDirectOrder && (product.stock === null || product.stock > 0);
  const companion = content.compare ? await getRuntimeCatalogProduct(content.compare) : null;
  const groups = new Map<string, typeof specs>();
  for (const spec of specs) {
    const {label} = spec;
    const group = /gasoline|fuel ratio|fuel tank|lubricating oil/i.test(label) ? 'Fuel and lubrication'
      : /engine|ignit|compression|spark plug|cylinder|start mode|operating power/i.test(label) ? 'Engine and service'
      : /power|speed|voltage|battery|endurance|waterproof/i.test(label) ? (content.category === 'fuel' ? 'Performance and load' : 'Drive and electrical system')
      : /accessories|warranty/i.test(label) ? 'Equipment and coverage' : 'Construction and dimensions';
    const rows = groups.get(group) || [];
    rows.push(spec);
    groups.set(group, rows);
  }
  const productUrl = `${siteUrl}/${locale}/products/${productSlug}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: content.description,
    image: gallery.map((image) => new URL(image, siteUrl).href),
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

  const sections = [
    ['Overview', 'overview'], ['Specifications', 'specifications'], ['What’s included', 'package'],
    ['Delivery & support', 'delivery'], ['Compare', 'compare']
  ];
  const packageCards: {icon: VisualIconName; title: string; lines: readonly string[]}[] = [
    {icon: 'package', title: 'Standard configuration', lines: content.included},
    {icon: 'tools', title: 'Options to discuss', lines: content.optional},
    {icon: 'shield', title: 'Before dispatch', lines: content.handover}
  ];
  const faq = locale === 'en' ? content.questions : copy.faq.map((question, index) =>
    [question, content.questions[index]?.[1] || content.description] as const
  );

  return (
    <main className="interior-page product-review">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema).replace(/</g, '\\u003c')}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')}} />
      <section className="model-hero" id="product-first-view">
        <div className="model-wrap">
          <nav className="model-crumb" aria-label="Breadcrumb">
            <Link href="/products">Products</Link><span>/</span><span>{content.type}</span><span>/</span><span aria-current="page">{title}</span>
          </nav>
          <div className="model-grid">
            <div className="model-heading">
              <p className="eyebrow">{content.type}</p>
              <h1>{title}</h1>
              <p className="model-sub">{content.use.slice(0, 2).join(' · ')}</p>
              <p className="model-intro">{content.description}</p>
            </div>
            <ProductGallery images={gallery} mainAlt={alt(productSlug)} productName={product.name} />
            <div className="model-info">
              <div className="model-price"><strong>{product.price}</strong><small>Catalog price · freight confirmed separately</small></div>
              <dl className="model-quick">
                {content.key.map(([icon, label, fallback], index) => {
                  const value = specs.find(({label: field}) => field === summaryFields[productSlug][index])?.value;
                  const display = label === 'Power' || label === 'Published rating' ? value?.split(' / ')[0].split(' waterproof')[0] : value?.replace(' minutes', ' min').replace(/(\d)-(\d)/g, '$1–$2');
                  return <div key={label}><VisualIcon name={icon} size={20} /><dt>{label}</dt><dd>{display || fallback}</dd></div>;
                })}
              </dl>
              <div className="model-actions">
                <a className="button primary" href={quoteHref}>{copy.requestQuote}</a>
                {canBuy ? <Link className="button ghost" href={`/checkout?product=${productSlug}&qty=1`}>Buy now</Link> : null}
                <a className="button ghost model-chat" data-whatsapp-placement="product_detail_cta" href="https://wa.me/8617621485205" target="_blank" rel="noopener noreferrer" aria-label={copy.whatsapp}><VisualIcon name="chat" size={20} /><span>{copy.whatsapp}</span></a>
              </div>
              <p className="model-fine">For quotes, confirm destination, quantity and configuration.</p>
            </div>
          </div>
        </div>
      </section>
      <nav className="model-section-nav" aria-label="Product sections"><div className="model-wrap">
        {sections.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </div></nav>
      <section id="overview" className="model-block">
        <div className="model-wrap model-split">
          <article className="model-feature">
            <p className="eyebrow"><VisualIcon name={content.category === 'fuel' ? 'engine' : content.category === 'kart' ? 'steering' : 'charge'} size={16} /> Use and operation</p>
            <h2>{content.title}</h2><p>{content.story}</p>
            <ul className="model-tags">{content.use.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <figure className="model-detail-photo">
            <Image src={content.detail} alt={content.detailLabel} width={900} height={540} sizes="(max-width: 760px) 92vw, 45vw" />
            <figcaption>{content.detailLabel}</figcaption>
          </figure>
        </div>
      </section>
      <section id="specifications" className="model-block model-wash">
        <div className="model-wrap">
          <h2>Technical specifications</h2>
          <p className="model-lede">{content.category === 'fuel' ? 'Tank volume and fuel requirements are separate from ride duration.' : 'Listed speed and ride time depend on operating conditions. Confirm the test basis when comparing configurations.'}</p>
          <div className="model-specs">
            {[...groups].map(([heading, rows]) => <article key={heading} className="model-spec-group">
              <h3>{heading}</h3><dl>{rows.map(({label, value}) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            </article>)}
          </div>
        </div>
      </section>
      <section id="package" className="model-block">
        <div className="model-wrap">
          <h2>What’s included</h2><p className="model-lede">Confirm exact items and quantities on the quotation or packing list.</p>
          <div className="model-packages">{packageCards.map(({icon, title: heading, lines}) => <article className="model-card" key={heading}>
            <VisualIcon name={icon} /><h3>{heading}</h3><ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>
          </article>)}</div>
        </div>
      </section>
      <section id="delivery" className="model-block model-wash">
        <div className="model-wrap model-split">
          <div>
            <h2>Delivery and support</h2>
            <article className="model-card"><VisualIcon name="truck" /><h3>Shipping and export</h3><p>Confirm freight, packing and destination requirements for this model.</p><Link href="/shipping">Shipping details →</Link></article>
            <article className="model-card"><VisualIcon name="support" /><h3>Warranty and parts</h3><p>Use the purchase record and model details when contacting after-sales support.</p><Link href="/warranty">Warranty support →</Link></article>
          </div>
          <div className="model-faq"><h2>Common questions</h2>
            {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>
      <section id="compare" className="model-block">
        <div className="model-wrap">
          {companion && content.category !== 'kart' ? <>
            <h2>Compare within the series</h2>
            <div className="model-comparison">
              {[productSlug, companion.slug as ProductSlug].map((model) => <article key={model} className="model-compare-card" data-current={model === productSlug}>
                <h3>{productPresentation[model].short}</h3>
                <dl>{seriesFields[content.category].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{productDetailedSpecs[model].find((row) => row.label === key)?.value || '—'}</dd></div>)}</dl>
                {model !== productSlug ? <Link href={`/products/${model}`}>View model →</Link> : <small aria-current="page">Current model</small>}
              </article>)}
            </div>
          </> : <>
            <h2>Evaluate your operating setup</h2>
            <div className="model-comparison">
              <article className="model-card"><VisualIcon name="hull" /><h3>Compare by operating area</h3><p>Share route size, rider profile and supervision plan.</p><Link href="/applications">Applications →</Link></article>
              <article className="model-card"><VisualIcon name="charge" /><h3>Plan fleet operations</h3><p>Review operating needs and available configurations.</p><Link href="/products">View all products →</Link></article>
            </div>
          </>}
        </div>
      </section>
      <section className="model-quote" id="product-final-inquiry">
        <div className="model-wrap"><div><h2>Get a quote for {title}</h2><p>Tell us your destination, quantity and application.</p></div>
          <a className="button primary" href={quoteHref}>Send project requirements</a></div>
      </section>
      <ProductStickyInquiry name={title} href={quoteHref} label={copy.requestQuote} />
    </main>
  );
}
