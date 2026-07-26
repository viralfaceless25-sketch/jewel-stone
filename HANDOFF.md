# Jewel Stone — Engineering Handoff

**For:** the next agent (Codex) continuing this work
**Repo:** `/Volumes/ai-hub/jewel-stone` · branch `main` · remote `github.com/viralfaceless25-sketch/jewel-stone`
**Live site:** https://thejewelstone.com
**Written:** 2026-07-26 · handing off mid-build of the admin panel

---

## 1 · What this is

Luxury diamond-jewelry e-commerce site for a NYC Diamond District jeweler.

- **Owner / client:** Ishan Vaghani — ishan@thejewelstone.com · +1 551-341-3256
- **Showroom:** 62 W 47th St, Suite 505, New York, NY
- **Business entity:** Jewelstone USA LLC (Stripe) / "Jewel Stone NY LLC" (site footer)
- **Family trade since 1980.** Three "diamond worlds": **Natural** (currently empty but kept in filters), **Natural PIECUT** (the signature one-of-one line), **Lab Grown** (made-to-order).

### Stack
Next.js **14.2.x App Router** · React 18.3 · TypeScript · **CSS Modules** (no Tailwind) · deployed on **Vercel** (direct CLI upload, *not* GitHub-connected).

Fonts: `@fontsource/marcellus` (display) + `@fontsource-variable/figtree` (body).
Design tokens live in `app/globals.css` (`--js-ink`, `--js-gold`, `--js-gold-deep`, `--js-platinum`, `--font-display`, `--font-body`).

---

## 2 · How we work — READ THIS FIRST

These are the working rules the client expects. They matter more than speed.

1. **Never claim something works without verifying it.** Hit the live endpoint with `curl`, read the DOM in a browser, or run the test. Report real output, including failures.
2. **Hard gates before any deploy** — all four must pass:
   ```bash
   npx tsc --noEmit       # ~1-2 min
   npx next lint          # fast
   npm run build          # 2-5 min
   npm test               # 28 tests, node --test
   ```
3. **Deploy = explicit commands** (the repo is NOT auto-deployed from GitHub):
   ```bash
   git push origin main
   npx vercel deploy --prod --yes
   ```
   Then verify live with curl/browser before telling the client it's done.
4. **Secrets never touch chat or code.** Env vars are added by the *client* via `npx vercel env add NAME production`. You may read names via `npx vercel env ls` but never values.
5. **The client is non-technical about code but sharp about the business.** Explain plainly, be direct about limitations, never oversell. When something can't be done (creating accounts, entering passwords, transferring ownership), say so and give exact click-steps instead.
6. **Match existing conventions** — CSS Modules, the cream/gold aesthetic, Marcellus/Figtree, existing lib patterns. Don't introduce new frameworks.
7. **Data is authoritative from the client's spreadsheets.** Prices come from `JEWELSTONE_final_Inventory_price.xlsx` exactly (no markup). Loose diamonds from the Maitri sheet at **+5%**. Never invent a price or a spec.
8. **Never fabricate product media.** If a piece has no real photography it does not go live (see §5, the two removed SKUs).

### Environment gotchas (will bite you)
- **git-lfs hooks are slow/hang.** Run every git command as:
  `git -c core.hooksPath=/dev/null <cmd>`
  LFS covers only source-media folders (`img/`, `hero/`, `CVD jewelry photography/`, `Pie-cut jewelry photo video/`, `source-assets/`, `public/models/source/`), never `public/images`.
  Repo is configured to skip LFS smudge (`filter.lfs.smudge = git-lfs smudge --skip`) so worktrees create in ~75s instead of hanging.
- **Bash tool calls time out at 2 min by default.** `tsc` and `npm run build` need explicit longer timeouts. A timeout ≠ a failure — re-run with a bigger timeout.
- **Vercel scope:** project lives under team `novas-projects-a8ab1763`, CLI logged in as `viralfaceless25-sketch`. The client also has a separate personal Vercel account (`stonejewel41`) that has **no** project in it — don't get confused. Client decided **not** to transfer ownership.

