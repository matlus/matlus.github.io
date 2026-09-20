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

The established look is **vintage engineering sketch illustration**: hand-drawn
technical editorial illustration sitting between editorial illustration, industrial
design sketch, and technical manual drawing. It is not comic art, not blueprint art,
and not architectural sketching.

Consistent traits:

- Fine black ink linework and cross-hatching
- Off-white or warm paper background
- Mostly monochrome rendering
- Very limited accent colours: red, orange, blue, green, cyan
- Engineering, blueprint, and workshop imagery
- Slightly retro instructional-manual aesthetic
- Realistic objects, illustrated rather than photorealistic
- Diagrammatic composition: gears, machines, screens, cables, architecture, annotations
- Occasional exaggerated metaphorical scenes
- Visible pencil and ink construction marks, so it reads as drawn

Two related substyles run through the set. People, desks, servers, workshop scenes,
computers and vehicles lean toward **vintage technical editorial illustration**.
Engines, machinery, gears, testing devices and blueprints lean toward **industrial
design sketch and patent-style technical illustration**, though more expressive than a
true patent drawing.

### Reusable prompt template

Keep this verbatim as the style clause. Append only the subject.

```
Hand-drawn technical editorial illustration, pen-and-ink line art with detailed
cross-hatching, warm ivory paper background, vintage engineering manual aesthetic,
realistic mechanical forms, sparse selective color accents, visible drafting marks,
sophisticated conceptual metaphor, clean white space, highly detailed but not
photorealistic.

Subject: <one sentence describing what the illustration depicts>
```

Shorthand name for the style, where a generator accepts one: **vintage engineering
sketch illustration**.

### Fixed dimensions

| Role | Aspect | Pixels |
|---|---|---|
| Homepage banner | 1200 x 420 | 2400 x 840 at 2x |
| Article hero | 1200 x 260 | 2400 x 520 at 2x |
| OG card | 1200 x 630 | generated at build time |

### Provenance

Each image's specific prompt is saved next to the image, so a regenerated or replaced
image still matches the set. Editing the template restyles everything produced
afterwards.

### Fallback

Every section has a fallback image. A page without custom art must still render
correctly, because the moment art becomes mandatory, the page without art is the page
that never ships.

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
across articles. Taken from the DevWeave spec-to-test architecture:

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

- Which generator to use for hero images. NotebookLM produced the existing set;
  a scriptable path would let the build request art for a new post.
- Whether the Drive folder of existing samples should be mirrored into the repo, or
  referenced and downloaded at build time.
- Whether OG cards should use the hero art or a generated text card.
