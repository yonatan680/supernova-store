// One-off: downloads the SUPERNOVA Instagram images captured from the browser session
// into scripts/raw/<shortcode>/NN.jpg so they can be processed locally.
import fs from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/download-instagram.mjs <cdp-response.json>");

const outer = JSON.parse(await fs.readFile(src, "utf8"));
const store = JSON.parse(outer.result.value);
const root = path.resolve("scripts/raw");
const SKIP = "786818509_18087448424331707";

const jobs = [];
for (const [key, raw] of Object.entries(store)) {
  if (key === "sn_pic") {
    jobs.push({ url: raw, file: path.join(root, "profile.jpg") });
    continue;
  }
  const value = JSON.parse(raw);
  if (key === "sn_grid") {
    for (const { h, img } of value) {
      if (!img) continue;
      const code = h.split("/").filter(Boolean).pop();
      jobs.push({ url: img, file: path.join(root, "grid", `${code}.jpg`) });
    }
    continue;
  }
  const code = key.slice(3);
  value
    .filter((u) => !u.includes(SKIP))
    .forEach((url, i) => jobs.push({ url, file: path.join(root, code, `${String(i + 1).padStart(2, "0")}.jpg`) }));
}

let ok = 0;
await Promise.all(
  jobs.map(async ({ url, file }) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) {
      console.error("FAIL", file, e.message);
    }
  })
);
console.log(`downloaded ${ok}/${jobs.length}`);
