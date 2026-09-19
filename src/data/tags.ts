/**
 * Controlled tag vocabulary.
 *
 * A page may only use tags declared here. The content schema enforces it, so
 * an undeclared tag fails the build. This is what stops `testing`, `tests`,
 * and `unit-testing` from splitting the same content three ways.
 *
 * Each description becomes the opening paragraph of that tag's page, which
 * turns a bare link list into something worth retrieving and citing.
 *
 * Starter set, drawn from the existing corpus. Expect it to grow deliberately
 * rather than organically.
 */

export interface Tag {
  readonly slug: string;
  readonly label: string;
  readonly description: string;
}

export const TAGS = [
  {
    slug: 'architecture',
    label: 'Architecture',
    description:
      'How a system is divided into layers, where each responsibility belongs, and what ' +
      'may legitimately depend on what.',
  },
  {
    slug: 'naming',
    label: 'Naming',
    description:
      'Choosing names that state what a thing is, and keeping those names stable as a ' +
      'value moves through a system.',
  },
  {
    slug: 'method-design',
    label: 'Method Design',
    description:
      'Visibility, return contracts, abstraction levels, and the difference between a ' +
      'method that acts and one that answers.',
  },
  {
    slug: 'class-design',
    label: 'Class Design',
    description:
      'Separating behavior from state, deciding what may be inherited, and keeping ' +
      'types honest about what they hold.',
  },
  {
    slug: 'testing',
    label: 'Testing',
    description:
      'Which layer proves what, how tests are arranged, and what a passing test is ' +
      'actually evidence of.',
  },
  {
    slug: 'acceptance-testing',
    label: 'Acceptance Testing',
    description:
      'Exercising a system through its front door as a black box, with attention to ' +
      'where test data comes from and what keeps a scenario true over time.',
  },
  {
    slug: 'error-handling',
    label: 'Error Handling',
    description:
      'Treating failure as a designed path: validation at boundaries, exception ' +
      'translation, and what a caught exception obliges you to do.',
  },
  {
    slug: 'data-access',
    label: 'Data Access',
    description:
      'Reaching a store without letting its shape leak upward. Language-independent ' +
      'guidance, currently illustrated in Python.',
  },
  {
    slug: 'llm-systems',
    label: 'LLM Systems',
    description:
      'Designing processors, engines, and gateways that call language models, and ' +
      'keeping that machinery testable.',
  },
  {
    slug: 'python',
    label: 'Python',
    description: 'Material specific to Python, or illustrated with Python examples.',
  },
  {
    slug: 'csharp',
    label: 'C#',
    description: 'Material specific to C#, or illustrated with C# examples.',
  },
  {
    slug: 'typescript',
    label: 'TypeScript',
    description: 'Material specific to TypeScript, including this site’s own build.',
  },
  {
    slug: 'ai-assisted-development',
    label: 'AI-Assisted Development',
    description:
      'Working with coding agents: what to delegate, how to review the result, and ' +
      'where the failure modes cluster.',
  },
  {
    slug: 'code-review',
    label: 'Code Review',
    description:
      'Turning written guidance into rules a reviewer can apply consistently, by ' +
      'machine or by hand.',
  },
] as const satisfies readonly Tag[];

export type TagSlug = (typeof TAGS)[number]['slug'];

const seen = new Set<string>();
for (const tag of TAGS) {
  if (seen.has(tag.slug)) {
    throw new Error(`Duplicate tag slug: ${tag.slug}`);
  }
  seen.add(tag.slug);
}

export function tagBySlug(slug: string): Tag | undefined {
  return TAGS.find((tag) => tag.slug === slug);
}
