import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { brand } from "@/data/site";
import type { BusinessDocument } from "./documents";
import { formatDocumentDate, formatUsd } from "./document-math";
import { embedBrandLogo, logoBox } from "./pdf-logo";
import { getAdminSettings } from "./settings";
import type { Customer } from "./order-shared";

// A per-customer account statement — either every paid invoice (a settled
// history) or every open invoice with its due date (what's still owed).
// Deliberately invoice-only: memoranda are goods on approval, not a bill, and
// already get their own "open memos" view rather than a statement line.

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const color = {
  paper: rgb(1, 1, 1),
  ink: rgb(0.09, 0.08, 0.07),
  soft: rgb(0.32, 0.30, 0.27),
  muted: rgb(0.49, 0.46, 0.42),
  line: rgb(0.86, 0.83, 0.78),
  headerFill: rgb(0.13, 0.13, 0.13),
  rowAlt: rgb(0.96, 0.96, 0.96),
  red: rgb(0.53, 0.15, 0.13),
};

function safeText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, (character) => {
    if (character === "–" || character === "—") return "-";
    if (character === "’" || character === "‘") return "'";
    if (character === "“" || character === "”") return '"';
    return " ";
  });
}

function drawRight(page: PDFPage, value: string, right: number, y: number, font: PDFFont, size: number, fill = color.ink) {
  const text = safeText(value);
  page.drawText(text, { x: right - font.widthOfTextAtSize(text, size), y, font, size, color: fill });
}

export type StatementType = "paid" | "open";

export async function renderStatementPdf(
  customer: Customer,
  documents: BusinessDocument[],
  type: StatementType,
) {
  const settings = await getAdminSettings().catch(() => null);
  const issuer = {
    displayName: settings?.displayName || brand.name,
    address: settings?.address || brand.address,
    phone: settings?.phone || brand.phone,
    email: settings?.email || brand.email,
  };

  const invoices = documents
    .filter((document) => document.kind === "invoice")
    .filter((document) => (type === "paid" ? document.status === "paid" : document.status === "sent"))
    .sort((a, b) =>
      type === "paid"
        ? (b.paidAt ?? b.issueDate).localeCompare(a.paidAt ?? a.issueDate)
        : (a.dueDate ?? a.issueDate).localeCompare(b.dueDate ?? b.issueDate),
    );

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const display = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await embedBrandLogo(pdf);

  pdf.setTitle(`${issuer.displayName} statement - ${customer.name || customer.email}`);
  pdf.setAuthor(issuer.displayName);

  let page!: PDFPage;
  let y = 0;
  const today = new Date().toISOString().slice(0, 10);

  function addPage(continuation: boolean) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: color.paper });

    if (logo) {
      const box = logoBox(logo, 30);
      page.drawImage(logo, { x: MARGIN, y: PAGE_HEIGHT - 62, width: box.width, height: box.height });
    }
    page.drawText(safeText(issuer.displayName), {
      x: MARGIN + (logo ? 44 : 0),
      y: PAGE_HEIGHT - 52,
      font: display,
      size: 16,
      color: color.ink,
    });

    if (!continuation) {
      const title = type === "paid" ? "STATEMENT - PAID INVOICES" : "STATEMENT - OPEN INVOICES";
      drawRight(page, title, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 48, bold, 10);
      drawRight(page, `Generated ${formatDocumentDate(today)}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 62, regular, 7.5, color.muted);

      page.drawText("ACCOUNT", { x: MARGIN, y: PAGE_HEIGHT - 88, font: bold, size: 6.5, color: color.muted });
      page.drawText(safeText(customer.name || customer.email), { x: MARGIN, y: PAGE_HEIGHT - 100, font: bold, size: 11, color: color.ink });
      page.drawText(safeText(customer.email), { x: MARGIN, y: PAGE_HEIGHT - 112, font: regular, size: 8, color: color.soft });

      y = PAGE_HEIGHT - 140;
    } else {
      drawRight(page, `${type === "paid" ? "Paid invoices" : "Open invoices"} - continued`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 48, bold, 8, color.muted);
      y = PAGE_HEIGHT - 90;
    }

    page.drawRectangle({ x: MARGIN, y: y - 16, width: CONTENT_WIDTH, height: 20, color: color.headerFill });
    page.drawText("INVOICE #", { x: MARGIN + 6, y: y - 10, font: bold, size: 6.5, color: color.paper });
    page.drawText("ISSUED", { x: MARGIN + 130, y: y - 10, font: bold, size: 6.5, color: color.paper });
    page.drawText(type === "paid" ? "PAID" : "DUE", { x: MARGIN + 220, y: y - 10, font: bold, size: 6.5, color: color.paper });
    if (type === "open") page.drawText("STATUS", { x: MARGIN + 320, y: y - 10, font: bold, size: 6.5, color: color.paper });
    drawRight(page, "AMOUNT", PAGE_WIDTH - MARGIN - 6, y - 10, bold, 6.5, color.paper);
    y -= 26;
  }

  addPage(false);

  let total = 0;
  invoices.forEach((document, index) => {
    if (y < 100) addPage(true);
    total += document.total;

    if (index % 2 === 0) {
      page.drawRectangle({ x: MARGIN, y: y - 12, width: CONTENT_WIDTH, height: 18, color: color.rowAlt });
    }
    page.drawText(safeText(document.number), { x: MARGIN + 6, y: y - 6, font: bold, size: 8, color: color.ink });
    page.drawText(formatDocumentDate(document.issueDate), { x: MARGIN + 130, y: y - 6, font: regular, size: 8, color: color.soft });

    if (type === "paid") {
      page.drawText(formatDocumentDate(document.paidAt?.slice(0, 10) ?? document.issueDate), { x: MARGIN + 220, y: y - 6, font: regular, size: 8, color: color.soft });
    } else {
      const overdue = Boolean(document.dueDate && document.dueDate < today);
      page.drawText(document.dueDate ? formatDocumentDate(document.dueDate) : "-", {
        x: MARGIN + 220,
        y: y - 6,
        font: overdue ? bold : regular,
        size: 8,
        color: overdue ? color.red : color.soft,
      });
      page.drawText(overdue ? "OVERDUE" : "DUE", {
        x: MARGIN + 320,
        y: y - 6,
        font: bold,
        size: 7,
        color: overdue ? color.red : color.muted,
      });
    }
    drawRight(page, formatUsd(document.total), PAGE_WIDTH - MARGIN - 6, y - 6, bold, 8);
    y -= 20;
  });

  if (!invoices.length) {
    page.drawText(
      type === "paid" ? "No paid invoices on record." : "No open invoices - account is settled.",
      { x: MARGIN, y: y - 6, font: regular, size: 9, color: color.muted },
    );
    y -= 24;
  }

  if (y < 80) addPage(true);
  page.drawLine({ start: { x: MARGIN + 220, y: y + 8 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 8 }, thickness: 1, color: color.ink });
  page.drawText(type === "paid" ? "TOTAL PAID" : "TOTAL DUE", { x: MARGIN + 220, y: y - 8, font: display, size: 11, color: color.ink });
  drawRight(page, formatUsd(total), PAGE_WIDTH - MARGIN, y - 8, display, 12);

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawText(`${issuer.displayName}  |  ${issuer.address}  |  ${issuer.phone}`, {
      x: MARGIN,
      y: 24,
      font: regular,
      size: 5.8,
      color: color.muted,
    });
    drawRight(pdfPage, `Page ${index + 1} of ${pages.length}`, PAGE_WIDTH - MARGIN, 24, regular, 5.8, color.muted);
  });

  return pdf.save();
}
