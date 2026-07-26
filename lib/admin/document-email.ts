import "server-only";

import { brand } from "@/data/site";
import type { BusinessDocument } from "./documents";
import { formatDocumentDate, formatUsd } from "./document-math";
import { renderDocumentPdf } from "./document-pdf";

export class DocumentEmailError extends Error {
  constructor(public readonly code: "email_unconfigured" | "customer_email_missing" | "email_failed") {
    super(code);
    this.name = "DocumentEmailError";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendDocumentEmail(document: BusinessDocument, message = "") {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new DocumentEmailError("email_unconfigured");
  if (!document.customer.email) throw new DocumentEmailError("customer_email_missing");
  const issuer = document.issuer ?? {
    displayName: brand.name,
    address: brand.address,
    phone: brand.phone,
    email: brand.email,
  };

  const heading = document.kind === "memo" ? "Memorandum" : "Invoice";
  const amountLabel = document.kind === "memo" ? "Declared value" : "Amount due";
  const pdf = await renderDocumentPdf(document);
  const subject = `${heading} ${document.number} from ${issuer.displayName}`;
  const intro =
    message.trim() ||
    (document.kind === "memo"
      ? "Attached is your Jewel Stone memorandum. Please review the listed goods and return date."
      : "Attached is your Jewel Stone invoice. Please review the details and payment terms.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `jewelstone-document/${document.number}/${document.updatedAt}`,
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>",
      to: [document.customer.email],
      reply_to: issuer.email,
      subject,
      html: `
        <div style="margin:0;padding:32px 16px;background:#f6f1e8;color:#181512;font-family:Arial,sans-serif">
          <div style="max-width:620px;margin:0 auto;background:#fffdf9;border:1px solid #d9cfc2">
            <div style="padding:30px 32px;border-top:6px solid #a57a35;border-bottom:1px solid #d9cfc2">
              <div style="font-family:Georgia,serif;font-size:27px;letter-spacing:.12em">${escapeHtml(issuer.displayName.toUpperCase())}</div>
              <div style="margin-top:5px;color:#7d5923;font-size:10px;letter-spacing:.2em;text-transform:uppercase">New York Diamond District</div>
            </div>
            <div style="padding:30px 32px">
              <div style="color:#7d5923;font-size:11px;letter-spacing:.16em;text-transform:uppercase">${escapeHtml(heading)} ${escapeHtml(document.number)}</div>
              <h1 style="margin:12px 0 18px;font-family:Georgia,serif;font-weight:400;font-size:25px">Hello ${escapeHtml(document.customer.name)},</h1>
              <p style="margin:0 0 22px;color:#6d6257;font-size:14px;line-height:1.7">${escapeHtml(intro).replace(/\n/g, "<br>")}</p>
              <table role="presentation" style="width:100%;border-collapse:collapse;background:#f6f1e8">
                <tr>
                  <td style="padding:13px 15px;color:#6d6257;font-size:12px">Issued</td>
                  <td style="padding:13px 15px;text-align:right;font-size:13px">${escapeHtml(formatDocumentDate(document.issueDate))}</td>
                </tr>
                <tr>
                  <td style="padding:13px 15px;border-top:1px solid #d9cfc2;color:#6d6257;font-size:12px">${amountLabel}</td>
                  <td style="padding:13px 15px;border-top:1px solid #d9cfc2;text-align:right;font-family:Georgia,serif;font-size:18px">${escapeHtml(formatUsd(document.total))}</td>
                </tr>
              </table>
              <p style="margin:22px 0 0;color:#6d6257;font-size:12px;line-height:1.7">Your complete ${heading.toLowerCase()} is attached as a PDF.</p>
            </div>
            <div style="padding:18px 32px;border-top:1px solid #d9cfc2;color:#6d6257;font-size:11px;line-height:1.7;text-align:center">
              ${escapeHtml(issuer.address)}<br>
              ${escapeHtml(issuer.phone)} · ${escapeHtml(issuer.email)}
            </div>
          </div>
        </div>
      `,
      text: [
        `${issuer.displayName} — ${heading} ${document.number}`,
        "",
        `Hello ${document.customer.name},`,
        intro,
        "",
        `Issued: ${formatDocumentDate(document.issueDate)}`,
        `${amountLabel}: ${formatUsd(document.total)}`,
        "",
        "The complete document is attached as a PDF.",
        "",
        issuer.address,
        `${issuer.phone} · ${issuer.email}`,
      ].join("\n"),
      attachments: [
        {
          filename: `${document.number}.pdf`,
          content: Buffer.from(pdf).toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("document email failed", document.number, response.status, await response.text());
    throw new DocumentEmailError("email_failed");
  }
}
