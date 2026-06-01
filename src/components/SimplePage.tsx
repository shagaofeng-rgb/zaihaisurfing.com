type SimplePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cards?: string[];
};

export default function SimplePage({eyebrow, title, intro, cards = []}: SimplePageProps) {
  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      {cards.length > 0 && (
        <section className="section">
          <div className="card-grid">
            {cards.map((card) => (
              <article className="info-card" key={card}>
                <h3>{card}</h3>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
