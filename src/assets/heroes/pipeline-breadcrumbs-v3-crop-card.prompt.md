# pipeline-breadcrumbs: card composition experiment

Reference: https://matlus.com/writing/pipeline-breadcrumbs/

Built-in image generation, 2026-10-06. The published hero was the edit reference:
`C:/Users/shivk/.codex/worktrees/pipeline-breadcrumbs-article/matlus.github.io/src/assets/heroes/pipeline-breadcrumbs-v3-crop.webp`.

## Complete initial prompt

```text
Use case: compositing. Edit the supplied published Pipeline Breadcrumbs hero into a companion listing-card illustration. Target canvas 1440 x 600 pixels, exact 12:5 (2.4:1) landscape. Preserve the same auburn-haired adult woman with a loose bun, ivory shirt and dark apron, the small cream-and-brass robot with blue eyes, the magnifying glass, orange tangled-result document, blue pipeline accents, vintage technical editorial ink linework, and warm workshop palette. Recompose for a close view of the WOMAN AND ROBOT TOGETHER, both complete heads, her face, both working hands, the magnifying glass, and the orange document fully within frame with modest breathing room. Her attentive face, the robot and their shared inspection of the document are the focal group and must read clearly at 366 x 153 pixels. Bring the robot alongside her shoulder/forearm at its original small physical scale; do not enlarge it to human size. Retain only two or three compact blue-result pipeline stations to one side and one orange failed-result station leading toward the inspection. Compress the distant workshop and shelving into quiet background detail. Show a little workbench to support the document; omit peripheral stacks and large empty room areas. Preserve their identities and expressive relationship, no additional people. No words, lettering, logos, watermarks, frame, padding bands, or collage panels.
```

Initial result: `C:/Users/shivk/.codex/generated_images/01a1110c-cf3d-7380-b3d4-d284ad2fa25a/exec-1e6ce154-81d4-4d9e-9d28-8c9cb0ae0b4c.png`.

## Framing refinement

The first candidate touched the top edge. This refinement restored breathing room
above the foreground hair while retaining the close composition.

```text
Make only a small framing correction to this image. Keep the same exact people, faces, poses, objects, relationships, linework, colors, and 12:5 (2.4:1) landscape composition. The hair currently touches or crosses the top edge. Pull the entire composition back slightly, about 8 percent, so every foreground person's COMPLETE hair silhouette has a clear 5 percent canvas-height margin of natural background above it, and preserve full hands and important foreground objects. Extend the existing natural backdrop to the edges with no border or letterbox. Keep the people large and prominent; do not add people or extra machines. No words, logos, watermark, or panels. Requested canvas 1440 x 600 pixels.
```

## Saved export

Selected original: `C:/Users/shivk/.codex/generated_images/01a1110c-cf3d-7380-b3d4-d284ad2fa25a/exec-e890e855-a83d-4bc7-a560-c01de1e10ec9.png`.

Native output: 1942 x 809. Review export: **1200 x 500**, exact **12:5 (2.4:1)**,
WebP quality 82, downscaled with centered framing. The source aspect differs from
12:5 by less than 0.03%; only subpixel rounding is needed when sizing the export.
No upscaling. The hero remains unchanged.

This is an editorial card illustration. Apparatus was simplified and rearranged
for recognition at small sizes; use the article's diagrams for exact relationships.

Publication companion: `pipeline-breadcrumbs-v3-crop-card.webp`, matching the
article's `hero: pipeline-breadcrumbs-v3-crop` asset name. This is the approved
experiment export, reused without another crop or generation.

