/**
 * Catalogue access layer. Pages only talk to these functions, so replacing the local
 * data with Shopify Storefront API / any headless backend means re-implementing this file.
 */
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { CategoryHandle, Product } from "./types";

export function getProducts(): Product[] {
  return products;
}

export function getProduct(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export function getCategories() {
  return categories;
}

export function getCategory(handle: string) {
  return categories.find((c) => c.handle === handle);
}

export function getProductsByCategory(handle: CategoryHandle): Product[] {
  return products.filter((p) => p.category === handle);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getRelated(product: Product, limit = 4): Product[] {
  const same = products.filter((p) => p.handle !== product.handle && p.category === product.category);
  const others = products.filter((p) => p.handle !== product.handle && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}
