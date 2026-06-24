export function GET(request: Request) {
  return Response.redirect(new URL('/assets/logo-small.jpg', request.url), 307);
}
