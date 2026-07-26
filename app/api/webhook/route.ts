import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getCustomRequestByPublicToken, saveCustomRequest } from "@/lib/custom-request-store";
import { parseSessionItems, quantitiesBySlug } from "@/lib/admin/order-items";
import { createOrder, upsertCustomerFromOrder } from "@/lib/admin/orders";
import { recordRedemption } from "@/lib/admin/promo-codes";
import type { OrderItem, ShippingAddress } from "@/lib/admin/order-shared";
import { decrementStock, publicCatalog } from "@/lib/admin/inventory";

export const dynamic = "force-dynamic";

const text = (value?: string | null) => value?.trim() ?? "";

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
}

function shippingAddressFrom(session: Stripe.Checkout.Session): ShippingAddress | null {
  const shipping = session.collected_information?.shipping_details?.address ?? null;
  const billing = session.customer_details?.address ?? null;
  const address = shipping ?? billing;
  return address ? {
    line1: text(address.line1),
    line2: text(address.line2),
    city: text(address.city),
    state: text(address.state),
    postalCode: text(address.postal_code),
    country: text(address.country),
  } : null;
}

async function orderItemsFrom(session: Stripe.Checkout.Session): Promise<OrderItem[]> {
  const parsed = parseSessionItems(session.metadata?.items);
  if (parsed.length) {
    const catalog = await publicCatalog();
    return parsed.map((item) => {
      const product = catalog.find((candidate) => candidate.slug === item.slug);
      return {
        slug: item.slug,
        name: product?.name ?? item.slug,
        qty: item.qty,
        unitPrice: product ? Math.round(product.price * 100) : 0,
        metal: item.metal,
        size: item.size,
        grade: item.grade,
      };
    });
  }

  if (!stripe) return [];
  const lines = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });
  return lines.data.map((line) => {
    const expanded = line.price?.product;
    const product =
      expanded && typeof expanded === "object" && !("deleted" in expanded) ? expanded : null;
    const qty = line.quantity && line.quantity > 0 ? line.quantity : 1;
    return {
      slug: text(product?.metadata?.slug),
      name: text(line.description) || text(product?.name) || "Jewel Stone piece",
      qty,
      unitPrice: line.price?.unit_amount ?? Math.round((line.amount_total ?? 0) / qty),
    };
  });
}

async function recordWebOrder(session: Stripe.Checkout.Session) {
  const { order, created } = await createOrder({
    stripeSessionId: session.id,
    paymentIntentId: paymentIntentId(session),
    orderReference: session.metadata?.order_reference,
    items: await orderItemsFrom(session),
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    customer: {
      name: text(session.customer_details?.name) || text(session.collected_information?.shipping_details?.name),
      email: text(session.customer_details?.email) || text(session.customer_email),
      phone: text(session.customer_details?.phone),
    },
    shippingAddress: shippingAddressFrom(session),
  });
  if (!created) return order;
  await upsertCustomerFromOrder(order);
  for (const [slug, quantity] of quantitiesBySlug(order.items)) {
    if (!slug) continue;
    await decrementStock(slug, quantity);
  }
  // Count the promotion code only once the money has actually arrived.
  const promoCode = text(session.metadata?.promo_code);
  if (promoCode) {
    const amountOff = session.total_details?.amount_discount ?? 0;
    await recordRedemption({
      code: promoCode,
      email: order.customer.email,
      orderId: order.id,
      amountOff,
      at: new Date().toISOString(),
    }).catch((error) => console.error("promo redemption not recorded", promoCode, error));
  }
  return order;
}

async function recordCustomOrder(session: Stripe.Checkout.Session) {
  const requestId = session.metadata?.requestId ?? "Custom design";
  const { order, created } = await createOrder({
    stripeSessionId: session.id,
    paymentIntentId: paymentIntentId(session),
    orderReference: requestId,
    items: [{
      slug: `custom-${requestId.toLowerCase()}`,
      name: `Custom design · ${requestId}`,
      qty: 1,
      unitPrice: session.amount_total ?? 0,
    }],
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    customer: {
      name: text(session.customer_details?.name),
      email: text(session.customer_details?.email) || text(session.customer_email),
      phone: text(session.customer_details?.phone),
    },
    shippingAddress: shippingAddressFrom(session),
  });
  if (created) await upsertCustomerFromOrder(order);
  return order;
}

