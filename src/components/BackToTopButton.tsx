'use client';

import {useEffect, useState} from 'react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
