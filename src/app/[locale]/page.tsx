import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import Hero from '@/components/Hero';
import HomeRecommendedProducts from '@/components/HomeRecommendedProducts';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {uiCopy} from '@/lib/uiCopy';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '', seo('homeTitle'), seo('homeDescription'));
}

export default async function HomePage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'home'});
  const copy = uiCopy[locale];

  return (
    <main>
      <Hero locale={locale} />
      <section className="home-discount-strip" aria-labelledby="exclusive-discount-title">
        <div className="home-discount-inner">
          <div>
            <p className="eyebrow">Exclusive offer</p>
            <h2 id="exclusive-discount-title">Contact our support team to receive your dedicated discount</h2>
            <p>For resort projects, rental fleets and distributor orders, ZAIHAI can prepare a tailored quotation with model recommendations, shipping support and limited-time purchase benefits.</p>
          </div>
          <a
            className="button primary"
            href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Claim Exclusive Discount
          </a>
        </div>
      </section>
      <section className="video-showcase" id="riding-video" aria-labelledby="video-showcase-title">
        <div className="video-copy">
          <p className="eyebrow">{copy.homeSections.videoEyebrow}</p>
          <h2 id="video-showcase-title">{copy.homeSections.videoTitle}</h2>
          <p>{copy.homeSections.videoText}</p>
          <Link className="button dark" href="/products">
            {copy.homeSections.explore}
          </Link>
        </div>
        <div className="vertical-video-card">
          <div className="video-frame">
            <video controls muted loop playsInline preload="metadata" poster="/assets/banners/zaihai-video-poster-card.jpg" aria-label="ZAIHAI electric surfboard riding video">
              <source src="/assets/banners/zaihai-video-home-faststart.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <HomeRecommendedProducts />

      <section className="brand-manifest" aria-labelledby="manifest-title">
        <p className="eyebrow">{copy.homeSections.manifestEyebrow}</p>
        <h2 id="manifest-title">FEEL THE WATER</h2>
        <p>{copy.homeSections.manifestText}</p>
        <Link className="button primary" href="/products">
          {copy.homeSections.explore}
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
              text: 'Strong fit for UAE, Saudi Arabia, Qatar and Gulf buyers building premium beach and yacht-side experiences.',
              image: '/assets/banners/market-middle-east-optimized.jpg',
              mobileImage: '/assets/banners/market-middle-east-mobile.jpg',
              width: 1100,
              height: 733
            },
            {
              market: 'United States',
              title: 'Lake rentals, marinas & adventure operators',
              text: 'Ideal for Florida, California, lake resorts, rental businesses and outdoor recreation distributors.',
              image: '/assets/banners/market-north-america-optimized.jpg',
              mobileImage: '/assets/banners/market-north-america-mobile.jpg',
              width: 1100,
              height: 626
            },
            {
              market: 'Mediterranean Europe',
              title: 'Beach clubs, coastal resorts & tourism rentals',
              text: 'Suitable for Spain, Greece, Italy and France where coastal leisure and premium water sports are mature.',
              image: '/assets/banners/market-europe-optimized.jpg',
              mobileImage: '/assets/banners/market-europe-mobile.jpg',
              width: 1100,
              height: 733
            },
            {
              market: 'Island Resorts',
              title: 'Maldives, Thailand & Indonesia resort activities',
              text: 'Practical for island hotels, lagoon experiences, water sports centers and tourism attraction packages.',
              image: '/assets/banners/market-asia-optimized.jpg',
              mobileImage: '/assets/banners/market-asia-mobile.jpg',
              width: 1100,
              height: 733
            }
          ].map((item) => (
            <article key={item.market}>
              <picture>
                <source media="(max-width: 720px)" srcSet={item.mobileImage} />
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={item.width}
                  height={item.height}
                  className="market-card-image"
                />
              </picture>
              <span>{item.market}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">{copy.mega.oem}</p>
          <h2>{t('oemTitle')}</h2>
          <p>{t('oemText')}</p>
        </div>
        <div className="trust-grid">
          {copy.homeSections.trust.map(({title, text}) => (
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
