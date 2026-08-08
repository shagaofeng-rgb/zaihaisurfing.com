import crypto from 'node:crypto';
import {products, siteUrl, type ProductSlug} from '@/lib/site';
import {durableStoreStatus, readStoreObject, writeStoreObject} from '@/lib/durableStore';
import {listAdminPosts, writeAdminStore, type ContentPost} from '@/lib/backendStore';

const STORE_FILE = 'news-autopilot.json';
const WINDOW_MS = 48 * 60 * 60 * 1000;
const MANILA_TIME_ZONE = 'Asia/Manila';

export type AutopilotSource = {
  id: string;
  name: string;
  domain: string;
  url: string;
  region: string;
  tier: 'official' | 'industry';
  imageLicense: 'link-card-only' | 'not-provided';
  enabled: boolean;
  health: 'verified' | 'pending';
};

export type AutopilotDraft = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  productSlugs: ProductSlug[];
  industry: string;
  region: string;
  structure: string;
  keyword: string;
  source: {name: string; url: string; publishedDate: string; accessedDate: string; note: string};
  coverImage: string;
  coverImageAlt: string;
  status: 'draft' | 'published' | 'rejected';
  seoTitle: string;
  seoDescription: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  languageStatus: Record<string, 'published' | 'pending_editorial'>;
  validation: string[];
};

export type AutopilotRun = {
  id: string;
  trigger: 'cron' | 'manual' | 'seed';
  startedAt: string;
  finishedAt: string;
  mode: 'dry-run' | 'live';
  status: 'skipped' | 'drafted' | 'published' | 'failed';
  reason: string;
};

export type NewsAutopilotState = {
  version: 1;
  enabled: boolean;
  publishEnabled: boolean;
  lastPublishedAt?: string;
  sources: AutopilotSource[];
  drafts: AutopilotDraft[];
  runs: AutopilotRun[];
  audit: {at: string; action: string; detail: string}[];
};

export function newsAutopilotRuntimeStatus() {
  const store = durableStoreStatus();
  return {
    schedulingEnabled: process.env.NEWS_AUTOPILOT_ENABLED === 'true',
    publishingEnabled: process.env.NEWS_AUTOPILOT_PUBLISH_ENABLED === 'true',
    durableStore: store.provider,
    hasDistributedLock: store.provider === 'kv_rest'
  };
}

const sourceSeeds: AutopilotSource[] = [
  {id: 'ky-fish-wildlife', name: 'Kentucky Fish and Wildlife', domain: 'fw.ky.gov', url: 'https://fw.ky.gov/News/Pages/Kentucky-Fish-and-Wildlife-encourages-safe-summer-boating.aspx', region: 'United States', tier: 'official', imageLicense: 'link-card-only', enabled: true, health: 'verified'},
  {id: 'yachting-pages', name: 'Yachting Pages', domain: 'yachting-pages.com', url: 'https://www.yachting-pages.com/articles/seabob-launches-biggest-coast-to-coast-tour-news.html', region: 'United States', tier: 'industry', imageLicense: 'link-card-only', enabled: true, health: 'verified'},
  {id: 'visit-maldives', name: 'Visit Maldives Corporate', domain: 'corporate.visitmaldives.com', url: 'https://corporate.visitmaldives.com/category/industry-news/page/3/', region: 'Maldives', tier: 'official', imageLicense: 'link-card-only', enabled: true, health: 'verified'},
  {id: 'tobler-marina', name: 'Tobler Marina', domain: 'toblermarina.com', url: 'https://toblermarina.com/event-detail/dover-bay-boat-expo', region: 'United States', tier: 'industry', imageLicense: 'link-card-only', enabled: true, health: 'verified'}
];

