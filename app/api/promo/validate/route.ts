import { products } from "@/data/products";
import { deriveDiamondWorld } from "@/lib/commerce/diamond-worlds";
import { customerRedemptionCount, getPromo } from "@/lib/admin/promo-codes";
import { evaluatePromo, type PromoCartItem } from "@/lib/admin/promo-shared";
import { getCustomer } from "@/lib/admin/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = { slug?: unknown; qty?: unknown };

/**
 * Checks a promotion code against the bag. Prices, categories, and worlds are
 * resolved from the catalogue here — never taken from the request — so a code
 * cannot be talked into discounting more than the pieces are actually worth.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    code?: unknown;
    items?: unknown;
    email?: unknown;
  };

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return Response.json({ ok: false, reason: "Enter a code." }, { status: 400 });

  const incoming = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  if (!incoming.length || incoming.length > 20) {
    return Response.json({ ok: false, reason: "Your bag is empty." }, { status: 400 });
  }

  const items: PromoCartItem[] = [];
  for (const entry of incoming) {
    const product = products.find((candidate) => candidate.slug === entry.slug);
    if (!product) continue;
    const qty = Number.isInteger(entry.qty) ? Math.min(10, Math.max(1, Number(entry.qty))) : 1;
    items.push({
      slug: product.slug,
      sku: product.sku,
      category: product.category,
      world: deriveDiamondWorld(product),
      price: Math.round(product.price * 100),
      qty,
    });
  }
  if (!items.length) {
    return Response.json({ ok: false, reason: "Your bag is empty." }, { status: 400 });
  }

  const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : undefined;
  const promo = await getPromo(code).catch(() => null);
  const [customerRedemptions, customer] = await Promise.all([
    promo ? customerRedemptionCount(promo.code, email).catch(() => 0) : Promise.resolve(0),
    email ? getCustomer(email).catch(() => null) : Promise.resolve(null),
  ]);

  const result = evaluatePromo(promo, items, {
    customerRedemptions,
    isFirstOrder: email ? !customer || customer.orderCount === 0 : undefined,
  });

  return Response.json(result, { status: result.ok ? 200 : 200 });
}
