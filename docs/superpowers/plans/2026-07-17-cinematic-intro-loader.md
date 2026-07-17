# Cinematic Intro Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add supplied diamond-and-gold transformation film as a premium, full-screen loader that plays once per browser session.

**Architecture:** A tiny pure storage helper owns the session key and defensive storage access. A client `BrandPreloader` component owns media lifecycle, scrolling lock, reduced-motion fallback, and exit state. Root layout runs a before-interactive session check to suppress any repeat-visit flash, then mounts the preloader above existing navigation and commerce UI.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, CSS Modules, Node built-in test runner.

## Global Constraints

- Use `public/videos/diamond-gold-intro.mp4`, copied from supplied `C:\Users\zeel1\Downloads\Diamond_and_gold_transform_into_202607171228.mp4`.
- No new package or remote network request.
- Play once per browser session, muted and inline.
- Show a real skip button after one second; close automatically after playback, media error, autoplay failure, or 8.5 seconds.
- Respect `prefers-reduced-motion` with a short static branded frame rather than visible autoplay.
- Keep existing site layout, navigation, and art direction unchanged behind the overlay.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `lib/site/intro-state.ts` | Session-key constants and storage access helpers with no React dependency. |
| `tests/intro-state.test.ts` | Node tests for unseen, seen, persistence, and unavailable storage behavior. |
| `components/site/BrandPreloader.tsx` | Client-side overlay, video lifecycle, scroll locking, skip, fallback, and exit sequencing. |
| `components/site/brand-preloader.module.css` | Isolated cinematic overlay styling and reduced-motion visual fallback. |
| `app/layout.tsx` | Prepaint session marker and root-level preloader mount. |
| `public/videos/diamond-gold-intro.mp4` | Supplied loader film. |

## Task 1: Create session-state contract

**Files:**
- Create: `tests/intro-state.test.ts`
- Create: `lib/site/intro-state.ts`

**Interfaces:**
- Produces `INTRO_SESSION_KEY`, `hasSeenIntro(storage)`, and `markIntroSeen(storage)`.
- `storage` accepts only `getItem` and `setItem`, keeping tests browser-independent.

- [ ] **Step 1: Write failing tests**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { INTRO_SESSION_KEY, hasSeenIntro, markIntroSeen } from "../lib/site/intro-state.ts";

class MemoryStorage {
  values = new Map<string, string>();
  getItem = (key: string) => this.values.get(key) ?? null;
  setItem = (key: string, value: string) => { this.values.set(key, value); };
}

test("returns false for a session that has not seen the intro", () => {
  assert.equal(hasSeenIntro(new MemoryStorage()), false);
});

test("records and reads intro completion", () => {
  const storage = new MemoryStorage();
  markIntroSeen(storage);
  assert.equal(storage.getItem(INTRO_SESSION_KEY), "1");
  assert.equal(hasSeenIntro(storage), true);
});

test("treats unavailable storage as an unseen session", () => {
  const unavailable = { getItem: () => { throw new Error("blocked"); } };
  assert.equal(hasSeenIntro(unavailable), false);
});

