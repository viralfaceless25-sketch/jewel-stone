export type ParsedCartItem = {
  slug: string;
  qty: number;
  metal?: string;
  size?: string;
  grade?: string;
};

function optional(value?: string) {
  const result = value?.trim();
  return result ? result.slice(0, 80) : undefined;
}

export function parseSessionItems(raw?: string | null): ParsedCartItem[] {
  if (!raw) return [];
  return raw.split("|").flatMap((chunk) => {
    const [slug, rawQty, metal, size, grade] = chunk.split(":");
    if (!slug?.trim()) return [];
    const parsedQty = Number.parseInt(rawQty || "1", 10);
    return [{
      slug: slug.trim(),
      qty: Number.isFinite(parsedQty) && parsedQty > 0 ? Math.min(parsedQty, 50) : 1,
      metal: optional(metal),
      size: optional(size),
      grade: optional(grade),
    }];
  });
}

export function quantitiesBySlug(items: Array<{ slug: string; qty: number }>) {
  const totals = new Map<string, number>();
  for (const item of items) {
    const slug = item.slug.trim();
    if (!slug) continue;
    totals.set(slug, (totals.get(slug) ?? 0) + Math.max(1, Math.round(item.qty)));
  }
  return totals;
}

export const customerKey = (email: string) => email.trim().toLowerCase();

