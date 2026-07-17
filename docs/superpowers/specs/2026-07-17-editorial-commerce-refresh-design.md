# Jewel Stone Editorial Commerce Refresh

Status: Approved direction A on 2026-07-17

## Purpose

Refresh the highest-impact shopping surfaces without turning the site into an animation demo. Product media must become easier to explore, diamond discovery must become actionable from product pages, navigation must feel intentional, and the homepage must use the newly added media to create a more immersive but still fast experience.

## Current problems

- Product galleries expose thumbnails but lack obvious previous/next navigation, touch swiping, and keyboard control on the main image.
- Product pages do not give shoppers a compact path into loose-diamond discovery.
- Desktop navigation combines a mark and a wordmark with seven competing destinations. Hover behavior feels eager and visual hierarchy feels crowded.
- Mobile navigation flattens the information architecture and does not provide the same useful grouping as desktop.
- Homepage copy, especially “Natural. PIECUT. Lab-grown.”, assumes brand knowledge and does not explain the three collection paths.
- Homepage media grid contains one video even though several optimized storefront videos are now available.
- Existing entrance motion is consistent but not immersive; it does not create depth or respond meaningfully to scroll.

## Goals

1. Make every product angle discoverable by pointer, keyboard, and touch.
2. Put a small diamond finder directly below the product’s primary title and summary information.
3. Send finder selections to the Diamonds page through shareable URL parameters.
4. Rebuild navigation hierarchy, logo treatment, menu timing, and mobile behavior.
5. Clarify the homepage’s three diamond collection paths.
6. Expand the media bento to four videos and two editorial images.
7. Add restrained scroll depth while preserving accessibility, mobile responsiveness, and loading performance.

## Experience principles

- Product first: animation frames the jewelry and never blocks purchasing controls.
- Editorial calm: fewer competing labels, generous spacing, and deliberate transitions.
- Discoverable interaction: hidden desktop controls reveal on intent; touch interaction remains obvious and usable.
- No scroll hijacking: normal page scrolling, no pinned traps, forced horizontal sections, or inertia overrides.
- Motion has a fallback: reduced-motion users receive static composition and immediate state changes.

## 1. Navigation redesign

### Desktop structure

Use a 68–72px fixed porcelain navigation band with three balanced zones:

- Left: Engagement, Wedding, Jewelry.
- Center: Jewel Stone wordmark only.
- Right: Diamonds, Custom, search, wishlist, and bag.

About remains available in the mobile menu, relevant mega-menu editorial content, and footer. This removes one low-priority desktop label without removing its destination.

The navbar uses the existing /brand/jewel-stone-nav-wordmark.webp alone. Remove the adjacent mark, blend mode, artificial contrast filter, and oversized combined treatment. Display at approximately 150–160px desktop and 132–142px mobile on an unbroken background.

### State and motion

- Initial state: opaque enough for reliable contrast, minimal border, no heavy shadow.
- Scrolled state after roughly 16px: slightly denser porcelain background, subtle blur, and clearer bottom rule.
- Mega menus open after a short 140–180ms intent delay rather than immediately crossing a label.
- Menu switching inside the navbar is stable and does not replay an entrance animation for every adjacent label.
- Mouse leave receives a short grace period so moving into the mega panel does not close it.
- Click toggles dropdowns, Escape closes them, focus can open them, and route selection closes all menus.
- Current route receives a quiet underline or opacity treatment rather than a loud pill.

### Mega menu

Keep existing category data and featured editorial cards. Simplify typography to one small uppercase group label plus readable serif links. Limit animation to opacity and 6–8px vertical movement. Featured image should support content, not dominate the full panel.

### Mobile behavior

Use a full-width sheet below the fixed bar instead of the current short stack:

- Preserve grouped child links through accordions.
- Keep search, wishlist, and bag reachable.
- Lock background scrolling while open.
- Close on route selection and Escape.
- Use at least 44px targets and visible focus states.

## 2. Product media gallery

### Main stage controls

Add circular previous and next buttons centered on the left and right edges of the main product stage.

- Fine pointers: controls start visually hidden and fade in when the stage is hovered or focused.
- Keyboard users: controls reveal through focus-within and retain a clear focus ring.
- Coarse pointers: swiping is primary; compact arrows remain faintly visible to preserve discoverability.
- A small current/total counter remains visible near the lower edge.
- Previous from the first image wraps to the last; next from the last wraps to the first.
- Selecting a thumbnail updates the same active index and counter.

### Input behavior

- Left and Right Arrow keys change media while the stage is focused.
- Horizontal touch or pointer travel of about 48px changes image.
- Gesture detection activates only after horizontal intent exceeds vertical travel, preserving normal page scrolling.
- Each button has a specific accessible label such as “Previous product image”.
- Active-image changes are announced politely without reading every decorative thumbnail.

### Visual transition

Use a 220–280ms opacity transition with no large slide distance. Preload the adjacent image where practical. Hide gallery arrows while 3D or film mode is actively controlling the stage; thumbnails still return shoppers to image mode.

## 3. Compact product-page diamond finder

Place a small “Find your diamond” panel in the product information column immediately after product name, price, and summary, before detailed configuration controls.

Desktop layout is one compact rail; mobile stacks controls. Fields:

