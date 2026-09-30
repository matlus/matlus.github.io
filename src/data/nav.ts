/**
 * The site's navigation tree, in one place.
 *
 * Layouts read this. It is never hand-copied into templates, and adding a
 * section means editing this file only.
 *
 * Every entry renders as a real anchor in the DOM at page load. Dropdown
 * children are hidden with CSS until opened, never injected by JavaScript, so
 * crawlers see links to every section from every page.
 */

export type NavIconName =
  | 'layers'
  | 'code'
  | 'shield'
  | 'alert'
  | 'grid'
  | 'flask'
  | 'file'
  | 'play'
  | 'user';

export interface NavChild {
  readonly label: string;
  readonly href: string;
  readonly blurb?: string;
  readonly icon?: NavIconName;
  /** Small monospaced detail line under the blurb. */
  readonly meta?: string;
  /** Short tinted tag at the right edge, such as a date or media type. */
  readonly chip?: string;
}

export interface NavItem {
  readonly label: string;
  /** Top-level items are always links, not dead dropdown triggers. */
  readonly href: string;
  /** Tiny second line under the label. */
  readonly sub: string;
  /** Small caps heading inside the dropdown. */
  readonly eyebrow?: string;
  /** Closing link at the foot of the dropdown. */
  readonly footer?: string;
  readonly children?: readonly NavChild[];
}

/** The four PWI pillars. Chapter assignment to pillars is still open. */
export const PILLARS = [
  {
    label: 'Architecture with Intent',
    href: '/pwi/architecture-with-intent/',
    blurb: 'Layers, boundaries, and where responsibility belongs.',
    icon: 'layers',
  },
  {
    label: 'Programming with Intent',
    href: '/pwi/programming-with-intent/',
    blurb: 'Classes, methods, naming, and the shape of everyday code.',
    icon: 'code',
  },
  {
    // Not a page under /pwi/. This pillar IS the Acceptance Testing section,
    // promoted to top-level navigation because it is the practice that earns
    // confidence to ship. Pointing the card at the section avoids a duplicate
    // hub that would split retrieval between two URLs.
    label: 'Verification with Intent',
    href: '/acceptance-testing/',
    blurb: 'Functional acceptance testing at the boundary. Proving the thing does what it claims.',
    icon: 'shield',
  },
  {
    label: 'Programming to Exceptions',
    href: '/pwi/programming-to-exceptions/',
    blurb: 'Failure as a designed path rather than an afterthought.',
    icon: 'alert',
  },
] as const satisfies readonly NavChild[];

/*
 * Annotated rather than `as const satisfies`, deliberately. Preserving literal
 * types would make `children` absent from the union members that lack it, so
 * every consumer would have to narrow before reading an optional property.
 */
export const NAV: readonly NavItem[] = [
  {
    label: 'PWI',
    href: '/pwi/',
    sub: 'Programming With Intent',
    eyebrow: 'Four pillars',
    footer: 'Browse all of PWI',
    children: PILLARS,
  },
  {
    label: 'Acceptance Testing',
    href: '/acceptance-testing/',
    sub: 'Verify at the boundary',
    eyebrow: 'The series, in reading order',
    footer: 'Browse acceptance testing',
  },
  { label: 'Writing', href: '/writing/', sub: 'Essays and articles', eyebrow: 'Latest', footer: 'All writing' },
  { label: 'Media', href: '/media/', sub: 'Video and audio', eyebrow: 'Latest recordings', footer: 'All media' },
  { label: 'About', href: '/about/', sub: 'Shiv Kumar' },
];

/** True when `href` is the current page or an ancestor of it. */
export function isCurrent(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(href);
}
