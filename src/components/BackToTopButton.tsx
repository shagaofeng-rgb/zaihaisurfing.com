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
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5.25 5.6 11.65l1.55 1.55 3.75-3.75V20h2.2V9.45l3.75 3.75 1.55-1.55L12 5.25Z" />
      </svg>
    </button>
  );
}
