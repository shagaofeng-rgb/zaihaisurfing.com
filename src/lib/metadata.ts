import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {alternatesFor, canonicalFor, siteUrl} from './site';

const defaultOgImage = {
  url: `${siteUrl}/assets/banners/zaihai-main-banner-desktop-optimized.jpg`,
  width: 1200,
  height: 630,
  alt: 'ZAIHAI electric surfboards and go-kart boats for resorts and distributors'
};

export function localizedMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalFor(locale, path),
      languages: {
        ...alternatesFor(path),
        'x-default': canonicalFor('en', path)
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalFor(locale, path),
      siteName: 'ZAIHAI SURFING',
      images: [defaultOgImage],
      type: 'website',
      locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOgImage.url]
    }
  };
}
