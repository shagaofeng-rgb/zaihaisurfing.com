'use client';

import {useState} from 'react';

const filters = [
  {id: 'all', label: 'All models'}, {id: 'electric', label: 'Electric surfboards'},
  {id: 'kart', label: 'Go-kart boats'}, {id: 'fuel', label: 'Fuel-powered surfboards'}
];

export default function CatalogFilters({children, electric, fuel}: {
  children: React.ReactNode;
  electric: React.ReactNode;
  fuel: React.ReactNode;
}) {
  const [filter, setFilter] = useState('all');
  const [series, setSeries] = useState<'electric' | 'fuel'>('electric');

  function chooseFilter(id: string) {
    setFilter(id);
    if (id === 'electric' || id === 'fuel') setSeries(id);
  }

  return <div className="catalog-filter" data-filter={filter}>
    <div className="catalog-filter-tabs" role="group" aria-label="Filter product models">
      {filters.map(({id, label}) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => chooseFilter(id)}>{label}</button>)}
    </div>
    <p className="catalog-count" aria-live="polite">Showing {filters.find(({id}) => id === filter)?.label.toLowerCase()}</p>
    {children}
    {electric || fuel ? <section className="catalog-comparison" id="compare" aria-labelledby="catalog-compare-title">
      <h2 id="catalog-compare-title">Compare models</h2>
      <p>Compare boards of the same power type using matching specifications.</p>
      {electric && fuel ? <div className="catalog-filter-tabs" role="group" aria-label="Comparison power type">
        <button type="button" aria-pressed={series === 'electric'} onClick={() => setSeries('electric')}>Electric boards</button>
        <button type="button" aria-pressed={series === 'fuel'} onClick={() => setSeries('fuel')}>Fuel boards</button>
      </div> : null}
      <div hidden={Boolean(electric && fuel && series !== 'electric')}>{electric}</div>
      <div hidden={Boolean(electric && fuel && series !== 'fuel')}>{fuel}</div>
    </section> : null}
  </div>;
}
