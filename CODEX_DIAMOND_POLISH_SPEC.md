# CODEX SPEC — Diamond & 3D-stage sparkle polish

The real refractive diamond works but reads TOO DARK/dim (it refracts the dark onyx scene, so it lacks sparkle and fire). Make every 3D diamond/gem on the homepage DAZZLE — bright, sparkling, throwing gold + white fire — while staying on the Onyx & Champagne Gold theme. Do NOT restructure geometry or scroll logic; this is a lighting / material / post-processing tuning pass.

## Targets
`components/three/BrilliantDiamond.tsx`, `components/three/ScrollScene.tsx`, `components/showroom/FloatingDiamond.tsx`, `components/Showcase3D.tsx` (and the RareVault turntable stage / `Turntable3D.tsx` if it drives 3D).

## What to change
1. **Brighter refraction environment.** The diamond can only sparkle if there are bright things to refract. In the diamond's env (CubeCamera scene or the Environment it samples), add several bright `Lightformer`s (drei) — a few near-white (`#FFF8EC`) and champagne-gold (`#F7E7C6`) rectangles/rings at varied angles — so facets catch crisp highlights. Raise env intensity.
2. **Key + rim lights.** Add a bright warm key light and 2–3 rim lights (warm white `#FFF6E6` + champagne `#E7C89A`) positioned to rake across the crown facets, so the stone has bright specular hits and visible fire. Increase overall exposure a touch.
3. **More fire (dispersion).** On `MeshRefractionMaterial` raise `aberrationStrength` (e.g. ~0.02–0.04) and `bounces` for stronger prismatic split; ensure `toneMapped` handling doesn't crush highlights. Keep the stone colorless (fire shows as spectral gold/white on the onyx, not a purple/cyan cast).
4. **Bloom.** Increase Bloom so highlights bloom into sparkle: intensity ~1.0–1.3, lower `luminanceThreshold` (~0.5), keep `mipmapBlur`. Don't blow out the whole scene — target the diamond highlights.
5. **Sparkle.** Add drei `<Sparkles>` (small count, warm-white/gold, subtle) around the hero diamond and the showcase gem so there's ambient glitter. Keep it tasteful.
6. **Showcase / Vault stages.** Brighten the "Every angle, in the round." showcase and the RareVault turntable stages the same way — they currently look like dark empty panels. Add lighting + a subtle gold radial glow behind the piece so the product/gem is clearly visible and luminous.

## Constraints
- Stay on theme: lights are warm white + champagne gold only; NO cyan/purple. Background stays onyx.
- Performance: keep dpr capped, `<Sparkles>` counts low, bloom on a single EffectComposer; hold 60fps; honor `prefers-reduced-motion` (freeze spin/sparkle animation).
- Keep all existing interactions (drag/turntable/scroll-driven travel) working.
- `npm run build` must pass. Report changed files.

## Acceptance
- Hero diamond visibly SPARKLES — bright facet highlights, spectral fire, glowing edges — clearly a dazzling diamond, not a dim dark polygon.
- Showcase3D and RareVault 3D stages are luminous, the piece clearly lit, not black voids.
- No off-theme colors; 60fps; build green.
