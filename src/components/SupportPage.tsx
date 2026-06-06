import type {SupportPageSlug} from '@/lib/supportPages';
import {supportPages} from '@/lib/supportPages';

export default function SupportPage({slug}: {slug: SupportPageSlug}) {
  const page = supportPages[slug];

  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
      </section>
      <section className="section support-page-section">
        <div className="support-page-grid">
          {page.sections.map((section) => (
            <article className="info-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
