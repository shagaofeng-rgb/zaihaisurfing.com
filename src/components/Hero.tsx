import {Link} from '@/i18n/navigation';

type HeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  primary?: string;
  secondary?: string;
};

export default function Hero({eyebrow, title, intro, primary, secondary}: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-media" role="img" aria-label={title} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{intro}</p>
        {(primary || secondary) && (
          <div className="hero-actions">
            {primary && (
              <Link className="button primary" href="/contact">
                {primary}
              </Link>
            )}
            {secondary && (
              <Link className="button ghost" href="/products">
                {secondary}
              </Link>
            )}
          </div>
        )}
        <div className="hero-showcase" aria-label="Featured product lines">
          <Link className="hero-product-card" href="/products">
            <span>Electric Surfboards</span>
            <strong>X1 Pro / X1 Series</strong>
            <em>High-speed attraction for beach clubs, lakeside rentals and resort guests.</em>
          </Link>
          <Link className="hero-product-card" href="/products/rage-shark-x">
            <span>Electric Water Karts</span>
            <strong>Rage Shark X</strong>
            <em>Easy-drive water kart experience for resorts, water parks and family activities.</em>
          </Link>
          <Link className="hero-product-card" href="/products/p1-pro">
            <span>Fuel Surfboards</span>
            <strong>P1 / P1 Pro Series</strong>
            <em>Longer riding time for outdoor adventure operators and distribution projects.</em>
          </Link>
        </div>
      </div>
    </section>
  );
}
