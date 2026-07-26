import { requireAdminApi } from "@/lib/admin/auth";
import { getKycFileData } from "@/lib/admin/kyc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Streams a stored KYC document back to the owner for viewing or download. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const denied = requireAdminApi();
  if (denied) return denied;

  const dataUrl = await getKycFileData(params.id);
  if (!dataUrl) return Response.json({ error: "Document not found." }, { status: 404 });

  const match = /^data:([^;]+);base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) return Response.json({ error: "Document is unreadable." }, { status: 500 });

  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
