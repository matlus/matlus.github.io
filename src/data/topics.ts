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
 * Two independent facts are tracked separately, because conflating them makes
 * finished work look unfinished:
 *
 *   `scope`     whether the guidance itself is language-neutral or is specific
 *               to one language. Stored-procedure data access and the LLM
 *               processor chapters are language-neutral guidance: the rules
 *               hold for C# just as they do for Python.
 *
 *   `examples`  which languages currently have worked examples. A topic can be
 *               language-neutral in scope while having examples in one
 *               language only. That is a complete topic with a partial example
 *               set, not a missing chapter.
 *
 * So a neutral topic with Python-only examples presents as "applies to both
 * languages, examples currently in Python" rather than as a gap.
 */

export type Language = 'python' | 'csharp';

/** 'neutral' means the guidance holds regardless of language. */
export type Scope = 'neutral' | Language;

export type Section = 'pwi' | 'acceptance-testing';

export interface Topic {
  /** URL segment. Topical, never numeric. */
  readonly slug: string;
  /** Shared across languages wherever examples exist in more than one. */
  readonly title: string;
  readonly section: Section;
  readonly scope: Scope;
  /**
   * Languages with worked examples today. Typed as a non-empty tuple so the
   * "never empty" invariant is enforced by the compiler rather than checked
   * at runtime.
   */
  readonly examples: readonly [Language, ...Language[]];
  /**
   * PWI pillar. Unassigned pending review, because pillar membership is an
   * editorial decision rather than something derivable from the corpus.
   */
  readonly pillar?: string;
  /** Free-text note surfaced on the topic page. */
  readonly note?: string;
}

const BOTH = ['python', 'csharp'] as const;
const PY = ['python'] as const;
const CS = ['csharp'] as const;

