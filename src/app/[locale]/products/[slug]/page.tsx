import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import PaymentBadges from '@/components/PaymentBadges';
import RelatedProducts from '@/components/RelatedProducts';
import ShareButtons from '@/components/ShareButtons';
import {localizedMetadata} from '@/lib/metadata';
import {productSlugs, products, type ProductSlug} from '@/lib/site';

const productGalleries: Record<ProductSlug, string[]> = {
  x1: ['/assets/catalog/x1/main.png', '/assets/catalog/x1/product.png', '/assets/catalog/x1/parameters.png', '/assets/catalog/x1/parts.png'],
  'x1-pro': ['/assets/catalog/x1-pro/main.png', '/assets/catalog/x1-pro/product.png', '/assets/catalog/x1-pro/parameters.png', '/assets/catalog/x1-pro/parts.png'],
  'rage-shark-x': ['/assets/catalog/rage-shark-x/main.png', '/assets/catalog/rage-shark-x/main-boat.png', '/assets/catalog/rage-shark-x/front.png', '/assets/catalog/rage-shark-x/side.png'],
  p1: ['/assets/catalog/p1/main.png', '/assets/catalog/p1/hero.png', '/assets/catalog/p1/detail.png', '/assets/catalog/p1/bottom.png'],
  'p1-pro': ['/assets/catalog/p1-pro/main.png', '/assets/catalog/p1-pro/product.png', '/assets/catalog/p1-pro/scene-01.png', '/assets/catalog/p1-pro/scene-02.png']
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
  const title = `${names(slug as ProductSlug)} | ZAIHAI SURFING`;
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
  const compareAt = Math.round(product.priceAmount * 1.18 / 100) * 100;
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const t = await getTranslations({locale, namespace: 'products'});
  const common = await getTranslations({locale, namespace: 'common'});

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
          <p className="eyebrow">{product.category}</p>
          <h1>{names(productSlug)}</h1>
          <div className="product-price-row">
            <strong>{product.price}</strong>
            <span>USD {compareAt.toLocaleString()}</span>
            <em>Factory direct</em>
          </div>
          <div className="product-buyer-badges">
            <span>Commercial grade</span>
            <span>Resort rental ready</span>
            <span>Spare parts support</span>
          </div>
          <p>{t('intro')}</p>
          <dl className="quick-specs">
            {product.specs.map((spec, index) => (
              <div key={spec}>
                <dt>{index === 0 ? 'Power' : index === 1 ? 'System' : index === 2 ? 'Speed' : 'Feature'}</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
          <form className="product-buy-form" action={`/${locale}/checkout`} method="get">
            <input type="hidden" name="product" value={slug} />
            <label>
              Qty
              <input type="number" name="qty" min="1" max="99" defaultValue="1" />
            </label>
            <button className="button primary" type="submit">
              Buy Now
            </button>
            <a className="button dark" href={`/${locale}/contact`}>
              {common('requestQuote')}
            </a>
          </form>
          <PaymentBadges />
          <p className="secure-note">Secure payment: Visa, Mastercard, American Express, JCB, Discover, Diners Club, PayPal, T/T and Qianhai credit card gateway ready.</p>
          <ShareButtons title={product.name} />
        </aside>
      </section>
      <section className="product-detail-layout">
        <div className="section-heading">
          <p className="eyebrow">{t('specs')}</p>
          <h2>{t('shipping')}</h2>
          <p>{common('footer')}</p>
        </div>
        <div className="product-info-grid">
          <article>
            <h3>What overseas buyers receive</h3>
            <ul>
              <li>Complete board or water kart package with matched accessories.</li>
              <li>Export packaging, photos before shipment and packing list support.</li>
              <li>Spare battery, charger, life jacket and wear-part planning for rental fleets.</li>
            </ul>
          </article>
          <article>
            <h3>Commercial purchasing support</h3>
            <ul>
              <li>Model comparison for resorts, distributors, yacht clubs and rental operators.</li>
              <li>OEM/ODM color, logo and package discussion before bulk production.</li>
              <li>Qianhai card gateway, T/T and PayPal manual payment routes prepared.</li>
            </ul>
          </article>
          <article>
            <h3>Before shipment</h3>
            <ul>
              <li>Factory inspection of appearance, accessories and key functional parts.</li>
              <li>Order confirmation with destination, forwarder, port and documentation.</li>
              <li>Sales follow-up for manuals, use cases, product photos and marketing assets.</li>
            </ul>
          </article>
        </div>
        <div className="product-image-strip">
          {gallery.map((image) => (
            <img src={image} alt={`${product.name} commercial product detail`} key={`strip-${image}`} />
          ))}
        </div>
      </section>
      <RelatedProducts currentSlug={productSlug} />
    </main>
  );
}
