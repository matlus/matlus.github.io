import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import type { Topic } from '../data/topics';
import { heroFor } from './heroes';

/** A published teaching article can supply a topic link before its chapter exists. */
const ARTICLE_TOPIC_SLUGS: ReadonlyMap<string, string> = new Map([
  ['configuration-provider-design-pattern', 'configuration-provider'],
  ['gateway-design-pattern', 'gateway-design-pattern'],
  ['factory-pattern', 'factory-pattern'],
  ['factory-method-pattern', 'factory-method-pattern'],
]);

/** Article reading order on a pillar hub, independent of its reference chapters. */
const PILLAR_ARTICLE_SLUGS: ReadonlyMap<string, readonly string[]> = new Map([
  ['programming-to-exceptions', [
    'programming-to-exceptions-method-contracts',
    'programming-to-exceptions-diagnostics-and-boundaries',
    'programming-to-exceptions-logging-and-progress',
  ]],
]);

export async function loadPwiPillarArticles(pillarSlug: string) {
  const slugs = PILLAR_ARTICLE_SLUGS.get(pillarSlug) ?? [];
  const articles = await getCollection('writing', ({ id, data }) =>
    !data.draft && slugs.includes(id),
  );
  return articles.sort((left, right) => slugs.indexOf(left.id) - slugs.indexOf(right.id));
}

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

  // The former language-specific topic now has one shared series destination.
  if ((await loadPwiPillarArticles('programming-to-exceptions')).length > 0) {
    links.set('validation-exception-handling', '/pwi/programming-to-exceptions/');
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

const LANGUAGE_LABEL: Readonly<Record<string, string>> = { python: 'Python', csharp: 'C#', sql: 'SQL' };

/** Everything a listing card needs about one PWI topic. */
export interface TopicCard {
  readonly topic: Topic;
  readonly href: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly date: Date;
  readonly hero: ImageMetadata | undefined;
  readonly markdown: string | undefined;
  /** Languages with worked examples, such as "Python · C#". Omitted for one language, which the tags already name. */
  readonly kicker: string | undefined;
}

/**
 * Split topics into those with a page to show and those still pending.
 *
 * A topic's card draws on its overview and chapters where they exist, and on
 * its matching teaching article otherwise. The three sources hold the same
 * facts in different collections, so this is the one place that reconciles them.
 */
export async function loadTopicCards(
  topics: readonly Topic[],
): Promise<{ readonly cards: readonly TopicCard[]; readonly pending: readonly Topic[] }> {
  const [chapters, overviews, { articles, links }] = await Promise.all([
    getCollection('chapters', ({ data }) => !data.draft && data.section === 'pwi'),
    getCollection('overviews', ({ data }) => !data.draft),
    loadPwiArticleTopics(),
  ]);

  const cards: TopicCard[] = [];
  const pending: Topic[] = [];

  for (const topic of topics) {
    const kicker = topic.examples.length > 1
      ? topic.examples.map((language) => LANGUAGE_LABEL[language] ?? language).join(' · ')
      : undefined;
    const topicChapters = chapters
      .filter((chapter) => chapter.data.topic === topic.slug)
      .sort((a, b) => a.data.datePublished.getTime() - b.data.datePublished.getTime());
    const overview = overviews.find((entry) => entry.data.topic === topic.slug);
    const articleHref = links.get(topic.slug);
    const article = articleHref ? articles.find((entry) => `/writing/${entry.id}/` === articleHref) : undefined;

    const first = topicChapters[0];
    if (first) {
      const source = overview?.data ?? first.data;
      cards.push({
        topic,
        href: `/pwi/${topic.slug}/`,
        description: source.description,
        tags: source.tags,
        date: source.datePublished,
        hero: heroFor(`pwi-${topic.slug}`) ?? (first.data.hero ? heroFor(first.data.hero) : undefined),
        markdown: overview ? `/pwi/${topic.slug}.md` : undefined,
        kicker,
      });
    } else if (article) {
      cards.push({
        topic,
        href: `/writing/${article.id}/`,
        description: article.data.description,
        tags: article.data.tags,
        date: article.data.datePublished,
        hero: article.data.hero ? heroFor(article.data.hero) : undefined,
        markdown: `/writing/${article.id}.md`,
        kicker,
      });
    } else {
      pending.push(topic);
    }
  }

  return { cards, pending };
}
