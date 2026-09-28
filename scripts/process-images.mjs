// Normalises the raw Instagram captures into web-ready sources + a manifest.
// Keys are "<instagram-shortcode>/<nn>" (or "grid/<shortcode>") so every image
// stays traceable to the SUPERNOVA post it came from.
// Next.js <Image> then serves AVIF/WebP at responsive widths from these sources.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAW = path.resolve("scripts/raw");
const OUT = path.resolve("public/images/ig");
const MANIFEST = path.resolve("src/data/image-manifest.json");
const MAX = 1400;

await fs.mkdir(OUT, { recursive: true });
const manifest = {};

for (const dir of await fs.readdir(RAW, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const file of (await fs.readdir(path.join(RAW, dir.name))).sort()) {
    const key = `${dir.name}/${path.parse(file).name}`;
    const outName = `${dir.name}-${path.parse(file).name}.jpg`.replace(/_/g, "-");
    const input = sharp(path.join(RAW, dir.name, file)).rotate();
    const { data, info } = await input
      .clone()
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    await fs.writeFile(path.join(OUT, outName), data);
    const blur = await input.clone().resize(12).webp({ quality: 40 }).toBuffer();
    manifest[key] = {
      src: `/images/ig/${outName}`,
      width: info.width,
      height: info.height,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    };
  }
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`processed ${Object.keys(manifest).length} images`);
