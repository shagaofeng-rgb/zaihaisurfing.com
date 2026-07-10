import {buildSitemapManifest, manifestFromSnapshot} from '@/lib/sitemapData';
import {readSitemapState} from '@/lib/sitemapState';
import {renderSitemapIndex} from '@/lib/sitemapXml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manifest = await buildSitemapManifest();
    return xmlResponse(renderSitemapIndex(manifest.parts));
  } catch {
    const state = await readSitemapState();
    if (!state.snapshot.length) return new Response('Sitemap is temporarily unavailable.', {status: 503});
    return xmlResponse(renderSitemapIndex(manifestFromSnapshot(state.snapshot).parts), 'stale');
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
