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
 * New tags come from prompts/extract-description-and-tags.md, which checks each
 * candidate against this list first, and tools/check-tags.py, which rejects
 * near-duplicates in CI.
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
    slug: 'verification',
    label: 'Verification',
    description:
      'Establishing that required work actually happened, rather than accepting a ' +
      'confident report that it did. Coverage, completion, and what evidence supports ' +
      'a claim.',
  },
  {
    slug: 'agent-orchestration',
    label: 'Agent Orchestration',
    description:
      'Coordinating multiple model workers: who decides what, what each one may see, ' +
      'what runs concurrently, and what stops a run.',
  },
  {
    slug: 'code-review',
    label: 'Code Review',
    description:
      'Turning written guidance into rules a reviewer can apply consistently, by ' +
      'machine or by hand.',
  },
  {
    slug: 'public-surface',
    label: 'Public Surface',
    description:
      'The set of types a component exposes to its callers. Everything a caller can ' +
      'receive, pass or must catch belongs on it, and everything else stays internal, ' +
      'so the interior can change without breaking anyone.',
  },
  {
    slug: 'levels-of-abstraction',
    label: 'Levels of Abstraction',
    description:
      'Arranging classes by altitude, so each level states what happens and delegates ' +
      'how to the level below. A class’s depth in the folder tree shows its level, ' +
      'and dependencies run one level down.',
  },
  {
    slug: 'service-interface-layer',
    label: 'Service Interface Layer',
    description:
      'The thin host layer, such as a web API, CLI, worker or cloud function, that ' +
      'connects the outside world to a system. It translates transport input and ' +
      'forwards it to the domain, which must not depend on the host.',
  },
  {
    slug: 'design-patterns',
    label: 'Design Patterns',
    description:
      'Named, reusable solutions to recurring design problems, from the classic ' +
      'catalogue and from this body of work, such as the Domain Facade, the Service ' +
      'Locator and the Gateway.',
  },
  {
    slug: 'domain-facade',
    label: 'Domain Facade',
    description:
      'The single public entry point to a domain. It holds no logic of its own, ' +
      'forwards each business operation to a Manager, and hides every internal layer ' +
      'from callers.',
  },
  {
    slug: 'service-locator',
    label: 'Service Locator',
    description:
      'A narrow factory that creates only what must be swappable, such as ' +
      'configuration, loggers and transport handlers, so tests can substitute them. ' +
      'Only the Manager uses it, and only during construction.',
  },
  {
    slug: 'configuration-provider',
    label: 'Configuration Provider',
    description:
      'A typed wrapper over raw configuration that reads and validates settings ' +
      'eagerly and returns typed settings objects. Only the Manager uses it, and it ' +
      'passes values downstream, never the provider.',
  },
  {
    slug: 'gateway-pattern',
    label: 'Gateway Pattern',
    description:
      'A domain-owned boundary to an external service. It presents business-shaped ' +
      'operations and models, and keeps provider types, resource models and failure ' +
      'translation behind it as one deletable unit.',
  },
  {
    slug: 'data-manager',
    label: 'Data Manager',
    description:
      'The component that owns a domain’s whole conversation with a data store. It ' +
      'presents business-shaped operations and keeps store technology, command ' +
      'construction and fault translation behind its seam.',
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
