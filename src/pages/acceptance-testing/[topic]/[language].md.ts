import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const chapters = await getCollection(
    'chapters',
    ({ data }) => !data.draft && data.section === 'acceptance-testing',
  );
  return chapters.map((chapter) => ({
    params: { topic: chapter.data.topic, language: chapter.data.language ?? 'shared' },
    props: { chapter },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { chapter } = props as {
    chapter: Awaited<ReturnType<typeof getCollection<'chapters'>>>[number];
  };
  const language = chapter.data.language ?? 'shared';
  const label: Record<string, string> = { python: 'Python', csharp: 'C#', sql: 'SQL', shared: 'Shared' };
  const iso = (date: Date): string => date.toISOString().slice(0, 10);
  const header = [
    `# ${chapter.data.title} in ${label[language] ?? language}`,
    '',
    chapter.data.description,
    '',
    `Published: ${iso(chapter.data.datePublished)}`,
    chapter.data.dateModified ? `Updated: ${iso(chapter.data.dateModified)}` : undefined,
    `Source: ${new URL(`/acceptance-testing/${chapter.data.topic}/${language}/`, site ?? 'https://matlus.com').href}`,
    `Tags: ${chapter.data.tags.join(', ')}`,
    '',
    '---',
    '',
  ].filter((line) => line !== undefined).join('\n');

  return new Response(header + chapter.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
