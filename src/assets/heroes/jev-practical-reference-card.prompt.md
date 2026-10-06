# jev-practical-reference: companion article card

Built-in image generation, 2026-10-06. Edit reference: `jev-practical-reference.webp`.
The approved source hero remains unchanged.

## Complete prompt

```text
Create an edited companion article-card illustration from the supplied hero. Landscape exact 12:5 aspect ratio (2.4:1), requested 1440 x 600 pixels, for final downsample to 1200 x 500. Recompose and redraw to fit this frame, preserving the original hand-drawn technical editorial ink style, warm ivory paper, fine crosshatching, sparse orange and cyan. Fill the frame with an interesting readable action at 365px card width. Keep all important hands, faces and objects inside frame with 5% breathing space. No text, labels, logos or watermark. Preserve the same woman with dark hair in a bun, shown in three-quarter profile on the left, with her entire head/hair and her working hand visible. She feeds a leaf evidence card into the compact instrument. Place her head slightly lower with clear ivory space above her hair. The instrument's three panels (shapes, dial, binary light) and adjacent control sliders occupy center/right. Simplify peripheral desk clutter and background architecture, keeping the person and bounded-judgment instrument large and clearly connected. Retain the evidence review tray if space permits, reduce background objects first. No new people.
```

## Export

Generated original: `exec-d1c6979e-0c1e-4ee9-bf26-e32ed260a621.png` in the local Codex generated-images directory.
Measured source: 1942 x 809 pixels. Selected after visual inspection of the
complete foreground action. Export: 1200 x 500, WebP quality 82, using
`node tools/prepare-image.mjs <original.png> jev-practical-reference-card --role card`.
Downsampled with a negligible center crop; no upscaling.
