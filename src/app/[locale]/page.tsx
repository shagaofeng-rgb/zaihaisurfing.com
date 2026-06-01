import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import {Link} from '@/i18n/navigation';
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
      <section className="collection-section" aria-labelledby="collection-title">
        <div className="section-heading compact">
          <p className="eyebrow">Collection list</p>
          <h2 id="collection-title">Choose the Right Water Sports Product Line</h2>
          <p>Fast product entry for distributors, resort buyers, rental operators and water park project teams.</p>
        </div>
        <div className="collection-grid">
          <Link className="collection-card" href="/products">
            <span>Electric Surfboards</span>
            <img src="/assets/catalog/x1-pro/product.png" alt="ZAIHAI electric surfboard collection" />
          </Link>
          <Link className="collection-card" href="/products/rage-shark-x">
            <span>Water Kart Boats</span>
            <img src="/assets/catalog/rage-shark-x/main-boat.png" alt="Rage Shark X electric water kart collection" />
          </Link>
          <Link className="collection-card" href="/products/p1-pro">
            <span>Fuel-Powered Surfboards</span>
            <img src="/assets/catalog/p1-pro/main.png" alt="ZAIHAI fuel-powered surfboard collection" />
          </Link>
          <Link className="collection-card" href="/factory">
            <span>OEM / Distributor Supply</span>
            <img src="/assets/catalog/x1-pro/parts.png" alt="ZAIHAI OEM and distributor product package" />
          </Link>
        </div>
      </section>

      <section className="video-showcase" aria-labelledby="video-showcase-title">
        <div className="video-copy">
          <p className="eyebrow">Real riding footage</p>
          <h2 id="video-showcase-title">See ZAIHAI Surfboards on the Water</h2>
          <p>
            Watch the actual riding scene and understand how the product looks in open-water entertainment,
            resort demos and rental experiences.
          </p>
          <Link className="button dark" href="/products">
            Explore Products
          </Link>
        </div>
        <div className="vertical-video-card">
          <div className="video-frame">
            <video controls muted loop playsInline preload="metadata" poster="/assets/banners/zaihai-main-banner.png" aria-label="ZAIHAI electric surfboard riding video">
              <source src="/assets/banners/zaihai-video-3.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="brand-manifest" aria-labelledby="manifest-title">
        <p className="eyebrow">Commercial water sports, built to be seen</p>
        <h2 id="manifest-title">FEEL THE WATER</h2>
        <p>
          Premium product visuals, clear specifications and practical export support help overseas buyers evaluate
          ZAIHAI products before the first shipment.
        </p>
        <Link className="button primary" href="/products">
          Explore the Collection
        </Link>
      </section>

      <section className="section market-section">
        <div className="section-heading">
          <p className="eyebrow">Global supply</p>
          <h2>{t('marketsTitle')}</h2>
          <p>{t('marketsText')}</p>
        </div>
        <div className="market-grid">
          {[
            {
              market: 'GCC',
              title: 'Luxury resorts, yacht clubs & Red Sea tourism',
              text: 'Strong fit for UAE, Saudi Arabia, Qatar and Gulf buyers building premium beach and yacht-side experiences.'
            },
            {
              market: 'United States',
              title: 'Lake rentals, marinas & adventure operators',
              text: 'Ideal for Florida, California, lake resorts, rental businesses and outdoor recreation distributors.'
            },
            {
              market: 'Mediterranean Europe',
              title: 'Beach clubs, coastal resorts & tourism rentals',
              text: 'Suitable for Spain, Greece, Italy and France where coastal leisure and premium water sports are mature.'
            },
            {
              market: 'Island Resorts',
              title: 'Maldives, Thailand & Indonesia resort activities',
              text: 'Practical for island hotels, lagoon experiences, water sports centers and tourism attraction packages.'
            }
          ].map((item) => (
            <article key={item.market}>
              <span>{item.market}</span>
              <h3>{item.title}</h3>
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
        <div className="trust-grid">
          {[
            ['OEM/ODM Customization', 'Custom colors, logo branding, packaging, configuration and project-based water sports solutions.'],
            ['Export Documentation', 'Battery safety, waterproof testing and quality inspection support can be prepared according to project requirements.'],
            ['Global Delivery Support', 'Packing size, wooden crate, lithium battery documents, MSDS and shipping guidance are available for order planning.'],
            ['Model Recommendation', 'Our team recommends suitable models based on country, use case, quantity and product line.']
          ].map(([title, text]) => (
            <article className="info-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
