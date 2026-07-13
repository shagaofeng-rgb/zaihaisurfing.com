import {siteUrl} from '@/lib/site';

export type SourceImageResult = {
  url: string;
  sourceUrl: string;
  pageUrl: string;
  alt: string;
  status: 'validated';
  fetchedAt: string;
  contentType: string;
  size: number;
};

const externalFallbackImages = [
  {
    url: 'https://www.neom.com/content/dam/neom/newsroom/opening-of-sindalah/sindalah-island-at-sunset.jpeg',
    pageUrl: 'https://www.neom.com/en-us/newsroom/neom-board-of-directors-showcases-opening-of-sindalah',
    sourceUrl: 'https://www.neom.com/content/dam/neom/newsroom/opening-of-sindalah/sindalah-island-at-sunset.jpeg'
  },
  {
    url: 'https://www.shoremaster.com/media/cukbt3s2/trad-oakwoodgrain_rs4_towermaxx_1.jpg',
    pageUrl: 'https://www.shoremaster.com/blog/articles/state-of-the-waterfront-industry-2026-key-trends-in-docks-lifts-and-marinas/',
    sourceUrl: 'https://www.shoremaster.com/media/cukbt3s2/trad-oakwoodgrain_rs4_towermaxx_1.jpg'
  },
  {
    url: 'https://claritasintelligence.com/api/og?title=Global%20Electric%20Surfboard%20Market%20Projected%20to%20Reach%20US%24%2066.34%20Million%20by%202033%20as%20AI-Driven%20Battery%20Management%20and%20eFoil%20Innovation%20Redefine%20Marine%20Recreation',
    pageUrl: 'https://claritasintelligence.com/press-release/global-electric-surfboard-market',
    sourceUrl: 'https://claritasintelligence.com/api/og?title=Global%20Electric%20Surfboard%20Market%20Projected%20to%20Reach%20US%24%2066.34%20Million%20by%202033%20as%20AI-Driven%20Battery%20Management%20and%20eFoil%20Innovation%20Redefine%20Marine%20Recreation'
  },
];

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
  if (input.allowExternalFallback !== false) {
    candidates.push(...externalFallbackImages.map((item) => item.url));
  }

  const errors: string[] = [];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
  for (const candidate of uniqueCandidates) {
    if (used.has(candidate)) continue;
    const fallbackMeta = externalFallbackImages.find((item) => item.url === candidate);
    try {
      return await validateExternalImage(candidate, fallbackMeta?.pageUrl || input.pageUrl, `${input.title} source image`);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (input.allowReuseAfterExhausted) {
    for (const candidate of uniqueCandidates) {
      const fallbackMeta = externalFallbackImages.find((item) => item.url === candidate);
      try {
        return await validateExternalImage(candidate, fallbackMeta?.pageUrl || input.pageUrl, `${input.title} source image`);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  }
  throw new Error(`No valid external source image available. ${errors.slice(0, 3).join(' | ')}`);
}
