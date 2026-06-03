import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';

const serve = ['Resorts', 'Rental operators', 'Water parks', 'Yacht clubs', 'Distributors', 'Tourism project companies', 'Private premium buyers'];
const support = ['Product selection', 'Model comparison', 'OEM/ODM customization', 'Distributor cooperation', 'Export documentation', 'Battery shipping notes', 'Pre-shipment checking', 'Spare parts planning', 'Product media support'];
const reasons = [
  'Clear product positioning for commercial water entertainment buyers.',
  'Application guidance for resorts, rentals, water parks and distributors.',
  'Project-based model recommendation instead of generic catalog selling.',
  'Export-ready packaging, documents and shipment communication support.',
  'Support for trial orders, rental fleet planning and bulk distributor orders.'
];

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/about', seo('aboutTitle'), seo('aboutDescription'));
}

export default async function AboutPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'about'});

  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">About ZAIHAI SURFING</p>
          <h1>{t('h1')}</h1>
          <p>{t('intro')} ZAIHAI SURFING is operated by Quzhou Qiying Import & Export Co., Ltd.</p>
        </div>
      </section>

      <section className="section about-story">
        <div className="section-heading">
          <p className="eyebrow">Premium water sports equipment brand</p>
          <h2>Water sports equipment for commercial projects and global buyers</h2>
          <p>
            ZAIHAI SURFING focuses on electric surfboards, fuel-powered surfboards, electric go-kart boats and commercial water entertainment product supply for overseas buyers. We help buyers compare models, plan project packages, prepare spare parts and coordinate export support before shipment.
          </p>
        </div>
        <div className="about-split-grid">
          <article>
            <h3>Who We Serve</h3>
            <ul>{serve.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <h3>What We Support</h3>
            <ul>{support.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Why buyers work with ZAIHAI</p>
          <h2>Built for buyers who need more than a product listing</h2>
        </div>
        <div className="trust-grid">
          {reasons.map((reason) => (
            <article className="info-card" key={reason}>
              <h3>{reason.split(' ').slice(0, 4).join(' ')}</h3>
              <p>{reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="project-cta">
        <p className="eyebrow">Start your water sports project</p>
        <h3>Need model recommendation, distributor pricing or export support?</h3>
        <p>Send your target market, water area, preferred product line and expected quantity. ZAIHAI will help you prepare a practical product package.</p>
        <Link className="button primary" href="/contact">Start Your Water Sports Project</Link>
      </section>
    </main>
  );
}
