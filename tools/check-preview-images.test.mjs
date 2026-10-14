import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import sharp from 'sharp';

const checker = fileURLToPath(new URL('./check-preview-images.mjs', import.meta.url));

async function fixture(t, { draft = false, preview = false, height = 675, prompt = true } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'matlus-preview-source-'));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep + 'matlus-preview-source-'));
    await rm(root, { recursive: true, force: true });
  });
  const assets = path.join(root, 'src/assets/heroes');
  await mkdir(assets, { recursive: true });
  for (const collection of ['writing', 'chapters', 'overviews']) {
    const directory = path.join(root, 'src/content', collection);
    await mkdir(directory, { recursive: true });
    const hero = collection === 'overviews' ? 'pwi-historical' : `${collection}-historical`;
    await writeFile(path.join(directory, 'historical.md'), `---\ntitle: Historical\ndatePublished: 2010-01-01\n${collection === 'overviews' ? '' : `hero: ${hero}\n`}draft: ${draft}\n---\n`);
    await sharp({ create: { width: 1600, height: 534, channels: 3, background: '#eee' } }).webp().toFile(path.join(assets, `${hero}.webp`));
    if (preview) {
      await sharp({ create: { width: 1200, height, channels: 3, background: '#eee' } }).webp().toFile(path.join(assets, `${hero}-preview.webp`));
      if (prompt) await writeFile(path.join(assets, `${hero}-preview.prompt.md`), 'Approved scene outpainted into a representative 16:9 preview.\n');
    }
  }
  return () => spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
}

test('historical writing, chapters and overviews all require previews', async (t) => {
  const run = await fixture(t);
  const result = run();
  assert.equal(result.status, 1);
  for (const collection of ['writing', 'chapters', 'overviews']) assert.match(result.stderr, new RegExp(`${collection}/historical.md: requires a preview`));
});

test('drafts may lack previews', async (t) => {
  assert.equal((await fixture(t, { draft: true }))().status, 0);
});

test('valid documented previews cover every published collection', async (t) => {
  assert.equal((await fixture(t, { preview: true }))().status, 0);
});

test('listing-card dimensions and absent provenance cannot pass', async (t) => {
  const result = (await fixture(t, { preview: true, height: 500, prompt: false }))();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /expected 1200x675/);
  assert.match(result.stderr, /missing source hero or adjacent prompt/);
});
