import {requireAdminApiSession} from '@/lib/adminAuth';
import {listAdminPosts, writeAdminStore, type ContentType} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 1200) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

export async function GET(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const type = new URL(request.url).searchParams.get('type') as ContentType | null;
  return Response.json({posts: await listAdminPosts(type || undefined)});
}

export async function POST(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const now = new Date().toISOString();
  const type = (text(formData, 'type', 12) === 'news' ? 'news' : 'blog') as ContentType;
  await writeAdminStore((store) => ({
    ...store,
    posts: [
      ...store.posts,
      {
        id: `post-${Date.now()}`,
        type,
        slug: text(formData, 'slug', 140),
        title: text(formData, 'title', 220),
        excerpt: text(formData, 'excerpt', 500),
        coverImage: text(formData, 'coverImage', 260) || '/assets/banners/surfing-rider-01.png',
        category: type === 'news' ? 'Industry News' : 'Product Knowledge',
        content: '',
        publishDate: now.slice(0, 10),
        author: 'ZAIHAI Editorial Team',
        source: text(formData, 'source', 600),
        tags: text(formData, 'tags', 300).split(',').map((item) => item.trim()).filter(Boolean),
        seoTitle: `${text(formData, 'title', 220)} | ZAIHAI SURFING`,
        seoDescription: text(formData, 'excerpt', 240),
        status: 'draft',
        createdAt: now,
        updatedAt: now
      }
    ]
  }));
  return Response.redirect(new URL(`/admin/${type}`, request.url), 303);
}
