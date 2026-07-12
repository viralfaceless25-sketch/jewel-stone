import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

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
      // TODO(client): fulfil the order — email the team, mark the one-of-one piece
      // reserved, etc. session.customer_details has name/email/shipping.
      console.log("✅ paid order", session.id, session.customer_details?.email);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
