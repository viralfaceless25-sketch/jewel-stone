import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { recordPaidDocument, syncDocumentCustomer } from "@/lib/admin/document-orders";
import {
  DocumentError,
  deleteDocument,
  getDocument,
  updateDocument,
  voidDocument,
  type DocumentPatch,
} from "@/lib/admin/documents";
import { isDocumentStatus } from "@/lib/admin/document-math";
import { documentErrorResponse, readJson } from "../errors";

type Context = { params: { number: string } };

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const document = await getDocument(params.number);
    if (!document) throw new DocumentError("document_not_found");
    return Response.json({ document });
  } catch (error) {
    return documentErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (body.action === "void") {
      const document = await voidDocument(params.number);
      await recordActivity("Voided document", document.number, document.customer.name);
      return Response.json({ document });
    }
    const patch: DocumentPatch = {
      customer: body.customer as DocumentPatch["customer"],
      lineItems: body.lineItems,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      terms: body.terms,
      taxRate: body.taxRate,
      shipping: body.shipping,
      notes: body.notes,
      paymentInstructions: body.paymentInstructions,
      orderId: body.orderId,
      status: isDocumentStatus(body.status) ? body.status : undefined,
    };
    Object.keys(patch).forEach((key) => {
      if (patch[key as keyof DocumentPatch] === undefined) delete patch[key as keyof DocumentPatch];
    });
    const document = await updateDocument(params.number, patch);
    await syncDocumentCustomer(document);
    // A paid invoice is a real sale — record it so Orders and revenue include it.
    await recordPaidDocument(document);
    await recordActivity("Updated document", document.number, document.status);
    return Response.json({ document });
  } catch (error) {
    return documentErrorResponse(error);
  }
}

/**
 * Plain DELETE voids the document (status becomes "void"; the number and
 * record stay for the audit trail) - this is what the "Void" button in the
 * admin panel calls. ?hard=1 removes the record entirely instead, for
 * genuine mistakes rather than cancelled sales.
 */
export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    if (new URL(request.url).searchParams.get("hard") === "1") {
      const document = await getDocument(params.number);
      if (!document) throw new DocumentError("document_not_found");
      await deleteDocument(params.number);
      await recordActivity("Deleted document", document.number, document.customer.name);
      return Response.json({ ok: true });
    }
    const document = await voidDocument(params.number);
    await recordActivity("Voided document", document.number, document.customer.name);
    return Response.json({ document });
  } catch (error) {
    return documentErrorResponse(error);
  }
}
