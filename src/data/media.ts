import { getCollection } from 'astro:content';

/** A recorded companion to a published page. */
export interface MediaEntry {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly markdown?: string | undefined;
  readonly section: string;
  readonly tags: readonly string[];
  /** Hero slug, resolved to an image by the page. */
  readonly hero?: string | undefined;
  readonly video?: string | undefined;
  /** Custom wording for the main video link, where the frontmatter gives one. */
  readonly videoLabel?: string | undefined;
  readonly additionalVideos: readonly { readonly label: string; readonly url: string }[];
  readonly audio?: string | undefined;
  readonly published: Date;
}

/** Keep the media index in step with the article and chapter frontmatter. */
export async function mediaEntries(): Promise<MediaEntry[]> {
  const [posts, chapters] = await Promise.all([
    getCollection('writing', ({ data }) => !data.draft && Boolean(data.youtube || data.audio)),
    getCollection('chapters', ({ data }) => !data.draft && Boolean(data.youtube || data.audio)),
  ]);

  return [
    ...posts.map((post): MediaEntry => ({
      title: post.data.title,
      description: post.data.description,
      href: `/writing/${post.id}/`,
      markdown: `/writing/${post.id}.md`,
      section: 'Writing',
      tags: post.data.tags,
      hero: post.data.hero,
      video: post.data.youtube,
      videoLabel: post.data.youtubeLabel,
      additionalVideos: post.data.additionalVideos ?? [],
      audio: post.data.audio,
      published: post.data.datePublished,
    })),
    ...chapters.map((chapter): MediaEntry => ({
      title: chapter.data.title,
      description: chapter.data.description,
      href: `/${chapter.data.section}/${chapter.data.topic}/${chapter.data.language ?? 'shared'}/`,
      markdown: `/${chapter.data.section}/${chapter.data.topic}/${chapter.data.language ?? 'shared'}.md`,
      section: chapter.data.section === 'pwi' ? 'PWI' : 'Acceptance Testing',
      tags: chapter.data.tags,
      hero: chapter.data.hero,
      video: chapter.data.youtube,
      videoLabel: chapter.data.youtubeLabel,
      additionalVideos: chapter.data.additionalVideos ?? [],
      audio: chapter.data.audio,
      published: chapter.data.datePublished,
    })),
  ].sort((a, b) => b.published.getTime() - a.published.getTime());
}

export function hasVideo(entry: MediaEntry): boolean {
  return entry.video !== undefined;
}

export function hasAudio(entry: MediaEntry): boolean {
  return entry.audio !== undefined;
}
