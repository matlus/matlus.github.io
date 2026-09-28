import { getCollection } from 'astro:content';
import type { Topic } from '../data/topics';

/** A published teaching article can supply a topic link before its chapter exists. */
const ARTICLE_TOPIC_SLUGS: ReadonlyMap<string, string> = new Map([
  ['configuration-provider-design-pattern', 'configuration-provider'],
  ['gateway-design-pattern', 'gateway-design-pattern'],
  ['factory-pattern', 'factory-pattern'],
  ['factory-method-pattern', 'factory-method-pattern'],
]);

export async function loadPwiArticleTopics() {
  const articles = await getCollection('writing', ({ id, data }) =>
    !data.draft && ARTICLE_TOPIC_SLUGS.has(id),
  );

  const links = new Map<string, string>();
  for (const article of articles) {
    const topicSlug = ARTICLE_TOPIC_SLUGS.get(article.id);
    if (topicSlug === undefined) {
      throw new Error(`No PWI topic registered for article ${article.id}`);
    }
    links.set(topicSlug, `/writing/${article.id}/`);
  }

  return { articles, links };
}

/** Keep published chapters and article-backed topics above pending topics. */
export function publishedTopicsFirst(
  topics: readonly Topic[],
  publishedChapters: ReadonlySet<string>,
  articleLinks: ReadonlyMap<string, string>,
): readonly Topic[] {
  const hasLink = (topic: Topic): boolean =>
    publishedChapters.has(topic.slug) || articleLinks.has(topic.slug);

  return [...topics].sort((left, right) => Number(hasLink(right)) - Number(hasLink(left)));
}
