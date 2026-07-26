import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { publicCatalog, publicStateFor } from "@/lib/admin/inventory";
import { checkoutMode, checkoutOrigin, envFlag } from "@/lib/commerce/checkout-policy";
import { deriveDiamondWorld } from "@/lib/commerce/diamond-worlds";
import { customerRedemptionCount, getPromo } from "@/lib/admin/promo-codes";
import { evaluatePromo } from "@/lib/admin/promo-shared";
import { getCustomer } from "@/lib/admin/orders";
import { KvError } from "@/lib/kv";

export const dynamic = "force-dynamic";

type IncomingItem = {
  slug: string;
  metal?: string;
  size?: string;
  grade?: string;
  qty: number;
};

function cleanOption(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("invalid_cart_item");
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > 80) throw new Error("invalid_cart_item");
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: IncomingItem[]; promoCode?: string; email?: string };
    const incoming = Array.isArray(body.items) ? body.items : [];
    if (!incoming.length || incoming.length > 20) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const catalog = await publicCatalog();
    const items = await Promise.all(incoming.map(async (item) => {
      if (!item || typeof item !== "object") throw new Error("invalid_cart_item");
      const product = catalog.find((candidate) => candidate.slug === item.slug);
      const qty = Number.isInteger(item.qty) ? item.qty : 0;
      if (!product || qty < 1 || qty > 10) throw new Error("invalid_cart_item");
      if (product.source === "signature" && qty !== 1) throw new Error("signature_quantity");
      const availability = await publicStateFor(product.slug);
      if (!availability.visible || availability.stock < qty) throw new Error("sold_out");
      return {
        slug: item.slug,
        qty,
        metal: cleanOption(item.metal),
        size: cleanOption(item.size),
        grade: cleanOption(item.grade),
        product,
      };
    }));

    const allowsSignatureCheckout = envFlag(process.env.STRIPE_ALLOW_SIGNATURE_CHECKOUT);
    if (checkoutMode(items.map((item) => item.product.source), allowsSignatureCheckout) === "reservation") {
      return NextResponse.json({
        enabled: false,
        reservationRequired: true,
        reason: "signature_inventory",
      });
    }

    // Missing payment configuration remains a clean reservation fallback.
    if (!stripe) {
      return NextResponse.json({
        enabled: false,
        reservationRequired: true,
        reason: "stripe_not_configured",
      });
    }

    const origin = checkoutOrigin(
      req.url,
      process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL,
    );
    const orderReference = randomUUID();

    // A validated promotion code becomes a one-shot Stripe coupon on this
    // session. It is re-checked here so a tampered client can't invent a discount.
    let discounts: { coupon: string }[] | undefined;
    let appliedPromo = "";
    const requestedCode = typeof body.promoCode === "string" ? body.promoCode.trim() : "";
    if (requestedCode) {
      const promo = await getPromo(requestedCode).catch(() => null);
      const email = typeof body.email === "string" && body.email.includes("@") ? body.email.trim() : undefined;
      const [customerRedemptions, customer] = await Promise.all([
        promo ? customerRedemptionCount(promo.code, email).catch(() => 0) : Promise.resolve(0),
        email ? getCustomer(email).catch(() => null) : Promise.resolve(null),
      ]);
      const evaluation = evaluatePromo(
        promo,
        items.map((i) => ({
          slug: i.slug,
          sku: i.product.sku,
          category: i.product.category,
          world: deriveDiamondWorld(i.product),
          price: Math.round(i.product.price * 100),
          qty: i.qty,
        })),
        {
          customerRedemptions,
          isFirstOrder: email ? !customer || customer.orderCount === 0 : undefined,
        },
      );
      if (!evaluation.ok) {
        return NextResponse.json({ error: "promo_invalid", reason: evaluation.reason }, { status: 400 });
      }
      if (evaluation.amountOff > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: evaluation.amountOff,
          currency: "usd",
          duration: "once",
          name: `${evaluation.code} — ${evaluation.label}`,
          max_redemptions: 1,
        });
        discounts = [{ coupon: coupon.id }];
      }
      appliedPromo = evaluation.code;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: orderReference,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.product.price * 100),
          product_data: {
            name: i.product.name,
            description: [i.metal, i.size ? `Size ${i.size}` : null, i.grade].filter(Boolean).join(" · ") || undefined,
            images: i.product.image.startsWith("data:")
              ? undefined
              : [new URL(i.product.image, origin).toString()],
            metadata: { slug: i.slug },
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
      automatic_tax: { enabled: envFlag(process.env.STRIPE_AUTOMATIC_TAX) },
      ...(discounts ? { discounts } : { allow_promotion_codes: envFlag(process.env.STRIPE_ALLOW_PROMOTION_CODES) || undefined }),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        source: "jewelstone-web",
        order_reference: orderReference,
        ...(appliedPromo ? { promo_code: appliedPromo } : {}),
        items: items.map((i) => `${i.slug}:${i.qty}:${i.metal ?? ""}:${i.size ?? ""}:${i.grade ?? ""}`).join("|").slice(0, 500),
      },
    });

    return NextResponse.json({ enabled: true, url: session.url });
  } catch (err) {
    if (err instanceof Error && ["invalid_cart_item", "signature_quantity", "sold_out"].includes(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    if (err instanceof KvError) {
      console.error("checkout inventory store unavailable");
      return NextResponse.json({ error: "inventory_unavailable" }, { status: 503 });
    }
    if (err instanceof Error && ["site_url_unconfigured", "site_url_invalid"].includes(err.message)) {
      console.error("checkout site URL is not configured safely");
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("checkout error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
