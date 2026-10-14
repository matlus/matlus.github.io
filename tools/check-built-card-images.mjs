/** Verify the production listing uses card companions after asset optimization. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';

const directory = process.argv[2] ?? 'dist';
const failures = [];

for (const page of ['index.html', 'writing/index.html']) {
  const document = parse(await readFile(path.join(directory, page), 'utf8'));
  let cards = 0;

  function inspect(node) {
    if (node.tagName === 'img') {
      const attributes = new Map(node.attrs.map(({ name, value }) => [name, value]));
      if (attributes.get('class')?.split(/\s+/).includes('card__thumb')) {
        cards++;
        if (attributes.get('width') !== '1200' || attributes.get('height') !== '500') {
          failures.push(`${page}: listing card uses a hero fallback: ${attributes.get('src')}`);
        }
      }
    }
    for (const child of node.childNodes ?? []) inspect(child);
  }

  inspect(document);
  if (cards === 0) failures.push(`${page}: no article listing cards found.`);
  console.log(`${page}: ${cards} listing cards inspected.`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Production homepage and Writing index use card companions at 1200x500.');
}

