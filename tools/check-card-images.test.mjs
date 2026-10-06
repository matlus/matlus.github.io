import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import sharp from 'sharp';

const checker = fileURLToPath(new URL('./check-card-images.mjs', import.meta.url));

async function fixture(t, { draft = false, card = false, width = 1200, prompt = true } = {}) {
  const prefix = path.join(tmpdir(), 'matlus-card-check-');
  const root = await mkdtemp(prefix);
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.ok(resolved.startsWith(path.resolve(prefix)));
    await rm(resolved, { recursive: true, force: true });
  });
  const assets = path.join(root, 'src/assets/heroes');
  const articles = path.join(root, 'src/content/writing');
  await mkdir(assets, { recursive: true });
  await mkdir(articles, { recursive: true });
  await writeFile(path.join(articles, 'historical.md'), '---\ntitle: Historical\ndatePublished: 2010-01-01\nhero: historical\ndraft: ' + draft + '\n---\n');
  await sharp({ create: { width: 1200, height: 400, channels: 3, background: '#eee' } }).webp().toFile(path.join(assets, 'historical.webp'));
  if (card) {
    await sharp({ create: { width, height: 500, channels: 3, background: '#eee' } }).webp().toFile(path.join(assets, 'historical-card.webp'));
    if (prompt) await writeFile(path.join(assets, 'historical-card.prompt.md'), 'Source hero exported at the matching ratio.\n');
  }
  return () => spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
}

test('a historical published article cannot omit its companion', async t => {
  const run = await fixture(t);
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /historical.md: requires a companion/);
});

test('an unfinished draft may omit its companion', async t => {
  const run = await fixture(t, { draft: true });
  assert.equal(run().status, 0);
});

test('a historical article passes with a correctly sized documented companion', async t => {
  const run = await fixture(t, { card: true });
  assert.equal(run().status, 0);
});

test('wrong dimensions and missing provenance block publication', async t => {
  const run = await fixture(t, { card: true, width: 1000, prompt: false });
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /expected 1200x500/);
  assert.match(result.stderr, /missing source hero or adjacent prompt/);
});
