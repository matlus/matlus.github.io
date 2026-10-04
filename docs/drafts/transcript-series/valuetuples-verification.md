# ValueTuples and Deconstruction: source coverage and verification

Public source: https://www.youtube.com/watch?v=x3At5Pq2__I.
Public video metadata date: August 3, 2020. Duration: 46:27.
Complete raw transcript read before drafting. The existing Fundamentals manuscript
also combines material from this recording; the new article remains a separate
standalone treatment of this video.

## Teaching coverage

- Small groups of results versus named domain concepts; the author's preference
  for two elements, with three an upper design guideline rather than a language limit.
- Tuple reference type, ValueTuple value type, factory syntax and tuple syntax.
- ComputeAggregates returns fixed 20d, 13d, 35 as a syntax demonstration, not a
  calculation over a collection. Readable frame at 05:00 establishes these values.
- Vehicle make/model/year progression, PascalCase return-element preference,
  deconstruction, explicit local types and caller-supplied tuple element names.
- Runtime Item1/Item2/Item3 fields; TupleElementNamesAttribute preserves names for
  consumers; .NET generic type arguments are not erased.
- Anonymous types: generated class, constructor, read-only properties, backing
  fields, generated Equals/GetHashCode/ToString and matching type identity.
- Mutable value tuples, copied fields, value equality, hash codes and dictionary use.
- Custom Deconstruct pattern, out parameters, overload ambiguity and extension methods.
- Discards in deconstruction versus a variable literally named underscore;
  standalone discard assignment depends on the name not already being bound.

## Original source and adaptations

The local ValueTuples sample agrees with the recording's GetVehicle signature and
the Mercedes / AMG SL43 / 2020 literals. Its complete saved Program.cs compiles
unchanged. Tuple element names inside the declaration of vehicle do not declare
separate local variables, even when those names also occur as deconstructed locals.

Vehicle.Deconstruct in the original local source assigns fixed constants, rather
than reading the instance properties. The article preserves this demonstration
and explains the consequence before and after the complete listing. It does not
silently substitute a corrected implementation. Added Console.WriteLine calls
make results visible in standalone programs. The copy example extends the shown
mutation to expose value copying; Honda is added solely for that experiment.

The 41:18 frame shows GetVehicle's return signature and body, the lowercase named
tuple declaration and Toyota mutation, plus the in-progress underscore demonstration.
Frames at 27:52, 37:09 and 41:48 show the presenter, not source code, and provide
no code evidence.

## Executable checks

Ten isolated checks under .NET SDK 10.0.401 compiled without warnings or errors:
Tuple aggregates, ValueTuple factory aggregates, tuple-syntax aggregates, named
vehicle tuple, deconstructed tuple, independent copied-tuple mutation, custom
deconstruction, fixed Deconstruct output for a different vehicle, the unchanged
original saved sample, and reflection/equality inspection.

The reflection check verified Item1/Item2/Item3 runtime fields and Make/Model/Year
in the return-parameter attribute. Renamed tuple elements remained equal.
Matching anonymous initializers had the same runtime type, value equality and
distinct reference identity. Temporary test projects remain outside the repository.

## Editorial and asset state

Independent metadata review supplied the applied description and proposed:
value-tuples, deconstruction, anonymous-types, compilation, method-design, csharp.
The first four require vocabulary entries and distinct topic heroes before final
tags can be applied. Compilation is shared with the constants and constructors drafts.

Repository copy audit: zero hard and advisory flags. The writing audit's three
flags all concern the literal name underscore, which is essential to this lesson;
retain them. The article hero and full generation/edit prompts are saved. The
optimized image is 1905 by 825 pixels; rendered crop inspection remains pending.

Remaining acceptance: final custom-deconstruction and lowering frames, topic
assets and tags, rendered article inspection, typecheck and full site build.

## Publication verification, October 4

The exact saved original Program.cs and ten executable checks establish custom Deconstruct and the lowering claims, including reflection of runtime fields and tuple-name metadata. Additional attempted video frames showed the presenter or another source position; they supply no further evidence. The original code and executable checks close these acceptance items without claiming a recovered recording frame.

Final publication metadata, artwork, rendered checks and deployment evidence are
tracked in ../../transcript-series-publication.md; earlier pending lists above
record preparation state.
