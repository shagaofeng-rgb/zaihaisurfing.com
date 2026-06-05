'use client';

import {useMemo, useState} from 'react';
import Script from 'next/script';
import type {CheckoutProductSlug} from '@/lib/site';

type CheckoutFormProps = {
  locale: string;
  productSlug: CheckoutProductSlug;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  shippingEstimate: number;
};

type OceanpaymentTab = 'oceanpayment_card' | 'oceanpayment_google_pay' | 'oceanpayment_apple_pay';
type CheckoutPaymentMethod = OceanpaymentTab | 'bank_transfer';
type OceanpaymentScene = '3d' | 'non-3d';

const cardBadges = ['VISA', 'MC', 'DISCOVER', 'JCB', '+6'];
const multiplePaymentBadges = ['Google Pay', 'Apple Pay', 'Local Pay', 'Bank', '+41'];

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
        company: '',
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

        <section className="checkout-block payment-block">
          <h2>Payment</h2>
          <p className="checkout-help">All transactions are secure and encrypted.</p>
          <input name="paymentMethod" type="hidden" value={paymentMethod} />
          <input name="paymentScene" type="hidden" value={paymentScene} />
          <div className="shopline-payment-box" aria-label="Oceanpayment secure payment">
            <button
              type="button"
              className={`shopline-payment-row shopline-payment-card ${paymentMethod === 'oceanpayment_card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('oceanpayment_card')}
              aria-pressed={paymentMethod === 'oceanpayment_card'}
            >
              <span className="payment-row-left">
                <span className="payment-radio-dot" aria-hidden="true" />
                <strong>Credit Card</strong>
              </span>
              <span className="card-brand-row" aria-label="Supported card brands">
                {cardBadges.map((badge) => <b key={badge}>{badge}</b>)}
              </span>
            </button>
            {paymentMethod === 'oceanpayment_card' ? (
              <div className="shopline-card-fields">
                <label className="card-input full">
                  <span>Card number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="Card number"
                    required
                    aria-label="Card number"
                  />
                </label>
                <div className="checkout-two">
                  <label className="card-input">
                    <span>Expiration date (MM / YY)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      required
                      aria-label="Expiration date"
                    />
                  </label>
                  <label className="card-input">
                    <span>Security code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="CVV/CVC"
                      required
                      aria-label="Security code"
                    />
                  </label>
                </div>
                <p className="payment-safe-note">Card information is handled by Oceanpayment secure checkout. ZAIHAI does not store full card numbers or CVV.</p>
              </div>
            ) : null}
            <button
              type="button"
              className={`shopline-payment-row ${paymentMethod === 'oceanpayment_google_pay' || paymentMethod === 'oceanpayment_apple_pay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('oceanpayment_google_pay')}
              aria-pressed={paymentMethod === 'oceanpayment_google_pay' || paymentMethod === 'oceanpayment_apple_pay'}
            >
              <span className="payment-row-left">
                <span className="payment-radio-dot" aria-hidden="true" />
                <strong>Multiple payments</strong>
              </span>
              <span className="payment-icon-strip" aria-label="Wallet and alternative payment methods">
                {multiplePaymentBadges.map((badge) => <b key={badge}>{badge}</b>)}
              </span>
            </button>
          </div>
          {paymentMethod === 'oceanpayment_google_pay' || paymentMethod === 'oceanpayment_apple_pay' ? (
            <div className="oceanpayment-panel wallet-panel">
              <strong>Oceanpayment wallet checkout</strong>
              <p>Click Pay now to open the Oceanpayment wallet or local payment page. Available methods depend on buyer country and device support.</p>
              <div className="wallet-choice-row">
                <button type="button" className={paymentMethod === 'oceanpayment_google_pay' ? 'active' : ''} onClick={() => setPaymentMethod('oceanpayment_google_pay')}>Google Pay</button>
                <button type="button" className={paymentMethod === 'oceanpayment_apple_pay' ? 'active' : ''} onClick={() => setPaymentMethod('oceanpayment_apple_pay')}>Apple Pay</button>
              </div>
            </div>
          ) : null}
          {String(paymentMethod).startsWith('oceanpayment') ? (
            <div className="oceanpayment-scenes" aria-label="3D payment scene">
              <button type="button" className={paymentScene === '3d' ? 'active' : ''} onClick={() => setPaymentScene('3d')}>3D Secure</button>
              <button type="button" className={paymentScene === 'non-3d' ? 'active' : ''} onClick={() => setPaymentScene('non-3d')}>Non-3D</button>
            </div>
          ) : null}
          <label className="checkout-method">
            <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
            <span>
              <strong>Bank transfer / T/T</strong>
              <small>Receive proforma invoice and bank details from ZAIHAI sales.</small>
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
          {billingMode === 'different' ? <textarea name="billingAddress" placeholder="Billing name, address, tax ID or VAT details" /> : null}
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
          Pay now
        </button>
        <p className="form-note">{status || 'After submission, ZAIHAI sales will confirm final quotation, logistics and payment method before any charge.'}</p>
      </aside>
    </form>
  );
}
