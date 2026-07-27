import "server-only";

import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { brand } from "@/data/site";
import type { BusinessDocument } from "./documents";
import { formatDocumentDate, formatUsd, lineTotal, statusLabel } from "./document-math";
import { embedBrandLogo, logoBox } from "./pdf-logo";
import { getAdminSettings } from "./settings";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const color = {
  paper: rgb(1, 1, 1),
  ink: rgb(0.07, 0.07, 0.07),
  soft: rgb(0.35, 0.35, 0.35),
  muted: rgb(0.55, 0.55, 0.55),
  line: rgb(0.80, 0.80, 0.80),
  gold: rgb(0.15, 0.15, 0.15),
  goldPale: rgb(0.93, 0.93, 0.93),
  white: rgb(1, 1, 1),
  red: rgb(0.25, 0.25, 0.25),
};

function safeText(value: string) {
  return value.replace(/[^\x20-\x7E\n]/g, (character) => {
    if (character === "–" || character === "—") return "-";
    if (character === "’" || character === "‘") return "'";
    if (character === "“" || character === "”") return '"';
    if (character === "×") return "x";
    return " ";
  });
}

function wrapText(font: PDFFont, value: string, size: number, maxWidth: number) {
  const paragraphs = safeText(value).split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
        continue;
      }
      let segment = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(`${segment}${character}`, size) > maxWidth && segment) {
          lines.push(segment);
          segment = character;
        } else {
          segment += character;
        }
      }
      current = segment;
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawLines(
  page: PDFPage,
  lines: string[],
  options: {
    x: number;
    y: number;
    font: PDFFont;
    size: number;
    lineHeight: number;
    color?: ReturnType<typeof rgb>;
  },
) {
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: options.x,
      y: options.y - index * options.lineHeight,
      font: options.font,
      size: options.size,
      color: options.color ?? color.ink,
    });
  });
  return options.y - lines.length * options.lineHeight;
}

function drawRight(
  page: PDFPage,
  value: string,
  right: number,
  y: number,
  font: PDFFont,
  size: number,
  fill = color.ink,
) {
  const text = safeText(value);
  page.drawText(text, {
    x: right - font.widthOfTextAtSize(text, size),
    y,
    font,
    size,
    color: fill,
  });
}

function itemDetails(item: BusinessDocument["lineItems"][number]) {
  const details = [
    item.code ? `Code ${item.code}` : "",
    item.category ?? "",
    item.metal ?? "",
    item.metalWeight ? `Metal wt ${item.metalWeight}` : "",
    item.diamondCarats ? `Diamond ${item.diamondCarats}` : "",
    item.grossWeight ? `Gross wt ${item.grossWeight}` : "",
    item.shape ?? "",
    item.color ? `Color ${item.color}` : "",
    item.clarity ? `Clarity ${item.clarity}` : "",
    item.cutPolishSymmetry ? `Cut/Polish/Sym ${item.cutPolishSymmetry}` : "",
    item.certificateNumber ? `Certificate ${item.certificateNumber}` : "",
  ].filter(Boolean);
  return details.join("  |  ");
}

