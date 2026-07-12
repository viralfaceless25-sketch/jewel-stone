# CODEX SPEC — Wire real ring GLB into hero + Obsidian design polish

Read `~/.codex/skills/awwwards-3d/SKILL.md` + references/POST_PROCESSING.md + PATTERNS.md first. Two parts.

## PART 1 — Real product GLB as the hero (biggest upgrade)
A real 4K-textured ring model exists: `public/models/heart-halo-ring.glb` (~42MB — too heavy).
1. **Compress it**: run `npx @gltf-transform/cli optimize public/models/heart-halo-ring.glb public/models/heart-halo-ring-opt.glb --texture-compress webp --compress draco` (or meshopt). Target < ~6MB. Use the optimized file. If the CLI isn't available, `npm i -D @gltf-transform/cli` first. Keep textures at a web-sane size (2K).
2. **Wire it as the hero product**, replacing the procedural diamond in the hero stage (`components/three/ScrollScene.tsx` / `BrilliantDiamond.tsx` / `FlexHero` aperture): load with drei `useGLTF('/models/heart-halo-ring-opt.glb')`, center + scale it into the hero aperture. Render per awwwards-3d: `ACESFilmicToneMapping`, `RoomEnvironment`/HDRI env (metals need env or they're black), a soft contact shadow / `ContactShadows`, gentle key + platinum rim light, slow lerped auto-rotate, subtle bloom + Sparkles. It must read as a real polished rose-gold diamond ring, cinematic on the obsidian ground. Keep scroll-driven motion + reduced-motion freeze. Preload the GLB.
3. Keep the procedural diamond available as a fallback if the GLB fails to load.

## PART 2 — Obsidian homepage design polish (toward the reference bar)
Refine the cinematic monochrome homepage (reference = Active Theory / Lusion / the client's B&W configurator video):
- **Floating rounded viewport**: ensure the whole app clearly sits in a rounded card (~28px radius) over the fixed dark textured backdrop, with a subtle inset ring/shadow — make this signature obvious and consistent.
- **Type**: tighten the Space Grotesk scale + tracking; big confident display, small tracked-uppercase labels; strong hierarchy, generous negative space (don't crowd).
- **Product cards**: dark charcoal glass tiles, framed (object-contain, padded) product images, thin platinum hairline, refined hover (lift + subtle metal glow + reveal price/CTA). Monochrome/desaturated imagery via CSS filter toward the cinematic look; real names/prices.
- **Micro-interactions**: magnetic CTAs (react-spring), link underlines that wipe, cursor-reactive parallax on hero — tasteful, lerped, 60fps.
- **Signal red** `#E5482F`: use ONLY as a tiny accent (a "new" tag, active dot, one CTA hover) — never large areas.
- **Sections**: refine spacing/rhythm so it reads editorial and premium, not dense; one dark→slightly-lifted contrast between sections for depth.
- Fix any low-contrast text, cramped spacing, or leftover light-theme remnants.

## Acceptance
- Hero shows the REAL rose-gold ring GLB (compressed, <~6MB), cinematic and clearly a real polished ring — not a procedural crystal.
- Homepage reads as a committed, premium, cinematic monochrome experience with refined type, framed imagery, tasteful lerped motion.
- `npm run build` passes; 60fps; reduced-motion safe. Report changed files + final GLB size, STOP.
