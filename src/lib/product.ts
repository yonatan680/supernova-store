import type { ImageKey, Product } from "./types";

/**
 * SUPERNOVA does not publish size runs. These are standard scales so the flow works;
 * the UI labels them as placeholders until the brand confirms real availability.
 */
export const SIZE_SCALES = {
  shoe: ["40", "41", "42", "43", "44", "45"],
  apparel: ["S", "M", "L", "XL"],
} as const;

export function sizesFor(product: Product): readonly string[] {
  return product.sizeScale ? SIZE_SCALES[product.sizeScale] : [];
}

export function defaultSelections(product: Product): Record<string, string> {
  return Object.fromEntries(product.options.map((o) => [o.id, o.values[0].value]));
}

export function selectedValue(product: Product, optionId: string, selections: Record<string, string>) {
  const option = product.options.find((o) => o.id === optionId);
  return option?.values.find((v) => v.value === selections[optionId]);
}

export function unitPrice(product: Product, selections: Record<string, string>): number | null {
  for (const option of product.options) {
    const value = option.values.find((v) => v.value === selections[option.id]);
    if (value?.price != null) return value.price;
  }
  return product.price;
}

/** Lowest published price across piece options (e.g. Nike Tech shorts 169₪). */
export function fromPrice(product: Product): { min: number | null; varies: boolean } {
  const prices = product.options.flatMap((o) => o.values.map((v) => v.price)).filter((p): p is number => p != null);
  if (prices.length === 0) return { min: product.price, varies: false };
  const min = Math.min(...prices);
  return { min, varies: prices.some((p) => p !== min) };
}

export function imageFor(product: Product, selections: Record<string, string>): ImageKey {
  for (const option of product.options) {
    const value = option.values.find((v) => v.value === selections[option.id]);
    if (value?.image) return value.image;
  }
  return product.images[0];
}

/** Gallery: selected variant image first, then the rest without duplicates. */
export function galleryFor(product: Product, selections: Record<string, string>): ImageKey[] {
  const lead = imageFor(product, selections);
  const variantImages = product.options.flatMap((o) => o.values.map((v) => v.image)).filter(Boolean) as ImageKey[];
  return [...new Set([lead, ...product.images, ...variantImages])];
}

export function variantLabel(product: Product, selections: Record<string, string>, size?: string): string {
  const parts = product.options.map((o) => o.values.find((v) => v.value === selections[o.id])?.label).filter(Boolean);
  if (size) parts.push(`מידה ${size}`);
  return parts.join(" · ");
}
