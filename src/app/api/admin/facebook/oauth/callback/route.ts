import {consumeFacebookOAuthState, connectFacebookPage} from '@/lib/facebookPagePublisher';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const redirectUrl = new URL('/admin/facebook', request.url);
  if (error || !code || !state) {
    redirectUrl.searchParams.set('facebook', error || 'Meta did not return an authorization code');
    return Response.redirect(redirectUrl, 302);
  }
  try {
    await consumeFacebookOAuthState(state);
    const connected = await connectFacebookPage(code);
    redirectUrl.searchParams.set('facebook', `Connected to ${connected.pageName}`);
  } catch (reason) {
    redirectUrl.searchParams.set('facebook', reason instanceof Error ? reason.message : 'Meta authorization failed');
  }
  return Response.redirect(redirectUrl, 302);
}
