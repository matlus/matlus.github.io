# using-jev-compact-llm-context: companion article card

Built-in image generation, 2026-10-06. Edit reference: `using-jev-compact-llm-context.webp`.
The approved source hero remains unchanged.

## Complete prompt

```text
Create an edited companion article-card illustration from the supplied hero. Landscape exact 12:5 aspect ratio (2.4:1), requested 1440 x 600 pixels, for final downsample to 1200 x 500. Recompose and redraw to fit this frame, preserving the original hand-drawn technical editorial ink style, warm ivory paper, fine crosshatching, sparse orange and cyan. Fill the frame with an interesting readable action at 365px card width. Keep all important hands, faces and objects inside frame with 5% breathing space. No text, labels, logos or watermark. Focus closely on the archivist's two complete hands selecting a cyan and an orange evidence card together on the wooden reading stand. Both cards and the stand must remain fully visible and large. A shorter row of older evidence cards recedes toward the left, making retained context clear. Keep a small laptop edge at far right as secondary context. Eliminate most empty top and bottom paper and unnecessary background furnishings. Preserve the original headless close-up of working hands, do not invent a face or additional people. Card marks remain abstract ink marks, no letters or words.
```

## Export

Generated original: `exec-5857986c-c284-4b0c-aef1-6971444539ba.png` in the local Codex generated-images directory.
Measured source: 1942 x 809 pixels. Selected after visual inspection of the
complete foreground action. Export: 1200 x 500, WebP quality 82, using
`node tools/prepare-image.mjs <original.png> using-jev-compact-llm-context-card --role card`.
Downsampled with a negligible center crop; no upscaling.
