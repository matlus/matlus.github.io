# .NET Memory Allocations and Performance: coverage and verification

Source https://www.youtube.com/watch?v=aylUPfOVM90, public October 15, 2017,
duration 52:28. Full raw transcript read (1,222 nonblank lines), including the
static type discussion that was reread after tool-output truncation.

## Coverage checklist before drafting

- Build a visual model of method calls, local values, references and object
  creation; preserve the driving/engine/road analogy and author emphasis on
  understanding the runtime while keeping useful abstractions.
- Main stack frame, i=20, s="Hello World", Info struct fields Id:int,
  Value:double, Date:DateTime. Zero defaults and contiguous inline representation.
- Add Name:string to struct, then change Info to class. Preserve separate Name
  object and inline value fields. Distinguish reference slot from referred object.
- int array 1..8 and reference-type Info array, contiguous values versus
  contiguous references plus separate objects; all arrays reference types.
- Copy semantics and default field-based equality, qualify overloaded equality,
  shallow reference copies and classes with value equality.
- Stack is a lifetime/allocation organization, not special faster RAM; frame
  reclamation versus managed heap tracking. Correct 4 MB virtual-address claim,
  literal wiping and fixed growth-direction claims instead of repeating them.
- GC uses tracing reachability rather than reference counting. Heap allocation
  is often cheap but not free; collection frequency/liveness/object sizes matter.
- Local values are not guaranteed stack-resident; registers, captures, async
  state and JIT transformations qualify physical storage model.
- Object header/method table, inherited operations and instance fields; original
  32-bit layout is conceptual and version-sensitive. int always four bytes.
- Runtime type metadata and shared code/static storage; correct managed Type
  object as physical static-storage simplification. AppDomain vs process distinct;
  .NET Framework context differs from current .NET loader contexts/generics.
- Default pass-by-value copies struct payload or object reference; by-ref is
  a separate parameter choice. Do not imply reference object deep-copy.
- String s1/s2 alias, append new object and s1 reassignment, s2 old string;
  retain illustrated lengths/characters and source relationships.
- Allocation order/locality setup for Part 2, qualify physical distance as cache
  locality/cache misses rather than distance-dependent RAM access latency.
- Original diagrams recovered and compared with authored SVGs as detailed below.

## Article distinction

The later C# Fundamentals recording overlaps value/reference semantics but this
earlier article develops allocation costs, arrays, headers and runtime type data
as preparation for the hardware/cache article. Keep both articles separate.

## Source diagrams and executable verification

Recovered readable frames at 09:39 (struct with Name), 12:49 (class), 15:44
(integer array), 18:49 (reference array), 33:43 and 41:57 (object/type layout),
and 48:18 (string reassignment). The four new SVGs preserve 24, 32, 56 and 47
conceptual cells respectively, with 2, 2, 3 and 4 arrows. The class and type
figures reuse the matching source reconstructions already prepared for C#.
All four new diagrams were rendered and visually inspected; the string arrows
were rerouted to clear the local-variable labels without changing endpoints.
Illustrated addresses and cell groupings remain conceptual, as captions explain.

All six article C# blocks were compiled together in isolated verification
wrappers on .NET SDK 10.0.401. Fourteen behavior checks pass: defaults, struct
copies, shared string references, class aliases, integer arrays, class-array
null entries, struct-array defaults, primitive representation sizes, boxing,
field equality, both printed strings and lengths, value parameters, and ref
parameters. Compilation has zero errors and seven expected CS0649 warnings
for deliberately unassigned fields. These checks do not claim to measure
physical offsets, collection timing or performance.

The source's invalid repeated string keyword on its append statement is
corrected and identified in the figure caption. Other historical conflicts
listed above are qualified in the prose. Primary runtime and language references
support tracing collection, value/reference semantics, array defaults, boxing,
type structures and minimum object size.

Independent metadata review applied the description. Proposed topics awaiting
the collection-wide reconciliation are memory-allocation, object-layout,
value-and-reference-types, garbage-collection and immutability; csharp exists.
The article hero and drawing brief are saved. Final article writing audits
report zero punctuation/editorial flags and zero copy errors. One advisory
in this verification record describes a necessary correction to the source's
stack-memory claim and is retained. XML checks confirm every new diagram's
cell and arrow counts. Final collection checks and page rendering remain
outstanding. This draft is outside the publication collection.
