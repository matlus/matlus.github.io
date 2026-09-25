import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readableArticleBody } from '../../lib/article-markdown';

/**
 * The markdown twin.
 *
 * Every article is served a second time at the same path plus `.md`, carrying
 * the article body and a short source header. No navigation, sidebar, related
 * list, tag cloud, or footer.
 *
 * That emptiness is the whole point. It is the channel where a retrieval agent
 * gets the argument with zero boilerplate, and mirroring the full page here
 * would throw the advantage away.
 *
 * GitHub Pages cannot do HTTP content negotiation, since it has no control
 * over routing or response headers, so twin URLs are both the simpler option
 * and the only available one.
 */

export const getStaticPaths = (async () => {
  const posts = await getCollection('writing', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'writing'>>>[number] };

  const iso = (date: Date) => date.toISOString().slice(0, 10);

  // A short header, so a fetched fragment still says what it is and where it
  // came from. Everything after it is the author's prose, unaltered.
  const header = [
    `# ${post.data.title}`,
    '',
    post.data.description,
    '',
    `Published: ${iso(post.data.datePublished)}`,
    post.data.dateModified ? `Updated: ${iso(post.data.dateModified)}` : undefined,
    `Source: ${new URL(`/writing/${post.id}/`, site ?? 'https://matlus.com').href}`,
    post.data.youtube ? `Video: ${post.data.youtube}` : undefined,
    ...(post.data.additionalVideos ?? []).map((video) => `Video: [${video.label}](${video.url})`),
    ...(post.data.repositories ?? []).map((repository) => `Repository: [${repository.label}](${repository.url})`),
    `Tags: ${post.data.tags.join(', ')}`,
    '',
    '---',
    '',
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  return new Response(header + readableArticleBody(post.body), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
