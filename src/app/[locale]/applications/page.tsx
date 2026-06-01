import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {uiCopy} from '@/lib/uiCopy';

const scenarioImages = [
  '/assets/banners/zaihai-main-banner.png',
  '/assets/catalog/x1/main.png',
  '/assets/catalog/rage-shark-x/main-boat.png',
  '/assets/catalog/x1-pro/product.png',
  '/assets/catalog/p1-pro/scene-01.png',
  '/assets/catalog/p1/main.png'
];

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/applications', seo('applicationsTitle'), seo('applicationsDescription'));
}

export default async function ApplicationsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const copy = uiCopy[locale].applicationsPage;

  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.h1}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>
      <section className="application-section">
        <div className="application-intro-band">
          <div>
            <p className="eyebrow">{copy.buyerFit}</p>
            <h2>{copy.matrixTitle}</h2>
          </div>
          <p>{copy.matrixText}</p>
        </div>
        <div className="application-scenario-grid">
          {copy.scenarios.map((scenario, index) => (
            <article className="application-card" key={scenario.title}>
              <img src={scenarioImages[index]} alt={`${scenario.title} ZAIHAI water sports application`} loading="lazy" />
              <span>{scenario.label}</span>
              <h3>{scenario.title}</h3>
              <p>{scenario.text}</p>
              <strong>{scenario.products}</strong>
              <Link className="text-link" href={scenario.href}>
                {scenario.cta}
              </Link>
            </article>
          ))}
        </div>
        <div className="application-cta-strip">
          <div>
            <p className="eyebrow">{copy.ctaEyebrow}</p>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaText}</p>
          </div>
          <Link className="button primary" href="/contact">
            {copy.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
