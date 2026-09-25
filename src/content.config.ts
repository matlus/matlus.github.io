import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TAGS } from './data/tags';

/**
 * Content collections.
 *
 * The schema is the single source of truth for frontmatter shape. Types flow
 * from it via `z.infer` rather than being declared separately, because a
 * hand-written duplicate drifts.
 *
 * Tag validation is the important part: a page may only use a tag from the
 * controlled vocabulary, and the build fails otherwise. That is what stops
 * `testing`, `tests` and `unit-testing` becoming three tags for one subject.
 */

const tagSlugs = TAGS.map((tag) => tag.slug) as [string, ...string[]];
const tagEnum = z.enum(tagSlugs);

/** Shared by every collection. */
const base = z.object({
  title: z.string(),
  /** One line. Used in meta description, llms.txt, and card blurbs. */
  description: z.string(),
  datePublished: z.coerce.date(),
  dateModified: z.coerce.date().optional(),
  tags: z.array(tagEnum).min(1),
  /** Hero image under src/assets/heroes. Falls back to section art when absent. */
  hero: z.string().optional(),
  /** Audio companion. Its presence renders the player and a download link. */
  audio: z.string().optional(),
  /** Source video, where the page derives from one. */
  youtube: z.url().optional(),
  youtubeLabel: z.string().optional(),
  /** Other recordings directly discussed by the article. */
  additionalVideos: z.array(z.object({
    label: z.string(),
    url: z.url(),
    context: z.string().optional(),
  })).optional(),
  /** Public code repositories directly associated with this article. */
  repositories: z.array(z.object({
    label: z.string(),
    url: z.url(),
    context: z.string().optional(),
  })).optional(),
  /** Manual override for the computed related list. */
  related: z.array(z.string()).optional(),
  /** Named diagram components rendered in the body. */
  diagrams: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
});

/**
 * Prose. Everything lives here permanently, whatever its maturity, because a
 * section defined by maturity forces a URL change when an idea firms up.
 * `status` is a label, not a location.
 */
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
  schema: base.extend({
    status: z.enum(['exploratory', 'established']).default('established'),
  }),
});

/** Evergreen reference chapters. Reached by navigation, never a feed. */
const chapters = defineCollection({
  loader: glob({ base: './src/content/chapters', pattern: '**/*.md' }),
  schema: base.extend({
    section: z.enum(['pwi', 'acceptance-testing']),
    topic: z.string(),
    language: z.enum(['python', 'csharp', 'sql']).optional(),
    pillar: z.string().optional(),
  }),
});

export const collections = { writing, chapters };
