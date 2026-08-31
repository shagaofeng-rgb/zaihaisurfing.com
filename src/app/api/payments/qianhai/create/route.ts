export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return Response.json(
    {ok: false, status: 'retired', message: 'This unused payment integration is not available.'},
    {status: 410}
  );
}
