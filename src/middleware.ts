import { defineMiddleware } from 'astro:middleware';
import { openExternalLinksInNewTabs } from './lib/external-links';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html') || response.body === null) {
    return response;
  }

  const html = openExternalLinksInNewTabs(await response.text(), context.site ?? context.url);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
