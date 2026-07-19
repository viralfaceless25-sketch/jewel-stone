import type { ProductSource } from "@/data/products";

export type CheckoutMode = "payment" | "reservation";

export function envFlag(value: string | undefined) {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}

export function checkoutMode(
  sources: ProductSource[],
  allowSignatureCheckout = false,
): CheckoutMode {
  if (!sources.length) return "reservation";
  return sources.every((source) => source === "lab-grown" || allowSignatureCheckout)
    ? "payment"
    : "reservation";
}

export function checkoutOrigin(
  requestUrl: string,
  configuredSiteUrl: string | undefined,
  production = process.env.NODE_ENV === "production",
) {
  if (!configuredSiteUrl) {
    if (production) throw new Error("site_url_unconfigured");
    return new URL(requestUrl).origin;
  }

  let url: URL;
  try {
    url = new URL(configuredSiteUrl);
  } catch {
    throw new Error("site_url_invalid");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("site_url_invalid");
  if (production && url.protocol !== "https:") throw new Error("site_url_invalid");
  return url.origin;
}
