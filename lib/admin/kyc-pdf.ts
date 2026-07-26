import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { brand } from "@/data/site";
import { getAdminSettings } from "./settings";
import { embedBrandLogo, logoBox } from "./pdf-logo";
import type { KycBusiness } from "./kyc-shared";

// The Jewel Stone KYC form the owner sends to trade customers. Rendered on the
// same cream/gold letterhead as invoices and memoranda so the whole paper trail
// looks like one house. Values are optional: with none it prints as a blank
// form to fill in by hand, with a record it prints the transcribed copy.

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const color = {
  paper: rgb(0.992, 0.984, 0.965),
  ink: rgb(0.105, 0.09, 0.075),
  soft: rgb(0.40, 0.36, 0.32),
  muted: rgb(0.58, 0.53, 0.47),
  line: rgb(0.84, 0.80, 0.74),
  gold: rgb(0.63, 0.45, 0.20),
};

function safeText(value: string) {
  return value.replace(/[^\x20-\x7E\n]/g, (character) => {
    if (character === "–" || character === "—") return "-";
    if (character === "’" || character === "‘") return "'";
    if (character === "“" || character === "”") return '"';
    return " ";
  });
}

export async function renderKycFormPdf(values?: Partial<KycBusiness>) {
  const settings = await getAdminSettings().catch(() => null);
  const issuer = {
    displayName: settings?.displayName ?? brand.name,
    address: settings?.address ?? brand.address,
    phone: settings?.phone ?? brand.phone,
    email: settings?.email ?? brand.email,
    website: settings?.website ?? brand.website,
  };

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const displayBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const logo = await embedBrandLogo(pdf);

  pdf.setTitle(`${issuer.displayName} KYC Form`);
  pdf.setAuthor(issuer.displayName);
  pdf.setSubject("Know Your Customer form");
  pdf.setCreator("Jewel Stone Owner Panel");
  pdf.setProducer("Jewel Stone Owner Panel");

  let page!: PDFPage;
  let y = 0;

  function header(subtitle: string) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: color.paper });
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 8, width: PAGE_WIDTH, height: 8, color: color.gold });

    if (logo) {
      const box = logoBox(logo, 34);
      page.drawImage(logo, { x: MARGIN, y: 709, width: box.width, height: box.height });
    } else {
      page.drawRectangle({ x: MARGIN, y: 712, width: 28, height: 28, borderColor: color.gold, borderWidth: 1 });
      page.drawText("JS", { x: MARGIN + 7, y: 721, font: displayBold, size: 12, color: color.gold });
    }
    page.drawText(safeText(issuer.displayName.toUpperCase()), {
      x: MARGIN + 38, y: 726, font: displayBold, size: 15, color: color.ink,
    });
    page.drawText(safeText(`${issuer.address}  ·  ${issuer.phone}`), {
      x: MARGIN + 38, y: 714, font: regular, size: 7.5, color: color.muted,
    });

    page.drawText("KNOW YOUR CUSTOMER", { x: MARGIN, y: 680, font: displayBold, size: 19, color: color.ink });
    page.drawText(safeText(subtitle.toUpperCase()), {
      x: MARGIN, y: 664, font: bold, size: 8, color: color.gold,
    });
    page.drawLine({
      start: { x: MARGIN, y: 654 }, end: { x: PAGE_WIDTH - MARGIN, y: 654 },
      thickness: 1, color: color.line,
    });
    y = 634;
  }

  function sectionTitle(label: string) {
    y -= 6;
    page.drawText(safeText(label.toUpperCase()), { x: MARGIN, y, font: bold, size: 8.5, color: color.gold });
    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.6, color: color.line,
    });
    y -= 17;
  }

  /** One labelled blank (or filled) field on a ruled line. */
  function field(label: string, x: number, width: number, value?: string, font: PDFFont = regular) {
    page.drawText(safeText(label), { x, y, font: regular, size: 8, color: color.soft });
    const labelWidth = regular.widthOfTextAtSize(safeText(label), 8) + 5;
    const lineStart = x + labelWidth;
    const lineEnd = x + width;
    page.drawLine({
      start: { x: lineStart, y: y - 2 }, end: { x: lineEnd, y: y - 2 },
      thickness: 0.6, color: color.line,
    });
    if (value) {
      page.drawText(safeText(value).slice(0, 90), {
        x: lineStart + 3, y, font, size: 8.5, color: color.ink,
      });
    }
  }

  function row(fields: { label: string; value?: string; flex: number }[], gap = 14) {
    const totalFlex = fields.reduce((sum, f) => sum + f.flex, 0);
    const available = CONTENT_WIDTH - gap * (fields.length - 1);
    let x = MARGIN;
    for (const f of fields) {
      const width = (available * f.flex) / totalFlex;
      field(f.label, x, width, f.value);
      x += width + gap;
    }
    y -= 24;
  }

  function contactBlock(title: string, name?: string, email?: string, mobile?: string) {
    page.drawText(safeText(title), { x: MARGIN, y, font: bold, size: 8, color: color.ink });
    y -= 16;
    row([
      { label: "Name:", value: name, flex: 1 },
      { label: "E-mail:", value: email, flex: 1 },
    ]);
    row([{ label: "Mobile:", value: mobile, flex: 1 }]);
  }

  // ── Page 1 · business information ──────────────────────────────────────────
  header("Business information");

  sectionTitle("Company details");
  row([
    { label: "Business Name:", value: values?.businessName, flex: 3 },
    { label: "Year Established:", value: values?.yearEstablished, flex: 1 },
  ]);
  row([{ label: "Business Address:", value: values?.address, flex: 1 }]);
  row([
    { label: "City:", value: values?.city, flex: 2 },
    { label: "State:", value: values?.state, flex: 1 },
    { label: "Zip:", value: values?.zip, flex: 1 },
    { label: "Country:", value: values?.country, flex: 2 },
  ]);
  row([
    { label: "Telephone:", value: values?.telephone, flex: 1 },
    { label: "Website:", value: values?.website, flex: 1 },
  ]);
  row([
    { label: "Business Registration / Tax ID No.:", value: values?.taxId, flex: 2 },
    { label: "Wholesale / Retail:", value: values?.natureOfBusiness, flex: 1 },
  ]);

  sectionTitle("Business owner");
  contactBlock("Owner details", values?.ownerName, values?.ownerEmail, values?.ownerMobile);

  sectionTitle("Contact person");
  contactBlock("Primary contact", values?.contactName, values?.contactEmail, values?.contactMobile);

  sectionTitle("Accounting contact");
  contactBlock("Accounts payable", values?.accountingName, values?.accountingEmail, values?.accountingMobile);

  // Trade references — five ruled rows, office-use column on the right.
  sectionTitle("Trade references");
  page.drawText("Please provide contact details for five trade references.", {
    x: MARGIN, y: y + 4, font: regular, size: 7.5, color: color.muted,
  });
  y -= 14;

  const columns = [
    { title: "No.", flex: 0.5 },
    { title: "Company name", flex: 3 },
    { title: "Contact person", flex: 2.5 },
    { title: "Contact number", flex: 2 },
    { title: "Office use", flex: 2 },
  ];
  const totalFlex = columns.reduce((sum, c) => sum + c.flex, 0);
  const widths = columns.map((c) => (CONTENT_WIDTH * c.flex) / totalFlex);
  const rowHeight = 20;

  page.drawRectangle({
    x: MARGIN, y: y - 4, width: CONTENT_WIDTH, height: 16,
    color: rgb(0.95, 0.93, 0.89),
  });
  let cx = MARGIN;
  columns.forEach((column, index) => {
    page.drawText(safeText(column.title), {
      x: cx + 5, y: y + 1, font: bold, size: 7.5, color: color.soft,
    });
    cx += widths[index];
  });
  y -= 4;

  for (let index = 0; index < 5; index += 1) {
    y -= rowHeight;
    page.drawLine({
      start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5, color: color.line,
    });
    page.drawText(String(index + 1), {
      x: MARGIN + 6, y: y + 7, font: regular, size: 8, color: color.soft,
    });
  }
  let vx = MARGIN;
  for (const width of widths) {
    page.drawLine({
      start: { x: vx, y: y + rowHeight * 5 + 12 }, end: { x: vx, y },
      thickness: 0.5, color: color.line,
    });
    vx += width;
  }
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN, y: y + rowHeight * 5 + 12 },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5, color: color.line,
  });

  page.drawText(safeText("Page 1 of 2"), {
    x: PAGE_WIDTH - MARGIN - 46, y: 34, font: regular, size: 7.5, color: color.muted,
  });

  // ── Page 2 · identification, banking, declaration ──────────────────────────
  header("Identification & declaration");

  sectionTitle("Proof of identification (mandatory)");
  page.drawText("Attach two documents: a government photo ID (driver's licence or passport) and proof of business (tax ID / EIN or business registration).", {
    x: MARGIN, y: y + 4, font: regular, size: 7.5, color: color.muted,
  });
  y -= 20;
  row([
    { label: "Company Tax ID / EIN:", value: values?.taxId, flex: 1 },
    { label: "Passport / Driving Licence No.:", flex: 1 },
  ]);

  sectionTitle("Bank details");
  row([
    { label: "Bank Name:", value: values?.bankName, flex: 1 },
    { label: "Account No.:", value: values?.bankAccount, flex: 1 },
  ]);
  row([{ label: "Bank Address:", value: values?.bankAddress, flex: 1 }]);
  row([
    { label: "City:", flex: 2 },
    { label: "State:", flex: 1 },
    { label: "Zip:", flex: 1 },
    { label: "Country:", flex: 2 },
  ]);

  sectionTitle("Declaration");
  const declaration = [
    "I confirm that our company is AML compliant pursuant to the U.S. Patriot Act and all other applicable regulations.",
    "I / We hereby confirm that the details given above are true and correct, and that we will notify Jewel Stone of any change to them.",
  ];
  for (const paragraph of declaration) {
    const words = safeText(paragraph).split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (regular.widthOfTextAtSize(candidate, 8) > CONTENT_WIDTH) {
        page.drawText(line, { x: MARGIN, y, font: regular, size: 8, color: color.soft });
        y -= 12;
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) {
      page.drawText(line, { x: MARGIN, y, font: regular, size: 8, color: color.soft });
      y -= 18;
    }
  }

  y -= 14;
  row([
    { label: "Name:", value: values?.signedName, flex: 1 },
    { label: "Title:", value: values?.signedTitle, flex: 1 },
  ]);
  y -= 10;
  row([
    { label: "Signature:", flex: 1 },
    { label: "Date:", value: values?.signedDate, flex: 1 },
  ]);

  page.drawText(safeText(`Return this form to ${issuer.email}  ·  ${issuer.website}`), {
    x: MARGIN, y: 46, font: regular, size: 7.5, color: color.muted,
  });
  page.drawText(safeText("Page 2 of 2"), {
    x: PAGE_WIDTH - MARGIN - 46, y: 34, font: regular, size: 7.5, color: color.muted,
  });

  return pdf.save();
}
