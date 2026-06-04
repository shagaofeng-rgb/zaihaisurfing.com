'use client';

import {useMemo, useState} from 'react';
import Script from 'next/script';
import type {ProductSlug} from '@/lib/site';

type CheckoutFormProps = {
  locale: string;
  productSlug: ProductSlug;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  shippingEstimate: number;
};

type OceanpaymentTab = 'oceanpayment_card' | 'oceanpayment_google_pay' | 'oceanpayment_apple_pay';
type CheckoutPaymentMethod = OceanpaymentTab | 'bank_transfer' | 'paypal';
type OceanpaymentScene = '3d' | 'non-3d';

const oceanpaymentTabs: {id: OceanpaymentTab; label: string; note: string}[] = [
  {id: 'oceanpayment_card', label: 'Credit Card', note: 'Visa, Mastercard, American Express, JCB, Discover and Diners Club'},
  {id: 'oceanpayment_google_pay', label: 'Google Pay', note: 'Fast checkout on supported Chrome and Android devices'},
  {id: 'oceanpayment_apple_pay', label: 'Apple Pay', note: 'Safari and Apple Pay enabled devices'}
];

export default function CheckoutForm({locale, productSlug, productName, productImage, unitPrice, quantity, shippingEstimate}: CheckoutFormProps) {
  const [status, setStatus] = useState('');
  const [coupon, setCoupon] = useState('');
  const [billingMode, setBillingMode] = useState('same');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('oceanpayment_card');
  const [paymentScene, setPaymentScene] = useState<OceanpaymentScene>('3d');
  const total = unitPrice * quantity + shippingEstimate;
  const discount = useMemo(() => (coupon.trim().toUpperCase() === 'ZAIHAI' ? Math.round(total * 0.03) : 0), [coupon, total]);
  const finalTotal = total - discount;

  function submitOceanpaymentFallback(gatewayUrl: string, fields: Record<string, string>) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    form.style.display = 'none';
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  function submitOceanpayment(method: OceanpaymentTab, oceanpayment: {gatewayUrl: string; fields: Record<string, string>}) {
    const gatewayWindow = window as unknown as {
      Oceanpayment?: {checkout?: (fields: Record<string, string>) => void; submit?: (fields: Record<string, string>) => void};
      onePageGooglePay?: {checkout?: (fields: Record<string, string>) => void};
      onePageApplePay?: {checkout?: (fields: Record<string, string>) => void};
    };
    if (method === 'oceanpayment_google_pay' && gatewayWindow.onePageGooglePay?.checkout) {
      gatewayWindow.onePageGooglePay.checkout(oceanpayment.fields);
      return;
    }
    if (method === 'oceanpayment_apple_pay' && gatewayWindow.onePageApplePay?.checkout) {
      gatewayWindow.onePageApplePay.checkout(oceanpayment.fields);
      return;
    }
    if (gatewayWindow.Oceanpayment?.checkout) {
      gatewayWindow.Oceanpayment.checkout(oceanpayment.fields);
      return;
    }
    if (gatewayWindow.Oceanpayment?.submit) {
      gatewayWindow.Oceanpayment.submit(oceanpayment.fields);
      return;
    }
    submitOceanpaymentFallback(oceanpayment.gatewayUrl, oceanpayment.fields);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting project order details...');
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const country = String(formData.get('country') || '').trim();
    const address = String(formData.get('address') || '').trim();
    const apartment = String(formData.get('apartment') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim();
    const zip = String(formData.get('zip') || '').trim();
    const fullAddress = [address, apartment, city, state, zip].filter(Boolean).join(', ');
    const body = {
      productSlug,
      quantity,
      paymentMethod,
      customer: {
        name: `${firstName} ${lastName}`.trim(),
        email: formData.get('contact'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        country,
        address: fullAddress,
        message: formData.get('message')
      },
      checkout: {
        contact: formData.get('contact'),
        firstName,
        lastName,
        apartment,
        city,
        state,
        zip,
        shippingMethod: formData.get('shippingMethod'),
        couponCode: formData.get('couponCode'),
        marketingOptIn: formData.get('marketingOptIn') === 'on',
        billingSameAsShipping: billingMode === 'same',
        billingAddress: billingMode === 'same' ? fullAddress : formData.get('billingAddress'),
        cardBrand: '',
        cardLast4: '',
        cardholderName: ''
      }
    };

    const response = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.message || 'Order submission failed. Please check required fields.');
      return;
    }
    if (String(paymentMethod).startsWith('oceanpayment')) {
      setStatus(`Order ${result.order.id} created. Preparing Oceanpayment ${paymentScene.toUpperCase()} request...`);
      const paymentResponse = await fetch('/api/payments/oceanpayment/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({orderId: result.order.id, paymentMethod, scene: paymentScene, locale})
      });
      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok) {
        setStatus(paymentResult.message || 'Oceanpayment request failed. Please contact ZAIHAI sales.');
        return;
      }
      if (paymentResult.status === 'waiting_for_credentials') {
        setStatus(`Order ${result.order.id} saved. Oceanpayment credentials are not configured yet: ${paymentResult.oceanpayment.requiredEnv.join(', ')}.`);
        return;
      }
      setStatus('Opening Oceanpayment secure payment window...');
      submitOceanpayment(paymentMethod as OceanpaymentTab, paymentResult.oceanpayment);
      return;
    }
    setStatus(`Project order received: ${result.order.id}. ZAIHAI sales will confirm quotation, logistics and payment next.`);
    window.location.href = `/${locale}/checkout/success?order=${encodeURIComponent(result.order.id)}`;
  }

  return (
    <form className="shopline-checkout" onSubmit={handleSubmit} aria-label="Project order form">
      <Script src="https://secure.oceanpayment.com/gateway/js/card_ec.js" strategy="afterInteractive" />
      <Script src="https://secure.oceanpayment.com/gateway/js/googlepay_ec.js" strategy="afterInteractive" />
      <Script src="https://secure.oceanpayment.com/gateway/js/applepay_ec.js" strategy="afterInteractive" />
      <div className="checkout-left">
        <section className="checkout-block">
          <div className="checkout-block-title">
            <h2>Contact</h2>
            <a href={`/${locale}/contact`}>Need help?</a>
          </div>
          <input name="contact" type="email" required placeholder="Email or mobile phone number" />
          <label className="checkout-checkbox">
            <input name="marketingOptIn" type="checkbox" defaultChecked />
            Receive product updates and quotation follow-up
          </label>
        </section>

        <section className="checkout-block">
          <h2>Delivery</h2>
          <label className="field-shell full">
            <span>Country / region</span>
            <select name="country" required defaultValue="">
              <option value="" disabled>Choose destination country</option>
              <option>United States</option>
              <option>United Arab Emirates</option>
              <option>Saudi Arabia</option>
              <option>Australia</option>
              <option>Spain</option>
              <option>France</option>
              <option>Maldives</option>
              <option>Thailand</option>
              <option>Other</option>
            </select>
          </label>
          <div className="checkout-two">
            <input name="firstName" required placeholder="First name" />
            <input name="lastName" required placeholder="Last name" />
          </div>
          <input name="company" placeholder="Company, resort, distributor or rental operator" />
          <input name="address" required placeholder="Address" />
          <input name="apartment" placeholder="Apartment, suite, warehouse, port, etc." />
          <div className="checkout-three">
            <input name="city" required placeholder="City" />
            <input name="state" placeholder="State / province" />
            <input name="zip" required placeholder="ZIP / postal code" />
          </div>
          <input name="phone" required pattern="^[+0-9 ()-]{6,24}$" placeholder="Phone / WhatsApp" />
        </section>

        <section className="checkout-block">
          <h2>Shipping method</h2>
          <label className="checkout-method">
            <input name="shippingMethod" type="radio" value="standard_ocean_air_quote" defaultChecked />
            <span>
              <strong>Standard sea / air freight quotation</strong>
              <small>Sales team confirms final logistics cost by destination, quantity and packaging.</small>
            </span>
            <b>USD {shippingEstimate.toLocaleString()}</b>
          </label>
          <label className="checkout-method">
            <input name="shippingMethod" type="radio" value="factory_pickup_forwarder" />
            <span>
              <strong>Buyer forwarder pickup</strong>
              <small>Use your own forwarder for factory pickup or export handoff.</small>
            </span>
            <b>Quote</b>
          </label>
        </section>

        <section className="checkout-block">
          <h2>Oceanpayment secure payment</h2>
          <p className="checkout-help">Card and wallet details are handled by Oceanpayment secure embedded checkout. ZAIHAI does not store full card numbers or CVV.</p>
          <input name="paymentMethod" type="hidden" value={paymentMethod} />
          <input name="paymentScene" type="hidden" value={paymentScene} />
          <div className="oceanpayment-tabs" role="tablist" aria-label="Oceanpayment methods">
            {oceanpaymentTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={paymentMethod === tab.id ? 'active' : ''}
                onClick={() => setPaymentMethod(tab.id)}
                role="tab"
                aria-selected={paymentMethod === tab.id}
              >
                <strong>{tab.label}</strong>
                <small>{tab.note}</small>
              </button>
            ))}
          </div>
          <div className="oceanpayment-scenes" aria-label="3D payment scene">
            <button type="button" className={paymentScene === '3d' ? 'active' : ''} onClick={() => setPaymentScene('3d')}>3D Secure</button>
            <button type="button" className={paymentScene === 'non-3d' ? 'active' : ''} onClick={() => setPaymentScene('non-3d')}>Non-3D</button>
          </div>
          <div className="oceanpayment-panel">
            {paymentMethod === 'oceanpayment_card' ? (
              <div>
                <strong>Embedded credit card checkout</strong>
                <p>After you place the order, Oceanpayment opens the secure card form or 3D verification page.</p>
              </div>
            ) : null}
            {paymentMethod === 'oceanpayment_google_pay' ? (
              <div>
                <strong>Google Pay checkout</strong>
                <p>Use a supported Chrome or Android wallet after the Oceanpayment request is generated.</p>
                <div id="oceanpayment-google-pay-button" className="wallet-placeholder">Google Pay button area</div>
              </div>
            ) : null}
            {paymentMethod === 'oceanpayment_apple_pay' ? (
              <div>
                <strong>Apple Pay checkout</strong>
                <p>Use Safari with an Apple Pay enabled device after the Oceanpayment request is generated.</p>
                <div id="oceanpayment-apple-pay-button" className="wallet-placeholder">Apple Pay button area</div>
              </div>
            ) : null}
          </div>
          <label className="checkout-method">
            <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
            <span>
              <strong>Bank transfer / T/T</strong>
              <small>Receive proforma invoice and bank details from ZAIHAI sales.</small>
            </span>
          </label>
          <label className="checkout-method">
            <input type="radio" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
            <span>
              <strong>PayPal manual confirmation</strong>
              <small>Used for sample orders or sales-confirmed payments.</small>
            </span>
          </label>
        </section>

        <section className="checkout-block">
          <h2>Billing address</h2>
          <label className="checkout-method">
            <input name="billingMode" type="radio" value="same" checked={billingMode === 'same'} onChange={() => setBillingMode('same')} />
            <span><strong>Same as shipping address</strong></span>
          </label>
          <label className="checkout-method">
            <input name="billingMode" type="radio" value="different" checked={billingMode === 'different'} onChange={() => setBillingMode('different')} />
            <span><strong>Use a different billing address</strong></span>
          </label>
          {billingMode === 'different' ? <textarea name="billingAddress" placeholder="Billing company, address, tax ID or VAT details" /> : null}
          <textarea name="message" placeholder="Order notes, delivery plan, packaging request, color, accessories or customization needs." />
        </section>
      </div>

      <aside className="shopline-summary">
        <div className="summary-product">
          <div className="summary-image-wrap">
            <img src={productImage} alt={`${productName} checkout thumbnail`} />
            <span>{quantity}</span>
          </div>
          <div>
            <h3>{productName}</h3>
            <p>Commercial water sports equipment project</p>
          </div>
          <strong>USD {(unitPrice * quantity).toLocaleString()}</strong>
        </div>
        <div className="coupon-row">
          <input name="couponCode" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" />
          <button type="button">Apply</button>
        </div>
        <dl className="summary-totals">
          <div><dt>Subtotal</dt><dd>USD {(unitPrice * quantity).toLocaleString()}</dd></div>
          <div><dt>Shipping</dt><dd>USD {shippingEstimate.toLocaleString()}</dd></div>
          {discount ? <div><dt>Discount</dt><dd>- USD {discount.toLocaleString()}</dd></div> : null}
          <div className="summary-total"><dt>Estimated total</dt><dd><small>USD</small> {finalTotal.toLocaleString()}</dd></div>
        </dl>
        <button className="button primary checkout-pay-button" type="submit">
          Place Order / Pay Now
        </button>
        <p className="form-note">{status || 'After submission, ZAIHAI sales will confirm final quotation, logistics and payment method before any charge.'}</p>
      </aside>
    </form>
  );
}
