import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { DocumentEmailError, sendDocumentEmail } from "@/lib/admin/document-email";
import { DocumentError, getDocument, updateDocument } from "@/lib/admin/documents";
import { documentErrorResponse, readJson } from "../../errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { number: string } }) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const document = await getDocument(params.number);
    if (!document) throw new DocumentError("document_not_found");
    if (document.status === "void") throw new DocumentError("document_void");
    const body = await readJson(request);
    const message = String(body.message ?? "").trim().slice(0, 2000);
    await sendDocumentEmail(document, message);
    const updated =
      document.status === "paid" || document.status === "returned"
        ? document
        : await updateDocument(document.number, { status: "sent" });
    await recordActivity("Emailed PDF", document.number, document.customer.email);
    return Response.json({ document: updated, sentTo: document.customer.email });
  } catch (error) {
    if (error instanceof DocumentEmailError) {
      const mapping = {
        email_unconfigured: ["Email is not configured.", 503],
        customer_email_missing: ["Add the customer email before sending.", 400],
        email_failed: ["Email service rejected the message.", 502],
      } as const;
      const [message, status] = mapping[error.code];
      return Response.json({ error: message }, { status });
    }
    return documentErrorResponse(error);
  }
}
