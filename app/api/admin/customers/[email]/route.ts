import { requireAdminApi } from "@/lib/admin/auth";
import {
  getCustomer,
  listOrdersForCustomer,
  updateCustomerNotes,
  updateCustomerTerms,
} from "@/lib/admin/orders";
import { resolveTerms } from "@/lib/admin/terms";

type Context = { params: { email: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);
  const customer = await getCustomer(email);
  if (!customer) return Response.json({ error: "Customer not found." }, { status: 404 });
  return Response.json({
    customer,
    orders: await listOrdersForCustomer(email),
    terms: await resolveTerms(email),
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);
  const body = (await request.json().catch(() => ({}))) as {
    notes?: unknown;
    paymentTerms?: unknown;
    memoDays?: unknown;
    invoiceDueDays?: unknown;
  };

  // Trading terms for this account — blank values fall back to the house default.
  if (body.paymentTerms !== undefined || body.memoDays !== undefined || body.invoiceDueDays !== undefined) {
    const memoDaysRaw = body.memoDays;
    const invoiceDueDaysRaw = body.invoiceDueDays;
    const updated = await updateCustomerTerms(email, {
      ...(body.paymentTerms !== undefined
        ? { paymentTerms: typeof body.paymentTerms === "string" ? body.paymentTerms : null }
        : {}),
      ...(body.memoDays !== undefined
        ? {
            memoDays:
              memoDaysRaw === null || memoDaysRaw === "" ? null : Number(memoDaysRaw),
          }
        : {}),
      ...(body.invoiceDueDays !== undefined
        ? {
            invoiceDueDays:
              invoiceDueDaysRaw === null || invoiceDueDaysRaw === "" ? null : Number(invoiceDueDaysRaw),
          }
        : {}),
    });
    return updated
      ? Response.json({ customer: updated, terms: await resolveTerms(email) })
      : Response.json({ error: "Customer not found." }, { status: 404 });
  }

  if (typeof body.notes !== "string") {
    return Response.json({ error: "Notes must be text." }, { status: 400 });
  }
  const customer = await updateCustomerNotes(email, body.notes);
  return customer
    ? Response.json({ customer })
    : Response.json({ error: "Customer not found." }, { status: 404 });
}
