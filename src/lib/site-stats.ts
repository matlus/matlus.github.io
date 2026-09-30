import { getCollection } from 'astro:content';
import { acceptanceSeries } from '../data/acceptance-series';
import { mediaEntries } from '../data/media';
import { tagCounts } from './tag-counts';

export interface SiteStats {
  readonly articles: number;
  readonly chapters: number;
  readonly topics: number;
  /** Most recent publication or modification date across published content. */
  readonly updated: Date;
}

/** Counts computed from published content only, so the numbers never drift from the site. */
export async function siteStats(): Promise<SiteStats> {
  const [posts, chapters, overviews, counts] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('chapters', ({ data }) => !data.draft),
    getCollection('overviews', ({ data }) => !data.draft),
    tagCounts(),
  ]);

  const stamps = [...posts, ...chapters, ...overviews].map((entry) =>
    (entry.data.dateModified ?? entry.data.datePublished).getTime(),
  );

  return {
    articles: posts.length,
    chapters: chapters.length,
    topics: Object.keys(counts).length,
    updated: new Date(Math.max(...stamps)),
  };
}

export interface SectionCounts {
  readonly pwi: number;
  readonly acceptance: number;
  readonly writing: number;
  readonly media: number;
}

/** How many published items each top-level section holds. */
export async function sectionCounts(): Promise<SectionCounts> {
  const [posts, chapters, media] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('chapters', ({ data }) => !data.draft),
    mediaEntries(),
  ]);
  const slugs = new Set(posts.map((post) => post.id));

  return {
    pwi: chapters.filter((chapter) => chapter.data.section === 'pwi').length,
    acceptance: acceptanceSeries.filter((article) => slugs.has(article.slug)).length,
    writing: posts.length,
    media: media.length,
  };
}

/** Dates display in UTC so a calendar day never shifts with the reader's time zone. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