function isoNow() { return new Date().toISOString(); }
function hash(value: string) { return crypto.createHash('sha256').update(value).digest('hex'); }
function words(value: string) {
  return (value.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((word) => !['the', 'for', 'and', 'with', 'from', 'into'].includes(word))
    .map((word) => word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word);
}

export function lexicalSimilarity(left: string, right: string) {
  const a = new Set(words(left)); const b = new Set(words(right));
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let overlap = 0; a.forEach((item) => { if (b.has(item)) overlap += 1; });
  return overlap / union.size;
}

export function canPublishAt(lastPublishedAt?: string, now = Date.now()) {
  if (!lastPublishedAt) return true;
  const last = new Date(lastPublishedAt).getTime();
  return !Number.isFinite(last) || now - last >= WINDOW_MS;
}

export function formatManila(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone: MANILA_TIME_ZONE, dateStyle: 'medium', timeStyle: 'short'}).format(value);
}

function defaultState(): NewsAutopilotState {
  return {version: 1, enabled: false, publishEnabled: false, sources: sourceSeeds, drafts: [makeDraft(draftSeeds[4])], runs: [], audit: [{at: isoNow(), action: 'initial-draft', detail: 'One editorial review draft was initialized. Nothing was published.'}]};
}

export async function readNewsAutopilotState() {
  const stored = await readStoreObject<NewsAutopilotState>(STORE_FILE);
  if (stored) return stored;
  const initial = defaultState();
  await writeStoreObject(STORE_FILE, initial);
  return initial;
}

async function saveState(state: NewsAutopilotState) {
  await writeStoreObject(STORE_FILE, {...state, runs: state.runs.slice(-100), audit: state.audit.slice(-300)});
}

function complianceNote() {
  return 'Water-area permissions, life jackets, operator training, age limits, weather, insurance and local operating rules vary by location. This editorial guidance is not legal advice.';
}

function draftContent(input: {opening: string; operators: string[]; fit: string; scenario: string; source: string; faq: [string, string][]}) {
  return [
    input.opening,
    '## What this means for operators',
    ...input.operators.map((item) => `- ${item}`),
    '## Where ZAIHAI fits', input.fit,
    '## Example operating scenario', `Illustrative example: ${input.scenario}`,
    '## Source context', input.source,
    '## Safety and local compliance note', complianceNote(),
    '## FAQ', ...input.faq.map(([question, answer]) => `### ${question}\n${answer}`),
    '## Request a project recommendation', 'Share your water area, country, intended guest group and operating plan with ZAIHAI. The team can help you compare models, packaging, spare-parts planning and the information that still needs local confirmation.'
  ].join('\n\n');
}

type DraftSeed = Omit<AutopilotDraft, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'contentHash' | 'languageStatus' | 'validation'>;

