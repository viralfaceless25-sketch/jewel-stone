/**
 * Site-wide living background. A fixed soft-light layer of slowly drifting aurora
 * light orbs + a film-grain layer, so every section reads with depth and life
 * instead of a flat solid color. Blends additively over both light and dark
 * sections. Pure CSS animation (GPU transforms), paused for reduced-motion.
 */
export function AmbientBackground() {
  return (
    <>
      <div aria-hidden className="ambient-layer pointer-events-none fixed inset-0 z-30 overflow-hidden">
        <span className="ambient-orb ambient-orb-1" />
        <span className="ambient-orb ambient-orb-2" />
        <span className="ambient-orb ambient-orb-3" />
      </div>
      <div aria-hidden className="ambient-vignette" />
      <div aria-hidden className="ambient-grain" />
    </>
  );
}
