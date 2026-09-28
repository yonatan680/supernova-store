import { fromPrice, SIZE_SCALES } from "./product";
import type { CategoryHandle, Product } from "./types";

/** Colour families derived from the colour option slugs (which were read off the product photos). */
export const COLOR_FAMILIES = [
  { id: "black", label: "שחור", hex: "#141414", match: ["black"] },
  { id: "white", label: "לבן", hex: "#f4f4f4", match: ["white"] },
  { id: "grey", label: "אפור / כסוף", hex: "#9a9a9a", match: ["grey", "gray", "silver"] },
  { id: "blue", label: "כחול / תכלת", hex: "#3659a8", match: ["blue", "navy", "sky"] },
  { id: "red", label: "אדום", hex: "#b3202a", match: ["red"] },
  { id: "pink", label: "ורוד", hex: "#e9a7bd", match: ["pink"] },
  { id: "green", label: "ירוק", hex: "#4d6b3c", match: ["green", "woodland"] },
  { id: "cream", label: "קרם / בז׳", hex: "#e8dfcb", match: ["cream", "beige"] },
  { id: "purple", label: "סגול", hex: "#7b5aa6", match: ["purple"] },
  { id: "yellow", label: "צהוב", hex: "#d9b43b", match: ["yellow", "gold"] },
] as const;

export const PRICE_BUCKETS = [
  { id: "under-200", label: "עד ₪200", test: (p: number) => p < 200 },
  { id: "200-300", label: "₪200–₪300", test: (p: number) => p >= 200 && p <= 300 },
  { id: "over-300", label: "מעל ₪300", test: (p: number) => p > 300 },
] as const;

export const SORTS = [
  { id: "featured", label: "מומלץ" },
  { id: "new", label: "החדשים ביותר" },
  { id: "popular", label: "הכי אהובים באינסטגרם" },
  { id: "price-asc", label: "מחיר: מהנמוך לגבוה" },
  { id: "price-desc", label: "מחיר: מהגבוה לנמוך" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export const ALL_SIZES = [...SIZE_SCALES.apparel, ...SIZE_SCALES.shoe];

export interface FilterState {
  q: string;
  category: CategoryHandle[];
  brand: string[];
  size: string[];
  color: string[];
  price: string[];
  sort: SortId;
}

export function colorFamilies(product: Product): string[] {
  const color = product.options.find((o) => o.id === "color");
  if (!color) return [];
  const tokens = color.values.flatMap((v) => v.value.split("-"));
  return COLOR_FAMILIES.filter((f) => f.match.some((m) => tokens.includes(m))).map((f) => f.id);
}

export function parseFilters(params: URLSearchParams): FilterState {
  const list = (k: string) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const sort = params.get("sort") as SortId | null;
  return {
    q: params.get("q") ?? "",
    category: list("category") as CategoryHandle[],
    brand: list("brand"),
    size: list("size"),
    color: list("color"),
    price: list("price"),
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "featured",
  };
}

export function applyFilters(items: Product[], f: FilterState, searchHits?: Set<string>): Product[] {
  let out = items.filter((p) => {
    if (searchHits && !searchHits.has(p.handle)) return false;
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.brand.length && !f.brand.includes(p.brand)) return false;
    if (f.size.length) {
      const scale = p.sizeScale ? (SIZE_SCALES[p.sizeScale] as readonly string[]) : [];
      if (!f.size.some((s) => scale.includes(s))) return false;
    }
    if (f.color.length && !colorFamilies(p).some((c) => f.color.includes(c))) return false;
    if (f.price.length) {
      const { min } = fromPrice(p);
      if (min == null) return false;
      if (!PRICE_BUCKETS.filter((b) => f.price.includes(b.id)).some((b) => b.test(min))) return false;
    }
    return true;
  });

  const order = new Map(items.map((p, i) => [p.handle, i]));
  const priceOf = (p: Product) => fromPrice(p).min;
  switch (f.sort) {
    case "new":
      out = [...out].sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || order.get(a.handle)! - order.get(b.handle)!);
      break;
    case "popular":
      out = [...out].sort((a, b) => (b.source.likes ?? 0) - (a.source.likes ?? 0));
      break;
    case "price-asc":
      out = [...out].sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
      break;
    case "price-desc":
      out = [...out].sort((a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity));
      break;
  }
  return out;
}