const draftSeeds: DraftSeed[] = [
  {
    title: 'How Resort Water Sports Centers Can Build a Tiered Electric Ride Program', slug: 'resort-tiered-electric-ride-program',
    excerpt: 'A practical planning framework for separating a core electric ride fleet from a premium demo experience at a resort water-sports center.',
    category: 'Resort Operations', tags: ['Resorts', 'Electric Surfboards', 'Fleet Planning'], productSlugs: ['x1', 'x1-pro'], industry: 'Beach and island resorts', region: 'Global', structure: 'scenario-solution', keyword: 'electric surfboard for resorts',
    source: {name: 'ZAIHAI product facts', url: `${siteUrl}/en/products`, publishedDate: '2026-08-08', accessedDate: '2026-08-08', note: 'This operational draft uses only product specifications published on the ZAIHAI website.'},
    coverImage: products.x1.image, coverImageAlt: 'ZAIHAI X1 electric surfboard for resort fleet planning', seoTitle: 'Electric Surfboard Fleet Planning for Resorts | ZAIHAI', seoDescription: 'A practical tiered electric ride framework for resort water-sports centers, with operating limits and verified ZAIHAI product facts.',
    content: draftContent({opening: 'Resort operators often need more than one ride format: a dependable core activity for repeat guest sessions and a premium experience that can support demonstrations or advanced riders. A tiered electric program can make that distinction clear, but it is not a substitute for local water-area approval, staff training or daily safety checks.', operators: ['Separate introductory sessions from premium demonstration sessions instead of promising one model for every guest.', 'Plan charging, inspection and spare-battery workflow before setting reservation windows.', 'Use operational rules and staff supervision to determine who may ride, rather than relying on product marketing labels alone.'], fit: 'ZAIHAI X1 is listed with 10 kW, 72 V, 50 Ah and 60–80 minutes of endurance for commercial-oriented programs. X1 Pro is listed with 12 kW, 72 V, 50 Ah, up to 61 km/h and IP67 waterproofing; it can be evaluated as a premium demonstration option where the local operating plan supports it.', scenario: 'A resort uses timed introductory sessions for its base fleet and separately books a staff-led premium demonstration. Each session begins with a water-boundary briefing, life-jacket check and a recorded weather review.', source: 'This is an editorial operating framework, not a report of a ZAIHAI customer installation.', faq: [['Does a tiered program remove the need for training?', 'No. Staff training and rider briefing remain local operational requirements.'], ['Which model should be the base fleet?', 'Model selection depends on rider profile, water conditions and the operator plan; confirm the final configuration with ZAIHAI.'], ['Can every resort use electric ride equipment?', 'No. Water-area permissions, insurance and local rules must be checked first.']]})
  },
  {
    title: 'What a U.S. Demo Tour Signals for Marina and Dealer Water-Sports Programs', slug: 'us-demo-tour-marina-dealer-programs', excerpt: 'A U.S. coast-to-coast demonstration tour offers a useful lens for planning marina and dealer demo days without presenting another brand event as a ZAIHAI activity.', category: 'Dealer Programs', tags: ['Marinas', 'Dealers', 'Demo Days'], productSlugs: ['x1', 'x1-pro'], industry: 'Marinas and distributors', region: 'United States', structure: 'dealer-demo', keyword: 'electric surfboard distributor', source: {name: 'Yachting Pages', url: 'https://www.yachting-pages.com/articles/seabob-launches-biggest-coast-to-coast-tour-news.html', publishedDate: '2026-06-15', accessedDate: '2026-08-08', note: 'Used only as a public example of how equipment demonstrations can help buyers evaluate a category.'}, coverImage: products['x1-pro'].image, coverImageAlt: 'ZAIHAI X1 Pro electric surfboard for dealer demonstrations', seoTitle: 'Marina Demo Day Planning for Electric Surfboards | ZAIHAI', seoDescription: 'What a U.S. water-sports demo tour can teach marinas and dealers about bookings, coaching, safety boundaries and lead follow-up.', content: draftContent({opening: 'A public U.S. demonstration tour reported by Yachting Pages shows that ride demonstrations remain an important way for buyers to understand a water-sports category. It does not show ZAIHAI participation, and it should not be treated as a product comparison. It does, however, provide a useful prompt for marinas and dealers designing controlled demo days.', operators: ['Use appointment windows so staff can verify rider readiness and keep dock activity orderly.', 'Record the product shown, rider profile and follow-up interest after each session.', 'Treat footage as supporting material, not as evidence that a product is approved for every water area.'], fit: 'ZAIHAI X1 and X1 Pro can be discussed with buyers using their published power, voltage, endurance and waterproofing facts. Final demonstration conditions must be set by the venue and local rules.', scenario: 'A marina schedules short, staff-led demonstration appointments, separates product briefing from on-water time, and captures only consented lead information for later quotation follow-up.', source: 'Yachting Pages reported a SEABOB coast-to-coast U.S. tour on 2026-06-15. ZAIHAI is not stated to be involved.', faq: [['Is this a ZAIHAI event?', 'No. It is a cited industry example only.'], ['What should a dealer prepare first?', 'Water-area approval, trained staff, life jackets, a booking process and an emergency plan.'], ['Can a demo day be run at any marina?', 'No. Confirm marina rules, insurance and local operating permissions.']]})
  },
  {
    title: 'Planning a Controlled Family Water Attraction at a Scenic Lake', slug: 'controlled-family-water-attraction-scenic-lake', excerpt: 'A controlled-water planning brief for operators considering a family-facing electric go-kart boat attraction at a scenic lake.', category: 'Water Park Operations', tags: ['Scenic Lakes', 'Family Attractions', 'Electric Go-Kart Boats'], productSlugs: ['rage-shark-x'], industry: 'Scenic lakes and water parks', region: 'Global', structure: 'operations-manual', keyword: 'electric go-kart boat for water park', source: {name: 'ZAIHAI product facts', url: `${siteUrl}/en/products/rage-shark-x`, publishedDate: '2026-08-08', accessedDate: '2026-08-08', note: 'This draft uses published product facts and does not claim a customer deployment.'}, coverImage: products['rage-shark-x'].image, coverImageAlt: 'Rage Shark X electric go-kart boat for controlled water attraction planning', seoTitle: 'Controlled Water Attraction Planning for Scenic Lakes | ZAIHAI', seoDescription: 'A controlled-water planning brief for family attractions, covering boundaries, bookings, training, local rules and Rage Shark X facts.', content: draftContent({opening: 'A family water attraction works best when it is designed as a controlled operating system rather than an unstructured ride area. Scenic-lake operators should define boundaries, staff roles, reservation capacity and weather stop rules before considering product selection. This framework is not a claim that any age group or venue can operate without training.', operators: ['Map a visible operating zone, entry and exit route, and staff observation points.', 'Set booking rules around rider eligibility, group size and turnaround time.', 'Use daily opening and closing checks for life jackets, weather, water conditions and equipment condition.'], fit: 'Rage Shark X is listed as a 15 kW electric go-kart boat with a 76 Ah battery and 60–80 minutes of endurance. These facts support evaluation; they do not replace a local risk assessment.', scenario: 'A scenic-lake attraction uses a buoyed route, scheduled family slots, a supervised launch area and a written weather stop procedure. Riders are briefed before entering the water.', source: 'This is an illustrative planning article based on published ZAIHAI product facts.', faq: [['Does family-focused mean no training is needed?', 'No. Local rules and the operator safety plan determine training and supervision.'], ['How should the route be defined?', 'Use a documented, visible route and adapt it to local water conditions and permissions.'], ['What should be confirmed before purchasing?', 'Venue permissions, insurance, staffing, age policies and maintenance support.']]})
  },
  {
    title: 'When Open-Water Operators Need a Fuel-Powered Surfboard Option', slug: 'open-water-fuel-powered-surfboard-option', excerpt: 'A fact-led planning note for operators weighing a fuel-powered surfboard option where charging workflow and open-water conditions need careful review.', category: 'Adventure Operations', tags: ['Open Water', 'Fuel-Powered Surfboards', 'Operator Planning'], productSlugs: ['p1'], industry: 'Adventure tourism', region: 'Global', structure: 'model-selection', keyword: 'fuel-powered surfboard for rental business', source: {name: 'ZAIHAI product facts', url: `${siteUrl}/en/products/p1`, publishedDate: '2026-08-08', accessedDate: '2026-08-08', note: 'This draft only uses published P1 product facts and makes no performance comparison beyond them.'}, coverImage: products.p1.image, coverImageAlt: 'ZAIHAI P1 fuel-powered surfboard for open-water planning', seoTitle: 'Fuel-Powered Surfboard Planning for Open Water | ZAIHAI', seoDescription: 'When open-water operators may evaluate a fuel-powered surfboard option, including published P1 facts and local compliance checks.', content: draftContent({opening: 'Open-water operators may evaluate a fuel-powered surfboard when their operating plan requires a different refuelling workflow from an electric fleet. That choice should begin with local rules, fuel handling, weather windows, noise and emissions expectations, insurance and staff capability. It is not an argument that fuel equipment is suitable for every beach or water area.', operators: ['Confirm local permissions for fuel-powered equipment before planning any route or experience package.', 'Document fuel storage, refuelling, emergency and maintenance processes with trained personnel.', 'Use weather and water-condition stop criteria that are reviewed before each operating period.'], fit: 'ZAIHAI P1 is published with a 10.5 kW / 8700 rpm engine, 110 cc displacement, 62 km/h maximum speed, 3.5 L tank, two-stroke water-cooled engine, 50:1 fuel ratio, 150 kg maximum load and 12-month warranty. Verify the final configuration and local suitability with ZAIHAI and the relevant authorities.', scenario: 'An adventure operator first checks its fuel-policy and water-area permissions, then creates a supervised route and refuelling procedure before adding any rider sessions.', source: 'This is an editorial planning guide based on ZAIHAI published facts, not a report of an installed customer fleet.', faq: [['Is fuel-powered equipment allowed everywhere?', 'No. Regulations and venue rules vary significantly by location.'], ['Does the listed fuel tank define a ride duration?', 'No. This draft does not infer endurance from tank capacity.'], ['What should operators review first?', 'Local permissions, insurance, fuel handling, emergency procedures and staff training.']]})
  },
  {
    title: 'Safety Checks Rental Watercraft Operators Should Build Into Summer Operations', slug: 'rental-watercraft-summer-safety-checks', excerpt: 'A source-attributed safety checklist for rental operators that separates Kentucky guidance from universal legal claims.', category: 'Safety and Compliance', tags: ['Safety', 'Rentals', 'Operations'], productSlugs: ['x1', 'x1-pro', 'rage-shark-x', 'p1', 'p1-pro'], industry: 'Rental operations', region: 'United States', structure: 'industry-news', keyword: 'watercraft operator training', source: {name: 'Kentucky Fish and Wildlife', url: 'https://fw.ky.gov/News/Pages/Kentucky-Fish-and-Wildlife-encourages-safe-summer-boating.aspx', publishedDate: '2026-05-15', accessedDate: '2026-08-08', note: 'Used for safety context. Kentucky guidance is not presented as a global legal rule.'}, coverImage: products.x1.image, coverImageAlt: 'ZAIHAI X1 electric surfboard with safety planning context', seoTitle: 'Summer Watercraft Safety Checks for Rental Operators | ZAIHAI', seoDescription: 'A rental watercraft safety checklist inspired by a Kentucky public reminder, with local compliance limits clearly separated.', content: draftContent({opening: 'A Kentucky Fish and Wildlife summer boating reminder highlights familiar safety themes: preparation, life jackets, sober operation and attention to local rules. Those points are useful prompts for rental operators, but Kentucky requirements should not be presented as rules for other markets. Every operator needs a locally verified safety plan.', operators: ['Build a pre-opening check that covers weather, water area, rescue equipment and equipment condition.', 'Use a rider briefing that explains boundaries, stop signals and the conditions that end a session.', 'Keep maintenance and incident records so recurring issues can be reviewed rather than guessed.'], fit: 'ZAIHAI equipment selection should be matched to the buyer’s operating plan. Published product facts can support a comparison, but they do not determine local legal compliance or rider eligibility.', scenario: 'A rental operator pauses launches during poor weather, records the daily checks, verifies life-jacket availability and requires staff-led briefings before each booked session.', source: 'Kentucky Fish and Wildlife published its summer boating reminder on 2026-05-15. Its jurisdictional guidance is cited as context, not a global rule.', faq: [['Are Kentucky rules global rules?', 'No. They apply to Kentucky context; operators must check their own jurisdiction.'], ['Can a product page replace a safety plan?', 'No. Operating procedures, training and local approval are separate requirements.'], ['What records should be kept?', 'Daily checks, maintenance actions, rider briefings and incident reports, as appropriate for the operator.']]})
  },
  {
    title: 'From Island Resort Activity to a Bookable Lagoon Water Experience', slug: 'island-resort-bookable-lagoon-water-experience', excerpt: 'An editorial framework for translating lagoon activity interest into a bookable water-experience program without equating resort surf offers with electric surfboard use.', category: 'Destination Trends', tags: ['Island Resorts', 'Lagoon Programs', 'Booking Design'], productSlugs: ['x1', 'rage-shark-x'], industry: 'Island resorts', region: 'Maldives', structure: 'industry-news', keyword: 'island resort water sports', source: {name: 'Visit Maldives Corporate', url: 'https://corporate.visitmaldives.com/category/industry-news/page/3/', publishedDate: '2026-06-01', accessedDate: '2026-08-08', note: 'Used as hospitality context only. Traditional surf and lagoon activities are not equated with ZAIHAI products.'}, coverImage: products['rage-shark-x'].image, coverImageAlt: 'Rage Shark X electric go-kart boat for lagoon program planning', seoTitle: 'Bookable Lagoon Water Experience Planning | ZAIHAI', seoDescription: 'How island resorts can plan bookable lagoon water experiences while keeping product fit, safety and local rules distinct.', content: draftContent({opening: 'Island resorts often package water activity with the stay, and public Maldives hospitality coverage shows how surf and lagoon experiences remain part of that destination conversation. Traditional surf activities are not the same as electric surfboards or electric go-kart boats. Any equipment decision should therefore start with the resort’s actual lagoon conditions, activity design and local approvals.', operators: ['Define whether the experience is instructional, family-oriented, premium or a supervised demonstration before selecting equipment.', 'Use bookings to limit traffic and preserve a clear operating boundary in the lagoon.', 'Keep water conditions, weather, guest screening and insurance requirements within the local operating plan.'], fit: 'ZAIHAI X1 and Rage Shark X can be evaluated against their published product facts for different program concepts. The final fit depends on local permissions, water characteristics and staff capability.', scenario: 'A resort tests an illustrative program with timed bookings, a quiet observation zone, staff briefings and a contingency plan for weather or water-condition changes.', source: 'Visit Maldives Corporate published resort-industry items on 2026-06-01. This article uses them only as destination context and does not claim that those resorts use ZAIHAI products.', faq: [['Does a lagoon program suit every watercraft?', 'No. Suitability depends on water conditions, permissions and the operating plan.'], ['Is a resort surf offer evidence for electric-surfboard use?', 'No. The activities are distinct and should not be conflated.'], ['What should a resort send in an inquiry?', 'Country, water area, guest profile, operating hours and any local constraints already known.']]})
  }
];

