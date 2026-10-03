/** Optimize a reviewed illustration and place its documented caption in the recovered article. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const [key, source] = process.argv.slice(2);
if (!key || !source) throw new Error('Usage: node tools/place-recovered-illustration.mjs <slug/figure-NN> <selected.png>');
const registerPath = 'docs/recovered-articles/execution.json';
const register = JSON.parse(await readFile(registerPath, 'utf8'));
const briefs = JSON.parse(await readFile('docs/recovered-articles/inline-briefs.json', 'utf8'));
const brief = briefs[key];
if (!brief) throw new Error(`No reviewed brief: ${key}`);
const [slug, figure] = key.split('/');
const article = register.articles.find((item) => item.slug === slug);
const illustration = article?.images.find((item) => item.asset === `/images/writing/${key}.webp`);
if (!illustration) throw new Error(`Illustration is not in the recovery register: ${key}`);
const destination = `public${illustration.asset}`;
await mkdir(path.dirname(destination), { recursive: true });
await sharp(source).resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 90 }).toFile(destination);
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markup = `<figure data-recovered-figure="${figure}">\n<a href="${illustration.asset}"><img src="${illustration.asset}" alt="${escape(brief.alt)}" loading="lazy" /></a>\n<figcaption data-reconstruction>${escape(brief.caption)}</figcaption>\n</figure>`;
const articlePath = `src/content/writing/${slug}.md`;
let text = await readFile(articlePath, 'utf8');
const original = `![${illustration.originalAlt}](${illustration.asset})`;
if (text.includes(original)) text = text.replace(original, markup);
else {
  const existing = new RegExp(`<figure data-recovered-figure="${figure}">[\\s\\S]*?</figure>`);
  if (!existing.test(text)) throw new Error(`Cannot locate figure: ${key}`);
  text = text.replace(existing, markup);
}
await writeFile(articlePath, text, 'utf8');
illustration.status = 'selected';
illustration.kind = brief.kind;
illustration.generatedOriginal = path.basename(source);
await writeFile(registerPath, JSON.stringify(register, null, 2) + '\n', 'utf8');
console.log(`Placed ${key}`);
