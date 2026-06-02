'use client';

import {useMemo, useState} from 'react';
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

function detectCardBrand(value: FormDataEntryValue | null) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^35/.test(digits)) return 'JCB';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return digits ? 'Card' : '';
}

function cardLast4(value: FormDataEntryValue | null) {
  return String(value || '').replace(/\D/g, '').slice(-4);
}

export default function CheckoutForm({locale, productSlug, productName, productImage, unitPrice, quantity, shippingEstimate}: CheckoutFormProps) {
  const [status, setStatus] = useState('');
  const [coupon, setCoupon] = useState('');
  const [billingMode, setBillingMode] = useState('same');
  const total = unitPrice * quantity + shippingEstimate;
  const discount = useMemo(() => (coupon.trim().toUpperCase() === 'ZAIHAI' ? Math.round(total * 0.03) : 0), [coupon, total]);
  const finalTotal = total - discount;

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
    const paymentMethod = String(formData.get('paymentMethod') || 'qianhai_card');
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
        cardBrand: paymentMethod === 'qianhai_card' ? detectCardBrand(formData.get('cardNumber')) : '',
        cardLast4: paymentMethod === 'qianhai_card' ? cardLast4(formData.get('cardNumber')) : '',
        cardholderName: paymentMethod === 'qianhai_card' ? formData.get('cardholderName') : ''
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
    setStatus(`Project order received: ${result.order.id}. ZAIHAI sales will confirm quotation, logistics and payment next.`);
    window.location.href = `/${locale}/checkout/success?order=${encodeURIComponent(result.order.id)}`;
  }

  return (
    <form className="shopline-checkout" onSubmit={handleSubmit} aria-label="Project order form">
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
          <h2>Payment preference</h2>
          <p className="checkout-help">Card fields are reserved for future Qianhai gateway tokenization. Full card numbers and CVV should be handled by the payment gateway, not stored by this site.</p>
          <label className="checkout-method">
            <input name="paymentMethod" type="radio" value="qianhai_card" defaultChecked />
            <span>
              <strong>Credit card via Qianhai gateway</strong>
              <small>Visa, Mastercard, American Express, JCB, Discover and Diners Club ready.</small>
            </span>
          </label>
          <div className="card-fields">
            <input name="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="Card number" />
            <div className="checkout-two">
              <input name="cardExpiry" inputMode="numeric" autoComplete="cc-exp" placeholder="Expiration date (MM / YY)" />
              <input name="cardSecurityCode" inputMode="numeric" autoComplete="cc-csc" placeholder="Security code" />
            </div>
            <input name="cardholderName" autoComplete="cc-name" placeholder="Name on card" />
          </div>
          <label className="checkout-method">
            <input name="paymentMethod" type="radio" value="bank_transfer" />
            <span>
              <strong>Bank transfer / T/T</strong>
              <small>Receive proforma invoice and bank details from ZAIHAI sales.</small>
            </span>
          </label>
          <label className="checkout-method">
            <input name="paymentMethod" type="radio" value="paypal" />
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
          Submit Project Order
        </button>
        <p className="form-note">{status || 'After submission, ZAIHAI sales will confirm final quotation, logistics and payment method before any charge.'}</p>
      </aside>
    </form>
  );
}
