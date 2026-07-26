import { NextResponse } from "next/server";
import { DocumentError } from "@/lib/admin/documents";

const messages = {
  document_not_found: ["Document not found.", 404],
  document_void: ["A void document cannot be edited.", 409],
  customer_name_required: ["Add the customer name.", 400],
  customer_email_invalid: ["Enter a valid customer email.", 400],
  line_items_required: ["Add at least one line item.", 400],
} as const;

export function documentErrorResponse(error: unknown) {
  if (error instanceof DocumentError) {
    const [message, status] = messages[error.code];
    return NextResponse.json({ error: message }, { status });
  }
  console.error("admin document operation failed", error);
  return NextResponse.json({ error: "Document operation failed." }, { status: 500 });
}

export async function readJson(request: Request) {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

