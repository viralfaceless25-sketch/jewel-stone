// Maps product slugs to their real, Meshy-generated + Draco/WebP-compressed GLB.
// Only pieces we have physical 3D scans for appear here. Everything else falls
// back to studio photography.
export const productModels: Record<string, string> = {
  "heart-halo-ring": "/models/heart-halo-ring-opt.glb",
  "emerald-halo-engagement-ring": "/models/emerald-halo-engagement-ring-opt.glb",
  "heart-halo-pendant": "/models/heart-halo-pendant-opt.glb",
  "pear-halo-drop-earrings": "/models/pear-halo-drop-earrings-opt.glb",
  "pear-halo-pendant": "/models/pear-halo-pendant-opt.glb",
};

export function modelFor(slug: string): string | undefined {
  return productModels[slug];
}

export function hasModel(slug: string): boolean {
  return slug in productModels;
}
