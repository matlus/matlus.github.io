# Remaining Performance articles: evidence and verification

Prepared October 4, 2026. Six separate videos produce six separate drafts.
The earlier LINQ video remains a different published article. This batch is
preparation for owner review. The owner subsequently approved publication,
commits and the video/repository backlink workflow; see the
[publication register](../../performance-articles-publication.md).

## Dates and sources

The signed-in public YouTube watch pages were opened and their descriptions
expanded. Both frontmatter dates equal the displayed original calendar date.
Saved export upload dates disagreed for Part 2 and Logging; the public calendar
date controls. There is no UTC conversion of that date.

| Draft | Public video ID | Both dates |
|---|---|---|
| `dotnet-memory-allocations-part-2` | `Ge0tyJqdhxY` | 2019-08-17 |
| `benchmarking-dotnet-applications` | `KDkB_lu5Ng8` | 2019-11-27 |
| `aspnet-core-web-api-by-hand` | `2AQld3TLMac` | 2020-04-26 |
| `csharp-one-to-many-mapping` | `e27RquJS_Tc` | 2020-05-17 |
| `to-linq-or-not-to-linq` | `D1m-RIWFrhM` | 2021-03-28 |
| `high-performance-logging-custom-objects` | `mxlh1v-2S1U` | 2022-01-16 |

Raw transcripts, an existing benchmarking manuscript, recording frames, original
workbooks, extracted values and executable checks are retained in the private
local source workspace. Private transcript identifiers are excluded from this
public record. Full transcripts were read before drafting.

Public code snapshots inspected:

- [VariousBenchmarks](https://github.com/matlus/VariousBenchmarks),
  `7fb4e2cb6225e8018ec5e62b4b05d3c1c16b03ca`.
- [OneToManyMapBenchmark](https://github.com/matlus/OneToManyMapBenchmark),
  `e3881c6182351e01624481e3fd2251d78d2257a0`.
- [HighPerformanceLoggingAndInMemoryLogger](https://github.com/matlus/HighPerformanceLoggingAndInMemoryLogger),
  `7cbbfd349d3ddf473b85b4b3768d9a7b90a69e71`.

All three repositories were confirmed public. The API demonstration's complete
matching public repository has not been identified; no repository URL is invented.

## Source coverage and resolved conflicts

| Article | Source coverage | Qualification retained in the draft |
|---|---|---|
| Memory Part 2 | Network trips, pipeline overlap, instruction throughput, prediction, cache hierarchy, cache lines, traversal order, compact working sets, false sharing and measurement | Historical CPU capacities and throughput are illustrative; inclusion is architecture-specific; NUMA is a separate concern; row-first depends on layout; graph bends alone do not prove cache causes |
| Benchmarking | Baseline correctness, profiling, setup, parameters, Release execution, reports, allocation, strings, arrays/dictionaries, concatenation and production validation | Original equality inputs have different lengths; comparison semantics differ; setup scope, collection-count normalization and historical crossover limits are explicit |
| API by hand | Motivation, shared movie operation, controller path, terminal delegate, paths, JSON response and reported result | Handler frame recovered at 07:57; helper body and exact benchmark-client revision not recovered; local client uses different HTTP/HTTPS endpoints; client allocation does not prove server allocation; omitted HTTP behavior is described |
| One-to-many map | Contract, two relational models, common tests, four implementations, original workbook and allocations | Duplicate incoming values expose partial updates; actual benchmark uses all successful lookups and increasing batch sizes; suspect 300-value timing omitted; allocation column's input size is not established |
| LINQ | Actual six-customer fixture, all ten candidates, local reuse, let, comparer overload, merge, concat, loops, allocation and production choice | Explicit comparer selects Enumerable.Contains; Concat does not mutate; UnionWith mutates; foreach source is a List containing the same objects; two no-uppercase candidates return the wrong result |
| Logging | Application adapter, generated methods, event identity, reported provider failure, generic Log, DTO state, enabled guard, formatter and Application Insights | net5 target uses 6.0 logging packages; SkipEnabledCheck defaults false; TState has no list constraint; state allocates; shared arrays can produce inconsistent snapshots; old Event Log failure has no reproducible cause |

The original logging project's unrelated `LogInformation` method forwards to
`LogWarningCodeGen`. The article does not recommend or reproduce that method.
This is retained as a sample limitation, not repaired in the external repository.

## Executable verification

Forty-eight grouped behavior checks pass on .NET 10.0.12:

- Four original mapping implementations: lookup, missing-value exception,
  extending a key, and no mutation on pre-existing-value conflict.
- Incoming duplicate behavior observed for all four implementations; dictionary
  partial insertion followed by ArgumentException reproduced explicitly.
- All ten original LINQ methods: exact result and source-set mutation checked.
  The two no-uppercase candidates return empty results; only UnionWith changes
  the verified set. Normal methods return aaa, bbb, ccc.
- HashSet configured with OrdinalIgnoreCase accepts the lowercase lookup.
- Rectangular matrix traversals have identical sums and different visit order.
- Original BlogLogState and matching adapter method: disabled level bypass,
  enabled level/event ID, eight fields, formatter context, shared-array mutation.
- Recorded middleware fragment, with the unavailable domain operation stubbed:
  accepted paths, case comparison, POST behavior and default unmatched response.

Benchmark attributes were stubbed in the behavior-only harness; original method
bodies were linked unchanged. No timing or allocation benchmark was rerun.
Historical benchmark numbers remain labeled as source measurements.

Separately, the draft's BenchmarkDotNet class/runner and LoggerMessage example
compile against BenchmarkDotNet 0.12.1 and Logging.Abstractions 6.0.0 with zero
warnings and zero errors. This checks actual package APIs and source generation.

## Figures and art

Nine inline SVGs are explicit source recreations or labeled explanatory additions:

- Cache hierarchy: four cores, four split L1 pairs, four L2s, shared L3, DRAM,
  two pipeline labels, original capacity and instruction-rate annotations.
- Rectangular traversal: new explanatory 3-by-4 example; both sums are 78.
- Benchmark case lifecycle: new simplified explanatory sequence.
- Mapping groups: source slide 6, messages 1–4 and values 1–10, original groups.
- Mapping relational models: source slides 8–9, table/column names and constraints.
- Mapping benchmark chart: Matplotlib, exact selected original workbook values,
  numeric x axis and labeled logarithmic y axis. Article includes a readable table.
- API pipeline: new conceptual comparison; shared application operation retained.
- LINQ conversions: new fixture-derived count, 15 baseline calls versus 6.
- Logging state: new flow showing the enabled guard, eight fields and provider.

All figures were rendered together and inspected for clipping, relationships,
counts and legibility. Six article heroes and three distinct topic heroes use
the built-in imagegen tool, with saved prompts and optimized WebP assets.
Hero scenes are evocative metaphors rather than factual hardware schematics.

## Editorial and metadata review

The blog-writing skill and its clarity, voice and spoken-teaching references were
applied. The independent metadata agent read all six complete drafts and the tag
vocabulary using `prompts/extract-description-and-tags.md`. Reconciled new topics:
CPU Caches, One-to-Many Mapping, Adapter Pattern. Other tags reuse existing topics.

Targeted writing audits: no punctuation errors and no hard copy errors. Retained
review terms are the Xeon Scalable product name and benchmark harness terminology.
The API fragment's completeness qualification is substantive. Site and rendered
preview verification results are recorded in the current preparation register.

## Publication follow-through

After owner approval, copy the reviewed drafts into the publication collection,
set draft false, verify both historical dates, and run the required checks. Verify
Pages against the merge SHA and the canonical HTML/Markdown. Then add each article
to its source video's existing description; add repository backlinks for the
three public samples. Keep the API repository match unavailable unless recovered.
