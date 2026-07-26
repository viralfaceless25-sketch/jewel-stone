import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { getOrder, updateOrder } from "@/lib/admin/orders";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const denied = requireAdminApi();
  if (denied) return denied;
  if (!stripe) return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  const order = await getOrder(params.id);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  if (!order.paymentIntentId) {
    return Response.json({ error: "No Stripe payment is attached to this order." }, { status: 409 });
  }
  if (order.status === "refunded") return Response.json({ order });
  try {
    await stripe.refunds.create(
      { payment_intent: order.paymentIntentId },
      { idempotencyKey: `jewelstone-refund-${order.id}` },
    );
    const refunded = await updateOrder(order.id, { status: "refunded" });
    await recordActivity("Issued full refund", order.id, `$${(order.amountTotal / 100).toFixed(2)}`);
    return Response.json({ order: refunded });
  } catch (error) {
    console.error("Stripe refund failed", order.id, error);
    return Response.json({ error: "Stripe could not complete the refund." }, { status: 502 });
  }
}
