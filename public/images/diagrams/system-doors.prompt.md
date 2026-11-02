# System doors

Prepared November 2, 2026, for the Rule 4 section of the rewritten
Programming to Exceptions, Part 1 draft. Style: the shared flat fine-line
prompt in `prompts/generate-flat-fine-line-diagram.md`, matching the
article's order-placement comparison. Style reference attached:
`docs/style-references/flat-fine-line-diagram.webp`.

The owner's description: a system with doors. One front door, the main way
upstream systems (a UI or other services) work with the system. The back doors
are everything else that brings data in: downstream services the system uses,
databases, message brokers that deliver messages, configuration, a key vault,
and a file read from local disk. Lock every door and the classes inside never
need validation or guard clauses.

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
Subject and reader takeaway: a software system drawn as a house with doors.
Data can only enter the system through its doors. One front door on the left
admits requests from upstream systems. Six back doors on the right admit all
other incoming data. Every door validates what comes through it, so the code
inside the system trusts what it receives and needs no guard clauses.

Main title, verbatim: "LOCK THE FRONT DOOR AND THE BACK DOORS"

Components, exact labels, and counts:
- One large lightly dashed rounded navy enclosure filling the centre of the
  image, labelled at its top-left inside corner "Your system".
- Inside the enclosure, centred, one green card titled "Inside the house" with
  a second smaller line "Classes trust what they receive. No guard clauses."
- On the enclosure's LEFT edge, straddling the dashed boundary, exactly ONE
  vivid-blue door card labelled "Front door", with a smaller second line
  "Validate".
- Outside the enclosure on the far left, exactly THREE upstream source cards
  in navy outline, stacked vertically and evenly spaced: "UI",
  "API caller", "Other services". Above them a small navy caption "Upstream".
- On the enclosure's RIGHT edge, straddling the dashed boundary, exactly SIX
  orange door cards stacked vertically and evenly spaced, each labelled
  "Back door" with a smaller second line "Validate".
- Outside the enclosure on the far right, exactly SIX source cards in navy
  outline, one aligned with each back door, top to bottom:
  "Downstream services", "Databases", "Message brokers", "Configuration",
  "Key vault", "Local files".
- Each of the seven door cards carries one small flat closed padlock icon in a
  corner, in golden yellow with a fine navy outline.

Groups and their complete members: the dashed "Your system" enclosure contains
the "Inside the house" card completely and straddles all seven door cards
(each door card sits on the boundary line, half inside, half outside). The
three upstream cards and six right-hand source cards are fully outside it.

Connections: origin, destination, direction, and relationship meaning
(every arrow shows data flowing INTO the system):
- Each of the three upstream cards has one navy arrow pointing right into the
  single "Front door" card; the three arrows converge on the door's left
  edge centre with smooth curves.
- Each of the six right-hand source cards has one straight navy arrow pointing
  LEFT into its aligned "Back door" card.
- The "Front door" card has one green arrow pointing right into the left edge
  of "Inside the house".
- Each of the six "Back door" cards has one green arrow pointing left; these six
  arrows curve smoothly and converge on the right edge centre of
  "Inside the house".
- No arrows leave "Inside the house". No other arrows. No arrow crosses the
  dashed boundary except through a door card.

Colour meanings: vivid blue = the front door; orange = back doors; green =
validated data and the trusted interior; navy = outside sources and the system
boundary. No red anywhere.

Markers and their meanings: the golden padlock on a door means the door is
locked: it validates what passes through it.

Legend text, verbatim, or no legend: no legend.

Footer, verbatim, small navy lettering centred below the enclosure:
"Every door validates. Nothing gets in any other way."

Layout and aspect ratio: wide landscape, approximately 2:1 (for example
2400 by 1200 pixels or larger). Upstream sources far left, front door on the
enclosure's left edge, "Inside the house" centred, back doors on the
enclosure's right edge, back-door sources far right. Generous spacing so all
fifteen cards, seven padlocks, and every arrow remain readable when the image
is shown about 700 pixels wide.

Content reference: none.
```

## Delivered asset

Generated November 2, 2026, with the built-in image tool through
`tools/codex-desktop.sh exec`, using the prompt above and the style reference.
First generation selected. Delivered PNG: 1774 by 887 pixels, kept outside the
repository. Optimized copy: `system-doors.webp`, 1774 by 887 pixels, WebP
quality 90.

Checked against the brief: all labels exact; three upstream sources, one front
door, six back doors, six back-door sources, seven padlocks; every door on the
dashed boundary; every arrow points into the system; green arrows converge on
"Inside the house".
