import { site } from "@/data/site";
import type { ShippingDetails } from "./commerce/types";
import { formatPrice } from "./format";
import type { CartTotals } from "./pricing";

/**
 * Fallback while online payment is not active (and for items without a published price):
 * SUPERNOVA's published ordering path is Instagram DM ("הזמנות בפרטי בלבד").
 * Checkout still produces a ready-to-send message as a backup — it is not a payment confirmation.
 */
export function buildOrderMessage(totals: CartTotals, customer?: Partial<ShippingDetails>): string {
  const rows = totals.lines.map(
    (l, i) => `${i + 1}. ${l.product.title}${l.variant ? ` (${l.variant})` : ""} × ${l.quantity} — ${l.lineTotal == null ? "מחיר לאישור" : formatPrice(l.lineTotal)}`,
  );
  const allUnpriced = totals.unpriced.length === totals.lines.length;
  const out = [`היי ${site.name}! אני רוצה להזמין:`, "", ...rows, ""];
  for (const d of totals.discounts) out.push(`${d.label}: -${formatPrice(d.amount)}`);
  if (allUnpriced) out.push("סה״כ: לאישור בפרטי");
  else out.push(`סה״כ: ${formatPrice(totals.subtotal)}${totals.unpriced.length ? " + פריטים שמחירם יאושר בפרטי" : ""}`);
  const address = [
    [customer?.street, customer?.houseNumber].filter(Boolean).join(" "),
    customer?.apartment && `דירה ${customer.apartment}`,
    customer?.city,
    customer?.zip,
  ]
    .filter(Boolean)
    .join(", ");
  const details = [
    customer?.fullName && `שם: ${customer.fullName}`,
    customer?.phone && `טלפון: ${customer.phone}`,
    customer?.email && `אימייל: ${customer.email}`,
    address && `כתובת: ${address}`,
    customer?.notes && `הערות: ${customer.notes}`,
  ].filter(Boolean);
  if (details.length) out.push("", ...(details as string[]));
  return out.join("\n");
}
