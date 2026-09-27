import { getCollection } from 'astro:content';

/** Count tags only on published content. */
export async function tagCounts(): Promise<Record<string, number>> {
  const [posts, chapters, overviews] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('chapters', ({ data }) => !data.draft),
    getCollection('overviews', ({ data }) => !data.draft),
  ]);
  const counts: Record<string, number> = {};
  for (const entry of [...posts, ...chapters, ...overviews]) {
    for (const tag of entry.data.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}
