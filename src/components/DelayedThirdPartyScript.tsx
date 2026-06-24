'use client';

import {useEffect} from 'react';

const SALES_SCRIPT_ID = 'salesmartly-widget-script';
const SALES_SCRIPT_SRC = 'https://plugin-code.salesmartly.com/js/project_653905_759291_1780551668.js';

export default function DelayedThirdPartyScript() {
  useEffect(() => {
    let loaded = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadScript = () => {
      if (loaded || document.getElementById(SALES_SCRIPT_ID)) return;
      loaded = true;
      const script = document.createElement('script');
      script.id = SALES_SCRIPT_ID;
      script.src = SALES_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    };

    const scheduleFallbackLoad = () => {
      timer = setTimeout(() => {
        const hasRealEngagement = document.visibilityState === 'visible' && (window.scrollY > 1200 || document.activeElement?.tagName === 'INPUT');
        if (hasRealEngagement) loadScript();
      }, 45000);
    };

    const interactionEvents = ['pointerdown', 'keydown', 'touchstart'];
    interactionEvents.forEach((eventName) => window.addEventListener(eventName, loadScript, {once: true, passive: true}));
    scheduleFallbackLoad();

    return () => {
      if (timer) clearTimeout(timer);
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, loadScript));
    };
  }, []);

  return null;
}
