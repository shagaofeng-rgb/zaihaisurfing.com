import crypto from 'node:crypto';
import {appendStoreLine, readStoreLines, readStoreObject, writeStoreObject} from '@/lib/durableStore';
import {productDetailedSpecs, products, productSlugs, siteUrl, type ProductSlug} from '@/lib/site';
import {sendSystemAlertEmail} from '@/lib/emailService';

const SETTINGS_FILE = 'facebook-page-publisher-settings.json';
const POSTS_FILE = 'facebook-page-posts.jsonl';
const OAUTH_FILE = 'facebook-page-oauth-states.jsonl';
const TOKEN_FILE = 'facebook-page-token.json';
const GRAPH_HOST = 'https://graph.facebook.com';

export type FacebookPostStatus = 'draft_generated' | 'validated' | 'published' | 'failed' | 'skipped';
export type FacebookPageSettings = {enabled: boolean; timezone: string; publishTime: string; updatedAt: string};
export type FacebookPostRecord = {
  id: string; scheduledDate: string; status: FacebookPostStatus; createdAt: string; updatedAt: string;
  productSlug?: ProductSlug; productName?: string; industry?: string; title?: string; body?: string;
  hashtags?: string[]; imageUrl?: string; landingPageUrl?: string; cta?: string; factSources?: string[];
  complianceNotes?: string; facebookPostId?: string; facebookPostUrl?: string; metaResponse?: unknown;
  failureReason?: string; retries: number;
};
type PageToken = {pageId: string; pageName: string; encryptedToken: string; expiresAt?: string; connectedAt: string; updatedAt: string};
type OAuthState = {state: string; createdAt: string; returnTo: string};
type ProductFact = {slug: ProductSlug; name: string; landingPageUrl: string; imageUrls: string[]; specs: string[]; industries: string[]; values: string[]; ctas: string[]; forbiddenClaims: string[]; sources: string[]; updatedAt: string};
type PostCandidate = {title: string; body: string; hashtags: string[]; product_name: string; industry: string; image_url: string; landing_page_url: string; cta: string; fact_sources: string[]; compliance_notes: string};

const DEFAULT_SETTINGS: FacebookPageSettings = {enabled: false, timezone: 'Asia/Manila', publishTime: '09:00', updatedAt: ''};
const industries = [
  'Resort & Hotel Water Sports', 'Water Sports Rental Business', 'Water Parks', 'Yacht Clubs & Marinas',
  'Tourism Attractions', 'Distributor & Dealer Networks', 'OEM / Private Label Projects', 'Commercial Fleet Operations'
];

