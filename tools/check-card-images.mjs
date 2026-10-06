/** Validate companion art and the September 2026 onward publication baseline. */
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assets = 'src/assets/heroes';
const failures = [];
const cards = (await readdir(assets)).filter((name) => name.endsWith('-card.webp'));
for (const name of cards) {
  const file = path.join(assets, name);
  const metadata = await sharp(file).metadata();
  if (metadata.width !== 1200 || metadata.height !== 500) {
    failures.push(`${file}: expected 1200x500, got ${metadata.width}x${metadata.height}`);
  }
  try {
    await access(path.join(assets, name.replace(/-card\.webp$/, '.webp')));
    const prompt = await readFile(file.replace(/\.webp$/, '.prompt.md'), 'utf8');
    if (!prompt.trim()) failures.push(`${file}: prompt is empty`);
  } catch {
    failures.push(`${file}: missing source hero or adjacent prompt`);
  }
}

// Earlier published articles retain their existing-art fallback. Historical
// articles newly prepared for publication also require a card in editorial review.
const articles = 'src/content/writing';
let required = 0;
for (const name of await readdir(articles)) {
  if (!/\.mdx?$/.test(name)) continue;
  const source = await readFile(path.join(articles, name), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1] ?? '';
  const published = frontmatter.match(/^datePublished:\s*['"]?(\d{4}-\d{2}-\d{2})/mu)?.[1];
  if (!published || published < '2026-09-01') continue;
  required++;
  const hero = frontmatter.match(/^hero:\s*['"]?([a-z0-9-]+)/mu)?.[1];
  if (!hero || !cards.includes(`${hero}-card.webp`)) {
    failures.push(`${articles}/${name}: requires a companion for hero ${hero ?? '(missing)'}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Article cards: ${cards.length} validated; ${required} required articles covered.`);
}
