import { requireAdminApi } from "@/lib/admin/auth";
import {
  getCustomer,
  listOrdersForCustomer,
  updateCustomerNotes,
} from "@/lib/admin/orders";

type Context = { params: { email: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);
  const customer = await getCustomer(email);
  if (!customer) return Response.json({ error: "Customer not found." }, { status: 404 });
  return Response.json({ customer, orders: await listOrdersForCustomer(email) });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as { notes?: unknown };
  if (typeof body.notes !== "string") {
    return Response.json({ error: "Notes must be text." }, { status: 400 });
  }
  const customer = await updateCustomerNotes(decodeURIComponent(params.email), body.notes);
  return customer
    ? Response.json({ customer })
    : Response.json({ error: "Customer not found." }, { status: 404 });
}
