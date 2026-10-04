# The StringBuilder Myth: coverage and verification

Public source: https://www.youtube.com/watch?v=B71rabZtWWI.
April 6, 2020, duration 35:50. Complete raw transcript read in four bounded chunks.

## Coverage checklist before drafting

- Distinguish fixed concatenation, growing one result across loop iterations,
  and repeated reassignment called mutation in the teaching terminology.
- Six-string plus, string.Format, interpolation, repeated += examples; exact
  Hello / World. / How / Are / You / Doing? data from original source.
- Compiler lowering to Concat string array, Format object array, four-argument
  Concat after reducing interpolation. Scope historical lowering; current C#
  interpolation handlers and target-dependent paths must not be misrepresented.
- Immutable string means existing public string content stays unchanged; +=
  constructs replacement, copies prefix and appended data, reassigns reference.
  Interned literals need not become garbage. Repeated accumulation allocates
  intermediate results; do not repeat claim allocations same as single concat.
- Copying cost as well as eventual GC; bump-pointer allocation can be cheap but
  is not free and does not erase downstream costs.
- DTO ToString fixed pieces: author recommends + or interpolation over reflexive
  StringBuilder. Repeated calls to that method are not one accumulating result.
- Inside loop, result after all iterations; StringBuilder append vs growing +=
  and Concat. Fixed Concat and Join when all parts already available.
- Original 2..10 inputs of length50; graph time and allocations. Preserve exact
  graph values only after recovering workbook/frames; no invented benchmark.
- StringBuilder pre-.NET4 string buffer versus .NET4 chunk representation;
  internal writable construction does not remove public string immutability.
- Chunk diagram original labels/arrows must be recovered. Actual m_ChunkPrevious
  points backward; normal 8000-character growth heuristic is not 8KB hard limit.
  ToString allocates and copies final contiguous string; large results may be LOH.
- Cache Acquire/Release thread-local ownership, Clear, size cap360; cache is internal
  runtime implementation, not public API. Copied sample shown/proven with bounds.
- Capacity units are characters. Sample NumberOfStrings * StringLength * 2 is
  preserved as historical expression but factor2 is unnecessary, not UTF16 math.
- With length50, requested capacity100N fits360 only at N2/3. N4..10 do not reuse
  through this cache; differences include pre-sizing rather than caching alone.
- Original StringJoin uses NUL separator and StringFormat spaces: unequal outputs.
  Explain these limitations rather than presenting every row as equivalent.
- Preserve author's rule scoped fixed-expression vs accumulation, and interest
  in surprising Join performance. Do not replace with generic neutral summary.

## Recovered local sources

Read full StringConcatVsMutate.cs, StringConcatenationBenchmark.cs and
StringBuilderCache.cs from older VariousBenchmarks checkout at
3e89244cec9d88bf347533b39333402b74809fa9. Same public repo already verified for
LINQ. No source edits. Randomizer fixture and recorded code frames pending.

StringBuilderCache is attributed Microsoft reference-source copy. Article should
link official source and use a compact explanation or labeled adaptation rather
than silently relabeling copied framework code as Shiv's own implementation.

## Completed first draft and checks

Full Randomizer.cs read. Original setup generates fifty-character ASCII strings.
Verification replaces only that setup generator with deterministic x characters
of the requested length, removes BenchmarkDotNet attributes from temporary copies,
and leaves original method bodies/cache implementation unchanged. No edits to
either source checkout. Article method snippets extracted and compiled too.

.NET SDK 10.0.401 Release build: zero warnings/errors. Twelve grouped checks pass:
four original six-string methods; nine groups for counts2..10 checking all seven
equal-output methods, Join NUL separators, Format spaces, cache identity and
cleared length; four article methods; original string unchanged after +=.
These are behavior checks, not fresh benchmark measurements.

Workbook ArrayVsDictionaryBenchmark.xlsx, String Concatention!A1:L9, read without
changes. All 72 timings and eight allocation values match frame25:05. Chart
recreated using Matplotlib with exact source values and visually inspected.
Allocation columns apply to ten inputs as explained in the transcript. No Gen0
counts repeated as collections per individual invocation. Original label
StringBuilderLoopCached retained in chart; source method is StringBuilderCachedLoop.

Frame11:15 confirms reduced four-string interpolation lowers to
String.Concat(string,string,string,string). Frame14:59 shows initial HELLO
diagram; full allocation/result animation recovery still in progress.
Recovered final frame17:10: upper5 HELLO, lower11 HELLO WORLD with a blank space
cell, five downward copy arrows. Authored SVG preserves all cells/arrows and
uppercase labels; PNG preview inspected. Initial animation state need not be
published separately. Chunk discussion frames show spoken gestures rather than
a recovered labelled chunk diagram; article explains verified previous links
in prose without inventing a source figure.

First draft is standalone, keeps fixed-vs-growing teaching sequence, qualifies
historical lowering, extra prefix allocations, interning, chunk sizes in
characters and backward links, capacity factor2 error, cache threshold, output
inequality. Both writing audits have zero flags. Hero generated and optimized,
saved with prompt. Final site render and crop acceptance pending.

## Independent metadata review

Reviewed description applied. Existing tags benchmarking and csharp.
Proposed tags pending registry reconciliation and topic heroes:

- string-concatenation / String Concatenation: Combining strings into a single
  result. Fixed expressions, repeated concatenation, formatting and compiler
  transformations determine intermediate values, copying and allocations.
- stringbuilder / StringBuilder: The .NET type for accumulating characters in
  mutable construction storage before producing a string. Append operations,
  capacity, chunk growth and final copying determine its behavior and costs.
- compilation / Compilation: Translating source code or intermediate instructions
  into executable code and metadata. Compiler transformations, specialization and
  code sharing determine what is produced before deployment or during execution.
- caching / Caching: Retaining results or reusable resources to avoid repeating
  work. Ownership, validity, retention limits and lifetime determine when cached
  state can safely be reused.