export const TOPICS = [
  // ------------------------------------- neutral, examples in both ---------
  { slug: 'architecture-layers', title: 'Architecture Layers', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'class-design', title: 'Class Design', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'method-design', title: 'Method Design', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'naming-conventions', title: 'Naming Conventions', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'configuration-provider', title: 'Configuration Provider', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'gateway-design-pattern', title: 'Gateway Design Pattern', section: 'pwi', scope: 'neutral', examples: BOTH },
  { slug: 'messaging-patterns', title: 'Messaging Patterns', section: 'pwi', scope: 'neutral', examples: BOTH },
  {
    slug: 'validation-exception-handling',
    title: 'Validation and Exception Handling',
    section: 'pwi',
    scope: 'neutral',
    examples: BOTH,
    note:
      'The Python chapter also covers structured logging. Canonical title drops it ' +
      'so the two families share one heading. Confirm this is the intended scope.',
  },

  { slug: 'testing-strategy', title: 'Testing Strategy', section: 'acceptance-testing', scope: 'neutral', examples: BOTH },
  { slug: 'test-structure-organization', title: 'Test Structure and Organization', section: 'acceptance-testing', scope: 'neutral', examples: BOTH },
  { slug: 'test-naming-conventions', title: 'Test Naming Conventions', section: 'acceptance-testing', scope: 'neutral', examples: BOTH },
  { slug: 'test-assertions', title: 'Test Assertions', section: 'acceptance-testing', scope: 'neutral', examples: BOTH },
  {
    slug: 'test-mediators-and-spies',
    title: 'Test Mediators and Spies',
    section: 'acceptance-testing',
    scope: 'neutral',
    examples: BOTH,
    note: "Python source slug is 'testing-test_mediators_and_spies'. Normalized here.",
  },
  { slug: 'service-boundary-testing', title: 'Service-Boundary Testing', section: 'acceptance-testing', scope: 'neutral', examples: BOTH },

  // ---------------------------- neutral, examples in Python only -----------
  {
    slug: 'functional-acceptance-testing',
    title: 'Functional Acceptance Testing at the Boundary',
    section: 'acceptance-testing',
    scope: 'neutral',
    examples: PY,
    note:
      'Headline topic for the Acceptance Testing section. C# coverage is currently ' +
      'folded into Service-Boundary Testing rather than standing alone.',
  },
  {
    slug: 'stored-procedure-data-access',
    title: 'Stored Procedure Data Access',
    section: 'pwi',
    scope: 'neutral',
    examples: PY,
    note: 'Data access guidance is independent of language. Examples are Python today.',
  },
  {
    slug: 'llm-based-processor-design',
    title: 'LLM-Based Processor Design',
    section: 'pwi',
    scope: 'neutral',
    examples: PY,
    note: 'Processor and engine guidance applies across languages. Examples are Python today.',
  },
  {
    slug: 'llm-gateway-implementation',
    title: 'LLM Gateway Implementation',
    section: 'pwi',
    scope: 'neutral',
    examples: PY,
    note: 'Applies across languages. Examples are Python today.',
  },
  { slug: 'need-to-know-principle', title: 'Need-to-Know Principle', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'domain-facade', title: 'Domain Facade', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'service-locator-configuration', title: 'Service Locator Configuration', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'anti-patterns', title: 'Anti-Patterns', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'async-resource-lifecycle', title: 'Async Resource Lifecycle', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'encapsulating-third-party-libraries', title: 'Encapsulating Third-Party Libraries', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'boundary-validation', title: 'Boundary Validation', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'code-correctness-runtime-safety', title: 'Code Correctness and Runtime Safety', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'intentional-model-design', title: 'Intentional Model Design', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'artifact-persistence-callbacks', title: 'Artifact Persistence Callbacks', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'adapter-pattern', title: 'Adapter Pattern', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'strategy-pattern', title: 'Strategy Pattern', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'factory-pattern', title: 'Factory Pattern', section: 'pwi', scope: 'neutral', examples: PY },
  { slug: 'factory-method-pattern', title: 'Factory Method Pattern', section: 'pwi', scope: 'neutral', examples: PY },
  {
    slug: 'decorator-pattern',
    title: 'Decorator Pattern',
    section: 'pwi',
    scope: 'neutral',
    examples: PY,
    note:
      'Marked neutral on the assumption this is the GoF pattern. If the chapter is ' +
      "about Python's @ decorator syntax, scope should be 'python'.",
  },

  // ------------------------- genuinely language-specific guidance ----------
  { slug: 'python-language-style', title: 'Python Language Style', section: 'pwi', scope: 'python', examples: PY },
  { slug: 'type-annotations', title: 'Type Annotations', section: 'pwi', scope: 'python', examples: PY },
  { slug: 'linq-query-semantics', title: 'LINQ Query Semantics', section: 'pwi', scope: 'csharp', examples: CS },

  // ---------------------------- neutral, examples in C# only ---------------
  {
    slug: 'data-manager-design',
    title: 'Data Manager Design',
    section: 'pwi',
    scope: 'neutral',
    examples: CS,
    note: 'Examples are C# today.',
  },
] as const satisfies readonly Topic[];

export type TopicSlug = (typeof TOPICS)[number]['slug'];

/** Slugs are URL segments, so duplicates are a build error. */
const seen = new Set<string>();
for (const topic of TOPICS) {
  if (seen.has(topic.slug)) {
    throw new Error(`Duplicate topic slug: ${topic.slug}`);
  }
  seen.add(topic.slug);

  // A language-specific topic cannot carry examples from the other language.
  if (topic.scope !== 'neutral' && topic.examples.some((lang) => lang !== topic.scope)) {
    throw new Error(`Topic ${topic.slug} is scoped ${topic.scope} but has foreign examples`);
  }
}

export function topicsInSection(section: Section): readonly Topic[] {
  return TOPICS.filter((topic) => topic.section === section);
}

export function topicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

/** Topics whose guidance applies to a language, whether or not examples exist yet. */
export function topicsApplyingTo(language: Language): readonly Topic[] {
  return TOPICS.filter((topic) => topic.scope === 'neutral' || topic.scope === language);
}