---

## 3 · Services & environment variables

All set in **Vercel → jewel-stone → Production** unless noted.

| Var | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://thejewelstone.com` | ✅ set |
| `RESEND_API_KEY` | transactional email | ✅ set |
| `INQUIRY_TO_EMAIL` | where leads land — `ishanjewelstone@gmail.com` | ✅ set |
| `INQUIRY_FROM_EMAIL` | `Jewel Stone <ishan@thejewelstone.com>` | ✅ set |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis (free tier, iad1) | ✅ set |
| `ADMIN_PASSWORD` | admin panel login | ✅ set by client (value unknown to us) |
| `STRIPE_SECRET_KEY` | payments | ❌ **REMOVED** — see §6 |
| `STRIPE_WEBHOOK_SECRET` | webhook signature | ⚠️ stale (sandbox value) |
| `STRIPE_ALLOW_SIGNATURE_CHECKOUT` | `true` — one-of-one pieces buyable | ✅ set |
| `ORDER_TO_EMAIL` | optional; falls back to `INQUIRY_TO_EMAIL` | not set |

**Email:** Resend account is on `ishanjewelstone@gmail.com`; domain `thejewelstone.com` is **verified** (DKIM/SPF/MX green via GoDaddy auto-config), so mail sends from a branded address to anyone.
**Important quirk:** owner mail goes to `ishanjewelstone@gmail.com` **directly**, not `ishan@thejewelstone.com`. Reason: `ishan@` is a Microsoft/Outlook mailbox that forwards to the Gmail, but Outlook won't forward mail it thinks it sent itself (from == to), so notifications vanished. Sending straight to the Gmail fixed it. **Don't "fix" this back.**

---

## 4 · Repo map (the parts that matter)

```
app/
  layout.tsx                 root layout: SiteNav, SiteFooter, ScrollTop, Analytics
  page.tsx                   homepage -> components/home/BrandHome.tsx
  products/[slug]/page.tsx   product detail (SSG via generateStaticParams)
  collections/               catalogue + category pages
  custom/                    custom design: builder, request/[token], owner/[token]
  appointment/ contact/ diamonds/ about/ try-on/ checkout/ wishlist/
  api/
    checkout/route.ts        Stripe Checkout session creation
    webhook/route.ts         Stripe checkout.session.completed
    inquiry/route.ts         contact form -> Resend
    appointment/route.ts     appointment booking -> Resend
    custom-requests/         create + [token] (customer) + owner/[token]
components/
  site/SiteNav.tsx           navbar (monogram->wordmark flip reveal on load)
  site/SiteFooter.tsx        footer + mini map
  product/ProductView.tsx    product page incl. variant/quote configurator
  product/QuoteRequestForm.tsx
  custom/CustomBuilder.tsx | CustomQuoteManager.tsx | CustomRequestStatus.tsx
  ar/TryOn.tsx               MediaPipe + three.js virtual try-on
data/
  products.ts                THE CATALOG — 85 products, built from the price sheet
  price-book.json            SKU -> exact price (authoritative)
  loose-diamonds.json        1000 stones
lib/
  commerce/variants.ts       as-listed vs customized matcher  <-- core commerce rule
  commerce/checkout-policy.ts
  custom-request-store.ts    Redis store for custom requests
  custom-request-notifications.ts
  stripe.ts                  null-safe Stripe client
  kv.ts                      NEW shared Redis helper (admin)
  admin/auth.ts              NEW admin auth
  admin/inventory.ts         NEW inventory model
```

---

## 5 · What is DONE and live

Everything below is deployed and verified on https://thejewelstone.com.

