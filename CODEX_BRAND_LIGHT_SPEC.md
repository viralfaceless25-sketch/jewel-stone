# CODEX SPEC — Re-theme to "Porcelain, Gilt & Diamond Ice" (LIGHT brand)

Invert the site from the dark Onyx & Gold theme to the approved LIGHT brand: warm porcelain base, antique-gilt accent, cool Diamond-Ice as the single cool pop, espresso-ink text. This is a dark→light inversion — token VALUES change AND components that assumed a dark ground must be audited. Keep all content/data/routes/copy and all 3D/motion behavior working.

## 0. Font — switch display serif to FRAUNCES
Add Fraunces via `next/font/google` in `app/layout.tsx` (weights 300–600, optical sizing on) and wire it to `--font-display` (replacing Cormorant). Keep the body/utility sans. Fraunces is warmer/livelier than Didot — this is the new brand voice.

## 1. Tailwind tokens (`tailwind.config.ts`) — paired inversion (LIVELIER, GLOWY palette)
```
ink:       "#211810",   // ESPRESSO INK (dark text on light)
ivory:     "#FCF8F1",   // porcelain (warm)
pearl:     "#F1E6D3",   // champagne
marble:    "#F6EFE2",   // lightest surface
espresso:  "#211810",   // the ONE dark section bg (Vault break)
cocoa:     "#E9DCC3",   // sand
mocha:     "#CFC1A8",   // greige
champagne: "#B4842F",   // antique gilt (metal/accent)
rose:      "#E9B39C",   // ROSE-GOLD BLUSH (liveness accent)
velvet:    "#8A6220",   // deep bronze
aurora1:   "#E3B85C",   // gilt light
aurora2:   "#B4842F",   // gilt
aurora3:   "#79B3CC",   // DIAMOND ICE (cool accent)
chrome:    "#B4842F",   // gilt
chromehi:  "#211810",   // dark ink for on-light emphasis
gilt-glow: "#F3CE7A",   // radiant gold (add as new token)
blush:     "#E9B39C",   // rose-gold (add as new token)
ice-glow:  "#B7E4F2",   // (add as new token)
hair:      "rgba(180,132,47,0.20)",
hair2:     "rgba(180,132,47,0.32)"
```
`boxShadow.glow` → `0 10px 40px rgba(243,206,122,0.4)`.

## 1b. GLOW / liveness (this is what the user asked for — not flat)
- `body`/global background: warm radiant wash — `radial-gradient(60% 45% at 82% 8%, rgba(243,206,122,.28), transparent 60%), radial-gradient(50% 40% at 8% 30%, rgba(233,179,156,.20), transparent 60%), radial-gradient(55% 45% at 60% 100%, rgba(121,179,204,.14), transparent 62%), #FCF8F1` (fixed). Convert `AuroraBackground` to this warm gilt+blush+ice glow (light, luminous — not dark blobs).
- Primary buttons: gilt gradient `linear-gradient(120deg,#B4842F,#E3B85C)` + soft glow `box-shadow:0 8px 26px rgba(180,132,47,.4)`, brighten on hover.
- Wordmark / `.chrome-text`: radiant gilt gradient `linear-gradient(180deg,#8A6220,#B4842F 38%,#F3CE7A 60%,#8A6220)` + `drop-shadow(0 4px 26px rgba(243,206,122,.5))`.
- The hero framed diamond: warm gilt glow ring behind it + a diamond-ice glow on the stone itself.
- Use the rose-gold blush for subtle secondary glows/accents so the page feels alive, not muted.

## 2. `app/globals.css`
- `:root`: `--color-ink:#241B12; --color-ivory:#FAF6EF; --color-pearl:#ECE1CE; --color-espresso:#241B12; --color-rose:#A87C36; --color-champagne:#A87C36; --aurora1:#C9A45C; --aurora2:#A87C36; --aurora3:#8FA9B6; --chrome:#A87C36; --chrome-hi:#241B12; --hair:rgba(126,90,36,.18); --hair2:rgba(126,90,36,.30);`
- `html` background → `#FAF6EF` (porcelain). `body` color already `var(--color-ink)` (now dark).
- Film grain opacity → `0.03`.
- `.chrome-text`: replace the metallic gradient with a warm GILT gradient on light: `linear-gradient(180deg,#7E5A24,#A87C36 45%,#C9A45C)` (readable dark-gold on porcelain).
- `.aurora-btn`: `background:#A87C36; color:#FAF6EF;` (solid gilt).
- `.halo-ring` conic → use gilt: `rgba(168,124,54,.5)`.
- `::selection` → `rgba(168,124,54,.20)`.

## 3. Hardcoded-hex find/replace across `components/` + `app/` (NOT node_modules):
- `#0B0B0C` → `#FAF6EF` · `#060606` → `#F3EDE3` · `#0C0B0A` → `#241B12` (keep dark for Vault) · `#17161A` → `#ECE1CE` · `#161418`/`#0d0c0e`/`#0b0a0c` → `#ECE1CE`
- `#E7C89A` → `#A87C36` · `#F7E7C6` → `#C9A45C` · `#C9A24E` → `#A87C36` · `#8C6B3F` → `#7E5A24` · `#F6F3EC` → `#241B12` (was light text) · `#FFF6E6`/`#FFF8EC` (diamond lights) keep warm white
- `rgba(231,200,154,` → `rgba(168,124,54,` · `rgba(201,162,78,` → `rgba(168,124,54,`
- After replace, GREP to confirm no dark-ground `#0B0B0C`/`#0C0E10` remain except the intentional Vault/`espresso` dark section.

## 4. Dark→light component audit (REQUIRED)
The site was dark; now it's light. Fix every place that breaks:
- Any `text-ink`/`text-chromehi` that was light text on dark is now DARK text — good on porcelain, but check overlays/gradients `from-[#0B0B0C]` etc. that assumed dark bg; flip to porcelain/transparent.
- `.glass` panels: on light bg, glass should be `rgba(255,255,255,.5)` warm-tinted with the gilt hairline — update the `.glass`/`.glass-panel` definitions for a LIGHT surface.
- Navbar, Footer, AnnouncementBar, NewsletterPopup, InquiryCart, ProductQuickView: were dark glass → make them light (porcelain/champagne, gilt hairlines, ink text). Announcement bar: porcelain bg, gilt uppercase text (thin, not loud).
- HeroSection video scrim, section gradients, cards: ensure text stays legible on light.
- 3D scenes (ScrollScene/BrilliantDiamond/ShowroomScene): change scene background/env from onyx to a bright warm studio (`#F3EDE3`-ish) so the diamond reads as a bright stone on light; keep a couple of gilt + warm-white rim lights and add a subtle DIAMOND-ICE (#8FA9B6) rim so the stone shows cool fire against warm surroundings. The diamond should look brilliant on a light ground, not a dark blob.

## 5. Acceptance
- Whole site is light porcelain with gilt accents + occasional diamond-ice; espresso-ink text; ONE intentional dark section allowed (Vault).
- No dark-on-dark or light-on-light; no leftover onyx grounds; diamond reads bright on light.
- `npm run build` passes. Report changed files. STOP (homepage editorial layout is a separate spec).
