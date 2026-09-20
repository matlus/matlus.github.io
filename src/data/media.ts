/**
 * Media index.
 *
 * Every row points back at an article, which is the canonical page. A video or
 * an audio companion is never a page in its own right, so nothing here
 * duplicates content and no title exists in two places.
 *
 * The index is a view over the content, letting someone browse only videos or
 * only audio without walking every chapter to find them.
 *
 * Placeholder data. Once content collections exist this is computed at build
 * time by collecting every entry whose frontmatter carries `youtube` or
 * `audio`, so the two can never drift apart.
 */

export interface MediaEntry {
  /** Article title. Matches the page it links to. */
  readonly title: string;
  /** Canonical article URL. The title always links here. */
  readonly href: string;
  /** Section the article belongs to, for grouping and filtering. */
  readonly section: string;
  /** YouTube URL, where a video exists. */
  readonly video?: string;
  /** Path to the audio companion, where one exists. */
  readonly audio?: string;
  readonly published?: string;
}

export const MEDIA: readonly MediaEntry[] = [
  {
    title: 'Functional Acceptance Testing at the Boundary',
    href: '/acceptance-testing/functional-acceptance-testing/',
    section: 'Acceptance Testing',
    video: 'https://www.youtube.com/@matlus',
    audio: '/audio/functional-acceptance-testing.mp3',
    published: '2026-03-14',
  },
  {
    title: 'Method Design',
    href: '/pwi/method-design/',
    section: 'PWI',
    video: 'https://www.youtube.com/@matlus',
    published: '2025-11-02',
  },
  {
    title: 'Naming Conventions',
    href: '/pwi/naming-conventions/',
    section: 'PWI',
    video: 'https://www.youtube.com/@matlus',
    audio: '/audio/naming-conventions.mp3',
    published: '2025-09-21',
  },
  {
    title: 'Skills versus Controlled Workflows',
    href: '/writing/skills-versus-controlled-workflows/',
    section: 'Writing',
    audio: '/audio/skills-versus-controlled-workflows.mp3',
    published: '2026-09-12',
  },
  {
    title: 'Test Mediators and Spies',
    href: '/acceptance-testing/test-mediators-and-spies/',
    section: 'Acceptance Testing',
    video: 'https://www.youtube.com/@matlus',
    published: '2025-12-08',
  },
];

export function hasVideo(entry: MediaEntry): boolean {
  return entry.video !== undefined;
}

export function hasAudio(entry: MediaEntry): boolean {
  return entry.audio !== undefined;
}
