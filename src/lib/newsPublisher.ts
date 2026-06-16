import {readAdminStore, writeAdminStore, type ContentPost} from '@/lib/backendStore';
import {recordPublishedAutomatedNews, selectNextAutomatedNews} from '@/lib/newsIntelligence';
import {siteUrl} from '@/lib/site';

type Candidate = Omit<ContentPost, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'status'>;

type SourceBrief = {
  key: string;
  name: string;
  url: string;
  images: string[];
  category: string;
  tags: string[];
};

const sourceBriefs: SourceBrief[] = [
  {
    key: 'red-sea',
    name: 'NEOM Sindalah newsroom',
    url: 'https://www.neom.com/en-us/newsroom/neom-board-of-directors-showcases-opening-of-sindalah',
    images: ['/assets/news/neom-sindalah.webp', '/assets/news/neom-sindalah-marina-detail.jpg'],
    category: 'Water Sports Destinations',
    tags: ['Middle East', 'Resorts', 'Yacht Clubs']
  },
  {
    key: 'marina-fleets',
    name: 'ShoreMaster waterfront industry report',
    url: 'https://www.shoremaster.com/blog/articles/state-of-the-waterfront-industry-2026-key-trends-in-docks-lifts-and-marinas/',
    images: [
      '/assets/news/shoremaster-waterfront-trends.webp',
      '/assets/news/shoremaster-vertical-lift-sunset.jpg',
      '/assets/news/shoremaster-dock-bench.jpg',
      '/assets/news/shoremaster-dock-ipe.jpg'
    ],
    category: 'Resort & Rental Operations',
    tags: ['Electric Boating', 'Rentals', 'Marinas']
  },
  {
    key: 'electric-surfboards',
    name: 'Claritas Intelligence electric surfboard market release',
    url: 'https://claritasintelligence.com/press-release/global-electric-surfboard-market',
    images: [
      '/assets/news/claritas-electric-surfboard-market.webp',
      '/assets/catalog/optimized/x1-pro.jpg',
      '/assets/catalog/optimized/x1.jpg',
      '/assets/catalog/optimized/rage-shark-x.jpg'
    ],
    category: 'Electric Surfboards',
    tags: ['Electric Surfboards', 'Commercial Rentals', 'Product Selection']
  }
];

const rollingAngles = [
  {
    slug: 'resort-guest-sessions',
    title: 'Resort Buyers Are Planning Shorter, Easier Water Sports Guest Sessions',
    excerpt: 'Public destination and marina signals point to compact water attractions that can be operated repeatedly through the day.',
    paragraphs: [
      'Waterfront operators are increasingly planning water experiences around short, repeatable sessions instead of one-off adventure products.',
      'For resort teams, that changes the equipment brief. Easy onboarding, visible safety routines, charging workflow and spare parts planning become part of the purchase decision.',
      'Electric surfboards and go-kart boats can help resorts create a premium visual experience while keeping operating windows easier to manage.'
    ]
  },
  {
    slug: 'marina-operator-planning',
    title: 'Marina Operators Need Equipment Plans That Match Dockside Workflow',
    excerpt: 'Marina growth signals continue to favor water attractions that are compact, clean and easy for teams to supervise.',
    paragraphs: [
      'Marinas and yacht clubs are treating recreation equipment as part of the dockside service mix, not just an add-on rental shelf.',
      'Buyers should compare products by storage footprint, daily inspection needs, battery rotation, rider briefing time and after-sales parts availability.',
      'A mixed fleet of electric surfboards and beginner-friendly watercraft can support both premium riders and first-time guests.'
    ]
  },
  {
    slug: 'distributor-demo-programs',
    title: 'Distributors Can Use Demo Programs to Explain Premium Water Sports Products',
    excerpt: 'Commercial buyers often need to see operating workflow before committing to electric water sports equipment.',
    paragraphs: [
      'For overseas distributors, product education is becoming as important as product specification.',
      'A strong demo program should show charging, waterproof structure, rider onboarding, safety controls and spare parts support in one clear workflow.',
      'ZAIHAI product content can be paired with localized demos for rental operators, resorts and yacht clubs.'
    ]
  },
  {
    slug: 'fleet-after-sales',
    title: 'After-Sales Planning Is Becoming Central to Electric Water Sports Fleet Buying',
    excerpt: 'Rental and resort buyers increasingly evaluate service workflow, spare parts and staff training alongside speed and battery data.',
    paragraphs: [
      'Commercial water sports equipment is judged by uptime, not only by top speed or product appearance.',
      'Before placing fleet orders, buyers should define inspection checklists, battery handling, part replacement rules and support contacts.',
      'That operating plan helps teams protect guest experience and keep rental schedules predictable.'
    ]
  },
  {
    slug: 'premium-waterfront-positioning',
    title: 'Premium Waterfront Projects Are Using Water Attractions as Brand Signals',
    excerpt: 'Luxury waterfront projects continue to show why visually strong water sports equipment matters for destination positioning.',
    paragraphs: [
      'Premium waterfront projects use marina visuals, guest activities and social sharing moments to strengthen destination identity.',
      'Water sports products that look distinctive and are easy to explain can support that positioning for resorts and clubs.',
      'The equipment shortlist should balance brand impact with daily operating simplicity.'
    ]
  },
  {
    slug: 'rental-fleet-mix',
    title: 'Rental Fleets Need a Better Mix of Beginner and Premium Water Attractions',
    excerpt: 'Public waterfront trends show demand for water experiences that serve more than one customer skill level.',
    paragraphs: [
      'A single high-performance product is rarely enough for a full commercial rental program.',
      'Operators should plan a mix that includes premium rides, beginner-friendly sessions and visual products that are easy to promote online.',
      'This approach gives sales teams more ways to package water experiences for different guest groups.'
    ]
  }
];

