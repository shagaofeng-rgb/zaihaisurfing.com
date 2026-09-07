import type {Metadata} from 'next';
import type {Locale} from '@/i18n/routing';
import {alternatesFor, canonicalFor, siteUrl} from './site';

const defaultOgImage = {
  url: `${siteUrl}/assets/banners/zaihai-main-banner-desktop-optimized.jpg`,
  width: 1200,
  height: 630,
  alt: 'ZAIHAI electric surfboards and go-kart boats for resorts and distributors'
};

type MetadataImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function localizedMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  image: MetadataImage = defaultOgImage
): Metadata {
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
      images: [image],
      type: 'website',
      locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url]
    }
  };
}

export function englishOnlyEditorialMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  image: MetadataImage = defaultOgImage
): Metadata {
  const canonical = canonicalFor('en', path);
  // Build this metadata independently so English-only editorial routes never
  // inherit language alternates for variants that intentionally redirect.
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {en: canonical, 'x-default': canonical}
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'ZAIHAI SURFING',
      images: [image],
      type: 'website',
      locale: 'en'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url]
    },
    ...(locale !== 'en' ? {robots: {index: false, follow: true}} : {})
  };
}
