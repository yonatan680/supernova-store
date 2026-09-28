import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { CollectionView } from "@/components/collection/CollectionView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/catalog";
import { img } from "@/lib/images";
import type { CategoryHandle } from "@/lib/types";

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return getCategories().map((c) => ({ handle: c.handle }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const category = getCategory(handle);
  if (!category) return {};
  const image = img(category.image);
  return {
    title: `${category.title} — ${category.titleEn}`,
    description: category.description,
    alternates: { canonical: `/collections/${category.handle}` },
    openGraph: { title: category.title, description: category.description, images: [{ url: image.src, width: image.width, height: image.height }] },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const category = getCategory(handle);
  if (!category) notFound();
  const products = getProductsByCategory(handle as CategoryHandle);

  return (
    <>
      <CollectionHeader
        eyebrow={category.titleEn}
        title={category.title}
        description={category.description}
        crumbs={[
          { href: "/", label: "דף הבית" },
          { href: "/shop", label: "חנות" },
        ]}
      />
      <Suspense
        fallback={
          <div className="container">
            <ProductGrid products={products} priorityCount={4} />
          </div>
        }
      >
        <CollectionView products={products} showCategoryFilter={false} />
      </Suspense>
    </>
  );
}
