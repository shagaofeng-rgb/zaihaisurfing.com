export type TrafficChannel =
  | 'direct'
  | 'organic_search'
  | 'paid_search'
  | 'organic_social'
  | 'paid_social'
  | 'referral'
  | 'email'
  | 'affiliate'
  | 'display'
  | 'unknown';

export type TrafficTouch = {
  source: string;
  medium: string;
  channel: TrafficChannel;
  campaign: string;
  term: string;
  content: string;
  clickId: string;
  clickIdType: string;
  referrer: string;
  referrerDomain: string;
  landingPage: string;
  currentUrl: string;
  locale: string;
  countryCode: string;
  deviceType: string;
  browser: string;
  createdAt: string;
};

export type AttributionSnapshot = {
  visitorId: string;
  sessionId: string;
  firstTouch: TrafficTouch;
  lastTouch: TrafficTouch;
  sessionTouch: TrafficTouch;
};

const SEARCH_DOMAINS: Record<string, string> = {
  google: 'google',
  bing: 'bing',
  yahoo: 'yahoo',
  baidu: 'baidu',
  yandex: 'yandex',
  duckduckgo: 'duckduckgo',
  naver: 'naver',
  sogou: 'sogou'
};

const SOCIAL_DOMAINS: Record<string, string> = {
  facebook: 'facebook',
  instagram: 'instagram',
  tiktok: 'tiktok',
  linkedin: 'linkedin',
  youtube: 'youtube',
  'youtu.be': 'youtube',
  twitter: 'x',
  'x.com': 'x',
  't.co': 'x',
  pinterest: 'pinterest',
  reddit: 'reddit',
  whatsapp: 'whatsapp',
  telegram: 'telegram',
  wechat: 'wechat'
};

const CLICK_ID_MAP: Record<string, {source: string; channel: TrafficChannel; medium: string}> = {
  gclid: {source: 'google_ads', channel: 'paid_search', medium: 'cpc'},
  gbraid: {source: 'google_ads', channel: 'paid_search', medium: 'cpc'},
  wbraid: {source: 'google_ads', channel: 'paid_search', medium: 'cpc'},
  fbclid: {source: 'meta', channel: 'unknown', medium: 'unknown'},
  ttclid: {source: 'tiktok_ads', channel: 'paid_social', medium: 'paid_social'},
  li_fat_id: {source: 'linkedin_ads', channel: 'paid_social', medium: 'paid_social'},
  msclkid: {source: 'microsoft_ads', channel: 'paid_search', medium: 'cpc'},
  twclid: {source: 'x_ads', channel: 'paid_social', medium: 'paid_social'},
  epik: {source: 'pinterest_ads', channel: 'paid_social', medium: 'paid_social'}
};

const trafficChannels = new Set<TrafficChannel>([
  'direct', 'organic_search', 'paid_search', 'organic_social', 'paid_social', 'referral', 'email', 'affiliate', 'display', 'unknown'
]);

