import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { createDocument, listDocuments, type DocumentDraft } from "@/lib/admin/documents";
import { documentErrorResponse, readJson } from "./errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    return Response.json({ documents: await listDocuments() });
  } catch (error) {
    return documentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const body = await readJson(request);
    const draft: DocumentDraft = {
      kind: body.kind === "memo" ? "memo" : "invoice",
      customer: (body.customer ?? {}) as DocumentDraft["customer"],
      lineItems: body.lineItems,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      terms: body.terms,
      taxRate: body.taxRate,
      shipping: body.shipping,
      notes: body.notes,
      paymentInstructions: body.paymentInstructions,
      orderId: body.orderId,
    };
    const document = await createDocument(draft);
    await recordActivity(
      `Created ${document.kind === "memo" ? "memorandum" : "invoice"}`,
      document.number,
      document.customer.name,
    );
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    return documentErrorResponse(error);
  }
}
