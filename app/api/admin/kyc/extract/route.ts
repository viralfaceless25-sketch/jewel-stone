import { requireAdminApi } from "@/lib/admin/auth";
import { extractKycForm } from "@/lib/admin/kyc-extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Reads a returned KYC form and suggests field values. Nothing is saved here —
 * the owner reviews the extraction in the form before committing it.
 */
export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload could not be read." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose the filled KYC form." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File is over the 8 MB limit." }, { status: 400 });
  }
  if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
    return Response.json(
      { error: "Automatic reading works with PDF forms. For photos, enter the details manually." },
      { status: 400 },
    );
  }

  const extraction = await extractKycForm(Buffer.from(await file.arrayBuffer()));
  return Response.json(extraction);
}
