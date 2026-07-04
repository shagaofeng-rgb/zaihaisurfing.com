import type {MetadataRoute} from 'next';
import {locales, pathnames} from '@/i18n/routing';
import {getAllNewsSlugs} from '@/lib/newsFeed';
import {siteUrl, productSlugs} from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const newsSlugs = await getAllNewsSlugs();
  const staticPaths = Array.from(new Set([
    ...pathnames,
    '/news',
    ...productSlugs.map((slug) => `/products/${slug}`),
    ...newsSlugs.map((slug) => `/news/${slug}`)
  ]));

  return staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}${path}`])),
          'x-default': `${siteUrl}/en${path}`
        }
      }
    }))
  );
}
