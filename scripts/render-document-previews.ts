import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
const longAddressCustomer: BusinessDocument["customer"] = {
  name: "Ole's Jewelry Avenue",
  email: "accounts@olesjewelry.example",
  phone: "+1 786 306 0620",
  address: "Ole's Jewelry Avenue\n8789 SW 72nd Street\nMiami, Florida 33173\nUnited States",
  shippingAddress: "Ole's Jewelry Avenue\n8789 SW 72nd Street\nMiami, Florida 33173\nUnited States",
};
const paymentSettings = {
  bankName: "Sample Commercial Bank",
  bankAccountNumber: "0000 0000 0000",
  bankRoutingNumber: "000 000 000",
  zelleId: "payments@example.com",
};
const outputDirectory = path.join(process.cwd(), "output", "pdf");

function document(
  kind: BusinessDocument["kind"],
  number: string,
  lineItems: BusinessDocument["lineItems"],
  documentCustomer = customer,
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
    customer: documentCustomer,
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
  const [invoice, memo, longAddress, multipage] = await Promise.all([
    renderDocumentPdf(document("invoice", "INV-0101", invoiceItems), { paymentSettings }),
    renderDocumentPdf(document("memo", "MEMO-0101", memoItems), { paymentSettings }),
    renderDocumentPdf(document("invoice", "INV-0102", invoiceItems.slice(0, 1), longAddressCustomer), { paymentSettings }),
    renderDocumentPdf(document("invoice", "INV-0103", longItems), { paymentSettings }),
  ]);
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "Jewel-Stone-Invoice-Preview.pdf"), invoice),
    writeFile(path.join(outputDirectory, "Jewel-Stone-Memo-Preview.pdf"), memo),
    writeFile(path.join(outputDirectory, "Jewel-Stone-Invoice-Long-Address-Preview.pdf"), longAddress),
    writeFile(path.join(outputDirectory, "Jewel-Stone-Invoice-Multipage-Preview.pdf"), multipage),
  ]);
  console.log(`Rendered invoice, memo, long-address, and multi-page previews in ${outputDirectory}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
