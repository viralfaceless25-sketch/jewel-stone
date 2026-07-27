import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import {
  getAdminProduct,
  listInventory,
  saveAdminProduct,
  setOverlay,
} from "@/lib/admin/inventory";
import {
  buildProduct,
  readDraft,
  revalidateStorefront,
  takenSlugs,
  uniqueSlug,
} from "./helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ inventory: await listInventory() });
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = readDraft(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  const slug = uniqueSlug(result.draft.sku || result.draft.name, await takenSlugs());
  const product = buildProduct(result.draft, slug, null);
  await saveAdminProduct(product);
  await setOverlay(slug, { stock: Math.max(0, Math.round(Number(body.stock) || 0)), visible: false });
  await recordActivity("Created product", product.sku || product.slug, product.name);
  revalidateStorefront();
  return Response.json({ product, warning: "Add at least one image before publishing." }, { status: 201 });
}

export async function PATCH(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.action === "bulk_price") {
    const changes = Array.isArray(body.changes) ? body.changes.slice(0, 500) : [];
    let updated = 0;
    for (const change of changes) {
      const row = (change ?? {}) as Record<string, unknown>;
      const rowSlug = typeof row.slug === "string" ? row.slug : "";
      const price = Math.round(Number(row.price));
      if (!rowSlug || !Number.isFinite(price) || price <= 0) continue;
      await setOverlay(rowSlug, { price });
      updated += 1;
    }
    revalidateStorefront();
    await recordActivity("Bulk price update", `${updated} products`, "Website prices changed");
    return Response.json({ updated });
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug) return Response.json({ error: "Missing product." }, { status: 400 });
  const rawStock = body.stock === undefined ? undefined : Number(body.stock);
  const rawPrice = body.price === undefined ? undefined : Number(body.price);
  if (rawStock !== undefined && !Number.isFinite(rawStock)) {
    return Response.json({ error: "Stock must be a number." }, { status: 400 });
  }
  if (rawPrice !== undefined && !Number.isFinite(rawPrice)) {
    return Response.json({ error: "Price must be a number." }, { status: 400 });
  }
  const stock = rawStock === undefined ? undefined : Math.max(0, Math.round(rawStock));
  const visible = typeof body.visible === "boolean" ? body.visible : undefined;
  const price = rawPrice === undefined ? undefined : Math.max(0, Math.round(rawPrice));
  if (visible) {
    const adminProduct = await getAdminProduct(slug);
    if (adminProduct && !adminProduct.images.length) {
      return Response.json({ error: "Upload at least one image before publishing." }, { status: 409 });
    }
  }
  const overlay = await setOverlay(slug, { stock, visible, price });
  await recordActivity("Updated inventory", slug, [
    stock === undefined ? "" : `stock ${stock}`,
    visible === undefined ? "" : visible ? "shown" : "hidden",
    price === undefined ? "" : `price $${price}`,
  ].filter(Boolean).join(" · "));
  revalidateStorefront();
  return Response.json({ overlay });
}
