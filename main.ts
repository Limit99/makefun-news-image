// The World on Tuesday — a one-image summary of the world news of
// Tuesday 17 November 2026, entered in make.fun's news-image-20261117.
//
// The picture itself lives beside this file as entry.png: a bold
// one-image front page dated 17 November 2026 with six panels (Kerch
// Bridge strike, Iran drones over Bahrain, the Trump-Xi-Putin
// trilateral, the Gaza aid appeal, the French pay strike and the US
// losing measles elimination status).
// Drawing happens before submission; at grading time this program only
// has to place those exact bytes at the output path, twice in a row,
// with no network and nothing but the Node 22 standard library.
//
// Local run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const source = new URL("./entry.png", import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

// Guard the gate's limits before copying: at most 1 MiB and 1024x1024.
// The PNG width/height sit big-endian at bytes 16..24 of the IHDR chunk,
// right after the 8-byte signature and the chunk length + "IHDR" label.
const head = readFileSync(source).subarray(0, 24);
const isPng =
  head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
if (!isPng) throw new Error("entry.png is not a PNG image");
const width = head.readUInt32BE(16);
const height = head.readUInt32BE(20);
const size = statSync(source).size;
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
if (size > 1_048_576) {
  throw new Error(`entry.png is ${size} bytes, over the 1 MiB cap`);
}

copyFileSync(source, target);

const bytes = statSync(target).size;
console.log(`entry.png written: ${bytes} bytes (${width}x${height}) -> ${target}`);
