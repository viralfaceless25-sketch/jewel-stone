# CODEX SPEC — "Obsidian Atelier" total rebrand (theme + homepage)

Total new direction — cinematic monochrome atelier (the language of the client's reference: near-black world, real 3D product heroes on textured surfaces, floating rounded-card layout, bold grotesque type, tiny signal-red micro-accent, sticky configurator, slide cart). Replace the light "Porcelain/Gilt" theme entirely. Keep all real product data/prices/content and routes; change ALL visual design, fonts, layout, motion. Build on the installed `~/.codex/skills/awwwards-3d/` technique (read its SKILL.md + POST_PROCESSING.md) — ACESFilmic tone mapping, HDRI/RoomEnvironment for all 3D, lerped motion, EffectComposer bloom.

## 1. Brand tokens (`tailwind.config.ts` + `app/globals.css`)
```
ink/text:   #F2F0EB   (off-white on dark)
ground:     #0A0A0B   (obsidian)
surface:    #141416   (charcoal card)
surface-2:  #1D1D20
metal:      #C7C2B8   (warm platinum/steel — the ONLY "accent" metal)
metal-dp:   #8B877E
signal:     #E5482F   (tiny red micro-accent ONLY — "new", active dots, never large areas)
hair:       rgba(199,194,184,0.14)
```
Map existing tokens: ink=#F2F0EB, ivory=#0A0A0B, pearl=#141416, marble=#08080A, espresso=#0A0A0B, champagne=#C7C2B8, rose=#C7C2B8, velvet=#8B877E, aurora1/2/3=#C7C2B8/#8B877E/#E5482F, chrome=#C7C2B8, chromehi=#F2F0EB. `html` bg #08080A. `boxShadow.glow` = `0 30px 90px rgba(0,0,0,.6)`.
Do the full hardcoded-hex find/replace across components+app so nothing stays light/porcelain (grep after: no #FCF8F1/#F1E6D3/#B4842F/#211810/#79B3CC remain).

## 2. Font — bold grotesque (drop Fraunces/serif)
Add **Space Grotesk** (or Archivo) via `next/font/google` wired to `--font-display`, and a clean grotesque body (Inter/`--font-body`). Display is TIGHT, BOLD, lowercase-friendly, large — like the reference wordmarks. No serif anywhere. Update `.chrome-text` to a brushed-metal gradient on dark: `linear-gradient(180deg,#F2F0EB,#C7C2B8 45%,#8B877E 70%,#F2F0EB)`.

## 3. Signature layout — floating rounded viewport
- The whole app sits in a **rounded-corner floating card** (`border-radius: ~28px`, subtle inset shadow) over a **full-bleed dark textured background** (a fixed dark rock/liquid-metal texture or a subtle animated dark gradient). Implement as a global wrapper in `app/layout.tsx` around `{children}` + a fixed background layer. Convert `AuroraBackground`/`ThemeBackground` to this dark cinematic backdrop (no warm glow).
- Nav: minimal, lowercase, off-white; a small signal-red "+N new" tag allowed. Slide-in cart drawer from the right (dark card).

## 4. Homepage rebuild (`app/page.tsx` + sections) — cinematic, product-forward
Keep the real sections' content but restyle to Obsidian Atelier:
- **Hero**: full-bleed cinematic stage — a **real 3D product model** (GLB, wired later — for now use the existing refractive diamond on a dark textured plinth) large and centered/right, big bold grotesque headline (e.g. lowercase "cut, cast, set by hand."), minimal supporting copy, a single metal CTA. Lerped 3D per awwwards-3d.
- **Signature pieces**: product cards as dark glass tiles, framed (object-contain, padded) product images on charcoal, metal hairlines, monochrome with hover lift; real names/prices.
- **Editorial bento**: monochrome model/product photography (use real assets in public/images; desaturate/high-contrast toward the cinematic B&W look via CSS filter where appropriate), mixed tile sizes.
- **The Vault**, **craft steps**, **reviews**, **trust** — all restyled dark cinematic, bold grotesque headings, metal accents, generous negative space.
- Motion: Lenis + GSAP ScrollTrigger (pinned hero, staged reveals, one horizontal-pinned gallery), react-spring magnetic CTAs, all lerped, reduced-motion safe, 60fps.

## 5. Acceptance
- Entire site reads as one cinematic monochrome world — obsidian ground, off-white type, warm-platinum accents, tiny red signal only; bold grotesque (no serif); floating rounded-card layout; real framed imagery; 3D uses ACES + env map (bright, not black blob).
- All real products/prices/content/routes preserved; no light/porcelain remnants.
- `npm run build` passes; 60fps; reduced-motion safe. Report changed files, STOP. (Product-page configurator, other pages, SEO, and Stripe are separate follow-on specs.)