export async function renderDocumentPdf(document: BusinessDocument) {
  const issuer = document.issuer ?? {
    displayName: brand.name,
    legalName: process.env.INVOICE_LEGAL_NAME ?? brand.name,
    address: brand.address,
    phone: brand.phone,
    email: brand.email,
    website: brand.website,
    tagline: brand.tagline,
  };
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const display = await pdf.embedFont(StandardFonts.TimesRoman);
  const displayBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await embedBrandLogo(pdf);
  const settings = await getAdminSettings().catch(() => null);

  pdf.setTitle(`${document.kind === "memo" ? "Memorandum" : "Invoice"} ${document.number}`);
  pdf.setAuthor(issuer.displayName);
  pdf.setSubject(`${issuer.displayName} ${document.kind}`);
  pdf.setCreator("Jewel Stone Owner Panel");
  pdf.setProducer("Jewel Stone Owner Panel");

  let page!: PDFPage;
  let y = 0;

  function addPage(continuation = false) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: color.paper });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 3, width: PAGE_WIDTH, height: 3, color: color.gold });

    if (continuation) {
      page.drawText(safeText(issuer.displayName.toUpperCase()), {
        x: MARGIN,
        y: 742,
        font: displayBold,
        size: 15,
        color: color.ink,
      });
      page.drawText(`${document.kind === "memo" ? "MEMORANDUM" : "INVOICE"} ${document.number} - CONTINUED`, {
        x: MARGIN,
        y: 721,
        font: bold,
        size: 8,
        color: color.gold,
      });
      page.drawLine({
        start: { x: MARGIN, y: 706 },
        end: { x: PAGE_WIDTH - MARGIN, y: 706 },
        thickness: 1,
        color: color.line,
      });
      y = 684;
    } else {
      if (logo) {
        const box = logoBox(logo, 34);
        page.drawImage(logo, { x: MARGIN, y: 709, width: box.width, height: box.height });
      } else {
        page.drawRectangle({
          x: MARGIN,
          y: 712,
          width: 28,
          height: 28,
          borderColor: color.gold,
          borderWidth: 1,
        });
        page.drawText("JS", { x: 49, y: 721, font: displayBold, size: 12, color: color.gold });
      }
      page.drawText(safeText(issuer.displayName.toUpperCase()), {
        x: 80,
        y: 720,
        font: displayBold,
        size: 21,
        color: color.ink,
      });

      const heading = document.kind === "memo" ? "MEMORANDUM" : "INVOICE";
      drawRight(page, heading, PAGE_WIDTH - MARGIN, 730, display, 20);
      drawRight(page, document.number, PAGE_WIDTH - MARGIN, 711, bold, 9, color.gold);

      const businessLines = [
        issuer.legalName,
        issuer.address,
        `${issuer.phone}  |  ${issuer.email}`,
        issuer.website.replace(/^https?:\/\//, ""),
      ];
      drawLines(page, businessLines, {
        x: MARGIN,
        y: 687,
        font: regular,
        size: 7.5,
        lineHeight: 11,
        color: color.soft,
      });

      const metaX = 402;
      const metaRight = PAGE_WIDTH - MARGIN;
      const dueLabel = document.kind === "memo" ? "RETURN BY" : "DUE DATE";
      page.drawText("ISSUED", { x: metaX, y: 684, font: bold, size: 6, color: color.muted });
      drawRight(page, formatDocumentDate(document.issueDate), metaRight, 684, regular, 8);
      page.drawText(dueLabel, { x: metaX, y: 671, font: bold, size: 6, color: color.muted });
      drawRight(page, formatDocumentDate(document.dueDate), metaRight, 671, regular, 8);
      page.drawText("TERMS", { x: metaX, y: 658, font: bold, size: 6, color: color.muted });
      drawRight(page, document.terms, metaRight, 658, regular, 8);
      page.drawText("STATUS", { x: metaX, y: 645, font: bold, size: 6, color: color.muted });
      drawRight(
        page,
        statusLabel(document.status).toUpperCase(),
        metaRight,
        645,
        bold,
        7,
        document.status === "void" ? color.red : color.gold,
      );

      page.drawLine({
        start: { x: MARGIN, y: 628 },
        end: { x: PAGE_WIDTH - MARGIN, y: 628 },
        thickness: 1.2,
        color: color.gold,
      });

      page.drawText("BILL TO", { x: MARGIN, y: 609, font: bold, size: 6.5, color: color.gold });
      page.drawText("SHIP TO", { x: 320, y: 609, font: bold, size: 6.5, color: color.gold });
      page.drawText(safeText(document.customer.name), {
        x: MARGIN,
        y: 590,
        font: displayBold,
        size: 12,
        color: color.ink,
      });
      page.drawText(safeText(document.customer.name), {
        x: 320,
        y: 590,
        font: displayBold,
        size: 12,
        color: color.ink,
      });

      const billing = [
        document.customer.address,
        [document.customer.phone, document.customer.email].filter(Boolean).join("  |  "),
      ].filter(Boolean).join("\n");
      const shipping = document.customer.shippingAddress || document.customer.address || "Same as billing address";
      drawLines(page, wrapText(regular, billing || "-", 7.5, 225), {
        x: MARGIN,
        y: 574,
        font: regular,
        size: 7.5,
        lineHeight: 10,
        color: color.soft,
      });
      drawLines(page, wrapText(regular, shipping, 7.5, 246), {
        x: 320,
        y: 574,
        font: regular,
        size: 7.5,
        lineHeight: 10,
        color: color.soft,
      });
      y = 530;
    }
  }

  function drawTableHeader() {
    page.drawRectangle({
      x: MARGIN,
      y: y - 17,
      width: CONTENT_WIDTH,
      height: 21,
      color: color.goldPale,
    });
    page.drawText("#", { x: MARGIN + 5, y: y - 10, font: bold, size: 6.5, color: color.gold });
    page.drawText("ITEM DETAILS", { x: 68, y: y - 10, font: bold, size: 6.5, color: color.gold });
    page.drawText("QTY", { x: 374, y: y - 10, font: bold, size: 6.5, color: color.gold });
    page.drawText("UNIT", { x: 433, y: y - 10, font: bold, size: 6.5, color: color.gold });
    drawRight(page, "AMOUNT", PAGE_WIDTH - MARGIN - 5, y - 10, bold, 6.5, color.gold);
    y -= 24;
  }

  function drawPaymentBlock(rows: Array<[string, string]>) {
    if (!rows.length) return;
    const x = MARGIN;
    const width = 304;
    const headerHeight = 22;
    const rowHeight = 14;
    const referenceHeight = 29;
    const height = headerHeight + rows.length * rowHeight + referenceHeight;
    if (y - height < 92) addPage(true);

    const bottom = y - height;
    page.drawRectangle({
      x,
      y: bottom,
      width,
      height,
      color: color.white,
      borderColor: color.line,
      borderWidth: 0.8,
    });
    page.drawRectangle({
      x,
      y: y - headerHeight,
      width,
      height: headerHeight,
      color: color.goldPale,
    });
    page.drawText("HOW TO PAY", {
      x: x + 10,
      y: y - 14,
      font: bold,
      size: 6.8,
      color: color.gold,
    });

    let rowY = y - headerHeight - 11;
    for (const [label, value] of rows) {
      page.drawText(safeText(label.toUpperCase()), {
        x: x + 10,
        y: rowY,
        font: bold,
        size: 6.2,
        color: color.muted,
      });
      page.drawText(safeText(value), {
        x: x + 104,
        y: rowY - 0.5,
        font: regular,
        size: 8,
        color: color.ink,
      });
      rowY -= rowHeight;
    }

    const separatorY = bottom + referenceHeight;
    page.drawLine({
      start: { x: x + 10, y: separatorY },
      end: { x: x + width - 10, y: separatorY },
      thickness: 0.6,
      color: color.line,
    });
    page.drawText(`REFERENCE ${safeText(document.number)} WITH YOUR PAYMENT`, {
      x: x + 10,
      y: bottom + 11,
      font: bold,
      size: 6.6,
      color: color.ink,
    });
    y = bottom - 13;
  }

  addPage(false);
  drawTableHeader();

  document.lineItems.forEach((item, index) => {
    const titleLines = wrapText(bold, item.description, 8.2, 286);
    const detail = itemDetails(item);
    const detailLines = detail ? wrapText(regular, detail, 6.4, 286) : [];
    const rowHeight = Math.max(34, 12 + titleLines.length * 10 + detailLines.length * 8);

    if (y - rowHeight < 112) {
      addPage(true);
      drawTableHeader();
    }

    page.drawText(String(index + 1), {
      x: MARGIN + 5,
      y: y - 13,
      font: regular,
      size: 7.5,
      color: color.soft,
    });
    drawLines(page, titleLines, {
      x: 68,
      y: y - 12,
      font: bold,
      size: 8.2,
      lineHeight: 10,
      color: color.ink,
    });
    if (detailLines.length) {
      drawLines(page, detailLines, {
        x: 68,
        y: y - 14 - titleLines.length * 10,
        font: regular,
        size: 6.4,
        lineHeight: 8,
        color: color.soft,
      });
    }
    page.drawText(String(item.quantity), {
      x: 380,
      y: y - 13,
      font: regular,
      size: 7.5,
      color: color.ink,
    });
    drawRight(page, formatUsd(item.unitPrice), 479, y - 13, regular, 7.5);
    drawRight(page, formatUsd(lineTotal(item)), PAGE_WIDTH - MARGIN - 5, y - 13, bold, 7.5);
    page.drawLine({
      start: { x: MARGIN, y: y - rowHeight },
      end: { x: PAGE_WIDTH - MARGIN, y: y - rowHeight },
      thickness: 0.55,
      color: color.line,
    });
    y -= rowHeight;
  });

  if (y < 310) {
    addPage(true);
  }

  y -= 10;
  const totalX = 365;
  const totalRight = PAGE_WIDTH - MARGIN;
  const totalRows = [
    ["Subtotal", formatUsd(document.subtotal)],
    ...(document.taxAmount ? [[`Sales tax (${document.taxRate}%)`, formatUsd(document.taxAmount)]] : []),
    ...(document.shipping ? [["Shipping & handling", formatUsd(document.shipping)]] : []),
  ];
  totalRows.forEach(([label, amount]) => {
    page.drawText(label, { x: totalX, y, font: regular, size: 8, color: color.soft });
    drawRight(page, amount, totalRight, y, regular, 8);
    y -= 15;
  });
  page.drawLine({
    start: { x: totalX, y: y + 5 },
    end: { x: totalRight, y: y + 5 },
    thickness: 1.1,
    color: color.gold,
  });
  page.drawText(document.kind === "memo" ? "Declared value" : "Amount due", {
    x: totalX,
    y: y - 10,
    font: displayBold,
    size: 11,
    color: color.ink,
  });
  drawRight(page, formatUsd(document.total), totalRight, y - 10, displayBold, 11);
  y -= 42;

  const notes = document.notes.trim();
  const terms =
    document.kind === "memo"
      ? `Goods listed on this memorandum are delivered for examination and approval only and remain the property of ${issuer.legalName}. No sale or transfer of title occurs until ${issuer.displayName} confirms the sale and issues an invoice. Goods are held at the recipient's risk against loss or damage and must be returned by the stated return date or immediately on request.`
      : "Payment is subject to the terms shown above. Item descriptions, weights, and diamond information should be read together with any accompanying laboratory certificates or product records.";
  const payment = document.kind === "invoice" ? document.paymentInstructions.trim() : "";
  const paymentRows: Array<[string, string]> = document.kind === "invoice"
    ? [
        ...(settings?.bankName ? [["Bank", settings.bankName] as [string, string]] : []),
        ...(settings?.bankAccountNumber
          ? [["Account number", settings.bankAccountNumber] as [string, string]]
          : []),
        ...(settings?.bankRoutingNumber
          ? [["Routing number", settings.bankRoutingNumber] as [string, string]]
          : []),
        ...(settings?.zelleId ? [["Zelle", settings.zelleId] as [string, string]] : []),
      ]
    : [];
  const blockLines = [
    ...(notes ? [{ title: "NOTES", value: notes }] : []),
    ...(payment ? [{ title: "PAYMENT INSTRUCTIONS", value: payment }] : []),
    { title: document.kind === "memo" ? "MEMORANDUM TERMS" : "TERMS", value: terms },
  ];
  const measuredBlocks = blockLines.map((block) => ({
    ...block,
    lines: wrapText(regular, block.value, 7.2, CONTENT_WIDTH),
  }));
  const paymentBlockHeight = paymentRows.length
    ? 22 + paymentRows.length * 14 + 29 + 13
    : 0;
  const supportingContentHeight =
    paymentBlockHeight +
    measuredBlocks.reduce((height, block) => height + 22 + block.lines.length * 9, 0);
  const supportingContentBottom = 126;

  // Keep supporting information in a consistent lower-page footer zone. When
  // line items are short, the deliberate white space after Amount Due makes
  // totals easier to scan instead of letting optional notes creep upward.
  if (supportingContentHeight <= 500) {
    const supportingContentTop = supportingContentBottom + supportingContentHeight;
    if (y < supportingContentTop + 12) addPage(true);
    y = supportingContentTop;
  }

  drawPaymentBlock(paymentRows);
  for (const block of measuredBlocks) {
    const height = 18 + block.lines.length * 9;
    if (y - height < 92) addPage(true);
    page.drawText(block.title, { x: MARGIN, y, font: bold, size: 6.5, color: color.gold });
    y -= 13;
    y = drawLines(page, block.lines, {
      x: MARGIN,
      y,
      font: regular,
      size: 7.2,
      lineHeight: 9,
      color: color.soft,
    }) - 9;
  }

  if (y < 125) addPage(true);
  page.drawLine({ start: { x: MARGIN, y: 92 }, end: { x: 250, y: 92 }, thickness: 0.7, color: color.ink });
  page.drawLine({ start: { x: 362, y: 92 }, end: { x: PAGE_WIDTH - MARGIN, y: 92 }, thickness: 0.7, color: color.ink });
  page.drawText("JEWEL STONE AUTHORIZED SIGNATURE", {
    x: MARGIN,
    y: 78,
    font: bold,
    size: 5.8,
    color: color.muted,
  });
  page.drawText("CUSTOMER RECEIPT / ACCEPTANCE", {
    x: 362,
    y: 78,
    font: bold,
    size: 5.8,
    color: color.muted,
  });

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: MARGIN, y: 45 },
      end: { x: PAGE_WIDTH - MARGIN, y: 45 },
      thickness: 0.5,
      color: color.line,
    });
    pdfPage.drawText(`${issuer.displayName}  |  ${issuer.address}  |  ${issuer.phone}`, {
      x: MARGIN,
      y: 29,
      font: regular,
      size: 5.8,
      color: color.muted,
    });
    drawRight(pdfPage, `Page ${index + 1} of ${pages.length}`, PAGE_WIDTH - MARGIN, 29, regular, 5.8, color.muted);
    if (document.status === "void") {
      pdfPage.drawText("VOID", {
        x: 210,
        y: 380,
        font: displayBold,
        size: 70,
        color: rgb(0.86, 0.70, 0.69),
        rotate: degrees(-18),
        opacity: 0.35,
      });
    }
  });

  return pdf.save();
}
