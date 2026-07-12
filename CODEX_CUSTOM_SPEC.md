# CODEX TASK — Upgrade the Custom Design form (JewelStone)

Project root: `/Volumes/ai-hub/jewel-stone`. The custom-design page is at **`app/custom/`** — **read it fully first**, then upgrade it into a real, working bespoke-design request form in the SAME visual style (rose/champagne/ivory, existing button/input components). Do NOT touch the homepage section components (`HeroSection`, `WelcomeStory`, `Showcase3D`, `RareVault`, `Reviews`, `TrustSection`, `CraftStories`, `FeaturedCarousel`, `Turntable3D`) — Claude is editing those.

## The form the client wants (like a real custom-design brief)
1. **Piece type** selector: Ring / Necklace / Bracelet / Earrings / Pendant / Chain.
2. **Size fields — shown conditionally by piece type:**
   - Ring → **Ring size** (US 3–13, half sizes)
   - Necklace/Pendant → **Neck size / chain length** (14"–24")
   - Bracelet → **Bracelet size / hand size** (5"–9")
   - Chain → **Chain length** (16"–30")
3. **Metal color**: White Gold / Yellow Gold / Rose Gold / Platinum (swatch chips).
4. **Center stone**: shape (reuse the shape list incl. Cushion Brilliant, Princess, Baguette, Half Moon, Piecut), **carat** (range/select), origin Lab-Grown / Natural.
5. **Reference image upload** (`<input type="file" accept="image/*">`): on upload, show a preview AND a **"Suggested similar pieces"** row — pull 3–4 products from `data/products.ts` (nearest by category/shape) with thumbnail, name, short description, metal, and carat. (Heuristic match is fine — no ML needed; e.g., match on selected piece type + shape.)
6. **Upgrade options** (checkboxes/toggles): Engraving, Higher clarity (VVS+), Larger halo, Hidden accent stone, Gift packaging — each with a short note.
7. **Contact fields** + submit. On submit, show a success state (no backend needed — client-side confirmation is fine; keep any existing submit handler pattern).

## Notes
- Multi-step or single well-sectioned form, your call — must be mobile responsive and keyboard accessible.
- Keep it a client component where interactivity is needed.
- Use existing product data for suggestions; do NOT invent SKUs.

## Done criteria
`npx tsc --noEmit` clean. Report changed files. Do not run the dev server.
