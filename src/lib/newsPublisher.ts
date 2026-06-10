import {readAdminStore, writeAdminStore, type ContentPost} from '@/lib/backendStore';
import {siteUrl} from '@/lib/site';

type Candidate = Omit<ContentPost, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'status'>;

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
  const published = new Set(store.posts.map((post) => post.slug));
  const candidate = candidates.find((item) => !published.has(item.slug));
  if (!candidate) {
    return {published: false, reason: 'No unpublished candidate remains. Add more source-attributed candidates before the next cycle.'};
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

  return {published: true, slug: post.slug, title: post.title, image};
}
