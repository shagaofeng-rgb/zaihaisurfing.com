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
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/assets/banners/zaihai-home-hero-preview.mp4" type="video/mp4" />
      </video>
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
        <div className="hero-tags" role="list" aria-label="ZAIHAI product advantages">
          {copy.tags.map((tag) => <span role="listitem" key={tag}>{tag}</span>)}
        </div>
        <div className="hero-showcase" role="navigation" aria-label="Featured product lines">
          {copy.cards.map((card) => (
            <Link className="hero-product-card" href={card.href} key={card.title} prefetch={false}>
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
