# Codex handoff — Jewel Stone admin panel

**Written:** 2026-07-27
**Branch:** `claude/claude-rc-woba0e` (currently identical to `origin/main`, tree clean)
**Repo:** `viralfaceless25-sketch/jewel-stone`
**Baseline commit:** `6b92d89` — *feat(admin): invoice and memo memo-stock from the purchased inventory*

This document is the complete context transfer. Sections 1–3 are the work the owner
asked for and has **not** been started. Section 4 is a completed review whose findings
are not yet fixed — do not lose it, it is the only record. Sections 5–7 are the
environment and conventions you need to work in this repo.

---

## 0. Environment and how to run

```bash
npm install                 # NOT committed; node_modules is gitignored
npm run dev                 # next dev, port 3000
npm run build               # next build
npm run lint                # next lint
npm test                    # tsx --test tests/*.test.ts
npx tsc --noEmit            # type check
```

**Verified on 2026-07-27 at `6b92d89`:** `tsc --noEmit` reports **0 errors**;
`npm test` passes **37/37**. Any error you see beyond that is something you introduced.
(If you see thousands of `Cannot find module 'next'` errors, you forgot `npm install`.)

Stack: Next.js 14 App Router, TypeScript, React 18, CSS Modules, `pdf-lib` for
documents, Stripe for payments, Upstash Redis (REST) for all admin data.

