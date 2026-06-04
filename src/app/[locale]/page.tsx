import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import Hero from '@/components/Hero';
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
            <video controls muted loop playsInline preload="metadata" poster="/assets/banners/zaihai-video-poster.png" aria-label="ZAIHAI electric surfboard riding video">
              <source src="/assets/banners/zaihai-video-3.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

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
              image: '/assets/banners/market-middle-east.png'
            },
            {
              market: 'United States',
              title: 'Lake rentals, marinas & adventure operators',
              text: 'Ideal for Florida, California, lake resorts, rental businesses and outdoor recreation distributors.',
              image: '/assets/banners/market-north-america.png'
            },
            {
              market: 'Mediterranean Europe',
              title: 'Beach clubs, coastal resorts & tourism rentals',
              text: 'Suitable for Spain, Greece, Italy and France where coastal leisure and premium water sports are mature.',
              image: '/assets/banners/market-europe.png'
            },
            {
              market: 'Island Resorts',
              title: 'Maldives, Thailand & Indonesia resort activities',
              text: 'Practical for island hotels, lagoon experiences, water sports centers and tourism attraction packages.',
              image: '/assets/banners/market-asia.png'
            }
          ].map((item) => (
            <article key={item.market} style={{'--market-bg': `url(${item.image})`} as React.CSSProperties}>
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
