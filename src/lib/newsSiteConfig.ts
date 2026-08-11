import rawSites from '../../content/news-sites/zaihai-global.json';

export type NewsSourceConfig = {
  domain: string;
  type: string;
  allowed_topics: string[];
  allowed_languages: string[];
  rss_or_api_url: string;
  source_trust_score: number;
};

export type NewsSiteConfig = {
  site_id: string;
  enabled: boolean;
  brand_name: string;
  site_url: string;
  industry: string;
  industry_scope: string;
  target_markets: string[];
  publication_language: string;
  locale: string;
  timezone: string;
  news: {
    enabled: boolean;
    list_route: string;
    detail_route_pattern: string;
    rss_route: string;
    sitemap_route: string;
    desired_word_count: {min: number; max: number};
    ingest_interval_hours: number;
    publish_interval_hours: number;
    candidate_max_age_hours: number;
    fallback_candidate_max_age_days: number;
    min_score: number;
    max_internal_product_links: number;
    default_author_type: string;
    neutral_images: string[];
  };
  blog: {
    enabled: boolean;
    list_route: string;
    detail_route_pattern: string;
    sitemap_route: string;
    content_source: string;
    allow_news_automation: boolean;
  };
  product_theme_plan: Array<{
    theme_id: string;
    product_url: string;
    product_name: string;
    start_at: string;
    end_at: string;
    status: string;
  }>;
  sources: {
    primary_whitelist: NewsSourceConfig[];
    fallback_whitelist: NewsSourceConfig[];
  };
  publishing: {
    cms_adapter: string;
    content_status_after_publish: 'published';
    require_frontend_verification: boolean;
    alert_channel: string;
    production_enabled: boolean;
  };
};

export const newsSites = rawSites as NewsSiteConfig[];

export function getNewsSite(siteId: string) {
  return newsSites.find((site) => site.site_id === siteId) || null;
}

export function defaultNewsSite() {
  return newsSites[0] || null;
}

export function validateNewsSiteConfig(site: NewsSiteConfig) {
  const issues: string[] = [];
  if (!site.site_id || !site.brand_name || !site.industry_scope) issues.push('site_id, brand_name and industry_scope are required.');
  try { new URL(site.site_url); } catch { issues.push('site_url is invalid.'); }
  if (!site.news.list_route || !site.news.detail_route_pattern || !site.news.rss_route || !site.news.sitemap_route) issues.push('News routes are incomplete.');
  if (!site.timezone || !site.publication_language) issues.push('timezone and publication_language are required.');
  if (!site.product_theme_plan.some((item) => item.status === 'active')) issues.push('At least one active product theme is required.');
  if (!site.sources.primary_whitelist.length || !site.sources.fallback_whitelist.length) issues.push('Primary and fallback source whitelists are required.');
  if (site.blog.allow_news_automation) issues.push('Blog must not allow News automation.');
  return issues;
}
