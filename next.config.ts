import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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
        source: '/pages/contact-us',
        destination: '/en/contact',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|ar|pt|ru)/pages/contact-us',
        destination: '/:locale/contact',
        permanent: true
      },
      {
        source: '/products/zai-hai-boat-kart-15kw-best',
        destination: '/en/products/rage-shark-x',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|ar|pt|ru)/products/zai-hai-boat-kart-15kw-best',
        destination: '/:locale/products/rage-shark-x',
        permanent: true
      },
      {
        source: '/account/signIn',
        destination: '/account/login',
        permanent: true
      },
      {
        source: '/search',
        destination: '/en/products',
        permanent: true
      },
      {
        source: '/collections-all',
        destination: '/en/products',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|ar|pt|ru)/collections-all',
        destination: '/:locale/products',
        permanent: true
      },
      {
        source: '/pt-pt',
        destination: '/pt',
        permanent: true
      },
      {
        source: '/pt-pt/:path*',
        destination: '/pt/:path*',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|ar|pt|ru)/search',
        destination: '/:locale/products',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|it|pt|ru)/news/category/:category/:slug',
        destination: '/:locale/news/:slug',
        permanent: true
      },
      {
        source: '/:locale(en|es|fr|de|it|pt|ru)/news/tag/:tag/:slug',
        destination: '/:locale/news/:slug',
        permanent: true
      },
      {
        source: '/news/category/:category/:slug',
        destination: '/en/news/:slug',
        permanent: true
      },
      {
        source: '/news/tag/:tag/:slug',
        destination: '/en/news/:slug',
        permanent: true
      },
      {
        source: '/sitemap_products_1.xml',
        destination: '/sitemaps/products-1.xml',
        permanent: true
      },
      {
        source: '/sitemap_pages_1.xml',
        destination: '/sitemaps/pages-1.xml',
        permanent: true
      },
      {
        source: '/sitemap_collections_1.xml',
        destination: '/sitemaps/categories-1.xml',
        permanent: true
      },
      {
        source: '/sitemap_blogs_1.xml',
        destination: '/sitemaps/blog-1.xml',
        permanent: true
      },
      {
        source: '/sitemap_articles_1.xml',
        destination: '/sitemaps/news-1.xml',
        permanent: true
      },
      {
        source: '/sitemap_index.xml',
        destination: '/sitemap.xml',
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
