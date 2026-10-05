# Design article verification

This record distinguishes source coverage, executable checks and editorial
readiness. Unchecked work is not evidence of successful verification.

## Publication authorization, October 5, 2026

The owner approved publication of all six reviewed drafts. Publication copies
now live under `src/content/writing/` with `draft: false`; retained drafts remain
unchanged. Both date fields retain the original source dates. A fresh metadata
review of the six complete publication copies confirmed their descriptions and
tags without changes, and found no dependence on unseen video or screen content.
The preparation results below remain historical evidence. The
[publication register](../../design-series-publication.md) records the current
publication workflow and points to the PR's deployment and backlink receipts.

The subsequent image review confirmed that all six heroes depict specific article
concepts. Three source drawings were recovered and reproduced for publication:
the Adapter hierarchy, movie/genre relational model and SOLID system architecture.
The [diagram briefs](diagram-briefs.md) record exact comparisons and source
timestamps. Publication captions explain the diagrams directly without requiring
readers to watch the recordings. Original preparation drafts remain unchanged.

## Adapter Pattern and RabbitMQ

Source: `xHDoQvhW9VQ`, public calendar date 2020-06-21, checked in the expanded
YouTube description. The complete timestamped transcript was read. Public code:
[Adapter-Design-Pattern-Message-Brokers](https://github.com/matlus/Adapter-Design-Pattern-Message-Brokers),
checkout `e5a4eac`, with code introduced in `4c72a6b` on 2020-06-21.

Coverage checklist established before drafting:

- Adapter intent; interface means public surface; client, base, two concrete
  adapters, owned adaptees; distinguish patterns by intent and context.
- Subsetting a large API and decoupling are separate motivations; charting,
  libraries, infrastructure and Configuration Provider examples.
- Familiar connector examples and Alexa's voice-to-device adaptation; the
  client chooses its contract, even in a new application.
- Message shape, native/custom properties, comparison of providers, willingness
  to revise the design; include the creation date added to repository code.
- Publisher base and protected core; two mappings; Task versus async;
  constructor consistency is a choice rather than inherited signatures.
- Subscriber base, callback, owned event data, acknowledgement token and
  cancellation; mapping in both directions; provider cleanup.
- Factory versus Factory Method; keep concrete selection away from the caller.
- Local/remote broker choice, preconfigured topology and identical application
  behavior; local tests do not establish provider-specific equivalence.

Visual evidence: inspected the UML slide at approximately 2 minutes. It has
Client, Adapter (interface), Implementation 1/2 and Adaptee 1/2, with separate
inheritance and composition relationships. Source markers must not be silently
reinterpreted as data-flow arrows. New explanatory figures can instead state
their relationship types explicitly and be identified as new illustrations.

Current factual qualification: Microsoft now documents a Service Bus emulator.
The historical absence of an emulator must not be repeated as present-day fact.
RabbitMQ documents that delivery tags are scoped to the receiving channel.

Historical implementation limits observed in the repository: RabbitMQ publishes
without publisher confirms; Service Bus acknowledgement discards CompleteAsync's
Task; asynchronous cleanup is not awaited by the public Dispose contract. Do not
claim that the sample proves durable delivery, completed settlement or shutdown.
Do not run the repository's configured remote connection. Connection settings
are excluded from article excerpts and local verification fixtures.

## Builder Pattern and C# Expressions

Source: `lEqPX6_Q-qw`; complete raw transcript read before drafting. The public
repository is [Builder-Pattern-and-CSharp-Expressions](https://github.com/matlus/Builder-Pattern-and-CSharp-Expressions).

Coverage checklist established before drafting:

- This is a test-data builder, distinct from the GoF Builder; preserve the
  author's strong recommendation to keep this style out of production code.
- Rework the design from usage even when experienced; configuration-provider
  tests require deliberately invalid inputs among otherwise valid defaults.
- Immutable Device and DeviceServiceSettings models, required constructor
  arguments, valid devices, normalization and optional proxy scenarios.
- Optional arguments lose explicit null; fluent methods; Action on immutable
  models fails; Action on a mutable builder plus setter flags restores three states.
- Expression trees describe code rather than executing it; member selection,
  parameters, member name and generic value type; LINQ provider translation.
- Dictionary key presence distinguishes absent, explicit value and explicit null;
  nameof keeps Build connected to the model; model construction still needs upkeep.
- Build, With and BuildWithDefaults; nested DeviceBuilder; JSON stream input to
  real configuration provider; source tests normalize URL and obtain proxy from
  AppSettings rather than DeviceService.

Limits to retain: direct member selection is the intended expression shape and
the original cast does not validate arbitrary selectors; With shares the device
collection; randomized unused defaults are still evaluated in the original code.
The article's small default generator is a disclosed teaching adaptation, not a
claim to reproduce the historical random distribution.

## Creating Instances, Using Inheritance

Complete transcript and existing Drive book manuscript read before drafting.
Public watch page confirms December 13, 2020. The discussion does not walk through
a particular repository. The manuscript's MovieService examples are supplemental;
the current public repository was inspected, and illustrative code must be labeled
accordingly rather than attributed to the 2020 recording.

Coverage: reasons for instances; state-only DTOs; reuse inheritance versus
polymorphism; legitimate DTO polymorphism; stateless behavior and static classes;
delegates; composition and aggregation; DI and mocking pressure; testing composed
behavior; instance allocation; sealed/static intent; broad, shallow hierarchies.
Keep the criticism of inheritance for reuse firm. Do not claim static enforces
statelessness or guarantees faster execution. MovieManager itself is an instance
class in the supplementary source and owns collaborators; do not call it static.

## Abstraction in Software Design

Complete transcript read before drafting. Coverage: precision rather than vague
generality; too much/too little is contextual, not a midpoint; visible duplication
before premature generalization; boolean switches and polymorphism; abstraction
without a base class; publisher/subscriber separation; domain-owned arguments and
results; two-way broker mapping; Cosmos DB and charting examples; SQL/schema leaks;
business operations rather than table CRUD; Gateway/Facade intent and placement;
undoing a bad abstraction. Do not conflate abstraction with inheritance.

The existing abstraction manuscript combines this source, the later examples
video and a Code Reviewer video. It was read as supplementary material; the
article scope follows this source only. Public date confirmed February 13, 2021.
The small Video/IVideoStore listing is an explicit illustrative contract, not an
unrecovered Cosmos DB repository excerpt. Publisher accessibility remains internal.

## SOLID IS OLD

Complete transcript read before drafting; public date February 21, 2021.
Coverage: preserve the critique of SOLID as a certificate of design quality;
O/L/D and polymorphism without claiming formal equivalence; separate dependency
direction from calls; define high-level by protected domain policy, not screen
position; both clauses of DIP; salt analogy for contract quality; system perimeter
and one-level-down convention; selective inversion at seams; GetShowsForChannel,
domain model, command factory, stored procedure and reader mapping; replaceable
details without automatic hierarchies. Omit the source's uncertain 1970s dating of
Martin's paper. Primary paper verified as 1996. MovieService is linked in the
description, but the TV/show application is not identified as that repository.

## Abstraction in Software Design With Examples

Complete transcript and shared supplementary manuscript read before drafting;
public date February 28, 2021. Coverage: caller perspective versus encapsulation;
List array, resizing, capacity and sorting; compose domain collection and map;
StateMessages vocabulary and method versus indexer; three movie endpoints and
orchestration moved into Gateway; domain Genre versus vendor Category; alternate
relational service and database joins; stored-procedure boundary; HTTP and database
failure translation, inner exception and recognized-only handling; useful and
expressive operations without speculative generality.

Factual repairs: List<T> is not a subclass relationship merely because T is Movie;
array growth does not require prime capacities. Repository ImdbServiceGateway
combines enumerators by position, not by title; equal order and length are an
assumption. Unknown database exceptions are rethrown, so the sample does not
promise complete exception isolation. Translate only recognized failure semantics.

## Completed preparation, October 4, 2026

All six source coverage lists above were checked against the finished drafts.
The repository blog-writing skill, its voice and spoken-teaching references, and
the standalone teaching-article prompt were applied. The two abstraction articles
retain separate scopes despite the combined supplementary manuscript. No source
export or existing manuscript was changed.

The Builder source checkout is `1aa9523a8edc0aeaf1b65c9203e8297d44512252`;
MovieServiceYouTube is `0260b67c4540f2ab78dcdd2edc986d48513a19fc`.
All six expanded public watch descriptions supplied the historical dates listed
in the preparation register. Both article date fields equal those dates, as the
owner requested. Generated HTML metadata and Markdown retain the same dates.

The metadata sub-agent reviewed all six complete drafts against
`prompts/extract-description-and-tags.md`. Its descriptions and reconciled tags
were applied. New topics are Message Brokers, Expression Trees and Dependency
Inversion. Dependency Inversion and Dependency Injection are distinct concepts;
their intentional similarity is recorded in the tag checker's existing
`DISTINCT_TOPICS` mechanism. All three new topics have a saved prompt and WebP hero.

### Executable code checks

The external workspace contains `prepare-code-checks.mjs` and
`verification/code/CodeChecks.csproj`. The extractor takes the complete teaching
listings from the actual draft files. The harness also compiles the historical
broker implementations with RabbitMQ.Client 6.1.0 and Microsoft.Azure.ServiceBus
4.1.3, and exercises the original Builder repository's configuration provider.
It excludes the broker program and configured factory.

`dotnet run` under .NET SDK 10.0.401 completed 34 grouped behavior checks:

- Builder defaults, explicit null, successive overrides, With, shared collections,
  language defaults and unsupported expression shape; real JSON configuration
  binding, trailing-slash normalization, AppSettings proxy and missing URL.
- Static validation of valid, null, empty-title and invalid-year movie models;
  a common caller dispatching to two concrete store implementations.
- State/message lookup, existing and repeated-key rejection, and absence of
  partial mappings after rejection.
- Title-based movie mapping across differently ordered responses, missing and
  duplicate fragments, unknown category and an empty catalogue.
- Three gateway requests starting before any response completes, combined domain
  results and translation of an unsuccessful HTTP status.
- Adapter contract forwarding, callback and acknowledgement flow, cleanup and
  the mutable byte-array limit of a getter-only message model.

HTTP used an in-memory handler. No broker connection or database procedure was
executed. These checks establish compilation and the named behaviors; they do
not establish remote delivery, settlement, shutdown, SQL execution or production
resilience. The illustrative SQL and unavailable TV application remain qualified
in the articles. The historic packages restore with advisory warnings for
Newtonsoft.Json 10.0.3 and IdentityModel 5.4, plus obsolete exception serialization
warnings. Compiling the old examples is not a recommendation to deploy those
dependencies.

### Assets and rendered review

Six article heroes and three topic heroes were generated from complete saved
briefs, visually inspected and converted to WebP. Five pastel SVG diagrams were
rendered and visually inspected for labels, clipping and relationships. Their
article captions identify them as new explanatory figures. The Adapter source
slide informed the relationship checks; the new figure does not claim to be a
copy of that slide.

The isolated preview activates only copied drafts and provides a review gallery
at `http://127.0.0.1:4323/review/`. All six HTML and Markdown routes, heroes and five
figure assets were verified. The browser review covered the gallery, desktop
article layout, mobile headers for all six, light/dark styling and an inline
gateway figure. The mobile harness uses a 390px iframe with a 375px content area
after the scrollbar: every article reported a 375px document width, with no
horizontal page overflow.

Historical feed placement was checked in generated HTML. Among 118 preview
articles, the six occupy home-feed positions 51, 50, 48, 47, 46 and 45 in the
register's order; Writing positions are 35, 34, 31, 28, 27 and 26. None is promoted
to the latest six. `verification/rendered-content.json` and
`verification/feed-positions.json` in the external workspace retain the receipts.

### Site and writing checks

All required checks completed successfully:

| Check | Result |
|---|---|
| Main and isolated-preview `npm run typecheck` | 0 errors, 0 warnings, 34 existing deprecation hints |
| `npm run test:links` | 6 of 6 tests pass |
| Main `npm run build` | 316 pages built |
| Isolated-preview `npm run build` | 322 pages built, including the six articles |
| Repository copy audit | No hard errors; advisory flags reviewed in context |
| Blog clarity audit on the six drafts | No punctuation errors; the ordinary use of "navigate" retained |
| `python tools/check-tags.py` | 176 tags; no unresolved duplicates or missing topic art |
| Generated-link checks on main and preview builds | Local targets and external-link policy pass |

The source collection remains unchanged. All six retained drafts have
`draft: true` outside `src/content/writing/`. Owner review is the next step;
publication, source backlinks and the deferred Service Interface Layer article
have not been performed.
