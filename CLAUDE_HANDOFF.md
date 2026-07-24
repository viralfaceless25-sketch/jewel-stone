# Jewel Stone Website — Complete Claude Handoff

**Prepared:** July 23, 2026  
**Project path:** `/Volumes/ai-hub/jewel-stone`  
**GitHub:** `https://github.com/viralfaceless25-sketch/jewel-stone.git`  
**Branch:** `main`  
**Remote and local HEAD:** `112229161bfb119c19f48e837ea735114b1792ca` (`1122291`)  
**Important:** large, valuable local changes exist after this commit and are not committed or pushed.

---

## 0. Claude: read this before doing anything

You are continuing an active Jewel Stone e-commerce build. Do not rebuild it from scratch. Current files in `/Volumes/ai-hub/jewel-stone` are the source of truth.

Start with these exact actions:

1. Work only in `/Volumes/ai-hub/jewel-stone`.
2. Read `/Volumes/ai-hub/jewel-stone/AGENTS.md`.
3. Run `git status --short`, `git log -5 --oneline`, and `git stash list`.
4. Treat every modified and untracked file listed in this handoff as intentional work.
5. Do not reset, clean, checkout, overwrite, delete, or pop the stash.
6. Do not commit or push unless the user explicitly asks.
7. Never put Stripe, Resend, Redis, hosting, or account secrets in code, Markdown, Git, shared memory, terminal output, or chat. Ask the user to enter secrets directly in encrypted environment settings.
8. Read current implementation before editing. Historical `CODEX_*_SPEC.md` files describe earlier directions and are not current authority.
9. Preserve the three untracked `ChatGPT Image Jul 16...png` files until the user decides where they belong.
10. Verify changes with `npm test`, `npx tsc --noEmit`, and `npm run lint`.
11. Never run `next build` while `next dev` is using the same `.next` directory. Stop dev first, build, then restart dev.

Current continuation objective: finish production wiring and launch readiness without losing completed design, custom quotation, checkout, media, inventory, or SEO/AEO work.

---

## 1. Product and business

Jewel Stone is a luxury diamond jewelry storefront and client-service platform for a New York City Diamond District jeweler.

### Verified brand facts

| Field | Value |
|---|---|
| Brand | Jewel Stone |
| Tagline | Shine With You |
| Legal name used on site | Jewel Stone NY LLC |
| Owner | Ishan Vaghani |
| Title | Founder & Diamond Consultant |
| Phone | +1 551-341-3256 |
| Email | ishan@thejewelstone.com |
| Website | https://thejewelstone.com |
| Address | 62 W 47th St, Suite 505, New York, NY 10036 |
| Hours | Monday to Saturday, by appointment |
| Heritage claim | Family jewelry knowledge since 1980 |

Canonical source: `data/site.ts`. Do not invent social handles, addresses, awards, reviews, certifications, or team members.

### Three jewelry worlds

These categories must be unmistakable throughout the site:

1. **Natural** — earth-formed rarity, provenance, individual character.
2. **PIECUT** — multiple precisely matched diamonds assembled to read as one larger geometric silhouette; Jewel Stone's signature design language.
3. **Lab-grown** — diamond crystal and optical properties with greater freedom in scale, grade, and budget.

User specifically asked for clear hierarchy:

- Large, bold display heading.
- Clear subheading.
- Readable body copy.
- No “vaka chuka” layout: no inconsistent up/down alignment or arbitrary text sizing.
- Luxury editorial typography in the direction of Blore, Fugi, Listian, or Kaftan, without requiring those exact licensed faces.
- Scroll text motion that earns attention: staggered word fades and restrained typing effects.
- Modern navigation with About restored.
- Natural / PIECUT / Lab-grown clearly presented as categories available across jewelry styles.

### UX principles already established

- Luxury editorial, not generic template luxury.
- Product photography comes first; 3D/AR supports it.
- No false AR promise. Native AR places models in space; model photography communicates on-body scale.
- No false search route, fake reviews, fake social profiles, fake hand tracking, or unsupported product claims.
- One-of-one signature pieces require reservation/availability confirmation until atomic inventory controls exist.
- Made-to-order lab-grown products may use direct Stripe Checkout once configured.
- Custom quotation acceptance is not a card charge.
- Respect reduced-motion preferences.

---

## 2. History: from first build to current state

### Pre-Git working phase — July 2, 2026

A strict dark-luxury, five-section homepage direction was developed on the SD-card copy. Backups remain in:

```text
.backup-20260702/
├── Footer.tsx.bak
├── HeroSection.tsx.bak
├── LuxuryNavbar.tsx.bak
└── page.tsx.bak
```

That direction was later superseded. Keep these files only as historical reference.

One preserved stash also exists:

```text
stash@{0}: On main: codex-pause: category clarity + luxury story typography motion (2026-07-22)
```

Do not pop or delete it without explicit approval. Current worktree already contains the intended modern implementation.

### Repository history

The Git history begins July 12:

| Commit | Date | Meaning |
|---|---|---|
| `73d1baf` | Jul 12 | AR Vitrine rebuild: light theme, model-viewer 3D/AR, mega-nav, pages, cart, Stripe scaffold |
| `2ccaa5c` | Jul 17 | Full storefront rebuild and exact 18K pricing adjustment |
| `4882643` | Jul 17 | Source media and inventory added |
| `beea420`–`1e9b5a9` | Jul 17 | Commerce interaction helpers, discovery controls, diamond filtering |
| `0e29892`–`86f44ea` | Jul 17 | Navigation redesign and cinematic collection story |
| `e746abb`–`1b2fa24` | Jul 17 | Commerce polish and correct uncropped media framing |
| `9d8acdf`–`f5401d9` | Jul 17 | Session intro/preloader and crisp CSS loader |
| `bd25a8e` | Jul 17 | Removed remote-font build dependency |
| `795127b` | Jul 19 | Imported supplied studio assets |
| `85ea30b` | Jul 19 | Added multi-image custom briefs |
| `1122291` | Jul 19 | Hardened Stripe checkout flow; current pushed HEAD |

### Supplied archive phase

Six WhatsApp archives were downloaded, extracted, audited, converted, and imported:

```text
CVD jewelry photography 1.rar
CVD jewelry photography 2.rar
CVD jewelry photography 3.rar
Piecut Jewelry Photography 1.rar
Piecut Jewelry Photography 2.rar
Piecut Jewelry Photography 3.rar
```

Archive binaries themselves are not present now. Extracted content is present and Git LFS-tracked under:

```text
CVD jewelry photography/
Pie-cut jewelry photo video/
```

`data/rar-media-import.json` records:

- 254 supplied files
- 133 imported raw files
- 120 existing PIECUT files verified byte-identical
- 10 CVD groups
- 17 mapped CVD products
- 3 PIECUT arrival groups
- one unrelated `viral slip.pdf` deliberately excluded

Import command:

```bash
node scripts/import-rar-studio-media.mjs
```

Do not rerun import scripts casually. They are deterministic media pipelines but can rewrite optimized assets and manifests.

### July 22–23 local continuation — not pushed

Current dirty work adds or improves:

- Bodoni Moda + Inter self-hosted variable fonts.
- More disciplined typography hierarchy.
- Natural / PIECUT / Lab-grown homepage category header and index.
- Word-by-word reveal plus typed final-word animation.
- Modern split navigation, mega menus, mobile accordion, scroll progress, About.
- Separate imagery for About and Custom.
- Custom request workflow with 1–6 reference images or public reference URL.
- Private customer status page.
- Private owner quotation workspace.
- Quote acceptance/decline, production, shipping, tracking, and notification states.
- Durable production storage requirement through Upstash Redis REST.
- SEO/AEO metadata, schema, answer-focused education, FAQ, editorial standards, sitemap, and robots controls.
- Tests for quotation state rules and structured data.

These changes pass tests, typecheck, lint, and live route checks but remain uncommitted.

---

## 3. Current stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.x, App Router |
| UI | React 18.3.1, TypeScript 5.7.2 |
| Styling | CSS Modules, global CSS, Tailwind 3.4.17 |
| Display font | `@fontsource-variable/bodoni-moda` |
| Body font | `@fontsource-variable/inter` |
| Motion | Framer Motion, GSAP, Lenis, anime.js, React Spring, Web Animations API |
| 3D/AR | `<model-viewer>`, Three.js, React Three Fiber, Drei, postprocessing |
| Client state | Zustand with local browser persistence |
| Images | Next Image + Sharp |
| Payments | Stripe hosted Checkout |
| Email | Resend REST API |
| Custom-request storage | Upstash Redis REST in production; ignored JSON file in development |
| Testing | Node test runner through `tsx --test` |
| Large files | Git LFS |

Important version correction: this project uses **React 18**, not React 19.

Main commands:

```bash
npm install
npm run dev
npm test
npx tsc --noEmit
npm run lint
npm run build
```

`next.config.mjs` intentionally does not use static export because `/api/checkout`, `/api/webhook`, inquiry, and quotation APIs require a Node runtime. Deploy on Vercel or another compatible Node host.

---

## 4. Current visual system

### Active design

- Warm porcelain/alabaster canvas for editorial sections.
- Ink/charcoal type and dark cinematic sections.
- Walnut, champagne, gold, garnet, and rose accents.
- Bodoni Moda display typography with Inter utility/body typography.
- Large editorial titles with tight line-height and balanced wrapping.
- High-resolution model photography paired with studio proof.
- Dark film and craftsmanship sections break up light editorial content.
- Small uppercase utility labels and numbered category/service systems.
- Restrained hover and parallax movement.

Global source:

```text
app/globals.css
```

Active homepage source:

```text
app/page.tsx
components/home/BrandHome.tsx
components/home/HeroSlideshow.tsx
components/home/CinematicMotion.tsx
components/home/brand-home.module.css
```

`components/home/CinematicMotion.tsx` currently provides:

- Intersection-observer section reveals.
- In-view video playback/pause.
- RequestAnimationFrame parallax.
- Staggered word appearance.
- Typed-glyph final word and cursor.
- Reduced-motion fallback.

### Homepage sections

1. Hero slideshow and headline.
2. Point of view / manifesto.
3. Explicit category header: “Natural. PIECUT. Lab-grown.”
4. Three detailed category stories.
5. House-selection film bento.
6. Earrings editorial.
7. 3D + native AR explanation.
8. Making process.
9. Family legacy.
10. Contact/custom closer.

### About and Custom imagery

User noticed both pages previously used the same image. This is fixed:

- About: `/images/atelier/bench-setting.jpg`
- Custom: `/images/new/custom-design-editorial.jpg`

Do not regress them to the same photograph.

### Navigation

Active files:

```text
components/site/SiteNav.tsx
components/site/SiteFooter.tsx
components/site/site-chrome.module.css
data/site.ts
```

Desktop navigation:

- Left: Engagement, Wedding, Jewelry.
- Center: image wordmark.
- Right: Diamonds, Custom Design, About.
- Utilities: diamond search/finder, wishlist, bag.

Features:

- Mega menus.
- Featured editorial tiles.
- Hover intent delay.
- Keyboard Escape behavior.
- Active-page styling.
- Scrim.
- Scroll progress.
- Responsive mobile drawer with expandable groups.
- About restored as requested.

Known small bug to fix during polish: `components/site/SiteNav.tsx` renders the featured mega-menu CTA `<em>{activeItem.featured.cta} →</em>` twice. Remove one duplicate after visual confirmation.

Footer includes Shop, Maison, Care, verified brand contact, editorial standards, and service rail. No active newsletter form.

---

## 5. Route map

### Public storefront

| Route | Purpose | Indexing |
|---|---|---|
| `/` | Editorial homepage | index |
| `/about` | Maison, heritage, owner, values | index |
| `/collections` | All product discovery | index |
| `/collections/[category]` | Category listing | index |
| `/products/[slug]` | Product detail, gallery, video, 3D/AR, cart | index unless `comingSoon` |
| `/diamonds` | Filterable diamond finder | index |
| `/custom` | Custom design brief and process | index |
| `/contact` | Contact and appointment inquiry | index |
| `/inquiry` | General inquiry | index |
| `/education` | Fact-first diamond guide | index |
| `/showroom` | Showroom/interactive presentation | index |
| `/pages/faq` | Search- and answer-focused FAQ | index |
| `/pages/shipping` | Shipping policy | index |
| `/pages/returns` | Return policy | index |
| `/pages/warranty` | Warranty and care | index |
| `/pages/editorial-standards` | Authorship, sourcing, correction policy | index |
| `/wishlist` | Local-device wishlist | noindex |
| `/checkout` | Bag checkout/reservation | noindex |
| `/checkout/success` | Server-verified Stripe result | noindex |

Category slugs generated by current route logic:

```text
rings
engagement-rings
wedding-bands
earrings
pendants
bracelets
necklaces
custom-jewelry
```

### Private quotation pages

| Route | Purpose | Access |
|---|---|---|
| `/custom/request/[token]` | Customer status and quote decision | 32-character unguessable public token; noindex |
| `/custom/owner/[token]` | Owner quote/production/shipping workspace | 32-character confidential owner token; noindex |

### APIs

| Route | Methods | Purpose |
|---|---|---|
| `/api/checkout` | POST | Validate cart server-side and create Stripe session or reservation fallback |
| `/api/webhook` | POST | Verify Stripe webhook and notify paid order |
| `/api/inquiry` | POST | Validate and send inquiry through Resend |
| `/api/custom-requests` | POST | Create custom brief, tokens, record, and emails |
| `/api/custom-requests/[token]` | GET, PATCH | Customer view and accept/decline |
| `/api/custom-requests/owner/[token]` | GET, PATCH | Quote, production, shipping |

### Machine-facing routes

```text
/robots.txt
/sitemap.xml
```

---

## 6. Catalog and inventory

### Runtime source of truth

`data/products.ts` is the runtime product catalog. Excel sheets are source/audit inputs; the website does not query them live.

Current counts:

| Metric | Count |
|---|---:|
| Products | 88 |
| Signature source | 13 |
| Lab-grown source | 75 |
| Coming soon | 13 |
| Products with video URL | 28 |
| Rings | 24 |
| Earrings | 22 |
| Pendants | 8 |
| Bracelets | 17 |
| Necklaces | 16 |
| Custom Jewelry placeholder | 1 |

Product source values are:

```ts
"signature" | "lab-grown"
```

PIECUT and antique behavior is represented through product metadata such as `piecut`, `antique`, `diamondOrigin`, and source-level defaults.

### Product fields

`Product` includes:

- identity: `id`, `sku`, `name`, `slug`
- category/source/status
- style and material
- center stone, shape, color/clarity, origin
- carat weight, visual carat, number of stones, gold weight
- certificate number where available
- price and label
- size information
- description
- main image and gallery
- video URL
- metal-aware media sets
- featured and coming-soon flags
- antique/PIECUT metadata

### 18K pricing rule

Supplier lab rows were quoted in 14K. Storefront offers 18K at an exact 15% multiplier:

```ts
export const EIGHTEEN_K_PRICE_MULTIPLIER = 1.15;
```

`asEighteenKRetail()`:

- rounds `price * 1.15`
- replaces `14K` with `18K` in material and description
- retains source constants so source reconciliation remains possible

Do not apply another price increase. Verify source values and this transformation before changing prices.

### Inventory spreadsheets and PDFs

Original sheets presently stored in the repository:

```text
Final jewelstone inventory file.xlsx
JEWELSTONE_Inventory_AI Sizes (2).xlsx
JEWELSTONE_Inventory_US_Sizes (1).xlsx
Jewel_Stone_Lab_Inventory_20pct.xlsx
data/JEWELSTONE_Inventory_US_Sizes.xlsx
data/Jewel_Stone_Unified_Inventory_Media_Audit.xlsx
img/need good photos from Diksha.xlsx
img/need photos from Diksha.xlsx
product image/Piecut jewelry data.xlsx
```

Related PDFs:

