import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { addLocalImageDimensions } from './set-built-image-dimensions.mjs';

test('local SVG images reserve their measured ratio and preserve all article text', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'matlus-image-dimensions-'));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep + 'matlus-image-dimensions-'));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, 'images'));
  await writeFile(path.join(root, 'images/diagram.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1820 720"><rect width="1820" height="720"/></svg>');
  const html = '<p>Original reasoning &amp; code.</p><img src="/images/diagram.svg" alt="Original diagram" loading="lazy"><p>Original conclusion.</p>';
  const result = await addLocalImageDimensions(html, root);
  assert.equal(result.images, 1);
  assert.equal(result.html, html.replace('loading="lazy">', 'loading="lazy" width="1820" height="720">'));
  assert.deepEqual(await addLocalImageDimensions(result.html, root), { html: result.html, images: 0 });
});

test('explicit sizes and external images are preserved without fetching them', async () => {
  const html = '<img src="/images/does-not-exist.svg" width="100"><img src="https://example.com/image.jpg"><img src="/_astro/hero.webp" width="1600" height="534">';
  assert.deepEqual(await addLocalImageDimensions(html, 'unneeded'), { html, images: 0 });
});

test('missing local image bytes fail the build instead of inventing dimensions', async () => {
  await assert.rejects(() => addLocalImageDimensions('<img src="/images/missing.svg">', 'unneeded'), /ENOENT/);
});
