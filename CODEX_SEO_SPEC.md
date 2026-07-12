# CODEX TASK — SEO Foundation (JewelStone)

**Context:** JewelStone is a Next.js 14 (App Router) luxury lab-grown + natural diamond jewelry storefront at `/Volumes/ai-hub/jewel-stone`. We are doing a big homepage makeover; this task is the SEO infrastructure layer that is needed regardless of the visual redesign. **Do NOT touch any visual components or `app/page.tsx` section markup** — Claude is redesigning those in parallel. Stay in the metadata/schema/config layer only.

## Definition of done
`npx tsc --noEmit` clean. No visual/layout changes. Do NOT run the dev server or take screenshots (Claude verifies).

## Business facts to encode (from the client)
- Brand: **Jewel Stone** — NYC Diamond District. Lab-grown + natural diamonds, GIA/IGI certified.
- **Specialty / differentiator: PIECUT pieces (rare, one-of-a-kind) and antique diamond pieces in both lab-grown and natural.**
- Diamond attributes they emphasize: Clarity **IF, FL**; Shapes **Cushion Brilliant, Princess, Straight Baguette, Taper Baguette, Half Moon**.
- Services: custom/bespoke design.

## Tasks
1. **`lib/seo/schema.ts`** — typed JSON-LD builders returning plain objects:
   - `organizationSchema()` → `Organization` / `JewelryStore` (name, url, logo `/logo-transparent.png`, NYC Diamond District address placeholder, sameAs socials placeholder).
   - `websiteSchema()` → `WebSite` with `SearchAction` pointing at `/search?q={query}`.
   - `productSchema(product)` → `Product` (name, image, description, brand Jewel Stone, offers with price + priceCurrency USD + availability, material, plus `additionalProperty` for cut/clarity/carat).
   - `breadcrumbSchema(items)` and `reviewSchema(...)` / `aggregateRatingSchema(...)` helpers.
   Keep all builders pure and typed against `data/products.ts` types.
2. **`components/seo/JsonLd.tsx`** — tiny client-safe component that renders `<script type="application/ld+json">` from a passed object (use `dangerouslySetInnerHTML` with `JSON.stringify`).
3. **`app/layout.tsx`** — enrich the root `metadata` export ONLY (do not change body markup): `metadataBase`, title template `%s | Jewel Stone`, rich description featuring PIECUT + antique + lab-grown/natural, keywords, `openGraph`, `twitter` (summary_large_image), `robots`, canonical via `alternates`. Inject `organizationSchema()` + `websiteSchema()` JSON-LD via `<JsonLd>` at the end of `<body>`.
4. **`app/sitemap.ts`** — dynamic sitemap: home, key collection routes, and one entry per product slug from `data/products.ts`.
5. **`app/robots.ts`** — allow all, reference the sitemap.
6. Use `https://www.jewelstone.com` as the placeholder production URL in a single `SITE_URL` const (in `lib/seo/schema.ts`) so it can be swapped later.

Report back the file list changed and confirm `npx tsc --noEmit` is clean.
