import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import {
  DocumentError,
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
    await recordActivity("Updated document", document.number, document.status);
    return Response.json({ document });
  } catch (error) {
    return documentErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const document = await voidDocument(params.number);
    await recordActivity("Voided document", document.number, document.customer.name);
    return Response.json({ document });
  } catch (error) {
    return documentErrorResponse(error);
  }
}
