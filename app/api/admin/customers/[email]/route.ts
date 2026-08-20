import { requireAdminApi } from "@/lib/admin/auth";
import {
  deleteCustomer,
  getCustomer,
  listOrdersForCustomer,
  updateCustomerNotes,
  updateCustomerProfile,
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
    name?: unknown;
    phone?: unknown;
    address?: unknown;
  };

  // Company profile — name, phone, address. Email is the record's key
  // throughout the system, so it isn't editable here.
  if (body.name !== undefined || body.phone !== undefined || body.address !== undefined) {
    const updated = await updateCustomerProfile(email, {
      ...(typeof body.name === "string" ? { name: body.name } : {}),
      ...(typeof body.phone === "string" ? { phone: body.phone } : {}),
      ...(typeof body.address === "string" ? { address: body.address } : {}),
    });
    return updated
      ? Response.json({ customer: updated })
      : Response.json({ error: "Customer not found." }, { status: 404 });
  }

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

export async function DELETE(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);
  const customer = await getCustomer(email);
  if (!customer) return Response.json({ error: "Customer not found." }, { status: 404 });
  await deleteCustomer(email);
  return Response.json({ ok: true });
}
