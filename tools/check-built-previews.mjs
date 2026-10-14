/** Inspect actual article metadata and the image bytes it references. */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import sharp from 'sharp';

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(file));
    else if (entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

function nodesIn(node) {
  return [node, ...(node.childNodes ?? []).flatMap(nodesIn)];
}

export async function checkBuiltPreviews(directory) {
  const failures = [];
  let articles = 0;
  const measuredImages = new Map();
  for (const file of await htmlFiles(directory)) {
    const nodes = nodesIn(parse(await readFile(file, 'utf8')));
    const attr = (node, name) => node?.attrs?.find((attribute) => attribute.name === name)?.value;
    if (!nodes.some((node) => attr(node, 'class')?.split(/\s+/).includes('article-head'))) continue;
    articles++;
    const label = path.relative(directory, file);
    const fail = (message) => failures.push(`${label}: ${message}`);
    const metas = nodes.filter((node) => node.tagName === 'meta');
    const meta = (name) => metas.filter((node) => (attr(node, 'property') ?? attr(node, 'name')) === name);
    const value = (name) => attr(meta(name)[0], 'content');
    if (!meta('robots').some((node) => /(?:^|,\s*)max-image-preview:large(?:,|$)/i.test(attr(node, 'content') ?? ''))) {
      fail('missing large-preview permission');
    }
    for (const name of ['og:image', 'og:image:width', 'og:image:height', 'twitter:image']) {
      if (meta(name).length !== 1 || !value(name)) fail(`requires one ${name}`);
    }
    const image = value('og:image');
    if (image !== value('twitter:image')) fail('social images disagree');
    if (value('og:image:width') !== '1200' || value('og:image:height') !== '675') fail('preview dimensions must be 1200x675');
    const canonicalNode = nodes.find((node) => node.tagName === 'link' && attr(node, 'rel') === 'canonical');
    const canonical = attr(canonicalNode, 'href');
    try {
      const url = new URL(image);
      const canonicalUrl = new URL(canonical);
      if (url.protocol !== 'https:' || url.origin !== canonicalUrl.origin) throw new Error('preview must have an absolute site HTTPS URL');
      const localImage = path.resolve(directory, `.${decodeURIComponent(url.pathname)}`);
      if (!localImage.startsWith(path.resolve(directory) + path.sep)) throw new Error('preview path leaves build');
      if (!measuredImages.has(localImage)) measuredImages.set(localImage, await sharp(await readFile(localImage)).metadata());
      const measured = measuredImages.get(localImage);
      if (measured.width !== 1200 || measured.height !== 675) fail('metadata does not match image bytes');
    } catch (error) { fail(`inaccessible preview: ${error.message}`); }
    const scripts = nodes.filter((node) => node.tagName === 'script' && attr(node, 'type') === 'application/ld+json');
    const data = scripts.map((node) => JSON.parse((node.childNodes ?? []).map((child) => child.value ?? '').join('')));
    const article = data.find((item) => ['BlogPosting', 'TechArticle'].includes(item['@type']));
    if (!article || article.image !== image) fail('structured-data image disagrees');
    if (article?.author?.name !== 'Shiv Kumar' || article?.author?.url !== 'https://matlus.com/about/') fail('structured author must link to About');
    const authorLink = nodes.find((node) => node.tagName === 'a' && attr(node, 'rel')?.split(/\s+/).includes('author'));
    if (attr(authorLink, 'href') !== '/about/' || nodesIn(authorLink ?? {}).map((node) => node.value ?? '').join('').trim() !== 'Shiv Kumar') fail('missing linked visible author');
  }
  if (!articles) failures.push('No article pages found.');
  return { articles, images: measuredImages.size, failures };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkBuiltPreviews(process.argv[2] ?? 'dist');
  if (result.failures.length) { console.error(result.failures.join('\n')); process.exitCode = 1; }
  else console.log(`Built previews: ${result.articles} articles, ${result.images} accessible images; metadata, dimensions and authors aligned.`);
}
