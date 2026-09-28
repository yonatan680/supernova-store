/** Commerce domain types. Shaped so a Shopify / headless adapter can map onto them 1:1. */

export type CategoryHandle = "sneakers" | "hoodies" | "sets" | "tees-shorts" | "fragrances" | "watches";

/** Key into src/data/image-manifest.json, e.g. "Ddk7zUHDfA3/01" or "grid/Dbg34t3N0nb". */
export type ImageKey = string;

export interface OptionValue {
  value: string;
  label: string;
  /** Overrides the product price when this value is selected (e.g. "full set" vs "hoodie only"). */
  price?: number;
  /** Image that represents this value (colourway photo). */
  image?: ImageKey;
  /** CSS colour for the swatch dot, only when the colour is visually unambiguous. */
  swatch?: string;
}

export interface ProductOption {
  id: "color" | "piece" | "brand" | "model";
  label: string;
  values: OptionValue[];
}

export type SizeScale = "shoe" | "apparel" | null;

export interface Product {
  handle: string;
  title: string;
  brand: string;
  category: CategoryHandle;
  /** Price in ILS as published by SUPERNOVA. null = not published → placeholder. */
  price: number | null;
  /** Extra verbatim pricing info from the caption (bundles, ranges). */
  priceNote?: string;
  images: ImageKey[];
  options: ProductOption[];
  /** Size scale. Actual size runs are NOT published by SUPERNOVA — see sizesArePlaceholder. */
  sizeScale: SizeScale;
  /** Product copy. null = not published → placeholder. */
  description: string | null;
  bundle?: Bundle;
  source: {
    /** Instagram post the product, price and images were taken from. */
    url: string;
    /** yyyy-mm-dd when known. */
    date?: string;
    likes?: number;
  };
  /** Posted in the latest drop window (derived from post dates, not invented). */
  isNew?: boolean;
}

export interface Bundle {
  id: string;
  label: string;
  quantity: number;
  price: number;
}

export interface Category {
  handle: CategoryHandle;
  title: string;
  titleEn: string;
  image: ImageKey;
  description: string;
}

export interface CartLine {
  id: string;
  handle: string;
  quantity: number;
  selections: Record<string, string>;
  size?: string;
}
