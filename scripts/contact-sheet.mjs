// Dev helper: renders one labelled contact sheet per raw folder for visual review.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("scripts/raw");
const out = path.resolve("scripts/sheets");
await fs.mkdir(out, { recursive: true });
const T = 220;

for (const dir of await fs.readdir(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const files = (await fs.readdir(path.join(root, dir.name))).sort();
  const cols = 5;
  const rows = Math.ceil(files.length / cols);
  const tiles = await Promise.all(
    files.map(async (f, i) => {
      const img = await sharp(path.join(root, dir.name, f)).resize(T, T * 1.3, { fit: "cover" }).toBuffer();
      const label = Buffer.from(
        `<svg width="${T}" height="26"><rect width="100%" height="100%" fill="black"/><text x="6" y="18" font-size="15" fill="white" font-family="Arial">${f}</text></svg>`
      );
      return [
        { input: img, left: (i % cols) * T, top: Math.floor(i / cols) * (T * 1.3 + 26) },
        { input: label, left: (i % cols) * T, top: Math.floor(i / cols) * (T * 1.3 + 26) + T * 1.3 },
      ];
    })
  );
  await sharp({ create: { width: cols * T, height: rows * (T * 1.3 + 26), channels: 3, background: "#fff" } })
    .composite(tiles.flat())
    .jpeg({ quality: 70 })
    .toFile(path.join(out, `${dir.name}.jpg`));
}
console.log("done");
