# LINQ: coverage and verification

Public source: https://www.youtube.com/watch?v=4sHcMxKwBZI.
May 3, 2020; duration 37:45. Complete raw transcript read in four bounded chunks.
Shared C# and Performance playlist entry; one article required.

## Coverage checklist before drafting

- Author loves LINQ and recommends wise use; compact syntax hides implementation
  costs. Keep business queries simple. Avoid clever code that even its author
  cannot understand later. Performance-critical loops should start simple.
- Original code-review problem: select customers whose first name is in any of
  three uppercase HashSets. Three customers, one match, two nonmatches.
- Benchmark baseline label versus author's independent simple-loop baseline.
  All methods materialize a List because this example requires one; query ToList.
- Multiple ToUpper calls with short-circuit OR. Up to three, not always three;
  exactly seven calls for the recorded three inputs versus three with a local.
- Query let reduces casing calls but introduces projection/anonymous carrier,
  Where and Select. Explain lowering, IL and older decompiler language settings.
  More IL alone is not proof of worse execution; do not assert universal timing.
- Historical let result slower than original despite fewer ToUpper calls.
- External comparer Contains overload, mutating UnionWith, lazy Concat experiments.
  Explain HashSet instance lookup versus Enumerable.Contains comparer overload.
- Statement lambda with local avoids repeated casing without let projection.
- foreach/for loops; ToUpper-free diagnostic changes result (zero instead of one).
  Therefore its timing difference is not a clean measure of casing cost alone.
- Array foreach lowers to indexing. IEnumerable static type changes lowering;
  saved source materializes List and uses IEnumerable field. Do not claim all
  foreach or for loops have a universal ranking, or all foreach needs finally.
- Historical results from different runs/machines must not be mixed into one ratio.
- Author's prescribed simple-loop default for performance-critical library paths,
  retain clear LINQ elsewhere. Extract method if loop obscures surrounding flow.
- Hands-on measurement is experience, independent of credentials; preserve aside.
- Claimed fixed ranking of dispatch kinds posed but never answered; not fabricate.

## Source evidence and scope

Original D:/Source/Repos/VariousBenchmarks/VariousBenchmarks/LinqWhereBenchmarks.cs
read in full. Working tree clean. HEAD 2d3a5b3425edd2ebcfe3907331ca0a4de59cec53.
Public GitHub repo matlus/VariousBenchmarks verified public, default branch master.
Current saved project targets net5.0, BenchmarkDotNet 0.12.1; this does not prove
the runtime used for an earlier recorded table. No README exists at checkout root.

Existing SelectMany and GroupBy articles read in full. They explain different
operations and examples; they do not duplicate this filtering-cost investigation.
Archived source and publication copies remain untouched.

Recovered source includes two assignments to _customersEnumerable in setup:
first ToList, then a separately constructed List with AddRange. Both are outside
benchmark methods. Adaptation can use one assignment and state that simplification.
The methods themselves retain original names, predicates and data.

Later frame comparison found that the first checkout is a newer variant. A second
checkout at D:/Source/Repos/matlus/VariousBenchmarks, HEAD
3e89244cec9d88bf347533b39333402b74809fa9, contains the recorded fixture:
three customers aaa/bbb/ccc; sets AAA/DDD/EEE, FFF/GGG/HHH, III/JJJ/KKK;
StringCaseInsensitiveComparer wrapping OrdinalIgnoreCase.Compare in Equals.
Its GetHashCode uses default string hashing, violating equality/hash consistency.
Article retains that actual source and explains why it must not be used to
construct a HashSet. The Enumerable.Contains comparer overload uses Equals here.
Second checkout has unrelated Program.cs edits and untracked IEnumerableVsList.cs;
all preserved, no edits made. LinqWhereBenchmarks.cs itself is clean.

The article was corrected from the newer fixture to the recorded fixture after
frame 07:33 confirmed the older data and comparer. Eleven checks passed for the
newer draft, then the full checks were rerun for the corrected final fixture.
All eleven final checks passed on .NET SDK 10.0.401: nine materialized result
comparisons, casing/mutating-set counts, and the empty no-casing result. Builds
completed with zero warnings and errors. These checks establish behavior, not
the historical timing results.

## Frames and historical result limits

- 07:33: exact fields, three sets, three customers and custom comparer.
- 11:19: query let/Concat implementations.
- 11:49: eight-row historical results and bar chart. Means transcribed in draft.
  Merge row mean 1884.4 contradicts ratio 1.12/rank6; those columns omitted with
  explanation. Allocations are historical and not independently reproduced.
- 15:06: emitted Func/anonymous type IL and delegate caching branch.
- 18:22: original Contains overload with custom comparer and UnionWith calls.

## Independent metadata review

Applied reviewed description. Existing tags linq, benchmarking, csharp.
Proposed subjects pending registry reconciliation/heroes:

- compilation / Compilation: Translating source code or intermediate instructions
  into executable code and metadata. Compiler transformations, specialization and
  code sharing determine what is produced before deployment or during execution.
- hash-sets / Hash Sets: Collections of distinct values organized for hash-based
  membership checks. Equality comparers, mutation and set operations determine
  their behavior and the work required for lookups.

Benchmark equality must be checked before timing. Use a fresh setup for each
variant so the mutating UnionWith case cannot contaminate another result.
New ordinal-ignore-case HashSet construction would be an additional experiment,
not a recovered source method, and differs from current-culture ToUpper generally.
