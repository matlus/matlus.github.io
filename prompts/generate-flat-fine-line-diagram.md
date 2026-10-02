# Generate a flat diagram with fine outlines

Use this shared style for diagrams with prominent condensed lettering, flat
cards, delicate outlines, and a pale textured background. Supply the subject in
a separate drawing brief. Combine the style prompt and completed brief when
generating an image.

## Style reference

The owner supplied the Custom Exceptions image on 2026-10-02 as the reference
for this visual treatment. An optimized copy is retained at
[flat-fine-line-diagram.webp](../docs/style-references/flat-fine-line-diagram.webp),
with its original dimensions of 1820 by 864 pixels.

Use the reference for lettering, colour, texture, card treatment, and line
weights. Its class identifiers, hierarchy, icon meanings, and eleven-card layout
belong to that drawing. Derive the new content from the drawing brief.

The original typeface has not been identified. Describe its appearance as bold,
condensed, upright sans-serif lettering and use the image as the typography
reference. This diagram lettering is independent of the website's reading font.

## Assistant workflow

1. Read the article, supplied description, or content reference. Identify the
   relationship the drawing should explain.
2. Write a complete drawing brief using the fields below. Specify exact labels,
   component counts, groups, connections, and arrow directions. Choose the
   composition from the subject and the owner's instructions.
3. Combine the stable style prompt with the completed drawing brief. Remove
   unused fields and supply the retained image as a style reference. The owner
   need not fill in the template.
4. Generate only when requested. Inspect every label and connection against the
   brief before selecting an asset. Follow the
   [image guide](../docs/image-and-diagram-guide.md) for saving and article use.

## Shared style prompt

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
```

## Separate drawing brief

Complete these fields for each image, then append them to the shared style prompt:

```text
DRAWING BRIEF
Subject and reader takeaway:
Main title, verbatim, or no title:
Components, exact labels, and counts:
Groups and their complete members:
Connections: origin, destination, direction, and relationship meaning:
Colour meanings, if any:
Markers and their meanings, if any:
Legend text, verbatim, or no legend:
Layout and aspect ratio:
Content reference, if supplied:
```

For an edit to an existing image, identify the specific change and the elements
that must remain intact. A request to thin rectangular outlines applies to card
and legend borders and legend dividers; it does not also thin connectors or icon
outlines unless requested.

## Check the result

Compare exact labels, counts, grouping, arrow endpoints and directions, marker
meanings, and legend text with the brief. Check long labels at the intended
display size. Confirm that card borders remain fine and distinct from connectors.
Save the complete combined prompt beside the selected optimized image, record
the delivered dimensions, and preserve earlier versions when revising.
