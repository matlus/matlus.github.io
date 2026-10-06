# Compose an article listing card

Read the article and inspect its approved hero before editing. Use the built-in
image tool with that hero as the edit reference. Fill in this brief completely;
the owner should not need to supply a scene description.

```text
Use case: compositing, companion website article-card illustration.
Reference: <the article's approved hero, supplied as an image>.
Article idea: <the concrete action or relationship the illustration conveys>.
Canvas: exact 12:5 (2.4:1) landscape. Final export 1200 x 500 pixels.
Request a 1440 x 600 or larger original in this same ratio for downsampling.
Subject: <the most interesting foreground people, objects and action>.
Composition: recompose or redraw that action for a card displayed around
365 x 152 pixels, also readable at 320 pixels wide. Keep complete important heads,
hair, faces, working hands and defining objects inside the frame with about 5%
breathing space. Preserve the relationship between foreground people when it
matters; select one clear action if including everything makes it too small.
Simplify peripheral machinery, room details and distant figures first.
Preserve: the reference's subject identities, physical scale, article-specific
meaning, fine technical editorial ink, warm ivory paper and sparse accent colors.
Avoid: tiny focal subjects, clipped faces or hands, invented people, dense labels,
words, logos, watermark, collage panels or padding bands.
```

Inspect the returned dimensions; the prompt does not guarantee them. Regenerate
if conversion would remove important content. Keep the source hero unchanged.
Export with `node tools/prepare-image.mjs <original.png> <hero-name>-card --role card`.
Save this completed brief, every refinement, source dimensions and export settings
as `src/assets/heroes/<hero-name>-card.prompt.md`. The matching WebP must be exactly
1200 x 500. Use the hero's frontmatter name even when the article URL differs.

Review the exported card in the actual desktop and phone grid alongside its title.
Check the full composition, human anatomy and identities, readable main action,
and linework after compression. The card is required when preparing every new
article for publication, including one with a historical original date. Follow
[the image guide](../docs/image-and-diagram-guide.md) for the companion hero and
publication checks.