const candidates: Candidate[] = [
  {
    slug: 'auto-red-sea-waterfront-experiences',
    title: 'Red Sea Waterfront Projects Keep Raising the Bar for Guest Water Experiences',
    excerpt: 'Luxury coastal projects continue to show why resorts and marinas need memorable, easy-to-operate water sports attractions.',
    coverImage: '/assets/news/neom-sindalah.webp',
    category: 'Water Sports Destinations',
    content: 'Luxury waterfront development is increasingly built around marinas, visual guest experiences and differentiated leisure activities.\n\nFor water sports buyers, this makes equipment planning part of destination design rather than a simple rental add-on.\n\nElectric surfboards and go-kart boats can support resort demos, yacht club activation and family-friendly attraction programs.',
    publishDate: '',
    author: 'ZAIHAI Editorial Team',
    source: 'NEOM Sindalah newsroom: https://www.neom.com/en-us/newsroom/neom-board-of-directors-showcases-opening-of-sindalah',
    tags: ['Middle East', 'Resorts', 'Yacht Clubs'],
    seoTitle: 'Red Sea Waterfront Water Sports Experience Update | ZAIHAI SURFING',
    seoDescription: 'Source-attributed ZAIHAI update on luxury waterfront projects and water sports equipment planning.'
  },
  {
    slug: 'auto-marina-rental-fleet-electrification',
    title: 'Marina Rental Fleets Are Moving Toward Cleaner Electric Water Attractions',
    excerpt: 'Waterfront operators are looking for compact electric equipment that can create short, repeatable and easy-to-supervise guest sessions.',
    coverImage: '/assets/news/shoremaster-waterfront-trends.webp',
    category: 'Resort & Rental Operations',
    content: 'Marina and dock operators are paying more attention to clean, compact and easy-to-manage waterfront recreation.\n\nFor rental fleets, the buying decision should include charging workflow, rider onboarding, spare parts and daily inspection.\n\nSmall electric watercraft can help operators add paid experiences without the complexity of full-size boat programs.',
    publishDate: '',
    author: 'ZAIHAI Editorial Team',
    source: 'ShoreMaster waterfront industry report: https://www.shoremaster.com/blog/articles/state-of-the-waterfront-industry-2026-key-trends-in-docks-lifts-and-marinas/',
    tags: ['Electric Boating', 'Rentals', 'Marinas'],
    seoTitle: 'Electric Marina Rental Fleet Update | ZAIHAI SURFING',
    seoDescription: 'Source-attributed ZAIHAI update on marina rental fleet electrification and buyer planning.'
  },
  {
    slug: 'auto-electric-surfboard-commercial-use',
    title: 'Electric Surfboards Continue to Gain Commercial Resort Relevance',
    excerpt: 'Market commentary points to electric surfboards becoming more relevant for resorts, rental operators and coastal leisure businesses.',
    coverImage: '/assets/news/claritas-electric-surfboard-market.webp',
    category: 'Electric Surfboards',
    content: 'Electric surfboards are increasingly discussed as commercial assets, not only enthusiast products.\n\nFor commercial buyers, speed is only one part of the decision. Battery workflow, waterproof structure, training, support and spare parts planning matter just as much.\n\nDistributors can package premium boards with beginner-friendly water attractions to serve more visitor types.',
    publishDate: '',
    author: 'ZAIHAI Editorial Team',
    source: 'Claritas Intelligence electric surfboard market release: https://claritasintelligence.com/press-release/global-electric-surfboard-market',
    tags: ['Electric Surfboards', 'Commercial Rentals', 'Product Selection'],
    seoTitle: 'Electric Surfboard Commercial Resort Update | ZAIHAI SURFING',
    seoDescription: 'Source-attributed ZAIHAI update on commercial electric surfboard use for resorts and rentals.'
  }
];