```text
CVD ishan USA.pdf
piecut ishan USA.pdf
product image/Piecut Product Data.pdf
```

Inventory audit builder:

```bash
python3 scripts/build-unified-inventory.py
```

Any product detail change must be reconciled against the appropriate original sheet, reflected in `data/products.ts` or `data/cvd-products.ts`, tested, visually checked, and committed with its media mapping.

---

## 7. Media, models, and Git LFS

### Repository size

Approximate current local sizes:

- Whole repository: 11 GB on disk
- `.git`: 4.6 GB
- `public`: 463 MB
- Git LFS tracked objects in current index: 772

`.gitattributes` sends these source trees through Git LFS:

```text
Lab AI jewelry/**
CVD jewelry photography/**
Pie-cut jewelry photo video/**
product image/**
/source-assets/**
/public/models/source/**
/img/**
/hero/**
/logo.jpeg
/*.mp4
```

Do not remove LFS rules and do not recommit raw media as regular Git blobs.

### Current public media

- 1,209 image files
- 34 video files
- 14 model-related files
- 616 files across the three main supplied source-media directories

Source trees:

```text
Lab AI jewelry/
CVD jewelry photography/
Pie-cut jewelry photo video/
product image/
img/
hero/
public/models/source/
```

Web-ready delivery:

```text
public/images/
public/videos/
public/models/
```

Media mapping/audit files:

```text
data/cvd-media-map.json
data/imagery-manifest.json
data/img-media-import.json
data/lab-ai-media-import.json
data/rar-media-import.json
```

### Import pipelines

```text
scripts/import-rar-studio-media.mjs
scripts/import-img-media.mjs
scripts/import-lab-ai-media.mjs
scripts/build-imagery-manifest.mjs
scripts/wire-existing-imagery.py
scripts/normalize-backgrounds.py
scripts/check-product-imagery.mjs
scripts/gen-product-imagery.mjs
```

`data/lab-ai-media-import.json` records 359 supplied AI images representing 13 product families.  
`data/img-media-import.json` records 172 imported images.  
`data/imagery-manifest.json` currently marks 14 product slugs ready through its older generic-image path.

### Current media gap

Run:

```bash
node scripts/check-product-imagery.mjs
```

Current result on July 23:

```text
checked 340 image path(s)
166 MISSING
```

Missing paths mainly affect later made-to-order lab-grown necklaces, fancy rings, pendants, solitaire sizes, high-carat studs, tennis bracelets, and tennis necklaces.

Some products intentionally display coming-soon/placeholder treatment, but 166 missing references are still a real launch gap. Resolve through supplied matching media, corrected manifests, or approved generation. Do not silently publish broken image paths.

`scripts/gen-product-imagery.mjs` can generate missing assets and is resumable, but it may require a paid API or credits. Never run it without checking its provider, cost, existing files, and user permission.

### 3D/AR

`lib/models.ts` maps 11 product slugs to optimized GLB files.

Production files must use:

```text
public/models/*-opt.glb
```

Raw `*-meshy.glb` or source models are build inputs, not web delivery. Optimize/check with:

```bash
node scripts/optimize-models.mjs --check
```

3D/AR product UI:

```text
components/ar/PieceViewer.tsx
components/product/ProductView.tsx
lib/models.ts
```

---

## 8. Product and discovery experience

### Product pages

`components/product/ProductView.tsx` provides:

- Swipe and button gallery navigation.
- Photography-first view.
- Product film when available.
- Optional 3D and native AR tile.
- Per-metal media selection and an honest fallback notice.
- Metal choices.
- Ring sizes or chain lengths.
- Lab-grown color and clarity selection.
- Server-relevant cart option fields.
- Wishlist toggle.
- Product specifications.
- Related pieces.
- Availability language: signature one-of-one versus made-to-order.

Product route statically generates all 88 slugs.

`comingSoon` product pages receive `noindex,follow`.

### Diamonds

`/diamonds` is a filterable client explorer. Filtering supports:

- Shape normalization.
- Color/clarity metadata.
- Origin.
- Antique.
- PIECUT.
- Carat boundaries.
- Shareable query strings.

Related files:

```text
components/diamonds/DiamondsExplorer.tsx
lib/commerce/diamond-filters.ts
tests/diamond-filters.test.ts
```

There is no separate generic `/search` route. The prior false structured-data SearchAction was intentionally removed.

### Collections

Collection pages provide discovery, filters, quick views, category metadata, breadcrumb schema, and ItemList schema. Many navigation style links currently point to a shared category page rather than a dedicated filtered URL; this is acceptable for now but could become a later SEO/UX improvement.

---

## 9. Cart, wishlist, checkout, and payment

### Cart and wishlist

Files:

```text
store/cart.ts
store/wishlist.ts
components/cart/CartDrawer.tsx
components/checkout/CheckoutClient.tsx
```

Behavior:

- Zustand persistence in browser local storage.
- Cart distinguishes variant by slug, metal, size, and grade.
- Signature quantity is capped at one.
- Made-to-order quantity is capped at ten.
- Wishlist stores product IDs locally.
- No account, cross-device sync, or server cart.

### Checkout policy

Files:

```text
app/api/checkout/route.ts
app/api/webhook/route.ts
app/checkout/success/page.tsx
lib/commerce/checkout-policy.ts
lib/stripe.ts
STRIPE_SETUP.md
```

Policy:

