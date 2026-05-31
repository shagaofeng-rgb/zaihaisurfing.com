import type {MetadataRoute} from 'next';
import {locales, pathnames} from '@/i18n/routing';
import {siteUrl, productSlugs} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [...pathnames, '/checkout', ...productSlugs.map((slug) => `/products/${slug}`)];

  return staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}${path}`]))
      }
    }))
  );
}
