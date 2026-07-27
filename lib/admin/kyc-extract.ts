import "server-only";

import type { KycBusiness } from "./kyc-shared";

// Best-effort reader for a returned KYC form. Digitally filled PDFs carry a
// text layer we can mine with the form's own labels; scans and photographs do
// not, so extraction degrades gracefully to "nothing found" and the owner types
// the details in. Everything returned here is a suggestion the owner reviews —
// never saved without their confirmation.

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

type Section = "business" | "owner" | "contact" | "accounting" | "bank" | "signature";

const SECTION_MARKERS: { section: Section; pattern: RegExp }[] = [
  { section: "owner", pattern: /business\s*owner|owner\s*details/i },
  { section: "contact", pattern: /contact\s*person|primary\s*contact/i },
  { section: "accounting", pattern: /accounting/i },
  { section: "bank", pattern: /bank\s*details/i },
  { section: "signature", pattern: /declaration|signature/i },
];

/**
 * The PDF lays several fields on one line ("City: … State: … Zip: …"), so a
 * naive capture swallows its neighbours. Because we generate the form, we know
 * exactly which labels can follow — cut the value at the nearest one.
 */
const KNOWN_LABELS = [
  "Business Name", "Year Established", "Business Address", "Business Registration",
  "Company Tax ID", "Tax ID No", "Wholesale / Retail", "Wholesale", "Telephone",
  "Website", "City", "State", "Zip", "Country", "Name", "E-mail", "Email",
  "Mobile", "Passport / Driving Licence No", "Passport", "Bank Name",
  "Account No", "Bank Address", "Title", "Signature", "Date",
];
const NEXT_LABEL = new RegExp(
  `\\s+(?:${KNOWN_LABELS.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*")).join("|")})\\s*[:.]`,
  "i",
);
const LABEL_ONLY = /^(name|e-?mail|mobile|cell|phone|city|state|zip|country|telephone|website|title|date|address|account\s*no)\b[\s:.]*$/i;

function grab(text: string, label: RegExp): string {
  // Non-capturing wrapper + named group: labels may contain alternation and
  // optional groups of their own, which would shift a positional capture.
  const pattern = new RegExp(`(?:${label.source})[:.\\s]*(?<value>[^\\n]*)`, "i");
  const raw = pattern.exec(text)?.groups?.value;
  if (!raw) return "";

  let value = raw.trim();
  const next = NEXT_LABEL.exec(value);
  if (next) value = value.slice(0, next.index);
  value = value.replace(/^[-_.:·•/\s]+|[-_.:·•\s]+$/g, "").trim();

  if (!value) return "";
  if (LABEL_ONLY.test(value)) return "";
  // Section headings are printed in caps on the form and are never a value.
  if (/^[A-Z][A-Z\s&/-]{4,}$/.test(value)) return "";
  return value.slice(0, 200);
}

function contactFrom(segment: string) {
  return {
    name: grab(segment, /name/),
    email: EMAIL_PATTERN.exec(segment)?.[0] ?? "",
    mobile: grab(segment, /mobile|cell|phone/),
  };
}

export type KycExtraction = {
  business: Partial<KycBusiness>;
  guessedEmail: string;
  fieldsFound: number;
};

export async function extractKycForm(buffer: Buffer): Promise<KycExtraction> {
  let text = "";
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      text = (await parser.getText()).text ?? "";
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch (error) {
    console.error("kyc extraction failed", error);
    return { business: {}, guessedEmail: "", fieldsFound: 0 };
  }

  // Slice the document into sections so the three Name/E-mail/Mobile blocks
  // (owner, contact, accounting) don't bleed into each other.
  const boundaries: { section: Section; index: number }[] = [{ section: "business", index: 0 }];
  for (const { section, pattern } of SECTION_MARKERS) {
    const match = pattern.exec(text);
    if (match) boundaries.push({ section, index: match.index });
  }
  boundaries.sort((a, b) => a.index - b.index);
  const segments = new Map<Section, string>();
  boundaries.forEach((boundary, position) => {
    const end = boundaries[position + 1]?.index ?? text.length;
    const existing = segments.get(boundary.section) ?? "";
    segments.set(boundary.section, existing + text.slice(boundary.index, end));
  });

  const businessSegment = segments.get("business") ?? text;
  const owner = contactFrom(segments.get("owner") ?? "");
  const contact = contactFrom(segments.get("contact") ?? "");
  const accounting = contactFrom(segments.get("accounting") ?? "");
  const bankSegment = segments.get("bank") ?? "";
  const signatureSegment = segments.get("signature") ?? "";

  const business: Partial<KycBusiness> = {
    businessName: grab(businessSegment, /business\s*name/),
    yearEstablished: grab(businessSegment, /year\s*(of\s*)?establish\w*/),
    address: grab(businessSegment, /business\s*address/),
    city: grab(businessSegment, /city/),
    state: grab(businessSegment, /state/),
    zip: grab(businessSegment, /zip/),
    country: grab(businessSegment, /country/),
    telephone: grab(businessSegment, /tel\w*/),
    website: grab(businessSegment, /website/),
    taxId: grab(businessSegment, /business\s*registration\s*\/?\s*tax\s*id\s*no|company\s*tax\s*id\s*\/?\s*ein|tax\s*id\s*no/),
    natureOfBusiness: grab(businessSegment, /wholesale\s*\/?\s*retail|nature\s*of\s*business/),
    ownerName: owner.name,
    ownerEmail: owner.email,
    ownerMobile: owner.mobile,
    contactName: contact.name,
    contactEmail: contact.email,
    contactMobile: contact.mobile,
    accountingName: accounting.name,
    accountingEmail: accounting.email,
    accountingMobile: accounting.mobile,
    bankName: grab(bankSegment, /bank\s*name/),
    bankAccount: grab(bankSegment, /account\s*no/),
    bankAddress: grab(bankSegment, /(bank\s*)?address/),
    signedName: grab(signatureSegment, /name/),
    signedTitle: grab(signatureSegment, /title/),
    signedDate: grab(signatureSegment, /date/),
  };

  // Drop empty keys so the review form only pre-fills what was actually read.
  for (const key of Object.keys(business) as (keyof KycBusiness)[]) {
    if (!business[key]) delete business[key];
  }

  const guessedEmail =
    owner.email || contact.email || EMAIL_PATTERN.exec(text)?.[0] || "";

  return { business, guessedEmail, fieldsFound: Object.keys(business).length };
}
