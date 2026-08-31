import type {Locale} from '@/i18n/routing';
import {findStoreOrder} from '@/lib/commerceStore';
import {hasOrderAccess} from '@/lib/orderAccess';

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{order?: string; payment?: string}>;
}) {
  const {locale} = await params;
  const {order: orderId, payment} = await searchParams;
  const foundOrder = orderId ? await findStoreOrder(orderId) : null;
  const order = foundOrder && await hasOrderAccess(foundOrder) ? foundOrder : null;
  const paymentId = order?.paymentId || order?.transactionId || '';
  const statusCopy = order
    ? order.status === 'paid'
      ? 'Payment confirmed'
      : order.gatewayStatus === 'processing' || payment === 'verified'
        ? 'Payment confirmation is processing'
        : order.gatewayStatus === 'failed' || order.status === 'failed'
          ? 'Payment failed'
          : 'Order received'
    : 'Order lookup unavailable';

  return (
    <main>
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">Order received</p>
          <h1>{statusCopy}</h1>
          {order ? (
            <div className="checkout-success-summary">
              <p>Order number: <strong>{order.id}</strong></p>
              <p>Payment status: <strong>{order.gatewayStatus}</strong></p>
              <p>Amount: <strong>{order.currency} {order.total.toLocaleString()}</strong></p>
              <p>Payment ID: <strong>{paymentId || 'Payment confirmation is processing'}</strong></p>
              <p>{order.logisticsStatus}</p>
            </div>
          ) : (
            <p>
              Order number: <strong>{orderId || 'Missing'}</strong>. We could not load this order record. Please contact
              ZAIHAI sales with the order number shown here.
            </p>
          )}
          <div className="checkout-success-actions">
            <a className="button primary" href={`/${locale}/products`}>Continue Shopping</a>
            <a className="button secondary" href="/account/orders">View Orders</a>
            <a className="button secondary" href={`/${locale}/contact`}>Contact Sales</a>
          </div>
        </div>
      </section>
    </main>
  );
}
