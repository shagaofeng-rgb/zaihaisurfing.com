import {NextResponse} from 'next/server';

export function GET() {
  return NextResponse.json(
    {error: 'Not found'},
    {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
}