function now() { return new Date().toISOString(); }
function id(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
function graphVersion() { return (process.env.META_GRAPH_API_VERSION || '').trim(); }
function graphUrl(path: string) { return `${GRAPH_HOST}/${graphVersion()}/${path.replace(/^\//, '')}`; }
function callbackUrl() { return `${siteUrl}/api/admin/facebook/oauth/callback`; }
function tokenKey() { return process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY || ''; }
function configuredMeta() { return Boolean(graphVersion() && process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_FACEBOOK_PAGE_ID && tokenKey()); }

function encrypt(value: string) {
  const key = tokenKey();
  if (!key) throw new Error('FACEBOOK_TOKEN_ENCRYPTION_KEY is not configured');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.createHash('sha256').update(key).digest(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${data.toString('base64url')}`;
}

function decrypt(value: string) {
  const key = tokenKey();
  const [ivValue, tagValue, dataValue] = value.split('.');
  if (!key || !ivValue || !tagValue || !dataValue) throw new Error('Stored Page token cannot be decrypted');
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.createHash('sha256').update(key).digest(), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataValue, 'base64url')), decipher.final()]).toString('utf8');
}

export function productFactLibrary(): ProductFact[] {
  return productSlugs.map((slug) => {
    const product = products[slug];
    return {
      slug, name: product.name, landingPageUrl: `${siteUrl}/en/products/${slug}`,
      imageUrls: [`${siteUrl}${product.image}`, `${siteUrl}${product.thumbnail}`],
      specs: productDetailedSpecs[slug].map((item) => `${item.label}: ${item.value}`),
      industries,
      values: ['Supports a structured product discussion for commercial water-sports operators.', 'Suitable project fit depends on local operating conditions, training and waterway rules.'],
      ctas: ['Explore the product details', 'Request a project quotation', 'Talk with ZAIHAI about a commercial plan', 'Discuss distributor support'],
      forbiddenClaims: ['best', 'number one', 'guaranteed profit', 'zero risk', 'permanent', 'certified unless verified'],
      sources: [`${siteUrl}/en/products/${slug}`, `${siteUrl}/en/applications`, `${siteUrl}/en/faq`, `${siteUrl}/en/warranty`],
      updatedAt: now()
    };
  });
}

export async function getFacebookSettings() {
  return (await readStoreObject<FacebookPageSettings>(SETTINGS_FILE)) || DEFAULT_SETTINGS;
}

export async function saveFacebookSettings(input: Partial<FacebookPageSettings>) {
  const current = await getFacebookSettings();
  const timezone = input.timezone || current.timezone;
  const publishTime = input.publishTime || current.publishTime;
  if (!/^\d{2}:00$/.test(publishTime)) throw new Error('Publishing time must be set on the hour for the Vercel hourly scheduler.');
  try { Intl.DateTimeFormat('en-US', {timeZone: timezone}).format(); } catch { throw new Error('Invalid IANA timezone'); }
  const next = {enabled: input.enabled ?? current.enabled, timezone, publishTime, updatedAt: now()};
  await writeStoreObject(SETTINGS_FILE, next);
  return next;
}

export async function listFacebookPosts() { return (await readStoreLines<FacebookPostRecord>(POSTS_FILE)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
async function appendPost(record: FacebookPostRecord) { await appendStoreLine(POSTS_FILE, record); }

export async function facebookPublisherStatus() {
  const token = await readStoreObject<PageToken>(TOKEN_FILE);
  const settings = await getFacebookSettings();
  const expiresSoon = Boolean(token?.expiresAt && Date.parse(token.expiresAt) - Date.now() < 14 * 86400000);
  return {configuredMeta: configuredMeta(), connected: Boolean(token), pageId: token?.pageId || '', pageName: token?.pageName || '', tokenExpiresAt: token?.expiresAt || '', tokenExpiresSoon: expiresSoon, settings};
}

export async function createFacebookOAuthState(returnTo = '/admin/facebook') {
  const state = crypto.randomBytes(32).toString('base64url');
  await appendStoreLine(OAUTH_FILE, {state, createdAt: now(), returnTo});
  return state;
}

export async function consumeFacebookOAuthState(state: string) {
  const states = await readStoreLines<OAuthState>(OAUTH_FILE);
  const match = states.find((item) => item.state === state && Date.now() - Date.parse(item.createdAt) < 10 * 60 * 1000);
  if (!match) throw new Error('OAuth state is missing, expired, or invalid');
  return match;
}

export function facebookOAuthUrl(state: string) {
  if (!configuredMeta()) throw new Error('Meta OAuth configuration is incomplete');
  const url = new URL(`https://www.facebook.com/${graphVersion()}/dialog/oauth`);
  url.searchParams.set('client_id', process.env.META_APP_ID || '');
  url.searchParams.set('redirect_uri', callbackUrl());
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts,read_insights');
  return url.toString();
}

async function graphJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {...init, cache: 'no-store'});
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) throw new Error(payload?.error?.message || `Meta Graph API request failed: ${response.status}`);
  return payload;
}

