# CODEX SPEC — Re-theme to DARK AMETHYST + real 3D diamond

Two parts. Do Part A fully (build + verify), then Part B. Keep all content/data/routes/copy intact.

---

## PART A — Switch the whole site from Liquid Mercury to **Dark Amethyst**

The token system is already in place. Change the VALUES only. Palette:

| Role | New Amethyst value |
|---|---|
| ground (ivory) | `#0D0820` deep indigo |
| surface (pearl) | `#1A1038` violet glass |
| deepest (marble) | `#08061A` |
| espresso | `#0A0722` |
| cocoa | `#17102E` |
| mocha | `#241848` |
| text (ink) | `#F2ECFF` lilac white |
| chrome (champagne/chrome) | `#C9C0E0` lilac silver |
| chromehi | `#F2ECFF` |
| PRIMARY accent (rose) | `#B15CFF` amethyst |
| velvet (deep accent) | `#8A5CFF` violet |
| aurora1 | `#46E0FF` cyan |
| aurora2 | `#B15CFF` amethyst |
| aurora3 | `#FF6EC7` magenta |
| hair | `rgba(201,192,224,0.14)` |
| hair2 | `rgba(201,192,224,0.28)` |

### A1. `tailwind.config.ts` — set the color tokens above. Update `boxShadow.glow` → `0 20px 80px rgba(177,92,255,0.20)`.

### A2. `app/globals.css` — update `:root` vars to match (`--color-ink:#F2ECFF; --color-ivory:#0D0820; --color-pearl:#1A1038; --color-espresso:#0A0722; --color-rose:#B15CFF; --color-champagne:#C9C0E0; --aurora1:#46E0FF; --aurora2:#B15CFF; --aurora3:#FF6EC7; --chrome:#C9C0E0; --chrome-hi:#F2ECFF; --hair:rgba(201,192,224,.14); --hair2:rgba(201,192,224,.28);`).
- `html` background → `#08061A`.
- `.chrome-text` gradient → `linear-gradient(180deg,#fff 0%,#DCCCF0 38%,#9A86C0 62%,#F2ECFF 100%)` (lilac-silver, stays legible).
- `.aurora-btn` → `background:linear-gradient(90deg,#46E0FF,#B15CFF);color:#0A0722`.
- `::selection` → `rgba(177,92,255,.30)`.

### A3. Global hardcoded-hex replacement (find/replace across `components/` + `app/`, NOT node_modules). Apply exactly:
- `#0C0E10` → `#0D0820`
- `#16191D` → `#1A1038`
- `#08090B` → `#08061A`
- `#0A0B0D` → `#0A0722`
- `#131619` → `#17102E`
- `#1B1F24` → `#241848`
- `#AEB6C2` → `#C9C0E0`
- `#EDF1F6` → `#F2ECFF`
- `#EEF2F6` → `#F2ECFF`
- `#7B8CFF` → `#B15CFF`
- `#63FFD1` → `#46E0FF`
- `#C77BFF` → `#B15CFF`
- `rgba(123,140,255,` → `rgba(177,92,255,`
- `rgba(174,182,194,` → `rgba(201,192,224,`
- `#39404a` (review empty star) → `#3a2f52`

### A4. `components/AuroraBackground.tsx` — blob colors → `#46E0FF`, `#B15CFF`, `#FF6EC7`, `#8A5CFF` (cyan / amethyst / magenta / violet) for the iridescent Midnight-Amethyst wash.

### A5. Fix the 404: `components/RareVault.tsx` references `/images/textures/bg-rose-bokeh.jpg` which does not exist. Remove that background image reference (or replace with a CSS radial aurora gradient using the tokens). No broken asset requests.

### A6. Build: `npm run build` must pass. No dark-on-dark, no light-on-light. Accent everywhere is amethyst `#B15CFF`; cyan `#46E0FF` and magenta `#FF6EC7` appear only as secondary aurora/gradient tones. Report changed files, then continue to Part B.

---

## PART B — Replace the flat "diamond shape" with a REAL 3D refractive diamond

Current state: the homepage hero has a flat, decorative faceted **shape** (CSS/SVG/geometry), and the 3D gems in `components/three/ScrollScene.tsx` (icosahedron) and `components/showroom/FloatingDiamond.tsx` (octahedron with `meshPhysicalMaterial`) are plain procedural gems. The user wants a diamond that reads as a REAL diamond — refraction, dispersion (fire), sparkle — not a flat polygon.

