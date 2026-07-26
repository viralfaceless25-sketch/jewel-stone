import { requireAdminApi } from "@/lib/admin/auth";
import { DocumentError, getDocument } from "@/lib/admin/documents";
import { renderDocumentPdf } from "@/lib/admin/document-pdf";
import { documentErrorResponse } from "../../errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { number: string } }) {
  const denied = requireAdminApi();
  if (denied) return denied;
  try {
    const document = await getDocument(params.number);
    if (!document) throw new DocumentError("document_not_found");
    const bytes = await renderDocumentPdf(document);
    const inline = new URL(request.url).searchParams.get("inline") === "1";
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${document.number}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return documentErrorResponse(error);
  }
}