**Storage.** `lib/kv.ts` wraps Upstash. Env vars: `KV_REST_API_URL` /
`KV_REST_API_TOKEN` (falls back to `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
With neither set it silently falls back to a **local JSON file** at
`.data/admin-store.json` (override with `ADMIN_STORE_FILE`) so dev works offline.
Custom requests use a separate file, `.data/custom-requests.json`
(override with `CUSTOM_REQUESTS_FILE`).

**Critical constraint:** `lib/kv.ts` exposes only `kvGet`, `kvSet`, `kvSetIfAbsent`,
`kvDel`, `kvIncrBy`, `kvSetAdd`, `kvSetRemove`, `kvSetMembers`, `kvGetMany`.
There is **no `SCAN` / `KEYS` wrapper.** Anything that clears data must walk the
index sets listed in section 1 — you cannot pattern-delete.

---

## 1. TASK A — Clear the test data from the admin panel — ✅ TOOL BUILT, NOT YET RUN

**Status:** `scripts/clear-admin-data.ts` is written, tested, and committed.
The owner still has to run it against the real store — see 1.4. Sections 1.1–1.3
describe what it does and why; you should not need to rebuild any of it.


The owner has been testing and wants the seeded/test records gone. Scope is the
admin sidebar sections named in the request: **Orders, Customers, KYC, Inbox,
Invoices & memos, Promotions, Operations.**

### 1.1 Exact key inventory

Every module follows the same shape: a Redis **set** used as an index, plus one
key per record. Delete the record keys, then empty the index set.

| Admin page | Module | Index set | Record keys |
|---|---|---|---|
| Orders | `lib/admin/orders.ts` | `jewelstone:orders` | `jewelstone:order:<id>` |
| Orders (dedupe) | `lib/admin/orders.ts` | — | `jewelstone:order-session:<stripeSessionId>` |
| Customers | `lib/admin/orders.ts` | `jewelstone:customers` | `jewelstone:customer:<customerKey(email)>` |
| KYC | `lib/admin/kyc.ts` | `jewelstone:kyc` | `jewelstone:kyc:<customerKey(email)>` |
| KYC files | `lib/admin/kyc.ts` | — | `jewelstone:kyc-file:<id>` |
| Inbox — inquiries | `lib/admin/leads.ts` | `jewelstone:inquiries` | `jewelstone:inquiry:<id>` |
| Inbox — appointments | `lib/admin/leads.ts` | `jewelstone:appointments` | `jewelstone:appointment:<id>` |
| Inbox — custom requests | `lib/custom-request-store.ts` | `jewelstone:custom-requests` | `jewelstone:custom-request:<id>` plus pointer keys `jewelstone:custom-public:<token>` and `jewelstone:custom-owner:<token>` |
| Invoices & memos | `lib/admin/documents.ts` | `jewelstone:documents` | `jewelstone:document:<number>` |
| Promotions | `lib/admin/promo-codes.ts` | `jewelstone:promos` | `jewelstone:promo:<CODE>`, `jewelstone:promo-log:<CODE>`, `jewelstone:promo-use:<CODE>:<customerKey(email)>` |
| Operations — payment links | `lib/admin/payment-links.ts` | `jewelstone:payment-links` | `jewelstone:payment-link:<id>` |
| Operations — service tickets | `lib/admin/service-tickets.ts` | `jewelstone:service-tickets` | `jewelstone:service-ticket:<id>` |
| Operations — activity log | `lib/admin/activity.ts` | `jewelstone:activity` | `jewelstone:activity:<id>` |

`customerKey(email)` lives in `lib/admin/order-items.ts` — use it, do not
hand-roll the normalisation, or you will orphan records.

### 1.2 Things that must NOT be cleared

- `jewelstone:admin-settings` — the owner's business details, bank account,
  routing number, Zelle ID. Wiping this breaks the invoice "HOW TO PAY" block
  (task C) and the PDF issuer header.
- `jewelstone:product:*` / `jewelstone:products` — admin-created products.
- `jewelstone:stock:*` / `jewelstone:stock-count:*` — inventory overlays. These are
  real stock levels, including the memo-goods on-hand counts.
- `jewelstone:counter:inv` / `jewelstone:counter:memo` — document numbering.
  **Ask the owner before touching these.** Leaving them means the next real invoice
  might be `INV-0014`; resetting to 0 restarts at `INV-0001` but risks colliding with
  a number already sent to a customer. Default to leaving them alone unless told.
- `jewelstone:account:*`, `jewelstone:account-phone:*`, `jewelstone:accounts` —
  customer portal logins. Deleting a customer record without deleting the matching
  login leaves an account that can sign in to an empty portal. Confirm with the owner
  whether test logins should go too; if yes, clear these three as well.

### 1.3 Recommended implementation

Write `scripts/clear-admin-data.mjs`. Requirements:

1. **Dry-run by default.** Print exactly what would be deleted and the counts.
   Require an explicit `--yes` (or `--confirm`) flag to actually delete.
2. **Selective.** Accept section names, e.g.
   `node scripts/clear-admin-data.mjs --only=orders,customers,kyc --yes`,
   defaulting to all seven sections when `--only` is omitted.
3. **Order of operations per section:** `kvSetMembers(index)` → for each member
   `kvSet(recordKey, null)` (that is how the rest of the codebase deletes; `kvDel`
   also exists and is cleaner) → `kvSetRemove(index, member)` for each member.
   Delete the child keys (KYC files, promo logs, promo-use counters, custom-request
   pointer tokens, order-session keys) **before** dropping the parent record, or you
   lose the ids needed to find them.
4. **Works against both stores** — it must run through `lib/kv.ts`, not raw fetch,
   so the local-JSON fallback is handled identically. Since `lib/kv.ts` is
   `server-only`, either run the script with `tsx` and a shim, or add a small
   `scripts/` entry that imports the Upstash REST calls directly using the same env
   vars. `tsx` is already a devDependency — prefer `tsx scripts/clear-admin-data.ts`
   over `.mjs` so you can reuse the typed key builders.
5. **Print a summary** — "Deleted 14 orders, 6 customers, 3 KYC records (9 files),
   2 promotions…" — so the owner can confirm.

### 1.4 What was actually built

`scripts/clear-admin-data.ts`, wired as `npm run clear:admin`. Behaviour:

```bash
npm run clear:admin                                   # dry run, all sections
npm run clear:admin -- --only=orders,promotions       # dry run, selected sections
npm run clear:admin -- --yes                          # delete, all sections
npm run clear:admin -- --only=kyc --yes               # delete, one section
npm run clear:admin -- --yes --with-logins            # also clear customer portal logins
```

- Dry run is the default and prints the store it is pointed at, a per-section
  count, the total key count, and the full "kept" list. Nothing is written.
- Child keys are resolved from parent records before deletion (order → Stripe
  session pointer, KYC record → file payloads, custom request → both link tokens,
  promo → per-customer counters derived from the redemption log, which is the only
  place that mapping exists).
- Index sets are deleted **after** their records, so an interrupted run leaves
  records still reachable and the script re-runnable rather than orphaning them.
- Unknown section names exit non-zero without touching anything.

**Two things needed a fix to make it work, both committed:**

1. `server-only` was added as a **devDependency**. Every `lib/**` module starts with
   `import "server-only"`, which Next aliases away at build time but which is
   unresolvable under plain Node — so the script could not import the real KV layer.
   With the package present, running under `tsx --conditions=react-server` resolves it
   to the empty stub and the script reuses `lib/kv.ts` instead of duplicating it.
   The npm script already carries that flag; keep it if you add more CLI tooling.
2. **Bug fixed in `lib/kv.ts`:** `kvDel` deleted only `data.values[key]` in the
   local-file fallback, while Redis `DEL` removes a key of any type. Deleting an
   index set therefore worked in production and silently no-opped in dev. It now
   deletes from both `values` and `sets`. Only one other caller exists
   (`lib/admin/orders.ts:89`, on a value key), so the change is safe.

**Verification done:** a fixture store covering all seven sections plus the
must-survive keys was seeded and run through the script. Dry run left all 32 values
and 13 sets untouched; `--only=orders,promotions --yes` removed exactly the 8
expected keys; a full `--yes` removed all 24 records and 11 index sets and left
precisely admin-settings, both counters, the product, and both stock keys standing;
`--with-logins` additionally cleared the account and its phone pointer.
`tsc --noEmit` 0 errors, `npm test` 37/37.

**Before running it against production data**, confirm with the owner which
environment's `KV_REST_API_URL` is loaded. There is no undo.

---

## 2. TASK B — Invoice: black and white, drop the tagline

**File: `lib/admin/document-pdf.ts`** (single file, ~430 lines, renders both invoices
and memoranda via `renderDocumentPdf`).

### 2.1 Remove "Shine With You" from the header

`data/site.ts:3` defines `tagline: "Shine With You"`. It is drawn in the PDF header at
**`lib/admin/document-pdf.ts`**, in `addPage()`, immediately under the brand name:

```ts
page.drawText(safeText(issuer.tagline.toUpperCase()), {
  x: 80,
  y: 712,
  font: bold,
  size: 6.5,
  color: color.gold,
});
```

Delete that `drawText` block. **Do not change `data/site.ts`** — the tagline is used
on the storefront and removing it there would change the public site, which is out of
scope. `issuer.tagline` also flows in from `document.issuer` (a per-document snapshot,
see `lib/admin/documents.ts`), so leave the type alone; just stop rendering it.

Check the vertical rhythm afterwards: the brand name sits at `y: 728` and the business
address block starts at `y: 687`. With the tagline gone you may want to drop the brand
name to ~`y: 720` so the header does not look top-heavy. Render a sample and look at it.

### 2.2 Convert to black and white

The palette is a single object at the top of the file:

```ts
const color = {
  paper:    rgb(0.992, 0.984, 0.965),   // warm cream
  ink:      rgb(0.105, 0.09, 0.075),
  soft:     rgb(0.40, 0.36, 0.32),
  muted:    rgb(0.58, 0.53, 0.47),
  line:     rgb(0.84, 0.80, 0.74),
  gold:     rgb(0.63, 0.45, 0.20),
  goldPale: rgb(0.95, 0.90, 0.81),
  white:    rgb(1, 1, 1),
  red:      rgb(0.58, 0.16, 0.14),
};
```

**Do the conversion by rewriting this object to neutral greys — not by editing the
~40 call sites.** Every drawing call already references `color.*`, so one edit
restyles the whole document consistently. Suggested values:

```ts
const color = {
  paper:    rgb(1, 1, 1),               // plain white
  ink:      rgb(0.07, 0.07, 0.07),      // near-black body text
  soft:     rgb(0.35, 0.35, 0.35),
  muted:    rgb(0.55, 0.55, 0.55),
  line:     rgb(0.80, 0.80, 0.80),
  gold:     rgb(0.15, 0.15, 0.15),      // was the accent — now dark grey
  goldPale: rgb(0.93, 0.93, 0.93),      // table header fill
  white:    rgb(1, 1, 1),
  red:      rgb(0.25, 0.25, 0.25),      // VOID / void status
};
```

The owner asked for black and white specifically "on the top part below the brand
name". Read that as: the header must not be gold/coloured. Converting the whole
document is the right call — a half-coloured invoice looks worse than either
extreme — but **flag this to the owner** in your summary in case they only wanted
the header changed.

Two spots to look at once the palette is neutral:

- The 8pt gold bar across the top of every page:
  `page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 8, width: PAGE_WIDTH, height: 8, color: color.gold })`.
  As near-black this becomes a heavy slab. Either drop it to ~3pt, or delete it and
  rely on the rule under the header.
- Renaming `gold`/`goldPale` to `accent`/`accentPale` would be cleaner, but it touches
  ~40 lines. Optional; if you do it, do it as a separate mechanical commit so the
  visual change stays reviewable.

Keep `document.status === "void"` visually distinct — in greyscale the watermark
still reads if you keep the opacity and size.

---

## 3. TASK C — Format the "HOW TO PAY" section properly

**Current state**, at the bottom of `renderDocumentPdf` in `lib/admin/document-pdf.ts`:

```ts
const methods = [
  settings?.bankAccountNumber
    ? `Bank transfer - account ${settings.bankAccountNumber}${settings.bankName ? ` (${settings.bankName})` : ""}`
    : "",
  settings?.bankRoutingNumber ? `Routing number - ${settings.bankRoutingNumber}` : "",
  settings?.zelleId ? `Zelle - ${settings.zelleId}` : "",
].filter(Boolean);
const methodsLine = methods.length
  ? `${methods.join("   |   ")}. Please reference ${document.number} with your payment.`
  : "";
```

That produces one long pipe-separated line that word-wraps arbitrarily across the full
612pt page width — the thing the owner is calling unprofessional. It is rendered by the
generic `blockLines` loop as body prose at 7.2pt.

### What it should be

A proper labelled payment block. Concretely:

- **Lay it out as label/value pairs, not a run-on sentence.** Left column for the label
  (`Bank`, `Account number`, `Routing number`, `Zelle`), right for the value. Small caps
  bold label at ~6.5pt, value at ~8pt regular, one pair per line.
- **Give it a boxed or ruled container** so it reads as a distinct block, not another
  paragraph of terms. A light rectangle fill (`color.goldPale`, which is now pale grey)
  or a thin border, inset ~6pt, sitting under the totals.
- **Constrain it to a column**, roughly `MARGIN` to ~300pt, so the values sit in a tidy
  block rather than stretching the full page width.
- **Pull "Please reference `<number>` with your payment" out** onto its own emphasised
  line beneath the pairs. It is the single most important instruction on the invoice
  and is currently buried at the end of a wrapped sentence.
- **Memoranda must not show it at all.** Guard on `document.kind === "invoice"` — the
  existing `payment` variable already does this; `methodsLine` currently does not, so a
  memo can render payment instructions today. That is a bug; fix it as part of this.

You will need a small dedicated draw function (say `drawPaymentBlock(page, x, y, …)`)
rather than pushing it through `blockLines`, because that loop only knows how to draw a
title plus wrapped prose. Keep the existing pagination guard pattern
(`if (y - height < 92) addPage(true);`) so the block never straddles a page break —
compute its height up front.

Field source: `getAdminSettings()` from `lib/admin/settings.ts`. Fields are
`bankName`, `bankAccountNumber`, `bankRoutingNumber`, `zelleId` (all `string`,
possibly empty). Defaults currently seeded: account `2910099681`, routing `021000021`,
Zelle `5513413256`. Every field is optional — render only what is set, and skip the
whole block when none are.

### Verifying the PDF

There is no snapshot test for the PDF. To eyeball it: sign into `/admin`, open
`/admin/invoices`, create or open a document, and hit the download route
`GET /api/admin/documents/<number>` (admin session required). Alternatively write a
throwaway script that imports `renderDocumentPdf` with a hand-built `BusinessDocument`
and writes the bytes to a file. Check **both** an invoice and a memo, and a multi-page
document (>8 line items) so you exercise `addPage(true)`.

---

## 4. Completed code review — findings NOT yet fixed

A full review of the last six admin commits (`178fab7`..`6b92d89`, ~4,000 lines) was
carried out on 2026-07-27. **None of these are fixed.** They are ranked by impact.
The owner was asked whether to fix #1 and had not answered when this handoff was written.

### 4.1 (HIGH) Per-customer and first-order promo limits never fire

`components/checkout/CheckoutClient.tsx:78` posts `{ items, promoCode }` to
`/api/checkout` — **no `email` field**. Same omission at `:41` for `/api/promo/validate`.
Server-side, `app/api/checkout/route.ts:88` reads `body.email`, so it is always
`undefined`, so `customerRedemptions` is always `0` and `isFirstOrder` is always
`undefined`. In `lib/admin/promo-shared.ts:107-114`:

```ts
(context.customerRedemptions ?? 0) >= promo.perCustomerLimit   // 0 >= N — never true
promo.firstOrderOnly && context.isFirstOrder === false          // undefined !== false — never true
```

Both admin-panel promo features are dead for **every** customer, not just tampering
ones. A "one per customer" code is unlimited; "first order only" applies to anyone.
This costs real money the moment a limited code is issued.

Fix: source the email server-side from the customer session
(`currentCustomerEmail()` in `lib/account/customer-auth.ts`) and/or send the checkout
form's email (already collected at `CheckoutClient.tsx:206`, currently used only for
the reservation path). Additionally make `firstOrderOnly` **fail closed** when identity
is unknown, rather than passing.

### 4.2 (MEDIUM) `recordRedemption` is not atomic, contrary to its own comment

`lib/admin/promo-codes.ts:129-139` claims "Counters are atomic so two simultaneous
orders cannot push a limited code past its cap." It is `kvGet` → `+1` → `kvSet`, and
`kvSet` is a plain Redis `SET` (`lib/kv.ts:78`). Two concurrent webhooks both read
`redemptions: 9`, both write `10`, and a code capped at 10 keeps redeeming. The
write-back also stomps a concurrent admin edit, since the whole promo object is
rewritten from a stale read. The per-customer counter on the very next line already
uses atomic `kvIncrBy` — do the same with a `jewelstone:promo-count:<code>` key and
read it at evaluation time.

### 4.3 (MEDIUM) Abandoned Stripe coupons accumulate forever

`app/api/checkout/route.ts:112` calls `stripe.coupons.create` **before** payment. Every
abandoned checkout leaves an orphan coupon in the Stripe account, with no `redeem_by`.
Set `redeem_by` to roughly session expiry (~24h) so they self-clean.

### 4.4 (LOW) `free_shipping` promo codes are inert but still count as redemptions

The Stripe session defines no `shipping_options` and charges no shipping, so
`evaluatePromo` returns `amountOff: 0`; the UI shows "Free shipping" applied,
`promo_code` lands in session metadata, and the webhook records a redemption — for a
$0 change. Either drop the kind from the admin panel or wire real shipping.

### 4.5 (LOW) Disabling an account or changing a password does not end live sessions

`lib/account/customer-auth.ts:155-175` — tokens are `HMAC(email|expiry)` with no
account epoch. `setAccountDisabled` and `changePassword` both leave existing cookies
valid for the remainder of the 30-day window. A disabled customer keeps portal access.
Add a `tokenVersion` to the account record, include it in the signed payload, bump it
in both functions, and verify it in `readCustomerSession`.

### 4.6 (LOW) NaN reaches the KV store from the inventory PATCH

`app/api/admin/inventory/route.ts:63` — `Math.max(0, Math.round(Number(body.stock)))`
is `NaN` for non-numeric input, and `NaN` is not `undefined`, so it slips past
`setOverlay`'s `??` guards. `JSON.stringify(NaN)` is `"null"`, so the stock counter and
overlay go null and the piece silently resets to `DEFAULT_STOCK` (1). Guard with
`Number.isFinite`. Same pattern applies to `price` on the line below.

### 4.7 (LOW) No throttling on `/api/account/login`

Customer passwords are 8 characters from a 36-character alphabet
(`generatePassword()`), usernames are known email addresses, and there is no lockout or
delay. `kvIncrBy` plus a TTL key is enough.

### 4.8 Notes, not defects

- `app/account/page.tsx:27` calls `listDocuments()` and filters one customer's
  documents in memory on every page load. Fine now, O(all documents) later.
- **Zero test coverage on any of this code.** The 37 passing tests cover
  checkout-policy, custom-request-flow, diamond-filters, gallery-navigation,
  intro-state, and seo-schema. Nothing touches promo evaluation, document maths,
  customer auth, or KYC. `evaluatePromo`, `computeTotals`, `normalizeLineItems`, and
  `normalizePhone` are pure functions and trivially testable — finding 4.1 would have
  been caught by three lines of test.

### 4.9 What was checked and holds up (do not "re-fix" these)

- Every KYC route is admin-gated, including the file-streaming endpoint.
- Both promo paths resolve price/category/world from the server-side catalogue and
  ignore client-supplied values. The comment at `app/api/promo/validate/route.ts:16`
  is accurate.
- `decrementStock` genuinely is atomic — it uses Redis `INCRBY`.
- Redemptions are recorded only after `payment_status === "paid"`, behind order
  idempotency.
- Password hashes and salts are stripped from every admin API response.
- Admin and customer session tokens share a secret but **cannot** be cross-replayed:
  the admin verifier HMACs the encoded string while the customer verifier HMACs the
  decoded payload, so neither format validates against the other. This looks like a
  vulnerability at a glance; it is not.
- Document money is in **integer cents** end to end (`parseMoneyToCents` multiplies by
  100), consistent with `Order.amountTotal`. `recordPaidDocument` is correct.

---

## 5. Architecture notes you will need

- **Two independent auth systems.** `lib/admin/auth.ts` is the owner's single shared
  password (`ADMIN_PASSWORD`), cookie `js_admin`, guard `requireAdminApi()`.
  `lib/account/customer-auth.ts` is per-customer trade logins, cookie `js_customer`,
  guard `requireCustomerApi()`. Every `/api/admin/*` route calls `requireAdminApi()`
  as its first statement — follow that pattern without exception.
- **Shared vs server-only modules.** Files importing `server-only` cannot be pulled
  into client components. Where logic must be shared, the codebase splits it:
  `promo-shared.ts` / `promo-codes.ts`, `order-shared.ts` / `orders.ts`,
  `kyc-shared.ts` / `kyc.ts`, `document-math.ts` / `documents.ts`. Respect the split.
- **Money is integer cents everywhere** in orders and documents. `data/products.ts`
  prices are **dollars** and get multiplied by 100 at the boundary. Do not mix them.
- **Memo (consignment) goods** live in `data/purchased-inventory.ts` as a static array
  and are deliberately never merged into `publicCatalog()` — they must never reach the
  storefront. Their stock rides the shared overlay under slugs prefixed `memo-`.

## 6. Conventions

- `AGENTS.md` at the repo root asks for terse "smart caveman" prose in chat replies —
  technical substance intact, filler dropped. It explicitly exempts code, commits, and
  PR bodies, which are written normally, and says to drop the style for security
  warnings and irreversible actions.
- Comments in this codebase explain *why*, not *what*, and are written in full
  sentences with British-leaning spelling ("honour", "normalise"). Match the
  surrounding density — do not add narration.
- Commit messages follow `type(scope): summary`, e.g. `feat(admin): …`,
  `fix(checkout): …`.
- The repo keeps `CODEX_*_SPEC.md` files at root as per-feature specs. Follow that
  naming if you add more.

## 7. Git workflow

Develop on **`claude/claude-rc-woba0e`**, push with `git push -u origin claude/claude-rc-woba0e`.
Do not open a pull request unless the owner explicitly asks. There are currently no
open PRs on the repo.

## 8. Suggested order of work

1. ~~**Task A** (data clearing)~~ — tool built and tested; the owner runs it. See 1.4.
2. **Task B** (invoice B&W + tagline removal) — smallest remaining, one file.
3. **Task C** (payment block) — same file, builds on the new palette.
4. **Finding 4.1** — offer it to the owner; it is small and it is costing money.

The owner has stated more changes are coming. Keep each task in its own commit so
individual pieces can be reverted without unpicking the rest.
