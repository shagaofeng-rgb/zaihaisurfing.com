import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
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
  const names = await getTranslations({locale, namespace: 'productNames'});
  const alt = await getTranslations({locale, namespace: 'alt'});
  const t = await getTranslations({locale, namespace: 'products'});
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <main>
      <section className="product-hero">
        <div className="product-gallery">
          <img className="main-product-image" src={product.image} alt={alt(slug as ProductSlug)} />
        </div>
        <aside className="product-summary">
          <p className="eyebrow">{product.category}</p>
          <h1>{names(slug as ProductSlug)}</h1>
          <p>{t('intro')}</p>
          <dl className="quick-specs">
            {product.specs.map((spec, index) => (
              <div key={spec}>
                <dt>{index === 0 ? 'Power' : index === 1 ? 'System' : index === 2 ? 'Speed' : 'Feature'}</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
          <a className="button primary" href={`/${locale}/contact`}>
            {common('requestQuote')}
          </a>
        </aside>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">{t('specs')}</p>
          <h2>{t('shipping')}</h2>
          <p>{common('footer')}</p>
        </div>
      </section>
    </main>
  );
}
