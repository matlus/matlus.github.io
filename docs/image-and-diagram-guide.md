# Images and Diagrams

Updated: 2026-10-05

The site uses technical editorial ink for hero art. Diagrams within articles
default to pastel architectural infographics. A flat style with fine outlines
and two sculpted 3D styles are also available when their treatment suits the
article.

| | Hero and editorial images | Simple boxology | Illustrated diagrams |
|---|---|---|---|
| Purpose | Evocative, sets tone | Explain relationships | Explain relationships through illustration |
| Format | Raster (AVIF/WebP) | Inline SVG | PNG, JPEG, or WebP |
| Produced by | Image generator, from the hero template below | Authored by hand | Image generator, from the selected diagram prompt |
| Themeable | No | Yes, reads design tokens | No |
| Text readable by crawlers | Supplied as alt text and prose | Yes | Supplied as alt text, caption, and prose |

The owner approved the raster infographic style on 2026-09-27. Generated diagrams
can carry the richer illustrated treatment. Their important relationships also
belong in readable page text. Simple boxes and connections can use SVG.

Inspect generated labels, arrow routes, and enclosure membership before using an
image. Save the specific generation prompt beside the selected workspace asset.

---

## 1. Hero and editorial images

### Style

Choose each hero from the article's specific argument, example or relationship.
Identify that connection in its saved prompt, and inspect whether the final
60:13 crop still communicates it. A generic workshop, laptop, gears or decorative
code is insufficient without a visible relationship to the article's subject.
Vary the scene and metaphor across a series while preserving the shared style.

The established look is **hand-drawn technical editorial illustration**. Fine ink
linework, warm paper, and restrained colour tie the images together. Engineering
sketches are one subject treatment in the set; people, software workspaces, screens,
and other article-specific scenes belong in it too.

Consistent traits:

- Fine black ink linework and cross-hatching
- Off-white or warm paper background
- Mostly monochrome rendering
- Very limited accent colours: red, orange, blue, green, cyan
- Engineering, blueprint, and workshop imagery when it serves the article
- Slightly retro instructional-manual aesthetic
- Realistic objects, illustrated rather than photorealistic
- Diagrammatic composition: gears, machines, screens, cables, architecture, annotations
- Occasional exaggerated metaphorical scenes
- Visible pencil and ink construction marks, so it reads as drawn

Two related substyles run through the set. People, desks, servers, software screens,
computers, and vehicles lean toward **vintage technical editorial illustration**.
Engines, machinery, gears, testing devices, and blueprints lean toward **industrial
design sketch and patent-style technical illustration**, though more expressive than a
true patent drawing. Choose the subject from the article, then choose the treatment
that makes that subject legible.

### Reusable prompt template

Keep the shared visual traits in the style clause. Before writing the subject, read
the article and identify its central claim and a concrete consequence or scene that
could make that claim visible. Avoid defaulting to gears or machinery for software
topics. A hero should evoke the article. Use the diagram workflow below for a
technical explanation with labelled components and relationships.

```
Hand-drawn technical editorial illustration, fine pen-and-ink linework and
cross-hatching, warm ivory paper background, mostly monochrome with sparse selective
color accents, visible pencil construction marks, slightly retro instructional-manual
character, sophisticated conceptual metaphor, clean white space, detailed but not
photorealistic.

Article idea: <the claim the reader should connect to the image>
Subject: <one concrete scene or action that makes the idea visible>
Canvas: 2400 x 520 pixels, exact 60:13 aspect ratio, article hero.
Composition: <a panoramic scene with the complete important relationship in the
center band; keep essential subjects clear of all crop edges>
No text, code, labels, logos, or watermark.
```

Shorthand name for the style, where a generator accepts one: **technical editorial
ink sketch**. Add **industrial design sketch** only when machinery is the subject.

### Fixed dimensions

| Role | Aspect ratio | Export pixels |
|---|---|---|
| Homepage banner | 20:7 | 2400 x 840 at 2x |
| Article hero | 60:13 | 2400 x 520 at 2x |
| Tag / section hero | 20:7 | 2400 x 840 at 2x |
| OG card | 40:21 | 1200 x 630, generated at build time |

For every article hero, request a 2400 x 520 canvas explicitly. If the generator
cannot supply that exact canvas, request its highest-resolution landscape output,
at least 2400 pixels wide, with the complete scene composed for a centered 60:13
crop. The delivered source must contain at least 2400 x 520 usable pixels.
Inspect its actual dimensions; prompt wording alone does not establish them.
If the available generator cannot meet that resolution, report the limitation
instead of silently upscaling or substituting a smaller export.

