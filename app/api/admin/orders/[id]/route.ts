import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { getOrder, updateOrder } from "@/lib/admin/orders";
import { isOrderStatus } from "@/lib/admin/order-shared";

type Context = { params: { id: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const order = await getOrder(params.id);
  return order ? Response.json({ order }) : Response.json({ error: "Order not found." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.status !== undefined && !isOrderStatus(body.status)) {
    return Response.json({ error: "Invalid order status." }, { status: 400 });
  }
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber : undefined;
  const trackingUrl = typeof body.trackingUrl === "string" ? body.trackingUrl.trim() : undefined;
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    return Response.json({ error: "Tracking link must start with http:// or https://." }, { status: 400 });
  }
  const order = await updateOrder(params.id, {
    status: isOrderStatus(body.status) ? body.status : undefined,
    trackingNumber,
    trackingUrl,
  });
  if (order) await recordActivity("Updated order", order.id, order.status.replaceAll("_", " "));
  return order ? Response.json({ order }) : Response.json({ error: "Order not found." }, { status: 404 });
}
