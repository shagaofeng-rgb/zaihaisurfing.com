export const MAX_SITEMAP_URLS = 45_000;
export const MAX_SITEMAP_BYTES = 45 * 1024 * 1024;

export type SitemapSection = 'pages' | 'products' | 'posts' | 'categories';

export type SitemapEntry = {
  section: SitemapSection;
  url: string;
  lastModified: string;
  alternates?: Record<string, string>;
};

export type SitemapPart = {
  section: SitemapSection;
  file: string;
  url: string;
  lastModified: string;
  entries: SitemapEntry[];
};

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function validLastModified(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function isIndexableRecord(input: {
  status?: string;
  noindex?: boolean;
  canonicalSelf?: boolean;
  deleted?: boolean;
}) {
  if (input.deleted || input.noindex || input.canonicalSelf === false) return false;
  return !input.status || input.status === 'published';
}

function renderAlternateLinks(alternates?: Record<string, string>) {
  if (!alternates) return '';
  return Object.entries(alternates)
    .map(([language, href]) => `\n    <xhtml:link rel="alternate" hreflang="${xmlEscape(language)}" href="${xmlEscape(href)}" />`)
    .join('');
}

export function renderSitemapUrl(entry: SitemapEntry) {
  const lastModified = validLastModified(entry.lastModified);
  return `  <url>\n    <loc>${xmlEscape(entry.url)}</loc>${lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : ''}${renderAlternateLinks(entry.alternates)}\n  </url>`;
}

export function renderSitemap(entries: SitemapEntry[]) {
  const body = entries.map(renderSitemapUrl).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>`;
}

export function renderSitemapIndex(parts: Array<Pick<SitemapPart, 'url' | 'lastModified'>>) {
  const body = parts.map((part) => {
    const lastModified = validLastModified(part.lastModified);
    return `  <sitemap>\n    <loc>${xmlEscape(part.url)}</loc>${lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : ''}\n  </sitemap>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>`;
}

export function chunkSitemapEntries(
  entries: SitemapEntry[],
  maxUrls = MAX_SITEMAP_URLS,
  maxBytes = MAX_SITEMAP_BYTES
) {
  const chunks: SitemapEntry[][] = [];
  let current: SitemapEntry[] = [];
  let currentBytes = 0;

  for (const entry of entries) {
    const entryBytes = Buffer.byteLength(renderSitemapUrl(entry), 'utf8') + 1;
    if (current.length && (current.length >= maxUrls || currentBytes + entryBytes > maxBytes)) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(entry);
    currentBytes += entryBytes;
  }

  if (current.length || !chunks.length) chunks.push(current);
  return chunks;
}

export function validateSitemapXml(xml: string, expectedRoot: 'urlset' | 'sitemapindex') {
  const trimmed = xml.trim();
  if (!trimmed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) return false;
  if (!trimmed.includes(`<${expectedRoot}`) || !trimmed.endsWith(`</${expectedRoot}>`)) return false;
  return !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(trimmed);
}
