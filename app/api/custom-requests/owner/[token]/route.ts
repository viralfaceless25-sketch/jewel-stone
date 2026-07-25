import { NextResponse } from "next/server";
import { checkoutOrigin } from "@/lib/commerce/checkout-policy";
import {
  canMarkShipped,
  canOwnerQuote,
  canStartProduction,
  type CustomQuote,
  type CustomShipment,
} from "@/lib/custom-request-types";
import { notifyQuoteReady, notifyStatusChanged } from "@/lib/custom-request-notifications";
import { CustomRequestStoreError, getCustomRequestByOwnerToken, saveCustomRequest } from "@/lib/custom-request-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validToken(token: string) {
  return /^[A-Za-z0-9_-]{32}$/.test(token);
}

function clean(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, limit + 1);
}

function cleanUrl(value: unknown) {
  const cleaned = clean(value, 1000);
  if (!cleaned) return undefined;
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    throw new Error("tracking_url_invalid");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("tracking_url_invalid");
  return url.toString();
}

function publicOwnerRecord(record: Awaited<ReturnType<typeof getCustomRequestByOwnerToken>>) {
  if (!record) return null;
  const { ownerToken: _ownerToken, ...ownerRecord } = record;
  return ownerRecord;
}

function routeError(error: unknown) {
  if (error instanceof CustomRequestStoreError) {
    return NextResponse.json({ error: "Quotation records are temporarily unavailable." }, { status: 503 });
  }
  if (error instanceof Error && error.message === "tracking_url_invalid") {
    return NextResponse.json({ error: "Enter a valid http or https tracking link." }, { status: 400 });
  }
  console.error("custom owner request failed", error);
  return NextResponse.json({ error: "Request could not be updated." }, { status: 500 });
}

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  try {
    const record = await getCustomRequestByOwnerToken(params.token);
    if (!record) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    return NextResponse.json({ request: publicOwnerRecord(record) }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { token: string } }) {
  if (!validToken(params.token)) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = clean(body.action, 40);
    const record = await getCustomRequestByOwnerToken(params.token);
    if (!record) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    const now = new Date().toISOString();
    let updated = record;
    let notification: "quote" | "status" | null = null;

    if (action === "quote") {
      if (!canOwnerQuote(record.status)) {
        return NextResponse.json({ error: "This request can no longer receive a revised quotation." }, { status: 409 });
      }
      const estimate = clean(body.estimate, 120);
      const leadTime = clean(body.leadTime, 120);
      const message = clean(body.message, 2000);
      const validUntil = clean(body.validUntil, 20) || undefined;
      if (!estimate || estimate.length > 120 || !leadTime || leadTime.length > 120 || message.length > 2000) {
        return NextResponse.json({ error: "Estimate and production time are required." }, { status: 400 });
      }
      if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
        return NextResponse.json({ error: "Quotation expiry date is invalid." }, { status: 400 });
      }
      // Optional exact charge amount (USD) that the customer pays on acceptance.
      const rawAmount = typeof body.amount === "string" || typeof body.amount === "number"
        ? Number(String(body.amount).replace(/[^0-9.]/g, ""))
        : NaN;
      let amountCents: number | undefined;
      if (Number.isFinite(rawAmount) && rawAmount > 0) {
        if (rawAmount > 1_000_000) {
          return NextResponse.json({ error: "Charge amount is too large." }, { status: 400 });
        }
        amountCents = Math.round(rawAmount * 100);
      }
      const quote: CustomQuote = { estimate, leadTime, message, validUntil, createdAt: now, amountCents };
      updated = { ...record, status: "quoted", quote, decision: undefined, updatedAt: now };
      notification = "quote";
    } else if (action === "start_production") {
      if (!canStartProduction(record.status)) {
        return NextResponse.json({ error: "Customer must accept the quotation before production starts." }, { status: 409 });
      }
      updated = { ...record, status: "in_production", productionStartedAt: now, updatedAt: now };
      notification = "status";
    } else if (action === "ship") {
      if (!canMarkShipped(record.status)) {
        return NextResponse.json({ error: "Mark the piece in production before shipping." }, { status: 409 });
      }
      const carrier = clean(body.carrier, 120);
      const trackingNumber = clean(body.trackingNumber, 160);
      const trackingUrl = cleanUrl(body.trackingUrl);
      if (!carrier || !trackingNumber || carrier.length > 120 || trackingNumber.length > 160) {
        return NextResponse.json({ error: "Carrier and tracking number are required." }, { status: 400 });
      }
      const shipment: CustomShipment = { carrier, trackingNumber, trackingUrl, createdAt: now };
      updated = { ...record, status: "shipped", shipment, updatedAt: now };
      notification = "status";
    } else {
      return NextResponse.json({ error: "Unknown request action." }, { status: 400 });
    }

    const origin = checkoutOrigin(request.url, process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL);
    await saveCustomRequest(updated);
    const notified = notification === "quote"
      ? await notifyQuoteReady(updated, origin)
      : await notifyStatusChanged(updated, origin);
    return NextResponse.json({ request: publicOwnerRecord(updated), notified });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    return routeError(error);
  }
}
