# Fundamentals: source coverage and verification

Public source: https://www.youtube.com/watch?v=7BepNnpU2UU.
Public video metadata date: March 1, 2020. Duration: 30:37.
The complete raw transcript and combined Fundamentals manuscript were read. The
manuscript also covers Constructors, Constants and ValueTuples; those recordings
have their own articles, preserving the requested one-article-per-video boundary.

## Coverage checklist before drafting

- Knowing an output differs from being able to explain why it occurs.
- Value-type variables contain values; reference-type variables contain references.
  Inline value storage is the central distinction, not stack versus heap.
- Local integer 20 and local string; address of variable versus referenced object.
- Info struct with int Id, double Value, DateTime Date; then add string Name.
  The reference is inside the struct while the string is a separate object.
- Change Info to class: local reference points to heap object containing inline
  value fields and a Name reference to another object.
- Default argument passing copies the variable. Large structs can cost more to
  copy; preserve the author's preference for small structs without new benchmarks.
- Int caller 10, DoSomething changes its copy to 20; caller remains 10. Book-copy
  analogy. Ref at both declaration and call allows assignment to caller's variable.
- String s1 Hello, local concatenation of World, copied reference versus reassigned
  local. Equivalent s2=s1 assignment; immutability concerns string contents.
- Allocation/copy/GC costs of concatenation, including a large string plus one
  character; do not convert this into an absolute ban or assume every operation
  allocates. Literal interning and retained references affect collection.
- Info constructed with 1, 2d, DateTime.Today, Shiv; method assigns Name=Jack.
  The shared object's Name reference changes; neither string's contents change.
- Ref does not change the outcome when only the shared object property is mutated;
  replacing the caller's reference variable is a different operation.
- Author prefers returning a modified object so the signature shows a result;
  same instance versus replacement is a separate implementation decision.

## Source frames

- 06:17: struct Info with Id/Value/Date/Name; Main constructs info before assigning
  Hello. Stack holds 24 conceptual cells in three rows of eight; bottom row
  initially all zero, divided into four red and four yellow cells. Address 0x015D
  points to the struct's starting position. Heap is empty in this step.
- 09:11: class Info with the same four fields. Stack local info at 0x015D holds
  0x001513ec. Heap object at 0x001513ec contains 24 conceptual cells; bottom row
  reads 0 0 0 0 3 5 4 3. Final four cells point to Hello at 0x3543.
- 12:15: integer argument sample recovered in an earlier frame.
- 27:33 and 27:43: Main creates Info(1, 2d, DateTime.Today, "Shiv"), calls
  DoSomething(info), prints info.Name. DoSomething assigns info.Name="Jack".
  Class is internal sealed; the full property/constructor definition is pending.

All cell counts and addresses are conceptual labels, not measurements or a claim
that a hexadecimal digit occupies one byte. Do not infer literal memory packing
from the slide. Modern compiler optimizations also make stack/heap absolutes unsafe.

## Draft and executable verification

Complete standalone draft: `csharp-value-reference-fundamentals.md`.
The Info mutation program explicitly uses a reduced Name-only class and object
initializer. The original constructor body was not recovered and is not invented.
The original invocation uses 1, 2d, DateTime.Today, Shiv, as verified above; its
three unrelated scalar properties do not affect the demonstrated mutation.

Additional frame 14:38 verifies the string parameter is named s (caller s1) and
the exact operation is s += " World". Two inspected frames at 06:27 and 06:32
still precede the Name assignment; do not label them as the assigned struct.

Ten Release builds/executions on .NET SDK 10.0.401 passed, each with zero warnings
and errors: integer by value 10; integer by ref 20; string by value Hello; local
string copy Hello / Hello World; string by ref Hello World; object mutation Jack;
same mutation with ref Jack; object replacement by value Shiv; object replacement
by ref Jack; return modified object Jack. These verify language behavior and the
adapted examples, not reproduction of the original project configuration.

Two authored SVGs preserve 24 cells each. Struct has one address arrow and empty
Heap; class has three arrows and a separate Hello string. Both rendered PNG
previews were visually inspected. No intersecting labels or reversed links found.
Article hero generated and optimized, with saved prompt. Wide site crop pending.
Both writing audits passed: zero hard/advisory and zero punctuation/editorial flags.

Independent metadata review returned the applied description and five tags:
value-and-reference-types (new), parameter-passing (new), immutability (new),
method-design, csharp. New topic definitions/heroes and final site checks remain
pending. Existing tags are used temporarily in the outside-collection draft.

New topic definitions:

- Value and Reference Types: The distinction between variables containing values
  directly and variables containing references to objects. Field storage,
  assignment and copying determine how values and shared objects behave.
- Parameter Passing: How method parameters receive argument values or access
  caller variables. Passing by value and passing by reference determine what is
  copied and which assignments can affect the caller.
- Immutability: Keeping a value or object's contents unchanged after creation.
  Operations produce replacement values, while variables may still be reassigned
  to refer to those replacements.
