import { getCollection } from 'astro:content';

/** A recorded companion to a published page. */
export interface MediaEntry {
  readonly title: string;
  readonly href: string;
  readonly section: string;
  readonly video?: string | undefined;
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
      href: `/writing/${post.id}/`,
      section: 'Writing',
      video: post.data.youtube,
      audio: post.data.audio,
      published: post.data.datePublished,
    })),
    ...chapters.map((chapter): MediaEntry => ({
      title: chapter.data.title,
      href: `/${chapter.data.section}/${chapter.data.topic}/${chapter.data.language ?? 'shared'}/`,
      section: chapter.data.section === 'pwi' ? 'PWI' : 'Acceptance Testing',
      video: chapter.data.youtube,
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
