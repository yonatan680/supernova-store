import "server-only";
import { shippingMethods } from "@/data/shipping";
import type { CheckoutConfig } from "@/lib/commerce/types";
import { createStripeProvider } from "./adapters/stripe";
import type { PaymentProvider } from "./types";

/**
 * Registered adapters, keyed by the PAYMENT_PROVIDER env value.
 * Card details never touch this server: each adapter must use a hosted payment page.
 *
 * To go live:
 *  1. Open a merchant account (Stripe, or add a PayPlus / Meshulam / CardCom adapter here).
 *  2. Set PAYMENT_PROVIDER to the adapter id.
 *  3. Set that adapter's secret keys in the server environment (never NEXT_PUBLIC_*).
 *  4. Set NEXT_PUBLIC_SITE_URL to the public https origin.
 *  5. Set a real shipping price in src/data/shipping.ts (0 = free shipping).
 *  6. Register `${NEXT_PUBLIC_SITE_URL}/api/payments/webhook` with the provider.
 */
const adapters: Record<string, () => PaymentProvider> = {
  stripe: createStripeProvider,
};

let cached: { id: string; provider: PaymentProvider | null } | undefined;

export function getPaymentProvider(): PaymentProvider | null {
  const id = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  if (cached?.id === id) return cached.provider;
  const factory = id ? adapters[id] : undefined;
  let provider: PaymentProvider | null = null;
  if (factory) {
    try {
      provider = factory();
    } catch (err) {
      console.error(`[payments] adapter "${id}" failed to initialise:`, err instanceof Error ? err.message : err);
    }
  }
  cached = { id, provider };
  return provider;
}

function siteUrlReady(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol === "https:") return true;
    return process.env.NODE_ENV !== "production" && u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export function getCheckoutConfig(): CheckoutConfig {
  const id = (process.env.PAYMENT_PROVIDER ?? "").trim();
  const provider = getPaymentProvider();
  const missing: string[] = [];

  if (!id) missing.push("PAYMENT_PROVIDER is not set — use `stripe` (adapter ready) or register another adapter in src/server/payments/index.ts");
  else if (!adapters[id.toLowerCase()]) missing.push(`No adapter registered for PAYMENT_PROVIDER="${id}" in src/server/payments/index.ts`);
  else if (!provider) {
    if (id.toLowerCase() === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY?.trim()) missing.push("STRIPE_SECRET_KEY (secret key from Stripe Dashboard → Developers; never a pk_ publishable key in a server env named SECRET)");
      if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) missing.push("STRIPE_WEBHOOK_SECRET (whsec_… from the webhook endpoint for /api/payments/webhook)");
    }
    if (missing.length === 0) missing.push(`Adapter "${id}" could not start — check its credentials in the server environment`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!siteUrlReady(siteUrl)) missing.push("NEXT_PUBLIC_SITE_URL must be the public URL of the store (https in production) so payment return and webhook URLs are correct");

  if (!shippingMethods.some((m) => m.price != null)) missing.push("Shipping price is not set — edit src/data/shipping.ts (0 = free shipping)");

  const enabled = provider != null && missing.length === 0;
  return { enabled, providerName: provider?.displayName ?? null, methods: provider ? provider.methods : [], missing };
}
