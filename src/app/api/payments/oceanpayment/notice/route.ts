import {appendAnalyticsEvent, updateStoreOrderPayment} from '@/lib/commerceStore';
import {oceanpaymentStatusToOrder, parseGatewayPayload, verifyOceanpaymentReturn} from '@/lib/oceanpayment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const fields = await parseGatewayPayload(request);
    const orderId = fields.order_number || fields.orderNo || fields.order_id || '';
    const verified = verifyOceanpaymentReturn(fields);
    if (!orderId || !verified) {
      console.error('[oceanpayment-notice] invalid callback', {orderId, verified, keys: Object.keys(fields)});
      return new Response('verify-fail', {status: 400});
    }

    const paymentPatch = oceanpaymentStatusToOrder(fields);
    const order = await updateStoreOrderPayment(orderId, {
      paymentGateway: 'oceanpayment',
      ...paymentPatch
    });
    await appendAnalyticsEvent({
      id: `${Date.now()}-oceanpayment-notice`,
      type: 'payment_notice',
      visitorId: 'payment-gateway',
      sessionId: orderId,
      page: '/api/payments/oceanpayment/notice',
      pageTitle: 'Oceanpayment Notice',
      referrer: 'Oceanpayment',
      country: order?.customer.country || '',
      city: '',
      device: 'Gateway',
      browser: 'Gateway',
      os: 'Gateway',
      timestamp: new Date().toISOString(),
      payload: {orderId, verified, paymentStatus: fields.payment_status, paymentId: fields.payment_id}
    });

    return new Response('receive-ok', {status: 200});
  } catch (error) {
    console.error('Oceanpayment notice failed', error);
    return new Response('receive-fail', {status: 500});
  }
}
