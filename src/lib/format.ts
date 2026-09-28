import { PLACEHOLDER } from "@/data/site";

const ils = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined): string {
  return value == null ? PLACEHOLDER.price : ils.format(value);
}