function makeDraft(seed: DraftSeed): AutopilotDraft {
  const now = isoNow(); const contentHash = hash(`${seed.title}\n${seed.content}`);
  return {...seed, id: `news-draft-${hash(seed.slug).slice(0, 12)}`, status: 'draft', contentHash, createdAt: now, updatedAt: now, languageStatus: {en: 'pending_editorial', es: 'pending_editorial', fr: 'pending_editorial', de: 'pending_editorial', ar: 'pending_editorial', pt: 'pending_editorial', ru: 'pending_editorial'}, validation: validateDraft({...seed, id: 'validation', status: 'draft', contentHash, createdAt: now, updatedAt: now, languageStatus: {}, validation: []})};
}

export function validateDraft(draft: AutopilotDraft) {
  const issues: string[] = [];
  if (!draft.title || draft.title.length > 78) issues.push('Title is missing or too long.');
  if (!draft.content.includes('## Safety and local compliance note')) issues.push('Missing compliance note.');
  if (!draft.content.includes('## Source context')) issues.push('Missing source context.');
  if (!draft.source.url.startsWith('https://')) issues.push('Source URL is not HTTPS.');
  if (!draft.coverImage.startsWith('/assets/')) issues.push('Cover image is not an approved owned media asset.');
  if (draft.content.includes('revolutionary') || draft.content.includes('game-changing')) issues.push('Contains prohibited template language.');
  return issues;
}

