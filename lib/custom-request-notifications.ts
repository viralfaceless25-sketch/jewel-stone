import "server-only";

import type { CustomRequestRecord } from "@/lib/custom-request-types";

type Attachment = { filename: string; content: string };

type Email = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
};

const apiKey = process.env.RESEND_API_KEY;
const ownerEmail = process.env.INQUIRY_TO_EMAIL;
const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>";

export function customNotificationsConfigured() {
  return Boolean(apiKey && ownerEmail);
}

async function sendEmail(email: Email) {
  if (!apiKey) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
      attachments: email.attachments?.length ? email.attachments : undefined,
    }),
  });
  if (!response.ok) {
    console.error("custom request notification failed", response.status, await response.text());
    return false;
  }
  return true;
}

function choiceLines(record: CustomRequestRecord) {
  return [
    `Piece: ${record.choices.type}`,
    `Metal: ${record.choices.metal}`,
    `Stone: ${record.choices.shape}`,
    `Origin: ${record.choices.origin}`,
    `Budget: ${record.choices.budget}`,
  ];
}

export async function notifyRequestCreated(
  record: CustomRequestRecord,
  origin: string,
  attachments: Attachment[],
) {
  if (!ownerEmail || !apiKey) return false;
  const customerUrl = `${origin}/custom/request/${record.publicToken}`;
  const ownerUrl = `${origin}/custom/owner/${record.ownerToken}`;
  const [ownerResult, customerResult] = await Promise.all([
    sendEmail({
      to: ownerEmail,
      replyTo: record.email,
      subject: `Custom quote requested · ${record.id}`,
      attachments,
      text: [
        `New custom design request ${record.id}`,
        "",
        `Customer: ${record.name}`,
        `Email: ${record.email}`,
        `Phone: ${record.phone || "—"}`,
        ...choiceLines(record),
        `Reference link: ${record.referenceUrl || "—"}`,
        `Attached reference images: ${record.referenceFiles.length || "None"}`,
        `Notes: ${record.notes || "—"}`,
        "",
        "Prepare estimate and notify customer:",
        ownerUrl,
      ].join("\n"),
    }),
    sendEmail({
      to: record.email,
      subject: `We received your custom request · ${record.id}`,
      text: [
        `Hi ${record.name},`,
        "",
        "Your private design request is with Jewel Stone. Our owner will review your references and choices, then post an estimated quotation and production timeline.",
        "",
        "Track your request here:",
        customerUrl,
        "",
        `Request ID: ${record.id}`,
        "We will email you again as soon as your quotation is ready.",
      ].join("\n"),
    }),
  ]);
  return ownerResult && customerResult;
}

export async function notifyQuoteReady(record: CustomRequestRecord, origin: string) {
  if (!record.quote) return false;
  return sendEmail({
    to: record.email,
    subject: `Your Jewel Stone quotation is ready · ${record.id}`,
    text: [
      `Hi ${record.name},`,
      "",
      `Estimated quotation: ${record.quote.estimate}`,
      `Estimated production time: ${record.quote.leadTime}`,
      record.quote.message ? `Owner's note: ${record.quote.message}` : "",
      "",
      "Review, accept, or decline your quotation:",
      `${origin}/custom/request/${record.publicToken}`,
    ].filter(Boolean).join("\n"),
  });
}

export async function notifyCustomerDecision(record: CustomRequestRecord, origin: string) {
  if (!record.decision || !ownerEmail) return false;
  const decision = record.decision.value === "accepted" ? "accepted" : "declined";
  const [ownerResult, customerResult] = await Promise.all([
    sendEmail({
      to: ownerEmail,
      replyTo: record.email,
      subject: `Quotation ${decision} · ${record.id}`,
      text: [
        `${record.name} ${decision} quotation ${record.id}.`,
        record.decision.note ? `Customer note: ${record.decision.note}` : "",
        "",
        `Manage request: ${origin}/custom/owner/${record.ownerToken}`,
      ].filter(Boolean).join("\n"),
    }),
    sendEmail({
      to: record.email,
      subject: `Quotation ${decision} · ${record.id}`,
      text: [
        `Hi ${record.name},`,
        "",
        `Your decision has been recorded: ${decision}.`,
        decision === "accepted"
          ? "Jewel Stone will confirm final details before production begins."
          : "Jewel Stone has received your note and may send a revised quotation.",
        "",
        `${origin}/custom/request/${record.publicToken}`,
      ].join("\n"),
    }),
  ]);
  return ownerResult && customerResult;
}

export async function notifyStatusChanged(record: CustomRequestRecord, origin: string) {
  const shipped = record.status === "shipped";
  return sendEmail({
    to: record.email,
    subject: `${shipped ? "Your custom piece has shipped" : "Your custom piece is in production"} · ${record.id}`,
    text: [
      `Hi ${record.name},`,
      "",
      shipped
        ? "Your custom Jewel Stone piece has shipped."
        : "Your quotation is confirmed and your custom piece is now in production.",
      shipped && record.shipment?.carrier ? `Carrier: ${record.shipment.carrier}` : "",
      shipped && record.shipment?.trackingNumber ? `Tracking: ${record.shipment.trackingNumber}` : "",
      shipped && record.shipment?.trackingUrl ? record.shipment.trackingUrl : "",
      "",
      `Track status: ${origin}/custom/request/${record.publicToken}`,
    ].filter(Boolean).join("\n"),
  });
}
