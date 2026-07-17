# Crisp Loader and Craft Film Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace blurry first-visit video loader with a sharp CSS/SVG intro and record Filmsupply candidates without publishing unlicensed media.

**Architecture:** Keep session storage ownership in `lib/site/intro-state.ts`. Add one timing helper with unit tests; `BrandPreloader` selects a safe duration and presents only live text plus decorative SVG. Filmsupply URLs live in the design doc until licensed local files exist.

**Tech Stack:** Next.js 14, React 18, TypeScript, CSS Modules, Node test runner.

## Global Constraints

- Product page imagery remains Jewel Stone-owned and real.
- No Filmsupply preview, remote URL, or unlicensed file enters application runtime.
- Motion duration is 1450 ms; reduced motion duration is 650 ms; exit duration is 480 ms.
- Use `apply_patch` for edits and `npm.cmd test` / `npm.cmd run build` for verification.

---

### Task 1: Test and add intro timing selection

**Files:**
- Create: `lib/site/intro-timing.ts`
- Modify: `tests/intro-state.test.ts`

**Interfaces:**
- Produces: `INTRO_DURATION_MS`, `INTRO_REDUCED_DURATION_MS`, and `getIntroDuration(reducedMotion: boolean): number`.

- [ ] **Step 1: Write failing test**

```ts
import { INTRO_DURATION_MS, INTRO_REDUCED_DURATION_MS, getIntroDuration } from "../lib/site/intro-timing.ts";

test("selects a shorter intro for reduced motion", () => {
  assert.equal(getIntroDuration(false), INTRO_DURATION_MS);
  assert.equal(getIntroDuration(true), INTRO_REDUCED_DURATION_MS);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/intro-state.test.ts`

Expected: module-not-found failure for `intro-timing.ts`.

- [ ] **Step 3: Write minimal implementation**

```ts
export const INTRO_DURATION_MS = 1450;
export const INTRO_REDUCED_DURATION_MS = 650;

export function getIntroDuration(reducedMotion: boolean): number {
  return reducedMotion ? INTRO_REDUCED_DURATION_MS : INTRO_DURATION_MS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- tests/intro-state.test.ts`

Expected: all intro tests pass.

### Task 2: Replace video loader with inline diamond motion

**Files:**
- Modify: `components/site/BrandPreloader.tsx`
- Modify: `components/site/brand-preloader.module.css`

**Interfaces:**
- Consumes: `getIntroDuration` and existing `hasSeenIntro` / `markIntroSeen` helpers.
- Produces: a session-gated, video-free full-screen loader.

- [ ] **Step 1: Remove media lifecycle**

Delete `next/image`, video refs, autoplay, and media error handlers. Keep scroll locking, session gating, skip action, fade state, and cleanup.

- [ ] **Step 2: Use resolved timing**

Set reduced-motion state before scheduling `close`; create the fallback timer with `getIntroDuration(reduce)`.

- [ ] **Step 3: Render decorative SVG and live mark**

Render an `aria-hidden` diamond SVG plus live `Jewel Stone` text, progress track, and accessible skip button. Do not emit a raster logo or video tag.

- [ ] **Step 4: Style carbon, gold, and reduced motion**

Use CSS animation for facets and progress only. Add `prefers-reduced-motion` overrides that show a static mark. Use no white rectangle and no remote source.

- [ ] **Step 5: Run verification**

Run: `npm.cmd test` and `npm.cmd run build`.

### Task 3: Record asset intake boundary

**Files:**
- Modify: `docs/superpowers/specs/2026-07-17-crisp-loader-and-craft-film-design.md`

**Interfaces:**
- Produces: auditable URL shortlist, intended editorial use, and license requirement.

- [ ] **Step 1: Preserve candidate source URLs and placement rules**

Keep candidate URLs and all license-pending language in the design specification. Do not add any clip to application runtime.

- [ ] **Step 2: Check plan scope**

Verify no product-page component, product data, or media URL changes occur in this task.
