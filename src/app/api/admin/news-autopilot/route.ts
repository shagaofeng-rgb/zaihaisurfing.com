import {requireAdminApiSession} from '@/lib/adminAuth';
import {publishNewsAutopilotDraft, runNewsAutopilot, seedNewsAutopilotDrafts, setNewsAutopilotEnabled} from '@/lib/newsAutopilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const {response} = await requireAdminApiSession();
  if (response) return response;
  const form = await request.formData(); const action = String(form.get('action') || '');
  try {
    if (action === 'seed') await seedNewsAutopilotDrafts();
    else if (action === 'dry-run') await runNewsAutopilot('manual', true);
    else if (action === 'toggle') await setNewsAutopilotEnabled(String(form.get('enabled')) === 'true');
    else if (action === 'publish') await publishNewsAutopilotDraft(String(form.get('draftId') || ''));
    else return Response.json({success: false, error: 'Unknown action'}, {status: 400});
  } catch (error) {
    return Response.json({success: false, error: error instanceof Error ? error.message : 'Action failed'}, {status: 400});
  }
  return Response.redirect(new URL('/admin/news-autopilot', request.url), 303);
}
