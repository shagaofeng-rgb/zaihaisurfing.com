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

const solutionSections = [
  {
    id: 'resorts-hotels',
    title: 'Resorts & Hotels',
    buyer: 'Premium guest experience teams',
    text: 'Create a high-visibility water attraction for beach resorts, island hotels, lake properties and premium guest programs. Electric surfboards help create photo and video moments, while water karts can serve a broader family audience.',
    products: ['ZAIHAI X1 Pro', 'ZAIHAI X1', 'Rage Shark X'],
    quantity: 'Starter quantity: 1-2 demo units, then scale by guest demand',
    considerations: ['Rider supervision', 'Charging area', 'Photo/video experience', 'Spare battery and safety accessories']
  },
  {
    id: 'rental-businesses',
    title: 'Rental Businesses',
    buyer: 'Fleet operators and water sports centers',
    text: 'Plan models by rider level, session length, daily turnover, maintenance workflow and local water conditions. A rental package should include spare parts before the first commercial season.',
    products: ['ZAIHAI X1', 'Rage Shark X', 'Spare parts package'],
    quantity: 'Starter quantity: 2-5 units depending on operating area',
    considerations: ['Guest turnover', 'Charging workflow', 'Maintenance parts', 'Operator training notes']
  },
  {
    id: 'water-parks',
    title: 'Water Parks',
    buyer: 'Ticketed attraction operators',
    text: 'Rage Shark X is suitable for controlled water areas where easy operation, family-friendly riding and visual attraction matter more than advanced rider skill.',
    products: ['Rage Shark X'],
    quantity: 'Starter quantity: 2+ units for attraction planning',
    considerations: ['Controlled water route', 'Safety boundary', 'Queue management', 'Charging and daily checks']
  },
  {
    id: 'yacht-clubs-marinas',
    title: 'Yacht Clubs & Marinas',
    buyer: 'High-end leisure clubs and marina operators',
    text: 'Add compact premium riding equipment as a member benefit, demo service or private buyer sales opportunity beside yachts and marina leisure spaces.',
    products: ['ZAIHAI X1 Pro', 'ZAIHAI X1'],
    quantity: 'Starter quantity: 1-3 units for member demos',
    considerations: ['Storage space', 'Premium presentation', 'Demo videos', 'Private buyer inquiries']
  },
  {
    id: 'distributors',
    title: 'Distributors',
    buyer: 'Importers, dealers and regional water sports suppliers',
    text: 'Build a local product line with electric surfboards, fuel surfboards, water karts, spare parts, model comparison support and product media for sales teams.',
    products: ['Full catalog', 'Distributor starter package'],
    quantity: 'Starter quantity: model mix to be confirmed by target market',
    considerations: ['Catalog positioning', 'OEM branding', 'Spare parts supply', 'Product media and showroom display']
  },
  {
    id: 'tourism-projects',
    title: 'Tourism Projects',
    buyer: 'Scenic lakes, island resorts, beach clubs and adventure parks',
    text: 'Match products to water area, customer profile and operating model. Tourism projects may combine easy-drive water karts with electric or fuel-powered surfboards for a stronger attraction mix.',
    products: ['Electric surfboards', 'Fuel-powered surfboards', 'Electric water karts'],
    quantity: 'Starter quantity: project recommendation required',
    considerations: ['Water area type', 'Guest skill level', 'Maintenance staff', 'Export and shipping planning']
  }
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
              <img src={scenarioImages[index]} alt={`${scenario.title} ZAIHAI water sports application`} />
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
        <div className="commercial-solution-stack">
          {solutionSections.map((section) => (
            <article className="commercial-solution-card" id={section.id} key={section.id}>
              <div>
                <p className="eyebrow">{section.buyer}</p>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </div>
              <div>
                <strong>Recommended products</strong>
                <ul>{section.products.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <strong>{section.quantity}</strong>
                <p>Key operation considerations: {section.considerations.join(' / ')}.</p>
                <Link className="button primary small" href="/contact">Request Project Recommendation</Link>
              </div>
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
