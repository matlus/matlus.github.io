# .NET Memory Allocations and Performance: source-faithful SVG briefs

Public source https://www.youtube.com/watch?v=aylUPfOVM90. Use the approved
pastel architectural infographic style: mint Stack, blue Heap, navy labels,
pastel cells and restrained curved arrows. Keep source labels, containment,
counts and reference direction. Decorative slide chrome is omitted.

- `dotnet-info-struct-name.svg`: frame 09:39. Exactly 24 cells in three rows of
  eight inside Main/Stack. Bottom row 0 0 0 0 3 5 4 3. Address 0x015D points to
  info. Name cells point to the separate 0x3543 Hello in Heap. Two arrows.
  Code Info struct with Id:int, Value:double, Date:DateTime, Name:string;
  highlight info.Name = "Hello". The existing before-assignment struct drawing
  supplies the same geometry and typography.
- Existing `csharp-info-class-layout.svg` is also verified against frame 12:49
  of this recording: same 24 cells, values, addresses and three arrows.
- `dotnet-integer-array-layout.svg`: frame 15:44. Stack local nums at 0x015D
  holds 0x001513ec and points to Heap array with that address. Exactly 32 cells
  in four rows of eight: 0 0 0 1 0 0 0 2; 0 0 0 3 0 0 0 4;
  0 0 0 5 0 0 0 6; 0 0 0 7 0 0 0 8. Two arrows including address marker.
- `dotnet-reference-array-layout.svg`: frame 18:49. Same array cell contents
  and addresses, local name infos. Source uses Info[] infos = {...}; retain as
  a deliberately incomplete diagram excerpt. One more arrow from the left
  side of the last array row to one separate 24-cell object below, within Heap.
  Object first two rows blank; bottom row eight zeros. Exactly three arrows.
  Do not add seven more object boxes or pretend the cell digits are real pointers.
- Existing `csharp-static-type-layout.svg` matches frames 33:43 and 41:57:
  same 16 labelled boxes and five arrows. Both articles qualify it as conceptual.
- `dotnet-string-alias-layout.svg`: frame 48:18. Stack s2 at 0x0161 holds
  0x001513ec and points to old string; s1 at 0x015D holds 0x00151400 and points
  to new string. Old: four blank header cells, 0 0 0 B, then Hello World in
  eleven cells, wrapping at eight columns; total 19 cells. New: four blanks,
  0 0 1 4, then Hello World, Welcome in twenty cells; total 28 cells. Exactly
  four arrows including two address markers. No arrow between strings.
  The original final code line incorrectly repeats `string`; use compilable
  `s1 += ", Welcome";` and disclose this correction in the article caption.

All addresses and cells are conceptual. Do not claim digit boxes are literal
bytes, show endianness, impose a modern physical object layout, or add hidden
objects. Article prose explains headers, padding and reference width separately.
