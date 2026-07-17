import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products } from "@/data/products";

export const dynamic = "force-dynamic";

type IncomingItem = {
  slug: string;
  metal?: string;
  size?: string;
  grade?: string;
  qty: number;
};

export async function POST(req: Request) {
  // Not configured yet → tell the client to use the reservation flow.
  if (!stripe) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  try {
    const body = (await req.json()) as { items?: IncomingItem[]; email?: string };
    const incoming = body.items ?? [];
    if (!incoming.length || incoming.length > 20) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const items = incoming.map((item) => {
      const product = products.find((candidate) => candidate.slug === item.slug);
      const qty = Number.isInteger(item.qty) ? item.qty : 0;
      if (!product || qty < 1 || qty > 10) throw new Error("invalid_cart_item");
      if (product.source === "signature" && qty !== 1) throw new Error("signature_quantity");
      return { ...item, qty, product };
    });

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.product.price * 100),
          product_data: {
            name: i.product.name,
            description: [i.metal, i.size ? `Size ${i.size}` : null, i.grade].filter(Boolean).join(" · ") || undefined,
            images: [new URL(i.product.image, origin).toString()],
            metadata: { slug: i.slug },
          },
        },
      })),
      customer_email: body.email || undefined,
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        source: "jewelstone-web",
        items: items.map((i) => `${i.slug}:${i.qty}:${i.metal ?? ""}:${i.size ?? ""}:${i.grade ?? ""}`).join("|").slice(0, 500),
      },
    });

    return NextResponse.json({ enabled: true, url: session.url });
  } catch (err) {
    if (err instanceof Error && ["invalid_cart_item", "signature_quantity"].includes(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("checkout error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
