/**
 * Trims the transparent padding from the brand mark and reports its ink colour,
 * so the asset aligns to its own edges and the token can match the artwork.
 *
 *   node scripts/prepare-logo.mjs <source> <destination>
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";

const [source, destination] = process.argv.slice(2);
if (!source || !destination) {
  throw new Error("Usage: node scripts/prepare-logo.mjs <source> <destination>");
}

const data = await readFile(source);
const dataUrl = `data:image/png;base64,${data.toString("base64")}`;

const browser = await chromium.launch();
const page = await browser.newPage();

const result = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();

  const read = document.createElement("canvas");
  read.width = img.naturalWidth;
  read.height = img.naturalHeight;
  const rctx = read.getContext("2d", { willReadFrequently: true });
  rctx.drawImage(img, 0, 0);
  const { data: px, width, height } = rctx.getImageData(0, 0, read.width, read.height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const tally = new Map();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const a = px[i + 3];
      if (a < 8) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      // Only fully opaque pixels describe the ink; edges are antialiased.
      if (a > 240) {
        const key = `${px[i]},${px[i + 1]},${px[i + 2]}`;
        tally.set(key, (tally.get(key) ?? 0) + 1);
      }
    }
  }

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = trimW;
  out.height = trimH;
  out.getContext("2d").drawImage(img, minX, minY, trimW, trimH, 0, 0, trimW, trimH);

  const ink = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    source: { width, height },
    trimmed: { width: trimW, height: trimH },
    ink,
    png: out.toDataURL("image/png"),
  };
}, dataUrl);

await mkdir(dirname(destination), { recursive: true });
await writeFile(
  destination,
  Buffer.from(result.png.replace(/^data:image\/png;base64,/, ""), "base64"),
);

const hex = (rgb) =>
  `#${rgb
    .split(",")
    .map((n) => Number(n).toString(16).padStart(2, "0"))
    .join("")}`;

console.log(`source   ${result.source.width}x${result.source.height}`);
console.log(`trimmed  ${result.trimmed.width}x${result.trimmed.height} -> ${destination}`);
console.log(
  `ratio    ${(result.trimmed.width / result.trimmed.height).toFixed(3)}`,
);
for (const [rgb, count] of result.ink) {
  console.log(`ink      rgb(${rgb})  ${hex(rgb)}  ${count}px`);
}

await browser.close();
