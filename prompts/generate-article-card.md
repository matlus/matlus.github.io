# Derive an article listing card from its hero

Settle the article title and hero first. Read the article and inspect its approved
hero. Use the built-in image tool with the hero as the edit target. Preserve its
scene, identities, relationships and subject scale. Keep every person from the
hero in the card, with the same identities and roles; retain meaningful companions
such as a robot participating in the action. Record that cast in the brief.
The owner should not need to
write the brief.

Match the approved hero's brightness, contrast and saturation. New hero briefs
use the gently bright, moderately saturated colour guidance specified in
[the image guide](../docs/image-and-diagram-guide.md#brightness-and-colour-reference).
Preserve that treatment in the companion and compare the pair after export.
Keep approved existing palettes unless the owner requests a colour adjustment.

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
Cast to retain: <every person in the hero, plus meaningful companions; identities,
count, poses and roles must remain recognizable in the card>.
Canvas: exact 12:5 (2.4:1) landscape; final export 1200 x 500 pixels.
Generate at least this resolution, ideally 1944 x 810, for downsampling.
Geometry: preserve the complete original as a centered <width x height> region
at export scale. Extend only <top and bottom / left and right>, approximately
<calculated amount> pixels on each side. Keep the original scene's positions,
subject sizes, faces, poses, working hands, objects and important relationships.
Continue only the environment at the new edges, matching its perspective,
textures, linework and existing palette. Keep sparse backgrounds sparse and
extend edge-crossing forms naturally.
Colour and light: preserve the approved hero's brightness, contrast, saturation,
natural skin tones, warm hair colour and luminous paper. Keep rich accents and
fine ink detail; avoid a duller grey/brown wash, clipped highlights or neon colours.
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
action using the hero as reference, retaining every person and meaningful
companion. Reduce empty space and peripheral clutter before changing the group's
framing. Record why the exception was needed.
Previously approved card compositions can remain.

For a closer composition, keep the same situation as well as the same cast.
Retain the recognizable environment, important surrounding props and the activity
connecting the people. Simplify peripheral detail while preserving those anchors.
The Breadcrumbs hero/card pair is an approved example: the wider hero establishes
the workshop, while the card brings the woman, robot and inspected document closer.

Use this brief when recomposing:

```text
Use case: companion article-card composition, using the approved hero as reference.
Article: <settled title and defining activity>.
Canvas: exact 12:5 landscape, final export 1200 x 500; generate at sufficient
resolution for downsampling.
Cast: retain <all people and meaningful companions>, their identities, relative
physical scale, expressions, poses and roles. Keep complete heads and working hands
comfortably inside the frame. Make the shared activity readable at 366 x 153.
Situation: retain <recognizable setting and important surrounding props>. Bring
the complete group and its work closer together within that same environment.
Reduce empty space and peripheral clutter while preserving the defining objects
and relationships. The result should look like a closer view of the same situation.
Appearance: match the approved hero's ink style, palette, brightness and saturation.
Avoid missing or invented people, merged bodies, changed activity, a new setting,
cut-off heads or hands, stretching, lettering, logos, watermark and padding bands.
```

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
