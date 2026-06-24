import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const sharedDisallow = ['/admin/', '/pricing-admin/', '/api/'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: sharedDisallow
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Applebot', 'Google-Extended'],
        allow: '/',
        disallow: sharedDisallow
      }
    ],
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/news-sitemap.xml`, `${siteUrl}/news/rss.xml`],
    host: siteUrl
  };
}
