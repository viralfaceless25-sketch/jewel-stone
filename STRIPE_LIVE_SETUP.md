# Jewel Stone — Live payments + backend keys

The code is fully wired. These services just need their keys set in **Vercel →
jewel-stone → Settings → Environment Variables** (Production), then a redeploy.
**Do not paste any key into chat — add them directly in Vercel.**

---

## 1 · Stripe — LIVE payments

### A. Get live keys
1. **dashboard.stripe.com** → make sure the account is **activated** (business details,
   bank account added) so live mode is enabled. Toggle **Test mode OFF**.
2. **Developers → API keys** → copy the **live Secret key** (`sk_live_…`).

### B. Add to Vercel
| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | your `sk_live_…` |
| `NEXT_PUBLIC_SITE_URL` | `https://thejewelstone.com` |

### C. Webhook (so paid orders are confirmed)
1. Stripe → **Developers → Webhooks → Add endpoint**
2. URL: `https://thejewelstone.com/api/webhook`
3. Events: **`checkout.session.completed`**
4. Add → open it → reveal **Signing secret** (`whsec_…`)
5. Vercel: add `STRIPE_WEBHOOK_SECRET` = `whsec_…`

### D. What will accept payment
- **Lab-grown & CVD** pieces (made-to-order, unlimited) → **real Stripe card checkout**. ✅
- **Natural PIECUT** pieces are one-of-one. They stay on **reservation** (no card charge)
  until there's a durable order database + atomic stock hold, so the same unique piece can
  never be sold twice. Keep `STRIPE_ALLOW_SIGNATURE_CHECKOUT` **unset / false**.
- Hosted Stripe Checkout collects card, billing, phone, shipping. Ships to US/CA/GB/AU, USD.

### E. Before real money — one test on live keys
Do **one** live purchase of a low-value lab piece with a real card, confirm the order email
arrives and the webhook fires (Stripe dashboard → Webhooks → recent deliveries = 200), then
refund it from the Stripe dashboard. That verifies the whole path end to end.

---

## 2 · Resend — emails (contact form, order + custom-request notifications)
Without these, the contact/enquiry form returns a 503 and no emails send.

1. **resend.com** → add & **verify your sending domain** (thejewelstone.com) via the DNS
   records they give you (add them in GoDaddy, same as before).
2. **API Keys → Create** → copy `re_…`.
3. Vercel env vars:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | `re_…` |
| `INQUIRY_FROM_EMAIL` | e.g. `studio@thejewelstone.com` (must be on the verified domain) |
| `INQUIRY_TO_EMAIL` | where enquiries land, e.g. `ishan@thejewelstone.com` |
| `ORDER_TO_EMAIL` | where paid-order alerts land |

---

## 3 · Upstash Redis — custom-request storage
Without this, the custom-quotation flow fails closed in production.

1. **upstash.com** → create a **Redis** database (free tier is fine) → **REST API** section.
2. Copy **REST URL** and **REST token**.
3. Vercel env vars:

| Variable | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | `https://…upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | the REST token |

---

## 4 · Activate
After adding the variables, **redeploy** so they take effect (env changes only apply on the
next build). Tell me "keys added" and I'll run `vercel --prod` and verify each path.

## Still-missing operational pieces (not blocking launch, but before scaling)
- Durable **order database** + webhook-event ledger (so orders persist beyond the email).
- **Atomic reservation** for one-of-one PIECUT before enabling their direct checkout.
- Owner **login/dashboard** for quotations & orders (currently unguessable-link based).
- Private object storage for custom-request reference images (currently email-only).
