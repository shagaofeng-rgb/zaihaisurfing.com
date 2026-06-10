import type {MetadataRoute} from 'next';
import {locales, pathnames} from '@/i18n/routing';
import {newsCategories, newsSlugs, newsTags} from '@/lib/news';
import {siteUrl, productSlugs} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = Array.from(new Set([
    ...pathnames,
    '/news',
    '/checkout',
    ...productSlugs.map((slug) => `/products/${slug}`),
    ...newsSlugs.map((slug) => `/blog/${slug}`),
    ...newsSlugs.map((slug) => `/news/${slug}`),
    ...newsCategories.map((category) => `/news/category/${category.slug}`),
    ...newsTags.map((tag) => `/news/tag/${tag.slug}`)
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
