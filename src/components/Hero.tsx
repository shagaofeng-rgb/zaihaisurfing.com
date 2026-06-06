import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';

type HeroProps = {
  locale: Locale;
};

export default function Hero({locale}: HeroProps) {
  const copy = uiCopy[locale].hero;

  return (
    <section className="hero" id="top">
      <link rel="preload" as="image" href="/assets/banners/zaihai-main-banner-mobile.jpg" media="(max-width: 720px)" />
      <link rel="preload" as="image" href="/assets/banners/zaihai-main-banner-desktop.jpg" media="(min-width: 721px)" />
      <picture className="hero-media">
        <source media="(max-width: 720px)" srcSet="/assets/banners/zaihai-main-banner-mobile.jpg" />
        <img
          src="/assets/banners/zaihai-main-banner-desktop.jpg"
          alt={copy.title}
          width="1600"
          height="686"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="hero-copy">{copy.intro}</p>
        <div className="hero-actions">
          <Link className="button primary" href="/products">
            {copy.shop}
          </Link>
          <Link className="button ghost" href="/contact">
            {copy.quote}
          </Link>
          <Link className="button ghost" href="#riding-video">
            {copy.watch}
          </Link>
        </div>
        <div className="hero-tags" aria-label="ZAIHAI product advantages">
          {copy.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="hero-showcase" aria-label="Featured product lines">
          {copy.cards.map((card) => (
            <Link className="hero-product-card" href={card.href} key={card.title}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <em>{card.text}</em>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
