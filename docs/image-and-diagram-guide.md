# Images and Diagrams

Status: draft, 2026-09-20

The site has **two separate visual pipelines**. They serve different purposes, are
produced by different means, and should never be confused.

| | Hero and editorial images | Diagrams |
|---|---|---|
| Purpose | Evocative, sets tone | Precise, carries information |
| Format | Raster (AVIF/WebP) | Inline SVG |
| Produced by | Image generator, from the prompt template below | Authored by hand |
| Themeable | No | Yes, reads design tokens |
| Text readable by crawlers | No | Yes |

That last row decides the boundary. A generated picture of a directed graph adds
nothing to LLM retrieval, because its labels are pixels. An authored SVG's labels are
real text that a crawler and a retrieval agent can read. Anything carrying information
is a diagram and belongs in SVG.

Image generators also garble technical text. The OCR of an existing generated
architecture diagram returned strings like "Separate le catalogs and record the act
evidence univer". That is not a tuning problem.

---

## 1. Hero and editorial images

### Style

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
topics. A hero should evoke the article; technical explanation belongs in an SVG
diagram with readable text.

```
Hand-drawn technical editorial illustration, fine pen-and-ink linework and
cross-hatching, warm ivory paper background, mostly monochrome with sparse selective
color accents, visible pencil construction marks, slightly retro instructional-manual
character, sophisticated conceptual metaphor, clean white space, detailed but not
photorealistic.

Article idea: <the claim the reader should connect to the image>
Subject: <one concrete scene or action that makes the idea visible>
Composition: <a wide scene with the important relationship in the center band>
No text, code, labels, logos, or watermark.
```

Shorthand name for the style, where a generator accepts one: **technical editorial
ink sketch**. Add **industrial design sketch** only when machinery is the subject.

### Fixed dimensions

| Role | Aspect | Pixels |
|---|---|---|
| Homepage banner | 1200 x 420 | 2400 x 840 at 2x |
| Article hero | 1200 x 260 | 2400 x 520 at 2x |
| OG card | 1200 x 630 | generated at build time |

### Generating one

In an interactive Codex task, use the built-in `image_gen` tool. Read the article,
fill in the article idea, subject, and composition in the template above, and request
one wide landscape image. Inspect the result for a clear relationship to the article,
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
`node tools/prepare-image.mjs <generated.png> tag-<slug>` to create the paired
WebP. Run `python tools/check-tags.py` after adding the tag; it requires both files.

### Originals stay out of the repo

The generator returns multi-megabyte PNGs. The first one was 2.76 MB. Committing those
compounds badly, because git history keeps every version forever, Pages caps a
published site at 1GB, and Git LFS cannot help since Pages does not resolve LFS
pointers.

Convert before committing:

```bash
node tools/prepare-image.mjs <generated.png> <slug>
```

That writes `src/assets/heroes/<slug>.webp`. The first conversion went from 2.76 MB to
0.29 MB at identical dimensions, an 89.6% saving. Astro then optimizes further per
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

### Rules

Diagrams are inline SVG, authored rather than generated.

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