export async function connectFacebookPage(code: string) {
  if (!configuredMeta()) throw new Error('Meta OAuth configuration is incomplete');
  const exchange = new URLSearchParams({client_id: process.env.META_APP_ID || '', client_secret: process.env.META_APP_SECRET || '', redirect_uri: callbackUrl(), code});
  const shortToken = await graphJson(graphUrl('oauth/access_token') + `?${exchange.toString()}`) as {access_token: string; expires_in?: number};
  const longParams = new URLSearchParams({grant_type: 'fb_exchange_token', client_id: process.env.META_APP_ID || '', client_secret: process.env.META_APP_SECRET || '', fb_exchange_token: shortToken.access_token});
  const longToken = await graphJson(graphUrl('oauth/access_token') + `?${longParams.toString()}`) as {access_token: string; expires_in?: number};
  const accounts = await graphJson(graphUrl(`me/accounts?fields=id,name,access_token,tasks&access_token=${encodeURIComponent(longToken.access_token)}`)) as {data?: Array<{id: string; name: string; access_token: string; tasks?: string[]}>};
  const page = accounts.data?.find((item) => item.id === process.env.META_FACEBOOK_PAGE_ID && item.access_token);
  if (!page) throw new Error('The configured Facebook Page was not returned. Confirm that the authorizing user is a Page administrator and the Page ID is correct.');
  const expirySeconds = longToken.expires_in || shortToken.expires_in || 0;
  const record: PageToken = {pageId: page.id, pageName: page.name, encryptedToken: encrypt(page.access_token), expiresAt: expirySeconds ? new Date(Date.now() + expirySeconds * 1000).toISOString() : undefined, connectedAt: now(), updatedAt: now()};
  await writeStoreObject(TOKEN_FILE, record);
  return {pageId: record.pageId, pageName: record.pageName, expiresAt: record.expiresAt || ''};
}

