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
    slug: "message-brokers",
    label: "Message Brokers",
    description: "Infrastructure that receives, routes and delivers messages between applications. Publisher and subscriber contracts, message properties, acknowledgements and delivery guarantees determine how applications use a broker.",
  },
  {
    slug: "expression-trees",
    label: "Expression Trees",
    description: "Representing code as a tree of expressions that a program can inspect, transform or translate. C# can convert supported lambdas into expression trees, exposing their parameters, member accesses and operations without executing the lambda.",
  },
  {
    slug: "dependency-inversion",
    label: "Dependency Inversion",
    description: "Arranging source dependencies so application policy and implementation details meet through abstractions that are independent of those details. Implementations conform to the contracts rather than requiring policy to depend on concrete infrastructure.",
  },
  {
    slug: "cpu-caches",
    label: "CPU Caches",
    description: "Processor caches retain nearby copies of instructions and data. Cache lines, locality, sharing and coherence affect the cost of accessing a program's working set.",
  },
  {
    slug: "one-to-many-mapping",
    label: "One-to-Many Mapping",
    description: "Associating one key with multiple values while defining which keys each value may belong to. Lookup direction, uniqueness constraints and update rules determine the relationship's contract and storage.",
  },
  {
    slug: "adapter-pattern",
    label: "Adapter Pattern",
    description: "Translating an existing component's interface into the interface its caller needs. The adapter owns the translation while keeping the underlying component's API details inside its implementation.",
  },
  {
    slug: "anonymous-types",
    label: "Anonymous Types",
    description: "Compiler-generated types created from property names and values without an explicit class declaration. Their inferred identity, read-only properties and value-based equality shape their use in local operations and query projections.",
  },
  {
    slug: "autonomous-methods",
    label: "Autonomous Methods",
    description: "Methods that operate on information supplied through their signatures without depending on changing state accumulated by their class. They may use fixed information and perform external side effects, distinguishing autonomy from purity.",
  },
  {
    slug: "boxing",
    label: "Boxing",
    description: "Representing a value-type value inside an object so it can be used through an object or interface reference. Boxing and unboxing affect copying, allocation and the behavior of typed and untyped APIs.",
  },
  {
    slug: "caching",
    label: "Caching",
    description: "Retaining results or reusable resources to avoid repeating work. Ownership, validity, retention limits and lifetime determine when cached state can safely be reused.",
  },
  {
    slug: "compilation",
    label: "Compilation",
    description: "Translating source code or intermediate instructions into executable code and metadata. Compiler transformations, specialization and code sharing determine what is produced before deployment or during execution.",
  },
  {
    slug: "constants",
    label: "Constants",
    description: "Values fixed at compile time and substituted where code uses them. Their declarations, permitted expressions, and treatment across assembly boundaries determine how changes reach consumers.",
  },
  {
    slug: "constructors",
    label: "Constructors",
    description: "How objects are initialized through constructor bodies, field initializers, and calls between constructors. Inheritance and virtual dispatch determine which state is available while construction proceeds.",
  },
  {
    slug: "deconstruction",
    label: "Deconstruction",
    description: "Extracting individual values from tuples or objects into separate variables. C# supports positional tuple extraction and Deconstruct methods, including overloads, extension methods and discarded results.",
  },
  {
    slug: "garbage-collection",
    label: "Garbage Collection",
    description: "Automatically reclaiming storage occupied by objects that are no longer reachable. Allocation volume, object lifetimes and surviving references affect collection frequency, memory use and execution costs.",
  },
  {
    slug: "generics",
    label: "Generics",
    description: "Types and methods parameterized by other types. Compiler and runtime support determine how type arguments are checked, retained and used to specialize or share executable code.",
  },
  {
    slug: "hash-sets",
    label: "Hash Sets",
    description: "Collections of distinct values organized for hash-based membership checks. Equality comparers, mutation and set operations determine their behavior and the work required for lookups.",
  },
  {
    slug: "higher-order-functions",
    label: "Higher Order Functions",
    description: "Functions that accept other functions as arguments, return functions, or both. Passing behavior lets a reusable algorithm delegate particular decisions to its caller.",
  },
  {
    slug: "immutability",
    label: "Immutability",
    description: "Keeping a value or object's contents unchanged after creation. Operations produce replacement values, while variables may still be reassigned to refer to those replacements.",
  },
  {
    slug: "lambdas",
    label: "Lambdas",
    description: "Expressions that define anonymous functions where behavior is needed. Parameter inference, statement and expression bodies, captured variables and the required target type determine how they are used.",
  },
  {
    slug: "memory-allocation",
    label: "Memory Allocation",
    description: "Obtaining storage for values, objects and working data. Allocation size, frequency and lifetime affect copying, memory use and the work required to reclaim storage.",
  },
  {
    slug: "object-layout",
    label: "Object Layout",
    description: "How a runtime represents objects through field storage, headers and references to shared type information. Layout and allocation overhead depend on the runtime and target architecture.",
  },
  {
    slug: "optional-parameters",
    label: "Optional Parameters",
    description: "Method parameters with defaults that allow callers to omit corresponding arguments. Binding, overload selection, and the placement of default values affect API use and changes to existing callers.",
  },
  {
    slug: "parameter-passing",
    label: "Parameter Passing",
    description: "How method parameters receive argument values or access caller variables. Passing by value and passing by reference determine what is copied and which assignments can affect the caller.",
  },
  {
    slug: "static-classes",
    label: "Static Classes",
    description: "Classes whose members are used without constructing instances. Their language constraints, shared state and responsibilities determine when they suit a design.",
  },
  {
    slug: "static-initialization",
    label: "Static Initialization",
    description: "Establishing a type's static state through field initializers and static constructors. Runtime timing guarantees and initialization failures determine what subsequent uses of the type can rely on.",
  },
  {
    slug: "string-concatenation",
    label: "String Concatenation",
    description: "Combining strings into a single result. Fixed expressions, repeated concatenation, formatting and compiler transformations determine the intermediate values, copying and allocations involved.",
  },
  {
    slug: "stringbuilder",
    label: "StringBuilder",
    description: "The .NET type for accumulating characters in mutable construction storage before producing a string. Append operations, capacity, chunk growth and final copying determine its behavior and costs.",
  },
  {
    slug: "value-and-reference-types",
    label: "Value and Reference Types",
    description: "The distinction between variables containing values directly and variables containing references to objects. Field storage, assignment and copying determine how values and shared objects behave.",
  },
  {
    slug: "value-tuples",
    label: "Value Tuples",
    description: "Grouping values into positional elements using .NET ValueTuple types and C# tuple syntax. Element names, assignment, copying, mutation and equality determine how these groups behave.",
  },
  {
    slug: 'try-parse',
    label: 'Try-Parse',
    description:
      'The Try-Parse pattern gives parsing a Boolean answer for defined invalid-input outcomes. ' +
      'Other failures still throw, and callers requiring the result can use the corresponding throwing operation.',
  },
  {
    slug: 'progress-reporting',
    label: 'Progress Reporting',
    description:
      'Reporting the steps, completed work, and elapsed time of a running operation through stable ' +
      'run, item, and step identifiers. Completion events describe work that actually finished, ' +
      'so operators can distinguish progress, stalls, and failures.',
  },
  {
    slug: 'structured-logging',
    label: 'Structured Logging',
    description:
      'Structured logging records named properties alongside an event so people and tools can ' +
      'filter, correlate, and investigate failures without parsing message text.',
  },
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
    slug: 'prompting',
    label: 'Prompting',
    description:
      "Writing instructions that define a language model's task, constraints, " +
      'evidence requirements, and expected output. Prompt comparisons examine ' +
      'which decisions are specified and which remain open.',
  },
  {
    slug: 'verified-not-trusted',
    label: 'Verified, Not Trusted',
    description:
      'Evidence and reproducible checks for AI-generated claims, with explicit ' +
      'limits on what has been established and what remains uncertain.',
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
  {
    slug: 'context-compaction',
    label: 'Context Compaction',
    description: 'Reducing the material supplied to a language model by selecting relevant source units or summarizing them. Retention decisions must account for current goals, unique evidence, and information that later questions may need.',
  },
  {
    slug: "test-mediator",
    label: "Test Mediator",
    description: "A testing pattern that carries scenario instructions to observation points and exposes captured results to assertions. It can remain separate from its spies or contain one service's private spy; it is distinct from the GoF Mediator pattern.",
  },
  {
    slug: "transport-spy",
    label: "Transport Spy",
    description: "A test observation point at a transport boundary that records outgoing requests or incoming responses while retaining production behavior above that boundary. It can follow scenario instructions to forward, redirect, or supply a controlled response.",
  },
  {
    slug: "builder-pattern",
    label: "Builder Pattern",
    description: "Constructing a model through explicit configuration steps before producing the completed value. Test builders can supply reusable defaults while keeping each scenario's defining values visible and independently owned.",
  },
  {
    slug: "idempotency",
    label: "Idempotency",
    description: "Defining and verifying the outcome of repeated requests without repeating work that has already been accepted. Request identity, conflicting content, preserved state, and outstanding recovery obligations determine the contract.",
  },
  {
    slug: "concurrency",
    label: "Concurrency",
    description: "Behavior when operations overlap and contend for shared state or resources. Verification considers allowed outcomes, arbitration, duplicate effects, and the schedules a particular arrangement actually exercises.",
  },
  {
    slug: "refactoring",
    label: "Refactoring",
    description: "Changing internal organization while preserving established observable behavior. Stable public boundaries and maintained comparisons provide evidence that the reorganization preserves required outcomes.",
  },
  {
    slug: "regression-testing",
    label: "Regression Testing",
    description: "Continuing to verify previously established behavior as later changes enter a system. Maintained scenarios preserve approved requirements and incorporate discovered defects so future runs check those lessons again.",
  },
  {
    slug: "executable-documentation",
    label: "Executable Documentation",
    description: "Documentation whose scenarios execute production behavior and check the outcomes they describe. Readers can connect requirements to the current implementation by running and debugging maintained tests.",
  },
  {
    slug: "requirements-traceability",
    label: "Requirements Traceability",
    description: "Maintaining explicit connections from established requirements to scenarios, expected outcomes, observations, and comparisons. Those connections let reviewers identify missing coverage and distinguish behavioral evidence from structural review.",
  },
  {
    slug: "test-isolation",
    label: "Test Isolation",
    description: "Keeping records, observations, configuration, and cleanup owned by the test or run that creates them. Isolation lets concurrent developers and CI jobs use infrastructure without consuming, altering, or deleting one another's state.",
  },
  { slug: "localdb", label: "LocalDB", description: "SQL Server LocalDB instances for local applications and automated tests, including instance creation, connection strings, and database deployment." },
  { slug: "continuous-integration", label: "Continuous Integration", description: "Automating builds and tests as changes enter a shared codebase, including build definitions, prerequisite setup, and repeatable execution environments." },
  { slug: "azure", label: "Azure", description: "Deploying and operating applications on Microsoft Azure, including service configuration, role startup, storage, and execution environments." },
  { slug: "windows-impersonation", label: "Windows Impersonation", description: "Executing work under a different Windows identity through logon tokens and impersonation contexts, including privileges and identity lifetime." },
  { slug: "msmq", label: "MSMQ", description: "Microsoft Message Queuing for passing work between processes through local or remote queues, including installation and queue-based processing." },
  { slug: "background-processing", label: "Background Processing", description: "Moving work beyond the initiating request into another execution context, with explicit handoff, processing responsibilities, and completion behavior." },
  { slug: "rest", label: "REST", description: "Designing and consuming resource-oriented HTTP APIs through resource identifiers, method semantics, representations, and response status codes." },
  { slug: "cors", label: "Cross-Origin Resource Sharing", description: "The HTTP mechanism through which a server permits browser requests from another origin, including origin headers, preflight requests, and allowed methods or headers." },
  { slug: "jquery", label: "jQuery", description: "Using jQuery to work with browser elements, events, attached data, and Ajax requests." },
  { slug: "http-method-override", label: "HTTP Method Override", description: "Carrying an intended HTTP method in a header on another request method, then translating it before dispatch to an application handler." },
  { slug: "javascript", label: "JavaScript", description: "Material specific to JavaScript, or illustrated with JavaScript examples." },
  { slug: "json", label: "JSON", description: "Representing structured data with JSON and converting between JSON text and application objects, including serialization and response handling." },
  { slug: "httpclient", label: "HttpClient", description: "The .NET HttpClient API for sending HTTP requests and consuming responses, including request content, headers, asynchronous calls, and typed data conversion." },
  { slug: "jsonp", label: "JSONP", description: "Returning JSON inside a JavaScript callback so browser clients can consume script responses across origins, including callback selection and endpoint exposure." },
  { slug: "self-hosting", label: "Self-Hosting", description: "Running a network service inside an application's own process, with explicit listener configuration, routing, startup, and lifetime management." },
  { slug: "quartz-aspnet", label: "Quartz for ASP.NET", description: "Shiv Kumar's ASP.NET page-composition framework, where Builders assemble view objects and HTML templates into dynamic pages." },
  { slug: "html-templates", label: "HTML Templates", description: "Reusable HTML structures whose placeholders receive application data or rendered views, including template selection and separation from rendering code." },
  { slug: "webforms", label: "ASP.NET WebForms", description: "Building and configuring ASP.NET WebForms applications, including application startup, project structure, and integration with HTTP services." },
  { slug: "roslyn", label: "Roslyn", description: "The .NET compiler platform exposes syntax trees, symbols, and semantic information for tools that inspect, transform, or generate source code." },
  { slug: "syntax-highlighting", label: "Syntax Highlighting", description: "Classifying source-code tokens and rendering them with distinct visual styles, including the relationship between syntactic structure and semantic information." },
  { slug: "visitor-pattern", label: "Visitor Pattern", description: "Applying operations while visiting elements of an object structure, with separate handling for the kinds of elements encountered." },
  { slug: "connected-devices", label: "Connected Devices", description: "Physical devices connected to computers or networks, with software interfaces that let applications read their state or control their behavior." },
  { slug: "sandboxing", label: "Sandboxing", description: "Restricting an application's access to system resources and exposing permitted capabilities through controlled interfaces and permissions." },
  { slug: "wcf", label: "WCF", description: "Windows Communication Foundation services and clients, including contracts, transport bindings, endpoints, hosting, metadata exchange, and diagnostics." },
  { slug: "service-proxies", label: "Service Proxies", description: "Client-side objects that expose a remote service's operations and translate local calls into messages sent through a transport." },
  { slug: "asp-net", label: "ASP.NET", description: "Building web applications with ASP.NET, including request processing, handlers, controllers, responses, and framework behavior." },
  { slug: "http", label: "HTTP", description: "HTTP request and response behavior, including methods, headers, connections, content, and client-server communication." },
  { slug: "asynchronous-programming-model", label: "Asynchronous Programming Model", description: "The .NET Asynchronous Programming Model exposes Begin and End method pairs, IAsyncResult, callbacks, and state for asynchronous operations." },
  { slug: "linq", label: "LINQ", description: "Language Integrated Query operations over data, including filtering, projection, joins, grouping, and the relationship between query and method syntax." },
  { slug: "parallel-programming", label: "Parallel Programming", description: "Dividing computational work so multiple processors or cores execute it at the same time, with attention to partitioning, scheduling, synchronization, and overhead." },
  { slug: "wmi", label: "WMI", description: "Windows Management Instrumentation exposes management information about Windows systems through queryable classes and properties." },
  { slug: "cpu-hardware", label: "CPU Hardware", description: "Processor characteristics such as physical packages, cores, logical processors, instruction-set architecture, and address width." },
  { slug: "url-encoding", label: "URL Encoding", description: "Representing data in URL components through percent encoding, with attention to reserved characters, unreserved characters, and form-encoding conventions." },
  { slug: "windows-services", label: "Windows Services", description: "Background services managed by Windows, including service discovery, lifecycle commands, status changes, and programmatic control." },
  { slug: "process-management", label: "Process Management", description: "Launching and controlling operating-system processes, collecting standard output and errors, waiting for completion, and interpreting exit status." },
  { slug: "sql-server", label: "SQL Server", description: "Microsoft SQL Server databases, including SQL commands, storage features, administration, and application integration." },
  { slug: "identity-columns", label: "Identity Columns", description: "Database columns whose numeric values are generated from a seed and increment, including how insertion and reseeding affect subsequent values." },
  { slug: "duplicate-detection", label: "Duplicate Detection", description: "Finding repeated values or records under an explicitly chosen comparison key, including grouping matches and retaining the records that share that key." },
  { slug: "serialization", label: "Serialization", description: "Converting objects and sequences into representations that can be stored or transmitted, and reconstructing values from those representations. Contracts determine member names, data shape, and stream handling." },
  { slug: "datareaders", label: "DataReaders", description: "Reading result sets sequentially through ADO.NET DataReaders. Typed wrappers, connection lifetime, and the choice between streaming rows and materializing objects shape their use." },
  { slug: "debugging", label: "Debugging", description: "Investigating unexpected application behavior with diagnostic tools, traces, and observed execution to identify its cause." },
  { slug: "web-performance", label: "Web Performance", description: "How quickly websites deliver responses and become usable in a browser. Server processing, transferred resources, caching, and measurement all contribute to the result." },
  { slug: "blogging", label: "Blogging", description: "The tools and workflows for writing, editing, and publishing blog posts, including blog engines and their authoring interfaces." },
  { slug: "metaweblog-api", label: "MetaWeblog API", description: "An XML-RPC interface for creating and editing blog posts, retrieving categories, and uploading media. Blog engines implement its operations so compatible authoring clients can publish to them." },
  { slug: "code-generation", label: "Code Generation", description: "Producing source code from metadata, models, or templates. Generators turn a repeatable structure into code while keeping the inputs and generated responsibilities explicit." },
  { slug: "ado-net", label: "ADO.NET", description: ".NET data-access APIs for connections, commands, parameters, readers, adapters, and in-memory tables. Provider abstractions support working with different database engines." },
  { slug: "stored-procedures", label: "Stored Procedures", description: "Named database operations that accept parameters and execute commands close to the stored data. Their result sets and parameters provide contracts for application data access." },
  { slug: "oauth", label: "OAuth", description: "Delegating access to protected resources through provider-issued credentials and tokens. Applications follow an authorization flow and use the resulting access token for permitted requests." },
  { slug: "reflection", label: "Reflection", description: "Inspecting types and members at runtime and invoking capabilities that are not fixed in the calling code. In .NET, reflection also supports generating executable methods through Reflection.Emit." },
  { slug: "request-binding", label: "Request Binding", description: "Mapping HTTP form fields and query parameters into typed values or objects. Binders define conversion, defaults, and how multiple incoming fields populate a model." },
  { slug: "type-conversion", label: "Type Conversion", description: "Transforming a value from one representation or data type into another, including parsing text, handling numeric formats, and converting collections or custom objects." },
  { slug: "razor", label: "Razor", description: "Razor combines C# expressions and control flow with text templates. It supports ASP.NET views and layouts as well as hosted template generation outside a web application." },
  { slug: "model-view-controller", label: "Model-View-Controller", description: "An application structure that separates models, presentation, and the controllers coordinating interactions. Implementations determine how data and control pass between those roles." },
  { slug: "file-upload", label: "File Upload", description: "Transferring files from clients to servers, including file selection, multipart requests, progress feedback, and completion or failure handling." },
  { slug: "xmlhttprequest", label: "XMLHttpRequest", description: "The browser API for sending HTTP requests and receiving responses from scripts, including request bodies, upload events, and asynchronous completion." },
  { slug: "web-browsers", label: "Web Browsers", description: "Browser behavior, standards support, performance, and the controls people use to navigate and interact with websites." },
  { slug: "user-interface-design", label: "User Interface Design", description: "Arranging controls, content, navigation, and feedback around the tasks people need to perform." },
  { slug: "flash-player", label: "Flash Player", description: "Adobe's historical runtime for browser multimedia and interactive content, including video playback, SWF execution, and desktop or mobile integration." },
  { slug: "video-codecs", label: "Video Codecs", description: "Video encoding and decoding formats, including their compression, picture quality, playback support, and hardware requirements." },
  { slug: "http-range-requests", label: "HTTP Range Requests", description: "HTTP requests for selected portions of a resource, supporting partial downloads and seeking within media without transferring the entire file first." },
  { slug: "home-theater-pc", label: "Home Theater PC", description: "Using a general-purpose computer with a television and audio system for media playback, browsing, and applications, including display connections and remote input." },
  { slug: "online-video", label: "Online Video", description: "Delivering and watching video over the Internet, including picture quality, bandwidth, playback devices, and viewing experience." },
  { slug: "html5-video", label: "HTML5 Video", description: "Native video playback through the HTML video element, including controls, poster images, browser behavior, and supported media formats." },
  { slug: "video-posters", label: "Video Posters", description: "Representative images shown before video playback, including frame selection, custom thumbnails, and their presentation in video players." },
  { slug: "html-parsing", label: "HTML Parsing", description: "Reading HTML as a document structure to select elements and extract text, attributes, links, and other information." },
  { slug: "html-agility-pack", label: "HtmlAgilityPack", description: "A .NET library for loading and parsing HTML documents, navigating their nodes, and extracting information with selectors such as XPath." },
  { slug: "h264", label: "H.264", description: "The AVC video coding standard, including compression and playback characteristics, implementation support, and licensing distinctions." },
  { slug: "css", label: "CSS", description: "Stylesheets that control web presentation, including layout, positioning, overflow, colors, typography, and visual states." },
  { slug: "ftp", label: "FTP", description: "The File Transfer Protocol and its server configuration, including user access, directory isolation, and file-transfer permissions." },
  { slug: "authentication", label: "Authentication", description: "Establishing the identity of a user or client through credentials and configured identity providers before granting access." },
  { slug: "asp-net-web-api", label: "ASP.NET Web API", description: "The ASP.NET Web API framework for HTTP services, including ApiController routing, hosting, message handlers, formatters, and response construction." },
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

/** These pattern topics lead directly to their standalone teaching articles. */
export function tagHref(slug: string): string {
  if (slug === 'factory-pattern') return '/writing/factory-pattern/';
  if (slug === 'factory-method') return '/writing/factory-method-pattern/';
  return `/tags/${slug}/`;
}
