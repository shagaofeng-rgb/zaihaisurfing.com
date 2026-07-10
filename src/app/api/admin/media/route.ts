import path from 'node:path';
import {put} from '@vercel/blob';
import {requireAdminApiSession} from '@/lib/adminAuth';
import {listAdminMedia, writeAdminStore} from '@/lib/backendStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(formData: FormData, key: string, limit = 500) {
  return String(formData.get(key) || '').trim().slice(0, limit);
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

function mimeFromUrl(url: string) {
  const pathname = url.split('?')[0].toLowerCase();
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.avif')) return 'image/avif';
  if (pathname.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  return Response.json({media: await listAdminMedia()});
}

export async function POST(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const file = formData.get('file');
  let url = text(formData, 'url');
  let fileName = path.basename(url);
  let mimeType = mimeFromUrl(url);
  let sizeBytes = 0;

  if (file instanceof File && file.size > 0) {
    if (!allowedImageTypes.has(file.type)) {
      return Response.json({error: 'Only JPEG, PNG, WebP, AVIF and GIF images are allowed.'}, {status: 415});
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({error: 'Image files must be 10 MB or smaller.'}, {status: 413});
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json({error: 'Vercel Blob is not configured for media uploads.'}, {status: 503});
    }
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '-');
    const blob = await put(`zaihai-media/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    url = blob.url;
    fileName = file.name;
    mimeType = file.type;
    sizeBytes = file.size;
  }

  if (!url) {
    return Response.json({error: 'Upload an image or provide an existing image URL.'}, {status: 400});
  }
  if (!url.startsWith('/') && !/^https?:\/\//i.test(url)) {
    return Response.json({error: 'Image URL must be an absolute HTTP(S) URL or a root-relative site path.'}, {status: 400});
  }
  const alt = text(formData, 'alt', 180);
  if (!alt) {
    return Response.json({error: 'Image ALT text is required.'}, {status: 400});
  }
  await writeAdminStore((store) => ({
    ...store,
    media: [
      ...store.media,
      {
        id: `media-${Date.now()}`,
        fileName,
        url,
        alt,
        mimeType,
        sizeBytes,
        usage: text(formData, 'usage', 240).split(',').map((item) => item.trim()).filter(Boolean),
        createdAt: new Date().toISOString()
      }
    ]
  }));
  return Response.redirect(new URL('/admin/media', request.url), 303);
}