**Site & brand**
- Full premium redesign; Marcellus/Figtree; redesigned desktop navbar (mobile untouched).
- Navbar wordmark: bigger, brighter **metallic-gold text** + on-load **JS-monogram → wordmark flip** animation (respects `prefers-reduced-motion`).
- Favicon/brandmark = the JS monogram cropped from the owner's logo (`app/icon.png`, `app/apple-icon.png`, `public/brand/jewel-stone-mono-mark.png`).
- Footer J-descender clipping fixed; homepage hero slideshow; three-worlds sections; House Selection film grid; New Arrivals (24h rotation); family-legacy section; appointment section.
- `ScrollTop` component resets scroll on route change (client complained pages opened mid-scroll).
- Vercel **Analytics + Speed Insights** installed in `app/layout.tsx` — client still needs to click *Enable* in the Vercel dashboard for both.

**Catalog**
- **85 products**, rebuilt to match the price sheet exactly. 0 duplicates, every product has a SKU, every price exact.
- Two SKUs (`JSND062612`, `JSND062613` statement rings) were **deliberately removed** — full specs existed but **no photography**, and using generic stock imagery would misrepresent certified one-of-one pieces. Do not re-add without real photos.
- Loose diamonds: 1000 stones at **+5%** over sheet; enquiry-only (no direct checkout).
- Audited every product link on the live site: all resolve 200, all cover images load.

