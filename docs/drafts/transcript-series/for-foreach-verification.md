# For vs Foreach: coverage and verification

Source https://www.youtube.com/watch?v=9bTpI86bA5E, public March15,2020,
duration18:11. Complete raw transcript read (472 nonblank lines).

## Coverage checklist before drafting

- Initial benchmark collection setup outside measurement; exact code/fixture and
  historical result table must be recovered from frames, not invented.
- For baseline ratio1 vs foreach near2 and extra allocation, specific workload.
- IL/compiler lowering distinct from runtime JIT optimization. Loop unrolling
  possible optimization, not guaranteed merely from constant iteration count.
- ILSpy/SharpLab decompiler language reconstruction can conceal lowerings.
- IEnumerable enumerator path GetEnumerator, MoveNext, Current, try/finally and
  Dispose; Reset not used by foreach. Current is property, not method.
- Array compiler fast path; transcript also claims List uses for, which must be
  corrected: ordinary List<T> foreach uses struct enumerator. Allocation is not
  universal; interface boxing/runtime optimization must be scoped.
- Enumerators do not generally copy source or guarantee thread safety. Dispose
  handles resource cleanup, not managed-memory collection. Explain accurately.
- Movies plain class no collection base/no IEnumerable interface, public instance
  GetEnumerator returning IEnumerator<Movie> yields original movie examples.
- Pattern binding at compile time; accessible public MoveNext boolean and Current
  required, method name alone insufficient. Not dynamic runtime duck typing.
- Yield-generated nested sealed state machine, current/state fields, MoveNext
  resume points; no materialization of all movies on method call. Reset usually
  throws; disposal meaningful for iterator finally cleanup. C#2 introduced
  iterators, not C#3.5. Async analogy only structural, not claim identical.
- Default readable foreach, optimize measured hot spots. Preserve author's
  explicit rejection of universal switch-to-for advice.

## Source discovery

VariousBenchmarks checkouts contain no matching loop benchmark or Movies iterator
found in bounded source searches. AzureGit/Lowering/Foreach/Program.cs is a later
List<int> and commented Policies example, not the recorded Movies source; do not
substitute it. Recover recorded source from browser frames.

## Recovered evidence and draft

- Complete first draft: `csharp-for-foreach.md`. Existing async/await and async
  streams articles explain asynchronous state machines; this article independently
  teaches synchronous foreach lowering and links those follow-ups.
- Frames 0075/0085/0095 recover both benchmark bodies. Frame 0095 also shows
  `GetMovies` returning `IList<Movie>` and starting a `new List<Movie>()`.
  Frame 0823 shows both static fields independently calling `GetMovies`.
- Frame 0109 recovers all published timing/error/deviation/ratio/allocation
  values, BDN 0.12.0, .NET Framework 4.8, x86 LegacyJIT, i7-4771 and Windows
  10.0.18362. Historical Gen0 for foreach is 0.0057; omitted from article table.
- Frame 0920 recovers the five-movie Movies class and all four Movie properties
  plus its constructor. Frame 0910 shows the longer initial movie sequence.
  Article retains the five-movie reduction actually demonstrated, with line wraps.
- Frame 0962 shows generated nested sealed iterator, state/current/this fields,
  generic and non-generic Current and enumerator interfaces. No source diagram
  occurs in this portion; prose and a behavior table explain the mechanism.
- Full original benchmark list was not reconstructed; historical timings are
  explicitly preserved as historical. Behavior checks use the recovered five
  movies, not a claim to reproduce the timed historical workload.
- New standalone sample extraction compiles every C# article block on SDK
  10.0.401/net10.0 with zero warnings/errors. Thirteen behavior checks pass:
  benchmark/expanded sums 9941, array equivalence, deferred creation, individual
  advances, all five items, early stop, no collection interfaces, list struct
  enumerator, cleanup on break and exception, Reset rejection, exact printed titles.
  Only the verification harness adds a Movie-construction counter and a five-movie
  GetMovies setup; source method bodies and properties remain unchanged.
- Contemporary corrections retain meaningful scope: array lowering versus list
  struct enumerators; interface boxing can depend on runtime; no automatic
  snapshot/thread-safety or immediate collection from Dispose; iterators C# 2.0.
  Primary references linked at their corresponding article explanations.
- Independent metadata review applied description and existing tags. Proposed
  shared `compilation` topic remains for batch reconciliation: Compilation;
  translating source code or intermediate instructions into executable code and
  metadata, including transformations, specialization and code sharing.
- Built-in image generation produced the film-viewer hero, visually inspected
  and optimized to `csharp-for-foreach.webp`; exact adjacent prompt saved.
  Final rendered article/crop and collection acceptance remain pending.

## Publication verification, October 4

The 09:20 source frame confirms the colon after Star Wars for Episodes I and II. Those two string literals now match the source. The extracted-example checks were rerun: 13 pass, zero warnings and errors.

Final publication metadata, artwork, rendered checks and deployment evidence are
tracked in ../../transcript-series-publication.md; earlier pending lists above
record preparation state.
