import {requireAdminApiSession} from '@/lib/adminAuth';
import {listAdminPosts, writeAdminStore, type ContentType, type PublishStatus} from '@/lib/backendStore';
import {isOwnSiteImage} from '@/lib/sourceImages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 1200) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

function postStatus(value: string): PublishStatus {
  return ['draft', 'published', 'unpublished', 'scheduled', 'archived'].includes(value) ? value as PublishStatus : 'draft';
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
  const coverImage = text(formData, 'coverImage', 600);
  const status = postStatus(text(formData, 'status', 24));
  if (status === 'published' && (!coverImage || isOwnSiteImage(coverImage))) {
    return Response.json({
      message: '正式发布 News/Blog 必须填写可访问的外部引用图片 URL，不能使用站内产品图、站内媒体图或默认占位图。'
    }, {status: 400});
  }
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
        coverImage,
        coverImageSourceUrl: coverImage,
        coverImagePageUrl: text(formData, 'source', 600).match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, '') || '',
        coverImageAlt: `${text(formData, 'title', 220)} source image`,
        coverImageStatus: coverImage ? 'validated' : 'pending',
        category: text(formData, 'category', 120) || (type === 'news' ? 'Industry News' : 'Product Knowledge'),
        content: text(formData, 'content', 6000),
        publishDate: text(formData, 'publishDate', 20) || now.slice(0, 10),
        author: text(formData, 'author', 120) || 'ZAIHAI Editorial Team',
        source: text(formData, 'source', 600),
        tags: text(formData, 'tags', 300).split(',').map((item) => item.trim()).filter(Boolean),
        seoTitle: text(formData, 'seoTitle', 220) || `${text(formData, 'title', 220)} | ZAIHAI SURFING`,
        seoDescription: text(formData, 'seoDescription', 260) || text(formData, 'excerpt', 240),
        status,
        createdAt: now,
        updatedAt: now
      }
    ]
  }));
  return Response.redirect(new URL(`/admin/${type}`, request.url), 303);
}
