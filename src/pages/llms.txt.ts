import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOPICS } from '../data/topics';
import { TAGS } from '../data/tags';
import { PILLARS } from '../data/nav';

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
  const origin = (site ?? new URL('https://matlus.com')).origin;
  const posts = (await getCollection('writing', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.datePublished.getTime() - a.data.datePublished.getTime(),
  );
  const chapters = (await getCollection('chapters', ({ data }) => !data.draft)).sort(
    (a, b) => a.data.topic.localeCompare(b.data.topic) ||
      (a.data.language ?? '').localeCompare(b.data.language ?? ''),
  );
  const publishedTopics = new Set(chapters.map((chapter) => chapter.data.topic));

  const lines: string[] = [
    '# matlus.com',
    '',
    '> Shiv Kumar on how software should be built, and on keeping that judgment',
    '> intact when a language model is doing the typing. Programming With Intent',
    '> (PWI) is operationalized guidance with worked examples in Python and C#.',
    '',
    'Every article and chapter has a raw markdown companion with no navigation or sidebar.',
    '',
    '## Sections',
    '',
    `- [PWI](${origin}/pwi/): Programming With Intent chapters and pillars.`,
    `- [Acceptance Testing](${origin}/acceptance-testing/): functional testing at the boundary.`,
    `- [Writing](${origin}/writing/): essays and video-based articles.`,
    `- [Media](${origin}/media/): articles with video or audio companions.`,
    `- [About](${origin}/about/): about Shiv Kumar.`,
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
  for (const pillar of PILLARS.filter((item) => item.href.startsWith('/pwi/'))) {
    lines.push(`- [${pillar.label}](${origin}${pillar.href}): ${pillar.blurb}`);
  }
  for (const topic of TOPICS.filter((item) => item.section === 'pwi' && publishedTopics.has(item.slug))) {
    lines.push(`- [${topic.title}](${origin}/pwi/${topic.slug}/): published examples.`);
    for (const chapter of chapters.filter((item) => item.data.topic === topic.slug)) {
      const language = chapter.data.language ?? 'shared';
      lines.push(
        `  - [${chapter.data.title} (${language})](${origin}/pwi/${topic.slug}/${language}/): ` +
          `${chapter.data.description.trim()} Markdown: ${origin}/pwi/${topic.slug}/${language}.md`,
      );
    }
  }

  lines.push('', '## Acceptance Testing', '');
  lines.push(
    'Functional acceptance testing at the boundary, and the surrounding discipline.',
    'This is the Verification with Intent pillar, surfaced at top level.',
    '',
  );
  for (const topic of TOPICS.filter((t) => t.section === 'acceptance-testing' && publishedTopics.has(t.slug))) {
    lines.push(`- [${topic.title}](${origin}/acceptance-testing/${topic.slug}/): examples in ${topic.examples.join(', ')}`);
    for (const chapter of chapters.filter((item) => item.data.topic === topic.slug)) {
      const language = chapter.data.language ?? 'shared';
      lines.push(
        `  - [${chapter.data.title} (${language})](${origin}/acceptance-testing/${topic.slug}/${language}/): ` +
          `${chapter.data.description.trim()} Markdown: ${origin}/acceptance-testing/${topic.slug}/${language}.md`,
      );
    }
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
