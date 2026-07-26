import { requireAdminApi } from "@/lib/admin/auth";
import {
  KYC_STATUSES,
  approvalBlockers,
  getKycOrEmpty,
  saveKyc,
  setKycStatus,
  type KycBusiness,
  type KycStatus,
} from "@/lib/admin/kyc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: { email: string } };

const BUSINESS_MAX = 200;

function cleanBusiness(input: unknown): Partial<KycBusiness> {
  if (!input || typeof input !== "object") return {};
  const source = input as Record<string, unknown>;
  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") output[key] = value.trim().slice(0, BUSINESS_MAX);
  }
  return output as Partial<KycBusiness>;
}

export async function GET(_request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const record = await getKycOrEmpty(decodeURIComponent(params.email));
  return Response.json({ record, blockers: approvalBlockers(record) });
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);
  const body = (await request.json().catch(() => ({}))) as {
    business?: unknown;
    notes?: unknown;
    expiresAt?: unknown;
    status?: unknown;
  };

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !KYC_STATUSES.includes(body.status as KycStatus)) {
      return Response.json({ error: "Unknown KYC status." }, { status: 400 });
    }
    try {
      const record = await setKycStatus(email, body.status as KycStatus);
      return Response.json({ record, blockers: approvalBlockers(record) });
    } catch (error) {
      if (error instanceof Error && error.message === "kyc_incomplete") {
        const current = await getKycOrEmpty(email);
        return Response.json(
          { error: "Approval needs the signed form and two identity documents.", blockers: approvalBlockers(current) },
          { status: 409 },
        );
      }
      throw error;
    }
  }

  const record = await saveKyc(email, {
    business: cleanBusiness(body.business) as KycBusiness | undefined,
    notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 3000) : undefined,
    expiresAt: typeof body.expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.expiresAt)
      ? body.expiresAt
      : undefined,
  });
  return Response.json({ record, blockers: approvalBlockers(record) });
}
