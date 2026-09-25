import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Markdown twin for a chapter.
 *
 * Same rule as the article twins: body only, with a short provenance header
 * and nothing else. The chapter prose is reproduced unaltered, since chapters
 * answer to corpus conventions rather than to the site's writing style.
 */

export const getStaticPaths = (async () => {
  const chapters = await getCollection('chapters', ({ data }) => !data.draft && data.section === 'pwi');
  return chapters.map((chapter) => ({
    params: { topic: chapter.data.topic, language: chapter.data.language ?? 'shared' },
    props: { chapter },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { chapter } = props as {
    chapter: Awaited<ReturnType<typeof getCollection<'chapters'>>>[number];
  };

  const iso = (date: Date) => date.toISOString().slice(0, 10);
  // Widened to a string-keyed Record: the empty-string fallback is not a key
  // of the object literal, which strictest correctly rejects.
  const labels: Record<string, string> = { python: 'Python', csharp: 'C#', sql: 'SQL' };
  const label = labels[chapter.data.language ?? ''] ?? '';

  const header = [
    `# ${chapter.data.title}${label ? ` in ${label}` : ''}`,
    '',
    chapter.data.description,
    '',
    `Published: ${iso(chapter.data.datePublished)}`,
    chapter.data.dateModified ? `Updated: ${iso(chapter.data.dateModified)}` : undefined,
    `Source: ${new URL(`/pwi/${chapter.data.topic}/${chapter.data.language}/`, site ?? 'https://matlus.com').href}`,
    `Tags: ${chapter.data.tags.join(', ')}`,
    '',
    '---',
    '',
  ]
    .filter((line) => line !== undefined)
    .join('\n');

  return new Response(header + chapter.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
