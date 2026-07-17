# Editorial Commerce Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Deliver the approved Jewel Stone product-gallery, diamond-finder, navbar, homepage media, and cinematic-motion refresh.

**Architecture:** Keep React state local to each interactive surface. Put URL/filter and gallery gesture rules in pure TypeScript helpers covered by Node’s built-in test runner; components consume those helpers. Extend existing CSS modules and CinematicMotion without adding dependencies.

**Tech Stack:** Next.js 14, React 18, TypeScript 5.7, CSS Modules, Node 24 test runner.

## Global Constraints

- No new runtime dependency.
- No scroll hijacking, pinned storytelling, WebGL effects, or forced horizontal scrolling.
- Product gallery must work with pointer, touch, and keyboard.
- Diamond preferences use validated, shareable URL parameters.
- Four bento videos play only while visible and pause offscreen.
- All motion is disabled or simplified under prefers-reduced-motion.
- Touch targets are at least 44px.
- Preserve vertical page scrolling during horizontal gallery gestures.

---

### Task 1: Pure navigation and diamond-filter rules

**Files:**
- Create: lib/commerce/gallery-navigation.ts
- Create: lib/commerce/diamond-filters.ts
- Create: tests/gallery-navigation.test.ts
- Create: tests/diamond-filters.test.ts
- Modify: package.json

**Interfaces:**
- Produces: wrappedIndex(current: number, length: number, delta: -1 | 1): number
- Produces: swipeDelta(dx: number, dy: number, threshold?: number): -1 | 0 | 1
- Produces: normalizeDiamondFilters(input: URLSearchParams): DiamondFilters
- Produces: diamondSearchHref(filters: DiamondFilters): string
- Produces: matchesDiamondFilters(product: DiamondProduct, filters: DiamondFilters): boolean

- [ ] **Step 1: Write gallery helper tests**

~~~ts
import test from "node:test";
import assert from "node:assert/strict";
import { swipeDelta, wrappedIndex } from "../lib/commerce/gallery-navigation.ts";

test("wrappedIndex wraps in both directions", () => {
  assert.equal(wrappedIndex(0, 4, -1), 3);
  assert.equal(wrappedIndex(3, 4, 1), 0);
});

test("swipeDelta accepts horizontal intent only", () => {
  assert.equal(swipeDelta(-60, 10), 1);
  assert.equal(swipeDelta(60, 10), -1);
  assert.equal(swipeDelta(60, 80), 0);
  assert.equal(swipeDelta(30, 2), 0);
});
~~~

- [ ] **Step 2: Write diamond helper tests**

~~~ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  diamondSearchHref,
  matchesDiamondFilters,
  normalizeDiamondFilters,
} from "../lib/commerce/diamond-filters.ts";

test("normalizes supported search values", () => {
  const result = normalizeDiamondFilters(new URLSearchParams("shape=Oval&origin=Natural&carat=2-3"));
  assert.deepEqual(result, { shape: "Oval", origin: "Natural", carat: "2-3" });
});

test("drops unknown search values", () => {
  const result = normalizeDiamondFilters(new URLSearchParams("shape=Triangle&origin=Mined&carat=huge"));
  assert.deepEqual(result, { shape: "", origin: "", carat: "" });
});

test("builds shareable URL and filters products", () => {
  const filters = { shape: "Oval", origin: "Lab-Grown", carat: "2-3" } as const;
  assert.equal(diamondSearchHref(filters), "/diamonds?shape=Oval&origin=Lab-Grown&carat=2-3");
  assert.equal(matchesDiamondFilters({ shape: "Oval", origin: "Lab-Grown", carats: 2.5 }, filters), true);
  assert.equal(matchesDiamondFilters({ shape: "Oval", origin: "Natural", carats: 2.5 }, filters), false);
});
~~~

- [ ] **Step 3: Add test script and verify RED**

~~~json
"test": "node --test tests/*.test.ts"
~~~

Run: npm.cmd test
Expected: FAIL because both helper modules are missing.

- [ ] **Step 4: Implement pure helpers**

~~~ts
export function wrappedIndex(current: number, length: number, delta: -1 | 1) {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}

export function swipeDelta(dx: number, dy: number, threshold = 48): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}
~~~

