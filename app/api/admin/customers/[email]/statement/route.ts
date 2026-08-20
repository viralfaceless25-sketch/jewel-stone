import { requireAdminApi } from "@/lib/admin/auth";
import { getCustomer } from "@/lib/admin/orders";
import { listDocuments } from "@/lib/admin/documents";
import { renderStatementPdf, type StatementType } from "@/lib/admin/statement-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: { email: string } };

/** Per-customer PDF statement: paid invoices, or open invoices with due dates. */
export async function GET(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;

  const email = decodeURIComponent(params.email);
  const customer = await getCustomer(email);
  if (!customer) return Response.json({ error: "Customer not found." }, { status: 404 });

  const typeParam = new URL(request.url).searchParams.get("type");
  const type: StatementType = typeParam === "paid" ? "paid" : "open";

  const allDocuments = await listDocuments().catch(() => []);
  const documents = allDocuments.filter(
    (document) => document.customer.email?.toLowerCase() === email.toLowerCase(),
  );

  const pdf = await renderStatementPdf(customer, documents, type);
  const name = `jewel-stone-statement-${type}-${email.replace(/[^a-z0-9]+/gi, "-")}.pdf`;

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
