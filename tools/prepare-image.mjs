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
 *   node tools/prepare-image.mjs <source.png> <slug> [--role article|banner|section]
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
const HEIGHT_BY_ROLE = { article: 520, banner: 840, section: 840 };
const QUALITY = 82;
const OUT_DIR = 'src/assets/heroes';

async function main() {
  const [source, slug, option, roleArgument, ...extra] = process.argv.slice(2);
  const role = roleArgument ?? 'article';

  if (!source || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      || (option !== undefined && option !== '--role')
      || (option === '--role' && roleArgument === undefined)
      || !Object.hasOwn(HEIGHT_BY_ROLE, role) || extra.length > 0) {
    console.error('Usage: node tools/prepare-image.mjs <source.png> <slug> [--role article|banner|section]');
    process.exitCode = 1;
    return;
  }

  const targetHeight = HEIGHT_BY_ROLE[role];
  const destination = path.join(OUT_DIR, `${slug}.webp`);

  // Apply orientation before checking usable dimensions or framing the crop.
  const { data, info } = await sharp(source).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Never upscale. A generator that returned a narrow image should be rerun
  // rather than stretched.
  if (width < TARGET_WIDTH || height < targetHeight) {
    throw new Error(`Source is ${width}x${height}; ${role} requires at least ${TARGET_WIDTH}x${targetHeight}. Generate a larger original; do not upscale.`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await sharp(data, { raw: { width, height, channels: info.channels } })
    .resize({ width: TARGET_WIDTH, height: targetHeight, fit: 'cover', position: 'centre' })
    .webp({ quality: QUALITY })
    .toFile(destination);

  const before = (await stat(source)).size;
  const after = (await stat(destination)).size;
  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

  console.log(`source      ${width}x${height}  ${mb(before)} MB`);
  console.log(`destination ${TARGET_WIDTH}x${targetHeight}  ${mb(after)} MB (${role}, quality ${QUALITY})`);
  console.log(`saved       ${(100 - (after / before) * 100).toFixed(1)}%`);
  console.log(destination);
}

await main();
