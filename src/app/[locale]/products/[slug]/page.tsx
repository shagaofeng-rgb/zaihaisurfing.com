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
import {frenchProductPresentation, frenchProductTypes, productLabel, productSpecValue} from '@/lib/productFrench';
import '@/app/product-review.css';
import {localizedMetadata} from '@/lib/metadata';
import {canonicalFor, productDetailedSpecs, productIndexLocales, productSlugs, siteUrl, type ProductSlug} from '@/lib/site';
import {uiCopy} from '@/lib/uiCopy';
import {getPublicCatalogProduct} from '@/lib/catalogRuntime';

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
  const model = slug as ProductSlug;
  const runtimeProduct = await getPublicCatalogProduct(model);
  if (!runtimeProduct) notFound();
  const path = `/products/${slug}`;
  const englishUrl = canonicalFor('en', path);
  const localIndex = productIndexLocales.includes(locale);
  const presentation = productPresentation[model];
  const title = locale === 'fr'
    ? `${presentation.short} · ${frenchProductTypes[presentation.category]} | ZAIHAI SURFING`
    : runtimeProduct.seoTitle;
  const description = locale === 'fr' ? frenchProductPresentation[model].description : runtimeProduct.seoDescription;
  const metadata = localizedMetadata(locale, path, title, description, {url: new URL(runtimeProduct.image, siteUrl).href});
  metadata.alternates = {
    canonical: localIndex ? canonicalFor(locale, path) : englishUrl,
    languages: {
      ...Object.fromEntries(productIndexLocales.map((language) => [language, canonicalFor(language, path)])),
      'x-default': englishUrl
    }
  };
  if (!localIndex) metadata.robots = {index: false, follow: true};
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
  const product = await getPublicCatalogProduct(productSlug);
  if (!product) notFound();
  const approvedGallery = productGalleries[productSlug];
  const publishedGallery = product.galleryImages;
  const isDefaultGallery = publishedGallery[0] === approvedGallery[0] && approvedGallery.every((image) => publishedGallery.includes(image));
  const gallery = isDefaultGallery
    ? [...new Set([...approvedGallery, ...publishedGallery])]
    : publishedGallery.length ? publishedGallery : approvedGallery;
  const french = locale === 'fr';
  const local = (english: string, frenchText: string) => french ? frenchText : english;
  const source = productPresentation[productSlug];
  const content = french ? {...source, ...frenchProductPresentation[productSlug], type: frenchProductTypes[source.category]} : source;
  const specs = productDetailedSpecs[productSlug];
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const copy = uiCopy[locale].productDetail;
  const title = locale === 'en' || french ? content.short : names(productSlug);
  const quoteHref = `/${locale}/contact?product=${productSlug}#inquiry-form`;
  const canBuy = product.allowDirectOrder && (product.stock === null || product.stock > 0);
  const companion = content.compare ? await getPublicCatalogProduct(content.compare) : null;
  const groups = new Map<string, typeof specs>();
  for (const spec of specs) {
    const {label} = spec;
    const group = /gasoline|fuel ratio|fuel tank|lubricating oil/i.test(label) ? local('Fuel and lubrication', 'Carburant et lubrification')
      : /engine|ignit|compression|spark plug|cylinder|start mode|operating power/i.test(label) ? local('Engine and service', 'Moteur et entretien')
      : /power|speed|voltage|battery|endurance|waterproof/i.test(label)
        ? (content.category === 'fuel' ? local('Performance and load', 'Performances et charge') : local('Drive and electrical system', 'Propulsion et système électrique'))
        : /accessories|warranty/i.test(label) ? local('Equipment and coverage', 'Équipement et garantie') : local('Construction and dimensions', 'Construction et dimensions');
    const rows = groups.get(group) || [];
    rows.push(spec);
    groups.set(group, rows);
  }
  const productUrl = `${siteUrl}/${locale}/products/${productSlug}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
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
      ...(product.stock === null ? {} : {availability: product.stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}),
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
        name: local('Products', 'Produits'),
        item: `${siteUrl}/${locale}/products`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: productUrl
      }
    ]
  };

  const sections = [
    [local('Overview', 'Présentation'), 'overview'], [local('Specifications', 'Caractéristiques'), 'specifications'],
    [local('What’s included', 'Équipement inclus'), 'package'],
    [local('Delivery & support', 'Livraison et assistance'), 'delivery'], [local('Compare', 'Comparer'), 'compare']
  ];
  const packageCards: {icon: VisualIconName; title: string; lines: readonly string[]}[] = [
    {icon: 'package', title: local('Standard configuration', 'Configuration standard'), lines: content.included},
    {icon: 'tools', title: local('Options to discuss', 'Options à confirmer'), lines: content.optional},
    {icon: 'shield', title: local('Before dispatch', 'Avant l’expédition'), lines: content.handover}
  ];
  const faq = locale === 'en' || french ? content.questions : copy.faq.map((question, index) =>
    [question, content.questions[index]?.[1] || content.description] as const
  );

  return (
    <main className="interior-page product-review">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema).replace(/</g, '\\u003c')}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')}} />
      <section className="model-hero" id="product-first-view">
        <div className="model-wrap">
          <nav className="model-crumb" aria-label={local('Breadcrumb', 'Fil d’Ariane')}>
            <Link href="/products">{local('Products', 'Produits')}</Link><span>/</span><span>{content.type}</span><span>/</span><span aria-current="page">{title}</span>
          </nav>
          <div className="model-grid">
            <div className="model-heading">
              <p className="eyebrow">{content.type}</p>
              <h1>{title}</h1>
              <p className="model-sub">{content.use.slice(0, 2).join(' · ')}</p>
              <p className="model-intro">{content.description}</p>
            </div>
            <ProductGallery images={gallery} mainAlt={french ? `Photo du ${title}` : alt(productSlug)} productName={title} french={french} />
            <div className="model-info">
              <div className="model-price"><strong>{french ? new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'USD', currencyDisplay: 'code'}).format(product.priceAmount) : product.price}</strong><small>{local('Catalog price · freight confirmed separately', 'Prix catalogue · transport à confirmer séparément')}</small></div>
              <dl className="model-quick">
                {content.key.map(([icon, label, fallback], index) => {
                  const value = specs.find(({label: field}) => field === summaryFields[productSlug][index])?.value;
                  const display = label === 'Power' || label === 'Published rating' ? value?.split(' / ')[0].split(' waterproof')[0] : value?.replace(' minutes', ' min').replace(/(\d)-(\d)/g, '$1–$2');
                  return <div key={label}><VisualIcon name={icon} size={20} /><dt>{productLabel(label, french)}</dt><dd>{productSpecValue(display || fallback, french)}</dd></div>;
                })}
              </dl>
              <div className="model-actions">
                <a className="button primary" href={quoteHref}>{copy.requestQuote}</a>
                {canBuy ? <Link className="button ghost" href={`/checkout?product=${productSlug}&qty=1`}>{local('Buy now', 'Acheter')}</Link> : null}
                <a className="button ghost model-chat" data-whatsapp-placement="product_detail_cta" href="https://wa.me/8617621485205" target="_blank" rel="noopener noreferrer" aria-label={copy.whatsapp}><VisualIcon name="chat" size={20} /><span>{copy.whatsapp}</span></a>
              </div>
              <p className="model-fine">{local('For quotes, confirm destination, quantity and configuration.', 'Pour un devis, indiquez la destination, la quantité et la configuration.')}</p>
            </div>
          </div>
        </div>
      </section>
      <nav className="model-section-nav" aria-label={local('Product sections', 'Sections du produit')}><div className="model-wrap">
        {sections.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </div></nav>
      <section id="overview" className="model-block">
        <div className="model-wrap model-split">
          <article className="model-feature">
            <p className="eyebrow"><VisualIcon name={content.category === 'fuel' ? 'engine' : content.category === 'kart' ? 'steering' : 'charge'} size={16} /> {local('Use and operation', 'Usage et exploitation')}</p>
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
          <h2>{local('Technical specifications', 'Caractéristiques techniques')}</h2>
          <p className="model-lede">{content.category === 'fuel'
            ? local('Tank volume and fuel requirements are separate from ride duration.', 'Le volume du réservoir et le carburant requis sont indiqués séparément de l’autonomie.')
            : local('Listed speed and ride time depend on operating conditions. Confirm the test basis when comparing configurations.', 'La vitesse et l’autonomie varient selon les conditions d’utilisation. Vérifiez les conditions d’essai pour comparer les modèles.')}</p>
          <div className="model-specs">
            {[...groups].map(([heading, rows]) => <article key={heading} className="model-spec-group">
              <h3>{heading}</h3><dl>{rows.map(({label, value}) => <div key={label}><dt>{productLabel(label, french)}</dt><dd>{productSpecValue(value, french)}</dd></div>)}</dl>
            </article>)}
          </div>
        </div>
      </section>
      <section id="package" className="model-block">
        <div className="model-wrap">
          <h2>{local('What’s included', 'Équipement inclus')}</h2><p className="model-lede">{local('Confirm exact items and quantities on the quotation or packing list.', 'Confirmez les articles et les quantités sur le devis ou la liste de colisage.')}</p>
          <div className="model-packages">{packageCards.map(({icon, title: heading, lines}) => <article className="model-card" key={heading}>
            <VisualIcon name={icon} /><h3>{heading}</h3><ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>
          </article>)}</div>
        </div>
      </section>
      <section id="delivery" className="model-block model-wash">
        <div className="model-wrap model-split">
          <div>
            <h2>{local('Delivery and support', 'Livraison et assistance')}</h2>
            <article className="model-card"><VisualIcon name="truck" /><h3>{local('Shipping and export', 'Transport et exportation')}</h3><p>{local('Confirm freight, packing and destination requirements for this model.', 'Vérifiez les frais de transport, l’emballage et les exigences de destination pour ce modèle.')}</p><a href="/en/shipping">{local('Shipping details →', 'Conditions de livraison en anglais →')}</a></article>
            <article className="model-card"><VisualIcon name="support" /><h3>{local('Warranty and parts', 'Garantie et pièces')}</h3><p>{local('Use the purchase record and model details when contacting after-sales support.', 'Pour contacter le service après-vente, préparez votre justificatif d’achat et le modèle concerné.')}</p><a href="/en/warranty">{local('Warranty support →', 'Conditions de garantie en anglais →')}</a></article>
          </div>
          <div className="model-faq"><h2>{local('Common questions', 'Questions fréquentes')}</h2>
            {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>
      <section id="compare" className="model-block">
        <div className="model-wrap">
          {companion && content.category !== 'kart' ? <>
            <h2>{local('Compare within the series', 'Comparer les modèles de la gamme')}</h2>
            <div className="model-comparison">
              {[productSlug, companion.slug as ProductSlug].map((model) => <article key={model} className="model-compare-card" data-current={model === productSlug}>
                <h3>{productPresentation[model].short}</h3>
                <dl>{seriesFields[content.category].map(([label, key]) => <div key={key}><dt>{productLabel(label, french)}</dt><dd>{productSpecValue(productDetailedSpecs[model].find((row) => row.label === key)?.value || '—', french)}</dd></div>)}</dl>
                {model !== productSlug ? <Link href={`/products/${model}`}>{local('View model →', 'Voir le modèle →')}</Link> : <small aria-current="page">{local('Current model', 'Modèle actuel')}</small>}
              </article>)}
            </div>
          </> : <>
            <h2>{local('Evaluate your operating setup', 'Évaluer votre installation')}</h2>
            <div className="model-comparison">
              <article className="model-card"><VisualIcon name="hull" /><h3>{local('Compare by operating area', 'Comparer selon la zone d’utilisation')}</h3><p>{local('Share route size, rider profile and supervision plan.', 'Indiquez la taille du parcours, le profil des utilisateurs et le mode de supervision.')}</p><Link href="/applications">Applications →</Link></article>
              <article className="model-card"><VisualIcon name="charge" /><h3>{local('Plan fleet operations', 'Préparer l’exploitation d’une flotte')}</h3><p>{local('Review operating needs and available configurations.', 'Vérifiez les besoins d’exploitation et les configurations disponibles.')}</p><Link href="/products">{local('View all products →', 'Voir tous les produits →')}</Link></article>
            </div>
          </>}
        </div>
      </section>
      <section className="model-quote" id="product-final-inquiry">
        <div className="model-wrap"><div><h2>{local(`Get a quote for ${title}`, `Demander un devis pour le ${title}`)}</h2><p>{local('Tell us your destination, quantity and application.', 'Indiquez la destination, la quantité et l’usage prévu.')}</p></div>
          <a className="button primary" href={quoteHref}>{local('Send project requirements', 'Envoyer les détails du projet')}</a></div>
      </section>
      <ProductStickyInquiry name={title} href={quoteHref} label={copy.requestQuote} />
    </main>
  );
}
