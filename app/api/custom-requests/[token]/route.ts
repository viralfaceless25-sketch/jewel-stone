import { NextResponse } from "next/server";
import { checkoutOrigin } from "@/lib/commerce/checkout-policy";
import { canCustomerDecide, toCustomerCustomRequest, type CustomDecision, type CustomRequestRecord } from "@/lib/custom-request-types";
import { notifyCustomerDecision } from "@/lib/custom-request-notifications";
import { CustomRequestStoreError, getCustomRequestByPublicToken, saveCustomRequest } from "@/lib/custom-request-store";
import { stripe } from "@/lib/stripe";

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
    const updated: CustomRequestRecord = {
      ...record,
      status: decision.value,
      decision,
      updatedAt: now,
    };
    const origin = checkoutOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL);

    // Accepting a quotation that carries an exact amount collects payment on Stripe.
    let paymentUrl: string | undefined;
    if (decision.value === "accepted" && record.quote?.amountCents && stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: record.email,
        billing_address_collection: "required",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: record.quote.amountCents,
            product_data: {
              name: `Jewel Stone custom piece · ${record.id}`,
              description: `${record.choices.type} · ${record.choices.metal} · ${record.choices.shape}`.slice(0, 200),
            },
          },
        }],
        success_url: `${origin}/custom/request/${record.publicToken}?paid=1`,
        cancel_url: `${origin}/custom/request/${record.publicToken}`,
        metadata: { source: "jewelstone-custom", requestId: record.id, publicToken: record.publicToken },
      });
      updated.paymentSessionId = session.id;
      paymentUrl = session.url ?? undefined;
    }

    await saveCustomRequest(updated);
    const notified = await notifyCustomerDecision(updated, origin);
    return NextResponse.json({ request: toCustomerCustomRequest(updated), notified, paymentUrl });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    return storeError(error);
  }
}
