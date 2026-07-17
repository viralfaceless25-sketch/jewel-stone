# Cinematic intro loader design

## Goal

Use supplied diamond-and-gold transformation film as a premium entry moment without slowing repeat browsing.

## Chosen approach

A full-viewport cinematic loader appears once per browser session, then fades into the site. It uses the supplied MP4, a restrained Jewel Stone wordmark, and no additional copy or controls except an unobtrusive skip action.

Alternatives rejected:

- Show it on every page load: visually repetitive and harmful to shopping flow.
- Use a static poster only: safer, but loses the intended craft-to-jewelry transformation.

## Experience

- On the first document load in a browser session, the loader covers the full viewport before navigation and content become interactive.
- The video plays muted and inline, fills the viewport, and keeps its center composition visible on narrow screens.
- A small Jewel Stone wordmark sits above the lower edge. A quiet "Skip intro" button becomes available after one second.
- Video completion, skip, load error, autoplay failure, or a maximum-duration fallback all close the loader with one short opacity fade.
- The loader records its completion in `sessionStorage`; subsequent page loads in the same browser session do not flash the loader.
- Visitors using reduced-motion settings see a static branded frame for a short moment rather than autoplaying video.
- Background scrolling is locked while the loader is present and restored when it closes.

## Architecture

- Copy `Diamond_and_gold_transform_into_202607171228.mp4` to `public/videos/diamond-gold-intro.mp4`.
- Add a client `BrandPreloader` component that owns video lifecycle, session gating, scroll lock, skip, fallback, and reduced-motion handling.
- Keep storage parsing and key ownership in a small testable `lib/site/intro-state.ts` helper.
- Render a tiny before-interactive layout script that marks returning session visitors before first paint, preventing a loader flash on reload.
- Add isolated CSS module styles for the overlay rather than changing global page art direction.

## Reliability and accessibility

- No sound, no keyboard trap, and a real button for skip.
- `aria-busy` communicates temporary loading state; the decorative video has no redundant spoken label.
- Browser storage access is wrapped defensively.
- A finite fallback timer guarantees the storefront is reachable even if media cannot play.

## Tests and verification

- Unit-test session state helpers for unseen, seen, unavailable-storage, and persistence paths.
- Manually verify first visit, refresh in same session, skip, video completion, media-error fallback, and reduced-motion behavior in local browser.
- Run the existing test suite and production build.
