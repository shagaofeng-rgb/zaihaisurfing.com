import {Link} from '@/i18n/navigation';
import VisualIcon from '@/components/VisualIcon';
import type {SupportPageSlug} from '@/lib/supportPages';
import {supportPages} from '@/lib/supportPages';

export default function SupportPage({slug}: {slug: SupportPageSlug}) {
  const page = supportPages[slug];

  const faq = slug === 'faq';
  const links = faq ? <>
    <Link href="/shipping">Shipping</Link><Link href="/warranty">Warranty</Link><Link href="/returns">Returns</Link>
  </> : page.sections.map((section, index) => <a href={`#support-${index+1}`} key={section.title}>{section.title}</a>);

  return (
    <main className="interior-page design-support">
      <section className="page-hero design-mast">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
      </section>
      <section className="section support-page-section">
        <nav className="support-toc" aria-label={faq ? 'Related support' : 'On this page'}><strong>{faq ? 'Related support' : 'On this page'}</strong>{links}</nav>
        <div>
          <details className="support-toc-mobile"><summary>{faq ? 'Related support' : 'On this page'}</summary>{links}</details>
          {faq ? <div className="support-faq">{page.sections.map((section) => (
            <details key={section.title}><summary>{section.title}</summary><p>{section.text}</p></details>
          ))}</div> : <div className="support-page-grid">{page.sections.map((section,index) => (
            <article className="info-card" id={`support-${index+1}`} key={section.title}>
              <h2>{section.title}</h2><p>{section.text}</p>
            </article>
          ))}</div>}
          <div className="support-faq-links"><Link href="/contact"><VisualIcon name="support" size={17} /> Contact ZAIHAI support</Link></div>
        </div>
      </section>
    </main>
  );
}
