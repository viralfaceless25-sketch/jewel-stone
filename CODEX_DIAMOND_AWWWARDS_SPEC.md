# CODEX SPEC — Definitive hero diamond fix (awwwards-3d glass technique)

The hero 3D diamond has failed to read on the light porcelain hero across several attempts. Apply the `awwwards-3d` skill's glass/gem recipe (installed at `~/.codex/skills/awwwards-3d/` — READ its `SKILL.md` + `references/POST_PROCESSING.md`, `references/PATTERNS.md` #5 glass, `references/ANTI_PATTERNS.md` before coding). The root causes per that skill: **no HDRI/environment map** (a refractive/metallic material with no env is a near-invisible/black blob) and **no ACESFilmic tone mapping** (everything reads flat/washed). Fix ALL of it.

Targets: `components/three/BrilliantDiamond.tsx`, `components/three/ScrollScene.tsx`, `components/three/ScrollSceneMount.tsx`, and the hero framing in `components/FlexHero.tsx`.

## Do exactly this
1. **Renderer**: set `gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace, antialias: true }}` (or via `onCreated`) and `dpr={[1, Math.min(devicePixelRatio, 2)]}`. This is non-negotiable per the skill.
2. **Environment map** (the actual fix for the invisible stone): add a real env so the diamond has something to refract/reflect. Prefer drei `<Environment>` with a **bundled/local HDR** in `public/` OR three's built-in **RoomEnvironment** (no external asset, no CDN dependency) via PMREMGenerator — do NOT rely on a CDN preset that can 404. The env should be bright/studio so facets catch light, but keep the diamond against a DARK jeweler-pad backdrop (already added) so its edges read.
3. **Material**: use the diamond glass recipe — either keep `MeshRefractionMaterial` fed by the env with strong `aberrationStrength` (fire) + `bounces`, OR switch to `MeshPhysicalMaterial` with `transmission: 1.0`, `dispersion: 1.2`, `ior: 2.4` (diamond), `thickness`, low `roughness`, `metalness: 0`. Colorless stone; fire shows spectral gilt/ice, not a purple/cyan cast. Add a subtle Fresnel rim so crown facets pop against the pad.
4. **Post**: `UnrealBloomPass` (or R3F `<Bloom>`) tuned so highlights sparkle (threshold ~0.6, moderate intensity) — do not blow out. Add subtle drei `<Sparkles>` (warm-white + a little ice) around the stone.
5. **Positioning**: CONFIRM the diamond canvas actually renders centered and correctly sized inside the hero gilt-halo aperture at scroll-top (if the persistent `ScrollSceneMount` diamond sits elsewhere, reposition/scale it so a crisp brilliant-cut diamond is visibly the hero focal point on its dark pad). Keep the scroll-driven travel/rotation.
6. **Motion**: lerp all rotation/camera (damping 0.06–0.1) per the skill — never snap. Honor `prefers-reduced-motion` (freeze).

## Acceptance
- Hero diamond is unmistakably a **crisp, bright, sparkling refractive diamond** on its dark pad within the light hero — visible facets, real reflections from the env, spectral fire, glowing highlights. NOT a faint orb or dark blob.
- ACESFilmic tone mapping + env map confirmed in the renderer/scene.
- `npm run build` passes; 60fps; reduced-motion safe. Report changed files, STOP.
