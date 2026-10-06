/** Verify the production listing uses card companions after asset optimization. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const directory = process.argv[2] ?? 'dist';
const document = parse(await readFile(path.join(directory, 'writing/index.html'), 'utf8'));
const failures = [];
let cards = 0;

function inspect(node) {
  if (node.tagName === 'img') {
    const attributes = new Map(node.attrs.map(({ name, value }) => [name, value]));
    if (attributes.get('class')?.split(/\s+/).includes('card__thumb')) {
      cards++;
      if (attributes.get('width') !== '1200' || attributes.get('height') !== '500') {
        failures.push(`Listing card uses a hero fallback: ${attributes.get('src')}`);
      }
    }
  }
  for (const child of node.childNodes ?? []) inspect(child);
}

inspect(document);
if (cards === 0) failures.push('No article listing cards found.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Production listing: ${cards} card companions at 1200x500.`);
}

