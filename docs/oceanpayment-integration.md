# Oceanpayment Embedded Payment Integration

This project includes a ready-to-configure Oceanpayment embedded payment layer for credit card, Google Pay and Apple Pay.

## Required Environment Variables

Configure these variables in Vercel Project Settings and local `.env.local`:

```bash
OCEANPAYMENT_ACCOUNT=your_account
OCEANPAYMENT_TERMINAL=your_terminal
OCEANPAYMENT_SECURE_CODE=your_secure_code
OCEANPAYMENT_PUBLIC_KEY=your_public_key
OCEANPAYMENT_GATEWAY_URL=https://secure.oceanpayment.com/gateway/service/test
OCEANPAYMENT_ENV=test
NEXT_PUBLIC_SITE_URL=https://zaihaisurfing.com
```

Optional local testing variables:

```bash
OCEANPAYMENT_ALLOW_NOTICE_SIMULATION=true
OCEANPAYMENT_SIMULATION_TOKEN=choose-a-private-token
```

## Frontend Entry

Open a checkout URL:

```text
/en/checkout?product=x1-pro&qty=1
```

The checkout page shows:

- Credit Card / Google Pay / Apple Pay tabs
- 3D Secure / Non-3D scene switch
- Oceanpayment secure checkout request button

Card data must be collected by Oceanpayment hosted or embedded secure UI. The website does not store full card numbers or CVV.

## Backend Endpoints

- `POST /api/payments/oceanpayment/create`
  Creates a signed Oceanpayment request for an existing store order.

- `POST /api/payments/oceanpayment/notice`
  Receives asynchronous Oceanpayment notifications, verifies `signValue`, updates order status and returns `receive-ok`.

- `GET|POST /api/payments/oceanpayment/back`
  Receives browser return data, verifies `signValue`, updates order status and redirects the buyer to the checkout success page.

- `POST /api/payments/oceanpayment/simulate-notice`
  Optional local testing endpoint. Disabled unless `OCEANPAYMENT_ALLOW_NOTICE_SIMULATION=true`.

## Local Test Flow

1. Start the site:

```bash
npm run dev
```

2. Open:

```text
http://localhost:3000/en/checkout?product=x1-pro&qty=1
```

3. Fill buyer and shipping fields.
4. Select Credit Card, Google Pay or Apple Pay.
5. Select 3D Secure or Non-3D.
6. Submit the order.

If credentials are missing, the order is saved and the page displays the missing environment variables. If credentials are configured, the page generates a signed Oceanpayment request.

## Simulate a Notice

After an order is created, run:

```bash
curl -X POST http://localhost:3000/api/payments/oceanpayment/simulate-notice \
  -H "Content-Type: application/json" \
  -H "x-simulation-token: choose-a-private-token" \
  -d "{\"orderId\":\"ZH-ORDER-ID\",\"status\":\"paid\"}"
```

Then open `/admin/orders` to confirm the order payment status changed to paid.

## Official Oceanpayment Notes

Oceanpayment requires SHA256 `signValue` generation on the server side. For embedded checkout, the request signature uses:

```text
account + terminal + order_number + order_currency + order_amount + billing_firstName + billing_lastName + billing_email + secureCode
```

Return and notification verification uses:

```text
account + terminal + order_number + order_currency + order_amount + order_notes + card_number + payment_id + payment_authType + payment_status + payment_details + payment_risk + secureCode
```

The asynchronous notification endpoint must return:

```text
receive-ok
```
