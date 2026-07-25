export function GET(request: Request) {
  return Response.redirect(new URL('/assets/brand-mark.png', request.url), 307);
}
