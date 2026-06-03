export function GET(request: Request) {
  return Response.redirect(new URL('/assets/logo.jpg', request.url), 307);
}
