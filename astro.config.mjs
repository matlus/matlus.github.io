// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
      theme: 'ayu-dark',
    },
  },
  integrations: [
    sitemap({
      // The markdown twins are alternates of pages already listed, so they
      // would be duplicate entries rather than new destinations.
      filter: (page) => !page.endsWith('.md') && !page.endsWith('/tags/factory-method/'),
    }),
  ],
});