~~~ts
export const DIAMOND_SHAPES = ["Round", "Oval", "Emerald", "Pear", "Cushion", "Marquise", "Radiant", "Princess"] as const;
export const DIAMOND_ORIGINS = ["Natural", "Lab-Grown"] as const;
export const CARAT_RANGES = ["under-1", "1-2", "2-3", "3-5", "5-plus"] as const;
export type DiamondFilters = {
  shape: "" | (typeof DIAMOND_SHAPES)[number];
  origin: "" | (typeof DIAMOND_ORIGINS)[number];
  carat: "" | (typeof CARAT_RANGES)[number];
};
export type DiamondProduct = { shape?: string; origin?: string; carats: number };

export function normalizeDiamondFilters(input: URLSearchParams): DiamondFilters {
  const shape = input.get("shape") ?? "";
  const origin = input.get("origin") ?? "";
  const carat = input.get("carat") ?? "";
  return {
    shape: DIAMOND_SHAPES.includes(shape as never) ? shape as DiamondFilters["shape"] : "",
    origin: DIAMOND_ORIGINS.includes(origin as never) ? origin as DiamondFilters["origin"] : "",
    carat: CARAT_RANGES.includes(carat as never) ? carat as DiamondFilters["carat"] : "",
  };
}

export function diamondSearchHref(filters: DiamondFilters) {
  const query = new URLSearchParams();
  if (filters.shape) query.set("shape", filters.shape);
  if (filters.origin) query.set("origin", filters.origin);
  if (filters.carat) query.set("carat", filters.carat);
  const value = query.toString();
  return value ? "/diamonds?" + value : "/diamonds";
}

function inCaratRange(carats: number, range: DiamondFilters["carat"]) {
  if (!range) return true;
  if (range === "under-1") return carats < 1;
  if (range === "1-2") return carats >= 1 && carats < 2;
  if (range === "2-3") return carats >= 2 && carats < 3;
  if (range === "3-5") return carats >= 3 && carats < 5;
  return carats >= 5;
}

export function matchesDiamondFilters(product: DiamondProduct, filters: DiamondFilters) {
  return (!filters.shape || product.shape === filters.shape)
    && (!filters.origin || product.origin === filters.origin)
    && inCaratRange(product.carats, filters.carat);
}
~~~

- [ ] **Step 5: Run tests and commit**

Run: npm.cmd test
Expected: 5 passing tests.

Commit: feat: add commerce interaction helpers

---

### Task 2: Product gallery and compact diamond finder

**Files:**
- Create: components/product/CompactDiamondFinder.tsx
- Modify: components/product/ProductView.tsx:37-230
- Modify: components/product/product.module.css:25-180

**Interfaces:**
- Consumes: wrappedIndex, swipeDelta, diamondSearchHref, DiamondFilters.
- Produces: pointer/touch/keyboard gallery navigation and compact product-page finder.

- [ ] **Step 1: Add gallery state and pointer handlers**

~~~tsx
const pointerStart = useRef<{ x: number; y: number } | null>(null);
const stepGallery = useCallback((delta: -1 | 1) => {
  setShowModel(false);
  setShowVideo(false);
  setActiveImg((current) => wrappedIndex(current, gallery.length, delta));
}, [gallery.length]);
const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
  pointerStart.current = { x: event.clientX, y: event.clientY };
};
const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
  const start = pointerStart.current;
  pointerStart.current = null;
  if (!start) return;
  const delta = swipeDelta(event.clientX - start.x, event.clientY - start.y);
  if (delta) stepGallery(delta);
};
~~~

- [ ] **Step 2: Add stage keyboard, arrows, and counter**

~~~tsx
<div
  className={styles.stage}
  tabIndex={gallery.length > 1 && !showModel && !showVideo ? 0 : -1}
  onKeyDown={(event) => {
    if (event.key === "ArrowLeft") stepGallery(-1);
    if (event.key === "ArrowRight") stepGallery(1);
  }}
  onPointerDown={onPointerDown}
  onPointerUp={onPointerUp}
