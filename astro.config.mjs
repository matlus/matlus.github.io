// @ts-check
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const recoveredArticleRedirects = {
  "/using-localdb-in-visual-studio-online/": "/writing/using-localdb-in-visual-studio-online/",
  "/azure-startup-tasks-running-as-administrator/": "/writing/azure-startup-tasks-running-as-administrator/",
  "/installing-msmq-in-an-azure-webrole-instance/": "/writing/installing-msmq-in-an-azure-webrole-instance/",
  "/cross-domain-restful-crud-operations-using-jquery/": "/writing/cross-domain-restful-crud-operations-using-jquery/",
  "/jquery-data-assigning-objects-to-dynamic-elements/": "/writing/jquery-data-assigning-objects-to-dynamic-elements/",
  "/a-generic-restful-crud-httpclient/": "/writing/a-generic-restful-crud-httpclient/",
  "/delegatinghandler-for-x-http-method-override/": "/writing/delegatinghandler-for-x-http-method-override/",
  "/as-net-web-api-supporting-restful-crud-operations/": "/writing/as-net-web-api-supporting-restful-crud-operations/",
  "/jsonpmediatypeformatter-web-api-jsonp/": "/writing/jsonpmediatypeformatter-web-api-jsonp/",
  "/httpclient-net-4-5/": "/writing/httpclient-net-4-5/",
  "/self-host-asp-net-web-api/": "/writing/self-host-asp-net-web-api/",
  "/quartz-for-aspnet/": "/writing/quartz-for-aspnet/",
  "/asp-net-web-api-with-webforms/": "/writing/asp-net-web-api-with-webforms/",
  "/rest-apis-put-and-delete-cause-http-error-404/": "/writing/rest-apis-put-and-delete-cause-http-error-404/",
  "/c-to-html-syntax-highlighter-using-roslyn/": "/writing/c-to-html-syntax-highlighter-using-roslyn/",
  "/innovating-the-world-wide-net/": "/writing/innovating-the-world-wide-net/",
  "/wcf-4-0-getting-started/": "/writing/wcf-4-0-getting-started/",
  "/asp-net-response-redirect-performance-issue/": "/writing/asp-net-response-redirect-performance-issue/",
  "/httpwebrequest-asynchronous-programming/": "/writing/httpwebrequest-asynchronous-programming/",
  "/linq-selectmany/": "/writing/linq-selectmany/",
  "/data-parallel-parallel-programming-in-net/": "/writing/data-parallel-parallel-programming-in-net/",
  "/getting-the-no-of-cpus-and-cores/": "/writing/getting-the-no-of-cpus-and-cores/",
  "/iasyncresult-making-existing-methods-asnchronous/": "/writing/iasyncresult-making-existing-methods-asnchronous/",
  "/urlencode-the-correct-encoding/": "/writing/urlencode-the-correct-encoding/",
  "/stopstart-windows-service/": "/writing/stopstart-windows-service/",
  "/mssql-reset-identity-seed/": "/writing/mssql-reset-identity-seed/",
  "/linq-group-by-finding-duplicates/": "/writing/linq-group-by-finding-duplicates/",
  "/ienumerablet-datacontractserializer/": "/writing/ienumerablet-datacontractserializer/",
  "/svctraceviewer-debugging-wcf-sevices/": "/writing/svctraceviewer-debugging-wcf-sevices/",
  "/fastest-website-on-the-planet/": "/writing/fastest-website-on-the-planet/",
  "/orion/": "/writing/orion/",
  "/metaweblog-api-c-library/": "/writing/metaweblog-api-c-library/",
  "/data-access-layer-codegen/": "/writing/data-access-layer-codegen/",
  "/oauth-c-library/": "/writing/oauth-c-library/",
  "/high-performance-class-factory/": "/writing/high-performance-class-factory/",
  "/the-purpose-and-function-of-a-data-access-layer/": "/writing/the-purpose-and-function-of-a-data-access-layer/",
  "/instantiating-business-layers-asp-net-performance/": "/writing/instantiating-business-layers-asp-net-performance/",
  "/datareader-wrappers-typesafe/": "/writing/datareader-wrappers-typesafe/",
  "/changetypet-changing-the-type-of-a-variable-in-c/": "/writing/changetypet-changing-the-type-of-a-variable-in-c/",
  "/razor-engine-host/": "/writing/razor-engine-host/",
  "/problems-with-asp-net-mvc-framework-design/": "/writing/problems-with-asp-net-mvc-framework-design/",
  "/asp-net-mvc3-razor-view-engine/": "/writing/asp-net-mvc3-razor-view-engine/",
  "/html5-file-upload-with-progress/": "/writing/html5-file-upload-with-progress/",
  "/ie-9-beta-whats-hot-and-whats-not/": "/writing/ie-9-beta-whats-hot-and-whats-not/",
  "/the-future-of-flash-player/": "/writing/the-future-of-flash-player/",
  "/google-tv-apple-tv-or-just-a-computer/": "/writing/google-tv-apple-tv-or-just-a-computer/",
  "/html-5-video-element-poster/": "/writing/html-5-video-element-poster/",
  "/finding-links-on-a-web-page/": "/writing/finding-links-on-a-web-page/",
  "/h-264-free-for-internet-broadcast/": "/writing/h-264-free-for-internet-broadcast/",
  "/expanding-code-listings/": "/writing/expanding-code-listings/",
  "/html-5-video-and-flash/": "/writing/html-5-video-and-flash/",
  "/iis-manager-users/": "/writing/iis-manager-users/",
  "/flash-mobile-10-1-is-slow/": "/writing/flash-mobile-10-1-is-slow/"
};

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
  vite: {
    build: {
      // Keep scripts in the bundle until Vite finishes dynamic-import processing.
      // Astro can inline them too early, leaving __VITE_PRELOAD__ in the HTML.
      // https://github.com/withastro/astro/issues/17265
      assetsInlineLimit: (file) => file.endsWith('.js') ? false : undefined,
    },
  },
  redirects: {
    ...recoveredArticleRedirects,
    '/writing/the-ai-native-lifecycle/': '/writing/ai-native-sdlc/',
    '/tags/factory-method/': '/writing/factory-method-pattern/',
    '/pwi/validation-exception-handling/': '/pwi/programming-to-exceptions/',
    '/pwi/validation-exception-handling/csharp/': '/pwi/programming-to-exceptions/',
    '/pwi/validation-exception-handling/python/': '/pwi/programming-to-exceptions/',
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
      filter: (page) => !page.endsWith('.md') && !page.endsWith('/tags/factory-method/') &&
        !page.endsWith('/writing/the-ai-native-lifecycle/') &&
        !page.includes('/pwi/validation-exception-handling/') &&
        !Object.hasOwn(recoveredArticleRedirects, new URL(page).pathname),
    }),
  ],
});