function clean(value: unknown, limit = 200) {
  return String(value || '').trim().replace(/[<>"'`]/g, '').replace(/\s+/g, ' ').slice(0, limit);
}

export function safeTrafficUrl(value: unknown) {
  const url = clean(value, 500).split(/[?#]/)[0];
  if (/^\/(?!\/)/.test(url)) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? `${parsed.origin}${parsed.pathname}` : '';
  } catch {
    return '';
  }
}

function domainFrom(referrer: string) {
  try {
    return new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function channelFromMedium(medium: string): TrafficChannel {
  const value = medium.toLowerCase();
  if (/cpc|ppc|paid_search|sem/.test(value)) return 'paid_search';
  if (/paid_social|social_paid/.test(value)) return 'paid_social';
  if (/social|organic_social/.test(value)) return 'organic_social';
  if (/email|newsletter/.test(value)) return 'email';
  if (/affiliate/.test(value)) return 'affiliate';
  if (/display|banner|programmatic/.test(value)) return 'display';
  if (/organic/.test(value)) return 'organic_search';
  if (/referral/.test(value)) return 'referral';
  if (/direct/.test(value)) return 'direct';
  return 'unknown';
}

function sourceFromReferrer(domain: string) {
  const social = Object.keys(SOCIAL_DOMAINS).find((key) => domain.includes(key));
  if (social) return {source: SOCIAL_DOMAINS[social], channel: 'organic_social' as const, medium: 'social'};
  const search = Object.keys(SEARCH_DOMAINS).find((key) => domain.includes(key));
  if (search) return {source: SEARCH_DOMAINS[search], channel: 'organic_search' as const, medium: 'organic'};
  return domain ? {source: domain, channel: 'referral' as const, medium: 'referral'} : null;
}

export function classifyTraffic(input: {
  url?: string;
  referrer?: string;
  locale?: string;
  countryCode?: string;
  deviceType?: string;
  browser?: string;
  now?: string;
}): TrafficTouch {
  const sourceUrl = clean(input.url || '', 1000).split('#')[0];
  const queryStart = sourceUrl.indexOf('?');
  const params = new URLSearchParams(queryStart < 0 ? '' : sourceUrl.slice(queryStart + 1));
  const currentUrl = safeTrafficUrl(sourceUrl);
  const referrer = safeTrafficUrl(input.referrer);
  const referrerDomain = domainFrom(referrer);
  const utmSource = clean(params.get('utm_source'), 100).toLowerCase();
  const utmMedium = clean(params.get('utm_medium'), 100).toLowerCase();
  const utmCampaign = clean(params.get('utm_campaign'), 200);
  const term = clean(params.get('utm_term'), 200);
  const content = clean(params.get('utm_content'), 200);
  const clickEntry = Object.keys(CLICK_ID_MAP).find((key) => params.has(key));
  const createdAt = input.now || new Date().toISOString();

  let source = '';
  let medium = '';
  let channel: TrafficChannel = 'unknown';
  if (utmSource || utmMedium || utmCampaign) {
    source = utmSource || 'unknown';
    medium = utmMedium || 'unknown';
    channel = channelFromMedium(medium);
  } else if (clickEntry) {
    const mapped = CLICK_ID_MAP[clickEntry];
    source = mapped.source;
    medium = mapped.medium;
    channel = mapped.channel;
  } else {
    const sameSite = referrerDomain === domainFrom(currentUrl) || referrerDomain === 'zaihaisurfing.com';
    const referred = sameSite ? null : sourceFromReferrer(referrerDomain);
    if (referred) {
      source = referred.source;
      medium = referred.medium;
      channel = referred.channel;
    } else {
      source = 'direct';
      medium = 'direct';
      channel = 'direct';
    }
  }

  if (utmSource === 'facebook' || utmSource === 'instagram' || utmSource === 'meta') {
    source = utmSource;
    channel = utmMedium.includes('paid') || utmMedium === 'cpc' ? 'paid_social' : 'organic_social';
  } else if (clickEntry === 'fbclid' && referrerDomain.includes('instagram')) {
    source = 'instagram';
  } else if (clickEntry === 'fbclid' && referrerDomain.includes('facebook')) {
    source = 'facebook';
  }

  return {
    source,
    medium,
    channel,
    campaign: utmCampaign,
    term,
    content,
    clickId: clickEntry ? clean(params.get(clickEntry), 240) : '',
    clickIdType: clickEntry || '',
    referrer,
    referrerDomain,
    landingPage: currentUrl,
    currentUrl,
    locale: clean(input.locale || '', 20),
    countryCode: clean(input.countryCode || '', 20),
    deviceType: clean(input.deviceType || '', 40),
    browser: clean(input.browser || '', 40),
    createdAt
  };
}

export function isMeaningfulMarketingTouch(touch: TrafficTouch) {
  return touch.channel !== 'direct' && (touch.channel !== 'unknown' || Boolean(touch.source && touch.source !== 'unknown'));
}

export function compactAttribution(input: unknown): AttributionSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as AttributionSnapshot;
  const visitorId = clean(value.visitorId, 80);
  const sessionId = clean(value.sessionId, 80);
  const firstTouch = compactTouch(value.firstTouch);
  const lastTouch = compactTouch(value.lastTouch);
  const sessionTouch = compactTouch(value.sessionTouch);
  if (!visitorId || !sessionId || !firstTouch || !lastTouch || !sessionTouch) return null;
  return {visitorId, sessionId, firstTouch, lastTouch, sessionTouch};
}

function compactTouch(touch: TrafficTouch | undefined): TrafficTouch | null {
  if (!touch || !trafficChannels.has(touch.channel)) return null;
  const referrer = safeTrafficUrl(touch.referrer);
  return {
    source: clean(touch.source, 100), medium: clean(touch.medium, 100), channel: touch.channel,
    campaign: clean(touch.campaign), term: clean(touch.term), content: clean(touch.content),
    clickId: clean(touch.clickId, 240), clickIdType: clean(touch.clickIdType, 40),
    referrer, referrerDomain: domainFrom(referrer), landingPage: safeTrafficUrl(touch.landingPage),
    currentUrl: safeTrafficUrl(touch.currentUrl), locale: clean(touch.locale, 20),
    countryCode: clean(touch.countryCode, 20), deviceType: clean(touch.deviceType, 40),
    browser: clean(touch.browser, 40), createdAt: clean(touch.createdAt, 40)
  };
}
