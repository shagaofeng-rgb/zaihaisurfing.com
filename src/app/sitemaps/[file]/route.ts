import {buildSitemapManifest, manifestFromSnapshot} from '@/lib/sitemapData';
import {readSitemapState} from '@/lib/sitemapState';
import {renderSitemap} from '@/lib/sitemapXml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, {params}: {params: Promise<{file: string}>}) {
  const {file} = await params;
  if (!/^(pages|products|posts|categories)-\d+\.xml$/.test(file)) {
    return new Response('Not found', {status: 404});
  }

  try {
    const manifest = await buildSitemapManifest();
    const part = manifest.parts.find((item) => item.file === file);
    if (!part) return new Response('Not found', {status: 404});
    return xmlResponse(renderSitemap(part.entries));
  } catch {
    const state = await readSitemapState();
    const part = manifestFromSnapshot(state.snapshot).parts.find((item) => item.file === file);
    if (!part) return new Response('Not found', {status: 404});
    return xmlResponse(renderSitemap(part.entries), 'stale');
  }
}

function xmlResponse(xml: string, state = 'live') {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
      'X-Sitemap-State': state
    }
  });
}
