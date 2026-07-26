import { requireAdminApi } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/orders";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ customers: await listCustomers() });
}

