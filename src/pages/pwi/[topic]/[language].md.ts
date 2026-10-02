import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { loadPwiPillarArticles } from '../../../lib/pwi-topic-links';

/**
 * Markdown twin for a chapter.
 *
 * Same rule as the article twins: body only, with a short provenance header
 * and nothing else. The chapter prose is reproduced unaltered, since chapters
 * answer to corpus conventions rather than to the site's writing style.
 */

export const getStaticPaths = (async () => {
  const chapters = await getCollection('chapters', ({ data }) =>
    data.section === 'pwi' && (!data.draft || data.topic === 'validation-exception-handling'),
  );
  return chapters.map((chapter) => ({
    params: { topic: chapter.data.topic, language: chapter.data.language ?? 'shared' },
    props: { chapter },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const { chapter } = props as {
    chapter: Awaited<ReturnType<typeof getCollection<'chapters'>>>[number];
  };

  // Preserve the retired chapter's Markdown URL with the shared reading path.
  if (chapter.data.topic === 'validation-exception-handling') {
    const articles = await loadPwiPillarArticles('programming-to-exceptions');
    const origin = site ?? 'https://matlus.com';
    const guide = [
      '# Programming to Exceptions',
      '',
      'Validation and exception handling are now covered in one shared series. The concepts apply across languages; the worked examples use C#.',
      '',
      `Source: ${new URL('/pwi/programming-to-exceptions/', origin).href}`,
      '',
      ...articles.flatMap((article) => [
        `## [${article.data.title}](${new URL(`/writing/${article.id}/`, origin).href})`,
        '',
        article.data.description,
        '',
        `[Read as Markdown](${new URL(`/writing/${article.id}.md`, origin).href})`,
        '',
      ]),
    ].join('\n');
    return new Response(guide, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

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