### B1. Hero diamond
- Locate the flat decorative diamond shape in the hero (check `FlexHero.tsx` / `HeroSection.tsx` and any hero decorative element). Replace it with a real R3F `<Canvas>` rendering a faceted **round-brilliant diamond** that slowly rotates and floats.
- Use drei `MeshRefractionMaterial` for true refraction + `aberrationStrength` for dispersion/fire, over an environment map. For the geometry, use a proper brilliant-cut: if a diamond GLB is available under `public/models/`, load it with `useGLTF`; otherwise construct a convincing brilliant-cut geometry (table + crown facets + pavilion) procedurally — do NOT leave it as a single flat polygon.
- Env map: prefer a bundled/local source over a CDN preset for reliability. Use a `CubeCamera` capturing the amethyst scene, or a small local `.hdr`/`.exr` in `public/`, so refraction has something to bend. Accent the lighting with cyan `#46E0FF` and amethyst `#B15CFF` rim lights so the diamond throws colored fire.
- Add subtle Bloom (already have `@react-three/postprocessing`) so highlights sparkle. Keep it performant (dpr cap, `frameloop` demand or throttled), and disable the spin under `prefers-reduced-motion`.

### B2. Upgrade the existing procedural gems
- `ScrollScene.tsx` and `FloatingDiamond.tsx`: swap the plain `meshPhysicalMaterial`/basic gem for the same real refractive-diamond treatment (MeshRefractionMaterial + dispersion + env), so every "diamond" on the site reads as a real stone, not a shape. Keep the existing drag/scroll interactions and `Showcase3D` turntable working.

### B3. Acceptance
- The hero shows a rotating, sparkling, refractive **real-looking diamond** (visible facets, light bending, colored fire), NOT a flat shape.
- No external asset 404s; env map loads reliably.
- `npm run build` passes; no console errors; `prefers-reduced-motion` respected; performance acceptable (no jank).
- Report every changed/added file.

---

## PART C — Motion elevation (the site currently reads "too basic")

The homepage is visually themed but motion-flat: sections just stack and fade. Elevate it into a cinematic, physics-driven, scroll-choreographed experience. Lenis (smooth scroll), GSAP + ScrollTrigger, Framer Motion are installed. Add `@react-spring/web` if you use react-spring for physics (otherwise use Framer Motion springs). Everything below MUST honor `prefers-reduced-motion` (degrade to static/opacity-only).

### C1. Unified scroll driver
- Establish ONE central scroll driver: Lenis smooth scroll → drives GSAP ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker` raf → `lenis.raf`). The repo already has `components/three/ScrollDriver.tsx` / `ScrollScene` / `ScrollSceneMount` — build on these, don't fork a parallel system. Expose a normalized scroll-progress (0→1) that both DOM and the 3D scene read from.

### C2. Persistent scroll-driven 3D diamond
- Mount ONE fixed-position R3F diamond canvas (the real refractive diamond from Part B) that PERSISTS across the whole page and transforms as a function of scroll progress: in the hero it's large/centered; as you scroll it travels, rotates, and scales between sections (e.g. drifts to the side behind the "Most Loved" grid, re-centers for the Emerald-Cut Cascade). Camera/position/rotation keyframed to ScrollTrigger progress. This is the "unique scroll driver" centerpiece.

### C3. Section-overlap / sticky-stacking
- Make consecutive editorial sections OVERLAP on scroll instead of simply stacking: use `position: sticky` pinned panels where the outgoing section scales down slightly, gains border-radius, and dims while the incoming section slides up over it (the premium "stacked panels" effect). Apply to at least the WelcomeStory → Showcase3D → RareVault → RarePieceStory sequence.

### C4. Pinned hero sequence
- Pin the hero for a short scroll distance: the "JEWEL STONE" wordmark parallaxes and its chrome gradient shifts, the diamond scales/rotates, the aurora hue drifts, sub-copy and stat rail reveal in a spring-staggered sequence. Release the pin into the first section.

### C5. Horizontal-pinned product gallery
- Convert "Our Most Loved Pieces" into a GSAP horizontal-scroll pinned section: the row of product cards scrolls horizontally while the section is pinned vertically, then releases. Cards keep the glass/hover treatment and real product data. (Fallback to normal grid on mobile + reduced-motion.)

### C6. Real physics interactions
- **Magnetic buttons**: primary CTAs/nav items spring toward the cursor within a radius and spring back on leave (spring physics, not linear).
- **Physics reveals**: replace linear `.reveal` fades with spring-based entrance (natural overshoot/settle) on cards and headings, staggered.
- **Inertia**: the Vault turntables and any draggable 3D keep momentum/inertia on release.
- **Parallax depth**: hero + section media move in multiple depth layers reacting to BOTH scroll and mouse position (spring-damped, subtle).

### C7. Ambient polish
- Aurora background subtly reacts to scroll velocity (hue/position shift) and mouse.
- Optional tasteful custom cursor (a soft aurora lens over interactive elements) — desktop only, off under reduced-motion.
- Keep motion tasteful and performant: cap dpr, throttle raf, avoid layout thrash, no jank at 60fps. More motion ≠ better — every effect must feel intentional and premium, not busy.

### C8. Acceptance
- The page feels cinematic and physics-driven: pinned hero, a diamond that travels with scroll, overlapping sticky sections, horizontal product gallery, magnetic + spring interactions, multi-layer parallax.
- Nothing feels "basic"/static. All real content preserved.
- `npm run build` passes; smooth 60fps; `prefers-reduced-motion` fully degrades; no console errors.
- Report every changed/added file.
