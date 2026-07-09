import {readAdminStore, writeAdminStore, type ContentPost} from '@/lib/backendStore';
import {resolveSourceImage} from '@/lib/sourceImages';

type BlogCandidate = Omit<ContentPost, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'status'>;

const DAILY_BLOG_TARGET = 1;

const blogTopics = [
  {
    slug: 'commercial-electric-surfboard-buying-checklist',
    title: 'Commercial Electric Surfboard Buying Checklist for Resorts and Rentals',
    excerpt: 'A practical guide for comparing speed, battery workflow, waterproof design, training and after-sales support before buying electric surfboards.',
    category: 'Buying Guide',
    tags: ['Electric Surfboards', 'Resorts', 'Rental Fleet'],
    source: 'ShoreMaster waterfront industry report: https://www.shoremaster.com/blog/articles/state-of-the-waterfront-industry-2026-key-trends-in-docks-lifts-and-marinas/',
    preferredImage: 'https://www.shoremaster.com/media/cukbt3s2/trad-oakwoodgrain_rs4_towermaxx_1.jpg',
    paragraphs: [
      'Commercial buyers should compare electric surfboards by daily operating workflow, not only by top speed.',
      'The purchase checklist should include charging capacity, waterproof structure, spare battery planning, rider briefing time, staff training and replacement parts.',
      'For resorts and rental fleets, X1 can support broader commercial use while X1 Pro is better positioned for premium demos and advanced riders.'
    ]
  },
  {
    slug: 'go-kart-boat-rental-program-planning',
    title: 'How to Plan a Go-Kart Boat Rental Program for Water Parks and Scenic Areas',
    excerpt: 'A B2B guide for building beginner-friendly water attractions with clear session design, safety routines and fleet planning.',
    category: 'Rental Operations',
    tags: ['Go-Kart Boats', 'Water Parks', 'Operations'],
    source: 'NEOM Sindalah newsroom: https://www.neom.com/en-us/newsroom/neom-board-of-directors-showcases-opening-of-sindalah',
    preferredImage: 'https://www.neom.com/content/dam/neom/newsroom/opening-of-sindalah/sindalah-island-at-sunset.jpeg',
    paragraphs: [
      'A go-kart boat program works best when the route, ride duration, staff supervision and queue process are planned before purchase.',
      'Operators should evaluate product stability, battery rotation, protective gear, daily inspection and simple guest instructions.',
      'Rage Shark X is positioned for scenic areas, water parks and rental operators that need an easier entry point than high-speed boards.'
    ]
  },
  {
    slug: 'fuel-vs-electric-surfboard-commercial-selection',
    title: 'Fuel vs Electric Surfboards: Commercial Selection Guide for Distributors',
    excerpt: 'A product-positioning guide for distributors comparing electric surfboards with fuel-powered surfboards for different buyer types.',
    category: 'Product Comparison',
    tags: ['Fuel Surfboards', 'Electric Surfboards', 'Distributors'],
    source: 'Claritas Intelligence electric surfboard market release: https://claritasintelligence.com/press-release/global-electric-surfboard-market',
    preferredImage: 'https://claritasintelligence.com/api/og?title=Global%20Electric%20Surfboard%20Market%20Projected%20to%20Reach%20US%24%2066.34%20Million%20by%202033%20as%20AI-Driven%20Battery%20Management%20and%20eFoil%20Innovation%20Redefine%20Marine%20Recreation',
    paragraphs: [
      'Electric and fuel-powered surfboards serve different commercial conversations.',
      'Electric boards are easier to position for clean resort experiences and shorter training workflows, while fuel-powered boards can support longer outdoor adventure programs.',
      'Distributors should build catalog bundles around buyer type: resorts, rental fleets, outdoor bases and premium rider communities.'
    ]
  }
];

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isTodayBlog(post: ContentPost, date = new Date()) {
  return post.type === 'blog' && post.status === 'published' && post.publishDate === todayKey(date);
}

function sourceUrlFrom(value: string) {
  return value.match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, '') || '';
}

