import { requireAdminApi } from "@/lib/admin/auth";
import { getKyc } from "@/lib/admin/kyc";
import { renderKycFormPdf } from "@/lib/admin/kyc-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The branded KYC form the owner sends to a customer. Without `?email=` it is a
 * blank form; with one it prints whatever has already been transcribed so the
 * customer only has to check and sign.
 */
export async function GET(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;

  const email = new URL(request.url).searchParams.get("email")?.trim();
  const record = email ? await getKyc(email).catch(() => null) : null;
  const pdf = await renderKycFormPdf(record?.business);
  const name = email ? `jewel-stone-kyc-${email.replace(/[^a-z0-9]+/gi, "-")}.pdf` : "jewel-stone-kyc-form.pdf";

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
