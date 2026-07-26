import { requireAdminApi } from "@/lib/admin/auth";
import { listKyc } from "@/lib/admin/kyc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdminApi();
  if (denied) return denied;
  return Response.json({ records: await listKyc() });
}
