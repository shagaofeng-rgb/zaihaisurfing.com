import {productSlugs, type ProductSlug} from '@/lib/site';
import {createStoreOrder, appendAnalyticsEvent} from '@/lib/commerceStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(value: unknown, limit = 240) {
  return String(value || '').trim().slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const productSlug = payload.productSlug as ProductSlug;
    if (!productSlugs.includes(productSlug)) {
      return Response.json({message: 'Invalid product'}, {status: 400});
    }
    const customer = {
      name: clean(payload.customer?.name, 120),
      email: clean(payload.customer?.email, 160),
      phone: clean(payload.customer?.phone, 80),
      company: clean(payload.customer?.company, 160),
      country: clean(payload.customer?.country, 100),
      address: clean(payload.customer?.address, 260),
      message: clean(payload.customer?.message, 500)
    };
    if (!customer.name || !customer.email || !customer.phone || !customer.country || !customer.address) {
      return Response.json({message: 'Please complete required fields'}, {status: 400});
    }

    const order = await createStoreOrder({
      productSlug,
      quantity: Number(payload.quantity || 1),
      paymentMethod: payload.paymentMethod || 'qianhai_card',
      customer,
      checkout: {
        contact: clean(payload.checkout?.contact, 160),
        firstName: clean(payload.checkout?.firstName, 80),
        lastName: clean(payload.checkout?.lastName, 80),
        apartment: clean(payload.checkout?.apartment, 160),
        city: clean(payload.checkout?.city, 120),
        state: clean(payload.checkout?.state, 120),
        zip: clean(payload.checkout?.zip, 40),
        shippingMethod: clean(payload.checkout?.shippingMethod, 80),
        couponCode: clean(payload.checkout?.couponCode, 80),
        marketingOptIn: Boolean(payload.checkout?.marketingOptIn),
        billingSameAsShipping: payload.checkout?.billingSameAsShipping !== false,
        billingAddress: clean(payload.checkout?.billingAddress, 260),
        cardBrand: clean(payload.checkout?.cardBrand, 40),
        cardLast4: clean(payload.checkout?.cardLast4, 4),
        cardholderName: clean(payload.checkout?.cardholderName, 120)
      }
    });
    await appendAnalyticsEvent({
      id: `${Date.now()}-checkout-submit`,
      type: 'checkout_submit',
      visitorId: 'checkout',
      sessionId: order.id,
      page: '/checkout',
      pageTitle: 'Project Order',
      referrer: '',
      country: customer.country,
      city: '',
      device: 'Unknown',
      browser: 'Unknown',
      os: 'Unknown',
      timestamp: new Date().toISOString(),
      payload: {orderId: order.id, total: order.total, productSlug, paymentMethod: order.paymentMethod, cardBrand: order.checkout.cardBrand}
    });
    return Response.json({ok: true, order});
  } catch (error) {
    console.error('Create order failed', error);
    return Response.json({message: 'Order submission failed'}, {status: 500});
  }
}
