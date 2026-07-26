import { requireAdminApi } from "@/lib/admin/auth";
import { addKycFile, approvalBlockers, removeKycFile, type KycFileKind } from "@/lib/admin/kyc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: { email: string } };

// Serverless request bodies are capped around 4.5 MB; keep a safety margin.
const MAX_BYTES = 3.5 * 1024 * 1024;
const ALLOWED = /^(application\/pdf|image\/(jpeg|png|webp|heic|heif))$/i;

export async function POST(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const email = decodeURIComponent(params.email);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File is over the 3.5 MB limit. Scan or photograph at a smaller size." }, { status: 400 });
  }
  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED.test(mimeType)) {
    return Response.json({ error: "Upload a PDF or an image (JPG, PNG, WEBP, HEIC)." }, { status: 400 });
  }

  const kindInput = String(form.get("kind") ?? "id_document");
  const kind: KycFileKind = kindInput === "kyc_form" ? "kyc_form" : "id_document";
  const label = String(form.get("label") ?? (kind === "kyc_form" ? "Signed KYC form" : "Identity document")).trim().slice(0, 80);

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const record = await addKycFile(email, {
    kind,
    label: label || "Document",
    fileName: file.name.slice(0, 160) || "document",
    mimeType,
    dataUrl,
  });
  return Response.json({ record, blockers: approvalBlockers(record) }, { status: 201 });
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const fileId = new URL(request.url).searchParams.get("fileId");
  if (!fileId) return Response.json({ error: "Which document should be removed?" }, { status: 400 });
  const record = await removeKycFile(decodeURIComponent(params.email), fileId);
  return Response.json({ record, blockers: approvalBlockers(record) });
}
