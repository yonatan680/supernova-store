import type { Metadata } from "next";
import { Suspense } from "react";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { CollectionView } from "@/components/collection/CollectionView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { site } from "@/data/site";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "חנות — כל המוצרים",
  description: `${site.bio.promise} נעליים, הודיז, סטים, בשמים ושעונים.`,
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const products = getProducts();
  return (
    <>
      <CollectionHeader eyebrow="Shop All" title="כל המוצרים" description={site.bio.promise} crumbs={[{ href: "/", label: "דף הבית" }]} />
      <Suspense
        fallback={
          <div className="container">
            <ProductGrid products={products} priorityCount={4} />
          </div>
        }
      >
        <CollectionView products={products} showCategoryFilter />
      </Suspense>
    </>
  );
}