>
  {gallery.length > 1 && !showModel && !showVideo ? (
    <>
      <button className={styles.galleryPrev} onClick={() => stepGallery(-1)} aria-label="Previous product image">←</button>
      <button className={styles.galleryNext} onClick={() => stepGallery(1)} aria-label="Next product image">→</button>
      <span className={styles.galleryCount} aria-live="polite">{activeImg + 1} / {gallery.length}</span>
    </>
  ) : null}
</div>
~~~

- [ ] **Step 3: Build compact finder**

~~~tsx
export function CompactDiamondFinder() {
  const router = useRouter();
  const [filters, setFilters] = useState<DiamondFilters>({ shape: "", origin: "", carat: "" });
  return (
    <form className={styles.diamondFinder} onSubmit={(event) => {
      event.preventDefault();
      router.push(diamondSearchHref(filters));
    }}>
      <div className={styles.finderHeading}><span>Diamond concierge</span><strong>Find your diamond</strong></div>
      <label>Shape<select value={filters.shape} onChange={(event) => setFilters({ ...filters, shape: event.target.value as DiamondFilters["shape"] })}><option value="">Any</option>{DIAMOND_SHAPES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Origin<select value={filters.origin} onChange={(event) => setFilters({ ...filters, origin: event.target.value as DiamondFilters["origin"] })}><option value="">Any</option>{DIAMOND_ORIGINS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Carat<select value={filters.carat} onChange={(event) => setFilters({ ...filters, carat: event.target.value as DiamondFilters["carat"] })}><option value="">Any</option><option value="under-1">Under 1</option><option value="1-2">1–2</option><option value="2-3">2–3</option><option value="3-5">3–5</option><option value="5-plus">5+</option></select></label>
      <button type="submit">Find diamonds</button>
    </form>
  );
}
~~~

- [ ] **Step 4: Insert finder after description and style both features**

~~~css
.galleryPrev,.galleryNext { position:absolute; top:50%; z-index:3; width:48px; height:48px; border-radius:50%; opacity:0; transform:translateY(-50%); transition:opacity .2s ease,background .2s ease; }
.galleryPrev { left:1rem; }
.galleryNext { right:1rem; }
.stage:hover .galleryPrev,.stage:hover .galleryNext,.stage:focus-within .galleryPrev,.galleryPrev:focus-visible,.galleryNext:focus-visible { opacity:1; }
.galleryCount { position:absolute; z-index:3; bottom:1rem; left:50%; transform:translateX(-50%); }
.diamondFinder { display:grid; grid-template-columns:1.2fr repeat(3,minmax(0,1fr)) auto; gap:.65rem; border-block:1px solid var(--js-line); padding:1rem 0; }
@media (pointer:coarse) { .galleryPrev,.galleryNext { opacity:.62; } }
@media (max-width:720px) { .diamondFinder { grid-template-columns:1fr 1fr; } .finderHeading { grid-column:1/-1; } }
@media (prefers-reduced-motion:reduce) { .galleryPrev,.galleryNext { transition:none; } }
~~~

- [ ] **Step 5: Run tests, typecheck, and commit**

Run: npm.cmd test
Run: npx.cmd tsc --noEmit
Expected: both pass.

Commit: feat: improve product discovery controls

---

### Task 3: URL-driven Diamonds explorer

**Files:**
- Modify: components/diamonds/DiamondsExplorer.tsx:1-100
- Modify: components/diamonds/diamonds.module.css:1-52

**Interfaces:**
- Consumes: normalizeDiamondFilters and matchesDiamondFilters.
- Produces: query-initialized shape, origin, and carat controls plus preference-preserving empty-state link.

- [ ] **Step 1: Initialize state from URL and filter products**

~~~tsx
const searchParams = useSearchParams();
const router = useRouter();
const initial = normalizeDiamondFilters(new URLSearchParams(searchParams.toString()));
const [filters, setFilters] = useState<DiamondFilters>(initial);
const matches = pieces.filter((piece) => matchesDiamondFilters({
  shape: getProductDiamondMetadata(piece).shape,
  origin: getProductDiamondMetadata(piece).origin,
  carats: piece.carats,
}, filters));
const hasFilters = Boolean(filters.shape || filters.origin || filters.carat);
~~~

- [ ] **Step 2: Add compact filter bar and URL sync**

~~~tsx
const updateFilters = (next: DiamondFilters) => {
  setFilters(next);
  router.replace(diamondSearchHref(next), { scroll: false });
};
~~~

Render labeled Origin and Carat selects beside the existing shape grid. Shape buttons update filters.shape instead of separate shape state. Render results whenever hasFilters is true.

- [ ] **Step 3: Preserve preferences in empty state**

~~~tsx
const inquiryHref = "/custom?" + new URLSearchParams({
  ...(filters.shape ? { shape: filters.shape } : {}),
  ...(filters.origin ? { origin: filters.origin } : {}),
  ...(filters.carat ? { carat: filters.carat } : {}),
}).toString();
~~~

- [ ] **Step 4: Style filters and verify**

~~~css
.filterBar { display:grid; grid-template-columns:repeat(2,minmax(0,220px)) auto; align-items:end; gap:.8rem; margin:1.25rem 0; }
.filterBar label { display:grid; gap:.35rem; font-size:.68rem; letter-spacing:.12em; text-transform:uppercase; }
.filterBar select { min-height:44px; border:1px solid var(--js-line); background:var(--js-porcelain); padding:0 .8rem; }
@media (max-width:720px) { .filterBar { grid-template-columns:1fr 1fr; } }
~~~

Run: npm.cmd test
Run: npx.cmd tsc --noEmit
Expected: both pass.

Commit: feat: apply diamond finder preferences

---

### Task 4: Navbar redesign

**Files:**
- Modify: components/site/SiteNav.tsx:1-180
- Modify: components/site/site-chrome.module.css:1-220

**Interfaces:**
- Produces: balanced desktop navigation, intent-delayed mega menus, wordmark-only logo, grouped mobile accordions, and body scroll lock.

- [ ] **Step 1: Split primary and secondary links**

~~~tsx
const primaryLabels = new Set(["Engagement", "Wedding", "Jewelry"]);
const secondaryLabels = new Set(["Diamonds", "Custom Design"]);
const primaryItems = megaNav.filter((item) => primaryLabels.has(item.label));
const secondaryItems = megaNav.filter((item) => secondaryLabels.has(item.label));
~~~

- [ ] **Step 2: Add open-intent timer and route cleanup**

~~~tsx
const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const enter = (i: number) => {
  if (closeTimer.current) clearTimeout(closeTimer.current);
  if (openTimer.current) clearTimeout(openTimer.current);
  openTimer.current = setTimeout(() => setActive(megaNav[i].groups ? i : null), 160);
};
useEffect(() => {
  setActive(null);
  setOpen(false);
}, [pathname]);
useEffect(() => {
  document.body.style.overflow = open ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [open]);
~~~

- [ ] **Step 3: Replace combined logo and rebuild mobile menu**

~~~tsx
<Link href="/" className={styles.wordmark} aria-label="Jewel Stone home">
  <Image className={styles.navWordmark} src="/brand/jewel-stone-nav-wordmark.webp" alt="Jewel Stone" width={166} height={23} priority />
</Link>
~~~

Mobile panel renders every megaNav item. Items with groups become buttons with aria-expanded and reveal flattened grouped links; About remains a direct item.

- [ ] **Step 4: Apply editorial navbar styling**

~~~css
.navInner { height:70px; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); }
.navLeft,.navRight { gap:clamp(.8rem,1.6vw,1.5rem); }
.navWordmark { width:156px; mix-blend-mode:normal; filter:none; }
.navLink { font-size:.68rem; letter-spacing:.11em; }
.mega { top:70px; transform:translateY(-6px); }
.mobileMenu { position:fixed; inset:70px 0 0; overflow-y:auto; background:rgba(246,243,237,.985); }
~~~

- [ ] **Step 5: Typecheck and commit**

Run: npx.cmd tsc --noEmit
Expected: PASS.

Commit: feat: redesign storefront navigation

---

### Task 5: Homepage copy, six-tile media bento, and parallax

**Files:**
- Modify: components/home/BrandHome.tsx:100-170
- Modify: components/home/brand-home.module.css:130-250
- Modify: components/home/CinematicMotion.tsx:1-55

**Interfaces:**
- Produces: approved collection copy, four visible-only videos, two editorial images, and requestAnimationFrame parallax.

- [ ] **Step 1: Replace collection copy**

~~~tsx
<p>The collection, three ways</p>
<h2 id="story-title">Three ways to find your diamond.</h2>
<span>Explore one-of-a-kind PIECUT, certified natural, and lab-grown jewelry.</span>
~~~

- [ ] **Step 2: Expand bento data and markup**

Render six Link tiles. Four video sources are:

~~~tsx
const houseFilms = [
  { src: "/videos/jewelry-collage.mp4", href: "/collections", label: "The house selection" },
  { src: "/videos/hero-ring.mp4", href: "/collections/engagement-rings", label: "Ring study" },
  { src: "/videos/gallery-bracelet.mp4", href: "/collections/bracelets", label: "Bracelet in motion" },
  { src: "/videos/ring-360.mp4", href: "/diamonds", label: "Every angle" },
];
~~~

Each video uses muted, loop, playsInline, preload="metadata", data-lux-video, and an existing image poster where available. Keep current ring-box and necklace/model images as the remaining two tiles.

- [ ] **Step 3: Add visible-only playback and parallax**

~~~ts
const videos = Array.from(root.current?.querySelectorAll<HTMLVideoElement>("[data-lux-video]") ?? []);
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target as HTMLVideoElement;
    if (entry.isIntersecting) void video.play().catch(() => undefined);
    else video.pause();
  });
}, { threshold: .22 });
videos.forEach((video) => videoObserver.observe(video));

