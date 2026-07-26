import { requireAdminApi } from "@/lib/admin/auth";
import {
  PromoError,
  deletePromo,
  listPromos,
  listRedemptions,
  savePromo,
  setPromoActive,
  type PromoKind,
  type PromoScope,
} from "@/lib/admin/promo-codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const code = new URL(request.url).searchParams.get("code");
  if (code) return Response.json({ redemptions: await listRedemptions(code) });
  return Response.json({ promos: await listPromos() });
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    const promo = await savePromo({
      code: String(body.code ?? ""),
      kind: (String(body.kind ?? "percent") as PromoKind),
      value: Number(body.value ?? 0),
      active: body.active === undefined ? undefined : Boolean(body.active),
      startsAt: typeof body.startsAt === "string" ? body.startsAt : undefined,
      expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
      minSubtotal: body.minSubtotal === undefined ? undefined : Number(body.minSubtotal),
      maxRedemptions: body.maxRedemptions === undefined ? undefined : Number(body.maxRedemptions),
      perCustomerLimit: body.perCustomerLimit === undefined ? undefined : Number(body.perCustomerLimit),
      scope: (String(body.scope ?? "all") as PromoScope),
      scopeValues: Array.isArray(body.scopeValues) ? body.scopeValues.map(String) : [],
      firstOrderOnly: Boolean(body.firstOrderOnly),
      notes: typeof body.notes === "string" ? body.notes : "",
    });
    return Response.json({ promo }, { status: 201 });
  } catch (error) {
    if (error instanceof PromoError) return Response.json({ error: error.message }, { status: 400 });
    throw error;
  }
}

export async function PATCH(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { code?: unknown; active?: unknown };
  if (typeof body.code !== "string" || typeof body.active !== "boolean") {
    return Response.json({ error: "Which code should change?" }, { status: 400 });
  }
  const promo = await setPromoActive(body.code, body.active);
  return promo ? Response.json({ promo }) : Response.json({ error: "Code not found." }, { status: 404 });
}

export async function DELETE(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return Response.json({ error: "Which code should be removed?" }, { status: 400 });
  await deletePromo(code);
  return Response.json({ ok: true });
}
