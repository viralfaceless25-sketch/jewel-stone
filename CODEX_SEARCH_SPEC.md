# CODEX TASK — Extend the Diamond Search (JewelStone)

Project root: `/Volumes/ai-hub/jewel-stone`. The Diamond Search UI lives in **`app/diamonds/page.tsx`** and its filter client is **`components/CollectionFilterClient.tsx`**. **Read both fully first**, then extend them in the SAME visual style (rose/champagne/ivory, existing pill/chip components). Do NOT touch homepage section components (`HeroSection`, `WelcomeStory`, `Showcase3D`, `RareVault`, `CraftStories`, `TrustSection`, `FeaturedCarousel`, `Turntable3D`) — Claude is actively editing those.

## Client's requested additions (from the jeweler)
1. **Clarity** — add **IF** and **FL** to the clarity options (the current set is VVS1/VVS2/VS1/VS2/SI1/SI2). New full order to display: `FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2`.
2. **Shape** — add these shapes to the existing set (Round/Oval/Cushion/Emerald/Pear/Heart/Radiant/Marquise): **Cushion Brilliant, Princess, Straight Baguette, Taper Baguette, Half Moon**.
3. **Origin toggle** — add a filter for **Lab-Grown vs Natural** (and an "Antique" flag), since the house carries antique pieces in both lab-grown and natural.
4. **Piecut specialty** — surface a **"Piecut"** category/badge prominently (it is the house specialty and a real product line in `data/products.ts` — the SIGNATURE collection).

## Implementation notes
- Keep the filtering logic working end-to-end (selecting a new clarity/shape/origin actually filters the result set and updates the "N diamonds found" count).
- If the diamond dataset doesn't yet carry `clarity`/`shape`/`origin`/`antique` fields, extend the data model in `data/products.ts` (or the diamonds data source) minimally and consistently, and give existing items sensible values — do not invent fake SKUs.
- Preserve the carat range + max-price slider behavior.
- Mobile responsive; keyboard-accessible chips; `aria-pressed` on toggles.

## Done criteria
`npx tsc --noEmit` clean. Report the list of files you changed. Do not run the dev server.
