// Maps product slugs to their web-ready GLB: Meshy-generated, then Draco mesh
// + WebP texture compressed by scripts/optimize-models.mjs.
//
// Only ever point at `-opt.glb`. The raw `-meshy.glb` exports are 16-24MB each
// (~16s on 4G before anything renders) and are build inputs, not deliverables.
// Run `node scripts/optimize-models.mjs --check` to verify.
//
// Pieces without a scan fall back to studio photography.
// Keyed by the current PIECUT slugs. The GLB filenames keep their original
// (halo) names — they are the same physical pieces, just renamed in the catalog.
export const productModels: Record<string, string> = {
  "jsnd062601-emerald-piecut-ring": "/models/emerald-halo-engagement-ring-opt.glb",
  "jsnd062602-emerald-piecut-earrings": "/models/emerald-halo-stud-earrings-opt.glb",
  "jsnd062603-emerald-piecut-pendant": "/models/emerald-halo-pendant-opt.glb",
  "jsnd062604-oval-piecut-earrings": "/models/oval-halo-drop-earrings-opt.glb",
  "jsnd062605-heart-piecut-ring": "/models/heart-halo-ring-opt.glb",
  "jsnd062606-asscher-piecut-earrings": "/models/asscher-halo-drop-earrings-opt.glb",
  "jsnd062607-star-piecut-earrings": "/models/star-cluster-stud-earrings-opt.glb",
  "jsnd062608-heart-piecut-pendant": "/models/heart-halo-pendant-opt.glb",
  "jsnd062609-heart-piecut-earrings": "/models/heart-halo-drop-earrings-opt.glb",
  "jsnd062610-pear-piecut-earrings": "/models/pear-halo-drop-earrings-opt.glb",
  "jsnd062611-pear-piecut-pendant": "/models/pear-halo-pendant-opt.glb",
};

export function modelFor(slug: string): string | undefined {
  return productModels[slug];
}

export function hasModel(slug: string): boolean {
  return slug in productModels;
}