export async function seedNewsAutopilotDrafts() {
  const state = await readNewsAutopilotState();
  const existing = new Set(state.drafts.map((draft) => draft.slug));
  const additions = draftSeeds.filter((seed) => !existing.has(seed.slug)).map(makeDraft);
  const now = isoNow();
  const seedRun: AutopilotRun = {id: crypto.randomUUID(), trigger: 'seed', startedAt: now, finishedAt: now, mode: 'dry-run', status: 'drafted', reason: `${additions.length} editorial review drafts created; nothing was published.`};
  const next = {...state, drafts: [...state.drafts, ...additions], runs: [...state.runs, seedRun], audit: [...state.audit, {at: now, action: 'seed-drafts', detail: `${additions.length} initial News drafts created for review.`}]};
  await saveState(next); return next;
}

export async function setNewsAutopilotEnabled(enabled: boolean) {
  const state = await readNewsAutopilotState(); const now = isoNow();
  const next = {...state, enabled, audit: [...state.audit, {at: now, action: 'toggle-autopilot', detail: enabled ? 'Automatic draft planning enabled.' : 'Automatic News publishing disabled.'}]};
  await saveState(next); return next;
}

export async function runNewsAutopilot(trigger: 'cron' | 'manual', dryRun: boolean) {
  const state = await readNewsAutopilotState(); const now = isoNow();
  const runtime = newsAutopilotRuntimeStatus();
  let reason = ''; let status: AutopilotRun['status'] = 'skipped';
  if (!runtime.schedulingEnabled) reason = 'The production scheduling switch is disabled.';
  else if (!state.enabled) reason = 'Automatic News planning is disabled by the administrator.';
  else if (!runtime.hasDistributedLock) reason = 'A production KV-backed distributed lock is required before automation can publish.';
  else if (!runtime.publishingEnabled || !state.publishEnabled) reason = 'Draft planning is enabled, but the public publishing switch remains closed.';
  else if (!canPublishAt(state.lastPublishedAt)) reason = 'The 48-hour Asia/Manila publication window is still cooling down.';
  else reason = 'No approved source-to-draft content model is configured. The run was recorded without publishing.';
  const run = {id: crypto.randomUUID(), trigger, startedAt: now, finishedAt: isoNow(), mode: dryRun ? 'dry-run' as const : 'live' as const, status, reason};
  const next = {...state, runs: [...state.runs, run], audit: [...state.audit, {at: now, action: `${trigger}-run`, detail: reason}]};
  if (!dryRun) await saveState(next);
  return run;
}

