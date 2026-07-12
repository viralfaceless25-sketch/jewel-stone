# CODEX SPEC — Navbar + Footer redesign (global, Liquid Mercury / Aurora)

**Prerequisite:** `CODEX_THEME_SPEC.md` applied (tokens, glass utilities, AuroraBackground exist).

**Goal:** Redesign the global navbar (`components/LuxuryNavbar.tsx`), announcement bar (`components/AnnouncementBar.tsx`), and footer (`components/Footer.tsx`) to the new theme. **Preserve every link, label, brand fact, and the full mega-nav** from `data/site.ts` (`brand`, `navigation`, `megaNav`) and the announcement rotation. No content is removed — this is a re-skin + motion upgrade.

## Navbar (`LuxuryNavbar.tsx`)
- Sticky, `z-30`, chrome-glass bar: `backdrop-filter: blur(22px) saturate(1.4)`, background `linear-gradient(180deg, rgba(12,14,16,.72), rgba(12,14,16,.35))`, bottom border `var(--hair)` that intensifies to `var(--hair2)` after 40px scroll.
- Wordmark "JEWEL STONE" in serif display, letter-spacing ~.3em, using `.chrome-text` (liquid metal). Keep it linked to `/`.
- Primary links from `data/site.ts megaNav` (Engagement, Wedding, Jewelry, …) — keep the **mega-menu dropdowns** with their `groups` (Shop by Style / Shape, Earrings/Necklaces/Bracelets, etc.) and the `featured` cards. Restyle the dropdown panel as a glass surface (`.glass`), chrome hairline dividers, aurora underline on hover (`::after` width 0→100%, `linear-gradient(90deg,var(--aurora1),var(--aurora2))`). Featured card image framed with hairline + aurora glow.
- Right side icons (search, wishlist `/wishlist`, cart/inquiry `/inquiry`) in chrome color, hover → white + slight lift. Keep the wishlist/cart count badge; badge uses `.aurora-btn` gradient fill.
- Mobile: keep existing responsive drawer; restyle to dark glass, aurora accents. Links collapse per current behavior.
- Preserve all existing hrefs and the `megaNav`/`navigation` data wiring — do not hardcode a new link list.

## Announcement bar (`AnnouncementBar.tsx`)
- Keep the rotating messages ("Free Shipping on All Orders", "GIA & IGI Certified Diamonds", "NYC Diamond District — 62 W 47th St, Suite 505", "Book a Private Consultation — By Appointment") and the dismiss behavior + localStorage key.
- Restyle: thin bar, background `rgba(8,9,11,.5)`, text `var(--muted)` uppercase tracked; emphasized words in `var(--chrome-hi)`. Replace the `bg-velvet` block with the dark glass treatment. Keep framer-motion rotation.

## Footer (`Footer.tsx`)
- Rebuild to the mockup footer: 4-column grid — brand block (serif "JEWEL STONE" wordmark, tagline "Shine With You", short line, newsletter input with `.aurora-btn` Join button) + Shop / Company / Care link columns. **Populate columns from real routes**: Shop (Rings, Earrings, Pendants, Necklaces, Custom → `/collections/*`, `/custom`), Company (About `/about`, Diamonds `/diamonds`, Education `/education`, Showroom `/showroom`, Contact `/contact`), Care (Shipping `/pages/shipping`, Returns `/pages/returns`, Warranty `/pages/warranty`, FAQ `/pages/faq`).
- Include real brand facts from `data/site.ts`: address "62 W 47th St, Suite 505, New York, NY 10036", phone "+1 551-341-3256", email "ishan@thejewelstone.com", hours "Monday to Saturday, by appointment". Keep the existing "Connect" social links.
- Top border `var(--hair)`, background `linear-gradient(180deg, transparent, rgba(8,9,11,.6))`, muted link text → white on hover.
- Bottom row: "© 2026 Jewel Stone" + Privacy · Terms · Accessibility.

## Acceptance criteria
- Navbar, announcement, footer all render in Liquid Mercury / Aurora with glass + chrome + aurora accents.
- **Zero links lost**: full mega-nav (groups + featured), all footer routes, all brand facts preserved and data-driven.
- Mega-menu, mobile drawer, announcement rotation + dismiss all still functional.
- Aurora hover underlines + reduced-motion respected.
- `npm run build` passes.