- Lab-grown-only cart: Stripe payment when configured.
- Signature or mixed cart: reservation flow by default.
- Missing Stripe configuration: clean reservation fallback.
- `STRIPE_ALLOW_SIGNATURE_CHECKOUT=false` must remain false until durable order storage and atomic inventory reservation exist.
- Server re-resolves products and prices from `data/products.ts`; it does not trust client price/name.
- Hosted Checkout collects billing address, phone, and shipping.
- Current allowed shipping countries: US, CA, GB, AU.
- Currency: USD.
- Payment method: card.
- Stripe success page retrieves and verifies session server-side before showing a paid result or clearing the bag.
- Webhook verifies Stripe signature and handles `checkout.session.completed`.
- Paid-order email uses a Resend idempotency key based on Stripe event ID.

### Payment gaps

Production is not ready to accept all orders yet:

1. No durable order database.
2. No atomic stock reservation for one-of-one pieces.
3. No durable webhook-event ledger; Resend idempotency alone is not enough.
4. No fulfillment/admin dashboard.
5. No refund/cancellation tooling.
6. No taxes, duties, shipping service, insurance-limit, and country rules approved by owner.
7. No live Stripe account configuration in repository.
8. Custom accepted quotations do not create a deposit/payment link.

Do not enable live payments until policies, test-mode release checks, database behavior, and webhook fulfillment are complete.

---

## 10. Custom design and quotation workflow

### Customer request builder

Active files:

```text
app/custom/page.tsx
components/custom/CustomBuilder.tsx
components/custom/custom.module.css
```

Customer can submit:

- 1–6 reference images.
- A single public reference URL.
- Both images and URL.
- Piece type.
- Metal.
- Stone shape/type.
- Natural or lab-grown origin.
- Budget.
- Name, email, phone, and notes.

Validation:

- Up to 6 images.
- Up to 6 MB each.
- Up to 24 MB total.
- Image MIME type or JPEG/PNG/WebP/HEIC/HEIF extension.
- Reference URL must be HTTP or HTTPS and no more than 1,000 characters.

Successful request returns:

- Human reference ID in format `JS-YYYYMMDD-XXXXXX`.
- Private customer status URL.
- Notification configuration state.

### Status machine

```text
awaiting_quote
    ↓ owner sends estimate
quoted
    ├── customer accepts → accepted
    │                       ↓ owner confirms final details/payment
    │                  in_production
    │                       ↓ owner adds shipment
    │                     shipped
    └── customer declines → declined
                              ↓ owner may revise
                            quoted
```

Rules live in `lib/custom-request-types.ts`:

- Owner can quote from `awaiting_quote`, `quoted`, or `declined`.
- Customer can decide only from `quoted`.
- Production can begin only from `accepted`.
- Shipping can be added only from `in_production`.

### Private customer page

Files:

```text
app/custom/request/[token]/page.tsx
components/custom/CustomRequestStatus.tsx
components/custom/request-status.module.css
```

Features:

- Fetches private request.
- Auto-refreshes every 30 seconds.
- Shows progression and submitted choices.
- Shows estimate, production time, note, and validity.
- Accept or decline with optional note.
- Makes clear that acceptance is not a card charge.
- Shows production status.
- Shows carrier, tracking number, and tracking link.
- Hides owner token, raw email, and phone.

### Private owner workspace

Files:

```text
app/custom/owner/[token]/page.tsx
components/custom/CustomQuoteManager.tsx
```

Features:

- Shows customer contact and design brief.
- Identifies reference attachments and reference URL.
- Creates or revises quote.
- Captures price/range, lead time, expiration, and note.
- Shows customer decision.
- Marks accepted request in production.
- Adds carrier, tracking number, and optional tracking URL.

Current authorization is an unguessable passwordless link. It is not a staff login, role system, or auditable dashboard. Treat owner link as confidential.

### Storage

`lib/custom-request-store.ts` behavior:

- Production: Upstash Redis REST is mandatory.
- Supported variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - aliases `KV_REST_API_URL`
  - aliases `KV_REST_API_TOKEN`
- Development without Redis: `.data/custom-requests.json`.
- Local file is mode `0600` and ignored by Git.
- Production fails closed with a service-unavailable response when durable storage is absent.

No local request-record file exists now; test data was cleaned.

### Notifications

`lib/custom-request-notifications.ts` uses Resend:

- Owner and customer confirmation on request.
- Customer quote-ready email.
- Owner and customer decision email.
- Customer production email.
- Customer shipping email.

Reference images are sent to owner as original-request email attachments. Database stores only file name, size, and MIME type. It does **not** persist image bytes.

Important risk: if email is missing, fails, or is later deleted, source reference images cannot be recovered from request storage. Production should upload references to private object storage, store stable private object IDs, and use expiring authenticated previews.

### Remaining custom-system work

1. Authenticated owner/staff dashboard and request list.
2. Role and audit history.
3. Persistent private reference-image object storage.
4. Deposit or full-payment flow after accepted quote.
5. Written custom/made-to-order cancellation, revision, and refund rules.
6. Customer account or robust recovery path for lost private link.
7. Rate limiting, abuse monitoring, retention/deletion policy, and malware-safe upload handling.
8. Production Resend and Redis configuration.

Setup details: `CUSTOM_QUOTATION_SETUP.md`.

---

## 11. Inquiry and appointments

Live path:

```text
app/contact/page.tsx
app/inquiry/page.tsx
components/pages/EnquiryForm.tsx
app/api/inquiry/route.ts
```

