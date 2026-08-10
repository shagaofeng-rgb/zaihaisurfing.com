import {requireAdminApiSession} from '@/lib/adminAuth';
import {createFacebookOAuthState, facebookOAuthUrl} from '@/lib/facebookPagePublisher';

export async function GET() {
  const auth = await requireAdminApiSession();
  if (auth.response) return auth.response;
  try {
    const state = await createFacebookOAuthState();
    return Response.redirect(facebookOAuthUrl(state), 302);
  } catch (error) {
    return Response.json({message: error instanceof Error ? error.message : 'Unable to start Meta authorization'}, {status: 400});
  }
}
