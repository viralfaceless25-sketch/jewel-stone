import { requireAdminApi } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/orders";
import { listDocuments } from "@/lib/admin/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Temporary diagnostic: shows exactly what's stored for each customer email
 * and each document's customer email, character-for-character (JSON.stringify
 * so trailing spaces / invisible characters show as escapes), so a silent
 * matching mismatch can be spotted instead of guessed at. Remove after use.
 */
export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;

  const [customers, documents] = await Promise.all([listCustomers(), listDocuments()]);

  return Response.json({
    customers: customers.map((c) => ({
      name: c.name,
      email_raw: JSON.stringify(c.email),
      email_normalized: c.email.trim().toLowerCase(),
    })),
    documents: documents.map((d) => ({
      number: d.number,
      kind: d.kind,
      status: d.status,
      total: d.total,
      customerName: d.customer.name,
      email_raw: JSON.stringify(d.customer.email),
      email_normalized: (d.customer.email ?? "").trim().toLowerCase(),
    })),
  });
}
