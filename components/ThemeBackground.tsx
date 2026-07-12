/** Fixed obsidian/stone backdrop behind the rounded application viewport. */
export function ThemeBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="theme-bg-gradient absolute inset-0" />
      <div className="theme-bg-vignette absolute inset-0" />
    </div>
  );
}
