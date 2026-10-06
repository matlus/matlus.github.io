# Programming to Exceptions: method-contracts companion card

Built-in image generation, 2026-10-06. Edit reference:
`programming-to-exceptions-method-contracts.webp` (2400 x 520).
The existing hero remains unchanged. This companion brings the foreground action
closer for the 1200 x 500 listing frame instead of fitting the full panorama.

## Framing refinement

The first result placed the top of the hair too near the edge. Refined from
`exec-028e2b64-7033-4723-a269-bdf7144ad9f2.png` with this exact instruction:

```text
Refine only the framing of this article-card illustration. Keep the exact same woman, face, pose, hands, two machines, paper records, pen-and-ink style and warm colors. Exact landscape aspect ratio 12:5 (2.4:1), requested 1440 x 600 or larger. Her topmost hair is currently too close to the canvas edge: move/scale the complete woman and machinery group very slightly lower and inward so there is at least 5% of image height clear ivory background ABOVE her tallest hair, and at least 3% space left of her elbow. Keep her face and hands large. The workbench can continue beyond the bottom edge. Do not make padding bands; extend the existing illustrated background naturally. No lettering or new objects.
```

Selected original: `exec-3076ea39-584e-48bf-b6be-a1cb21e910ff.png` in the local
Codex generated-images directory. Source 1942 x 809; exported to 1200 x 500
WebP quality 82 with `tools/prepare-image.mjs --role card`, downsampling with
negligible centered framing and no upscaling. Full head, face and hands retained.

## Complete initial prompt

```text
Use case: compositing. Edit the supplied hero into a dedicated website listing-card illustration. Exact 12:5 landscape ratio (2.4:1), request 1440 x 600 or larger, final downsample 1200 x 500. Preserve the same vintage technical editorial pen-and-ink illustration, warm ivory paper, detailed crosshatching, restrained brass/gray machinery and selective orange, blue and green. Recompose/redraw for a CLOSE foreground scene that fills the card at 365 x 152 display pixels. Do not fit the entire panoramic hero into this card. Keep full important heads, hair, faces, working hands and defining objects visible with about 5% breathing space; no empty horizontal padding bands. Preserve source subject identities and physical scale. Remove all lettering and labels, replacing tiny screen text with simple abstract lines and icons; no words, logos, watermark or collage panels. Article idea: each method fulfills its contract or propagates its failure to the responsible handler. Make the dark-haired woman with a bun from the LEFT foreground the main person, shown waist-up at left, fully visible head and both hands as she feeds a paper record into one compact green-check machine. At center/right, show one adjacent orange-exclamation machine lifting an exception record onto a short raised chute. Keep these two contrasting machines and their record flow large and clear. Omit the distant woman, upper platform, long belt and peripheral success/failure crates. Keep one short workbench and a few paper sheets. The woman and two machines fill the frame, her head must be at least one quarter of image height and never clipped. Her hands handle the record naturally.
```