const parallaxItems = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-lux-parallax]") ?? []);
const updateParallax = () => {
  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const depth = Number(item.dataset.luxParallax ?? 18);
    item.style.setProperty("--lux-y", String((progress - .5) * depth) + "px");
  });
};
~~~

Schedule updateParallax with one requestAnimationFrame per scroll frame. Disconnect observers and cancel the pending frame during cleanup. Skip all setup when reduced motion is requested.

- [ ] **Step 4: Build six-tile responsive grid**

~~~css
.houseBento { grid-template-columns:repeat(12,minmax(0,1fr)); grid-auto-rows:minmax(150px,12vw); }
.bentoLead { grid-column:span 8; grid-row:span 3; }
.bentoPortrait { grid-column:span 4; grid-row:span 3; }
.bentoWide { grid-column:span 7; grid-row:span 2; }
.bentoSquare { grid-column:span 5; grid-row:span 2; }
.bentoTile { transform:translate3d(0,var(--lux-y,0),0); }
@media (max-width:720px) { .bentoLead,.bentoPortrait,.bentoWide,.bentoSquare { grid-column:1; grid-row:span 1; transform:none; } }
@media (prefers-reduced-motion:reduce) { .bentoTile { transform:none; transition:none; } }
~~~

- [ ] **Step 5: Typecheck and commit**

