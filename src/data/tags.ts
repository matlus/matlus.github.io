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
      'Named software design patterns such as Factory, Factory Method, Strategy, ' +
      'Template Method, and Iterator. Articles explain a pattern’s structure ' +
      'or apply it in a worked design.',
  },
  {
    slug: 'architectural-patterns',
    label: 'Architectural Patterns',
    description:
      'Recurring structures for system responsibilities and boundaries, including ' +
      'Domain Facades, Service Locators, Gateways, Data Managers, and Configuration Providers.',
  },
  {
    slug: 'ai-workflow-patterns',
    label: 'AI Workflow Patterns',
    description:
      'Reusable ways to coordinate model judgments with code, including fan-out, ' +
      'confidence gates, composite scoring, and intent routing.',
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
  { slug: 'strategy-pattern', label: 'Strategy Pattern', description: 'Selecting one of several interchangeable behaviors through a common role.' },
  { slug: 'delegates', label: 'Delegates', description: 'Using C# delegates to pass behavior and compare that choice with named strategy classes.' },
  { slug: 'composition-over-inheritance', label: 'Composition Over Inheritance', description: 'Building capabilities from collaborating objects while keeping inheritance narrow and deliberate.' },
  { slug: 'dependency-injection', label: 'Dependency Injection', description: 'Passing collaborators into objects and deciding which dependencies callers should control.' },
  { slug: 'factory-pattern', label: 'Factory Pattern', description: 'Creating the right implementation behind a focused construction boundary.' },
  { slug: 'factory-method', label: 'Factory Method', description: 'A creation hook on a consumer base class that subclasses override to choose a dependency from another class family.' },
  { slug: 'polymorphism', label: 'Polymorphism', description: 'Using a shared contract to work with different implementations without making callers name their concrete types.' },
  { slug: 'library-boundaries', label: 'Library Boundaries', description: 'Contracts that let a system request capabilities in its own terms while containing a library’s calls, types, and failure conventions.' },
  { slug: 'model-design', label: 'Model Design', description: 'Defining data types so required fields, genuine absence, and distinct variants are clear to consumers.' },
  { slug: 'template-method', label: 'Template Method', description: 'Defining an operation in a base type while subclasses provide selected steps.' },
  { slug: 'extension-methods', label: 'Extension Methods', description: 'C# methods called as if they belong to a type, and their effect on discoverability and meaning.' },
  { slug: 'data-transfer-objects', label: 'Data Transfer Objects', description: 'Immutable data carriers that keep state separate from the behavior operating on it.' },
  { slug: 'type-casting', label: 'Type Casting', description: 'Choosing casts and type checks according to whether a mismatch is expected or a defect.' },
  { slug: 'mocking', label: 'Mocking', description: 'Replacing collaborators in tests and evaluating the effect on coupling and regression coverage.' },
  { slug: 'test-driven-development', label: 'Test Driven Development', description: 'Using tests to establish behavior before implementation and preserving them through design changes.' },
  { slug: 'interfaces', label: 'Interfaces', description: 'C# interface roles, their costs, and when a consumer needs a narrow capability.' },
  { slug: 'interface-segregation', label: 'Interface Segregation', description: 'Presenting each consumer with only the operations it needs.' },
  { slug: 'boundary-validation', label: 'Boundary Validation', description: 'Checking untrusted input and output at system boundaries while keeping internal flows clear.' },
  { slug: 'async-await', label: 'Async and Await', description: 'C# language features for suspending asynchronous methods and resuming them when awaited work completes.' },
  { slug: 'asynchronous-io', label: 'Asynchronous I/O', description: 'Waiting for files, databases, or network operations without keeping a caller thread blocked for the duration.' },
  { slug: 'task-composition', label: 'Task Composition', description: 'Combining asynchronous operations so independent tasks can overlap and callers can handle their completion and results.' },
  { slug: 'load-testing', label: 'Load Testing', description: 'Measuring throughput, latency, resource use, and dependency capacity as concurrent demand changes.' },
  { slug: 'iis', label: 'IIS', description: "Microsoft's web-server architecture for receiving HTTP requests, routing them to application pools, running application code in worker processes, and caching eligible responses." },
  { slug: 'async-streams', label: 'Async Streams', description: 'Asynchronous sequences that let a consumer await each item as it becomes available, including iterator creation, enumeration, cancellation, and resource lifetime.' },
  { slug: 'benchmarking', label: 'Benchmarking', description: 'Measuring an operation under controlled conditions and interpreting elapsed time, allocations, and other resource costs in light of the workload and implementations compared.' },
  { slug: 'iterator-pattern', label: 'Iterator Pattern', description: 'Traversing a sequence one item at a time through a stable iteration contract, with the consumer requesting each next item.' },
  {
    slug: 'jev',
    label: 'Jev',
    description: 'TypeSafe AI’s System One model for typed judgments about supplied text. Choice, Score, and Noul support bounded semantic decisions.',
  },
  {
    slug: 'model-evaluation',
    label: 'Model Evaluation',
    description: 'Measuring model decisions on representative labeled cases, including error costs, calibration, thresholds, abstention, and performance after changes.',
  },
  {
    slug: 'speculative-fan-out',
    label: 'Speculative Fan-Out',
    description: 'Asking independent questions about shared state in one request, including answers that some later routes will not use.',
  },
  {
    slug: 'confidence-gated-routing',
    label: 'Confidence-Gated Routing',
    description: 'Using a model’s answer and tested confidence thresholds to choose between automatic action, another process, and human review.',
  },
  {
    slug: 'composite-scoring',
    label: 'Composite Scoring',
    description: 'Scoring separate semantic dimensions and combining them with explicit weights to support a decision.',
  },
  {
    slug: 'intent-routing',
    label: 'Intent Routing',
    description: 'Classifying a request’s intent to choose a handler, such as ordinary code, a specialist model, or a person.',
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
