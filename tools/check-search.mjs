/** Check generated search assets and the build regression from issue #51. */
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const directory = resolve(process.argv[2] ?? 'dist');

async function checkScripts(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      await checkScripts(path);
    } else if (/\.(html|js)$/.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      assert(!source.includes('__VITE_PRELOAD__'), `Unresolved Vite preload marker in ${path}`);
    }
  }
}

await checkScripts(directory);
for (const name of ['pagefind.js', 'pagefind-worker.js', 'pagefind-component-ui.js', 'pagefind-component-ui.css']) {
  assert((await stat(join(directory, 'pagefind', name))).size > 0, `Empty search asset: ${name}`);
}
const manifest = JSON.parse(await readFile(join(directory, 'pagefind/pagefind-entry.json'), 'utf8'));
assert(manifest.languages.en?.page_count > 0, 'Search index has no English pages');
for (const language of Object.values(manifest.languages)) {
  await stat(join(directory, 'pagefind', `pagefind.${language.hash}.pf_meta`));
  await stat(join(directory, 'pagefind', `wasm.${language.wasm}.pagefind`));
}
console.log(`Search build check passed: ${manifest.languages.en.page_count} indexed pages; no unresolved preload markers.`);
