import {appendAnalyticsEvent, appendPaymentNotification, findStoreOrder, updateStoreOrderPayment} from '@/lib/commerceStore';
import {createCustomerToken, ensureCustomerAccountForOrder} from '@/lib/customerAuth';
import {sendAccountActivationEmail, sendOrderSuccessEmailOnce} from '@/lib/emailService';
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

    const previousOrder = await findStoreOrder(orderId);
    await appendPaymentNotification({
      orderId,
      provider: 'oceanpayment',
      verified,
      paymentStatus: fields.payment_status || fields.status || '',
      paymentId: fields.payment_id || fields.transaction_id || '',
      raw: fields
    });
    const paymentPatch = oceanpaymentStatusToOrder(fields);
    const order = await updateStoreOrderPayment(orderId, {
      paymentGateway: 'oceanpayment',
      paymentId: fields.payment_id || fields.transaction_id || '',
      transactionId: fields.payment_id || fields.transaction_id || '',
      ...paymentPatch
    });
    if (order && paymentPatch.status === 'paid' && previousOrder?.status !== 'paid') {
      const user = await ensureCustomerAccountForOrder(order);
      const token = await createCustomerToken(user, user.status === 'active' ? 'password_reset' : 'password_setup');
      const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zaihaisurfing.com').replace(/\/$/, '');
      await Promise.all([
        sendOrderSuccessEmailOnce(order),
        sendAccountActivationEmail(order, `${baseUrl}/account/reset-password?token=${encodeURIComponent(token)}`)
      ]);
    }
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
