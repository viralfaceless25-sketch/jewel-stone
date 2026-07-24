import { products, type Product } from "@/data/products";
import { modelFor } from "@/lib/models";

/** How a piece is tracked and which camera it uses. */
export type TryOnMode = "hand" | "face";

export type TryOnTarget = {
  slug: string;
  name: string;
  category: Product["category"];
  model: string; // GLB path
  mode: TryOnMode;
  /** Where on the tracked body part it sits. */
  placement: "finger" | "wrist" | "ears" | "neck";
  facingMode: "environment" | "user";
};

function placementFor(category: Product["category"]): TryOnTarget["placement"] {
  switch (category) {
    case "Rings":
      return "finger";
    case "Bracelets":
      return "wrist";
    case "Earrings":
      return "ears";
    default:
      return "neck"; // Pendants, Necklaces
  }
}

/** Rings & bracelets use the rear camera on the hand; everything else the front camera on the face. */
export function modeFor(category: Product["category"]): TryOnMode {
  return category === "Rings" || category === "Bracelets" ? "hand" : "face";
}

/** Only pieces that actually have a GLB can be tried on. */
export const tryOnTargets: TryOnTarget[] = products
  .map((product) => {
    const model = modelFor(product.slug);
    if (!model) return null;
    const mode = modeFor(product.category);
    return {
      slug: product.slug,
      name: product.name,
      category: product.category,
      model,
      mode,
      placement: placementFor(product.category),
      facingMode: mode === "hand" ? "environment" : "user",
    } satisfies TryOnTarget;
  })
  .filter((t): t is TryOnTarget => t !== null);

export function tryOnTargetFor(slug: string): TryOnTarget | undefined {
  return tryOnTargets.find((t) => t.slug === slug);
}