API behavior:

- Validates name, email, phone, message, and context.
- Uses a honeypot field.
- Supports multipart attachment validation at API level.
- Sends through Resend.
- Returns 503 with direct-contact guidance when Resend is not configured.

Current `EnquiryForm.tsx` submits JSON and does not render image upload controls. Attachment handling exists in the API for other/multipart clients but is not exposed by this generic form.

Legacy components:

```text
components/ContactForm.tsx
components/InquiryCart.tsx
components/Footer.tsx
components/NewsletterPopup.tsx
```

These are not active site paths. Do not confuse their local-only behavior with current production inquiry flow.

---

## 12. SEO and AEO

### Implemented technical SEO

Files:

```text
app/layout.tsx
app/robots.ts
app/sitemap.ts
app/products/[slug]/page.tsx
app/collections/page.tsx
app/collections/[category]/page.tsx
lib/seo/schema.ts
components/seo/JsonLd.tsx
```

Implemented:

- Canonical site URL from `NEXT_PUBLIC_SITE_URL` or `SITE_URL`, fallback `https://thejewelstone.com`.
- Global title template and descriptions.
- Absolute Open Graph and Twitter images.
- Canonicals.
- Optional Google verification token.
- Product metadata.
- `noindex` on coming-soon, checkout, wishlist, and private quotation pages.
- Sitemap for public static routes, categories, and active products.
- Robots blocks API, checkout, owner tokens, and customer status tokens.
- Breadcrumb schema.
- Product schema.
- ItemList schema.
- FAQ schema.
- Article schema.
- Person schema.
- JewelryStore/Organization and WebSite schema.

Structured business data uses verified brand fields, legal name, address, phone, email, knowledge areas, and the visible 14-day US return policy.

Product schema exposes:

- visible price
- USD
- new condition
- availability
- seller
- material
- carat/cut/clarity properties
- 3DModel `MediaObject` when available

No fake `/search` SearchAction remains.

### Implemented AEO/content trust

`/education` is now answer-first and contains:

- 4 Cs definitions.
- Which C usually matters most.
- Natural versus lab-grown comparison table.
- Shape guidance.
- Six-step selection process.
- Owner byline.
- GIA primary-source links.
- Article and FAQ structured data.

`/pages/faq` answers:

- certification
- PIECUT
- natural versus lab-grown
- one-of-one
- 3D/AR
- sizing and metals
- custom quotation
- payment and shipping

`/pages/editorial-standards` documents:

- authorship
- product-information sources
- pricing and availability
- corrections
- commercial disclosure

`/about` visibly identifies Ishan Vaghani and includes Person schema.

AEO decision: do not add fake “AI SEO” schema or make unsupported claims. Crawlable, fact-first, attributable content plus accurate structured data is the base.

### Still required outside code

No code change can guarantee top ranking. Launch work still includes:

1. Verify production domain and HTTPS.
2. Google Search Console property and sitemap submission.
3. Bing Webmaster Tools and sitemap submission.
4. Google Business Profile completion and consistent NAP.
5. Google Merchant Center/product feed if eligible.
6. GA4 or approved privacy-conscious analytics.
7. Consent behavior where legally required.
8. Privacy policy and terms.
9. Real customer-review process and valid review markup only after reviews exist.
10. High-quality backlinks and local citations.
11. Ongoing educational/editorial publishing.
12. Core Web Vitals and field-performance monitoring.
13. Product feed availability and inventory synchronization.

Do not promise “rank #1.”

---

## 13. Environment configuration

Only `.env.local.example` exists. There is no `.env.local`, so Stripe, Resend, and production Redis are not active in this checkout.

| Variable | Purpose | Required for |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical/checkout/email origin | production |
| `SITE_URL` | Server-side alias for canonical origin | optional alias |
| `GOOGLE_SITE_VERIFICATION` | Search Console meta verification | SEO launch |
| `STRIPE_SECRET_KEY` | Server Stripe client | hosted payment |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | paid fulfillment |
| `RESEND_API_KEY` | Inquiry/order/custom email | notifications |
| `ORDER_TO_EMAIL` | Paid-order recipient | paid fulfillment |
| `INQUIRY_TO_EMAIL` | Inquiry/custom owner recipient | inquiries/quotes |
| `INQUIRY_FROM_EMAIL` | Verified sender | email delivery |
| `UPSTASH_REDIS_REST_URL` | Durable quotation store | production custom flow |
| `UPSTASH_REDIS_REST_TOKEN` | Durable quotation store credential | production custom flow |
| `KV_REST_API_URL` | Upstash/Vercel KV URL alias | optional alias |
| `KV_REST_API_TOKEN` | Upstash/Vercel KV token alias | optional alias |
| `STRIPE_ALLOW_SIGNATURE_CHECKOUT` | Dangerous one-of-one override | keep false |
| `STRIPE_AUTOMATIC_TAX` | Stripe Tax | owner/legal decision |
| `STRIPE_ALLOW_PROMOTION_CODES` | Promotion codes | owner decision |

Never paste real values into this repository. Configure them in:

- local ignored `.env.local` for local test mode only
- hosting provider encrypted environment settings for preview/production

The hosted Stripe flow does not currently need a publishable key because Stripe hosts the payment form.

---

## 14. Current Git worktree: protect this work

`main` and `origin/main` both point to `1122291`. Ahead/behind is `0/0`. Everything below is local work layered on top.

