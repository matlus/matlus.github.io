/** Reserve space for local prose images without editing their source articles. */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import sharp from 'sharp';

export async function addLocalImageDimensions(html, directory) {
  const document = parse(html, { sourceCodeLocationInfo: true });
  const edits = [];
  const root = path.resolve(directory);
  async function inspect(node) {
    if (node.tagName === 'img') {
      const attributes = new Map(node.attrs.map(({ name, value }) => [name, value]));
      const source = attributes.get('src') ?? '';
      // Astro images already declare dimensions. Preserve author-supplied sizes.
      if (!attributes.has('width') && !attributes.has('height') && source.startsWith('/images/')) {
        const url = new URL(source, 'https://matlus.com');
        const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(root + path.sep)) throw new Error(`Image path leaves build: ${source}`);
        const metadata = await sharp(await readFile(file)).metadata();
        if (metadata.width && metadata.height && node.sourceCodeLocation?.startTag) {
          let position = node.sourceCodeLocation.startTag.endOffset - 1;
          if (html[position - 1] === '/') position--;
          edits.push({ position, text: ` width="${metadata.width}" height="${metadata.height}"` });
        }
      }
    }
    for (const child of node.childNodes ?? []) await inspect(child);
  }
  await inspect(document);
  let result = html;
  for (const edit of edits.sort((left, right) => right.position - left.position)) {
    result = result.slice(0, edit.position) + edit.text + result.slice(edit.position);
  }
  return { html: result, images: edits.length };
}

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(file));
    else if (entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = process.argv[2] ?? 'dist';
  let images = 0;
  for (const file of await htmlFiles(directory)) {
    const result = await addLocalImageDimensions(await readFile(file, 'utf8'), directory);
    if (result.images) await writeFile(file, result.html);
    images += result.images;
  }
  console.log(`Reserved intrinsic dimensions for ${images} local prose images in built HTML.`);
}
