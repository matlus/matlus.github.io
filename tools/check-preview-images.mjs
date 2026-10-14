/** Require documented 16:9 companions for published writing and corpus chapters. */
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assets = 'src/assets/heroes';
const failures = [];
const previews = (await readdir(assets)).filter((name) => name.endsWith('-preview.webp'));
for (const name of previews) {
  const file = path.join(assets, name);
  const metadata = await sharp(file).metadata();
  if (metadata.width !== 1200 || metadata.height !== 675) {
    failures.push(`${file}: expected 1200x675, got ${metadata.width}x${metadata.height}`);
  }
  try {
    await access(path.join(assets, name.replace(/-preview\.webp$/, '.webp')));
    const prompt = await readFile(file.replace(/\.webp$/, '.prompt.md'), 'utf8');
    if (!prompt.trim()) failures.push(`${file}: prompt is empty`);
  } catch {
    failures.push(`${file}: missing source hero or adjacent prompt`);
  }
}

let required = 0;
for (const collection of ['writing', 'chapters', 'overviews']) {
  const directory = `src/content/${collection}`;
  for (const name of await readdir(directory)) {
    if (!/\.mdx?$/.test(name)) continue;
    const source = await readFile(path.join(directory, name), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1] ?? '';
    if (/^draft:\s*true\s*(?:#.*)?$/mu.test(frontmatter)) continue;
    const hero = frontmatter.match(/^hero:\s*['"]?([a-z0-9-]+)/mu)?.[1]
      ?? (collection === 'overviews' ? `pwi-${name.replace(/\.mdx?$/, '')}` : undefined);
    required++;
    if (!hero || !previews.includes(`${hero}-preview.webp`)) {
      failures.push(`${directory}/${name}: requires a preview for hero ${hero ?? '(missing)'}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Article previews: ${previews.length} validated; ${required} published entries covered.`);
}
