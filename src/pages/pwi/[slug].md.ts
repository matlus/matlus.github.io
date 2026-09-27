import type { APIRoute, GetStaticPaths } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { TOPICS } from '../../data/topics';
import { readableArticleBody } from '../../lib/article-markdown';

export const getStaticPaths = (async () => {
  const overviews = await getCollection('overviews', ({ data }) => !data.draft);
  return overviews
    .filter((overview) => TOPICS.some((topic) => topic.section === 'pwi' && topic.slug === overview.data.topic))
    .map((overview) => ({ params: { slug: overview.data.topic }, props: { overview } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { overview } = props as { overview: CollectionEntry<'overviews'> };
  const iso = (date: Date): string => date.toISOString().slice(0, 10);
  const header = [
    `# ${overview.data.title}`,
    '',
    overview.data.description,
    '',
    `Published: ${iso(overview.data.datePublished)}`,
    overview.data.dateModified ? `Updated: ${iso(overview.data.dateModified)}` : undefined,
    `Source: ${new URL(`/pwi/${overview.data.topic}/`, site ?? 'https://matlus.com').href}`,
    `Tags: ${overview.data.tags.join(', ')}`,
    '',
    '---',
    '',
  ].filter((line) => line !== undefined).join('\n');

  return new Response(header + readableArticleBody(overview.body), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};

