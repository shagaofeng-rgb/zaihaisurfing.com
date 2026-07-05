import type {MetadataRoute} from 'next';
import {locales, pathnames} from '@/i18n/routing';
import {getAllBlogSlugs} from '@/lib/blogFeed';
import {getAllNewsSlugs} from '@/lib/newsFeed';
import {siteUrl, productSlugs} from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogSlugs, newsSlugs] = await Promise.all([getAllBlogSlugs(), getAllNewsSlugs()]);
  const staticPaths = Array.from(new Set([
    ...pathnames,
    '/blog',
    ...blogSlugs.map((slug) => `/blog/${slug}`),
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
