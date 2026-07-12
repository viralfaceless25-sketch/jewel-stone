# CODEX SPEC — Liquid Mercury / Aurora Theme (site-wide recolor)

**Goal:** Replace the current warm-luxury (brown/cream, light) theme with the **Liquid Mercury / Aurora** dark-futuristic theme across the ENTIRE site, in one foundational pass. Do NOT change copy, product data, routes, or component structure here — only color, surfaces, borders, glass, and the base atmosphere. Page-by-page layout rebuilds come in later specs.

Approved concept reference (visual target): the homepage mockup in Liquid Mercury / Aurora — charcoal ground, liquid-metal chrome, aurora gradient (mint→periwinkle→violet) behind heavy blur, glass panels, chrome hairlines.

---

## 1. Palette — remap existing Tailwind tokens (paired inversion)

The site is currently light. We invert to dark by **remapping the hex of existing token names in matched fg/bg pairs**, so existing `bg-ivory`/`text-ink` usages stay legible. Edit `tailwind.config.ts` → `theme.extend.colors`:

```ts
colors: {
  // was dark text  -> now light silver text
  ink:       "#EEF2F6",
  // was light page bg -> now charcoal ground
  ivory:     "#0C0E10",
  // was light card bg -> now mercury glass surface
  pearl:     "#16191D",
  // was lightest -> now deepest ground (html/footer)
  marble:    "#08090B",
  // was darkest bg -> keep deep, slightly lifted panel
  espresso:  "#0A0B0D",
  // secondary dark surfaces
  cocoa:     "#131619",
  mocha:     "#1B1F24",
  // metallic accent -> liquid chrome
  champagne: "#AEB6C2",
  // PRIMARY warm accent -> aurora periwinkle (36 usages become the brand accent)
  rose:      "#7B8CFF",
  // deep accent -> aurora violet
  velvet:    "#C77BFF",

  // NEW aurora + chrome tokens (additive)
  aurora1:   "#63FFD1",
  aurora2:   "#7B8CFF",
  aurora3:   "#C77BFF",
  chrome:    "#AEB6C2",
  chromehi:  "#EDF1F6",
  hair:      "rgba(174,182,194,0.14)",
  hair2:     "rgba(174,182,194,0.28)",
}
```

Also update `theme.extend.boxShadow`:
```ts
boxShadow: {
  glow: "0 20px 80px rgba(123,140,255,0.18)",
  case: "0 30px 90px rgba(12,14,16,0.55)",
}
```
Keep `fontFamily` block but update the serif stack to a high-contrast display serif (Didot feel):
```ts
display: ["var(--font-display)", "Didot", "Bodoni 72", "Cormorant Garamond", "Georgia", "serif"],
```

## 2. `app/globals.css` — base atmosphere

Update the `:root` custom properties to match (keep variable NAMES; change values):
```css
--color-ink:#EEF2F6; --color-ivory:#0C0E10; --color-pearl:#16191D;
--color-espresso:#08090B; --color-rose:#7B8CFF; --color-champagne:#AEB6C2;
--aurora1:#63FFD1; --aurora2:#7B8CFF; --aurora3:#C77BFF;
--chrome:#AEB6C2; --chrome-hi:#EDF1F6; --hair:rgba(174,182,194,.14); --hair2:rgba(174,182,194,.28);
```
- `html` background: `#08090B` (was espresso — already dark, keep).
- `body` color: `var(--color-ink)` (now light) — already references it, good.
- Film grain `body::after`: keep, lower opacity to `0.04`.
- `.eyebrow` color → `var(--chrome)` with a small gradient underline dash (see mockup `.eyebrow::before`).
- Update `::selection` to `rgba(123,140,255,.30)`.
- Update outline colors from rose to `var(--aurora2)`.

**Add these reusable utility classes** to globals.css (used by later specs; define now):
```css
.chrome-text{background:linear-gradient(180deg,#fff 0%,#C9CFD8 38%,#7E858F 62%,#EDF1F6 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.glass{background:rgba(22,25,29,.55);backdrop-filter:blur(14px) saturate(1.3);border:1px solid var(--hair)}
.hairline{border:1px solid var(--hair)}
.aurora-btn{background:linear-gradient(90deg,var(--aurora1),var(--aurora2));color:#07080A}
.reveal{opacity:0;transform:translateY(34px);
  transition:opacity 1s cubic-bezier(.23,1,.32,1),transform 1s cubic-bezier(.23,1,.32,1)}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}}
```

## 3. Global aurora background layer

Create `components/AuroraBackground.tsx` — a fixed, `z-index:-2`, `pointer-events:none` full-viewport `<canvas>` that renders 3–4 drifting radial-gradient blobs in aurora1/2/3 with `filter: blur(60px) saturate(1.25)` and `globalCompositeOperation='screen'`. Respect `prefers-reduced-motion` (freeze animation). Port the `#aurora` canvas script from the approved mockup. Mount it once in `app/layout.tsx` above `{children}` so it sits behind every page. Add a fixed radial vignette layer too.

## 4. Component audit pass (REQUIRED — this is where light→dark breaks)

After remapping, grep and FIX every place that assumed a light background or dark text:
- `grep -rEl "bg-(ivory|pearl|marble)" components app` — confirm these now read as dark surfaces; where a component layered light-on-light, adjust to glass/hairline surfaces.
- Any `text-espresso`, `text-cocoa`, `text-mocha`, `text-ink` on a now-dark background that becomes invisible → switch to `text-ink`/`text-champagne`/`text-chrome` as appropriate.
- Any hardcoded hex (`#fff`, `#000`, `#fbf...`, `rgba(0,0,0,..)` shadows/overlays) in components → replace with token equivalents; dark overlays should use `rgba(8,9,11,..)`.
- Image/photo overlays that used dark gradients over light bg — keep them but verify contrast on dark.
- Borders: replace warm/opaque borders with `var(--hair)` / `border-champagne/20`.
- `LuxuryNavbar`, `Footer`, `AnnouncementBar`, `NewsletterPopup`, `InquiryCart`, `ProductQuickView`, `ProductCustomizer`, `HeroSection`, `ThemeBackground`, `AmbientBackground` — check each explicitly; these had light surfaces.

## 5. Acceptance criteria
- `npm run build` passes (static export).
- Every route renders on the dark charcoal ground with the aurora layer visible behind content.
- No invisible text (dark-on-dark) and no light-on-light panels anywhere.
- Primary accent everywhere is aurora periwinkle `#7B8CFF`; metallic accents read as chrome `#AEB6C2`.
- Film grain + vignette + aurora present site-wide; `prefers-reduced-motion` disables motion.
- No copy, price, product, or route changes.

## 6. Out of scope (later specs)
Homepage section rebuilds, navbar/footer redesign, per-page layout, 3D piece swaps, checkout. This spec = color/atmosphere foundation only.
