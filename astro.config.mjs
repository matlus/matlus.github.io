// @ts-check
import { defineConfig } from 'astro/config';

// `site` is the canonical origin used for sitemap entries, RSS links, and
// the absolute URLs emitted in JSON-LD and OpenGraph tags.
//
// TODO: change to 'https://matlus.com' at DNS cutover. Because this is a
// GitHub user site, `base` stays '/' either way, so the switch is one line.
export default defineConfig({
  site: 'https://matlus.github.io',
});
