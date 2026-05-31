import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
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
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{t('categoryTitle')}</p>
          <h1>{t('h1')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>
      <section className="catalog-section">
        <div className="section-heading">
          <p className="eyebrow">{t('allModels')}</p>
          <h2>{t('categoryTitle')}</h2>
        </div>
        <ProductGrid locale={locale} />
      </section>
    </main>
  );
}
