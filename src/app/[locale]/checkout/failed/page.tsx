import type {Locale} from '@/i18n/routing';
import {findStoreOrder} from '@/lib/commerceStore';

export default async function CheckoutFailedPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{order?: string; payment?: string}>;
}) {
  const {locale} = await params;
  const {order: orderId, payment} = await searchParams;
  const order = orderId ? await findStoreOrder(orderId) : null;
  const paymentId = order?.paymentId || order?.transactionId || '';
  const reason = payment === 'unverified'
    ? 'Payment return could not be verified.'
    : payment === 'unmatched'
      ? 'Payment return did not include a matching order number.'
      : 'Payment was declined, failed, or cancelled.';

  return (
    <main>
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">Payment result</p>
          <h1>Payment failed</h1>
          {order ? (
            <div className="checkout-success-summary">
              <p>Order number: <strong>{order.id}</strong></p>
              <p>Payment status: <strong>{order.gatewayStatus}</strong></p>
              <p>Amount: <strong>{order.currency} {order.total.toLocaleString()}</strong></p>
              <p>Payment ID: <strong>{paymentId || 'Not confirmed'}</strong></p>
              <p>{order.logisticsStatus || reason}</p>
            </div>
          ) : (
            <p>
              {reason} Please contact ZAIHAI sales if you need help confirming this payment attempt.
            </p>
          )}
          <div className="checkout-success-actions">
            <a className="button primary" href={`/${locale}/checkout${order ? `?product=${encodeURIComponent(order.productSlug)}&qty=${order.quantity}` : ''}`}>Try Again</a>
            <a className="button secondary" href="/account/orders">View Orders</a>
            <a className="button secondary" href={`/${locale}/contact`}>Contact Sales</a>
          </div>
        </div>
      </section>
    </main>
  );
}
