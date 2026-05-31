import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import CheckoutForm from '@/components/CheckoutForm';
import PaymentBadges from '@/components/PaymentBadges';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import {productSlugs, products, type ProductSlug} from '@/lib/site';
import {shippingEstimateFor} from '@/lib/commerceStore';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return localizedMetadata(locale, '/checkout', 'Checkout | ZAIHAI SURFING', 'Secure checkout for ZAIHAI SURFING water sports equipment orders.');
}

export default async function CheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{product?: string; qty?: string; country?: string}>;
}) {
  const {locale} = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const productSlug = (query.product || 'x1-pro') as ProductSlug;
  if (!productSlugs.includes(productSlug)) notFound();
  const product = products[productSlug];
  const quantity = Math.max(1, Math.min(99, Number(query.qty || 1)));
  const shippingEstimate = shippingEstimateFor(query.country || '');

  return (
    <main>
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">Secure B2B Checkout</p>
          <h1>Confirm Your Order and Payment Method</h1>
          <p>
            Submit buyer, shipping and payment details. Credit card processing is reserved for the Qianhai gateway,
            while T/T and PayPal can be confirmed manually by the sales team.
          </p>
          <PaymentBadges />
        </div>
      </section>
      <section className="checkout-section">
        <CheckoutForm
          locale={locale}
          productSlug={productSlug}
          productName={product.name}
          unitPrice={product.priceAmount}
          quantity={quantity}
          shippingEstimate={shippingEstimate}
        />
      </section>
    </main>
  );
}
