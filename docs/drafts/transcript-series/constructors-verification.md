# Constructors: source coverage and verification

Public source: https://www.youtube.com/watch?v=Hf063OqbK64.
Public video metadata date: March 22, 2020. Duration: 42:15.
Complete raw transcript read before drafting.

## Required teaching coverage

- Author's Delphi background: inherited and virtual constructors versus C#;
  explain why the difference affected class design, without broad claims about
  who exclusively created each language or unsupported C++ failure behavior.
- VehicleBase / VehicleToyota: one instance initialized through its ancestor
  constructors; base body sees null/null/zero before descendant assignments.
- Compiler-provided parameterless constructor only when none is declared.
- Implicit base() call; explicitly select a parameterized base constructor.
- Instance field initializers and their placement before the base call.
- Duplicate emitted initializer code in independently rooted constructors.
- Constructor chaining through this(...); consistent argument ordering and
  protected constructors for an abstract base.
- Virtual call directly or indirectly through Drive, StartEngine, ShiftIntoGear;
  dispatch reaches descendant before its constructor body initialized its fields.
- Author deliberately uses this capability when initialization dependencies permit
  it; document justification and understand the analyzer warning.
- Static constructor syntax and runtime ownership, once-only initialization,
  static field initializers before explicit constructor body, emitted .cctor.
- Explicit static constructor versus beforefieldinit scheduling and optimization.
- Static initialization exceptions leave type initialization failed for its lifetime.
- Creating an event-handler delegate differs from invoking its static target.
- Decompiler output is a reconstruction; distinguish compiler IL names from opcodes.

## Source frames recovered

- 05:57: Drive calls StartEngine then ShiftIntoGear; both protected abstract.
  VehicleToyota is internal sealed. Its constructor prints VehicleToyota.Ctor,
  sets Make to the literal Totoya (a visible spelling slip), Model to Land Cruiser,
  and Year to 2020.
- 06:17: VehicleBase is internal abstract; public fields Make, Model, Year;
  protected parameterless constructor prints VehicleBase.Ctor and calls private
  PrintDetails, whose interpolated output labels Make, Model, Year.
- 07:07: console output confirms base marker, empty Make/Model with Year 0, then
  descendant marker.

The local directory named Constructors contains an empty Program and unrelated
Class1 skeleton; it is not evidence for the substantive example. Another VehicleBase
found locally belongs to a different demonstration and is not used as this source.

## Technical qualifications to carry into the draft

The examples concern ordinary class constructors, not modern struct constructor
rules. .ctor and .cctor are metadata method names, not instructions. An explicit
static constructor affects beforefieldinit semantics; do not repeat a blanket
claim that every static class receives a constructor or that all initialization
may occur minutes before first use. Do not assert that an unused field initializer
is always eliminated; inspect the actual shown code and emitted result.

Reference checks: C# specification sections on instance field initializers and
constructors, and Microsoft's Static Constructors documentation. Preserve the
author's deliberate virtual-call position with the precise dependency limitation.

## Draft and executable verification

The complete first draft and article hero are prepared. Additional readable frames
at 21:07 show initializer assignments before the object constructor and the
parameterless constructor chaining to the three-argument constructor. Frames at
28:14 and 28:34 establish Drive and the exact StartEngine / ShiftIntoGear overrides.
Frames at 37:32 and 38:02 establish MyStatic, its data initializer and GetData.

Six isolated .NET 10.0.401 SDK checks compiled the article's extracted examples
without warnings or errors and asserted the complete output: baseline construction,
parameterized base construction, instance field initialization, explicit static
construction, implicit static field initialization, and virtual dispatch before
the descendant constructor body. Temporary verification files remain outside the
repository. These checks establish current behavior, not a recreation of the
recording's original compiler environment.

The independent metadata review supplied the applied description and proposed
constructors, static-initialization, class-design, polymorphism, compilation and
csharp. Constructors, static-initialization and compilation need vocabulary entries
and their distinct topic heroes before the final tags can be applied. The article
hero is saved with its prompt; rendered crop inspection remains pending.

Remaining acceptance: exercise constructor chaining, final writing audit, topic
assets and tags, rendered article inspection, typecheck and full site build.

## Publication verification, October 4

A seventh isolated check now extracts all three chained VehicleBase constructors from the article, exercises each path through a concrete descendant and asserts field initializer replacement and final values. It passes.

Final publication metadata, artwork, rendered checks and deployment evidence are
tracked in ../../transcript-series-publication.md; earlier pending lists above
record preparation state.
