import { NextResponse } from "next/server";
import { saveInquiry } from "@/lib/admin/leads";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 6 * 1024 * 1024;
const MAX_TOTAL_SIZE = 24 * 1024 * 1024;
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;

type Inquiry = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  context?: string;
  company?: string;
};

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : undefined;
}

function safeFilename(name: string, index: number) {
  const cleaned = name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120);
  return cleaned || `reference-angle-${index + 1}.jpg`;
}

async function readRequest(request: Request): Promise<{ body: Inquiry; files: File[] }> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return {
      body: {
        name: field(form, "name"),
        email: field(form, "email"),
        phone: field(form, "phone"),
        message: field(form, "message"),
        context: field(form, "context"),
        company: field(form, "company"),
      },
      files: form
        .getAll("referenceImages")
        .filter((value): value is File => typeof value !== "string" && value.size > 0),
    };
  }
  return { body: await request.json() as Inquiry, files: [] };
}

export async function POST(request: Request) {
  let body: Inquiry;
  let files: File[];
  try {
    ({ body, files } = await readRequest(request));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.company) return NextResponse.json({ ok: true });

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim();
  const context = (body.context?.trim() || "Website").replace(/[\r\n]+/g, " ").slice(0, 120);
  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Name, valid email, and message are required." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || phone.length > 80 || message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Choose no more than ${MAX_FILES} reference images.` }, { status: 400 });
  }
  const unsupported = files.find((file) => !(file.type.startsWith("image/") || IMAGE_EXTENSION.test(file.name)));
  if (unsupported) {
    return NextResponse.json({ error: `${unsupported.name} is not a supported image.` }, { status: 400 });
  }
  const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
  if (oversized) {
    return NextResponse.json({ error: `${oversized.name} is over the 6 MB per-image limit.` }, { status: 400 });
  }
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_SIZE) {
    return NextResponse.json({ error: "Reference images must be 24 MB or less in total." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? "ishan@thejewelstone.com";
  // onboarding@resend.dev works with no domain verification (delivers to the
  // Resend account's own address); swap to a verified sender for production.
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>";
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Online delivery is being configured. Please email or call us directly." },
      { status: 503 },
    );
  }

  const attachments = await Promise.all(files.map(async (file, index) => ({
    filename: safeFilename(file.name, index),
    content: Buffer.from(await file.arrayBuffer()).toString("base64"),
  })));

  await saveInquiry({
    name,
    email,
    phone,
    context,
    message,
    referenceFiles: files.map((file, index) => safeFilename(file.name, index)),
  }).catch((error) => console.error("inquiry admin record failed", error));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Jewel Stone inquiry · ${context}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Reference images: ${files.length || "None"}`,
        "",
        message,
      ].join("\n"),
      attachments: attachments.length ? attachments : undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend inquiry error", response.status, detail);
    let reason = "Message could not be delivered. Please try again or contact us directly.";
    try {
      const parsed = JSON.parse(detail) as { message?: string };
      if (parsed.message) reason = parsed.message;
    } catch {}
    return NextResponse.json({ error: reason }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
