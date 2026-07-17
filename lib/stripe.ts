import Stripe from "stripe";

// Null-safe: if no secret key is configured yet, the whole checkout gracefully
// falls back to the reservation flow. Drop STRIPE_SECRET_KEY into .env.local to
// switch on real payments.
const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key ? new Stripe(key, { apiVersion: "2026-06-24.dahlia" }) : null;

export const isStripeEnabled = Boolean(key);
