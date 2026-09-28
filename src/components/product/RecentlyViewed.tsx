"use client";

import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { recent, hydrated } = useStore();
  const items = recent
    .filter((h) => h !== exclude)
    .map(getProduct)
    .filter(Boolean)
    .slice(0, 4) as Product[];

  if (!hydrated || items.length === 0) return null;

  return (
    <section className="section container" aria-labelledby="recent-title">
      <div className="section__head">
        <h2 id="recent-title" className="section__title">נצפו לאחרונה</h2>
      </div>
      <ProductGrid products={items} variant="rail" />
    </section>
  );
}
