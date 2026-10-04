# Info value/reference layouts

Authored SVG using the approved pastel architectural infographic brief in
`prompts/generate-pastel-boxology.md`. Public source:
https://www.youtube.com/watch?v=7BepNnpU2UU.

Recreate the diagrams at 06:32 (struct before Name assignment) and 09:11 (class
after Name assignment). These are deliberately different stages; label them.
Retain Stack above Heap; Main inside Stack; code left, memory right. Both diagrams
contain exactly 24 memory cells, arranged as three rows of eight. The first two
rows use muted blue. Bottom row: four pale coral cells, four pale gold cells.
No added cells, bytes or object headers. The cell count is conceptual.

Struct: address 0x015D arrow points to info in Main. Cells are contained in Main.
Bottom row is eight zeros. Heap remains empty. Highlight new Info(), not the
following Name assignment. Exactly one arrow.

Class: 0x015D arrow points to local info holding 0x001513ec. A second arrow leads
from that local to heap object at 0x001513ec, containing the same 24 cells. Bottom
row reads 0 0 0 0 3 5 4 3. Third arrow leads from the final four cells to the
separate 0x3543 Hello label within Heap. Highlight Name assignment. Exactly three
arrows, no reverse links.

Use real selectable text, soft blue/mint region fills, restrained blue outlines,
warm ivory paper, generous whitespace. Code labels preserve int Id, double Value,
DateTime Date and string Name. Do not interpret each address digit as one byte.
