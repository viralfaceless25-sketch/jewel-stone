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
import { getAdminSettings, type AdminSettings } from "./settings";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const color = {
  paper: rgb(1, 1, 1),
  ink: rgb(0.09, 0.08, 0.07),
  charcoal: rgb(0.11, 0.10, 0.09),
  soft: rgb(0.32, 0.30, 0.27),
  muted: rgb(0.49, 0.46, 0.42),
  line: rgb(0.86, 0.83, 0.78),
  gold: rgb(0.55, 0.40, 0.20),
  goldPale: rgb(0.96, 0.94, 0.90),
  white: rgb(1, 1, 1),
  red: rgb(0.53, 0.15, 0.13),
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

function drawCenter(
  page: PDFPage,
  value: string,
  center: number,
  y: number,
  font: PDFFont,
  size: number,
  fill = color.ink,
) {
  const text = safeText(value);
  page.drawText(text, {
    x: center - font.widthOfTextAtSize(text, size) / 2,
    y,
    font,
    size,
    color: fill,
  });
}

function sameAddress(left: string, right: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return Boolean(left.trim() && right.trim() && normalize(left) === normalize(right));
}

function itemDetails(item: BusinessDocument["lineItems"][number]) {
  const details = [
    item.code ? `SKU ${item.code}` : "",
    item.category ?? "",
    item.metal ?? "",
    item.metalWeight ? `Metal weight ${item.metalWeight}` : "",
    item.diamondCarats ? `Diamond weight ${item.diamondCarats}` : "",
    item.grossWeight ? `Gross weight ${item.grossWeight}` : "",
    item.shape ?? "",
    item.color ? `Color ${item.color}` : "",
    item.clarity ? `Clarity ${item.clarity}` : "",
    item.cutPolishSymmetry ? `Cut/Polish/Sym ${item.cutPolishSymmetry}` : "",
    item.certificateNumber ? `Certificate ${item.certificateNumber}` : "",
  ].filter(Boolean);
  return details.join("  |  ");
}

type PaymentSettings = Pick<
  AdminSettings,
  "bankName" | "bankAccountNumber" | "bankRoutingNumber" | "zelleId"
>;

export async function renderDocumentPdf(
  document: BusinessDocument,
  options: { paymentSettings?: PaymentSettings } = {},
) {
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
  const settings = options.paymentSettings ?? await getAdminSettings().catch(() => null);

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
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: color.gold });

    if (continuation) {
      page.drawText(safeText(issuer.displayName), {
        x: MARGIN,
        y: 742,
        font: displayBold,
        size: 16,
        color: color.ink,
      });
      drawRight(
        page,
        `${document.kind === "memo" ? "MEMORANDUM" : "INVOICE"} ${document.number}`,
        PAGE_WIDTH - MARGIN,
        742,
        bold,
        7.5,
        color.gold,
      );
      page.drawText("CONTINUED", {
        x: MARGIN,
        y: 722,
        font: bold,
        size: 6,
        color: color.gold,
      });
      page.drawLine({
        start: { x: MARGIN, y: 708 },
        end: { x: PAGE_WIDTH - MARGIN, y: 708 },
        thickness: 0.8,
        color: color.line,
      });
      y = 688;
    } else {
      if (logo) {
        const box = logoBox(logo, 34);
        page.drawImage(logo, { x: MARGIN, y: 716, width: box.width, height: box.height });
      } else {
        page.drawRectangle({
          x: MARGIN,
          y: 719,
          width: 30,
          height: 30,
          borderColor: color.gold,
          borderWidth: 1,
        });
        page.drawText("JS", { x: 49, y: 728, font: displayBold, size: 12, color: color.gold });
      }
      page.drawText(safeText(issuer.displayName), {
        x: 84,
        y: 738,
        font: displayBold,
        size: 20,
        color: color.ink,
      });
      page.drawText(safeText(issuer.tagline.toUpperCase()), {
        x: 84,
        y: 720,
        font: bold,
        size: 6.2,
        color: color.gold,
      });

      const heading = document.kind === "memo" ? "MEMORANDUM" : "INVOICE";
      drawRight(page, heading, PAGE_WIDTH - MARGIN, 737, display, 23);
      drawRight(page, document.number, PAGE_WIDTH - MARGIN, 714, bold, 8.5, color.gold);
      drawRight(
        page,
        document.kind === "memo" ? "GOODS ON APPROVAL" : "COMMERCIAL DOCUMENT",
        PAGE_WIDTH - MARGIN,
        699,
        bold,
        5.8,
        color.muted,
      );

      const businessLines = [
        issuer.legalName,
        issuer.address,
        `${issuer.phone}  |  ${issuer.email}`,
        issuer.website.replace(/^https?:\/\//, ""),
      ];
      const wrappedBusinessLines = businessLines.flatMap((line) => wrapText(regular, line, 6.7, 315));
      drawLines(page, wrappedBusinessLines.slice(0, 5), {
        x: MARGIN,
        y: 696,
        font: regular,
        size: 6.7,
        lineHeight: 9,
        color: color.soft,
      });

      const dueLabel = document.kind === "memo" ? "RETURN BY" : "DUE DATE";
      page.drawLine({
        start: { x: MARGIN, y: 646 },
        end: { x: PAGE_WIDTH - MARGIN, y: 646 },
        thickness: 0.8,
        color: color.gold,
      });
      page.drawRectangle({
        x: MARGIN,
        y: 588,
        width: CONTENT_WIDTH,
        height: 48,
        color: color.goldPale,
      });
      const meta = [
        ["ISSUED", formatDocumentDate(document.issueDate)],
        [dueLabel, formatDocumentDate(document.dueDate)],
        ["TERMS", document.terms],
        ["STATUS", statusLabel(document.status).toUpperCase()],
      ];
      const metaWidth = CONTENT_WIDTH / meta.length;
      meta.forEach(([label, value], index) => {
        const x = MARGIN + index * metaWidth;
        if (index) {
          page.drawLine({
            start: { x, y: 596 },
            end: { x, y: 628 },
            thickness: 0.55,
            color: color.line,
          });
        }
        page.drawText(label, {
          x: x + 10,
          y: 619,
          font: bold,
          size: 5.6,
          color: color.gold,
        });
        const valueLines = wrapText(index === 3 ? bold : regular, value, 7.2, metaWidth - 20).slice(0, 2);
        drawLines(page, valueLines, {
          x: x + 10,
          y: 602,
          font: index === 3 ? bold : regular,
          size: 7.2,
          lineHeight: 8,
          color: document.status === "void" && index === 3 ? color.red : color.ink,
        });
      });

      const billing = [
        document.customer.address,
        [document.customer.phone, document.customer.email].filter(Boolean).join("  |  "),
      ].filter(Boolean).join("\n");
      const shippingAddress = document.customer.shippingAddress.trim();
      const shipping =
        !shippingAddress || sameAddress(document.customer.address, shippingAddress)
          ? "Same as billing address"
          : shippingAddress;
      const billingNameLines = wrapText(displayBold, document.customer.name, 11.2, 232).slice(0, 3);
      const shippingNameLines = wrapText(displayBold, document.customer.name, 11.2, 232).slice(0, 3);
      const billingLines = wrapText(regular, billing || "-", 7.2, 232);
      const shippingLines = wrapText(regular, shipping, 7.2, 232);

      page.drawText("BILL TO", { x: MARGIN, y: 565, font: bold, size: 6.2, color: color.gold });
      page.drawText("SHIP TO", { x: 320, y: 565, font: bold, size: 6.2, color: color.gold });
      drawLines(page, billingNameLines, {
        x: MARGIN,
        y: 546,
        font: displayBold,
        size: 11.2,
        lineHeight: 13,
        color: color.ink,
      });
      drawLines(page, shippingNameLines, {
        x: 320,
        y: 546,
        font: displayBold,
        size: 11.2,
        lineHeight: 13,
        color: color.ink,
      });
      const billingBodyY = 542 - billingNameLines.length * 13;
      const shippingBodyY = 542 - shippingNameLines.length * 13;
      const billingBottom = drawLines(page, billingLines, {
        x: MARGIN,
        y: billingBodyY,
        font: regular,
        size: 7.2,
        lineHeight: 9.5,
        color: color.soft,
      });
      const shippingBottom = drawLines(page, shippingLines, {
        x: 320,
        y: shippingBodyY,
        font: regular,
        size: 7.2,
        lineHeight: 9.5,
        color: color.soft,
      });
      const customerBottom = Math.min(billingBottom, shippingBottom);
      page.drawLine({
        start: { x: 306, y: 574 },
        end: { x: 306, y: customerBottom + 5 },
        thickness: 0.55,
        color: color.line,
      });
      y = Math.min(492, customerBottom - 15);
    }
  }

  function drawTableHeader() {
    page.drawRectangle({
      x: MARGIN,
      y: y - 22,
      width: CONTENT_WIDTH,
      height: 22,
      color: color.charcoal,
    });
    page.drawText("#", { x: MARGIN + 7, y: y - 14, font: bold, size: 6.2, color: color.white });
    page.drawText("ITEM DETAILS", { x: 72, y: y - 14, font: bold, size: 6.2, color: color.white });
    drawCenter(page, "QTY", 390, y - 14, bold, 6.2, color.white);
    drawRight(page, "UNIT", 479, y - 14, bold, 6.2, color.white);
    drawRight(page, "AMOUNT", PAGE_WIDTH - MARGIN - 6, y - 14, bold, 6.2, color.white);
    y -= 29;
  }

  function drawPaymentBlock(rows: Array<[string, string]>) {
    if (!rows.length) return;
    const x = MARGIN;
    const width = CONTENT_WIDTH;
    const headerHeight = 16;
    const rowHeight = 18;
    const referenceHeight = 18;
    const gridRows = Math.ceil(rows.length / 2);
    const height = headerHeight + gridRows * rowHeight + referenceHeight;
    if (y - height < 104) addPage(true);

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
      y: y - 10.5,
      font: bold,
      size: 5.5,
      color: color.gold,
    });
    drawRight(page, "SECURE PAYMENT DETAILS", x + width - 10, y - 10.5, bold, 4.9, color.muted);

    const columnWidth = (width - 20) / 2;
    rows.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const cellX = x + 10 + column * columnWidth;
      const cellTop = y - headerHeight - row * rowHeight;
      page.drawText(safeText(label.toUpperCase()), {
        x: cellX,
        y: cellTop - 6.5,
        font: bold,
        size: 4.6,
        color: color.gold,
      });
      drawLines(page, wrapText(regular, value, 6.4, columnWidth - 16).slice(0, 1), {
        x: cellX,
        y: cellTop - 14,
        font: regular,
        size: 6.4,
        lineHeight: 6.5,
        color: color.ink,
      });
    });

    if (rows.length > 1) {
      page.drawLine({
        start: { x: x + width / 2, y: bottom + referenceHeight + 7 },
        end: { x: x + width / 2, y: y - headerHeight - 7 },
        thickness: 0.5,
        color: color.line,
      });
    }

    const separatorY = bottom + referenceHeight;
    page.drawLine({
      start: { x: x + 10, y: separatorY },
      end: { x: x + width - 10, y: separatorY },
      thickness: 0.6,
      color: color.line,
    });
    page.drawRectangle({
      x,
      y: bottom,
      width,
      height: referenceHeight,
      color: color.charcoal,
    });
    page.drawText(`REFERENCE ${safeText(document.number)} WITH YOUR PAYMENT`, {
      x: x + 10,
      y: bottom + 5.8,
      font: bold,
      size: 5.4,
      color: color.white,
    });
    y = bottom - 10;
  }

  addPage(false);
  drawTableHeader();

  document.lineItems.forEach((item, index) => {
    const titleLines = wrapText(displayBold, item.description, 9, 282);
    const detail = itemDetails(item);
    const detailLines = detail ? wrapText(regular, detail, 6.3, 282) : [];
    const rowHeight = Math.max(38, 14 + titleLines.length * 11 + detailLines.length * 8);

    if (y - rowHeight < 112) {
      addPage(true);
      drawTableHeader();
    }

    page.drawText(String(index + 1), {
      x: MARGIN + 5,
      y: y - 15,
      font: regular,
      size: 7.2,
      color: color.soft,
    });
    drawLines(page, titleLines, {
      x: 72,
      y: y - 14,
      font: displayBold,
      size: 9,
      lineHeight: 11,
      color: color.ink,
    });
    if (detailLines.length) {
      drawLines(page, detailLines, {
        x: 72,
        y: y - 16 - titleLines.length * 11,
        font: regular,
        size: 6.3,
        lineHeight: 8,
        color: color.soft,
      });
    }
    drawCenter(page, String(item.quantity), 390, y - 15, regular, 7.2);
    drawRight(page, formatUsd(item.unitPrice), 479, y - 15, regular, 7.2);
    drawRight(page, formatUsd(lineTotal(item)), PAGE_WIDTH - MARGIN - 6, y - 15, bold, 7.2);
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

  y -= 15;
  const totalX = 346;
  const totalRight = PAGE_WIDTH - MARGIN;
  page.drawText("FINANCIAL SUMMARY", {
    x: totalX,
    y,
    font: bold,
    size: 5.8,
    color: color.gold,
  });
  drawRight(page, "USD", totalRight, y, bold, 5.8, color.muted);
  y -= 18;
  const totalRows = [
    ["Subtotal", formatUsd(document.subtotal)],
    ...(document.taxAmount ? [[`Sales tax (${document.taxRate}%)`, formatUsd(document.taxAmount)]] : []),
    ...(document.shipping ? [["Shipping & handling", formatUsd(document.shipping)]] : []),
  ];
  totalRows.forEach(([label, amount]) => {
    page.drawText(label, { x: totalX, y, font: regular, size: 7.4, color: color.soft });
    drawRight(page, amount, totalRight, y, regular, 7.4);
    y -= 14;
  });
  const totalBarHeight = 36;
  const totalBarBottom = y - totalBarHeight + 2;
  page.drawRectangle({
    x: totalX,
    y: totalBarBottom,
    width: totalRight - totalX,
    height: totalBarHeight,
    color: color.charcoal,
  });
  page.drawText(document.kind === "memo" ? "DECLARED VALUE" : "AMOUNT DUE", {
    x: totalX + 12,
    y: totalBarBottom + 14,
    font: bold,
    size: 6.3,
    color: color.white,
  });
  drawRight(page, formatUsd(document.total), totalRight - 12, totalBarBottom + 11.5, displayBold, 12.5, color.white);
  y = totalBarBottom - 18;

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
    lines: wrapText(regular, block.value, 6.8, CONTENT_WIDTH),
  }));
  const paymentBlockHeight = paymentRows.length
    ? 16 + Math.ceil(paymentRows.length / 2) * 18 + 18 + 10
    : 0;
  const supportingContentHeight =
    paymentBlockHeight +
    measuredBlocks.reduce((height, block) => height + 13 + block.lines.length * 8, 0);
  const supportingContentBottom = 110;

  // Keep supporting information in a consistent lower-page footer zone. When
  // line items are short, the deliberate white space after Amount Due makes
  // totals easier to scan instead of letting optional notes creep upward.
  if (supportingContentHeight <= 500) {
    const supportingContentTop = supportingContentBottom + supportingContentHeight;
    if (y < supportingContentTop) addPage(true);
    y = supportingContentTop;
  }

  drawPaymentBlock(paymentRows);
  for (const block of measuredBlocks) {
    const height = 13 + block.lines.length * 8;
    if (y - height < 104) addPage(true);
    page.drawLine({
      start: { x: MARGIN, y: y + 1.5 },
      end: { x: MARGIN + 34, y: y + 1.5 },
      thickness: 1.2,
      color: color.gold,
    });
    page.drawText(block.title, { x: MARGIN + 44, y: y - 1, font: bold, size: 5.7, color: color.gold });
    y -= 9;
    y = drawLines(page, block.lines, {
      x: MARGIN,
      y,
      font: regular,
      size: 6.8,
      lineHeight: 8,
      color: color.soft,
    }) - 4;
  }

  if (y < 104) addPage(true);
  page.drawLine({ start: { x: MARGIN, y: 94 }, end: { x: 260, y: 94 }, thickness: 0.7, color: color.ink });
  page.drawLine({ start: { x: 352, y: 94 }, end: { x: PAGE_WIDTH - MARGIN, y: 94 }, thickness: 0.7, color: color.ink });
  page.drawText("AUTHORIZED SIGNATURE / DATE", {
    x: MARGIN,
    y: 80,
    font: bold,
    size: 5.4,
    color: color.gold,
  });
  page.drawText(document.kind === "memo" ? "CUSTOMER ACCEPTANCE / DATE" : "CUSTOMER RECEIPT / DATE", {
    x: 352,
    y: 80,
    font: bold,
    size: 5.4,
    color: color.gold,
  });

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: MARGIN, y: 48 },
      end: { x: PAGE_WIDTH - MARGIN, y: 48 },
      thickness: 0.5,
      color: color.line,
    });
    pdfPage.drawText(safeText(issuer.displayName.toUpperCase()), {
      x: MARGIN,
      y: 31,
      font: bold,
      size: 5.7,
      color: color.gold,
    });
    const footerContact = wrapText(
      regular,
      `${issuer.address}  |  ${issuer.phone}  |  ${issuer.website.replace(/^https?:\/\//, "")}`,
      5.2,
      410,
    )[0] ?? "";
    pdfPage.drawText(footerContact, {
      x: MARGIN,
      y: 20,
      font: regular,
      size: 5.2,
      color: color.muted,
    });
    drawRight(
      pdfPage,
      `${document.number}  |  Page ${index + 1} of ${pages.length}`,
      PAGE_WIDTH - MARGIN,
      28,
      regular,
      5.5,
      color.muted,
    );
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
