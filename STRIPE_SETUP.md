# Stripe activation

Current checkout policy:

- Made-to-order (`lab-grown`) products use hosted Stripe Checkout when Stripe is configured.
- One-of-one (`signature`) products and mixed bags use the reservation flow.
- Jewel Stone collects no card numbers. Stripe hosts the payment form.
- Successful payment pages are verified server-side before showing confirmation or clearing the bag.

## 1. Account owner: complete manually in Stripe

Do this inside the Stripe Dashboard. Never send these details through chat or commit them to GitHub:

- Legal business name, entity type, EIN/tax details, owners, and identity verification
- Payout bank account
- Public business name, support phone/email, website, and statement descriptor
- Two-factor authentication and authorized team members
- Refund/cancellation, shipping, privacy, and terms policies approved for the business

## 2. Deployment secrets

Copy `.env.local.example` to `.env.local` for local testing. Enter real values directly in the hosting provider's encrypted environment-variable settings for production.

Required:

```dotenv
STRIPE_SECRET_KEY=sk_test_...               # use sk_live_... only after test approval
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
RESEND_API_KEY=re_...
ORDER_TO_EMAIL=orders@YOUR_DOMAIN
INQUIRY_TO_EMAIL=inquiries@YOUR_DOMAIN
INQUIRY_FROM_EMAIL="Jewel Stone <orders@YOUR_VERIFIED_DOMAIN>"
```

This hosted flow does not need a Stripe publishable key. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `RESEND_API_KEY` are server-only.

Optional, disabled by default:

```dotenv
STRIPE_AUTOMATIC_TAX=false
STRIPE_ALLOW_PROMOTION_CODES=false
STRIPE_ALLOW_SIGNATURE_CHECKOUT=false
```

Do not enable `STRIPE_ALLOW_SIGNATURE_CHECKOUT` until persistent order storage and atomic inventory reservation prevent two buyers purchasing the same piece.

## 3. Webhook

Create a Stripe webhook endpoint:

```text
https://YOUR_DOMAIN/api/webhook
```

Subscribe to `checkout.session.completed`. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`. Order email delivery uses a Resend idempotency key to reduce duplicate notifications during Resend's 24-hour idempotency window. Persistent webhook-event storage is still required for durable deduplication.

For local testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3002/api/webhook
```

Use the temporary `whsec_...` value printed by the CLI only in local `.env.local`.

## 4. Business choices before live mode

Confirm these values before accepting money:

- Final production domain
- Selling countries and supported currency/currencies
- Shipping services, insurance limits, delivery estimates, and international duties
- Sales-tax registrations and whether Stripe Tax should be enabled
- Refund/cancellation rules, especially for custom and made-to-order work
- Receipt/support email and internal paid-order notification recipients
- Whether discount codes should be accepted

## 5. Test-mode release check

1. Add test secrets only.
2. Complete a made-to-order purchase through hosted Checkout.
3. Confirm the verified success page, Stripe payment, webhook delivery, and exactly one order email.
4. Confirm one-of-one and mixed bags still create reservations without taking payment.
5. Test cancellation, declined cards, mobile layout, tax, shipping countries, receipts, refunds, and webhook retries.
6. Replace test keys with live keys only after owner approval and policy review.

Persistent order records and atomic inventory updates still need a database choice before instant payment can safely cover one-of-one inventory.
