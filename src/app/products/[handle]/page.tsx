import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductView } from "@/components/product/ProductView";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { site } from "@/data/site";
import { getCategory, getProduct, getProducts, getRelated } from "@/lib/catalog";
import { img } from "@/lib/images";
import { fromPrice } from "@/lib/product";

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ handle: p.handle }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) return {};
  const image = img(product.images[0]);
  const { min, varies } = fromPrice(product);
  const priceText = min != null ? `${varies ? "החל מ-" : ""}₪${min}` : "";
  const description = `${product.title} — ${product.brand}. ${priceText ? `${priceText}. ` : ""}${site.voice.shipping}`;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      type: "website",
      title: `${product.title} | ${site.name}`,
      description,
      url: `/products/${product.handle}`,
      images: [{ url: image.src, width: image.width, height: image.height, alt: product.title }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();
  const category = getCategory(product.category)!;
  const related = getRelated(product, 4);

  const prices = product.options.flatMap((o) => o.values.map((v) => v.price)).filter((p): p is number => p != null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    brand: { "@type": "Brand", name: product.brand },
    category: category.titleEn,
    image: product.images.map((k) => new URL(img(k).src, site.url).toString()),
    url: new URL(`/products/${product.handle}`, site.url).toString(),
    ...(product.description ? { description: product.description } : {}),
    ...(product.price != null || prices.length
      ? {
          offers:
            prices.length > 1
              ? {
                  "@type": "AggregateOffer",
                  priceCurrency: "ILS",
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: prices.length,
                  seller: { "@type": "Organization", name: site.name },
                }
              : {
                  "@type": "Offer",
                  priceCurrency: "ILS",
                  price: prices[0] ?? product.price,
                  url: new URL(`/products/${product.handle}`, site.url).toString(),
                  seller: { "@type": "Organization", name: site.name },
                },
        }
      : {}),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "דף הבית", item: site.url },
      { "@type": "ListItem", position: 2, name: category.title, item: new URL(`/collections/${category.handle}`, site.url).toString() },
      { "@type": "ListItem", position: 3, name: product.title },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs]) }} />
      <nav className="breadcrumbs container" aria-label="פירורי לחם">
        <ol>
          <li>
            <Link href="/">דף הבית</Link>
          </li>
          <li>
            <Link href={`/collections/${category.handle}`}>{category.title}</Link>
          </li>
          <li aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <ProductView key={product.handle} product={product} categoryTitle={category.title} />

      <section className="section container" aria-labelledby="related-title">
        <div className="section__head">
          <h2 id="related-title" className="section__title">אולי יעניין אותך</h2>
        </div>
        <ProductGrid products={related} variant="rail" />
      </section>

      <RecentlyViewed exclude={product.handle} />
    </>
  );
}