function normalized(value: string) { return value.toLowerCase().replace(/https?:\/\/\S+/g, '').replace(/[^a-z0-9#]+/g, ' ').trim().split(/\s+/).filter((word) => word.length > 2); }
function jaccard(a: string, b: string) { const left = new Set(normalized(a)); const right = new Set(normalized(b)); const union = new Set([...left, ...right]); const intersection = [...left].filter((word) => right.has(word)).length; return union.size ? intersection / union.size : 0; }
function localDate(timezone: string) { return new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); }
function localTime(timezone: string) { return new Intl.DateTimeFormat('en-GB', {timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(new Date()); }

function deterministicCandidate(fact: ProductFact, industry: string, cta: string): PostCandidate {
  const title = `\uD83C\uDF0A ${fact.name} for ${industry}`.slice(0, 70);
  const body = `${title}\n\nCommercial water-sports teams often need equipment planning that matches their operating environment, guest flow and support process.\n\n${fact.name} can be evaluated with ZAIHAI using verified product specifications and a project discussion for ${industry}. Always confirm local waterway, training and safety requirements before operation.\n\n${cta}: ${fact.landingPageUrl}`;
  const hashtags = ['#ZAIHAI', fact.slug.startsWith('p1') ? '#FuelPoweredSurfboard' : fact.slug === 'rage-shark-x' ? '#ElectricGoKartBoat' : '#ElectricSurfboard', '#WaterSports', '#MarineLeisure', '#B2B', '#CommercialOperations'];
  return {title, body, hashtags, product_name: fact.name, industry, image_url: fact.imageUrls[0], landing_page_url: fact.landingPageUrl, cta, fact_sources: fact.sources, compliance_notes: 'Generated only from the ZAIHAI verified product fact library.'};
}

async function generateFacebookCandidate(fact: ProductFact, industry: string, cta: string, previous?: string) {
  const fallback = deterministicCandidate(fact, industry, cta);
  const apiKey = process.env.OPENAI_API_KEY || '';
  const model = process.env.FACEBOOK_CONTENT_MODEL || '';
  if (!apiKey || !model) return fallback;
  const prompt = [
    'Create one compliant English Facebook Page photo-post JSON object only. Do not add markdown fences.',
    'Use only the verified facts below. Do not add numbers, certifications, prices, customers, delivery times, or unverified claims.',
    'title must be 70 characters or less. body must begin with the title and contain 2-4 short paragraphs plus the exact CTA and landing page. Use 2-5 natural emojis. hashtags must contain 5-8 items.',
    `Product: ${fact.name}`, `Industry: ${industry}`, `CTA: ${cta}`, `Landing page: ${fact.landingPageUrl}`,
    `Image URL: ${fact.imageUrls[0]}`, `Verified specifications: ${fact.specs.join('; ')}`,
    `Verified value statements: ${fact.values.join(' ')}`, `Fact sources: ${fact.sources.join(', ')}`,
    previous ? `Avoid copying this recent text: ${previous}` : ''
  ].filter(Boolean).join('\n');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({model, temperature: 0.55, response_format: {type: 'json_object'}, messages: [{role: 'system', content: 'You write factual B2B social content.'}, {role: 'user', content: prompt}]})
    });
    const payload = await response.json() as {choices?: Array<{message?: {content?: string}}>};
    const raw = payload.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(raw) as PostCandidate;
    return {...fallback, ...parsed, image_url: fact.imageUrls.includes(parsed.image_url) ? parsed.image_url : fallback.image_url, landing_page_url: fact.landingPageUrl, fact_sources: fact.sources};
  } catch {
    return fallback;
  }
}

export function validateFacebookPostCandidate(candidate: PostCandidate, fact: ProductFact, recent: FacebookPostRecord[]) {
  const issues: string[] = [];
  if (!candidate.title || candidate.title.length > 70 || !candidate.body || !candidate.cta) issues.push('Missing or invalid title, body, or CTA');
  if (candidate.hashtags.length < 5 || candidate.hashtags.length > 8) issues.push('Hashtag count must be between 5 and 8');
  if (!candidate.image_url.startsWith(`${siteUrl}/assets/`)) issues.push('Image is not from the ZAIHAI-owned media whitelist');
  if (!candidate.landing_page_url.startsWith(`${siteUrl}/`)) issues.push('Landing page is outside zaihaisurfing.com');
  if (!candidate.fact_sources.every((source) => fact.sources.includes(source))) issues.push('Fact sources are outside the verified product library');
  if (fact.forbiddenClaims.some((claim) => candidate.body.toLowerCase().includes(claim))) issues.push('Contains an unsupported promotional claim');
  const cutoff = Date.now() - 90 * 86400000;
  const similar = recent.filter((item) => Date.parse(item.createdAt) >= cutoff).some((item) => jaccard(`${candidate.title} ${candidate.body}`, `${item.title || ''} ${item.body || ''}`) >= 0.72 || item.cta === candidate.cta);
  if (similar) issues.push('Too similar to a post from the last 90 days or uses a recently used CTA');
  const imageRecent = recent.some((item) => item.imageUrl === candidate.image_url && Date.parse(item.createdAt) >= Date.now() - 30 * 86400000);
  if (imageRecent) issues.push('Image has already been used within the last 30 days');
  return issues;
}

async function validatePublicAsset(url: string, expectedImage = false) {
  const response = await fetch(url, {method: 'HEAD', redirect: 'follow', cache: 'no-store'});
  if (!response.ok) throw new Error(`Asset check failed: ${response.status}`);
  if (expectedImage) {
    if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('Asset is not an image');
    const size = Number(response.headers.get('content-length') || '0');
    if (size > 10 * 1024 * 1024) throw new Error('Image is larger than 10 MB');
  }
}

async function publishPhoto(candidate: PostCandidate) {
  const stored = await readStoreObject<PageToken>(TOKEN_FILE);
  if (!stored) throw new Error('Facebook Page has not been authorized');
  const accessToken = decrypt(stored.encryptedToken);
  const form = new URLSearchParams({url: candidate.image_url, caption: `${candidate.body}\n\n${candidate.hashtags.join(' ')}`, access_token: accessToken});
  const response = await graphJson(graphUrl(`${stored.pageId}/photos`), {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: form.toString()}) as {id?: string; post_id?: string};
  if (!response.id && !response.post_id) throw new Error('Meta accepted the request but did not return a post identifier');
  const postId = response.post_id || response.id || '';
  return {postId, postUrl: postId ? `https://www.facebook.com/${postId.replace('_', '/posts/')}` : '', response};
}

export function nextFacebookTopics(days = 14) {
  const facts = productFactLibrary();
  return Array.from({length: days}, (_, index) => {
    const fact = facts[index % facts.length];
    return {dayOffset: index, product: fact.name, industry: industries[index % industries.length], contentType: ['Product & feature', 'Industry application', 'Operations guidance', 'Delivery & support', 'Brand & process'][index % 5]};
  });
}

export async function runFacebookPagePublisher(trigger: 'cron' | 'manual' = 'cron') {
  const settings = await getFacebookSettings();
  const date = localDate(settings.timezone);
  const currentTime = localTime(settings.timezone);
  const recent = await listFacebookPosts();
  if (!settings.enabled) return {status: 'skipped', reason: 'Facebook Page publishing is paused'};
  if (trigger === 'cron' && currentTime !== settings.publishTime) return {status: 'skipped', reason: `Not scheduled time (${currentTime} ${settings.timezone})`};
  if (recent.some((item) => item.scheduledDate === date && ['published', 'validated', 'draft_generated', 'failed', 'skipped'].includes(item.status))) return {status: 'skipped', reason: 'Daily idempotency record already exists'};
  const fact = productFactLibrary().find((item) => !recent.slice(0, 2).some((post) => post.productSlug === item.slug)) || productFactLibrary()[0];
  const industry = fact.industries.find((item) => !recent.some((post) => post.industry === item && Date.parse(post.createdAt) >= Date.now() - 14 * 86400000));
  const cta = fact.ctas.find((item) => !recent.some((post) => post.cta === item && Date.parse(post.createdAt) >= Date.now() - 7 * 86400000));
  const record: FacebookPostRecord = {id: id('facebook'), scheduledDate: date, status: 'draft_generated', createdAt: now(), updatedAt: now(), productSlug: fact.slug, productName: fact.name, industry, retries: 0};
  if (!industry || !cta) { record.status = 'skipped'; record.failureReason = 'No compliant topic or CTA is available within rotation rules'; await appendPost(record); return {status: record.status, reason: record.failureReason}; }
  let candidate = await generateFacebookCandidate(fact, industry, cta, recent[0]?.body);
  Object.assign(record, {title: candidate.title, body: candidate.body, hashtags: candidate.hashtags, imageUrl: candidate.image_url, landingPageUrl: candidate.landing_page_url, cta: candidate.cta, factSources: candidate.fact_sources, complianceNotes: candidate.compliance_notes});
  let issues = validateFacebookPostCandidate(candidate, fact, recent);
  try { await validatePublicAsset(candidate.image_url, true); await validatePublicAsset(candidate.landing_page_url); } catch (error) { issues.push(error instanceof Error ? error.message : 'Public asset validation failed'); }
  if (issues.length) {
    candidate = await generateFacebookCandidate(fact, industry, cta, `${candidate.title} ${candidate.body}`);
    Object.assign(record, {title: candidate.title, body: candidate.body, hashtags: candidate.hashtags, imageUrl: candidate.image_url, landingPageUrl: candidate.landing_page_url, cta: candidate.cta, factSources: candidate.fact_sources, complianceNotes: candidate.compliance_notes});
    issues = validateFacebookPostCandidate(candidate, fact, recent);
  }
  if (issues.length) { record.status = 'skipped'; record.failureReason = issues.join('; '); record.updatedAt = now(); await appendPost(record); await sendSystemAlertEmail('ZAIHAI Facebook post skipped', `${date}: ${record.failureReason}`); return {status: record.status, reason: record.failureReason}; }
  record.status = 'validated'; record.updatedAt = now();
  if (!configuredMeta()) { record.status = 'failed'; record.failureReason = 'Meta production configuration is incomplete'; record.updatedAt = now(); await appendPost(record); await sendSystemAlertEmail('ZAIHAI Facebook publishing failed', `${date}: ${record.failureReason}`); return {status: record.status, reason: record.failureReason}; }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { const published = await publishPhoto(candidate); record.status = 'published'; record.facebookPostId = published.postId; record.facebookPostUrl = published.postUrl; record.metaResponse = published.response; record.retries = attempt; record.updatedAt = now(); await appendPost(record); return {status: record.status, postId: record.facebookPostId}; }
    catch (error) { record.retries = attempt + 1; record.failureReason = error instanceof Error ? error.message : 'Facebook publish failed'; }
  }
  record.status = 'failed'; record.updatedAt = now(); await appendPost(record); await sendSystemAlertEmail('ZAIHAI Facebook publishing failed', `${date}: ${record.failureReason || 'Unknown Meta Graph API failure'}`); return {status: record.status, reason: record.failureReason};
}