- Shape: Any, Round, Oval, Emerald, Pear, Cushion, Marquise, Radiant, Princess.
- Origin: Any, Natural, Lab-grown.
- Carat: Any, Under 1, 1–2, 2–3, 3–5, 5+.
- Submit label: Find diamonds.

Submission navigates to /diamonds with validated query parameters, for example /diamonds?shape=Oval&origin=Natural&carat=2-3.

### Diamonds page integration

DiamondsExplorer reads valid URL values on load, initializes matching controls, and filters catalog pieces by shape, origin, and carat range. Invalid values fall back to Any. Results and empty states update accessibly. If no catalog piece matches, show a source-to-order inquiry action that preserves the shopper’s preferences.

This is catalog discovery, not a promise of live supplier inventory. No external inventory API or checkout integration is introduced.

## 4. Clear collection heading

Replace the unclear homepage header with:

- Eyebrow: THE COLLECTION, THREE WAYS
- Heading: Three ways to find your diamond.
- Supporting copy: Explore one-of-a-kind PIECUT, certified natural, and lab-grown jewelry.

Existing collection cards retain their individual context, allowing shoppers to understand PIECUT after receiving the broader explanation.

## 5. Expanded homepage media bento

Expand the current four-tile composition to six tiles: four muted videos and two editorial images.

Proposed storefront media roles:

- Wide anchor film: /videos/jewelry-collage.mp4.
- Ring editorial film: /videos/hero-ring.mp4.
- Bracelet detail film: /videos/gallery-bracelet.mp4.
- Compact 360 detail: /videos/ring-360.mp4.
- Existing ring-box image.
- Existing necklace/model image.

Final crop selection may swap among the optimized /public/videos files during browser QA, but the composition remains four videos plus two images.

### Playback

- muted, loop, playsInline, preload=metadata.
- Play only while a tile is meaningfully in view; pause when offscreen.
- Provide a poster or static fallback.
- Reduced-motion mode uses the static poster and avoids automatic motion.
- Do not mark bento media as page-priority assets; homepage hero remains the loading priority.

### Layout

- Desktop: asymmetric 12-column editorial grid with one wide anchor, mixed landscape and portrait tiles.
- Tablet: two columns with consistent gaps.
- Mobile: single column, sensible aspect ratios, no overflow or horizontal dragging.
- Every commercial tile has a readable label and meaningful destination.

## 6. Motion and parallax system

Extend CinematicMotion rather than adding a new animation dependency.

Supported effects:

- Staggered reveal: opacity plus a maximum 18–24px entrance offset.
- Media reveal: restrained clip or mask reveal for selected bento tiles.
- Parallax depth: different tiles move 12–30px across their full viewport journey.
- Ambient scale: video media may drift up to roughly 1.015 while in view.

Scroll work is batched through requestAnimationFrame and limited to visible sections. Avoid permanent will-change declarations. Disable transforms and autoplay when prefers-reduced-motion is enabled. Mobile uses smaller offsets or static layout depending viewport and device capability.

## Component changes

Expected implementation surface:

- components/site/SiteNav.tsx
- components/site/site-chrome.module.css
- components/product/ProductView.tsx
- components/product/product.module.css
- New compact product diamond finder component near components/product
- components/diamonds/DiamondsExplorer.tsx
- components/diamonds/diamonds.module.css
- components/home/BrandHome.tsx
- components/home/brand-home.module.css
- components/home/CinematicMotion.tsx

No new runtime dependency is expected.

## Accessibility and performance requirements

- All interactive targets are at least 44px on touch layouts.
- All gallery and navigation controls work with keyboard only.
- Focus indicators remain visible against porcelain and dark media.
- Form fields have persistent labels, not placeholder-only labels.
- Dynamic gallery and diamond result updates use polite announcements.
- Color contrast remains WCAG AA for UI text and controls.
- Reduced-motion behavior is verified, not merely declared in CSS.
- Offscreen videos pause and do not compete with the homepage hero for initial bandwidth.
- No scroll event performs repeated React state updates for every pixel.

## Error and edge handling

- Products with one gallery image hide previous/next controls and counter navigation.
- Broken video playback falls back to its poster without leaving a blank tile.
- Invalid or unknown diamond query parameters are ignored safely.
- Products without video or 3D keep the image gallery unchanged apart from new controls.
- Mobile menu state resets after route changes.

## Acceptance criteria

1. Product gallery wraps correctly by button, keyboard, and touch swipe.
2. Desktop arrows are hidden at rest and reveal on hover or focus; touch users retain usable navigation.
3. Finder submission creates a shareable Diamonds URL and initializes matching filters on arrival.
4. Empty diamond results offer a preference-preserving inquiry route.
5. Desktop navbar is balanced around one wordmark and menus do not flicker during pointer travel.
6. Mobile navigation preserves category hierarchy, locks background scroll, and closes reliably.
7. Homepage uses the approved clear heading and six-tile, four-video composition.
8. Parallax remains subtle, produces no horizontal overflow, and disappears under reduced motion.
9. Production build completes successfully with no new console errors on tested pages.
10. Desktop and mobile browser checks cover homepage, one multi-image product, one single-image product, Diamonds, and navigation menus.

## Non-goals

- Live loose-diamond supplier inventory.
- Checkout or payment changes.
- Full site rebrand or replacement of every logo asset.
- New AI-generated media.
- CMS migration.
- Scroll-jacking, pinned storytelling sequences, or WebGL effects.
