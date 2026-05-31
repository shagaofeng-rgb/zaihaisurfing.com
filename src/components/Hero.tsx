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
      </div>
    </section>
  );
}
