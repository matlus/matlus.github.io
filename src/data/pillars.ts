import type { Pillar } from './topics';

/**
 * Copy for the three pillars that have pages of their own.
 *
 * Verification with Intent is deliberately absent. That pillar IS the
 * Acceptance Testing section, surfaced at top level because functional
 * acceptance testing at the boundary is the practice that earns confidence to
 * ship. Generating a stub page here would split retrieval across two URLs for
 * one subject.
 *
 * This lives in its own module rather than in the route, because Astro
 * extracts `getStaticPaths` into a separate module where it cannot close over
 * a const declared in component frontmatter.
 */

export type PagedPillar = Exclude<Pillar, 'verification-with-intent'>;

export interface PillarCopy {
  readonly title: string;
  readonly blurb: string;
}

export const PILLAR_COPY: Record<PagedPillar, PillarCopy> = {
  'architecture-with-intent': {
    title: 'Architecture with Intent',
    blurb:
      'Layers, boundaries, and where responsibility belongs. What may depend on what, ' +
      'and where a system meets the things outside it.',
  },
  'programming-with-intent': {
    title: 'Programming with Intent',
    blurb:
      'Classes, methods, naming, and the shape of everyday code. The rules that apply ' +
      'to almost every file you touch.',
  },
  'programming-to-exceptions': {
    title: 'Programming to Exceptions',
    blurb:
      'Failure as a designed path rather than an afterthought. Validation at boundaries, ' +
      'and what catching an exception obliges you to do.',
  },
};
