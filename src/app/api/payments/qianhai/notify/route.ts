export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-qianhai-signature') || request.headers.get('signature') || '';

  console.log('[qianhai-notify] received payment callback placeholder', {
    hasSignature: Boolean(signature),
    length: rawBody.length
  });

  return Response.json({
    ok: true,
    status: 'callback_received_placeholder',
    message: 'Verify Qianhai signature and update order status here after gateway documentation is available.'
  });
}
