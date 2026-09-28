import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, priorityCount = 0, variant = "grid" }: { products: Product[]; priorityCount?: number; variant?: "grid" | "grid-4" | "rail" }) {
  return (
    <ul className={variant === "rail" ? "rail" : variant === "grid-4" ? "grid grid--4" : "grid"} role="list">
      {products.map((p, i) => (
        <li key={p.handle}>
          <ProductCard product={p} priority={i < priorityCount} sizes={variant === "rail" ? "(min-width: 1024px) 24vw, (min-width: 768px) 36vw, 70vw" : undefined} />
        </li>
      ))}
    </ul>
  );
}
