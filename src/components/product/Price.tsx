import { formatPrice } from "@/lib/format";

/** SUPERNOVA publishes no compare-at / sale prices, so none are rendered. */
export function Price({ value, from = false, className = "" }: { value: number | null; from?: boolean; className?: string }) {
  return (
    <span className={`price ${value == null ? "price--ph" : ""} ${className}`}>
      {from && value != null && <span className="price__from">החל מ-</span>}
      {formatPrice(value)}
    </span>
  );
}
