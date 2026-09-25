import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readableArticleBody } from '../lib/article-markdown';

/**
 * /llms-full.txt
 *
 * The full text of every article inlined, so a retrieval agent can take the
 * whole corpus in one fetch rather than crawling page by page.
 *
 * Body text only. The same rule as the markdown twins applies: no navigation,
 * no sidebar, no boilerplate repeated across hundreds of pages.
 */

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://matlus.com')).origin;
  const posts = (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.datePublished.getTime() - a.data.datePublished.getTime(),
  );
  const chapters = (await getCollection('chapters', ({ data }) => !data.draft)).sort(
    (a, b) => a.data.topic.localeCompare(b.data.topic) ||
      (a.data.language ?? '').localeCompare(b.data.language ?? ''),
  );

  const iso = (date: Date) => date.toISOString().slice(0, 10);

  const articleChunks = posts.map((post) =>
    [
      `# ${post.data.title}`,
      '',
      post.data.description.trim(),
      '',
      `Source: ${origin}/writing/${post.id}/`,
      `Published: ${iso(post.data.datePublished)}`,
      `Tags: ${post.data.tags.join(', ')}`,
      '',
      '---',
      '',
      readableArticleBody(post.body),
    ].join('\n'),
  );
  const chapterChunks = chapters.map((chapter) => {
    const language = chapter.data.language ?? 'shared';
    return [
      `# ${chapter.data.title} (${language})`,
      '',
      chapter.data.description.trim(),
      '',
      `Source: ${origin}/${chapter.data.section}/${chapter.data.topic}/${language}/`,
      `Published: ${iso(chapter.data.datePublished)}`,
      `Tags: ${chapter.data.tags.join(', ')}`,
      '',
      '---',
      '',
      chapter.body,
    ].join('\n');
  });

  const header = [
    '# matlus.com, full text',
    '',
    `Generated ${iso(new Date())}. ${posts.length} article(s) and ${chapters.length} chapter(s).`,
    '',
    '===',
    '',
  ].join('\n');

  return new Response(header + [...articleChunks, ...chapterChunks].join('\n\n===\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