**Commerce model (IMPORTANT — this is the client's core rule)**
`lib/commerce/variants.ts` implements:
- Product page shows the Excel spec + price, with selectors for **carat, shape, setting, metal, colour, clarity** (+ ring size / chain length which never trigger a quote).
- Selecting a combination that **is** another listed SKU → **navigate to that product** (e.g. 1ct stud → 2ct stud) and show its price, buy-now.
- Selecting anything **not** in the sheet (e.g. rose gold when only 14K white is listed, off-spec colour/clarity) → **hide the price everywhere**, show **"Inquire for quotation"**, and post the exact custom spec into the custom-request pipeline.
- Only exact Excel rows are buy-now. Everything else is a quote.

**Forms & back-office (working)**
- Contact/message form → owner email.
- Appointment booking (`/appointment` + `app/api/appointment`) → owner email; all "Book an appointment" CTAs point there.
- Custom design requests → **Upstash Redis** + owner email **with image attachments** + customer confirmation + customer tracking page + owner quote portal.
- **Accept-to-pay:** owner can attach an exact charge amount to a quotation; the customer's "Accept & pay" creates a Stripe Checkout session; the webhook stamps the request paid and emails the owner. Falls back gracefully to confirmation-only when no amount or no Stripe key.

**Other**
- AR virtual try-on (MediaPipe HandLandmarker/FaceLandmarker + three.js, Draco GLBs) — functional beta.
- SEO schema, sitemap, robots; 28 passing tests (`npm test`).

---

## 6 · Stripe — current state (needs client action)

**Payments are currently OFF.** `STRIPE_SECRET_KEY` was deliberately removed when the client paused to redesign the checkout rules. With no key, `app/api/checkout/route.ts` returns the no-charge reservation fallback — which is why the checkout button reads **"Reserve & request payment link"** instead of a Pay button. That is expected, not a bug.

Stripe account status: **live account created** (Jewelstone USA LLC, category *Jewelry stores*), business + bank submitted, **"Review in progress · 2–3 days"** at last check. A **sandbox** webhook exists at `https://thejewelstone.com/api/webhook` listening to `checkout.session.completed`; the **live-mode** webhook was not yet created.

To switch payments on, the client must (in the **live** environment, not the sandbox):
1. Developers → Webhooks → Add endpoint `https://thejewelstone.com/api/webhook`, event `checkout.session.completed`, copy the **live** `whsec_…`.
2. Developers → API keys → copy the **live** `sk_live_…`.
3. `npx vercel env add STRIPE_SECRET_KEY production` and `npx vercel env add STRIPE_WEBHOOK_SECRET production`.
4. You then redeploy and verify the checkout API returns a `cs_live_…` URL.

For a no-real-money rehearsal, use `sk_test_…` + the sandbox `whsec_…` and card `4242 4242 4242 4242` (exp `12/34`, CVC `123`, ZIP any), then swap to live.

**Sales tax is not configured** (`STRIPE_AUTOMATIC_TAX` unset). Jewelry has NY tax obligations — flagged to the client as an accountant question, not implemented.

---

## 7 · THE CURRENT TASK — Admin panel (in progress, unfinished)

The client asked for a full back-office at `/admin`, "simple and easy to use, no complicated stuff, but fully wired in, nothing broken."

### 7.1 Foundation — DONE, committed on `main` (commit `98b809b`)

Three files, already typechecked, **use these, don't rewrite them**:

- **`lib/kv.ts`** — shared Upstash Redis REST helper with a local-JSON dev fallback.
  Exports: `kvGet`, `kvSet`, `kvDel`, `kvIncrBy`, `kvSetAdd`, `kvSetRemove`, `kvSetMembers`, `kvGetMany`, `kvConfigured`, `KvError`.
- **`lib/admin/auth.ts`** — single shared password (`ADMIN_PASSWORD`) → HMAC-signed, HTTP-only, 7-day session cookie (`js_admin`).
  Exports: `adminConfigured`, `passwordMatches`, `createSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `isAdminAuthenticated`, `requireAdminApi`, `ADMIN_COOKIE`.
  Closed by default: no `ADMIN_PASSWORD` ⇒ panel denies access.
- **`lib/admin/inventory.ts`** — the inventory model.
  `DEFAULT_STOCK = 1`. Types `StockOverlay`, `AdminProduct`, `InventoryRow`.
  Functions: `listInventory()`, `setOverlay()`, `decrementStock()`, `listAdminProducts()`, `getAdminProduct()`, `saveAdminProduct()`, `deleteAdminProduct()`, `adminProductToProduct()`, `publicCatalog()`, `publicStateFor()`, `nextDocumentNumber('INV'|'MEMO')`.
  Design: the static Excel catalogue + a Redis **overlay** carrying on-hand stock and website visibility; admin-created products live entirely in Redis; storefront and admin both read through this file so they can never disagree.

### 7.2 Feature spec (what the client asked for)

Confirmed requirements:
1. **Dashboard** — overview tiles.
2. **Inventory** — every product listed, **editable on-hand stock (default 1 each)**, show/hide-on-website toggle. Website must show **Sold out** at stock 0, and the **Stripe webhook must atomically decrement stock** when a piece sells.
3. **Add products** — a dialog for one product **and** bulk **Excel (.xlsx) upload**. Images are uploaded **per product, individually** ("click on product, add image, select X number of images to be shown on website"), and the panel must **prompt/block when images are missing before a product publishes to the website**.
4. **Orders + customers** — every purchase captures the customer (name, email/phone, last purchase) into a customer base; orders list with statuses. **Dates on everything.**
5. **Invoices + memos** — create both, on a designed Jewel Stone template, with **proper sequential invoice/memo numbers**; all issued documents listed by number, customer name, and date; emailable to the customer (receipt/invoice forwarding).

Additional scope the client approved ("add whatever else is required"):
quotation requests inbox · appointments list · contact messages · loose-diamond inventory · low-stock/sold-out alerts · product edit/delete/duplicate · price editing + bulk price update · search & filters everywhere · Stripe payment-link generator for off-site sales · refunds · customer detail page with purchase history & notes · repair/service tickets · CSV export (orders/customers/invoices) · activity log · settings (business info, tax rate, invoice prefix, shipping defaults).

**Critical constraint:** Vercel's filesystem is **read-only at runtime** — product images must NOT be written to `public/`. Store them as data-URLs in Redis (compress client-side: canvas → JPEG/WebP, max ~1600px, keep each well under ~700KB because Redis values have size limits), or wire up Vercel Blob.

### 7.3 Partial work — three WIP branches (agents were cut off mid-build)

Three agents ran in isolated worktrees and were **terminated by an API spend limit** before finishing. Nothing was merged. Their partial work is committed on these branches (all forked from `5640c8f`, i.e. **before** the `98b809b` foundation commit — rebase onto `main` first):

| Branch | Area | Files present (unverified, never built/tested) |
|---|---|---|
| `worktree-agent-a984da6db668fc5f0` | Admin shell + inventory UI | `app/admin/{layout,page,login/page}.tsx`, `AdminNav.tsx`, `SignIn.tsx`, `StatTile.tsx`, `admin.module.css` (565L), `app/api/admin/{login,logout}/route.ts`, `app/api/admin/inventory/helpers.ts` |
| `worktree-agent-a97d3e05535d69eb0` | Orders + customers + storefront stock | `lib/admin/orders.ts` (291L), `lib/admin/order-items.ts`, `components/admin/OrdersClient.tsx` (321L), `records.module.css` (444L), `app/api/admin/{orders,customers}/…`, **modified `app/api/webhook/route.ts`** |
| `worktree-agent-a2cc1c5a511bfacf7` | Invoices + memos | `lib/admin/documents.ts` (235L), `document-math.ts`, `document-email.ts`, `app/api/admin/documents/…`, `components/admin/document-template.module.css` (405L) |

**Treat all of it as untrusted drafts.** None of it was typechecked, linted, built, or tested. Cherry-pick what's sound, rewrite what isn't. If reviewing costs more than rebuilding, rebuild — the foundation in §7.1 is the part that matters.

Worktrees live under `.claude/worktrees/` (gitignored). To inspect: `git -c core.hooksPath=/dev/null diff main..<branch>`.

### 7.4 Suggested order of work

1. **Admin shell + auth + dashboard** — prove login works end-to-end before anything else.
2. **Inventory list** (read-only) → then editable stock/visibility → then `revalidatePath` so the storefront reflects changes.
3. **Storefront wiring** — `publicStateFor()` in `app/products/[slug]/page.tsx` (add `export const revalidate = 60`), sold-out state in `ProductView.tsx`, stock check in `app/api/checkout/route.ts`.
4. **Webhook** — on paid checkout: create order, upsert customer, `decrementStock()` per slug. **Must be idempotent** (guard on Stripe session id; Stripe retries events).
5. **Add product + Excel import + image upload** (with the missing-images publish gate).
6. **Orders + customers pages.**
7. **Invoices + memos** (+ print view + Resend email).
8. Then the extras from §7.2.

Deploy after each phase, verified. The client explicitly said: *"nothing should be half completed."*

---

## 8 · Known open items

- [ ] Admin panel (§7) — the active task.
- [ ] Stripe live keys + live webhook (§6) — blocked on the client + Stripe's review.
- [ ] Vercel Analytics / Speed Insights — code deployed; client must click **Enable** in the dashboard.
- [ ] Privacy Policy + Terms pages — flagged to the client (site collects personal data and takes payments); not written.
- [ ] Sales tax — not configured; accountant question.
- [ ] AR try-on is a good beta, not perfect fit/occlusion. Client accepted the free-in-browser ceiling.
- [ ] `Natural` diamond world is intentionally empty but present in filters (client's instruction).
- [ ] Test emails from earlier verification are sitting in the owner's inbox ("Diag Test", "Custom Live Test", etc.) — harmless.

## 9 · Quick verification snippets

```bash
# live checkout mode (expect reservation while Stripe keys are absent)
curl -s -X POST https://thejewelstone.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"slug":"sr1-round-1ct-solitaire-ring","qty":1}]}'

# custom request pipeline (creates a real record + emails owner)
curl -s -X POST https://thejewelstone.com/api/custom-requests \
  -F "name=Test" -F "email=ishanjewelstone@gmail.com" \
  -F "type=Ring" -F "metal=18K White Gold" -F "shape=Emerald" \
  -F "origin=Natural PIECUT" -F "budget=10000-20000" -F "notes=handoff check"

# env var names (never values)
npx vercel env ls production
```

---

**Bottom line:** the storefront is finished, live, and behaving correctly. The admin panel's data foundation is built and on `main`; the UI and back-office features are not. Start at §7.4.
