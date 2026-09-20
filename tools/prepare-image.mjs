/**
 * Convert a generated hero original into a committable asset.
 *
 * The generator returns multi-megabyte PNGs. Committing those is a mistake
 * that compounds: git history keeps every version forever, GitHub Pages caps a
 * published site at 1GB, and Git LFS cannot help because Pages does not
 * resolve LFS pointers.
 *
 * So originals stay out of the repo. This produces a WebP sized for the hero
 * slot, which is what gets committed.
 *
 *   node tools/prepare-image.mjs <source.png> <slug>
 *
 * Writes src/assets/heroes/<slug>.webp, which Astro then optimizes further per
 * breakpoint at build time.
 */

import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

/** Wide enough for a 2x hero at the 1200px content width. */
const TARGET_WIDTH = 2400;
const QUALITY = 82;
const OUT_DIR = 'src/assets/heroes';

async function main() {
  const [source, slug] = process.argv.slice(2);

  if (!source || !slug) {
    console.error('Usage: node tools/prepare-image.mjs <source.png> <slug>');
    process.exitCode = 1;
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  const destination = path.join(OUT_DIR, `${slug}.webp`);

  const image = sharp(source);
  const { width = 0, height = 0 } = await image.metadata();

  // Never upscale. A generator that returned a narrow image should be rerun
  // rather than stretched.
  const resizeWidth = Math.min(TARGET_WIDTH, width);

  await image.resize({ width: resizeWidth }).webp({ quality: QUALITY }).toFile(destination);

  const before = (await stat(source)).size;
  const after = (await stat(destination)).size;
  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  console.log(`source      ${width}x${height}  ${mb(before)} MB`);
  console.log(`destination ${resizeWidth}x${Math.round((height * resizeWidth) / width)}  ${mb(after)} MB`);
  console.log(`saved       ${(100 - (after / before) * 100).toFixed(1)}%`);
  console.log(destination);
}

await main();
