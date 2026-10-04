# Static Classes: source coverage and verification

Public source: https://www.youtube.com/watch?v=IPGizw3YdMg.
Public video metadata date: March 2, 2020. Duration: 28:07.
The entire raw transcript and existing Statics and the Two Kinds of Classes
manuscript were read. The manuscript's Python translation and corpus crosswalk
are later editorial material, outside this C# article's scope.

## Coverage checklist before drafting

- Decision starts with whether an instance is needed: method arguments/results,
  instance polymorphism, implemented interfaces. Static candidates remain subject
  to the author's state/behavior discipline, not merely language eligibility.
- Stateful immutable DTOs versus stateless behavior classes; customer instances
  carry distinct values; behavior may require instances for polymorphic use.
- Author starts by preferring static, estimates at least half his classes are
  static, and explicitly bases the choice on design rather than allocation savings.
- Conceptual Info memory layout, object header/sync-block index, method table,
  inline Id/Value/Date fields, Name reference to Hello string, base methods,
  constructor and static constructor entries, shared type information/static members.
- IL/JIT relationship, native code reached through runtime method machinery,
  no separate method-body copy per object; object minimum sizes 12/24 bytes are
  runtime/architecture details rather than a C# language guarantee.
- Type object and runtime type representation; shared per-type data. Preserve
  the conceptual association without claiming static fields reside inside System.Type.
- Historical AppDomain boundary; distinguish it from a process and explain modern
  .NET's single default AppDomain and assembly-loading boundary where relevant.
- Autonomous is the author's term for argument-driven behavior without changing
  class state; pure additionally has no side effects and deterministic results.
- Allow fixed immutable configuration without treating all such values as C# const.
- Immutable DTOs avoid shared argument mutation; statelessness alone cannot settle
  concurrent effects on databases, files or other external resources.
- Specific cohesive names, no Helper/Utility dumping ground; internal by default,
  deliberate public visibility for specific reusable complex functionality.
- Singleton is only a closing connection to shared type state, not a worked pattern.

## Recovered diagram

Readable frame at 08:26 contains the full .NET Memory Layout - Reference Type
diagram. Keep these components and connections exactly in the adapted figure:

- Legend: Value Types, Reference Types, Static.
- info reference points to the Method Table Pointer row's beginning, below the
  Sync Block Index row.
- Six object rows, in order: Sync Block Index; Method Table Pointer; Storage for Id;
  Storage for Value; Storage for Date; Pointer to Name.
- Info Method Table: Type Object Pointer; Base Method Table; a vertical gap;
  Info.ctor; Info.cctor. These last two rows have no separate arrow in the source.
- Type Instance at upper right: Type Information; Static Members.
- Three base method rows at right: Object.Equals; Object.GetHashCode; Object.ToString.
- Hello string at lower right.
- Method Table Pointer goes to Type Object Pointer; Type Object Pointer goes to
  Type Information; Base Method Table goes to the base-method group at Object.Equals;
  Pointer to Name curves beneath the method table to Hello.
- No extra objects, arrows, source footers or decorative legend stripes.

The figure is a conceptual historical model. Current CoreCLR documentation
distinguishes MethodTable, type handles, RuntimeType and static storage. Modern
dispatch and compilation need not take the simplified path for every call.

## Draft and verification state

The complete draft includes an authored 1500 by 1000 SVG with real text. A raster
preview was inspected: all sixteen content cells, three legend labels, two group
headings and five source arrows are present, legible and uncut. The original has
no code walkthrough to compile; its example is the Info conceptual diagram.

The draft qualifies object-header details, 12/24-byte minimum allocation figures,
JIT/AOT differences, runtime type structures, AppDomain/process distinctions and
external concurrency boundaries. Primary runtime documentation supports these
qualifications. Source opinions about instance need, immutable DTOs and naming
remain explicit rather than being generalized into language requirements.

Both writing audits passed without flags before the independent metadata revision.
That review supplied the applied description and proposed static-classes,
object-layout, autonomous-methods, class-design, data-transfer-objects and csharp.
The three new topics need vocabulary entries and separate topic heroes. The article
hero and prompt are saved; image crop and full rendered article checks remain.
