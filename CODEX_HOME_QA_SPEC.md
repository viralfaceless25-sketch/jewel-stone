# CODEX SPEC — Homepage light QA fixes (diamond visibility + bento imagery)

The editorial light homepage is built and themed, but two things read poorly on the porcelain ground. Fix both, keep everything else.

## 1. Hero 3D diamond is INVISIBLE on the light background (critical)
A refractive diamond over white porcelain washes out — it needs contrast to read. Make the hero diamond (the persistent R3F diamond shown in the hero gilt-halo aperture — `components/three/ScrollScene.tsx` / `BrilliantDiamond.tsx` / `ScrollSceneMount.tsx`, framed by `FlexHero`'s `.hero-diamond-aperture`) clearly visible and brilliant on light by doing ALL of:
- Put a subtle **darker backdrop behind the stone**: inside the hero halo, a soft radial "spotlight" plinth a few shades deeper than porcelain (warm greige→champagne, e.g. `#E9DCC3`→`#D8C7A6`) with a soft vignette, so the diamond's facets/edges have something to sit against. Add a soft contact **shadow + caustic** beneath it.
- Increase **edge/facet contrast**: stronger Fresnel rim, a couple of darker environment reflections (not an all-bright env) so crown facets show; keep gilt + a diamond-ice (#79B3CC) rim so it throws visible fire.
- Boost **sparkle/bloom** on highlights and add subtle drei `<Sparkles>` (warm-white/ice) so it glints.
- The stone should read as a crisp, sparkling brilliant-cut diamond clearly visible against the warm hero — NOT a faint blob. Verify at the hero scroll position. Keep it performant + reduced-motion safe. The persistent scroll-driven travel/rotation stays.

## 2. Editorial model bento looks empty/pale
In `components/HomeEditorial.tsx` (EditorialBento) the tiles read as blank pale boxes.
- Wire **real images** from `public/images/` where they exist (signature product photos in `public/images/products/<slug>/`, and any model/review photos used by `Reviews`). Use `object-cover` for the model/lifestyle bento tiles (full-bleed art-directed) but keep PRODUCT plates `object-contain` + padded (framed, not zoomed).
- For tiles with no real photo, use a richer warm treatment (champagne→gilt gradient + a centered ◆ or piece silhouette + caption) so they read as intentional editorial tiles, not empty boxes. NO stock/fabricated photos.
- Ensure captions/labels are legible (ink or white-on-scrim as appropriate) and the bento has clear visual interest.

## 3. General light QA on the homepage
- Scan all homepage sections for any faint/low-contrast text on porcelain, empty-looking panels, or washed-out imagery; fix contrast (use ink `#211810` for body, gilt for accents).
- Confirm the framed product images in the collection row read well (they use `ProductCard`).

## Acceptance
- Hero diamond is clearly visible, crisp, sparkling on the light ground.
- Bento tiles show real photos or rich intentional placeholders — no blank boxes.
- No faint/low-contrast text anywhere on the homepage.
- `npm run build` passes; reduced-motion respected. Report changed files, STOP.