test("does not throw when completion cannot be stored", () => {
  const unavailable = { setItem: () => { throw new Error("blocked"); } };
  assert.doesNotThrow(() => markIntroSeen(unavailable));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- tests/intro-state.test.ts`

Expected: module-not-found failure for `lib/site/intro-state.ts`.

- [ ] **Step 3: Implement minimal session helper**

```ts
export const INTRO_SESSION_KEY = "jewel-stone:intro-seen";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function hasSeenIntro(storage: ReadableStorage | null | undefined): boolean {
  try {
    return storage?.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(storage: WritableStorage | null | undefined): void {
  try {
    storage?.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Storage can be disabled; loader still exits normally.
  }
}
```

- [ ] **Step 4: Run focused test to verify it passes**

Run: `npm.cmd test -- tests/intro-state.test.ts`

Expected: 4 passing tests and no failures.

- [ ] **Step 5: Commit helper contract**

```powershell
$gitExe = 'C:\Program Files\Git\cmd\git.exe'
& $gitExe add -- tests/intro-state.test.ts lib/site/intro-state.ts
& $gitExe commit -m "feat: add intro session state"
```

## Task 2: Build isolated cinematic preloader

**Files:**
- Create: `components/site/BrandPreloader.tsx`
- Create: `components/site/brand-preloader.module.css`
- Create: `public/videos/diamond-gold-intro.mp4`

**Interfaces:**
- Consumes `hasSeenIntro` and `markIntroSeen` from `lib/site/intro-state.ts`.
- Produces `BrandPreloader`, a root-level client component with no props.

- [ ] **Step 1: Copy supplied media without changing original**

```powershell
Copy-Item -LiteralPath 'C:\Users\zeel1\Downloads\Diamond_and_gold_transform_into_202607171228.mp4' -Destination 'public\videos\diamond-gold-intro.mp4'
Get-Item -LiteralPath 'public\videos\diamond-gold-intro.mp4' | Select-Object Name, Length
```

Expected: destination file exists and source download remains unchanged.

- [ ] **Step 2: Create component**

```tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasSeenIntro, markIntroSeen } from "@/lib/site/intro-state";
import styles from "./brand-preloader.module.css";

const EXIT_MS = 560;
const SKIP_DELAY_MS = 1000;
const VIDEO_FAILSAFE_MS = 8500;
const REDUCED_MOTION_MS = 650;

export function BrandPreloader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const closed = useRef(false);
  const restoreOverflow = useRef<(() => void) | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    markIntroSeen(window.sessionStorage);
    restoreOverflow.current?.();
    setLeaving(true);
    window.setTimeout(() => {
      document.documentElement.dataset.introSeen = "true";
      setVisible(false);
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    if (hasSeenIntro(window.sessionStorage)) {
      document.documentElement.dataset.introSeen = "true";
      setVisible(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    restoreOverflow.current = () => {
      document.body.style.overflow = originalOverflow;
      restoreOverflow.current = null;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);
    if (reduce) video.current?.pause();
    else void video.current?.play().catch(close);

    const skipTimer = window.setTimeout(() => setSkipAvailable(true), SKIP_DELAY_MS);
    const fallbackTimer = window.setTimeout(close, reduce ? REDUCED_MOTION_MS : VIDEO_FAILSAFE_MS);

    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(fallbackTimer);
      restoreOverflow.current?.();
    };
  }, [close]);

  if (!visible) return null;

  return (
    <section
      className={`${styles.root} ${leaving ? styles.leaving : ""}`}
      aria-busy={!leaving}
      aria-label="Preparing Jewel Stone"
    >
      <video
        ref={video}
        className={`${styles.video} ${reducedMotion ? styles.videoHidden : ""}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={close}
        onError={close}
      >
        <source src="/videos/diamond-gold-intro.mp4" type="video/mp4" />
      </video>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.brand}>
        <Image src="/brand/jewel-stone-nav-wordmark.webp" alt="Jewel Stone" width={166} height={23} priority />
      </div>
      {skipAvailable ? <button className={styles.skip} type="button" onClick={close}>Skip intro</button> : null}
    </section>
  );
}
```

- [ ] **Step 3: Create isolated overlay styles**

```css
.root {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #080706;
  color: #f7f3ee;
  isolation: isolate;
  opacity: 1;
  transition: opacity 560ms cubic-bezier(.22, 1, .36, 1);
}

:global(html[data-intro-seen="true"]) .root { display: none; }
.leaving { opacity: 0; pointer-events: none; }
.video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.videoHidden { visibility: hidden; }
.veil { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(8,7,6,.2), rgba(8,7,6,.08) 50%, rgba(8,7,6,.52)); pointer-events: none; }
.brand { position: relative; z-index: 2; margin-top: min(56vh, 29rem); padding: .9rem 1.1rem; border: 1px solid rgba(247,243,238,.24); background: rgba(8,7,6,.28); backdrop-filter: blur(10px); }
.brand img { display: block; width: clamp(8.5rem, 16vw, 10.375rem); height: auto; filter: brightness(0) invert(1); }
.skip { position: absolute; z-index: 2; right: clamp(1.1rem, 3vw, 2.5rem); bottom: clamp(1.1rem, 3vw, 2.5rem); border: 0; background: transparent; color: rgba(247,243,238,.78); font: 500 .67rem/1 var(--font-body); letter-spacing: .18em; text-transform: uppercase; cursor: pointer; transition: color .2s ease; }
.skip:hover, .skip:focus-visible { color: #fff; }
@media (prefers-reduced-motion: reduce) { .video { display: none; } .root { background: radial-gradient(circle at center, #2a211a, #080706 68%); } }
@media (max-width: 640px) { .video { object-position: 52% center; } .brand { margin-top: 42vh; } }
```

- [ ] **Step 4: Check type safety before layout integration**

Run: `npx.cmd tsc --noEmit`

Expected: exit code 0.

## Task 3: Mount loader before storefront content

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes `BrandPreloader` and `INTRO_SESSION_KEY`.
- Produces a prepaint session marker and root-mounted loader without changing page-route APIs.

- [ ] **Step 1: Add imports and prepaint marker**

```tsx
import Script from "next/script";
import { BrandPreloader } from "@/components/site/BrandPreloader";
import { INTRO_SESSION_KEY } from "@/lib/site/intro-state";
```

Replace the root element opening with:

```tsx
<html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
  <head>
    <Script id="intro-session-marker" strategy="beforeInteractive">
      {`try { if (sessionStorage.getItem("${INTRO_SESSION_KEY}") === "1") document.documentElement.dataset.introSeen = "true"; } catch {}`}
    </Script>
  </head>
  <body>
    <BrandPreloader />
```

Keep existing body children in their current order after `BrandPreloader`.

- [ ] **Step 2: Run targeted automated checks**

Run: `npm.cmd test`

Expected: all existing tests plus 4 intro-state tests pass.

- [ ] **Step 3: Run production compilation**

Run: `npm.cmd run build`

Expected: exit code 0 with all routes generated.

- [ ] **Step 4: Commit loader implementation**

```powershell
$gitExe = 'C:\Program Files\Git\cmd\git.exe'
& $gitExe add -- app/layout.tsx components/site/BrandPreloader.tsx components/site/brand-preloader.module.css lib/site/intro-state.ts tests/intro-state.test.ts public/videos/diamond-gold-intro.mp4
& $gitExe commit -m "feat: add cinematic session intro"
```

## Task 4: Verify real browser behavior

**Files:**
- Verify only; no source changes expected.

**Interfaces:**
- Checks `BrandPreloader` behavior against first-session and repeat-load requirements.

- [ ] **Step 1: Start or reload local development server**

Run: `npm.cmd run dev -- -p 3001`

Expected: `http://localhost:3001` responds without a Next.js error overlay.

- [ ] **Step 2: Verify first screen in a fresh browser tab**

Open a new `http://localhost:3001/` tab. Confirm the full-screen video appears above navigation, wordmark is readable, video is muted, scrolling is unavailable, and skip becomes visible after one second.

- [ ] **Step 3: Verify session behavior and exit paths**

Skip the intro in that tab, then reload it. Confirm the homepage returns without a preloader flash. In a fresh tab, allow video to reach its end and confirm the same soft fade and restored scrolling.

- [ ] **Step 4: Record final verification and leave restored homepage open**

Check browser console for errors, run `npm.cmd test` once more, and retain the working homepage tab for handoff.
