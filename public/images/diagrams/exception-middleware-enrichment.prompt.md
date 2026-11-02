# Exception middleware enrichment

Regenerated November 2, 2026, for Step 6 of
**Programming to Exceptions, Part 2: Diagnostics and Boundaries**. It replaces the
October 2 drawing, which misspelled "failure" and did not show redaction. The new
drawing follows the article's middleware: it catches the exception, adds the
request data, redacts personal data, logs one record, and separately translates
the exception into the caller's response. Style: the shared flat fine-line prompt
in `prompts/generate-flat-fine-line-diagram.md`. Style reference attached:
`docs/style-references/flat-fine-line-diagram.webp`.

```text
Use case: infographic-diagram.

Create a precise flat technical diagram in the visual style of the supplied
reference image. The separate DRAWING BRIEF defines its content and layout.

BACKGROUND
Use a very pale cool blue-grey paper background with a softly lit, nearly white
centre and a restrained blue-grey vignette at the edges. Add fine, low-contrast
etched or swirling paper texture, strongest near the margins. Keep the drawing
area quiet and the labels clearly readable.

TYPOGRAPHY
Use upright, bold, condensed sans-serif lettering with the proportions of the
reference. Set the main title in heavy uppercase navy lettering, with a subtle
tonal gradient and a small restrained shadow. Fine navy horizontal rules may
flank the title when space permits. Balance the title with the diagram below.

Use crisp bold condensed lettering for card labels, centred within each card.
Match label colour to the card's outline colour where contrast permits. Preserve
exact spelling, capitalization, punctuation, and identifiers from the brief.
Wrap long identifiers at meaningful word boundaries without introducing spaces
or hyphens into the identifier. Keep typography upright and readable after
downsizing. Adjust card width and line wrapping before shrinking label text.

CARDS AND PALETTE
Use flat rounded rectangular cards with subtle, very pale tinted fills and
delicate saturated outlines. Keep corners gently rounded and card padding
consistent. Use the reference's navy, red, orange, green, and vivid blue palette
as needed. Apply any colour meanings specified in the drawing brief consistently.
Make matching categories visually coherent and distinct categories recognizable.

At an image width of approximately 1820 pixels, make card outlines about
1.3–1.5 pixels thick. Scale that weight proportionally at other resolutions.
Apply the same delicate weight to any legend border and legend divider lines.
Avoid doubled borders, thick edge shadows, bevels, extrusion, or dimensional
platforms. Keep card fills and outlines visually flat.

CONNECTIONS
Draw navy arrows through open space. Use straight arrows for aligned top-to-bottom
connections, perpendicular to both box edges. Use smooth curves for offset
connections, including branches, merges and routes around components. For top-to-bottom flows,
leave generous vertical gaps between successive levels of cards and increase
the canvas height to give each curve room. Avoid right-angle turns and tight
rounded elbows. Connectors may be slightly heavier than card borders, approximately
2.5 pixels at an image width of 1820 pixels, with clearly visible arrowheads.
Keep every endpoint and arrow direction faithful to the drawing brief. Maintain
clear gaps around unrelated cards and text. Keep independent paths distinct.
Anchor connectors at edge centers, bottom center to top center for downward flow.
Branches share a source anchor; converging paths share a destination anchor.
Allow clear overlap near shared anchors. Use another edge's center when direction
requires it.
For inheritance diagrams, arrowheads point from descendants toward ancestors.
For other diagrams, use the directions and relationship meanings in the brief.

ICONS AND LEGEND
Include markers only when the brief assigns them a meaning. When circles or
stars are requested, use flat golden-yellow fills, fine navy outlines, and
consistent sizes. Position card markers near a corner without covering labels.
Use a compact pale legend with a fine navy rounded border and small vertical
dividers when a legend is required. Include only the specified symbols and text.

COMPOSITION AND CONSTRAINTS
Use an orderly, airy two-dimensional composition with aligned related cards,
balanced branches, and enough space to trace every connection. Keep all labels,
markers, arrowheads, and legend text within comfortable margins. Choose the
aspect ratio from the drawing brief; wide landscape suits a broad hierarchy.

Use the reference solely for visual treatment. Draw exactly the components,
connections, boundaries, and labels in the brief. No copied reference content,
invented relationships, unrelated decoration, logo, or watermark.

DRAWING BRIEF
Subject and reader takeaway: the exception-handling middleware is the only
try/catch in the system, at its entry point. A failure propagates out of the
domain code and the middleware catches it. On the logging path it adds the
request data, redacts personal data, and writes one diagnostic record. On the
response path it translates the exception into the HTTP response the caller
sees.

Main title, verbatim: "THE OUTERMOST CATCH"

Components, exact labels, and counts (exactly eight cards):
- "Request": navy card, outside the enclosure, top-left.
- "Domain operation": vivid-blue card, inside the enclosure, left end of the
  main row.
- "Catch escaping exception": red card, inside, main row.
- "Add request data": navy card, inside, main row. Second smaller line:
  "Path, correlation ID, safe inputs".
- "Redact personal data": orange card, inside, main row. Second smaller line:
  "From message and context".
- "Diagnostic log": green card, inside, right end of the main row. Second
  smaller line: "One record per failure".
- "Translate to HTTP response": vivid-blue card, inside, on a lower row,
  directly below "Add request data". Two smaller lines inside it:
  "Known failure: its status code" and "Unexpected failure: 500".
- "Caller": green card, outside the enclosure on the far right, level with
  "Translate to HTTP response".

Groups and their complete members: one lightly dashed rounded navy enclosure
labelled at its BOTTOM-left inside corner "Exception-handling middleware",
below "Domain operation", where no arrow passes; no arrow may cross the label. It
contains completely: Domain operation, Catch escaping exception, Add request
data, Redact personal data, Diagnostic log, Translate to HTTP response.
"Request" and "Caller" are fully outside it.

Connections: origin, destination, direction, and relationship meaning
(exactly eight arrows):
1. Navy arrow from "Request" down into the top of "Domain operation".
2. Red arrow from "Domain operation" right to "Catch escaping exception",
   labelled "Exception propagates".
3. Navy arrow from "Catch escaping exception" right to "Add request data".
4. Navy arrow from "Request" along the top of the image, then smoothly down
   into the top of "Add request data", labelled "Request data". It crosses
   the dashed boundary once, from above.
5. Navy arrow from "Add request data" right to "Redact personal data".
6. Green arrow from "Redact personal data" right to "Diagnostic log".
7. Navy arrow from the bottom of "Catch escaping exception" curving smoothly
   down and right into the left edge of "Translate to HTTP response",
   labelled "Exception".
8. Green arrow from "Translate to HTTP response" right, crossing the dashed
   boundary, to "Caller".
No arrows leave "Diagnostic log". No arrow returns into "Domain operation".
No other arrows.

Colour meanings: red = the failure propagating; navy = request data and
processing steps; orange = redaction; green = outputs (the log record and the
caller's response); vivid blue = the domain code and the response translation.

Markers and their meanings: none. No icons.

Legend text, verbatim, or no legend: no legend.

Footer, verbatim, inside a fine navy rounded box centred below the enclosure:
"Domain code lets failures propagate. The entry point records and translates."

Layout and aspect ratio: wide landscape, approximately 2.1:1 (for example
2400 by 1140 pixels or larger). The main row of five cards runs left to right
across the middle of the enclosure with even gaps. The lower row holds only
"Translate to HTTP response" inside and "Caller" outside on the right. Leave
generous space so all eight cards and every arrow label remain readable when
the image is shown about 700 pixels wide.

Content reference: none.
```

## Delivered asset

Generated November 2, 2026, with the built-in image tool through
`tools/codex-desktop.sh exec`, using the prompt above and the style reference.
The second generation was selected. The first had the enclosure label at the
top-left, where the arrow from "Request" crossed it, so the label moved to the
bottom-left corner in the prompt above. Delivered PNG: 1821 by 864 pixels, kept
outside the repository. Optimized copy: `exception-middleware-enrichment.webp`,
1821 by 864 pixels, WebP quality 90.

Checked against the brief: all labels exact; eight cards and eight arrows;
"Request" and "Caller" outside the enclosure; the red arrow is the only failure
path; no arrow leaves "Diagnostic log" or returns into "Domain operation".
