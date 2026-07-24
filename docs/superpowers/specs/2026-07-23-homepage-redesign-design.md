# Jewel Stone — Homepage Redesign Spec

**Date:** 2026-07-23
**Status:** Approved by owner (mockup v3 locked in browser session)
**Mockup reference:** scratchpad `homepage-v3.html` (session-local)

## Approved design system

### Fonts
- Display: **Marcellus** (single weight 400) — `@fontsource/marcellus`
- Body/utility: **Figtree** (variable) — `@fontsource-variable/figtree`
- Replaces Bodoni Moda + Inter. Self-hosted only; no remote font requests.

### Type scale (from approved specimen)
| Role | Face | Size | Notes |
|---|---|---|---|
| H1 display | Marcellus | clamp(44px, 5.2vw, 76px) | line-height 1.05, flush left/center — **no staggered indents** |
| H2 section | Marcellus | clamp(32px, 4.2vw, 48px) | line-height 1.08 |
| Subheading | Figtree 500 | 16–19px | |
| Body | Figtree 300 | 15–16.5px | line-height ~1.7 |
| Caption/label | Figtree 500–600 | 10.5–11px | letter-spacing .2–.32em, uppercase |

Rule from owner: heading bold+biggest, subheading smaller, body smaller. Hierarchy via scale — Marcellus has one weight.

### Palette (existing house system, unchanged)
Porcelain `--js-porcelain`, card, ink, ink-soft, line, gold/champagne accents. Dark band `#131216`-family for PIECUT + cinematic sections. New: rose accent token for legacy branding section.

### Design rules (learned during mockup rounds — do not violate)
- No text overlapping images or text; no negative-margin overlap tricks.
- No ghost/outlined numerals.
- Flat, disciplined grids. Luxurious = clean + calm, not clever.
- Full-bleed hero, headline flush, natural wrap.
- Mobile-first responsive at every section.

## Three Worlds (canonical categories)
`natural` · `natural-piecut` · `lab-grown` — new `diamondWorld` field on Product.
Default derivation until owner reassigns per product: `piecut: true` → natural-piecut; `source: "signature"` → natural; `source: "lab-grown"` → lab-grown.
World filter + sort UI appears on homepage (pills linking into collections) and later across collection pages (world filter/sort row below existing category pills).

## Homepage section order (owner-specified)
1. **Hero slideshow** — 3 slides: image (CTA) / video / image (CTA). Crossfade transition (fade in/out), reduced-motion = static first slide. Mid slide video: custom jewelry making process film (Veo/Flow generation prompt supplied to owner; placeholder = `/videos/hero-v3.mp4` until owner supplies final).
2. **Three Worlds** — locked v3 design: centered header "Natural. Natural PIECUT. Lab Grown.", Natural row (img left / text right), full-bleed dark PIECUT band (text left / macro right), Lab Grown row (text left / img right), spec label rows, world pills + sort hint linking to /collections.
3. **House Selection in Motion** — 5 videos, premium asymmetric layout: main collection film `/videos/hero-v3.mp4` + bracelet (`gallery-bracelet.mp4` or cvd tennis bracelet product film), necklace (cvd-tennis-necklace film), ring (cvd round solitaire halo or heart-halo film), earring (cvd studs or halo stud film). Black-background product films preferred. In-view play/pause. Luxury copy.
4. **New Arrivals** (replaces earrings editorial) — daily rotation: deterministic pick seeded by UTC date, N pieces per world across all three worlds; page `revalidate = 86400` so the set changes every 24h.
5. **Family legacy** — text-only story (no image), longer narrative, oversized rose-tone brand typographic treatment, strong contrast with neighbors.
6. **Book an Appointment** — address, hours, appointment CTA.
7. **Footer** — premium redesign: refined typography, columns, verified contact, mini map of 62 W 47th St (no API key — static embed/link), editorial standards link kept.

Removed from homepage: AR try-on promotion → moves to `/custom` page.
Also removed: point-of-view/manifesto section and making-process section fold into tighter narrative (making content lives on /custom; POV content merged into worlds header copy).

## Non-goals (this pass)
- Collections world-filter UI (next pass, after homepage approved in code).
- Nav/About redesign (subsequent tasks in session plan).
- No product data edits beyond `diamondWorld` derivation default.

## Validation
`npm test`, `npx tsc --noEmit`, `npm run lint`, visual pass desktop + mobile on localhost:3000. No broken media paths introduced.