function slotDate(base: Date, offset: number) {
  const date = new Date(base);
  date.setUTCHours(Math.floor(date.getUTCHours() / 3) * 3, 0, 0, 0);
  date.setUTCHours(date.getUTCHours() + offset * 3);
  return date;
}

function rollingCandidate(base: Date, offset: number, usedImages: Set<string>): Candidate | null {
  const slot = slotDate(base, offset);
  const slotId = slot.toISOString().slice(0, 13).replace(/[-T:]/g, '');
  const angle = rollingAngles[offset % rollingAngles.length];
  const source = sourceBriefs[Math.floor(offset / rollingAngles.length) % sourceBriefs.length];
  const coverImage = source.images.find((image) => !usedImages.has(image));
  if (!coverImage) return null;
  const title = `${angle.title} for ${source.category}`;
  const sourceLine = `${source.name}: ${source.url}`;
  return {
    slug: `auto-${slotId}-${source.key}-${angle.slug}`,
    title,
    excerpt: angle.excerpt,
    coverImage,
    category: source.category,
    content: `${angle.paragraphs.join('\n\n')}\n\nSource note: this automated article uses public material from ${source.name} for market context and image attribution.`,
    publishDate: '',
    author: 'ZAIHAI Editorial Team',
    source: sourceLine,
    tags: source.tags,
    seoTitle: `${title} | ZAIHAI SURFING`,
    seoDescription: angle.excerpt
  };
}

