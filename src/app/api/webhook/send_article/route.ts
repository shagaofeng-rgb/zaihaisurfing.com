import crypto from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {writeAdminStore} from '@/lib/backendStore';
import {appendStoreLine} from '@/lib/durableStore';
import {isOwnSiteImage, resolveSourceImage} from '@/lib/sourceImages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_TITLE_LENGTH = 220;
const MAX_CONTENT_LENGTH = 20_000;
const MAX_AUTHOR_LENGTH = 120;
const MAX_IMAGE_URL_LENGTH = 1_500;
const MAX_PERSIST_ATTEMPTS = 2;

function reply(code: 0 | 1, msg: string, status = 200) {
  return Response.json({code, msg}, {status});
}

function value(formData: FormData, field: string, limit: number) {
  return String(formData.get(field) || '').trim().slice(0, limit);
}

function secretMatches(received: string, expected: string) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function slugify(title: string, fingerprint: string) {
  const base = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
  return `${base || 'blog-article'}-${fingerprint.slice(0, 10)}`;
}

function excerptFrom(content: string) {
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function articleFingerprint(title: string, content: string) {
  return crypto.createHash('sha256').update(`${title}\n${content}`).digest('hex');
}

async function retryOnce<T>(operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_PERSIST_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < MAX_PERSIST_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  }
  throw lastError;
}

async function recordRun(value: Record<string, unknown>) {
  try {
    await appendStoreLine('blog-webhook-runs.jsonl', value);
  } catch (error) {
    // A completed publication must not be reported as failed solely because
    // the secondary audit log is temporarily unavailable.
    console.error('[blog-webhook] unable to append audit record', error);
  }
}

export async function POST(request: Request) {
  const configuredSecret = process.env.WEBHOOK_ARTICLE_SIGN || process.env.BLOG_WEBHOOK_SIGN || '';
  const expectedClassId = (process.env.WEBHOOK_ARTICLE_CLASS_ID || process.env.BLOG_WEBHOOK_CLASS_ID || 'blog').trim().toLowerCase();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return reply(0, '请求格式错误：请使用 application/x-www-form-urlencoded 提交参数', 400);
  }

  const sign = value(formData, 'sign', 512);
  if (!secretMatches(sign, configuredSecret)) {
    return reply(0, '秘钥错误', 401);
  }

  const classId = value(formData, 'class_id', 120).toLowerCase();
  const title = value(formData, 'title', MAX_TITLE_LENGTH);
  const content = value(formData, 'content', MAX_CONTENT_LENGTH);
  const authorId = value(formData, 'author_id', MAX_AUTHOR_LENGTH) || 'admin';
  const imageUrl = value(formData, 'image_url', MAX_IMAGE_URL_LENGTH);
  if (classId !== expectedClassId) {
    return reply(0, `栏目错误：class_id 必须为 ${expectedClassId}`, 422);
  }
  const isCompleteArticle = title.length >= 8 && content.length >= 40 && Boolean(imageUrl);
  if (!isCompleteArticle) {
    // Plugin validation may have only credentials or short placeholders.
    // It proves connectivity and must never create a durable post.
    return reply(1, '验证成功');
  }
  if (!title || !content || !imageUrl) {
    return reply(0, '缺少必填参数：title、content 和 image_url 均不能为空', 422);
  }
  if (!/^https:\/\//i.test(imageUrl) || isOwnSiteImage(imageUrl)) {
    return reply(0, '封面图必须是可访问的外部 HTTPS 图片地址', 422);
  }

  let image;
  try {
    image = await retryOnce(() => resolveSourceImage({
      pageUrl: imageUrl,
      title,
      preferredImages: [imageUrl],
      allowExternalFallback: false
    }));
  } catch {
    return reply(0, '封面图不可访问、格式不受支持或不是有效图片', 422);
  }

  const fingerprint = articleFingerprint(title, content);
  const now = new Date().toISOString();
  const idempotencyTag = `webhook:${fingerprint}`;
  let duplicate = false;

  try {
    await retryOnce(() => writeAdminStore((store) => {
      duplicate = store.posts.some((post) => post.type === 'blog' && post.tags.includes(idempotencyTag));
      if (duplicate) return store;
      return {
        ...store,
        posts: [
          ...store.posts,
          {
            id: `post-webhook-${crypto.randomUUID()}`,
            type: 'blog',
            slug: slugify(title, fingerprint),
            title,
            excerpt: excerptFrom(content) || title,
            coverImage: image.url,
            coverImageSourceUrl: image.sourceUrl,
            coverImagePageUrl: image.pageUrl,
            coverImageAlt: image.alt,
            coverImageFetchedAt: image.fetchedAt,
            coverImageStatus: image.status,
            category: 'Buying Guide',
            content,
            publishDate: now.slice(0, 10),
            author: authorId,
            source: '',
            tags: ['Blog', idempotencyTag],
            seoTitle: `${title} | ZAIHAI SURFING`,
            seoDescription: excerptFrom(content) || title,
            status: 'published',
            createdAt: now,
            updatedAt: now
          }
        ]
      };
    }));
    await recordRun({
      executedAt: now,
      classId,
      authorId,
      title,
      fingerprint,
      duplicate,
      status: 'published'
    });
    revalidatePath('/[locale]/blog', 'page');
    revalidatePath('/[locale]/blog/[slug]', 'page');
  } catch (error) {
    await recordRun({
      executedAt: now,
      classId,
      authorId,
      title,
      fingerprint,
      duplicate,
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Persistent storage write failed.'
    });
    return reply(0, '数据录入失败，请重试', 500);
  }

  return reply(1, duplicate ? '文章已存在，无需重复发布' : '发布成功');
}
