# Derive an article listing card from its hero

Settle the article title and hero first. Read the article and inspect its approved
hero. Use the built-in image tool with the hero as the edit target. Preserve its
scene, identities, relationships and subject scale. The owner should not need to
write the brief.

The card export is **1200 x 500**, exact **12:5 (2.4:1)**. Measure the source:

- Wider than 2.4:1: scale to 1200 pixels wide and extend above and below.
  Each added strip is `(500 - 1200 * sourceHeight / sourceWidth) / 2` pixels.
- Taller than 2.4:1: scale to 500 pixels high and extend the left and right sides.
  Each added strip is `(1200 - 500 * sourceWidth / sourceHeight) / 2` pixels.
- Already 2.4:1, allowing only integer-pixel rounding: export the approved image
  directly. Additional generation is unnecessary.

A 3:1 hero becomes a 1200 x 400 scene with 50 pixels added above and below.
Outpainting should preserve the scene's size within that retained region.
Do not stretch or enlarge an undersized source.

```text
Use case: faithful outpainting, companion website article-card illustration.
Edit target: <approved hero, supplied as an image; measured dimensions>.
Article: <settled title and the important action or relationship>.
Canvas: exact 12:5 (2.4:1) landscape; final export 1200 x 500 pixels.
Generate at least this resolution, ideally 1944 x 810, for downsampling.
Geometry: preserve the complete original as a centered <width x height> region
at export scale. Extend only <top and bottom / left and right>, approximately
<calculated amount> pixels on each side. Keep the original scene's positions,
subject sizes, faces, poses, working hands, objects and important relationships.
Continue only the environment at the new edges, matching its perspective,
textures, linework and existing palette. Keep sparse backgrounds sparse and
extend edge-crossing forms naturally.
Avoid: cropping, stretching, zooming out within the retained region, rearranging
subjects, simplifying the central scene, invented people, new focal objects,
new labels, lettering, logos, watermarks, decorative borders or padding bands.
Preserve existing meaningful symbols, text and labels exactly as they appear.
The card must remain readable at about 366 x 153 pixels, and at 320 pixels wide.
```

Inspect the generated image. Prompted geometry is a request; a generative edit
may redraw details. Compare its people, objects, relationships and scale with
the source. Reject missing subjects, distorted anatomy or changed meaning.
If faithful outpainting remains unreadable at card size, recompose the strongest
action using the hero as reference and record why the exception was needed.
Previously approved card compositions can remain.

Measure the returned dimensions; regenerate if export would require enlargement
or crop important content. Keep the source hero unchanged. Export with:

```text
node tools/prepare-image.mjs <original.png> <hero-name>-card --role card
```

Save the complete brief, refinements, source dimensions and export settings as
`src/assets/heroes/<hero-name>-card.prompt.md`. For a direct export, record that
no generation was needed. Use the hero's frontmatter name even when the article
URL differs. The WebP must be exactly 1200 x 500.

Review the full card alongside its title and description in the actual desktop
and phone grid. At the measured desktop size the image area is about 366 x 153
CSS pixels; a full-resolution image alone cannot establish thumbnail readability.
Check faces, hands, defining objects and linework after compression.
Every non-draft article needs the companion and prompt, regardless of its date.
Follow [the image guide](../docs/image-and-diagram-guide.md) for publication checks.
