# C# static type layout: authored SVG brief

Source: readable 08:26 frame of https://www.youtube.com/watch?v=IPGizw3YdMg.
Use the pastel architectural infographic palette with pale blue and mint panels,
butter-yellow inline value fields, navy upright labels, rounded cells, subtle
dimensional shading and curved connectors. This is simple boxology with real SVG
text; no raster generation is needed. Canvas: 1500 by 1000.

Heading: .NET Memory Layout - Reference Type.
Retain legend labels Value Types, Reference Types, Static. The legend's original
decorative stripes are presentation furniture, not technical data.

Left cluster: info reference; six stacked rows in order Sync Block Index,
Method Table Pointer, Storage for Id, Storage for Value, Storage for Date,
Pointer to Name. Inline value rows receive the butter-yellow category color.
Middle: Info Method Table heading; Type Object Pointer, Base Method Table,
a gap, Info.ctor, Info.cctor. Upper right: Type Instance heading with Type
Information and Static Members. Middle right: Object.Equals, Object.GetHashCode,
Object.ToString. Lower right: Hello.

Exactly five arrows: info to the start of Method Table Pointer beneath the header;
Method Table Pointer to Type Object Pointer; Type Object Pointer to Type
Information; Base Method Table to the group beginning Object.Equals; Pointer to
Name to Hello. Route the Name path below the method table; no arrows start at
constructor entries or the string. No extra containment boundaries or components.

Reader takeaway: instance fields, shared type information and referenced objects
have different roles. The article must state that this is a conceptual model,
not a physical map of System.Type or a universal layout/dispatch guarantee.
