import {siteUrl} from '@/lib/site';

export type SourceImageResult = {
  url: string;
  sourceUrl: string;
  pageUrl: string;
  alt: string;
  status: 'validated' | 'illustrative' | 'ai-illustrative';
  fetchedAt: string;
  contentType: string;
  size: number;
};

type ImageFallback = {
  url: string;
  pageUrl: string;
  sourceUrl: string;
  alt: string;
  status: 'illustrative' | 'ai-illustrative';
};

// These are deliberately broad editorial illustrations. They are only used when a
// source page has no usable original image, and are rotated without reuse.
const editorialFallbackImages: ImageFallback[] = [
  {
    url: 'https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Ocean sports editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Coastal destination editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Beach market editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Marina operations editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Open water editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Waterfront travel editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Marine innovation editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Sea safety editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Outdoor tourism editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Coastal resort editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Destination trend editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Ocean environment editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Surf conditions editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Adventure operations editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Waterfront business editorial illustration', status: 'illustrative'
  },
  {
    url: 'https://images.unsplash.com/photo-1523437236904-adeb9f94e821?auto=format&fit=crop&w=1600&q=85',
    pageUrl: 'https://unsplash.com/', sourceUrl: 'https://unsplash.com/', alt: 'Marine lifestyle editorial illustration', status: 'illustrative'
  },
];

function configuredAiFallbackImages(): ImageFallback[] {
  return (process.env.NEWS_AI_IMAGE_URLS || '')
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .map((url) => ({
      url,
      pageUrl: siteUrl,
      sourceUrl: siteUrl,
      alt: 'AI-generated water sports editorial illustration',
      status: 'ai-illustrative' as const
    }));
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {...init, signal: controller.signal});
  } finally {
    clearTimeout(timeout);
  }
}

export function isOwnSiteImage(url: string) {
  if (!url) return true;
  if (url.startsWith('/')) return true;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    const siteHost = new URL(siteUrl).hostname.replace(/^www\./, '').toLowerCase();
    return host === siteHost;
  } catch {
    return true;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function absolutize(url: string, pageUrl: string) {
  try {
    return new URL(decodeHtml(url), pageUrl).toString();
  } catch {
    return '';
  }
}

function extractCandidates(html: string, pageUrl: string) {
  const candidates = new Set<string>();
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /"image"\s*:\s*"([^"]+)"/gi,
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const value = match[1] || '';
      if (!value || /logo|icon|avatar|sprite|tracking|pixel/i.test(value)) continue;
      const absolute = absolutize(value, pageUrl);
      if (absolute && !isOwnSiteImage(absolute)) candidates.add(absolute);
    }
  }
  return [...candidates];
}

async function validateExternalImage(url: string, pageUrl: string, alt: string): Promise<SourceImageResult> {
  if (isOwnSiteImage(url)) throw new Error(`Own-site images are not allowed for automated article covers: ${url}`);
  const response = await fetchWithTimeout(url, {method: 'GET', cache: 'no-store'});
  if (!response.ok) throw new Error(`Image failed ${response.status}: ${url}`);
  const contentType = response.headers.get('content-type') || '';
  if (!/^image\/(avif|webp|png|jpe?g)/i.test(contentType)) throw new Error(`Invalid image content-type ${contentType}: ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 1024) throw new Error(`Image is too small: ${url}`);
  const signature = Array.from(bytes.slice(0, 12)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const valid = signature.startsWith('ffd8ff') || signature.startsWith('89504e47') || signature.includes('57454250') || (signature.startsWith('000000') && signature.includes('66747970'));
  if (!valid) throw new Error(`Invalid image signature ${signature}: ${url}`);
  return {
    url,
    sourceUrl: url,
    pageUrl,
    alt,
    status: 'validated',
    fetchedAt: new Date().toISOString(),
    contentType,
    size: bytes.length
  };
}

export async function resolveSourceImage(input: {
  pageUrl: string;
  title: string;
  usedImages?: Set<string>;
  preferredImages?: string[];
  allowReuseAfterExhausted?: boolean;
  allowExternalFallback?: boolean;
}) {
  const used = input.usedImages || new Set<string>();
  const preferred = (input.preferredImages || []).filter((url) => url && !isOwnSiteImage(url));
  const candidates = [...preferred];
  try {
    const response = await fetchWithTimeout(input.pageUrl, {
      headers: {'User-Agent': 'ZAIHAI-SourceImageValidator/1.0'},
      cache: 'no-store'
    });
    if (response.ok) {
      candidates.push(...extractCandidates(await response.text(), input.pageUrl));
    }
  } catch {
    // Fall through to curated external internet images.
  }
  const fallbackImages = input.allowExternalFallback === false
    ? []
    : [...configuredAiFallbackImages(), ...editorialFallbackImages];
  if (fallbackImages.length) candidates.push(...fallbackImages.map((item) => item.url));

  const errors: string[] = [];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
  for (const candidate of uniqueCandidates) {
    if (used.has(candidate)) continue;
    const fallbackMeta = fallbackImages.find((item) => item.url === candidate);
    try {
      const validated = await validateExternalImage(candidate, fallbackMeta?.pageUrl || input.pageUrl, fallbackMeta?.alt || `${input.title} source image`);
      return {
        ...validated,
        sourceUrl: fallbackMeta?.sourceUrl || validated.sourceUrl,
        status: (fallbackMeta?.status || 'validated') as SourceImageResult['status']
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  // Reuse is intentionally limited to source-page candidates. Editorial and AI
  // fallbacks are never silently recycled, which keeps the news archive visually diverse.
  if (input.allowReuseAfterExhausted) {
    for (const candidate of uniqueCandidates) {
      if (fallbackImages.some((item) => item.url === candidate)) continue;
      try {
        return await validateExternalImage(candidate, input.pageUrl, `${input.title} source image`);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  throw new Error(`No valid external source image available. ${errors.slice(0, 3).join(' | ')}`);
}
