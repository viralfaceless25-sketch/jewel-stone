# Crisp loader and craft-film design

## Goal

Replace rejected soft video loader with sharp, instant premium motion. Build licensed-film intake path for editorial storytelling without changing product imagery.

## Locked boundaries

- Product listings, product galleries, product detail pages: only real Jewel Stone product imagery.
- Filmsupply material: homepage editorial stories, future About page, raw-material and craftsmanship moments only.
- Never hotlink, copy, or publish a Filmsupply preview. A clip enters `public/videos/` only after client supplies a licensed downloadable file for web/digital use.

## Loader

- Full-viewport carbon-black overlay, shown once per browser session through existing `INTRO_SESSION_KEY` flow.
- No video, raster logo, white card, or external media request.
- Centered inline-SVG diamond with thin champagne-gold facet strokes; a restrained live-text Jewel Stone mark; a short animated progress line.
- Motion visitor: complete after 1.45 seconds, then fade for 480 ms. Reduced-motion visitor: static mark for 650 ms, then fade.
- Background scroll locks while active. "Skip intro" appears after 650 ms. Existing storage failure and unmount cleanup remain safe.

## Editorial footage intake

Local shortlist, all license-pending:

1. Diamond inspection: [diamond rotated in tweezers](https://www.filmsupply.com/clips/a-diamond-being-held-and-rotated-with-a-pair-of-tweezers-before-a-light/299141) — raw-material opening.
2. Bench craft: [jeweler using bur tool](https://www.filmsupply.com/clips/closeup-hands-of-a-jeweler-working-on-a-jewelry-with-a-bud-bur-tool/917052) — craftsmanship story.
3. Fire and metal: [torch shaping material](https://www.filmsupply.com/clips/a-blowtorch-is-setting-fire-to-a-piece-of-glass-and-melting-it-to-shape-it/669402) — transitional craft texture; use only if copy avoids claiming actual Jewel Stone manufacturing.
4. Gold texture: [shiny gold material](https://www.filmsupply.com/clips/a-shiny-gold-substance-rolls-and-twists-into-itself/541620) — abstract divider/background.
5. Gold texture: [gold liquid paint swirling](https://www.filmsupply.com/clips/gold-liquid-paint-swirling/563238) — abstract divider/background.

## Asset placement after licensing

- Add only downloaded, licensed local files. Preserve aspect ratio and provide a static image fallback.
- Use 6–12-second muted, looping, viewport-paused films in homepage editorial panels.
- Do not place generic ring shots beside a real Jewel Stone product. Do not make provenance or manufacturing claims from third-party b-roll.

## Verification

- Unit-test normal and reduced-motion timing selection before component changes.
- Test session state suite and production build.
- Confirm first visit, same-session refresh, reduced motion, skip, and no white/raster wordmark locally.
