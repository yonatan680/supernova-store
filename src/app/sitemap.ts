import type { MetadataRoute } from "next";
import { pages } from "@/data/content";
import { site } from "@/data/site";
import { getCategories, getProducts } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), changeFrequency: "daily", priority: 0.9 },
    ...getCategories().map((c) => ({ url: url(`/collections/${c.handle}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...getProducts().map((p) => ({
      url: url(`/products/${p.handle}`),
      lastModified: p.source.date,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...pages.map((p) => ({ url: url(`/pages/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
