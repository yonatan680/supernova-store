import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMethodId } from "@/lib/commerce/types";
import type { CreatePaymentInput, PaymentProvider, VerifiedPayment } from "../types";

const API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2024-11-20.acacia";
const METHODS: PaymentMethodId[] = ["card", "apple_pay", "google_pay"];

type StripeSession = {
  id?: unknown;
  url?: unknown;
  status?: unknown;
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
  client_reference_id?: unknown;
  metadata?: { orderId?: unknown };
};

function env(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

function encodeForm(value: unknown, prefix = ""): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap((item, i) => encodeForm(item, `${prefix}[${i}]`));
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => encodeForm(v, prefix ? `${prefix}[${k}]` : k));
  }
  return [`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`];
}

async function stripe<T>(secret: string, method: string, path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? encodeForm(body).join("&") : undefined,
  });
  const json = (await res.json()) as { error?: { message?: string } } & T;
  if (!res.ok) throw new Error(json.error?.message || `Stripe request failed (${res.status})`);
  return json;
}

function orderIdFrom(session: StripeSession): string | null {
  const fromRef = typeof session.client_reference_id === "string" ? session.client_reference_id : "";
  const fromMeta = typeof session.metadata?.orderId === "string" ? session.metadata.orderId : "";
  return fromRef || fromMeta || null;
}

function fromSession(session: StripeSession): VerifiedPayment {
  const reference = typeof session.id === "string" ? session.id : "";
  const paid = session.payment_status === "paid";
  if (paid && typeof session.amount_total === "number" && typeof session.currency === "string" && reference) {
    return { status: "paid", amountMinor: session.amount_total, currency: session.currency, reference };
  }
  if (session.status === "expired" || session.status === "complete") {
    return { status: "failed", reason: typeof session.payment_status === "string" ? session.payment_status : "unpaid" };
  }
  return { status: "pending" };
}

/** Stripe signs t=timestamp,v1=hmac. Reject stale or unsigned payloads. */
function verifySignature(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const items = header.split(",").map((p) => {
    const i = p.indexOf("=");
    return i === -1 ? (["", ""] as const) : ([p.slice(0, i), p.slice(i + 1)] as const);
  });
  const timestamp = items.find(([k]) => k === "t")?.[1];
  const signatures = items.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  return signatures.some((sig) => {
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export function createStripeProvider(): PaymentProvider {
  const secret = env("STRIPE_SECRET_KEY");
  const webhookSecret = env("STRIPE_WEBHOOK_SECRET");

  const verifyByReference = async (reference: string): Promise<VerifiedPayment> => {
    const session = await stripe<StripeSession>(secret, "GET", `checkout/sessions/${encodeURIComponent(reference)}`);
    return fromSession(session);
  };

  return {
    id: "stripe",
    displayName: "Stripe",
    methods: METHODS,

    async createPayment(input: CreatePaymentInput) {
      const session = await stripe<StripeSession>(secret, "POST", "checkout/sessions", {
        mode: "payment",
        submit_type: "pay",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.order.id,
        customer_email: input.order.customer.email,
        locale: "he",
        metadata: { orderId: input.order.id },
        payment_intent_data: { metadata: { orderId: input.order.id } },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.amountMinor,
              product_data: { name: input.description },
            },
          },
        ],
      });
      if (typeof session.url !== "string" || typeof session.id !== "string") throw new Error("Stripe did not return a payment page");
      return { redirectUrl: session.url, reference: session.id };
    },

    async verifyPayment(order) {
      if (!order.payment.reference) return { status: "pending" };
      return verifyByReference(order.payment.reference);
    },

    async parseWebhook(request) {
      const raw = await request.text();
      if (!verifySignature(raw, request.headers.get("stripe-signature"), webhookSecret)) return null;
      let event: { type?: unknown; data?: { object?: StripeSession } };
      try {
        event = JSON.parse(raw) as { type?: unknown; data?: { object?: StripeSession } };
      } catch {
        return null;
      }
      const type = event.type;
      if (
        type !== "checkout.session.completed" &&
        type !== "checkout.session.async_payment_succeeded" &&
        type !== "checkout.session.async_payment_failed" &&
        type !== "checkout.session.expired"
      ) {
        return { orderId: "", payment: { status: "pending" } };
      }
      const session = event.data?.object;
      const id = typeof session?.id === "string" ? session.id : "";
      const orderId = session ? orderIdFrom(session) : null;
      if (!id || !orderId) return null;
      return { orderId, payment: await verifyByReference(id) };
    },
  };
}
