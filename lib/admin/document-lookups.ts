import "server-only";

import { products as catalogProducts } from "@/data/products";
import { listAdminProducts, listPurchasedInventory } from "./inventory";
import { listCustomers } from "./orders";

// Pickers for the invoice/memo composer. The owner should type a name and get
// the customer, or type a SKU, carat, or metal and get the piece — rather than
// re-keying details the business already holds.

export type CustomerOption = {
  label: string;
  name: string;
  email: string;
  phone: string;
};

export type ProductOption = {
  /** Rich label so native search matches name, SKU, carat, or metal. */
  label: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  metal: string;
  carats: string;
  colorClarity: string;
  unitPrice: number;
  /** Memo goods carry the supplier's weights and certificate. */
  metalWeight?: string;
  grossWeight?: string;
  certificate?: string;
  source?: "catalog" | "admin" | "memo";
};

export async function customerOptions(): Promise<CustomerOption[]> {
  const customers = await listCustomers().catch(() => []);
  return customers
    .map((customer) => ({
      label: customer.name ? `${customer.name} — ${customer.email}` : customer.email,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function productOptions(): Promise<ProductOption[]> {
  const [admin, purchased] = await Promise.all([
    listAdminProducts().catch(() => []),
    listPurchasedInventory().catch(() => ({ memos: [], rows: [] })),
  ]);

  const fromCatalog: ProductOption[] = catalogProducts
    .filter((product) => product.slug !== "custom-jewelry-design")
    .map((product) => ({
      label: `${product.sku} · ${product.name} · ${product.carats}ct · ${product.material}`,
      sku: product.sku,
      name: product.name,
      description: product.name,
      category: product.category,
      metal: product.material,
      carats: product.carats ? `${product.carats} ct` : "",
      colorClarity: product.colorClarity ?? "",
      unitPrice: product.price,
      source: "catalog" as const,
    }));

  const fromAdmin: ProductOption[] = admin.map((product) => ({
    label: `${product.sku} · ${product.name} · ${product.carats}ct · ${product.material}`,
    sku: product.sku,
    name: product.name,
    description: product.name,
    category: product.category,
    metal: product.material,
    carats: product.carats ? `${product.carats} ct` : "",
    colorClarity: product.colorClarity ?? "",
    unitPrice: product.price,
    source: "admin" as const,
  }));

  // Memo goods sell at the retail figure (cost + 10%) and bring their weights
  // and certificate straight onto the document. Sold-out pieces are dropped so
  // nothing already returned to the vendor can be invoiced by accident.
  const fromMemo: ProductOption[] = purchased.rows
    .filter((row) => row.stock > 0)
    .map((row) => ({
      label: `${row.code} · ${row.name} · ${row.diamondCarats}ct · ${row.metal} · MEMO ${row.memoNumber}`,
      sku: row.code,
      name: row.name,
      description: row.name,
      category: row.category,
      metal: row.metal,
      carats: `${row.diamondCarats} ct`,
      colorClarity: "",
      unitPrice: row.retail,
      metalWeight: `${row.metalWeightGm} gm`,
      grossWeight: `${row.grossWeightGm} gm`,
      ...(row.certificate ? { certificate: row.certificate } : {}),
      source: "memo" as const,
    }));

  return [...fromMemo, ...fromAdmin, ...fromCatalog].sort((a, b) => a.label.localeCompare(b.label));
}
