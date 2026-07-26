import "server-only";

import { products as catalogProducts } from "@/data/products";
import { listAdminProducts } from "./inventory";
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
  const admin = await listAdminProducts().catch(() => []);

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
  }));

  return [...fromAdmin, ...fromCatalog].sort((a, b) => a.label.localeCompare(b.label));
}
