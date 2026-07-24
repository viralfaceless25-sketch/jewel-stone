import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { checkoutOrigin } from "@/lib/commerce/checkout-policy";
import type { CustomDesignChoices, CustomReferenceFile, CustomRequestRecord } from "@/lib/custom-request-types";
import { notifyRequestCreated, customNotificationsConfigured } from "@/lib/custom-request-notifications";
import { CustomRequestStoreError, saveCustomRequest } from "@/lib/custom-request-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 6 * 1024 * 1024;
const MAX_TOTAL_SIZE = 24 * 1024 * 1024;
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function safeFilename(name: string, index: number) {
  const cleaned = name.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120);
  return cleaned || `reference-angle-${index + 1}.jpg`;
}

function cleanReferenceUrl(value: string) {
  if (!value) return undefined;
  if (value.length > 1000) throw new Error("reference_url_invalid");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("reference_url_invalid");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("reference_url_invalid");
  return parsed.toString();
}

function makeReference(now: Date) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `JS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function makeToken() {
  return randomBytes(24).toString("base64url");
}

function errorResponse(error: unknown) {
  if (error instanceof CustomRequestStoreError) {
    return NextResponse.json(
      { error: error.message === "custom_request_store_unconfigured" ? "Quotation tracking is being configured." : "Request could not be saved." },
      { status: 503 },
    );
  }
  if (error instanceof Error && error.message === "reference_url_invalid") {
    return NextResponse.json({ error: "Enter a valid http or https reference link." }, { status: 400 });
  }
  if (error instanceof Error && ["site_url_unconfigured", "site_url_invalid"].includes(error.message)) {
    return NextResponse.json({ error: "Website URL is not configured safely." }, { status: 503 });
  }
  console.error("custom request failed", error);
  return NextResponse.json({ error: "Request could not be created. Please try again." }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (field(form, "company")) return NextResponse.json({ ok: true, statusUrl: "/custom" });

    const name = field(form, "name");
    const email = field(form, "email").toLowerCase();
    const phone = field(form, "phone");
    const notes = field(form, "notes");
    const choices: CustomDesignChoices = {
      type: field(form, "type"),
      metal: field(form, "metal"),
      shape: field(form, "shape"),
      origin: field(form, "origin"),
      budget: field(form, "budget"),
    };

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || Object.values(choices).some((value) => !value)) {
      return NextResponse.json({ error: "Name, valid email, and all five design choices are required." }, { status: 400 });
    }
    if (name.length > 120 || email.length > 200 || phone.length > 80 || notes.length > 3000) {
      return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
    }

    const referenceUrl = cleanReferenceUrl(field(form, "referenceUrl"));
    const files = form
      .getAll("referenceImages")
      .filter((value): value is File => typeof value !== "string" && value.size > 0);
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

    const now = new Date();
    const referenceFiles: CustomReferenceFile[] = files.map((file, index) => ({
      name: safeFilename(file.name, index),
      size: file.size,
      type: file.type || "application/octet-stream",
    }));
    const record: CustomRequestRecord = {
      id: makeReference(now),
      publicToken: makeToken(),
      ownerToken: makeToken(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: "awaiting_quote",
      name,
      email,
      phone,
      choices,
      notes,
      referenceUrl,
      referenceFiles,
    };

    const origin = checkoutOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL);
    await saveCustomRequest(record);
    const attachments = await Promise.all(files.map(async (file, index) => ({
      filename: safeFilename(file.name, index),
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })));
    const notified = await notifyRequestCreated(record, origin, attachments);

    return NextResponse.json({
      ok: true,
      id: record.id,
      status: record.status,
      statusUrl: `/custom/request/${record.publicToken}`,
      notificationsConfigured: customNotificationsConfigured() && notified,
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
