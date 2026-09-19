/**
 * Canonical topic registry.
 *
 * The website is deliberately decoupled from PWI chapter numbers. The two
 * language families number their chapters independently, so Python ch50 is
 * test naming conventions while C# cs50 is testing strategy. Numbers never
 * appear in URLs and never appear here.
 *
 * A topic owns its slug and its title. Where both languages cover a topic,
 * they share that title, and the language-specific pages hang beneath it.
 *
 * `coverage` records why a topic is single-language:
 *   - 'both'            covered in both families
 *   - 'python-only'     inherently Python, no C# counterpart is expected
 *   - 'csharp-only'     inherently C#, no Python counterpart is expected
 *   - 'csharp-pending'  a C# chapter is expected but not yet authored
 *
 * The distinction matters. 'python-only' is a finished state. 'csharp-pending'
 * is a gap, and the site should not present the two the same way.
 */

export type Coverage = 'both' | 'python-only' | 'csharp-only' | 'csharp-pending';

export type Section = 'pwi' | 'acceptance-testing';

export interface Topic {
  /** URL segment. Topical, never numeric. */
  readonly slug: string;
  /** Shared across languages where coverage is 'both'. */
  readonly title: string;
  readonly section: Section;
  readonly coverage: Coverage;
  /**
   * PWI pillar. Unassigned pending review, because pillar membership is an
   * editorial decision rather than something derivable from the corpus.
   */
  readonly pillar?: string;
  /** Free-text note surfaced on the topic page where coverage is uneven. */
  readonly note?: string;
}

export const TOPICS = [
  // ---------------------------------------------------------------- both ---
  { slug: 'architecture-layers', title: 'Architecture Layers', section: 'pwi', coverage: 'both' },
  { slug: 'class-design', title: 'Class Design', section: 'pwi', coverage: 'both' },
  { slug: 'method-design', title: 'Method Design', section: 'pwi', coverage: 'both' },
  { slug: 'naming-conventions', title: 'Naming Conventions', section: 'pwi', coverage: 'both' },
  { slug: 'configuration-provider', title: 'Configuration Provider', section: 'pwi', coverage: 'both' },
  { slug: 'gateway-design-pattern', title: 'Gateway Design Pattern', section: 'pwi', coverage: 'both' },
  { slug: 'messaging-patterns', title: 'Messaging Patterns', section: 'pwi', coverage: 'both' },
  {
    slug: 'validation-exception-handling',
    title: 'Validation and Exception Handling',
    section: 'pwi',
    coverage: 'both',
    note:
      'The Python chapter also covers structured logging. Canonical title drops it ' +
      'so the two families share one heading. Confirm this is the intended scope.',
  },

  // testing family, both languages
  { slug: 'testing-strategy', title: 'Testing Strategy', section: 'acceptance-testing', coverage: 'both' },
  { slug: 'test-structure-organization', title: 'Test Structure and Organization', section: 'acceptance-testing', coverage: 'both' },
  { slug: 'test-naming-conventions', title: 'Test Naming Conventions', section: 'acceptance-testing', coverage: 'both' },
  { slug: 'test-assertions', title: 'Test Assertions', section: 'acceptance-testing', coverage: 'both' },
  {
    slug: 'test-mediators-and-spies',
    title: 'Test Mediators and Spies',
    section: 'acceptance-testing',
    coverage: 'both',
    note: "Python source slug is 'testing-test_mediators_and_spies'. Normalized here.",
  },
  { slug: 'service-boundary-testing', title: 'Service-Boundary Testing', section: 'acceptance-testing', coverage: 'both' },

  // ----------------------------------------------------------- C# absent ---
  {
    slug: 'functional-acceptance-testing',
    title: 'Functional Acceptance Testing at the Boundary',
    section: 'acceptance-testing',
    coverage: 'csharp-pending',
    note:
      'Headline topic for the Acceptance Testing section. C# coverage is currently ' +
      'folded into Service-Boundary Testing rather than standing alone.',
  },

  // ------------------------------------------------------------ C# only ----
  { slug: 'data-manager-design', title: 'Data Manager Design', section: 'pwi', coverage: 'csharp-only' },
  { slug: 'linq-query-semantics', title: 'LINQ Query Semantics', section: 'pwi', coverage: 'csharp-only' },

  // -------------------------------------------- Python, inherently so ------
  { slug: 'python-language-style', title: 'Python Language Style', section: 'pwi', coverage: 'python-only' },
  { slug: 'type-annotations', title: 'Type Annotations', section: 'pwi', coverage: 'python-only' },
  { slug: 'decorator-pattern', title: 'Decorator Pattern', section: 'pwi', coverage: 'python-only' },

  // ------------------------------- Python now, C# counterpart plausible ----
  { slug: 'need-to-know-principle', title: 'Need-to-Know Principle', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'domain-facade', title: 'Domain Facade', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'service-locator-configuration', title: 'Service Locator Configuration', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'anti-patterns', title: 'Anti-Patterns', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'async-resource-lifecycle', title: 'Async Resource Lifecycle', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'encapsulating-third-party-libraries', title: 'Encapsulating Third-Party Libraries', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'boundary-validation', title: 'Boundary Validation', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'code-correctness-runtime-safety', title: 'Code Correctness and Runtime Safety', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'intentional-model-design', title: 'Intentional Model Design', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'artifact-persistence-callbacks', title: 'Artifact Persistence Callbacks', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'stored-procedure-data-access', title: 'Stored Procedure Data Access', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'adapter-pattern', title: 'Adapter Pattern', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'strategy-pattern', title: 'Strategy Pattern', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'factory-pattern', title: 'Factory Pattern', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'factory-method-pattern', title: 'Factory Method Pattern', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'llm-based-processor-design', title: 'LLM-Based Processor Design', section: 'pwi', coverage: 'csharp-pending' },
  { slug: 'llm-gateway-implementation', title: 'LLM Gateway Implementation', section: 'pwi', coverage: 'csharp-pending' },
] as const satisfies readonly Topic[];

export type TopicSlug = (typeof TOPICS)[number]['slug'];

/** Every slug must be unique, since slugs are URL segments. */
const seen = new Set<string>();
for (const topic of TOPICS) {
  if (seen.has(topic.slug)) {
    throw new Error(`Duplicate topic slug: ${topic.slug}`);
  }
  seen.add(topic.slug);
}

export function topicsInSection(section: Section): readonly Topic[] {
  return TOPICS.filter((topic) => topic.section === section);
}

export function topicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}
