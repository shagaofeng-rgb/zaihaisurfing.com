'use client';

import {useEffect, type RefObject} from 'react';

export function useDismissDisclosure(ref: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    const disclosure = ref.current;
    if (!disclosure) return;

    function dismissOutside(event: PointerEvent) {
      if (disclosure?.open && event.target instanceof Node && !disclosure.contains(event.target)) disclosure.open = false;
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (!disclosure?.open || event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      disclosure.open = false;
      disclosure.querySelector('summary')?.focus();
    }

    document.addEventListener('pointerdown', dismissOutside);
    disclosure.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      disclosure.removeEventListener('keydown', dismissOnEscape);
    };
  }, [ref]);
}
