import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {alternatesFor, canonicalFor} from './site';

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
      images: ['/assets/banners/zaihai-main-banner.png'],
      type: 'website',
      locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/assets/banners/zaihai-main-banner.png']
    }
  };
}
