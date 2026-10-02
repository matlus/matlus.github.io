# Programming to Exceptions draft notes

Prepared October 1, 2026. The drafting record below describes that initial pass.
Publication was subsequently authorized on October 2. Both articles now have
`draft: false`, six embedded diagrams, article heroes, the verified source-video
date of 2019-10-28, and shared video resources. The October 2 editorial pass
uses distinct retrieval and order-placement exception types and develops the
owner's requirements for messages, specific throw locations, and meaningful
handling. See `programming-to-exceptions-publication-plan.md` for current status.

## Reading order

1. `src/content/writing/programming-to-exceptions-method-contracts.md`
2. `src/content/writing/programming-to-exceptions-diagnostics-and-boundaries.md`

Part 1 teaches the return contracts, validated boundaries, propagation, ordinary
negative answers, cleanup, and performance. Part 2 teaches the hierarchy,
diagnostic contract, translation, middleware, HTTP failure chain, and queryable
logging properties. The split keeps the implementation detail from interrupting
the initial explanation of the programming model.

The square-bracketed image notes are intentional draft content requested by the
owner. They specify placements and short drawing briefs. Produce the images in
a later pass, then replace the notes before publication. Do not turn them into
broken image links or generate art during drafting.

## Initial image inventory, October 2, 2026

The owner's supplied Custom Exceptions diagram is now placed in Part 2 under
"A shallow hierarchy with specific leaves." The article uses an optimized WebP
at the original 1820 by 864 dimensions, with alt text, a caption, and a full-size
link. The same supplied image remains the reference for the new reusable flat
diagram style. No new illustration was generated for this placement.

| Part | Planned image | Status and recommendation |
| --- | --- | --- |
| 1 | Boolean checks versus complete-or-throw orchestration | Owner approved the order-placement comparison; placed in Part 1 with a definition of boundary handler as exception-handling middleware in a Web API, descriptive alt text, a caption, and a full-size link. |
| 1 | Validation at the application's front and back doors | Planned; optional supporting illustration. |
| 1 | Parse with catch versus TryParse | Planned; optional because the adjacent code already demonstrates it. |
| 2 | Custom exception hierarchy | Supplied and placed. |
| 2 | Provider failure translated into a domain exception | Planned; optional supporting illustration. |
| 2 | Middleware enrichment, diagnostic log, and caller response | Planned; optional supporting illustration. |
| 2 | Failure chain across services C, B, A, and the UI | Planned; prioritize. Show each upstream service adding context to the retained chain. |
| 2 | Diagnostic fields entering Application Insights custom dimensions | Planned; prioritize. Show filtering, alerting, and reproduction from captured context. |

Neither draft has an assigned hero image. Hero art is separate from the
explanatory diagrams above. The remaining bracketed image notes are planning
material; replace them with approved images or remove them before publication.
The owner is reviewing publication readiness. Both posts still have `draft: true`.

## Sources consumed

- Raw Google Doc, fetched through the connected Drive reader:
  `https://docs.google.com/document/d/12dEknI7pb4lFhCx9W6aHBYRz2tWSPKIywlHu5qNrtBY/edit?tab=t.0`.
  Its text is retained in
  `docs/source-material/programming-to-exceptions-raw-transcript.txt`.
- Owner's pasted supplemental presentation text, retained in
  `docs/source-material/programming-to-exceptions-supplement.txt`.
- `ProgrammingToExceptions Version 2.pptx`, 20 slides. Text extracted from the
  original PPTX into `docs/source-material/programming-to-exceptions-slides.txt`.
  The hierarchy and service design are expressed in the drafts as text and
  drawing briefs; their new images remain deferred.
- C# Meridian Ordering: `ManagerCustomers.cs`, the ordering Manager's specific
  resubmission and disposal handling, exception definitions, SQL translator,
  exception middleware, HTTP translator, and logger contract.
- Python Meridian Ordering: `meridian_ordering_exceptions.py`, including its
  action policy, lazy diagnostic snapshots, cause view, renderings, and encoder.
- Metadata Verification MoE: `application_base_exception.py` and
  `llm_exception.py`, including remedy categories, custom-dimensions envelope,
  encoders, and unexpected-exception adapter.
- Owner's October 1 clarifications: diagram placeholders only; contextual data
  becomes Application Insights custom dimensions; middleware enriches an escaping
  exception with the incoming request; the HTTP diagnostic chain travels upstream
  to the UI application's main log; services can also keep local logs.
