'use client';

import {useState} from 'react';
import type {ProductSlug} from '@/lib/site';

type CheckoutFormProps = {
  locale: string;
  productSlug: ProductSlug;
  productName: string;
  unitPrice: number;
  quantity: number;
  shippingEstimate: number;
};

export default function CheckoutForm({locale, productSlug, productName, unitPrice, quantity, shippingEstimate}: CheckoutFormProps) {
  const [status, setStatus] = useState('');
  const total = unitPrice * quantity + shippingEstimate;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting order...');
    const formData = new FormData(event.currentTarget);
    const body = {
      productSlug,
      quantity,
      paymentMethod: formData.get('paymentMethod'),
      customer: {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        country: formData.get('country'),
        address: formData.get('address'),
        message: formData.get('message')
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
    setStatus(`Order created: ${result.order.id}. Payment gateway is ready for Qianhai integration.`);
    window.location.href = `/${locale}/checkout/success?order=${encodeURIComponent(result.order.id)}`;
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} aria-label="Checkout form">
      <div className="checkout-fields">
        <label>
          Name *
          <input name="name" required placeholder="Your full name" />
        </label>
        <label>
          Email *
          <input name="email" type="email" required placeholder="name@company.com" />
        </label>
        <label>
          Phone / WhatsApp *
          <input name="phone" required pattern="^[+0-9 ()-]{6,24}$" placeholder="+1 555 0100" />
        </label>
        <label>
          Company
          <input name="company" placeholder="Resort, distributor or rental company" />
        </label>
        <label>
          Country / Region *
          <input name="country" required placeholder="UAE, USA, Spain, Maldives..." />
        </label>
        <label>
          Shipping Address *
          <input name="address" required placeholder="Port, city, or delivery address" />
        </label>
        <label className="full">
          Order Notes
          <textarea name="message" placeholder="Tell us your project, delivery plan, or customization needs." />
        </label>
      </div>

      <aside className="checkout-summary-card">
        <p className="eyebrow">Order Summary</p>
        <h2>{productName}</h2>
        <dl>
          <div>
            <dt>Quantity</dt>
            <dd>{quantity}</dd>
          </div>
          <div>
            <dt>Product subtotal</dt>
            <dd>USD {(unitPrice * quantity).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Estimated logistics</dt>
            <dd>USD {shippingEstimate.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Total estimate</dt>
            <dd>USD {total.toLocaleString()}</dd>
          </div>
        </dl>
        <fieldset>
          <legend>Payment method</legend>
          <label>
            <input name="paymentMethod" type="radio" value="qianhai_card" defaultChecked />
            Credit card via Qianhai gateway
          </label>
          <label>
            <input name="paymentMethod" type="radio" value="bank_transfer" />
            Bank transfer / T/T
          </label>
          <label>
            <input name="paymentMethod" type="radio" value="paypal" />
            PayPal manual confirmation
          </label>
        </fieldset>
        <button className="button primary" type="submit">
          Place Order
        </button>
        <p className="form-note">{status || 'Card payment endpoint is prepared. Real charging starts after Qianhai credentials are configured.'}</p>
      </aside>
    </form>
  );
}
