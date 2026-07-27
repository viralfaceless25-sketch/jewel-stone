import { createHmac, timingSafeEqual } from "node:crypto";

export type CustomerSessionClaims = {
  email: string;
  expiresAt: number;
  tokenVersion: number;
};

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createCustomerSessionToken(
  email: string,
  tokenVersion: number,
  secret: string,
  expiresAt: number,
) {
  const claims: CustomerSessionClaims = {
    email: email.trim().toLowerCase(),
    expiresAt,
    tokenVersion: Math.max(1, Math.round(tokenVersion)),
  };
  const encoded = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function parseCustomerSessionToken(
  token: string | undefined,
  secret: string | null,
  now = Date.now(),
): CustomerSessionClaims | null {
  if (!secret || !token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(encoded, "base64url").toString()) as Partial<CustomerSessionClaims>;
    if (
      typeof claims.email !== "string" ||
      !claims.email ||
      typeof claims.expiresAt !== "number" ||
      claims.expiresAt <= now ||
      typeof claims.tokenVersion !== "number" ||
      !Number.isInteger(claims.tokenVersion) ||
      claims.tokenVersion < 1
    ) {
      return null;
    }
    return {
      email: claims.email.trim().toLowerCase(),
      expiresAt: claims.expiresAt,
      tokenVersion: claims.tokenVersion,
    };
  } catch {
    return null;
  }
}