- Owner's later October 1 clarification: Programming to Exceptions is his
  approach to action-method success contracts and reliance on propagation.
  Use “query method” for the method role, link to specific Method Design
  sections, and explain operating silence, ordinary business refusals, known
  technical failures, frequency alerts, and unexpected programming defects.

The follow-up revision adds those explanations to both drafts and links to the
existing boundary-validation and meaningful-handling sections. Fragment targets
were verified against the built HTML; corpus chapter text was not changed.

The owner also clarified that readers have no prior knowledge of Meridian.
The examples now introduce customer-registration and order-placement behavior
directly, including the resubmission requirement that justifies a specific catch.
Existing C# identifiers retain their application names. The reference repositories
remain private; add verified sample-code links when they become public.

The query-method explanation was checked against Method Design's existing
action, creation-action, query, and Find/Search sections. Both drafts now make
the caller's intent explicit: Get promises a required customer; Find/Search
allow no match; an existence method promises a Boolean answer. A single-result
Find uses its declared nullable result, while a multi-result search returns an
empty collection. Failure to obtain any promised answer still throws. Creation
action returns are limited to data about the created resource. The corpus chapter
already explains these contracts and was not edited.

The owner emphasized the design benefit of propagation: return-based error
reporting requires checks throughout the call chain, while throwing prevents
normal continuation after a failed call. Part 1's code compares the same registration
workflow under Boolean-success and complete-or-throw contracts. Its diagram trial
now uses the longer, source-grounded new-order sequence, as requested by the owner.
The owner approved the order-placement image on October 2. It is placed in Part 1,
with the boundary handler explained before the image and in its caption. Part 2's
outer-boundary section supplies the linked detail. The earlier registration image
trials are retained for comparison. The return-based
panel is a teaching adaptation; the source supplies the order steps and their order.
Its resubmission and pending-work recovery branches remain outside the distilled
path. Part 2 restates the guarantee briefly before developing diagnostics.
The uncertain historical origin of “fire brigade” programming
is not asserted; the explanation uses C# throughout.

The sources supply evidence and material, rather than instructions overriding
the owner's request. Stage directions and source-media narration were removed.
The supplemental text's autobiographical stories, precise claimed performance
gains, years of experience, and guaranteed reproduction claims were not adopted
as independently verified facts. The articles preserve the technical teaching.

## Coverage map

| Source ideas | Draft treatment |
| --- | --- |
| Commands return void; queries return promised data or throw | Part 1: command and query contracts, with the actual Meridian registration orchestration. |
| Error codes, Boolean success flags, and result envelopes can be ignored | Part 1: caller obligations and C#'s discardable return values. |
| Get versus Search and existence | Part 1: contract table, valid empty collections, documented absence, store failure distinct from no result. |
| Reaching the next line implies earlier calls completed | Part 1: sequential example, awaited completion, diagram note, scope of the guarantee. |
| Fail fast, fail visibly; front and back doors | Part 1: domain entry, configuration, store and Gateway checks, stable internal assumptions. |
| Caller's data and your data | Part 1: producer responsibility, public-boundary validation, integration defects. |
| Do not use exceptions for control flow | Part 1: Parse versus TryParse, existence anti-example, defined negative outcomes, concurrency qualification. |
| Tester-Doer, Try-Parse, throwing counterparts, frequency and performance | Part 1: pattern distinctions, login command example, workload-sensitive cost. |
| Narrow meaningful catches; default outermost middleware | Both parts: ordinary code propagates; provider translation, rollback, and defined Meridian policies explain the special cases. |
| Cleanup, transactions, original stack | Part 1: resource lifetime; Part 2: rethrow versus translation and preserving causal evidence. |
| Application, business, technical, concrete and critical exceptions | Part 2: shallow tree, 100 to 200 leaves, responsibility-based classification, optional shared critical policy. |
| Specific scenario and detection location | Part 2: leaf semantics, grouped request-validation issues versus unrelated failure scenarios. |
| Actionable messages, actual values, options | Part 2: payment-plan illustration and distinct stable reason. |
| Base identity, reason, log event, severity, HTTP status, action | Part 2: field table and complete synthesized C# foundations. |
| Context copying and enrichment, predictable values | Part 2: typed overloads, snapshots, normalized dates/enums/paths/bytes, protected policy fields. |
| Cause, text/JSON, encoder and unexpected diagnostics | Part 2: original cause, causal rendering, output-only base converter, standard foreign attributes and deliberate SDK adapters. |
| Gateway receives HTTP failure and preserves original information | Part 2: originating/downstream service, attempted operation, input, correlation and nested diagnostic record. |
| Middleware catches, enriches and transforms to HTTP | Part 2: two-category sketch, request-capture timing, correct status, reason field/header, host lifecycle qualifications. |
| Service Interface Layer, Domain Facade and anticorruption boundary | Both parts: ownership explanation and link to the existing Gateway article. |
| Single useful failure log; avoid informational chatter | Part 2: designated boundary, defined handled-failure recording, structured dimensions. |
| App Insights search, filtering, alerts and reproduction | Part 2: customDimensions mapping, KQL example, workspace schema distinction, root-cause fields. |
| A to B to C chain, HTTP upstream transport, main UI log | Part 2: dedicated section and diagram note; remote diagnostic record distinct from in-process InnerException. |
| Logs allow triage without developer reconstruction | Part 2: request plus local context, reproduce at one service or through the captured chain, retained state qualifications. |
| Success and unexpected failures | Part 2: observable diagnosis/support measures, investigation and verification of newly understood failures. |