### Modified tracked files

```text
.env.local.example
.gitignore
app/about/page.tsx
app/checkout/success/page.tsx
app/collections/[category]/page.tsx
app/collections/page.tsx
app/custom/page.tsx
app/education/page.tsx
app/globals.css
app/layout.tsx
app/pages/faq/page.tsx
app/products/[slug]/page.tsx
app/robots.ts
app/sitemap.ts
components/custom/CustomBuilder.tsx
components/custom/custom.module.css
components/home/BrandHome.tsx
components/home/CinematicMotion.tsx
components/home/brand-home.module.css
components/pages/ArticlePage.tsx
components/pages/article.module.css
components/site/SiteFooter.tsx
components/site/SiteNav.tsx
components/site/site-chrome.module.css
lib/seo/schema.ts
package-lock.json
package.json
```

Tracked diff before this handoff:

```text
27 files changed
912 insertions
211 deletions
```

### Untracked implementation files

```text
CUSTOM_QUOTATION_SETUP.md
app/api/custom-requests/
app/custom/owner/
app/custom/request/
app/pages/editorial-standards/
components/custom/CustomQuoteManager.tsx
components/custom/CustomRequestStatus.tsx
components/custom/request-status.module.css
lib/custom-request-notifications.ts
lib/custom-request-store.ts
lib/custom-request-types.ts
tests/custom-request-flow.test.ts
tests/seo-schema.test.ts
CLAUDE_HANDOFF.md
```

### Untracked user image assets

```text
Lab AI jewelry/ChatGPT Image Jul 16, 2026, 10_44_59 PM.png
Lab AI jewelry/ChatGPT Image Jul 16, 2026, 10_45_07 PM.png
Lab AI jewelry/ChatGPT Image Jul 16, 2026, 10_45_24 PM.png
```

These are covered by the LFS path rule but have not been added. Inspect and map them before committing; do not discard them.

### Stash

```text
stash@{0}: On main: codex-pause: category clarity + luxury story typography motion (2026-07-22)
```

Do not apply it on top of current changes without first comparing its patch. It may duplicate or conflict with already restored work.

---

## 15. Validation status

Validated July 23, 2026:

```bash
npm test
# 28 tests, 28 passed, 0 failed

npx tsc --noEmit
# passed

npm run lint
# passed, no warnings
```

Test coverage currently includes:

- checkout source policy
- signature checkout override
- environment flag parsing
- canonical checkout origin validation
- production URL requirement
- custom-request state transitions
- public request redaction
- email masking
- diamond filter normalization and matching
- gallery wrap/swipe logic
- intro session state and reduced-motion duration
- organization schema facts
- WebSite schema search accuracy
- Product schema price/seller/3D data
- FAQ schema output

A production build passed after the SEO/AEO work before the final absolute-metadata URL adjustments. Those final adjustments subsequently passed typecheck, lint, tests, and route checks. Run one final clean production build before deployment, with dev server stopped.

Current dev server:

```text
http://localhost:3000
PID observed on July 23: 87789
listening on 0.0.0.0:3000
```

Live checks returned HTTP 200 for:

```text
/
/custom
/products/heart-halo-ring
/sitemap.xml
```

PID and server status are transient. Confirm before relying on them. No phone tunnel is currently documented as active.

---

## 16. Known technical debt and visible flaws

### P0 — blocks safe production launch

1. Configure production host, domain, HTTPS, and encrypted variables.
2. Add durable order database and webhook-event records.
3. Add atomic reservation for one-of-one inventory.
4. Keep signature direct checkout disabled until item 3 exists.
5. Configure Upstash Redis and Resend for custom requests.
6. Persist private custom reference images outside email.
7. Define payment/deposit flow after custom quote acceptance.
8. Approve tax, shipping, duties, insurance, returns, custom cancellation, privacy, and terms.
9. Test Stripe end-to-end in test mode.
10. Complete media paths so public products never reference missing images.

### P1 — needed for complete operations

1. Owner authentication and quotation/order dashboard.
2. Staff roles and audit log.
3. Customer request-link recovery.
4. Inventory sync from source sheets instead of manual TypeScript maintenance.
5. Inquiry/request rate limiting and operational abuse controls.
6. Analytics, Search Console, Bing, Merchant Center, and Business Profile.
7. Full responsive visual audit at phone, tablet, laptop, and large desktop sizes.
8. Accessibility audit: keyboard, focus, contrast, motion, forms, and 3D fallback.
9. Performance audit on real mobile network.
10. Real monitoring for API, webhook, email, media, and checkout failures.

### P2 — polish and cleanup

1. Remove duplicate featured CTA `<em>` in `SiteNav.tsx`.
2. Consolidate legacy global dark-theme declarations that are later overridden by the current porcelain theme.
3. Audit unused legacy components before removal; do not bulk-delete without reference search.
4. Decide whether navigation style links need dedicated filtered URLs.
5. Expose inquiry image uploads if desired; API already supports multipart attachments.
6. Review all 88 product page copy/specifications against source sheets.
7. Review the three untracked ChatGPT images and either map, archive, or intentionally omit them.
8. Check About, Custom, homepage, footer, and product claims for consistency before launch.

---

## 17. Recommended continuation sequence

### Phase A — freeze and preserve current work