The conversion tool center-crops and downsizes to the exact role dimensions.
It rejects undersized sources. Keep the original outside the repository and
record its actual dimensions, the export dimensions and conversion settings in
the adjacent prompt file. Preserve the original generation brief as provenance;
append any later conversion or composition changes rather than rewriting history.

Article pages enforce the 60:13 frame, including for older assets with other
dimensions. At 1200 pixels wide it is 260 pixels tall and scales proportionally
on smaller screens. Inspect the crop at desktop and phone widths: keep essential
subjects visible and regenerate a wider composition if cropping loses the idea.
Compression controls bytes and detail; it must not determine the display ratio.

### Generating one

In an interactive Codex task, use the built-in `image_gen` tool. Read the article,
fill in the article idea, subject, and composition in the template above, and request
the canvas and resolution specified above. Inspect the result for a clear relationship to the article,
unrelated objects, and garbled text. Revise the prompt and regenerate when needed.
The generator saves the original PNG outside the repository; convert the selected
image with `tools/prepare-image.mjs` before adding it to `src/assets/heroes/`.

For a separate shell-driven Codex task, `tools/codex-desktop.sh` resolves the desktop
binary and can ask that task to use its built-in image tool. The standalone CLI once
lagged the desktop release and failed to run the image task. Keep the full article
idea, subject, composition, and no-lettering instruction in either route.

### Tag page heroes

A new tag creates a new HTML topic page. Use the same visual style as article
heroes, but choose its scene from the tag's label and description in
`src/data/tags.ts`. Review the pages that carry the tag when choosing a scene.
The image should represent the collection's subject, rather than a detail from
the post that happened to introduce the tag. Compare nearby tag images so the
new scene is distinct.

Use an existing `src/assets/heroes/tag-*.prompt.md` as the prompt structure.
Keep its visual language and wide composition, replace the collection description
and scene, and save the exact prompt as
`src/assets/heroes/tag-<slug>.prompt.md`. Generate and inspect the image, then run
`node tools/prepare-image.mjs <generated.png> tag-<slug> --role section` to create
the paired WebP in the 2400 x 840 section frame. Include those
dimensions in the tag prompt. Run `python tools/check-tags.py` after adding the
tag; it requires both files.

### Originals stay out of the repo

The generator returns multi-megabyte PNGs. The first one was 2.76 MB. Committing those
compounds badly, because git history keeps every version forever, Pages caps a
published site at 1GB, and Git LFS cannot help since Pages does not resolve LFS
pointers.

Convert before committing:

```bash
node tools/prepare-image.mjs <generated.png> <slug>
```

That writes `src/assets/heroes/<slug>.webp` at exactly 2400 x 520 with WebP quality
82. For a homepage banner or section hero, add `--role banner` or `--role section`
to export 2400 x 840. These fixed sizes replace the earlier width-only conversion.
Inspect fine linework after conversion; file size alone is not a quality check.
Astro then optimizes further per
breakpoint at build time, which only happens for images under `src/`, not `public/`.

### Provenance

Each image's specific prompt is saved next to the image, so a regenerated or replaced
image still matches the set. Editing the template restyles everything produced
afterwards.

### Fallback

Every section has a fallback image for previews. Published topic pages require
their own art; the tag check prevents a new tag from shipping with the fallback.

---

## 2. Diagrams

### Diagrams recovered from recordings

Inspect the actual frames before reproducing a diagram from a video-derived
article. Retain its components, exact labels, grouping, connections, arrow
directions and marker meanings. Improve legibility and styling without replacing
the source model with a newly invented explanation. Save the source timestamp
and frame evidence outside the public repository and document the comparison in
the article's verification record. Keep source-video narration out of the
published caption; explain the relationship directly.

Additional explanatory figures may support the prose, but they do not substitute
for a source diagram. Distinguish additions in the verification record and never
claim they reproduce a frame that was not inspected.

### Approved style and prompt

Use [generate-pastel-boxology.md](../prompts/generate-pastel-boxology.md) by default for new
diagrams. The assistant reads the article and writes the complete drawing brief;
the owner need not supply a prompt. A written description or source image can also
supply the subject.
It specifies the approved pastel palette, dimensional rounded platforms, soft
outlined pictograms, luminous curved ribbon arrows, faint drafting details, and
balanced subject heading. Its reference image is retained in
`public/images/diagrams/functional-acceptance-testing-at-the-boundary.jpg`.

Generate PNG or JPEG for richly illustrated diagrams. Keep the original at native
resolution and export smaller versions as needed. Record the actual delivered
dimensions. Provide descriptive alt text and explain the important relationships
in a caption or nearby prose.

### Flat diagrams with fine outlines