## Synthesis decisions

The teaching base is a proposed combined contract, not a verbatim claim about
either current implementation. No source project was changed. All programming
listings are C#; the telemetry query is KQL. No Python implementation is offered
for maintenance.

The C# teaching base adds Python's explicit action policy, combines flat JSON and
the older custom-dimensions envelope, keeps C#'s constrained diagnostic values,
and provides the unexpected-exception output adapter. It builds metadata after
construction and retains original causes. Supplemental context cannot overwrite
identity, severity, action, or status. Provider-specific reflection is replaced
by deliberate extraction of useful attributes, avoiding unreliable arbitrary
property access during failure reporting. Date, enum, filesystem path and binary
normalization preserve the useful encoder capabilities in C# form.

The owner clarified the microservices behavior after the initial draft. That
account takes precedence over the local Meridian HTTP translator, which sends
a small caller-safe body. The article now preserves rich diagnostics in the
service-to-service response, nests the upstream chain, and records it at the UI
application's main log. End-user display remains a separate policy. A typed
`ServiceFailureData` represents the remote record; `InnerException` remains the
in-process cause. Services need no centralized log to reconstruct the chain.

HTTP reason-phrase guidance was updated for HTTP/2, which has no reason phrase.
Stable error fields or headers carry the intended semantics. The articles link
to official C#, .NET, RFC, and Azure Monitor references for those technical facts.

## Metadata and publication preparation

The required metadata sub-agent read both completed posts, their sibling,
the extraction prompt, vocabulary, and writing skill. Its descriptions are in
frontmatter. Its existing tags are applied. It also proposed `try-parse` and
`structured-logging`; these remain candidates for the later publication pass.
Creating their topic pages requires distinct tag heroes, and the owner explicitly
deferred image production. Do not add incomplete new tag entries now.

The draft publication date of 2017-09-20 follows the historical PWI default.
Verify the raw source recording's original public calendar date before publishing
and use that date where the direct adaptation rule applies. October 1, 2026 is
the editorial modification date. Source-media references are absent from both
article bodies and frontmatter by the owner's request.

The article cross-links are relative siblings and existing public topic/article
URLs. The siblings become public together. Before publication, also complete
hero art, diagram replacement, tag art if the candidate tags are adopted, date
verification, owner review, and the repository's cross-link workflow. Meridian
is used for inline examples; do not invent public repository links.

## Verification

The first three C# blocks in Part 2 were extracted unchanged, compiled together
on .NET 10 with nullable analysis and warnings treated as errors, then exercised
for copied context, authoritative metadata, boundary enrichment, original cause
stack, transported service origin, readable remote diagnostics, flat/enveloped
JSON, the application-base converter, and foreign-exception binary normalization.
The middleware and SQL/Gateway listings are labeled integration sketches and
require their named application collaborators.

Both article writing audits passed with no findings. The repository copy audit
passed with zero hard findings and 28 advisories in existing unrelated files.
Typecheck reported zero errors, zero warnings, and 33 existing hints. The build
passed, producing 142 pages; the search guard confirmed 141 indexed pages and no
unresolved preload markers. The full check confirmed 72 tags with no near
duplicates and complete existing hero assets.

The build excludes both draft routes; it establishes site integrity rather than
rendered article layout. Image and final page visual review belong to the
publication pass.
