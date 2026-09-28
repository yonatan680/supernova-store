import "server-only";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { getShippingMethod } from "@/data/shipping";
import { getProduct } from "@/lib/catalog";
import { quote } from "@/lib/commerce/quote";
import type { CheckoutErrorCode, CheckoutLineInput, PaymentMethodId, PublicOrder, ShippingDetails } from "@/lib/commerce/types";
import { normalizeShipping, validateShipping } from "@/lib/commerce/validation";
import { computeTotals } from "@/lib/pricing";
import { sizesFor } from "@/lib/product";
import type { CartLine } from "@/lib/types";
import { sendOrderConfirmation } from "../notifications";
import type { VerifiedPayment } from "../payments/types";
import { isOrderId, orders, type OrderRecord } from "./repository";

type Result<T> = { ok: true; value: T } | { ok: false; code: CheckoutErrorCode; fields?: Partial<Record<keyof ShippingDetails, string>> };

const MAX_LINES = 30;
const MAX_QTY = 20;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newOrderId() {
  const d = new Date();
  const date = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `SN-${date}-${rand}`;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Only accepts lines whose product, options and size exist in the catalogue. */
function parseLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length > MAX_LINES) return null;
  const lines: CartLine[] = [];
  for (const [i, raw] of input.entries()) {
    if (!isRecord(raw) || typeof raw.handle !== "string") return null;
    const product = getProduct(raw.handle);
    if (!product) return null;
    const quantity = raw.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) return null;

    const selections = isRecord(raw.selections) ? raw.selections : {};
    if (Object.keys(selections).length !== product.options.length) return null;
    const clean: Record<string, string> = {};
    for (const option of product.options) {
      const value = selections[option.id];
      if (typeof value !== "string" || !option.values.some((v) => v.value === value)) return null;
      clean[option.id] = value;
    }

    const sizes = sizesFor(product);
    let size: string | undefined;
    if (sizes.length > 0) {
      if (typeof raw.size !== "string" || !sizes.includes(raw.size)) return null;
      size = raw.size;
    } else if (raw.size != null) return null;

    lines.push({ id: `${product.handle}#${i}`, handle: product.handle, quantity, selections: clean, size });
  }
  return lines;
}

export async function createOrder(body: unknown, provider: { id: string; methods: PaymentMethodId[] }): Promise<Result<OrderRecord>> {
  if (!isRecord(body)) return { ok: false, code: "invalid_request" };

  const lines = parseLines(body.lines as CheckoutLineInput[]);
  if (!lines) return { ok: false, code: "invalid_items" };
  if (lines.length === 0) return { ok: false, code: "empty_cart" };

  const customer = normalizeShipping(isRecord(body.customer) ? body.customer : {});
  const fields = validateShipping(customer);
  if (Object.keys(fields).length > 0) return { ok: false, code: "invalid_customer", fields };
  if (body.acceptTerms !== true) return { ok: false, code: "terms_required" };

  const method = typeof body.paymentMethod === "string" ? (body.paymentMethod as PaymentMethodId) : null;
  if (!method || !provider.methods.includes(method)) return { ok: false, code: "payment_method_unavailable" };

  const shippingMethod = typeof body.shippingMethod === "string" ? getShippingMethod(body.shippingMethod) : undefined;
  if (!shippingMethod || shippingMethod.price == null) return { ok: false, code: "shipping_unavailable" };

  const totals = computeTotals(lines);
  if (totals.unpriced.length > 0) return { ok: false, code: "unpriced_items" };
  const { total } = quote(totals, shippingMethod);
  if (total == null || total <= 0) return { ok: false, code: "invalid_items" };
  if (body.expectedTotal !== total) return { ok: false, code: "price_changed" };

  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: newOrderId(),
    accessKey: randomBytes(24).toString("base64url"),
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
    lines: totals.lines.map((l) => ({
      handle: l.handle,
      title: l.product.title,
      variant: l.variant,
      image: l.image,
      quantity: l.quantity,
      unit: l.unit!,
      lineTotal: l.lineTotal!,
    })),
    gross: totals.gross,
    discounts: totals.discounts,
    shipping: { id: shippingMethod.id, label: shippingMethod.label, price: shippingMethod.price },
    total,
    currency: "ILS",
    customer,
    paymentMethod: method,
    payment: { provider: provider.id },
    confirmationEmail: "pending",
  };
  await orders().create(order);
  return { ok: true, value: order };
}

export async function attachPaymentReference(id: string, reference: string) {
  return orders().update(id, (o) => ({ ...o, payment: { ...o.payment, reference } }));
}

/**
 * The only path that can mark an order paid. `payment` must come from an authenticated provider
 * response (webhook signature or server-to-server lookup); the amount and currency are re-checked here.
 */
export async function applyVerifiedPayment(id: string, payment: VerifiedPayment): Promise<OrderRecord | null> {
  let becamePaid = false;
  const updated = await orders().update(id, (o) => {
    if (o.status === "paid" || payment.status === "pending") return null;
    if (payment.status === "failed") return { ...o, status: "failed", payment: { ...o.payment, failureReason: payment.reason } };
    if (payment.currency.toUpperCase() !== o.currency || payment.amountMinor !== o.total * 100) {
      console.error(`[orders] ${o.id}: provider reported ${payment.amountMinor} ${payment.currency}, expected ${o.total * 100} ${o.currency} — not marking paid`);
      return null;
    }
    becamePaid = true;
    return { ...o, status: "paid", paidAt: new Date().toISOString(), payment: { ...o.payment, reference: payment.reference, failureReason: undefined } };
  });
  if (!updated || !becamePaid) return updated;

  const confirmationEmail = await sendOrderConfirmation(updated).catch((err) => {
    console.error(`[orders] ${updated.id}: confirmation email failed`, err);
    return "failed" as const;
  });
  return orders().update(id, (o) => ({ ...o, confirmationEmail }));
}

export async function markPaymentFailed(id: string, reason: string) {
  return orders().update(id, (o) => (o.status === "pending_payment" ? { ...o, status: "failed", payment: { ...o.payment, failureReason: reason } } : null));
}

export async function getOrderWithKey(id: string, key: string): Promise<OrderRecord | null> {
  if (!isOrderId(id) || !key) return null;
  const order = await orders().get(id);
  if (!order) return null;
  const a = Buffer.from(order.accessKey);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b) ? order : null;
}

export function toPublicOrder(o: OrderRecord): PublicOrder {
  const { notes: _notes, phone: _phone, ...customer } = o.customer;
  return {
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    lines: o.lines,
    gross: o.gross,
    discounts: o.discounts,
    shipping: { label: o.shipping.label, price: o.shipping.price },
    total: o.total,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    customer,
    confirmationEmail: o.confirmationEmail,
  };
}
