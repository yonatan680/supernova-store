import type { ShippingMethod } from "@/data/shipping";
import type { CartTotals } from "../pricing";

export interface Quote {
  shipping: number | null;
  /** null while any part of the amount is unknown — such a cart cannot be paid online. */
  total: number | null;
}

/** Same function on both sides, so the amount on screen is the amount the server charges. */
export function quote(totals: CartTotals, method: ShippingMethod | undefined): Quote {
  const shipping = method?.price ?? null;
  const total = totals.lines.length > 0 && totals.unpriced.length === 0 && shipping != null ? totals.subtotal + shipping : null;
  return { shipping, total };
}
