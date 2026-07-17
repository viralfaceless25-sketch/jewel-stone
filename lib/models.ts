// Maps product slugs to their web-ready GLB: Meshy-generated, then Draco mesh
// + WebP texture compressed by scripts/optimize-models.mjs.
//
// Only ever point at `-opt.glb`. The raw `-meshy.glb` exports are 16-24MB each
// (~16s on 4G before anything renders) and are build inputs, not deliverables.
// Run `node scripts/optimize-models.mjs --check` to verify.
//
// Pieces without a scan fall back to studio photography.
export const productModels: Record<string, string> = {
  "emerald-halo-engagement-ring": "/models/emerald-halo-engagement-ring-opt.glb",
  "emerald-halo-stud-earrings": "/models/emerald-halo-stud-earrings-opt.glb",
  "emerald-halo-pendant": "/models/emerald-halo-pendant-opt.glb",
  "oval-halo-drop-earrings": "/models/oval-halo-drop-earrings-opt.glb",
  "heart-halo-ring": "/models/heart-halo-ring-opt.glb",
  "asscher-halo-drop-earrings": "/models/asscher-halo-drop-earrings-opt.glb",
  "star-cluster-stud-earrings": "/models/star-cluster-stud-earrings-opt.glb",
  "heart-halo-pendant": "/models/heart-halo-pendant-opt.glb",
  "heart-halo-drop-earrings": "/models/heart-halo-drop-earrings-opt.glb",
  "pear-halo-drop-earrings": "/models/pear-halo-drop-earrings-opt.glb",
  "pear-halo-pendant": "/models/pear-halo-pendant-opt.glb",
};

export function modelFor(slug: string): string | undefined {
  return productModels[slug];
}

export function hasModel(slug: string): boolean {
  return slug in productModels;
}
