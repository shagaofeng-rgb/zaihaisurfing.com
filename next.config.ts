import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/sitemap_products_1.xml',
        destination: '/sitemap.xml',
        permanent: true
      },
      {
        source: '/sitemap_pages_1.xml',
        destination: '/sitemap.xml',
        permanent: true
      },
      {
        source: '/sitemap_collections_1.xml',
        destination: '/sitemap.xml',
        permanent: true
      },
      {
        source: '/sitemap_blogs_1.xml',
        destination: '/news-sitemap.xml',
        permanent: true
      },
      {
        source: '/sitemap_articles_1.xml',
        destination: '/news-sitemap.xml',
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
