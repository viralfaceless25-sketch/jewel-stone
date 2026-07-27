import { writeFile } from "node:fs/promises";
import { brand } from "../data/site";
import type { BusinessDocument } from "../lib/admin/documents";
import { renderDocumentPdf } from "../lib/admin/document-pdf";

const now = "2026-07-27T12:00:00.000Z";
const issuer: BusinessDocument["issuer"] = {
  displayName: brand.name,
  legalName: "Jewel Stone USA LLC",
  address: brand.address,
  phone: brand.phone,
  email: brand.email,
  website: brand.website,
  tagline: brand.tagline,
};
const customer: BusinessDocument["customer"] = {
  name: "Sample Client",
  email: "client@example.com",
  phone: "+1 212 555 0142",
  address: "120 Fifth Avenue\nNew York, NY 10011",
  shippingAddress: "120 Fifth Avenue\nNew York, NY 10011",
};

function document(
  kind: BusinessDocument["kind"],
  number: string,
  lineItems: BusinessDocument["lineItems"],
): BusinessDocument {
  const subtotal = lineItems.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
  const taxRate = kind === "invoice" ? 8.875 : 0;
  const taxAmount = kind === "invoice" ? Math.round(subtotal * taxRate / 100) : 0;
  return {
    id: number.toLowerCase(),
    number,
    kind,
    issuer,
    createdAt: now,
    updatedAt: now,
    issueDate: "2026-07-27",
    dueDate: kind === "memo" ? "2026-08-03" : "2026-07-27",
    terms: kind === "memo" ? "Return within 7 days" : "Advance payment",
    customer,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    shipping: 0,
    total: subtotal + taxAmount,
    notes: kind === "memo" ? "Goods supplied for examination and approval." : "Thank you for your business.",
    paymentInstructions: kind === "invoice" ? "Wire transfer or Zelle accepted." : "",
    status: "draft",
  };
}

const invoiceItems: BusinessDocument["lineItems"] = [
  {
    kind: "jewelry",
    description: "Natural diamond emerald-cut ring",
    code: "JS-NR-104",
    category: "Ring",
    metal: "18K white gold",
    metalWeight: "5.42 g",
    diamondCarats: "2.10 ct",
    quantity: 1,
    unitPrice: 1_850_000,
  },
  {
    kind: "loose_stone",
    description: "Oval brilliant natural diamond",
    code: "JS-OV-208",
    shape: "Oval",
    color: "F",
    clarity: "VS1",
    certificateNumber: "GIA 0000000000",
    quantity: 1,
    unitPrice: 1_275_000,
  },
];

const memoItems: BusinessDocument["lineItems"] = invoiceItems.map((item) => ({ ...item }));

const longItems: BusinessDocument["lineItems"] = Array.from({ length: 28 }, (_, index) => ({
  ...invoiceItems[index % invoiceItems.length],
  description: `${invoiceItems[index % invoiceItems.length].description} — selection ${index + 1}`,
  quantity: 1,
}));

async function main() {
  const [invoice, memo, multipage] = await Promise.all([
    renderDocumentPdf(document("invoice", "INV-0101", invoiceItems)),
    renderDocumentPdf(document("memo", "MEMO-0101", memoItems)),
    renderDocumentPdf(document("invoice", "INV-0102", longItems)),
  ]);
  await Promise.all([
    writeFile("/tmp/Jewel-Stone-Invoice-BW-Preview.pdf", invoice),
    writeFile("/tmp/Jewel-Stone-Memo-BW-Preview.pdf", memo),
    writeFile("/tmp/Jewel-Stone-Invoice-BW-Multipage.pdf", multipage),
  ]);
  console.log("Rendered invoice, memo, and multi-page invoice previews in /tmp.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
