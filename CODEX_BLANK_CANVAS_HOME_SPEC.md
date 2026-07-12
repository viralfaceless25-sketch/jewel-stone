# CODEX SPEC — BLANK CANVAS homepage (build fresh, discard legacy)

The homepage has accumulated ~6 re-themes patched onto one tangled motion system (`HomepageMotion.tsx`, `.stack-panel` sticky-stacking, overlapping pins) — the result: off animations, broken/missed scroll reveals, incoherent layout. **Rebuild the homepage from a blank canvas.** Do NOT reuse the old homepage sections or motion. Keep ONLY: product data (`data/products.ts`, `data/site.ts`), the real ring GLB (`public/models/heart-halo-ring-opt.glb`), the Obsidian tokens/fonts, and routes. Read `~/.codex/skills/awwwards-3d/SKILL.md` first — follow its philosophy (lerp everything, ACES, env maps, restraint).

## Rules
- **Fresh components** in `components/home/` (e.g. `HeroV2.tsx`, `MarqueeV2.tsx`, `CollectionV2.tsx`, `EditorialV2.tsx`, `VaultV2.tsx`, `TrustV2.tsx`, `FooterV2` if needed). New `app/page.tsx` composes ONLY these.
- **Delete the tangle from the homepage**: remove `HomepageMotion`, `.stack-panel` wrappers, and the old section components (`WelcomeStory`, `Showcase3D`, `FeaturedCarousel`, `RareVault`, `RarePieceStory`, `CraftStories`, `Reviews`, `TrustSection`, `HomeEditorial`, `FlexHero`) from the homepage composition. (Leave the files on disk if other routes import them, but the homepage must not use them.)
- **ONE motion system**, simple and reliable:
  - Lenis smooth scroll (global) once.
  - GSAP ScrollTrigger for: (a) ONE short pinned hero (optional, ≤1 viewport), (b) reveal-on-enter for every section via a single reusable `<Reveal>` (IntersectionObserver OR one ScrollTrigger batch) — fade+rise, staggered children. NO overlapping pins, NO sticky-stacking, NO section that fails to reveal.
  - Every section MUST reliably reveal when scrolled into view. Test by scrolling top→bottom.
  - Respect `prefers-reduced-motion` (everything visible, no motion).

## Layout (Obsidian Atelier, coherent + premium)
Floating rounded viewport over the fixed dark backdrop. Sections, top→bottom:
1. **Hero** — the real ring GLB (drei `useGLTF('/models/heart-halo-ring-opt.glb')`, ACES + RoomEnvironment + ContactShadows + platinum rim + slow lerped rotate) as the cinematic focal point; bold Space Grotesk headline; one metal CTA + a ghost CTA; small stat row. Balanced with the ring — don't crowd.
2. **Marquee / trust strip** — thin, refined.
3. **Signature collection** — clean responsive grid of real products (framed object-contain images on charcoal glass tiles, platinum hairline, refined hover). Real names/prices.
4. **Editorial split** — one large piece (Emerald-Cut Cascade) + copy, properly framed.
5. **The Vault** — one dark editorial band, "Eleven pieces. Never repeated."
6. **Reviews** — 3 refined testimonials.
7. **Trust bar** — thin platinum-hairline row.
8. **Footer** — real brand facts.

Type: tight bold Space Grotesk display, small tracked-uppercase labels, strong hierarchy, generous negative space. Signal-red `#E5482F` only as a tiny accent. Framed imagery everywhere (never zoomed).

## Acceptance
- Homepage is built from FRESH components; old HomepageMotion/stack-panel/section soup NOT used on the homepage.
- Scroll top→bottom: EVERY section reveals smoothly and on time; nothing stuck/missed; animation feels intentional and cohesive (not off).
- Real ring GLB is the hero; real products/prices throughout; framed images.
- `npm run build` passes; 60fps; reduced-motion safe. Report changed/added files, STOP.
