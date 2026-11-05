import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {localizedMetadata} from '@/lib/metadata';
import {uiCopy} from '@/lib/uiCopy';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const seo = await getTranslations({locale, namespace: 'seo'});
  return localizedMetadata(locale, '/factory', seo('factoryTitle'), seo('factoryDescription'));
}

export default async function FactoryPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const copy = uiCopy[locale].factoryPage;

  return (
    <main className="interior-page design-factory">
      <section className="story-hero">
        <div className="story-hero-inner"><div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{locale === 'en' ? 'Configure. Inspect. Prepare to ship.' : copy.h1}</h1>
          <p>{copy.intro}</p>
          <Link className="button primary" href="/contact">Discuss your project</Link>
        </div>
          <img src="/assets/home-ocean/export-support.jpg" alt="ZAIHAI export preparation and logistics" width="850" height="540" fetchPriority="high" />
        </div>
      </section>
      <section className="quality-section" id="oem-distributor">
        <div className="section-heading">
          <p className="eyebrow">{copy.supportTitle}</p>
          <h2>{copy.supportTitle}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className="quality-support-grid">
          {copy.support.map((item,index) => (
            <article className="info-card" key={item.title}>
              <img src={`/assets/home-ocean/resort-${['electric','kart','fuel'][index % 3]}.webp`} alt={item.title} width="600" height="400" loading="lazy" decoding="async" /><div><h3>{item.title}</h3>
              <p>{item.text}</p></div>
            </article>
          ))}
        </div>
        <div className="quality-workflow">
          <div>
            <p className="eyebrow">{copy.workflowTitle}</p>
            <h2>{copy.workflowTitle}</h2>
          </div>
          <ol>
            {copy.workflow.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
        <div className="quality-two-col">
          <article>
            <p className="eyebrow">{copy.oemTitle}</p>
            <h2>{copy.oemTitle}</h2>
            <ul>
              {copy.oem.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article>
            <p className="eyebrow">{copy.docsTitle}</p>
            <h2>{copy.docsTitle}</h2>
            <ul>
              {copy.docs.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
        <div className="application-cta-strip">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
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
