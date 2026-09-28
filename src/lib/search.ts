import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Product } from "./types";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0591-\u05c7'"׳״’\-–—_.]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const index = products.map((p) => {
  const category = categories.find((c) => c.handle === p.category);
  const haystack = [p.title, p.brand, category?.title, category?.titleEn, ...p.options.flatMap((o) => o.values.map((v) => v.label))]
    .filter(Boolean)
    .join(" ");
  return { product: p, text: normalize(haystack), title: normalize(`${p.title} ${p.brand}`) };
});

export function searchProducts(query: string, limit = 24): Product[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];
  return index
    .filter((e) => terms.every((t) => e.text.includes(t)))
    .map((e) => ({ e, score: terms.reduce((s, t) => s + (e.title.includes(t) ? 2 : 1), 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e }) => e.product);
}
