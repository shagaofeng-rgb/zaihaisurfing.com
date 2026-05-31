import type {Locale} from '@/i18n/routing';

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{order?: string}>;
}) {
  const {locale} = await params;
  const {order} = await searchParams;

  return (
    <main>
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">Order received</p>
          <h1>Thank You. Your Order Has Been Submitted.</h1>
          <p>
            Order ID: <strong>{order || 'Pending'}</strong>. Our team will confirm product availability, shipping plan and
            payment status. If Qianhai card payment credentials are configured, this page can redirect to the gateway.
          </p>
          <a className="button primary" href={`/${locale}/contact`}>
            Contact Sales
          </a>
        </div>
      </section>
    </main>
  );
}
