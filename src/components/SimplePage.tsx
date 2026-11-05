import {Link} from '@/i18n/navigation';
import DesignIcon from '@/components/DesignIcon';

type SimplePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cards?: string[];
};

export default function SimplePage({eyebrow, title, intro, cards = []}: SimplePageProps) {
  return (
    <main className="interior-page design-projects">
      <section className="page-hero design-mast design-mast-dark">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      {cards.length > 0 && (
        <section className="section">
          <div className="section-heading"><h2>Project pathways</h2><p>Explore configurations for the environments we serve.</p></div>
          <div className="card-grid">
            {cards.map((card,index) => (
              <article className="info-card" key={card}>
                <img className="project-design-photo" src={['/assets/home-ocean/resort-electric.webp','/assets/home-ocean/resort-kart.webp','/assets/home-ocean/resort-fuel.webp'][index % 3]} alt={card} width="600" height="400" loading="lazy" decoding="async" /><div className="project-design-copy"><DesignIcon name={['ride','operation','global'][index % 3] as 'ride' | 'operation' | 'global'} /><h3>{card}</h3><p>Plan the model mix, operating area and support package for your water sports project.</p><Link className="button dark" href="/contact">Discuss your project</Link></div>
              </article>
            ))}
          </div>
        </section>
      )}
    <section className="section projects-process">
      <div className="section-heading"><h2>From requirements to delivery</h2><p>Bring your water area, expected quantity and destination.</p></div>
      <ol>
        <li><strong>Define the activity</strong><p>Describe riders, supervision and the launch area.</p></li>
        <li><strong>Compare configurations</strong><p>Review models, accessories and spares.</p></li>
        <li><strong>Confirm the delivery plan</strong><p>Agree on packing, freight and operator support.</p></li>
      </ol>
    </section>
    <section className="project-cta"><p className="eyebrow">PROJECT PLANNING</p><h3>Ready to discuss your project?</h3><p>Share your operating area, preferred models, quantity and destination.</p><Link className="button primary" href="/contact">Contact ZAIHAI</Link></section>
    </main>
  );
}
