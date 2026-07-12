import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type IncomingItem = {
  slug: string;
  name: string;
  price: number; // USD dollars
  image?: string;
  metal?: string;
  size?: string;
  qty: number;
};

export async function POST(req: Request) {
  // Not configured yet → tell the client to use the reservation flow.
  if (!stripe) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  try {
    const body = (await req.json()) as { items: IncomingItem[]; email?: string };
    const items = body.items ?? [];
    if (!items.length) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.price * 100),
          product_data: {
            name: i.name,
            description: [i.metal, i.size ? `Size ${i.size}` : null].filter(Boolean).join(" · ") || undefined,
            images: i.image ? [new URL(i.image, origin).toString()] : undefined,
            metadata: { slug: i.slug },
          },
        },
      })),
      customer_email: body.email || undefined,
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: { source: "jewelstone-web" },
    });

    return NextResponse.json({ enabled: true, url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
