'use client';

import {useEffect, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

function getId(storage: Storage, key: string, prefix: string) {
  let value = storage.getItem(key);
  if (!value) {
    value = `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    storage.setItem(key, value);
  }
  return value;
}

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', new Blob([body], {type: 'application/json'}));
    return;
  }
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
    keepalive: true
  }).catch(() => {});
}

function safeLinkTarget(link: HTMLAnchorElement) {
  const href = link.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (/whatsapp/i.test(href)) return 'whatsapp';
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin ? url.pathname : url.hostname;
  } catch {
    return '';
  }
}

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || ''
  };
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPage = useRef('');

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    const page = `${pathname || '/'}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    if (previousPage.current === page) return;
    const base = {
      visitorId: getId(window.localStorage, 'zaihai_visitor_id', 'v'),
      sessionId: getId(window.sessionStorage, 'zaihai_session_id', 's'),
      page,
      previousPage: previousPage.current,
      pageTitle: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      language: document.documentElement.lang || navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      ...readUtm()
    };
    sendEvent({...base, type: 'page_view'});
    if (pathname?.includes('/products/')) sendEvent({...base, type: 'product_view'});
    if (pathname?.includes('/checkout')) sendEvent({...base, type: 'checkout_start'});
    previousPage.current = page;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return undefined;

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;
      const text = link.textContent?.trim().slice(0, 120) || '';
      const targetKind = safeLinkTarget(link);
      if (/buy now|checkout|quote|whatsapp|get project quote|contact|send/i.test(text) || ['email', 'phone', 'whatsapp'].includes(targetKind)) {
        sendEvent({
          type: 'commerce_click',
          visitorId: getId(window.localStorage, 'zaihai_visitor_id', 'v'),
          sessionId: getId(window.sessionStorage, 'zaihai_session_id', 's'),
          page: window.location.pathname,
          pageTitle: document.title,
          targetText: text,
          targetKind,
          language: document.documentElement.lang || navigator.language,
          timestamp: new Date().toISOString()
        });
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
