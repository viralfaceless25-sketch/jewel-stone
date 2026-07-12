# CODEX SPEC — Homepage editorial layout ("Porcelain, Gilt & Diamond Ice")

Rebuild the homepage into the approved light editorial layout (reference: Adornia/Sapphire/Lumora fashion-jewelry sites + the brand system). The site is already re-themed light. Keep ALL real content, products, prices, and the 3D diamond + motion. Photography-forward, magazine cadence, generous negative space, big Fraunces serif, gilt hairlines, one dark Vault break.

Homepage file `app/page.tsx` order today: FlexHero, HeroSection, WelcomeStory, Showcase3D, FeaturedCarousel, RareVault, RarePieceStory, CraftStories, Reviews, TrustSection (some wrapped in `.stack-panel`). Reorganize + restyle to:

## Target layout (top → bottom)
1. **Hero** — `FlexHero` (already editorial 2-col: eyebrow, big Fraunces headline, lede, CTAs, stat row, right = 3D diamond in a gilt-halo frame). Verify glow + that the diamond reads bright on porcelain. Drop `HeroSection` (the old full-bleed video) OR fold its video into a later editorial band — do NOT keep two heroes stacked.
2. **Maison statement** — restyle `WelcomeStory` into a single oversized centered editorial line with big negative space (e.g. "A small house of diamond-cutters, making *one-of-a-kind* pieces the world will only see once."). Keep the brand copy; Fraunces, italic gilt emphasis.
3. **Feature hero-product** — restyle `RarePieceStory` (Emerald-Cut Cascade) into a large split "Piece of the season": left = big **properly-framed** product image (contained, breathing room, warm plate + soft gilt glow), right = eyebrow + Fraunces title + story + price + CTA.
4. **Editorial model bento** — a mixed-size photo grid (the reference DNA). Use real assets from `public/images/` (signature product photos + `Reviews`/model photos); mixed tile spans (one large + several small), gilt hairlines, subtle caption labels ("On the ear", "In the hand", "The Signature Edit"). Where no real photo exists, a tasteful warm gradient placeholder tile (NO stock/fabricated photos).
5. **Signature collection row** — `FeaturedCarousel` using the fixed framed `ProductCard` (contained images), real names/prices, "View all".
6. **Category strip** — elegant horizontal row (Rings/Earrings/Pendants/Bracelets/Necklaces/Custom) with gilt hairline dividers.
7. **Philosophy split** — light editorial split (image + Fraunces copy), "Beauty in the eye of the beholder" using existing brand/craft copy (adapt `CraftStories` or add).
8. **The Vault (dark break)** — `RareVault` stays the ONE dark section (espresso ink bg, gilt text) for drama: "Eleven pieces. Never repeated." Keep the rotatable 3D pieces.
9. **Testimonials split** — `Reviews` restyled as an editorial testimonial (large Fraunces quote + model photo), keep real reviews + 4.9 rating.
10. **Trust bar** — `TrustSection` as a thin gilt-hairline row (GIA / 30-day / insured / lifetime).

## Style system (apply consistently)
- Fraunces display serif for all headlines; editorial italic in gilt for emphasis. Grotesque sans body. Tracked uppercase gilt eyebrows with a ◆ diamond glyph.
- Warm porcelain grounds; champagne surfaces; gilt hairlines (`--hair`); radiant gilt glow behind hero/feature pieces; rose-gold blush for subtle life; diamond-ice reserved for the stone/links/interactive states.
- **Imagery framed, never zoomed** — `object-contain` with padding on warm plates, pieces centered with breathing room (as `ProductCard` now does). Apply this framing everywhere product/photo tiles appear.
- Generous section padding + negative space (magazine feel), not dense.

## Motion
Keep `HomepageMotion` (Lenis + GSAP ScrollTrigger + react-spring) but ensure effects read on light: scroll-reveals (spring), gentle parallax on media, pinned hero, horizontal-pinned collection row, magnetic buttons. The persistent scroll-driven diamond (`ScrollSceneMount`) should travel/rotate and stay BRIGHT on the porcelain ground. Reconcile `.stack-panel` sticky-stacking for a light background (no dark-on-light seams). Honor `prefers-reduced-motion`.

## Acceptance
- Homepage matches the editorial concept: photography-forward, big Fraunces serif, framed imagery, gilt hairlines, one dark Vault break, luminous but airy.
- All 10 zones present, real content/products/prices preserved, no lorem, no two stacked heroes.
- No dark-on-light / light-on-light; diamond bright on porcelain; framed (not zoomed) images throughout.
- `npm run build` passes; smooth 60fps; `prefers-reduced-motion` degrades cleanly.
- Report every changed/added file, then STOP.