function canonical(value: string) {
  return value
    .toLowerCase()
    .replace(/\(\d{4}-\d{2}-\d{2}\)/g, '')
    .replace(/\s+for\s+(water sports destinations|resort and rental operations|electric surfboards)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function topicKey(candidate: Pick<Candidate, 'title' | 'excerpt' | 'content'>) {
  return `${canonical(candidate.title)}|${canonical(candidate.excerpt)}|${canonical(candidate.content).slice(0, 120)}`;
}

function nextCandidate(publishedSlugs: Set<string>, publishedTopics: Set<string>, usedImages: Set<string>) {
  const staticCandidate = candidates.find((item) => !publishedSlugs.has(item.slug) && !publishedTopics.has(topicKey(item)) && !usedImages.has(item.coverImage));
  if (staticCandidate) return staticCandidate;
  const now = new Date();
  for (let offset = 0; offset < 240; offset += 1) {
    const candidate = rollingCandidate(now, offset, usedImages);
    if (!candidate) continue;
    const key = topicKey(candidate);
    if (!publishedSlugs.has(candidate.slug) && !publishedTopics.has(key)) return candidate;
  }
  return null;
}

const repairImagePool = [
  '/assets/news/neom-sindalah.webp',
  '/assets/news/neom-sindalah-marina-detail.jpg',
  '/assets/news/shoremaster-waterfront-trends.webp',
  '/assets/news/shoremaster-vertical-lift-sunset.jpg',
  '/assets/news/shoremaster-dock-bench.jpg',
  '/assets/news/shoremaster-dock-ipe.jpg',
  '/assets/news/claritas-electric-surfboard-market.webp',
  '/assets/catalog/optimized/x1-pro.jpg',
  '/assets/catalog/optimized/x1.jpg',
  '/assets/catalog/optimized/rage-shark-x.jpg',
  '/assets/catalog/optimized/p1.jpg',
  '/assets/catalog/optimized/p1-pro.jpg',
  '/assets/banners/market-middle-east-optimized.jpg',
  '/assets/banners/market-north-america-optimized.jpg',
  '/assets/banners/market-europe-optimized.jpg',
  '/assets/banners/market-asia-optimized.jpg',
  '/assets/banners/market-middle-east-mobile.jpg',
  '/assets/banners/market-north-america-mobile.jpg',
  '/assets/banners/market-europe-mobile.jpg',
  '/assets/banners/market-asia-mobile.jpg',
  '/assets/banners/zaihai-main-banner-desktop-optimized.jpg',
  '/assets/banners/zaihai-main-banner-mobile-optimized.jpg',
  '/assets/banners/zaihai-video-poster-card.jpg',
  '/assets/banners/zaihai-video-poster-optimized.jpg',
  '/assets/catalog/x1-pro/product-mega-thumb.jpg',
  '/assets/banners/surfing-rider-01.png',
  '/assets/banners/surfing-rider-02.png',
  '/assets/banners/surfing-rider-03.png',
  '/assets/catalog/collection-electric-surfboard.png',
  '/assets/catalog/collection-fuel-surfboard.png',
  '/assets/catalog/collection-go-kart-boat.png',
  '/assets/catalog/collection-oem-support.png',
  '/assets/catalog/x1/hero-angle.png',
  '/assets/catalog/x1/side-view.png',
  '/assets/catalog/x1/rear-view.png',
  '/assets/catalog/x1/top-view.png',
  '/assets/catalog/x1-pro/hero-angle.png',
  '/assets/catalog/x1-pro/side-view.png',
  '/assets/catalog/x1-pro/rear-view.png',
  '/assets/catalog/x1-pro/top-view.png',
  '/assets/catalog/rage-shark-x/hero-angle.png',
  '/assets/catalog/rage-shark-x/side-view.png',
  '/assets/catalog/rage-shark-x/top-view.png',
  '/assets/catalog/rage-shark-x/front-view.png',
  '/assets/catalog/p1/hero-angle.png',
  '/assets/catalog/p1/side-view.png',
  '/assets/catalog/p1/rear-view.png',
  '/assets/catalog/p1/detail-view.png',
  '/assets/catalog/p1-pro/product.png',
  '/assets/catalog/p1-pro/scene-01.png',
  '/assets/catalog/p1-pro/scene-02.png',
  '/assets/catalog/p1-pro/scene-03.png'
];

function replacementImage(used: Set<string>) {
  return repairImagePool.find((image) => !used.has(image));
}

export async function repairNewsImageDiversity() {
  const now = new Date().toISOString();
  let changed = 0;
  const store = await writeAdminStore((current) => {
    const used = new Set(
      current.posts
        .filter((post) => post.type === 'news' && post.status === 'published' && !post.slug.startsWith('auto-'))
        .map((post) => post.coverImage)
    );
    const posts = current.posts.map((post) => {
      if (post.type !== 'news' || post.status !== 'published') return post;
      if (!post.slug.startsWith('auto-')) return post;
      if (!used.has(post.coverImage)) {
        used.add(post.coverImage);
        return post;
      }
      const coverImage = replacementImage(used);
      if (!coverImage) return post;
      used.add(coverImage);
      changed += 1;
      return {...post, coverImage, updatedAt: now};
    });
    return changed ? {...current, posts} : current;
  });
  const newsImages = store.posts.filter((post) => post.type === 'news' && post.status === 'published').map((post) => post.coverImage);
  return {changed, images: newsImages};
}

async function validateImage(url: string) {
  const absolute = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const response = await fetch(absolute, {method: 'GET', cache: 'no-store'});
  if (!response.ok) throw new Error(`Image failed ${response.status}: ${absolute}`);
  const type = response.headers.get('content-type') || '';
  if (!/^image\/(avif|webp|png|jpe?g)/i.test(type)) throw new Error(`Invalid image content-type ${type}: ${absolute}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const signature = Array.from(bytes.slice(0, 12)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const valid = signature.startsWith('ffd8ff') || signature.startsWith('89504e47') || signature.includes('57454250') || signature.startsWith('000000') && signature.includes('6674797061766966');
  if (!valid) throw new Error(`Invalid image signature ${signature}: ${absolute}`);
  return {absolute, type, size: bytes.length};
}

export async function publishNextAutomatedNews() {
  const store = await readAdminStore();
  const {candidate, diagnostics} = await selectNextAutomatedNews(store.posts);
  if (!candidate) {
    return {published: false, reason: diagnostics.reason || 'No qualified non-duplicate news candidate was found.', diagnostics};
  }

  const image = await validateImage(candidate.coverImage);
  const now = new Date().toISOString();
  const publishDate = now.slice(0, 10);
  const post: ContentPost = {
    ...candidate,
    id: `post-${candidate.slug}`,
    type: 'news',
    publishDate,
    status: 'published',
    createdAt: now,
    updatedAt: now
  };

  await writeAdminStore((current) => ({
    ...current,
    posts: [post, ...current.posts.filter((item) => item.slug !== post.slug)]
  }));

  await recordPublishedAutomatedNews(candidate);

  return {published: true, slug: post.slug, title: post.title, image, diagnostics};
}

export async function publishDailyAutomatedNews(target = 4) {
  const results = [];
  let publishedCount = 0;

  for (let index = 0; index < target; index += 1) {
    const result = await publishNextAutomatedNews();
    results.push(result);
    if (!result.published) {
      break;
    }
    publishedCount += 1;
  }

  return {
    mode: 'daily_batch',
    target,
    publishedCount,
    results,
    completed: publishedCount >= target
  };
}
