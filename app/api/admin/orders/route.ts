import { requireAdminApi } from "@/lib/admin/auth";
import { listOrders } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    return Response.json({ orders: await listOrders() });
  } catch (error) {
    console.error("admin order list failed", error);
    return Response.json({ error: "Orders could not be loaded." }, { status: 503 });
  }
}

