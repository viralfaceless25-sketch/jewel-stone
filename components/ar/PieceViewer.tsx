"use client";

import { createElement, useEffect, useRef, useState } from "react";

type PieceViewerProps = {
  /** Path to the .glb (e.g. /models/heart-halo-ring-opt.glb) */
  src: string;
  alt: string;
  /** Poster image shown until the model loads (usually the product cover). */
  poster?: string;
  /** Show the "View in your space" AR affordance (phones/tablets). */
  ar?: boolean;
  autoRotate?: boolean;
  className?: string;
};

/**
 * Thin wrapper around Google's <model-viewer> web component. We load the library
 * client-side only (it touches browser APIs), register the custom element, then
 * render it. This is deliberately NOT react-three-fiber — it is lighter and gives
 * us native AR ("View in your space") on iOS Quick Look + Android Scene Viewer.
 */
export function PieceViewer({
  src,
  alt,
  poster,
  ar = true,
  autoRotate = true,
  className,
}: PieceViewerProps) {
  const [ready, setReady] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    import("@google/model-viewer")
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        /* leave the poster/skeleton in place if the module fails */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className={className} ref={hostRef}>
        <div
          className="pv-skeleton"
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          aria-label={alt}
          role="img"
        />
      </div>
    );
  }

  const modelViewer = createElement(
    "model-viewer" as unknown as "div",
    {
      src,
      alt,
      poster,
      "camera-controls": "",
      "touch-action": "pan-y",
      "interaction-prompt": "none",
      "shadow-intensity": "1",
      "shadow-softness": "1",
      exposure: "1.05",
      "environment-image": "neutral",
      "camera-orbit": "0deg 78deg 105%",
      "min-camera-orbit": "auto auto 60%",
      "max-camera-orbit": "auto auto 160%",
      loading: "eager",
      reveal: "auto",
      style: { width: "100%", height: "100%", backgroundColor: "transparent" },
      ...(autoRotate
        ? { "auto-rotate": "", "rotation-per-second": "16deg", "auto-rotate-delay": "0" }
        : {}),
      ...(ar ? { ar: "", "ar-modes": "webxr scene-viewer quick-look", "ar-scale": "fixed" } : {}),
    } as Record<string, unknown>,
    ar
      ? createElement(
          "button",
          { slot: "ar-button", className: "pv-ar-btn", key: "ar" },
          "View in your space",
        )
      : null,
  );

  return (
    <div className={className} ref={hostRef}>
      {modelViewer}
    </div>
  );
}
