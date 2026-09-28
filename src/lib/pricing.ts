import { getProduct } from "./catalog";
import { unitPrice, variantLabel, imageFor } from "./product";
import type { CartLine, Product } from "./types";

export interface ResolvedLine extends CartLine {
  product: Product;
  unit: number | null;
  lineTotal: number | null;
  variant: string;
  image: string;
}

export interface CartTotals {
  lines: ResolvedLine[];
  count: number;
  /** Sum of all priced lines before bundle discounts. */
  gross: number;
  discounts: { label: string; amount: number }[];
  subtotal: number;
  /** Lines whose price SUPERNOVA hasn't published — to be confirmed in DM. */
  unpriced: ResolvedLine[];
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.handle);
    if (!product) return [];
    const unit = unitPrice(product, line.selections);
    return [
      {
        ...line,
        product,
        unit,
        lineTotal: unit == null ? null : unit * line.quantity,
        variant: variantLabel(product, line.selections, line.size),
        image: imageFor(product, line.selections),
      },
    ];
  });
}

export function computeTotals(cart: CartLine[]): CartTotals {
  const lines = resolveLines(cart);
  const gross = lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0);

  // Bundles published in captions (e.g. Burberry "2 ב-299₪").
  const bundles = new Map<string, { label: string; size: number; price: number; units: number[] }>();
  for (const l of lines) {
    const b = l.product.bundle;
    if (!b || l.unit == null) continue;
    const entry = bundles.get(b.id) ?? { label: b.label, size: b.quantity, price: b.price, units: [] };
    for (let i = 0; i < l.quantity; i++) entry.units.push(l.unit);
    bundles.set(b.id, entry);
  }
  const discounts: CartTotals["discounts"] = [];
  for (const b of bundles.values()) {
    const units = b.units.sort((a, z) => z - a);
    let amount = 0;
    for (let i = 0; i + b.size <= units.length; i += b.size) {
      const group = units.slice(i, i + b.size).reduce((s, u) => s + u, 0);
      amount += Math.max(0, group - b.price);
    }
    if (amount > 0) discounts.push({ label: b.label, amount });
  }

  const discountTotal = discounts.reduce((s, d) => s + d.amount, 0);
  return {
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    gross,
    discounts,
    subtotal: gross - discountTotal,
    unpriced: lines.filter((l) => l.unit == null),
  };
}
