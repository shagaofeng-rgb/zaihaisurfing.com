import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/applications', seo('applicationsTitle'), seo('applicationsDescription'));
}

const scenarios = [
  {
    title: 'Resorts & Hotels',
    label: 'Guest experience upgrade',
    text: 'Create a premium water attraction for beach resorts, lake hotels and island properties. ZAIHAI electric surfboards add a fast, photogenic activity without requiring natural waves.',
    products: 'Recommended: X1 Pro / X1 electric surfboards',
    href: '/products/x1-pro'
  },
  {
    title: 'Rental Businesses',
    label: 'Fleet revenue and durability',
    text: 'For commercial rental operators, the focus is easy operation, repeatable maintenance and clear spare parts support. We help match models by rider level, session length and local water conditions.',
    products: 'Recommended: X1, Rage Shark X and spare parts package',
    href: '/products'
  },
  {
    title: 'Water Parks',
    label: 'Family-friendly attraction',
    text: 'Rage Shark X works well for controlled water areas where guests want a fun driving experience. It is visually strong, easy to understand and suitable for ticketed entertainment projects.',
    products: 'Recommended: Rage Shark X electric water kart',
    href: '/products/rage-shark-x'
  },
  {
    title: 'Yacht Clubs',
    label: 'Premium leisure add-on',
    text: 'For yacht clubs and marina service teams, compact electric surfboards can become an extra member benefit, demo product or high-end leisure add-on for private buyers.',
    products: 'Recommended: X1 Pro electric surfboard',
    href: '/products/x1-pro'
  },
  {
    title: 'Distributors',
    label: 'Market-ready product line',
    text: 'Distributors need clear product positioning, packaging, videos, model comparison and after-sales support. We provide product data, catalog material and export cooperation support.',
    products: 'Recommended: full catalog and distributor inquiry',
    href: '/contact'
  }
];

export default async function ApplicationsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'applications'});
  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Applications</p>
          <h1>{t('h1')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>
      <section className="application-section">
        <div className="application-intro-band">
          <div>
            <p className="eyebrow">Buyer Fit</p>
            <h2>Choose products by business model, not only by speed.</h2>
          </div>
          <p>
            Different buyers care about different outcomes: guest attraction, rental return, family safety, premium leisure or distributor margin. This section helps overseas buyers quickly understand where each ZAIHAI product line fits.
          </p>
        </div>
        <div className="application-scenario-grid">
          {scenarios.map((scenario) => (
            <article className="application-card" key={scenario.title}>
              <span>{scenario.label}</span>
              <h3>{scenario.title}</h3>
              <p>{scenario.text}</p>
              <strong>{scenario.products}</strong>
              <Link className="text-link" href={scenario.href}>
                View solution
              </Link>
            </article>
          ))}
        </div>
        <div className="application-cta-strip">
          <div>
            <p className="eyebrow">Project Matching</p>
            <h2>Not sure which model fits your local market?</h2>
            <p>Send your target country, buyer type, water area and expected quantity. We will suggest a product combination for your resort, rental fleet or distribution plan.</p>
          </div>
          <Link className="button primary" href="/contact">
            Send Your Requirements
          </Link>
        </div>
      </section>
    </main>
  );
}
