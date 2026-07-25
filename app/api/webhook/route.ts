import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCustomRequestByPublicToken, saveCustomRequest } from "@/lib/custom-request-store";

export const dynamic = "force-dynamic";

// Stripe posts payment events here. Set STRIPE_WEBHOOK_SECRET and register this
// endpoint (…/api/webhook) in the Stripe Dashboard → Developers → Webhooks.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true, configured: false });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status !== "paid") break;
      const source = session.metadata?.source;

      // Paid custom quotation → stamp the request paid and alert the owner.
      if (source === "jewelstone-custom") {
        const publicToken = session.metadata?.publicToken;
        if (publicToken) {
          try {
            const record = await getCustomRequestByPublicToken(publicToken);
            if (record && !record.paidAt) {
              const now = new Date().toISOString();
              await saveCustomRequest({ ...record, paidAt: now, updatedAt: now });
            }
          } catch (err) {
            console.error("custom paid update failed", session.id, err);
          }
        }
        const apiKey = process.env.RESEND_API_KEY;
        const to = process.env.ORDER_TO_EMAIL ?? process.env.INQUIRY_TO_EMAIL;
        const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>";
        if (apiKey && to) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": `jewelstone-custom-paid/${event.id}`,
            },
            body: JSON.stringify({
              from,
              to: [to],
              subject: `Custom order PAID · ${session.metadata?.requestId ?? session.id}`,
              text: [
                "A custom quotation has been paid in full.",
                `Request: ${session.metadata?.requestId ?? "—"}`,
                `Amount: ${session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "—"}`,
                `Customer: ${session.customer_details?.name ?? "—"} · ${session.customer_details?.email ?? session.customer_email ?? "—"}`,
                "",
                "Confirm final specifications and begin production from the owner portal.",
              ].join("\n"),
            }),
          });
        }
        break;
      }

      if (source !== "jewelstone-web") break;

      console.info("paid Jewel Stone checkout", {
        eventId: event.id,
        sessionId: session.id,
        orderReference: session.metadata?.order_reference,
        amountTotal: session.amount_total,
        currency: session.currency,
        items: session.metadata?.items,
      });

      const apiKey = process.env.RESEND_API_KEY;
      const to = process.env.ORDER_TO_EMAIL ?? process.env.INQUIRY_TO_EMAIL;
      const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <orders@jewelstonenyc.com>";
      if (!apiKey || !to) {
        console.error("paid order notification is not configured", session.id);
        return NextResponse.json({ error: "order_notification_unconfigured" }, { status: 503 });
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `jewelstone-paid-order/${event.id}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: `Paid Jewel Stone order · ${session.id}`,
          text: [
            `Stripe session: ${session.id}`,
            `Order reference: ${session.metadata?.order_reference ?? "—"}`,
            `Customer: ${session.customer_details?.name ?? "—"}`,
            `Email: ${session.customer_details?.email ?? session.customer_email ?? "—"}`,
            `Amount: ${session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "—"}`,
            `Items: ${session.metadata?.items ?? "See Stripe session"}`,
            "",
            "Confirm availability, reserve any one-of-one inventory, and begin insured fulfillment.",
          ].join("\n"),
        }),
      });
      if (!response.ok) {
        console.error("paid order notification failed", session.id, response.status);
        return NextResponse.json({ error: "order_notification_failed" }, { status: 502 });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
