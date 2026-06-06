import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import CheckoutForm from '@/components/CheckoutForm';
import type {Locale} from '@/i18n/routing';
import {localizedMetadata} from '@/lib/metadata';
import {checkoutProductSlugs, products, type CheckoutProductSlug} from '@/lib/site';
import {shippingEstimateFor} from '@/lib/shipping';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return localizedMetadata(locale, '/checkout', 'Project Order & Payment Preparation | ZAIHAI SURFING', 'Submit buyer, shipping and payment preparation details for ZAIHAI SURFING commercial water sports equipment projects.');
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
  const productSlug = (query.product || 'x1-pro') as CheckoutProductSlug;
  if (!checkoutProductSlugs.includes(productSlug)) notFound();
  const product = products[productSlug];
  const quantity = Math.max(1, Math.min(99, Number(query.qty || 1)));
  const shippingEstimate = shippingEstimateFor(productSlug, query.country || '');

  return (
    <main>
      <section className="checkout-hero">
        <div>
          <p className="eyebrow">B2B Project Order</p>
          <h1>Confirm Buyer Details and Payment Preparation</h1>
          <p>
            Submit buyer, delivery and payment preference details. Final quotation, logistics cost and payment collection
            are confirmed by the ZAIHAI sales team before charging.
          </p>
        </div>
      </section>
      <section className="checkout-section">
        <CheckoutForm
          locale={locale}
          productSlug={productSlug}
          productName={product.name}
          productImage={product.image}
          unitPrice={product.priceAmount}
          quantity={quantity}
          shippingEstimate={shippingEstimate}
        />
      </section>
    </main>
  );
}