function candidateFor(posts: ContentPost[]): BlogCandidate | null {
  const publishedSlugs = new Set(posts.map((post) => post.slug));
  const dateKey = todayKey().replace(/-/g, '');
  for (let offset = 0; offset < blogTopics.length * 20; offset += 1) {
    const topic = blogTopics[offset % blogTopics.length];
    const slug = `auto-blog-${dateKey}-${offset + 1}-${topic.slug}`;
    if (publishedSlugs.has(slug)) continue;
    return {
      slug,
      title: `${topic.title} (${todayKey()} Edition)`,
      excerpt: topic.excerpt,
      coverImage: topic.preferredImage,
      category: topic.category,
      content: `${topic.paragraphs.join('\n\n')}\n\nSEO/GEO note: this guide is structured for commercial buyer questions, product comparison and answer-engine citation. It links decisions back to real ZAIHAI product categories without inventing specifications.`,
      publishDate: '',
      author: 'ZAIHAI Editorial Team',
      source: topic.source,
      tags: topic.tags,
      seoTitle: `${topic.title} | ZAIHAI Buying Guide`,
      seoDescription: topic.excerpt.slice(0, 155)
    };
  }
  return null;
}

export async function publishDailyAutomatedBlog(target = DAILY_BLOG_TARGET) {
  const parsedTarget = Number.isFinite(Number(target)) ? Number(target) : DAILY_BLOG_TARGET;
  const requestedTarget = Math.max(0, Math.min(3, parsedTarget));
  const initialStore = await readAdminStore();
  const alreadyPublishedToday = initialStore.posts.filter((post) => isTodayBlog(post)).length;
  const remainingTarget = Math.max(0, requestedTarget - alreadyPublishedToday);
  const results = [];
  let publishedCount = 0;

  for (let index = 0; index < remainingTarget; index += 1) {
    const latestStore = await readAdminStore();
    const candidate = candidateFor(latestStore.posts);
    if (!candidate) {
      results.push({published: false, reason: 'No non-duplicate blog candidate was available.'});
      break;
    }
    const usedImages = new Set(latestStore.posts.filter((post) => post.type === 'blog').map((post) => post.coverImage));
    const image = await resolveSourceImage({
      pageUrl: sourceUrlFrom(candidate.source),
      title: candidate.title,
      usedImages,
      preferredImages: [candidate.coverImage],
      allowReuseAfterExhausted: true
    });
    const now = new Date().toISOString();
    const post: ContentPost = {
      ...candidate,
      coverImage: image.url,
      coverImageSourceUrl: image.sourceUrl,
      coverImagePageUrl: image.pageUrl,
      coverImageAlt: image.alt,
      coverImageFetchedAt: image.fetchedAt,
      coverImageStatus: image.status,
      id: `post-${candidate.slug}`,
      type: 'blog',
      publishDate: todayKey(),
      status: 'published',
      createdAt: now,
      updatedAt: now
    };
    await writeAdminStore((current) => ({
      ...current,
      posts: [post, ...current.posts.filter((item) => item.slug !== post.slug)]
    }));
    results.push({published: true, slug: post.slug, title: post.title, image});
    publishedCount += 1;
  }

  return {
    mode: 'daily_blog_batch',
    target: requestedTarget,
    alreadyPublishedToday,
    publishedCount,
    totalPublishedToday: alreadyPublishedToday + publishedCount,
    completed: alreadyPublishedToday + publishedCount >= requestedTarget,
    results
  };
}

export async function repairBlogImageDiversity() {
  const current = await readAdminStore();
  const now = new Date().toISOString();
  const used = new Set<string>();
  const posts: ContentPost[] = [];
  let changed = 0;
  const errors: {slug: string; error: string}[] = [];

  for (const post of current.posts) {
    if (post.type !== 'blog' || post.status !== 'published') {
      posts.push(post);
      continue;
    }
    if (post.coverImage && !post.coverImage.startsWith('/') && !post.coverImage.includes('zaihaisurfing.com') && !used.has(post.coverImage)) {
      used.add(post.coverImage);
      posts.push(post);
      continue;
    }
    const sourceUrl = sourceUrlFrom(post.source) || post.coverImagePageUrl || post.coverImageSourceUrl || '';
    try {
      const image = await resolveSourceImage({pageUrl: sourceUrl, title: post.title, usedImages: used, allowReuseAfterExhausted: true});
      used.add(image.url);
      changed += 1;
      posts.push({
        ...post,
        coverImage: image.url,
        coverImageSourceUrl: image.sourceUrl,
        coverImagePageUrl: image.pageUrl,
        coverImageAlt: image.alt,
        coverImageFetchedAt: image.fetchedAt,
        coverImageStatus: image.status,
        updatedAt: now
      });
    } catch (error) {
      errors.push({slug: post.slug, error: error instanceof Error ? error.message : String(error)});
      posts.push(post);
    }
  }

  if (changed) await writeAdminStore((latest) => ({...latest, posts}));
  return {changed, errors, images: posts.filter((post) => post.type === 'blog' && post.status === 'published').map((post) => post.coverImage)};
}
