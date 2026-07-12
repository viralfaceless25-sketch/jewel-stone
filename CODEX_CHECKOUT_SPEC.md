# CODEX SPEC — Phase 2: Real cart → Stripe checkout → order confirmation

Turn JewelStone from a catalog into a working shop using **Stripe Checkout**. Keep the Onyx & Champagne Gold theme and all existing content. This REQUIRES leaving static export.

## 0. Architecture change
- `next.config.mjs`: **remove `output: "export"`** (Stripe needs server-side API routes). Keep `reactStrictMode`, keep `images.remotePatterns`; you may drop `images.unoptimized` (Node host optimizes images) or keep it — builder's choice, but build must pass.
- Add deps: `stripe` (server SDK) and `@stripe/stripe-js` (client). Run the install.
- Env (NEVER hardcode secrets). Create `.env.local.example` with:
  ```
  STRIPE_SECRET_KEY=sk_test_xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
  Read all keys from `process.env`. If keys are missing at runtime, the checkout API should return a clear 500 JSON error ("Stripe not configured"), not crash the build.

## 1. Cart (zustand, already installed)
- `lib/cart.ts`: a persisted (localStorage) zustand store. Item shape: `{ slug, name, category, priceCents, qty, image }`. Actions: `add`, `remove`, `setQty`, `clear`, selectors for `count` and `subtotalCents`. Prices come from `data/products.ts` (`price` is USD dollars → store cents = price*100).
- Wire **"Add to cart"** on: product detail (`app/products/[slug]/page.tsx` / `ProductCustomizer`), `ProductQuickView`, and `ProductCard` hover ("Add +"). Signature one-of-a-kind items: qty capped at 1. Lab-grown/made-to-order priced items: purchasable (label "Made to order"). The bespoke `/custom` service stays an INQUIRY (no instant checkout) — leave it.
- Navbar cart icon → shows live cart `count` badge and opens a **cart drawer** (glass, onyx+gold) with line items, qty steppers, remove, subtotal, and a "Checkout" button → `/cart`. Keep the existing wishlist separate.

## 2. Cart page — `app/cart/page.tsx`
- Full cart: line items (image, name, category, price, qty stepper, remove), order summary (subtotal, shipping note, total), "Proceed to checkout" (primary `.aurora-btn`) and "Continue shopping". Empty state with gold CTA. On theme.

## 3. Checkout API — `app/api/checkout/route.ts` (POST)
- Server-only. Build Stripe `checkout.sessions.create`:
  - `mode: 'payment'`, `line_items` from the posted cart (re-price server-side from `data/products.ts` by slug — DO NOT trust client prices), `currency: 'usd'`.
  - `shipping_address_collection` (US + common countries), `phone_number_collection` on.
  - `success_url: ${NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, `cancel_url: ${NEXT_PUBLIC_SITE_URL}/cart`.
  - Put line-item slugs in `metadata` for the webhook.
- Return `{ url }`; client `window.location = url` (or `@stripe/stripe-js` redirect). Handle errors as JSON.

## 4. Success — `app/checkout/success/page.tsx`
- Read `session_id`, retrieve the session server-side (`stripe.checkout.sessions.retrieve` with `expand: line_items`), show a gold confirmation: order reference, items, total, shipping address, "what happens next" (GIA cert, insured shipping, lifetime service). Clear the cart client-side on mount. On theme, celebratory but restrained.

## 5. Webhook — `app/api/webhook/route.ts` (POST)
- Verify signature with `STRIPE_WEBHOOK_SECRET` (raw body). Handle `checkout.session.completed`: log a structured order record (id, email, amount_total, line-item slugs from metadata) — persistence can be a simple server log / JSON append for now (no DB required). Return 200. This is the hook where real order fulfillment/email would later attach.

## 6. Theme + copy
- Cart drawer, cart page, success page all in Onyx & Champagne Gold (glass, hairline, `.aurora-btn`), consistent with the redesigned site. Real product data/prices. Clear microcopy ("Add to bag", "Checkout", "Order confirmed").

## 7. Acceptance
- `npm run build` passes as a SERVER build (no `output: export`). `npm run start` serves.
- Add to cart → cart badge/drawer → cart page → "Proceed to checkout" hits `/api/checkout`, which (with test keys in `.env.local`) creates a Stripe Checkout Session and redirects to Stripe. Success page renders the confirmed order and clears the cart. Webhook verifies and logs.
- Server re-prices from `data/products.ts` (client prices never trusted). No secrets in client bundle (only `NEXT_PUBLIC_*` is public). Custom/bespoke stays inquiry.
- With NO keys set, build still succeeds and the API returns a clean "not configured" error (so the repo builds without secrets).
- Report every changed/added file + list the env vars the user must set.
