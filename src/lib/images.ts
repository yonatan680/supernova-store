import manifest from "@/data/image-manifest.json";
import type { ImageKey } from "./types";

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  blur: string;
}

const images = manifest as Record<string, ImageAsset>;

export function img(key: ImageKey): ImageAsset {
  const asset = images[key];
  if (!asset) throw new Error(`Unknown image key: ${key}`);
  return asset;
}