export async function publishNewsAutopilotDraft(draftId: string) {
  const state = await readNewsAutopilotState(); const draft = state.drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error('Draft not found.');
  if (draft.status === 'published') return draft;
  if (draft.validation.length) throw new Error(`Draft quality gate failed: ${draft.validation.join(' ')}`);
  const existing = await listAdminPosts('news');
  if (!existing.some((post) => post.slug === draft.slug)) {
    const now = isoNow();
    await writeAdminStore((store) => ({...store, posts: [...store.posts, {id: `autopilot-${draft.id}`, type: 'news', slug: draft.slug, title: draft.title, excerpt: draft.excerpt, coverImage: draft.coverImage, coverImageSourceUrl: `${siteUrl}/en/products`, coverImagePageUrl: `${siteUrl}/en/products`, coverImageAlt: draft.coverImageAlt, coverImageStatus: 'illustrative', category: draft.category, content: draft.content, publishDate: now.slice(0, 10), author: 'ZAIHAI Editorial Team', source: `${draft.source.name}: ${draft.source.url}`, tags: draft.tags, seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, status: 'published', createdAt: now, updatedAt: now} as ContentPost]}));
  }
  const now = isoNow(); const updated = {...draft, status: 'published' as const, updatedAt: now, languageStatus: {...draft.languageStatus, en: 'published' as const}};
  const next = {...state, lastPublishedAt: now, drafts: state.drafts.map((item) => item.id === draft.id ? updated : item), audit: [...state.audit, {at: now, action: 'manual-publish-draft', detail: `${draft.slug} published after editorial approval.`}]};
  await saveState(next); return updated;
}
