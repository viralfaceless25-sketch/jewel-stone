# CODEX SPEC — Re-theme to ONYX & CHAMPAGNE GOLD

Change the whole site from Dark Amethyst to **Onyx & Champagne Gold**: near-black onyx ground, smoked-glass surfaces, warm champagne-gold as the single metal/accent, warm white text. The token system is in place — change VALUES only, plus a hardcoded-hex find/replace (which also catches any amethyst literals introduced by the diamond/motion pass). Keep all content/data/routes/copy and all motion/3D behavior intact.

## 1. `tailwind.config.ts` tokens
```
ink:       "#F6F3EC",   // warm white text
ivory:     "#0B0B0C",   // onyx ground
pearl:     "#17161A",   // smoked glass surface
marble:    "#060606",   // deepest
espresso:  "#0C0B0A",
cocoa:     "#161412",
mocha:     "#241E16",
champagne: "#E7C89A",   // champagne gold (metal)
rose:      "#E7C89A",   // PRIMARY accent -> gold
velvet:    "#8C6B3F",   // deep bronze accent
aurora1:   "#F7E7C6",   // light gold
aurora2:   "#E7C89A",   // champagne gold
aurora3:   "#C9A24E",   // deep gold
chrome:    "#E7C89A",
chromehi:  "#F7EFD8",
hair:      "rgba(231,200,154,0.14)",
hair2:     "rgba(231,200,154,0.28)"
```
`boxShadow.glow` → `0 20px 80px rgba(231,200,154,0.18)`.

## 2. `app/globals.css` :root
`--color-ink:#F6F3EC; --color-ivory:#0B0B0C; --color-pearl:#17161A; --color-espresso:#0C0B0A; --color-rose:#E7C89A; --color-champagne:#E7C89A; --aurora1:#F7E7C6; --aurora2:#E7C89A; --aurora3:#C9A24E; --chrome:#E7C89A; --chrome-hi:#F7EFD8; --hair:rgba(231,200,154,.14); --hair2:rgba(231,200,154,.28);`
- `html` background → `#060606`.
- `.chrome-text` gradient → gilded: `linear-gradient(180deg,#FBF3DF 0%,#E7C89A 40%,#A67C3D 62%,#F7E7C6 100%)`.
- `.aurora-btn` → `background:linear-gradient(90deg,#F7E7C6,#E7C89A);color:#0B0B0C`.
- `::selection` → `rgba(231,200,154,.28)`.

## 3. Hardcoded-hex find/replace across `components/` + `app/` (NOT node_modules) — apply exactly. This also converts amethyst literals added by the diamond/motion pass, including 3D rim-light colors:
- `#0D0820` → `#0B0B0C`
- `#1A1038` → `#17161A`
- `#08061A` → `#060606`
- `#0A0722` → `#0C0B0A`
- `#17102E` → `#161412`
- `#241848` → `#241E16`
- `#C9C0E0` → `#E7C89A`
- `#F2ECFF` → `#F6F3EC`
- `#B15CFF` → `#E7C89A`
- `#8A5CFF` → `#8C6B3F`
- `#46E0FF` → `#F7E7C6`
- `#FF6EC7` → `#C9A24E`
- `rgba(201,192,224,` → `rgba(231,200,154,`
- `rgba(177,92,255,` → `rgba(231,200,154,`
- `rgba(70,224,255,` → `rgba(247,231,198,`
- `rgba(255,110,199,` → `rgba(201,162,78,`
- `rgba(138,92,255,` → `rgba(140,107,63,`
- `#3a2f52` → `#3a3228`

## 4. `components/AuroraBackground.tsx`
Blob colors → warm gilded set: `#F7E7C6`, `#E7C89A`, `#C9A24E`, `#8C6B3F`. Keep it restrained (this is a warm gold glow over onyx, not a rainbow) — consider slightly lower opacity so onyx stays dominant.

## 5. Diamond lighting
Wherever the diamond scene uses cyan/amethyst rim lights (now converted to `#F7E7C6` / `#E7C89A` by the table), confirm the diamond reads as a colorless stone throwing WARM GOLD fire on an onyx background. If any accent still looks purple/cyan, set it to gold.

## 6. Acceptance
- Entire site: onyx-black ground, smoked-glass panels, champagne-gold accent everywhere, warm-white text. No purple/cyan remnants anywhere (grep for `B15CFF|46E0FF|FF6EC7|8A5CFF|C9C0E0|F2ECFF|177,92,255|201,192,224` in app/components returns nothing).
- All motion/3D/scroll behavior unchanged and working.
- `npm run build` passes; no console errors; reduced-motion respected.
- Report changed files.
