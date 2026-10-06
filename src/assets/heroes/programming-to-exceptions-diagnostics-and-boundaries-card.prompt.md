# Programming to Exceptions: diagnostics-and-boundaries companion card

Built-in image generation, 2026-10-06. Edit reference:
`programming-to-exceptions-diagnostics-and-boundaries.webp` (2400 x 520).
The existing hero remains unchanged. This companion brings the foreground action
closer for the 1200 x 500 listing frame instead of fitting the full panorama.

## Framing refinement

The first result clipped the top of the hair. Refined from
`exec-a500b108-208d-44c8-aae4-29bfcbb4f284.png` with this exact instruction:

```text
Fix the framing only. This companion article card currently CLIPS THE TOP OF THE WOMAN'S HAIR. Preserve her identity, profile, hands, exact activity and all meaningful instruments/screens. Zoom the whole illustrated scene out by about 15%, recompose inward, and redraw enough warm ivory background above it so the ENTIRE auburn bun and ALL loose hair are fully INSIDE the canvas with at least 6% of image height CLEAR BACKGROUND above the tallest strand. All working hands and the handheld evidence card remain fully visible. Keep the foreground person large, around half the image height for the complete head including hair. Request landscape 1440 x 600 or larger, exact 12:5 (2.4:1). Continue the workbench and background naturally to the edges; no padding stripes, no border, no new people, no lettering. The full hair silhouette with generous clearance is mandatory.
```

Selected original: `exec-913a6cb7-2454-4b12-b45a-da48b83ac51a.png` in the local
Codex generated-images directory. Source 1942 x 809; exported to 1200 x 500
WebP quality 82 with `tools/prepare-image.mjs --role card`, downsampling with
negligible centered framing and no upscaling. Full head, face and hands retained.

## Complete initial prompt

```text
Use case: compositing. Edit the supplied hero into a dedicated website listing-card illustration. Exact 12:5 landscape ratio (2.4:1), request 1440 x 600 or larger, final downsample 1200 x 500. Preserve the same vintage technical editorial pen-and-ink illustration, warm ivory paper, detailed crosshatching, restrained brass/gray machinery and selective orange, blue and green. Recompose/redraw for a CLOSE foreground scene that fills the card at 365 x 152 display pixels. Do not fit the entire panoramic hero into this card. Keep full important heads, hair, faces, working hands and defining objects visible with about 5% breathing space; no empty horizontal padding bands. Preserve source subject identities and physical scale. Remove all lettering and labels, replacing tiny screen text with simple abstract lines and icons; no words, logos, watermark or collage panels. Article idea: a failure retains its cause and diagnostic context as it crosses a boundary and reaches an investigator. Focus on the auburn-haired woman with a bun from the RIGHT foreground. Show her at right in a readable three-quarter profile, whole head and working hands visible, using the original magnifying glass to inspect a diagnostic evidence card at a desktop console. The console at center shows one large orange-exclamation record with a few nested blue context cards, represented with clear icons and abstract lines. A compact blue-glass boundary gate at left passes a small grouped packet of the same orange and blue cards toward her. Simplify and pull these three elements close together. Omit the distant man, far-left woman, long conveyor and server rows. Make her face, magnifier, hands and orange record the visually dominant group; the gate is supporting context.
```
