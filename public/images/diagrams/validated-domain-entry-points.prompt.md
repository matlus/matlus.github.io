# validated domain entry points

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
Title "VALIDATE EVERY ENTRY POINT". Wide landscape two-dimensional architectural illustration.
One large dashed enclosure labelled "Application"; one central green card "Domain work" / "Use validated domain data".
Five incoming data rows from outside left into entry component cards inside then green arrows to central domain work on right. Exact rows:
"Request" -> "Domain Facade" -> "Manager public method" (arrow Facade to Manager labelled "Delegates"). Beneath Manager inside same outlined unit show "Specialized Validator" and annotation "Every public Manager method". This validator is the Manager's first step, not a facade responsibility. Output green labelled "Validated request" to Domain work.
"Raw configuration" -> "Configuration Provider" / "Validate settings" -> green Domain work.
"External service models" -> "Gateway" / "Transform and validate" -> green arrow labelled "Domain models" to Domain work.
"Database results" -> "Data Manager + mapper" / "Map and validate" -> green Domain work.
"File contents" -> "File reader" / "Parse and validate" -> green Domain work.
From each of the FIVE admitting components (Manager, Configuration Provider, Gateway, Data Manager+mapper, File reader), red rejection connector labelled "Throw" leads to a common distinct card below Domain work "Invalid data rejected". No red path enters Domain work. The Domain Facade has no validation or rejection arrows; it only delegates.
Each incoming arrow goes toward the Application and each green arrow toward Domain work; these are data flow directions. Organize routes in open space, readable and no crossing labels. Footer verbatim: "Lock every door. Internal methods rely on the validated contracts."
Five external source cards, six entry role cards including Facade and Manager, one Validator within Manager unit, one Domain work card, one rejection card. No circle/star hierarchy symbols. Green means valid data, red rejection.
```
