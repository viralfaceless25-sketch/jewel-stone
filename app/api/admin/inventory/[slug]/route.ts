import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import {
  deleteAdminProduct,
  getAdminProduct,
  saveAdminProduct,
  setOverlay,
} from "@/lib/admin/inventory";
import {
  buildProduct,
  readDraft,
  revalidateStorefront,
  takenSlugs,
  uniqueSlug,
  validateImages,
} from "../helpers";

type Context = { params: { slug: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const product = await getAdminProduct(params.slug);
  return product ? Response.json({ product }) : Response.json({ error: "Product not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const existing = await getAdminProduct(params.slug);
  if (!existing) return Response.json({ error: "Only admin-created products can be edited here." }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.action === "images") {
    const result = validateImages(body.images);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    const displayCount = Math.min(result.images.length, Math.max(0, Math.round(Number(body.displayCount) || result.images.length)));
    const product = { ...existing, images: result.images, displayCount, updatedAt: new Date().toISOString() };
    await saveAdminProduct(product);
    await recordActivity("Updated product images", product.sku || product.slug, `${product.images.length} images`);
    revalidateStorefront();
    return Response.json({ product });
  }

  if (body.action === "duplicate") {
    const slug = uniqueSlug(`${existing.slug}-copy`, await takenSlugs());
    const now = new Date().toISOString();
    const product = {
      ...existing,
      slug,
      sku: `${existing.sku}-COPY`.slice(0, 64),
      name: `${existing.name} copy`,
      createdAt: now,
      updatedAt: now,
    };
    await saveAdminProduct(product);
    await setOverlay(slug, { stock: 0, visible: false });
    await recordActivity("Duplicated product", product.sku || product.slug, product.name);
    revalidateStorefront();
    return Response.json({ product }, { status: 201 });
  }

  const result = readDraft({ ...existing, ...body });
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  const product = buildProduct(result.draft, existing.slug, existing);
  await saveAdminProduct(product);
  await recordActivity("Edited product", product.sku || product.slug, product.name);
  revalidateStorefront();
  return Response.json({ product });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const existing = await getAdminProduct(params.slug);
  if (!existing) return Response.json({ error: "Only admin-created products can be deleted." }, { status: 404 });
  await deleteAdminProduct(params.slug);
  await setOverlay(params.slug, { stock: 0, visible: false });
  await recordActivity("Deleted product", existing.sku || existing.slug, existing.name);
  revalidateStorefront();
  return Response.json({ ok: true });
}
