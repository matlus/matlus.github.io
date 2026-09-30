// @ts-check
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const PAGEFIND_DIR = fileURLToPath(new URL('./dist/pagefind/', import.meta.url));

const PAGEFIND_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

/**
 * Serve the search index from the last build while developing.
 *
 * `pagefind --site dist` writes the index after `astro build`, and the dev
 * server never sees it, so search showed no input box under `npm run dev`.
 * The index is as old as the last build; run `npm run build` to refresh it.
 * Production is unaffected, because this hook runs only in the dev server.
 *
 * @returns {import('astro').AstroIntegration}
 */
const pagefindDev = () => ({
  name: 'pagefind-dev',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use('/pagefind', (req, res, next) => {
        const requested = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/');
        const file = join(PAGEFIND_DIR, normalize(requested).replace(/^([/\\]|\.\.)+/, ''));

        // Never leave the index folder, whatever the request asks for.
        if (!file.startsWith(PAGEFIND_DIR) || !existsSync(file) || !statSync(file).isFile()) {
          next();
          return;
        }

        res.setHeader(
          'Content-Type',
          PAGEFIND_TYPES[/** @type {keyof typeof PAGEFIND_TYPES} */ (extname(file))] ?? 'application/octet-stream',
        );
        createReadStream(file).pipe(res);
      });
    },
  },
});

// `site` is the canonical origin used for sitemap entries, RSS links, and
// the absolute URLs emitted in JSON-LD and OpenGraph tags.
//
export default defineConfig({
  site: 'https://matlus.com',
  redirects: {
    '/tags/factory-method/': '/writing/factory-method-pattern/',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-high-contrast',
        dark: 'github-dark-high-contrast',
      },
      defaultColor: 'light-dark()',
    },
  },
  integrations: [
    pagefindDev(),
    sitemap({
      // The markdown twins are alternates of pages already listed, so they
      // would be duplicate entries rather than new destinations.
      filter: (page) => !page.endsWith('.md') && !page.endsWith('/tags/factory-method/'),
    }),
  ],
});
