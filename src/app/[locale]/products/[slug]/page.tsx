import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import RelatedProducts from '@/components/RelatedProducts';
import ShareButtons from '@/components/ShareButtons';
import {localizedMetadata} from '@/lib/metadata';
import {productSlugs, products, type ProductSlug} from '@/lib/site';

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
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const t = await getTranslations({locale, namespace: 'products'});
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <main>
      <section className="product-hero">
        <div className="product-gallery">
          <img className="main-product-image" src={product.image} alt={alt(productSlug)} />
        </div>
        <aside className="product-summary">
          <p className="eyebrow">{product.category}</p>
          <h1>{names(productSlug)}</h1>
          <p>{t('intro')}</p>
          <dl className="quick-specs">
            {product.specs.map((spec, index) => (
              <div key={spec}>
                <dt>{index === 0 ? 'Power' : index === 1 ? 'System' : index === 2 ? 'Speed' : 'Feature'}</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
          <div className="product-actions">
            <Link className="button primary" href={`/checkout?product=${slug}&qty=1`}>
              Buy Now
            </Link>
            <a className="button dark" href={`/${locale}/contact`}>
              {common('requestQuote')}
            </a>
          </div>
          <p className="secure-note">Secure payment: Visa, Mastercard, American Express, JCB, Discover, Diners Club, PayPal, T/T and Qianhai credit card gateway ready.</p>
          <ShareButtons title={product.name} />
        </aside>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">{t('specs')}</p>
          <h2>{t('shipping')}</h2>
          <p>{common('footer')}</p>
        </div>
      </section>
      <RelatedProducts currentSlug={productSlug} />
    </main>
  );
}
