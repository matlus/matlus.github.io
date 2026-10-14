# Generate a representative article preview

Run this after the article title, hero and listing card are settled. This produces
the separate Google Discover and social preview, exported at **1200 x 675**, 16:9.
Preserve the approved hero and 1200 x 500 card. Read the final article and inspect
both images before choosing the source that best communicates its subject.
Use the approved card when its closer composition makes the defining action clearer.
Use the hero when it contains a relationship needed in the preview.

## Derive the complete brief

Supply the article's exact title, its central claim, the selected source path and
measured dimensions. Attach that image to the generation request. Name the people,
meaningful objects, counts, connections and relationships that must remain intact.
Preserve identities from the source; extending approved artwork does not authorize
substituting a different cast. Match its palette, saturation, contrast and brightness.

Outpaint the source into 16:9, retaining the whole scene and its proportions.
For a source wider than 16:9, extend above and below. For a taller source, extend
the sides. Express the margins at the output scale: a 1200 x 500 card needs 175
additional vertical pixels, split 87 above and 88 below. A 1600 x 534 hero needs
366 vertical pixels before downsampling. Extend the existing environment naturally;
keep new margins subordinate to the article's defining action. Avoid new people,
meaningful props, text, logos or watermark. Preserve existing meaningful markings.

Ask for a large 16:9 original with no cropping, stretching, zoom or rearrangement.
Measure the returned dimensions. The generator may redraw details, so compare
against the source at full size and phone/feed size. Correct missing faces or hands,
changed counts or connections, altered identities, and lost defining objects.
If the scene is still unreadable at feed size, record that finding and refine the
outpainting or composition using the approved artwork as reference.

## Export and inspection

Keep generated originals outside Git. Save the optimized result under the **hero
asset name**, which can differ from the article slug:

```bash
node tools/prepare-image.mjs <outpainted-original.png> <hero-name>-preview --role preview
```

This export retains the entire near-16:9 frame, including minor dimension rounding,
and rejects substantially different ratios or undersized originals. Save the full
brief, references, refinements, source/output dimensions and export method in
`src/assets/heroes/<hero-name>-preview.prompt.md`. Inspect the exported image at
about 366 x 206 and 320 x 180 pixels with the article title. Record the source,
derivation and visual inspection in the publication receipt.

The shared article layout selects this companion for Open Graph, Twitter and
article structured data. The build requires its dimensions and prompt, then checks
the generated HTML, absolute asset URL, accessible image bytes, measured dimensions,
matching metadata and linked author. These checks complement visual inspection.
