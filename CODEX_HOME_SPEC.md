# CODEX SPEC — Homepage rebuild (Liquid Mercury / Aurora)

**Prerequisite:** `CODEX_THEME_SPEC.md` applied first (tokens, globals, AuroraBackground, utilities exist).

**Goal:** Rebuild the homepage sections to match the approved concept mockup while keeping ALL existing content, copy, product data, and section order. Do not remove sections. Reuse existing data sources (`data/products.ts`, `data/site.ts`). Motion stack already installed: GSAP + ScrollTrigger, Framer Motion, Lenis, R3F/drei, anime.js.

Homepage file: `app/page.tsx` renders, in order:
FlexHero → HeroSection → WelcomeStory → Showcase3D → FeaturedCarousel → RareVault → RarePieceStory → CraftStories → Reviews → TrustSection.

Keep this order and set. Redesign each component's visual + motion to the new language:

## Global motion setup
- Ensure Lenis smooth scroll is active site-wide (existing `SmoothScroll.tsx`); register GSAP `ScrollTrigger` and integrate with Lenis (`lenis.on('scroll', ScrollTrigger.update)`).
- Standard scroll-reveal: sections translateY(34px)+opacity→0, animate to 0 on enter (use the `.reveal` utility or a `SectionReveal` component — one already exists; reuse it). Stagger children 80ms.
- All motion must honor `prefers-reduced-motion`.

## Section-by-section

**1. FlexHero** — bold JEWEL STONE wordmark entrance. Render the wordmark with `.chrome-text` (liquid-metal gradient). Keep the anime.js entrance but retune: letters rise + settle, subtle chromatic shimmer. Eyebrow "Lab-grown & signature diamonds". Sit over the aurora background (no solid bg).

**2. HeroSection** — full-bleed. Keep the existing collection video (`Hero_video_product_montage_*.mp4`) but overlay a charcoal→transparent gradient scrim (`rgba(8,9,11,..)`) for contrast; headline in serif display, CTA buttons using `.aurora-btn` (filled) + ghost. Add a slow parallax on the video via ScrollTrigger. Add the hero stat row (Signature SKUs / GIA / Lifetime) as in mockup.

**3. WelcomeStory** — brand intro + bench-to-hand journey. Keep GSAP scroll reveal; restyle text to silver/chrome on dark; pin a short scroll sequence if already present. Glass panel treatment on any cards.

**4. Showcase3D** — interactive turntable of the real signature piece. Keep the drag-to-rotate 3D (R3F). Reframe in a glass stage with an aurora radial glow behind it (`radial-gradient(...var(--aurora2)...)`), chrome hairline frame, "◐ Drag to rotate" hint label. Add subtle bloom via existing `@react-three/postprocessing`.

**5. FeaturedCarousel** — featured jewelry. Rebuild cards to the mockup `.card` style: glass, chrome hairline, aurora hover glow, translateY(-8px) hover, category label + serif title + tabular-nums price + "Add +" reveal on hover. Use real featured products from `data/products.ts` (signature source). Keep real photos where they exist; lab-grown items keep their existing "Coming Soon" placeholder.

**6. RareVault (The Piecut Vault)** — 3 rotatable turntables of one-of-a-kind pieces. Keep the 3 R3F turntables. Wrap in the editorial `.vault` glass card layout from mockup: left = copy ("Eleven pieces. Never repeated." / real vault copy), right = rotatable stage(s) with violet aurora glow. Preserve "1 of 1 / when it's gone, it's gone" messaging.

**7. RarePieceStory (Emerald-Cut Cascade)** — editorial split + rotatable. Keep the rotatable piece. Two-column story layout: visual left (glass frame + aurora, real render/photo), copy right (serif heading, muted body). Keep existing story copy about the Emerald-Cut Cascade.

**8. CraftStories** — 3-piece craft-to-customer story. Rebuild as the 3 glass step cards (Designed / At the bench / Made yours) with serif gradient numerals (01/02/03), hover lift. Keep existing craft copy.

**9. Reviews** — models + Google-style reviews. Restyle review cards to glass + chrome hairline, aurora avatar gradient, aurora stars. Keep real review content and rating.

**10. TrustSection** — certification + trust. Rebuild as the 4-cell trust bar (GIA graded / 30-day returns / insured shipping / lifetime service) in one glass strip with chrome dividers. Keep real trust/certification facts.

## Acceptance criteria
- Homepage matches the approved concept's visual language and motion feel.
- All 10 sections present, same order, all real content preserved (no lorem, real prices/names).
- Smooth scroll + ScrollTrigger parallax + scroll-reveal working; reduced-motion respected.
- `npm run build` passes (static export); no console errors.
- Existing 3D interactions (drag turntables) still work.

## Notes
- Do NOT touch checkout/payment (separate phase).
- If a component's current internals are tangled, refactor for clarity but keep the public props/usage in `app/page.tsx` stable.
