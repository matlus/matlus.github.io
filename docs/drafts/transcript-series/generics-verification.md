# Generics: source coverage and verification

Public source: https://www.youtube.com/watch?v=MIZFp5m3Pus.
Public metadata: March 28, 2020; duration 9:17. Complete raw transcript read.

## Coverage checklist before drafting

- Assumes familiarity with generics; examines implementation, not introductory syntax.
- C# 2 and CLR support, compiler metadata/IL and runtime cooperation; research
  contribution from Microsoft Research Cambridge. Correct ASR Tom Simon to Don
  Syme using Kennedy/Syme's 2001 primary paper.
- Runtime deployment concerns, historical .NET Framework versus .NET Core
  side-by-side deployments. Motive/regret claims need evidence; do not invent it.
- Author's strong objection to default interface implementations retained as an
  opinion. Runtime support required; broad claim of no intervening CLR language
  support changes needs qualification rather than publication as established fact.
- ArrayList boxing/unboxing of value types, allocations and GC cost.
- Java erasure versus .NET reification. Preserve distinction but correct erasure
  of bounded T to its bound and distinguish instance type arguments from generic
  declaration metadata still available through reflection.
- C++ templates instantiated at compilation, versus typical CLR JIT specialization.
  Macro comparison is an analogy, not literal textual macro substitution.
- List<int>, List<DateTime>, List<long>, custom structs receive specialized code;
  reuse for repeated instances; demand-driven compilation, not all conceivable types.
- Reference-type instantiations can share machine code because reference
  representations match. Type identities and metadata remain distinct.
- Specialized code costs space; do not infer a measured working-set increase.
- AOT and tiered JIT bound the conceptual account; not a promise of one permanent
  generated body per type or every method compiled at instance creation.

## Primary evidence

- Kennedy and Syme, Design and Implementation of Generics for the .NET Common
  Language Runtime (2001): exact runtime types, specialization, code sharing.
  https://www.microsoft.com/en-us/research/?p=145172
- https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generics-in-the-run-time
- https://docs.oracle.com/javase/tutorial/java/generics/erasure.html
- https://learn.microsoft.com/en-us/cpp/cpp/templates-cpp?view=msvc-170

Code snippets will be explicitly identified as small teaching examples added to
make the spoken collection comparison executable, not recovered screen code.

## Draft verification

Complete draft `csharp-generics-under-the-hood.md`; sampled frames at 03:42 and
07:25 show spoken presentation, with no code or diagram to transcribe. The two
new illustrative programs are labeled teaching programs. Both compile in Release
on .NET SDK 10.0.401 with zero warnings/errors. Outputs: 20 / 20, and
Int32 / DateTime / String / Object / False. Native code sharing was not measured;
the article expressly distinguishes reflection evidence from machine code evidence.

The author-history claim that runtime designers regretted treating CLR as an OS
component is unverified. The article retains the runtime-deployment distinction
without attributing an unverified motive. The absolute claim of no language-driven
CLR changes between generics and default interface implementations is not repeated
as established history; the article explicitly says these are two examples, not a
complete history. The author's strong default-interface objection remains intact.
Java's bounded erasure and surviving declaration metadata are qualified using
Oracle sources. C++ macro comparison is explicitly only an analogy.

Article hero and saved prompt complete; wide crop and final site checks pending.
Writing audit: zero hard, one advisory for a mechanical antithesis; revised that
sentence to a direct statement. Professional audit: zero punctuation/editorial flags.

Independent metadata: generics (new), boxing (new), compilation (new),
value-and-reference-types (new), reflection, csharp. Description applied. New topic
assets pending; outside-collection draft temporarily uses existing tags only.

New definitions:

- Generics: Types and methods parameterized by other types. Compiler and runtime
  support determine how type arguments are checked, retained and used to specialize
  or share executable code.
- Boxing: Representing a value-type value inside an object so it can be used
  through an object or interface reference. Boxing and unboxing affect copying,
  allocation and the behavior of typed and untyped APIs.
- Compilation (broaden earlier proposed definition to include JIT): Translating
  source code or intermediate instructions into executable code and metadata.
  Compiler transformations, specialization and code sharing determine what is
  produced before deployment or during execution.
- Value and Reference Types: same definition as Fundamentals metadata.
