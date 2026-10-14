import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import { checkBuiltPreviews } from './check-built-previews.mjs';

async function fixture(t, changes = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'matlus-preview-'));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep + 'matlus-preview-'));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, '_astro'));
  await sharp({ create: { width: 1200, height: changes.imageHeight ?? 675, channels: 3, background: '#eee' } })
    .webp().toFile(path.join(root, '_astro/example-preview.webp'));
  const image = changes.image ?? 'https://matlus.com/_astro/example-preview.webp';
  const ld = {
    '@type': 'BlogPosting', image: changes.structuredImage ?? image,
    author: { name: 'Shiv Kumar', url: changes.authorUrl ?? 'https://matlus.com/about/' },
  };
  const html = `<html><head>
    <link rel="canonical" href="https://matlus.com/writing/example/">
    <meta name="robots" content="${changes.robots ?? 'max-image-preview:large'}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="675">
    <meta name="twitter:image" content="${changes.twitterImage ?? image}">
    <script type="application/ld+json">${JSON.stringify(ld)}</script>
    </head><body><header class="article-head"><span>By <a href="${changes.bylineHref ?? '/about/'}" rel="author">Shiv Kumar</a></span></header></body></html>`;
  await writeFile(path.join(root, 'index.html'), html);
  return root;
}

test('absolute social metadata, image bytes, and linked authors agree', async (t) => {
  const root = await fixture(t);
  assert.deepEqual(await checkBuiltPreviews(root), { articles: 1, images: 1, failures: [] });
});

test('restricted indexing can coexist with large-preview permission', async (t) => {
  const root = await fixture(t, { robots: 'noindex, nofollow, max-image-preview:large' });
  assert.deepEqual((await checkBuiltPreviews(root)).failures, []);
});

test('missing permission and a listing-card image cannot pass', async (t) => {
  const root = await fixture(t, { robots: 'noindex', imageHeight: 500 });
  const result = await checkBuiltPreviews(root);
  assert.ok(result.failures.some((value) => value.includes('missing large-preview permission')));
  assert.ok(result.failures.some((value) => value.includes('metadata does not match image bytes')));
});

test('relative or missing preview assets fail', async (t) => {
  for (const image of ['/_astro/example-preview.webp', 'https://matlus.com/_astro/missing.webp']) {
    const root = await fixture(t, { image });
    assert.ok((await checkBuiltPreviews(root)).failures.some((value) => value.includes('inaccessible preview')));
  }
});

test('conflicting social/structured images and author destinations fail', async (t) => {
  const root = await fixture(t, {
    twitterImage: 'https://matlus.com/logo.png', structuredImage: 'https://matlus.com/hero.webp',
    authorUrl: 'https://matlus.com/', bylineHref: '/',
  });
  const result = await checkBuiltPreviews(root);
  assert.equal(result.failures.length, 4);
});

test('an empty build cannot receive a passing receipt', async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'index.html'), '<html><head></head><body>Redirect</body></html>');
  assert.deepEqual((await checkBuiltPreviews(root)).failures, ['No article pages found.']);
});