1. Read this handoff and current changed files.
2. Re-run status and validation.
3. Visually inspect current local site.
4. Fix only confirmed regressions such as duplicate nav CTA.
5. Ask user whether to commit/push the completed local batch.
6. If approved, make a clear commit that includes implementation, tests, setup docs, and deliberately selected user images.
7. Confirm Git LFS upload completes before declaring GitHub current.

### Phase B — production infrastructure

1. Choose hosting target, likely Vercel/Node.
2. Set production domain and `NEXT_PUBLIC_SITE_URL`.
3. Configure Upstash Redis.
4. Configure Resend with verified sender domain.
5. Configure Stripe test mode and webhook.
6. Add durable orders and webhook-event records.
7. Add atomic signature inventory reservation.

### Phase C — close customer journeys

1. Add owner dashboard/auth.
2. Add custom-reference object storage.
3. Add custom deposit/payment link after owner-confirmed accepted quote.
4. Add payment, production, refund, cancellation, and fulfillment records.
5. Add request and order recovery paths.
6. Test every state and failure mode.

### Phase D — inventory and media completion

1. Reconcile all runtime details with original inventory sheets.
2. Resolve 166 missing media references.
3. Optimize images/video/models.
4. Check LFS and public delivery boundaries.
5. Run full product-by-product QA.

### Phase E — visual, accessibility, and performance QA

1. Capture every route at representative widths.
2. Check typography hierarchy and alignment.
3. Check nav, mega menus, mobile menu, cart, wishlist, filters, galleries, forms, custom status, owner quote, checkout, and private links.
4. Test reduced motion.
5. Run Lighthouse and accessibility tooling.
6. Test iPhone Safari and Android Chrome, especially native AR.
7. Test slow network and missing-media fallbacks.

### Phase F — launch and SEO/AEO operations

1. Add privacy and terms.
2. Complete Search Console, Bing, Merchant Center, Business Profile, and analytics.
3. Submit sitemap.
4. Validate structured data with live production URLs.
5. Monitor indexing and Core Web Vitals.
6. Build local authority through verified citations, product feeds, useful education, and legitimate reviews.

---

## 18. Safe operating notes

### Removable-drive workspace

Project lives on `/Volumes/ai-hub`, not the Mac internal disk. If volume is disconnected:

- do not create a second diverging copy without an explicit sync plan
- treat GitHub as last pushed state only, not current local state
- current uncommitted work will not exist on GitHub

### Browser and account preference

If browser login is unavoidable, user requested Chrome profile `viralfaceless25`, visually identified by dark background and green “viral” branding. Avoid login when possible. Never use another personal profile. Do not create accounts, purchases, live-mode changes, or paid API usage without user authority.

### Local viewing

For Mac-only development:

```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

LAN access requires same network and firewall allowance. Public phone access requires an approved tunnel or deployment. User previously asked to close the website server and phone tunnel, then later restarted localhost; verify current desired state before creating a new public tunnel.

### Build/dev collision

Do not run production build while dev server uses `.next`. Recommended:

```bash
# stop dev server first
npm run build
npm run dev -- --hostname 0.0.0.0 --port 3000
```

If `.next` becomes inconsistent, stop all Next processes and remove only `/Volumes/ai-hub/jewel-stone/.next`, then rebuild/restart. Never remove broad workspace directories.

---

## 19. Files Claude should read first

In order:

```text
AGENTS.md
package.json
app/layout.tsx
app/page.tsx
components/home/BrandHome.tsx
components/home/CinematicMotion.tsx
components/home/brand-home.module.css
components/site/SiteNav.tsx
components/site/SiteFooter.tsx
data/site.ts
data/products.ts
data/cvd-products.ts
components/product/ProductView.tsx
components/custom/CustomBuilder.tsx
lib/custom-request-types.ts
lib/custom-request-store.ts
lib/custom-request-notifications.ts
app/api/custom-requests/route.ts
app/api/custom-requests/[token]/route.ts
app/api/custom-requests/owner/[token]/route.ts
components/custom/CustomRequestStatus.tsx
components/custom/CustomQuoteManager.tsx
lib/commerce/checkout-policy.ts
app/api/checkout/route.ts
app/api/webhook/route.ts
lib/seo/schema.ts
app/sitemap.ts
app/robots.ts
STRIPE_SETUP.md
CUSTOM_QUOTATION_SETUP.md
```

Use historical `CODEX_*_SPEC.md`, `IMAGE_GEN_*_SPEC.md`, and `docs/superpowers/` only to understand earlier decisions. Current code and this handoff take priority where they differ.

---

## 20. Definition of done

Website is not “complete” merely because pages render. Complete production state means:

- Current work committed, pushed, and LFS upload verified.
- Production deploy stable on canonical domain.
- All public routes work without broken media or console/server errors.
- Product details match approved inventory sources.
- Stripe test and live flows approved.
- Signature inventory cannot be double-sold.
- Orders and webhook events persist durably.
- Inquiry and custom notifications deliver reliably.
- Custom reference images persist privately.
- Customer can request, receive, accept/reject, pay, follow production, and track shipment.
- Owner can securely manage requests, quotations, payments, production, inventory, and fulfillment.
- Privacy, terms, shipping, returns, warranty, and custom policies are owner-approved.
- Mobile, accessibility, performance, and cross-browser QA pass.
- Search engines receive canonical URLs, sitemap, accurate structured data, and crawlable answer content.
- Monitoring and operational recovery exist.

Until then, describe the site as a validated advanced local build with major commerce and quotation workflows implemented, not as a finished production store.

