import {NextResponse} from 'next/server';

export function GET() {
  return new NextResponse('', {
    status: 404,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