Run: npx.cmd tsc --noEmit
Expected: PASS.

Commit: feat: expand cinematic collection story

---

### Task 6: Full verification and browser QA

**Files:**
- Modify only files required by discovered defects.

**Interfaces:**
- Consumes all previous tasks.
- Produces a verified responsive refresh.

- [ ] **Step 1: Run automated verification**

Run: npm.cmd test
Expected: all tests pass.

Run: npx.cmd tsc --noEmit
Expected: no type errors.

Run: npm.cmd run build
Expected: successful Next production build.

- [ ] **Step 2: Run local server**

Run: npm.cmd run dev -- -p 3001
Expected: Local URL http://localhost:3001.

- [ ] **Step 3: Browser-check desktop**

Check homepage, Diamonds, Heart Halo Ring, and a single-image product at desktop width. Verify navbar timing, all six tiles, four videos, hover arrows, keyboard wrapping, finder URL, filter initialization, no horizontal overflow, and no console errors.

- [ ] **Step 4: Browser-check mobile and reduced motion**

Check the same flows at 390px width. Verify mobile accordion hierarchy, body scroll lock, swipe navigation without blocking vertical scrolling, stacked finder, one-column bento, 44px controls, and static reduced-motion composition.

- [ ] **Step 5: Commit QA fixes**

Run: git status --short
Commit only if QA required source changes, using message: fix: polish editorial commerce interactions