Use [generate-flat-fine-line-diagram.md](../prompts/generate-flat-fine-line-diagram.md)
for flat cards with delicate coloured outlines, bold condensed lettering, navy
connectors, and a pale blue-grey textured vignette. The owner supplied the Custom
Exceptions image on 2026-10-02 as the style reference. Its optimized copy is
retained at [flat-fine-line-diagram.webp](style-references/flat-fine-line-diagram.webp).

Combine the shared style prompt with a separate drawing brief containing the
new subject, exact labels, component counts, groups, arrow directions, and any
marker or legend meanings. The assistant completes the brief from the article
or supplied description. The reference's exception hierarchy and icon meanings
remain specific to that drawing. Its condensed diagram lettering is independent
of the website's reading font.

This option keeps cards flat and their borders fine, approximately 1.3–1.5
pixels at an image width of 1820 pixels. Connectors remain slightly heavier for
clarity. Follow the same label, connection, and accessible-caption checks used
for the other diagram styles.

### Sculpted 3D options

The owner approved these additional styles on 2026-09-30 for illustrations
within articles. Choose a prompt by the kind of image needed:

| Prompt | Result | Options |
|---|---|---|
| [Generate a sculpted 3D infographic](../prompts/generate-sculpted-3d-infographic.md) | Mostly frontal dimensional icons, shallow depth, and clear diagrammatic connections | Off-white or midnight-navy background; satin or matte finish |
| [Generate a 3D technical diorama](../prompts/generate-3d-technical-diorama.md) | A miniature world with platforms, equipment, physical paths, and an elevated three-quarter camera | Clean explanatory or cinematic presentation; satin or matte finish |

Both share charcoal and blue-grey structures, cyan or teal, amber or gold, and
green accents, bevelled forms, and tactile surfaces. The assistant derives the
complete scene from the article or description. Reference images are optional.
Keep colour meanings consistent and verify that each symbol communicates the
intended idea.

People are optional and appear only when requested. Use a recognisable physical
object, such as a van, doorway, or desk, to establish their scale. People and
equipment share that scale; explicitly identified oversized diagram symbols can
remain symbolic. Inspect seated and standing figures together, including their
furniture, perspective, and contact with the ground.

The prompt trials covered acceptance testing, answers grounded in source
documents, and order fulfilment in both styles. Each style also received a matte
refinement and an order-fulfilment edit with one seated and one standing adult.
The text-only trials produced a consistent visual family; satin prompts could
produce stronger reflections and glow than the initial references. The matte
option softened that finish. Human scale still required inspection: the seated
figure in the light infographic appeared larger relative to the standing figure.
These trials establish useful starting points, not guaranteed diagram accuracy
or exact physical dimensions. The exploratory images remain outside the repository.

Use the inspection and asset workflow in each prompt. Save the exact scene brief
beside the selected optimized image and explain its relationships in accessible
article prose. Hero and tag art continue to use the ink style above.

### SVG rules

Simple boxology can use authored inline SVG in the same visual style.

- **Colours come from design tokens.** Never a literal hex value. A diagram then
  follows the site into dark mode and survives a re-skin.
- **Labels are real `<text>`.** Never paths, never embedded raster.
- **Every diagram is a `<figure>`** with a `<figcaption>`, and the `<svg>` carries
  `role="img"` and an accessible name.
- **Legible at phone width.** Prefer vertical flow. A wide graph that needs horizontal
  scrolling on a phone should be split.
- **No text below 11px** at rendered size.

### Node taxonomy

Workflow diagrams reuse a fixed vocabulary, so the same shape means the same thing
across articles. Taken from a production spec-to-test verification pipeline:

| Node type | Meaning |
|---|---|
| `controller` | Imperative code governing progression |
| `worker` | Bounded model reasoning |
| `validation` | Executable check or policy gate |
| `artifact` | Persisted output |
| `terminal-ok` | Successful end |
| `terminal-fail` | Fail-closed stop with retained evidence |

The fail-closed path is drawn on every workflow diagram that has one. It is the point
most of the writing turns on: an incomplete run cannot become a clean result.

### Markdown authoring

Within article markdown, a diagram is referenced by name rather than pasted inline, so
prose stays readable and the `.md` twin is not polluted with several hundred lines of
SVG:

```
<Diagram name="controlled-workflow" />
```

The component resolves the name against `src/components/diagrams/`.

---

## 3. Open questions

- Whether the Drive folder of 30 existing samples should be mirrored into the repo, or
  referenced and converted on demand.
- Whether to wire generation into the build, or keep it a deliberate manual step.
  Manual is the current default, since an image is cheap to make and expensive to
  regret.
- Whether OG cards should use the hero art or a generated text card.
