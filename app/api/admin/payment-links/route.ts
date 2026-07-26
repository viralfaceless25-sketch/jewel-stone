import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { listPaymentLinks, savePaymentLink } from "@/lib/admin/payment-links";
import { checkoutOrigin } from "@/lib/commerce/checkout-policy";
import { parseMoneyToCents } from "@/lib/admin/document-math";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ links: await listPaymentLinks() });
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  if (!stripe) return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const customerName = text(body.customerName, 160);
    const email = text(body.email, 200).toLowerCase();
    const description = text(body.description, 300);
    const amount = parseMoneyToCents(body.amount);
    if (!customerName || !description || amount < 50) {
      return Response.json(
        { error: "Customer, description, and an amount of at least $0.50 are required." },
        { status: 400 },
      );
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Enter a valid customer email." }, { status: 400 });
    }

    const origin = checkoutOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL);
    const reference = `OFF-${randomUUID().slice(0, 8).toUpperCase()}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email || undefined,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: description },
        },
      }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        source: "jewelstone-offsite",
        order_reference: reference,
        customer_name: customerName,
        description,
      },
    });
    if (!session.url) throw new Error("Stripe did not return a checkout link.");
    const record = await savePaymentLink({
      id: reference,
      customerName,
      email,
      description,
      amount,
      url: session.url,
      createdAt: new Date().toISOString(),
    });
    await recordActivity("Created Stripe payment link", reference, `${customerName} · $${(amount / 100).toFixed(2)}`);
    return Response.json({ link: record }, { status: 201 });
  } catch (error) {
    console.error("admin payment link failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create payment link." },
      { status: 502 },
    );
  }
}
