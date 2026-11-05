import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import ProductGrid from '@/components/ProductGrid';
import {localizedMetadata} from '@/lib/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/products', seo('productsTitle'), seo('productsDescription'));
}

export default async function ProductsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'products'});

  return (
    <main className="interior-page design-products catalog-review">
      <section className="catalog-mast">
        <div>
          <div>
            <p className="eyebrow">{locale === 'en' ? 'Products' : t('allModels')}</p>
            <h1>{locale === 'en' ? 'Find the right ride.' : t('h1')}</h1>
            <p>{locale === 'en' ? 'Compare electric boards, fuel-powered boards and go-kart boats for your riders and water area.' : t('intro')}</p>
          </div>
          {locale === 'en' ? <p className="catalog-mast-note">Choose a category, review comparable specifications and request a model-specific quote.</p> : null}
        </div>
      </section>
      <section className="catalog-section" id="models" aria-label="Product models">
        <ProductGrid locale={locale} />
      </section>
      <section className="catalog-inquiry"><div>
        <div><h2>Planning a fleet or a sample order?</h2><p>Share your water area, target riders and expected quantity.</p></div>
        <Link className="button primary" href="/contact">Request a quote</Link>
      </div></section>
    </main>
  );
}
