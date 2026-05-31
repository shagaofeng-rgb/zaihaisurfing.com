import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import {localizedMetadata} from '@/lib/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '', seo('homeTitle'), seo('homeDescription'));
}

export default async function HomePage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'home'});
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <main>
      <Hero eyebrow={common('eyebrow')} title={t('h1')} intro={t('intro')} primary={t('primaryCta')} secondary={t('secondaryCta')} />
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Global supply</p>
          <h2>{t('marketsTitle')}</h2>
          <p>{t('marketsText')}</p>
        </div>
        <div className="card-grid">
          {[
            {
              market: 'Middle East',
              text: 'UAE, Saudi Arabia, Qatar and Oman: resort leisure, beach clubs, marinas and high-end tourism projects.'
            },
            {
              market: 'Europe',
              text: 'Mediterranean beaches, lakeside rentals, yacht clubs and premium outdoor leisure distributors.'
            },
            {
              market: 'North America',
              text: 'Lake resorts, private waterfront communities, marinas, rentals and powersports distributors.'
            },
            {
              market: 'Asia-Pacific',
              text: 'Island tourism, beach resorts, scenic water parks and fast-growing outdoor entertainment projects.'
            }
          ].map((item) => (
            <article className="info-card" key={item.market}>
              <h3>{item.market}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="catalog-section">
        <div className="section-heading">
          <p className="eyebrow">{common('brand')}</p>
          <h2>{t('productsTitle')}</h2>
          <p>{t('productsText')}</p>
        </div>
        <ProductGrid locale={locale} />
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">OEM/ODM</p>
          <h2>{t('oemTitle')}</h2>
          <p>{t('oemText')}</p>
        </div>
      </section>
    </main>
  );
}
