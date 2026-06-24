'use client';

import {useEffect} from 'react';

const OWN_FLOATING_SELECTORS = [
  '.mobile-bottom-cta',
  '.back-to-top',
  '.whatsapp-float',
  '.site-header',
  '.mobile-menu',
  '.mobile-header-whatsapp',
  '.mobile-header-quote'
].join(',');

export default function FloatingWidgetGuard() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let observer: MutationObserver | undefined;

    const protectBottomCta = () => {
      if (window.innerWidth > 660) return;

      document.querySelectorAll('body *').forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        if (element.closest(OWN_FLOATING_SELECTORS)) return;

        const style = window.getComputedStyle(element);
        if (style.position !== 'fixed') return;

        const rect = element.getBoundingClientRect();
        const isSmallLauncher = rect.width >= 28 && rect.width <= 120 && rect.height >= 28 && rect.height <= 120;
        const isBottomRight = rect.right > window.innerWidth - 140 && rect.bottom > window.innerHeight - 150;

        if (!isSmallLauncher || !isBottomRight) return;

        const right = 'calc(12px + env(safe-area-inset-right, 0px))';
        const bottom = 'calc(92px + env(safe-area-inset-bottom, 0px))';
        if (element.style.getPropertyValue('right') !== right) {
          element.style.setProperty('right', right, 'important');
        }
        if (element.style.getPropertyValue('bottom') !== bottom) {
          element.style.setProperty('bottom', bottom, 'important');
        }
      });
    };

    const startGuard = () => {
      protectBottomCta();
      timer = setInterval(protectBottomCta, 1600);
      window.addEventListener('resize', protectBottomCta);
      window.addEventListener('scroll', protectBottomCta, {passive: true});

      observer = new MutationObserver(protectBottomCta);
      observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class']});
    };

    startTimer = setTimeout(startGuard, 6000);

    return () => {
      if (timer) clearInterval(timer);
      if (startTimer) clearTimeout(startTimer);
      window.removeEventListener('resize', protectBottomCta);
      window.removeEventListener('scroll', protectBottomCta);
      observer?.disconnect();
    };
  }, []);

  return null;
}
