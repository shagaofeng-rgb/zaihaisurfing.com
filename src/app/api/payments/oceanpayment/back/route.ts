import {appendAnalyticsEvent, updateStoreOrderPayment} from '@/lib/commerceStore';
import {oceanpaymentStatusToOrder, parseGatewayPayload, verifyOceanpaymentReturn} from '@/lib/oceanpayment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleBack(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale') || 'en';
  const fields = request.method === 'GET' ? Object.fromEntries(url.searchParams.entries()) : await parseGatewayPayload(request);
  const orderId = fields.order_number || fields.orderNo || fields.order_id || '';
  const verified = verifyOceanpaymentReturn(fields);
  if (orderId && verified) {
    const paymentPatch = oceanpaymentStatusToOrder(fields);
    await updateStoreOrderPayment(orderId, {
      paymentGateway: 'oceanpayment',
      ...paymentPatch
    });
    await appendAnalyticsEvent({
      id: `${Date.now()}-oceanpayment-back`,
      type: 'payment_return',
      visitorId: 'payment-gateway',
      sessionId: orderId,
      page: '/api/payments/oceanpayment/back',
      pageTitle: 'Oceanpayment Return',
      referrer: 'Oceanpayment',
      country: '',
      city: '',
      device: 'Gateway',
      browser: 'Gateway',
      os: 'Gateway',
      timestamp: new Date().toISOString(),
      payload: {orderId, verified, paymentStatus: fields.payment_status, paymentId: fields.payment_id}
    });
  }

  const destination = orderId
    ? `/${locale}/checkout/success?order=${encodeURIComponent(orderId)}&payment=${verified ? 'verified' : 'unverified'}`
    : `/${locale}/checkout?payment=unmatched`;
  return Response.redirect(new URL(destination, request.url), 303);
}

export async function GET(request: Request) {
  return handleBack(request);
}

export async function POST(request: Request) {
  return handleBack(request);
}
