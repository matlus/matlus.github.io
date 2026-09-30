/**
 * Build the site's logo rasters from the master PNG.
 *
 *   node tools/prepare-logo.mjs [master.png]
 *
 * The master is 1254px square with generous empty margin. This trims to the
 * artwork and writes one PNG per display size into public/logo/, so the header
 * and footer can offer `srcset` candidates for every pixel density and the
 * browser never resamples the mark itself.
 *
 * The master's stems are already thickened so they stay visible when the mark is
 * small, so each size is a plain Lanczos reduction of it. An extra weight-boosting
 * step was tried and only softened the edges.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const DEFAULT_MASTER = 'docs/source-material/matlus-logo-master.png';
const OUT_DIR = 'public/logo';
const ICON_DIR = 'public';

/** Display widths: 1x, 1.5x, 2x, and 3x of the 56px header mark and the 40px phone mark. */
const WIDTHS = [32, 40, 56, 64, 80, 112, 168, 224, 512];
/** Empty margin kept around the artwork, as a fraction of its width. */
const MARGIN = 0.01;

async function bounds(source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if ((data[(y * info.width + x) * 4 + 3] ?? 0) > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/** Fit the artwork inside a square, centred, optionally on a solid background. */
async function squareIcon(trimmed, size, background) {
  const inner = Math.round(size * 0.94);
  const mark = await sharp(trimmed).resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Pack PNG images into one .ico file. PNG-in-ICO is supported by every current browser. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function main() {
  const master = process.argv[2] ?? DEFAULT_MASTER;
  const box = await bounds(master);
  const pad = Math.round(box.width * MARGIN);

  const trimmed = await sharp(master)
    .extract(box)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await mkdir(OUT_DIR, { recursive: true });

  const meta = await sharp(trimmed).metadata();
  const ratio = (meta.height ?? 1) / (meta.width ?? 1);

  for (const width of WIDTHS) {
    const height = Math.round(width * ratio);
    const file = path.join(OUT_DIR, `matlus-mark-${width}.png`);
    await sharp(trimmed)
      .resize({ width, height, kernel: 'lanczos3' })
      .png({ compressionLevel: 9, palette: false })
      .toFile(file);
    console.log(`${file}  ${width}x${height}`);
  }

  // Browser-tab and home-screen icons are square.
  const tab = {};
  for (const size of [16, 32, 48, 192]) {
    tab[size] = await squareIcon(trimmed, size);
  }
  await writeFile(path.join(ICON_DIR, 'favicon-32.png'), tab[32]);
  await writeFile(path.join(ICON_DIR, 'favicon-192.png'), tab[192]);
  await writeFile(
    path.join(ICON_DIR, 'apple-touch-icon.png'),
    // iOS fills transparency with black, so the home-screen icon gets a white tile.
    await squareIcon(trimmed, 180, { r: 255, g: 255, b: 255, alpha: 1 }),
  );
  await writeFile(
    path.join(ICON_DIR, 'favicon.ico'),
    ico([16, 32, 48].map((size) => ({ size, data: tab[size] }))),
  );
  console.log('icons: favicon-32.png favicon-192.png apple-touch-icon.png favicon.ico');

  console.log(`\nartwork ${meta.width}x${meta.height}, aspect ${(1 / ratio).toFixed(3)}`);
}

await main();
