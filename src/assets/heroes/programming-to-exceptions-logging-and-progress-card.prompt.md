# Programming to Exceptions: logging-and-progress companion card

Built-in image generation, 2026-10-06. Edit reference:
`programming-to-exceptions-logging-and-progress.webp` (2400 x 520).
The existing hero remains unchanged. This companion brings the foreground action
closer for the 1200 x 500 listing frame instead of fitting the full panorama.

## Framing refinement

The first result clipped the top of the hair. Refined from
`exec-50aaed40-3f1e-4caf-92c2-a65bf86c81e1.png` with this exact instruction:

```text
Fix the framing only. This companion article card currently CLIPS THE TOP OF THE WOMAN'S HAIR. Preserve her identity, profile, hands, exact activity and all meaningful instruments/screens. Zoom the whole illustrated scene out by about 15%, recompose inward, and redraw enough warm ivory background above it so the ENTIRE auburn bun and ALL loose hair are fully INSIDE the canvas with at least 6% of image height CLEAR BACKGROUND above the tallest strand. All working hands and the handheld evidence card remain fully visible. Keep the foreground person large, around half the image height for the complete head including hair. Request landscape 1440 x 600 or larger, exact 12:5 (2.4:1). Continue the workbench and background naturally to the edges; no padding stripes, no border, no new people, no lettering. The full hair silhouette with generous clearance is mandatory.
```

Selected original: `exec-30048d46-af69-4b02-8277-74027fd1457d.png` in the local
Codex generated-images directory. Source 1942 x 809; exported to 1200 x 500
WebP quality 82 with `tools/prepare-image.mjs --role card`, downsampling with
negligible centered framing and no upscaling. Full head, face and hands retained.

## Complete initial prompt

```text
Use case: compositing. Edit the supplied hero into a dedicated website listing-card illustration. Exact 12:5 landscape ratio (2.4:1), request 1440 x 600 or larger, final downsample 1200 x 500. Preserve the same vintage technical editorial pen-and-ink illustration, warm ivory paper, detailed crosshatching, restrained brass/gray machinery and selective orange, blue and green. Recompose/redraw for a CLOSE foreground scene that fills the card at 365 x 152 display pixels. Do not fit the entire panoramic hero into this card. Keep full important heads, hair, faces, working hands and defining objects visible with about 5% breathing space; no empty horizontal padding bands. Preserve source subject identities and physical scale. Remove all lettering and labels, replacing tiny screen text with simple abstract lines and icons; no words, logos, watermark or collage panels. Article idea: structured logs retain the facts needed to find and investigate failures. Focus on the auburn-haired foreground investigator from the RIGHT side of the reference, in clear three-quarter side profile on the right. Show her entire head and hair with comfortable margin, one hand holding an orange-exclamation record and the other indicating its matching highlighted row on the nearby search console at center. Keep the blue search console compact with clear abstract rows, an orange highlighted match and a simple magnifying glass symbol, absolutely no readable text. At left put three small blue/orange/green record drawers feeding the console, with one compact brass logging instrument behind. Make the investigator and her evidence large, waist-up. Remove the distant dark-haired operator, long process chain, upper step labels and reproduction display. Retain the original warm workbench and a few relevant papers, not empty paper margins.
```
