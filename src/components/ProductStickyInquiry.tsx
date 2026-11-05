'use client';

import {useEffect, useState} from 'react';

export default function ProductStickyInquiry({name, href, label}: {name: string; href: string; label: string}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('product-first-view');
    const quote = document.getElementById('product-final-inquiry');
    if (!hero || !quote) return;

    const observer = new IntersectionObserver(() => {
      const heroPassed = hero.getBoundingClientRect().bottom <= 0;
      const quoteReached = quote.getBoundingClientRect().top < window.innerHeight;
      setVisible(heroPassed && !quoteReached);
    });
    observer.observe(hero);
    observer.observe(quote);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;
  return <aside className="fixed-inquire" aria-label={label}>
    <strong>{name}</strong><a className="button primary" href={href}>{label}</a>
  </aside>;
}
