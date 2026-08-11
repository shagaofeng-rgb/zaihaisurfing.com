import {requireAdminApiSession} from '@/lib/adminAuth';
import {runNewsIngest, runNewsPublish, setNewsAutopilotEnabled} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const form = await request.formData(); const action = String(form.get('action') || '');
  try {
    const siteId = defaultNewsSite()?.site_id;
    if (!siteId) throw new Error('No News site configuration is available.');
    if (action === 'ingest') await runNewsIngest(siteId, 'manual');
    else if (action === 'publish') await runNewsPublish(siteId, 'manual');
    else if (action === 'dry-run') await runNewsPublish(siteId, 'manual', true);
    else if (action === 'toggle') await setNewsAutopilotEnabled(String(form.get('enabled')) === 'true');
    else return Response.json({success: false, error: 'Unknown action'}, {status: 400});
  } catch (error) {
    return Response.json({success: false, error: error instanceof Error ? error.message : 'Action failed'}, {status: 400});
  }
  return Response.redirect(new URL('/admin/news-autopilot', request.url), 303);
}
