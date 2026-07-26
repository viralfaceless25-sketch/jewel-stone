# Agent 2 — Jewel Stone Admin Panel

## Your strategy
Clean modular architecture — a well-structured lib/admin data layer + reusable typed components, maintainable and extensible.

## Goal
Build a complete, password-protected ADMIN PANEL for the Jewel Stone diamond-jewelry site (Next.js 14 App Router, TypeScript, CSS Modules) at route `/admin`, fully wired to the live site, WITHOUT breaking anything that already works.

## Reuse (do NOT re-architect)
- Data: Upstash Redis via REST. Env `KV_REST_API_URL`, `KV_REST_API_TOKEN`. Reuse the fetch-based command pattern in `lib/custom-request-store.ts` (kvCommand). A shared `lib/kv.ts` is fine.
- Email: Resend. Env `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`, `INQUIRY_TO_EMAIL`/`ORDER_TO_EMAIL`. See `app/api/webhook/route.ts` + `lib/custom-request-notifications.ts`.
- Payments: Stripe `lib/stripe.ts`; webhook `app/api/webhook/route.ts` handles `checkout.session.completed`.
- Catalog: `data/products.ts` exports `products` (static) + `Product` type. Product page `components/product/ProductView.tsx`. Checkout `app/api/checkout/route.ts`.

## Auth
Gate `/admin/*` (except `/admin/login`). Password = env `ADMIN_PASSWORD`. On correct password (POST /api/admin/login) set a signed HTTP-only Secure session cookie (HMAC; secret derived from ADMIN_PASSWORD or a separate ADMIN_SESSION_SECRET). Verify on every admin page + admin API. If ADMIN_PASSWORD unset → deny (safe default). Provide logout. Middleware or server guard — must NOT affect non-admin routes.

## Features (all required, working end-to-end)
1. Dashboard `/admin`: tiles — total products, in-stock, hidden/sold-out, orders, customers, revenue (sum of paid orders) + recent orders.
2. Inventory `/admin/inventory`: table of every product from `data/products.ts` merged with a Redis stock/visibility overlay. Editable on-hand stock (DEFAULT 1) + visible-on-website toggle, saved via admin API. PUBLIC site must: show "Sold out" + disable buy when stock<=0; hide hidden products; and the Stripe webhook must ATOMICALLY decrement stock (Redis DECR) per purchased SKU on checkout.session.completed. Provide `lib/inventory.ts` used by BOTH admin and public site; default stock 1 when no overlay.
3. Add product: dialog to add one product (name/SKU/category/price/specs/stock) stored in Redis and MERGED into catalog on site+admin. PLUS bulk `.xlsx` upload (the `xlsx` npm package is acceptable). Per-product IMAGE upload: click product → upload images → choose how many show on website. IMPORTANT: Vercel serverless FS is read-only at runtime — store images as base64/data-URLs in Redis or another approach that actually works on Vercel (NOT writing to public/ at runtime). A product cannot publish to the website until it has >=1 image (missing-images gate, clearly surfaced).
4. Orders + customers: on paid checkout (webhook) create an Order (id, date, items, amount, customer) in Redis and upsert a Customer (name, email, phone, lastPurchase, date). `/admin/orders` lists orders; `/admin/customers` lists customers (name, email/phone, last purchase, date). Dates on everything.
5. Invoices + memos: `/admin/invoices` — create invoice OR memo from an order or manually. Jewel Stone-branded printable template (62 W 47th St Suite 505 NYC; owner Ishan Vaghani, ishan@thejewelstone.com, +1 551-341-3256). Sequential numbers via Redis counters (INV-0001, MEMO-0001). List all issued docs by number, customer, date. Emailable to customer via Resend (clean printable HTML invoice acceptable if PDF is heavy).

## MUST pass before finishing
- `npx tsc --noEmit` clean · `npx next lint` clean · `npm run build` succeeds · `npm test` stays green · existing pages/routes unbroken.
- No secrets in code. Simple, easy-to-use UI for a non-technical jeweler; match site aesthetic (cream/gold, Marcellus/Figtree, CSS Modules).

## Deliverable
Commit all changes to your branch (clear messages). Write a concise summary to `.agenthub/board/results/agent-2-result.md` (approach, files, what works, gaps, verification output tsc/lint/build/test, confidence) and commit it. In your final report include your BRANCH NAME + the summary.
Work ONLY in your worktree; do not read/modify other agents' work.
