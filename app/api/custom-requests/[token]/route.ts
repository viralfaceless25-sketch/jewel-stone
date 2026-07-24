import { NextResponse } from "next/server";
import { checkoutOrigin } from "@/lib/commerce/checkout-policy";
import { canCustomerDecide, toCustomerCustomRequest, type CustomDecision } from "@/lib/custom-request-types";
import { notifyCustomerDecision } from "@/lib/custom-request-notifications";
import { CustomRequestStoreError, getCustomRequestByPublicToken, saveCustomRequest } from "@/lib/custom-request-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validToken(token: string) {
  return /^[A-Za-z0-9_-]{32}$/.test(token);
}

function storeError(error: unknown) {
  if (error instanceof CustomRequestStoreError) {
    return NextResponse.json({ error: "Quotation tracking is temporarily unavailable." }, { status: 503 });
  }
  console.error("custom customer request failed", error);
  return NextResponse.json({ error: "Quotation tracking is temporarily unavailable." }, { status: 500 });
}

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  try {
    const record = await getCustomRequestByPublicToken(params.token);
    if (!record) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    return NextResponse.json({ request: toCustomerCustomRequest(record) }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    return storeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  try {
    const body = await request.json() as { action?: string; note?: string };
    if (!["accept", "decline"].includes(body.action ?? "")) {
      return NextResponse.json({ error: "Choose accept or decline." }, { status: 400 });
    }
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length > 1000) return NextResponse.json({ error: "Note is too long." }, { status: 400 });

    const record = await getCustomRequestByPublicToken(params.token);
    if (!record) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    if (!canCustomerDecide(record.status)) {
      return NextResponse.json({ error: "This quotation has already been answered or is not ready." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const decision: CustomDecision = {
      value: body.action === "accept" ? "accepted" : "declined",
      note,
      createdAt: now,
    };
    const updated = {
      ...record,
      status: decision.value,
      decision,
      updatedAt: now,
    } as const;
    const origin = checkoutOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL);
    await saveCustomRequest(updated);
    const notified = await notifyCustomerDecision(updated, origin);
    return NextResponse.json({ request: toCustomerCustomRequest(updated), notified });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    return storeError(error);
  }
}
