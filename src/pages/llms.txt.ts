import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOPICS } from '../data/topics';
import { TAGS } from '../data/tags';

/**
 * /llms.txt
 *
 * A markdown index of the site for retrieval agents: every page with its URL
 * and a one-line description, plus a pointer to each article's markdown twin.
 *
 * Generated rather than hand-written, so it cannot drift from the content.
 * Adoption of the convention is uneven, but it costs one build step and gives
 * an agent a single URL that describes everything available.
 */

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://matlus.github.io')).origin;
  const posts = (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.datePublished.getTime() - a.data.datePublished.getTime(),
  );

  const lines: string[] = [
    '# matlus.com',
    '',
    '> Shiv Kumar on how software should be built, and on keeping that judgment',
    '> intact when a language model is doing the typing. Programming With Intent',
    '> (PWI) is operationalized guidance with worked examples in Python and C#.',
    '',
    'Every article is also served as raw markdown at its URL plus `.md`, carrying the',
    'article body with no navigation, sidebar, or other page furniture.',
    '',
    '## Writing',
    '',
  ];

  for (const post of posts) {
    lines.push(
      `- [${post.data.title}](${origin}/writing/${post.id}/): ${post.data.description.trim()} ` +
        `Markdown: ${origin}/writing/${post.id}.md`,
    );
  }

  lines.push('', '## PWI chapters', '');
  for (const topic of TOPICS.filter((t) => t.section === 'pwi')) {
    lines.push(`- [${topic.title}](${origin}/pwi/${topic.slug}/): examples in ${topic.examples.join(', ')}`);
  }

  lines.push('', '## Acceptance Testing', '');
  lines.push(
    'Functional acceptance testing at the boundary, and the surrounding discipline.',
    'This is the Verification with Intent pillar, surfaced at top level.',
    '',
  );
  for (const topic of TOPICS.filter((t) => t.section === 'acceptance-testing')) {
    lines.push(`- [${topic.title}](${origin}/acceptance-testing/${topic.slug}/): examples in ${topic.examples.join(', ')}`);
  }

  lines.push('', '## Topics', '');
  for (const tag of TAGS) {
    lines.push(`- [${tag.label}](${origin}/tags/${tag.slug}/): ${tag.description}`);
  }

  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