async function recordOffsiteOrder(session: Stripe.Checkout.Session) {
  const description = text(session.metadata?.description) || "Off-site Jewel Stone sale";
  const { order, created } = await createOrder({
    stripeSessionId: session.id,
    paymentIntentId: paymentIntentId(session),
    orderReference: session.metadata?.order_reference,
    items: [{
      slug: `offsite-${text(session.metadata?.order_reference).toLowerCase() || session.id}`,
      name: description,
      qty: 1,
      unitPrice: session.amount_total ?? 0,
    }],
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    customer: {
      name: text(session.customer_details?.name) || text(session.metadata?.customer_name),
      email: text(session.customer_details?.email) || text(session.customer_email),
      phone: text(session.customer_details?.phone),
    },
    shippingAddress: shippingAddressFrom(session),
  });
  if (created) await upsertCustomerFromOrder(order);
  return order;
}

async function notifyOwner(eventId: string, subject: string, lines: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_TO_EMAIL ?? process.env.INQUIRY_TO_EMAIL;
  if (!apiKey || !to) throw new Error("order_notification_unconfigured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `jewelstone-paid-order/${eventId}`,
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>",
      to: [to],
      subject,
      text: lines.join("\n"),
    }),
  });
  if (!response.ok) throw new Error("order_notification_failed");
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ received: true, configured: false });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      request.headers.get("stripe-signature") ?? "",
      secret,
    );
  } catch (error) {
    console.error("webhook signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  try {
    if (session.metadata?.source === "jewelstone-custom") {
      const publicToken = session.metadata.publicToken;
      if (publicToken) {
        const record = await getCustomRequestByPublicToken(publicToken);
        if (record && !record.paidAt) {
          const now = new Date().toISOString();
          await saveCustomRequest({ ...record, paidAt: now, updatedAt: now });
        }
      }
      const order = await recordCustomOrder(session);
      await notifyOwner(event.id, `Custom order paid · ${order.id}`, [
        `Order: ${order.id}`,
        `Request: ${session.metadata.requestId ?? "—"}`,
        `Customer: ${order.customer.name} · ${order.customer.email}`,
        `Amount: ${order.amountTotal ? `$${(order.amountTotal / 100).toFixed(2)}` : "—"}`,
        "",
        "Confirm specifications and begin production in the owner panel.",
      ]);
    } else if (session.metadata?.source === "jewelstone-offsite") {
      const order = await recordOffsiteOrder(session);
      await notifyOwner(event.id, `Off-site payment received · ${order.id}`, [
        `Order: ${order.id}`,
        `Reference: ${order.orderReference ?? "—"}`,
        `Customer: ${order.customer.name} · ${order.customer.email}`,
        `Amount: ${order.amountTotal ? `$${(order.amountTotal / 100).toFixed(2)}` : "—"}`,
        `Item: ${order.items[0]?.name ?? "Off-site sale"}`,
        "",
        "Payment and customer record are available in the owner panel.",
      ]);
    } else if (session.metadata?.source === "jewelstone-web") {
      const order = await recordWebOrder(session);
      await notifyOwner(event.id, `Paid Jewel Stone order · ${order.id}`, [
        `Order: ${order.id}`,
        `Customer: ${order.customer.name} · ${order.customer.email}`,
        `Amount: ${order.amountTotal ? `$${(order.amountTotal / 100).toFixed(2)}` : "—"}`,
        `Items: ${order.items.map((item) => `${item.qty}× ${item.name}`).join(" · ")}`,
        "",
        "Confirm availability and begin insured fulfillment in the owner panel.",
      ]);
    }
  } catch (error) {
    console.error("paid order processing failed", session.id, error);
    return NextResponse.json({ error: "order_processing_failed" }, { status: 503 });
  }

  return NextResponse.json({ received: true });
}
