# CODEX SPEC — All remaining pages re-skin (Liquid Mercury / Aurora)

**Prerequisite:** `CODEX_THEME_SPEC.md` + `CODEX_NAV_FOOTER_SPEC.md` applied.

**Goal:** Bring every remaining route into the Liquid Mercury / Aurora language, matching the approved homepage concept. **Preserve all content, product data, copy, forms, filters, SEO, and routes.** This is visual + motion, not information architecture. Apply the shared kit consistently: charcoal ground + aurora background (already global), `.glass` panels, `var(--hair)` chrome hairlines, serif display headings with `.chrome-text` where it's a hero, aurora periwinkle (`#7B8CFF`) as the single accent, tabular-nums prices, `.reveal` scroll animations (stagger 80ms), GSAP ScrollTrigger parallax on hero media, `prefers-reduced-motion` honored everywhere.

Reusable pattern for every page: a slim page-hero (eyebrow + serif title + one-line intro over the aurora), then content in glass sections separated by hairlines.

## Catalog / listing
**`app/collections/page.tsx` + `CollectionCard.tsx`** — collections grid as glass cards with aurora hover glow + lift, category label + serif title + count. Keep all categories & links.
**`app/collections/[category]/page.tsx` + `ProductGridClient.tsx` + `CollectionFilterClient.tsx`** — product grid uses the homepage `.card` style (glass, hairline, chrome price, "Add +" on hover). Restyle the filter/sort UI to dark glass with aurora active states. Keep all filter logic, sorting, and both product sources (signature + lab-grown). Lab-grown items keep the existing "Coming Soon" placeholder.

## Product detail
**`app/products/[slug]/page.tsx` + `ProductQuickView.tsx` + `ProductCustomizer.tsx` + `Turntable3D.tsx`** — gallery on a dark glass stage with aurora radial glow + hairline frame; keep the 3D turntable/drag. Details column: serif product name, tabular-nums price, size/spec info, chrome hairline spec rows. Buttons use `.aurora-btn` (primary) + ghost. Keep customizer options, wishlist add, quick-view, and all real product fields (priceLabel, sizeInfo, source, certification). Restyle `Accordion.tsx` (specs/shipping/returns) to dark hairline rows.

## Editorial / info
**`app/diamonds/page.tsx`** — the 4Cs / diamond education; restyle to editorial glass sections, aurora accent diagrams, keep all copy and any interactive diamond viewer.
**`app/education/page.tsx` + `components/education/*`** — keep all articles/guides; restyle cards + article layout to glass + serif headings.
**`app/about/page.tsx`** — brand story; editorial split layouts (glass visual + serif copy), keep founder facts (Ishan Vaghani, NYC Diamond District) from `data/site.ts`.
**`app/showroom/page.tsx` + `components/showroom/*`** — the showroom/3D scene; keep the R3F scene, reframe UI chrome-on-dark, aurora lighting accents.
**`app/custom/page.tsx` + `CustomDesignForm.tsx`** — the bespoke service; restyle steps + form to dark glass, aurora progress/active states. Keep all form fields, the CODEX_CUSTOM_SPEC behavior, and submission logic.

## Forms / utility
**`app/contact/page.tsx` + `ContactForm.tsx`** — dark glass form card, aurora focus rings, chrome labels. Keep all fields, validation, brand contact facts.
**`app/inquiry/page.tsx` + `InquiryCart.tsx`** — the inquiry cart; restyle to dark glass, chrome hairlines, aurora CTA. Keep all cart/inquiry logic intact (this is the pre-checkout system; do not replace it — Phase 2 handles real checkout).
**`app/wishlist/page.tsx` + `WishlistClient.tsx`** — wishlist grid in `.card` style, aurora empty-state. Keep zustand persistence.
**`app/pages/faq|returns|shipping|warranty/page.tsx`** — legal/info pages: restyle to a clean readable dark editorial layout (serif headings, `.glass` content column ~65ch, hairline dividers, aurora links). Keep ALL policy text verbatim.

## Cross-cutting components to restyle
`SectionHeader.tsx`, `SectionReveal.tsx`, `Reveal.tsx`, `Buttons.tsx`, `Accordion.tsx`, `ServiceCard.tsx`, `AppointmentCTA.tsx`, `PressStrip.tsx`, `TrustSection.tsx`, `NewsletterPopup.tsx`, `ReviewsSection.tsx`, `ThemeBackground.tsx`, `AmbientBackground.tsx` — ensure each uses the new tokens/glass and no light-surface remnants. `NewsletterPopup` → dark glass modal, aurora CTA. `Buttons.tsx` → primary = `.aurora-btn`, secondary = ghost/hairline.

## SEO / meta
Do not change `robots.ts`, `sitemap.ts`, metadata, or structured data content. If any theme-color meta exists, update `theme-color` to `#0C0E10`.

## Acceptance criteria
- Every route (`/`, `/collections`, `/collections/[category]`, `/products/[slug]`, `/diamonds`, `/education`, `/about`, `/showroom`, `/custom`, `/contact`, `/inquiry`, `/wishlist`, `/pages/*`) renders fully in the new theme, visually consistent with the homepage.
- All content, copy, prices, product data, filters, forms, 3D interactions, wishlist/inquiry logic, and SEO preserved. No lorem, nothing removed.
- No dark-on-dark / light-on-light anywhere. Accent is aurora periwinkle throughout.
- `npm run build` passes (static export); no console errors on any route.
- Reduced-motion respected on every page.
