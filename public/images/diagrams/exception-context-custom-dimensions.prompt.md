# exception context custom dimensions

Generated October 2, 2026, with the built-in image generator and the approved
flat diagram reference. Selected for the Programming to Exceptions articles.

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
Draw crisp navy connectors through open space, using restrained rounded bends
where needed. Connectors may be slightly heavier than card borders, approximately
2.5 pixels at an image width of 1820 pixels, with clearly visible arrowheads.
Keep every endpoint and arrow direction faithful to the drawing brief. Maintain
clear gaps around unrelated cards and text. Keep independent paths distinct.
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
Title "CONTEXT YOU CAN SEARCH". Wide landscape.
Left column two input cards "Incoming request" with subtitle "Input + correlation" and "Throw-site context" with subtitle "Values + operation + cause". Both directional arrows converge into central card "Exception diagnostic record".
Then rightward arrow into a tall blue card "Application Insights" / "customDimensions". Inside show EXACT individual property lines:
"Exception.Type"
"Service.Originating"
"Order.Reference"
"Request.CorrelationId"
"Cause.Chain"
These are examples of searchable stored properties; keep correct capitalization and dots.
From Application Insights three separate rightward arrows reach three aligned output cards:
"Filter and search" / "Find the exact service and order"
"Alert on frequency" / "Recognize recurring failures"
"Reproduce and fix" / "Use captured input and state"
Footer "Capture useful context once. Make each diagnostic field available."
Six principal cards plus two inputs equals seven total: Incoming request, Throw-site context, Exception diagnostic record, Application Insights, three output cards. No inheritance icons, no invented product logos. Clearly distinct searchable fields not just one opaque log string. Navy connectors, green outputs, blue telemetry. Text easily readable at article width.
```
# Publication refinement

Correct the custom dimension labels to match the article's C# contract:
`ExceptionType`, `Failure.OriginatingService`, `Order.Reference`,
`CorrelationId`, and `CauseChain`. Preserve all other content and styling.
