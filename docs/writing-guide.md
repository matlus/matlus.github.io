# Writing guide

## Idea and note callouts

Use a callout for a short point the reader should notice while reading an article.
Keep the surrounding section heading and place the callout beside the passage it
helps explain.

- **Idea:** a principle, useful connection, or approach the reader can apply. Its
  icon is a lightbulb.
- **Note:** context, a qualification, or a practical detail needed to interpret the
  nearby text. Its icon is a folded page.

Choose the type by the point's purpose. Keep the text understandable on its own.
The visible box contains the icon and the text, without a separate type heading.
Use callouts sparingly so they retain their emphasis.

### Markdown syntax

Paste this HTML into an article's Markdown, with a blank line before and after the
outer `div`. Use HTML paragraphs, lists, and links inside the content wrapper.

```html
<div class="article-callout" role="note" aria-label="Idea">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#idea"></use></svg>
  <div class="article-callout__content">
    <p>Make the hidden decisions explicit.</p>
  </div>
</div>
```

For a note, change the accessible label to `Note` and the icon reference to `#note`:

```html
<div class="article-callout" role="note" aria-label="Note">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#note"></use></svg>
  <div class="article-callout__content">
    <p>The example uses the supplied log and its stated category rules.</p>
  </div>
</div>
```

The same markup works in Astro templates. The shared styles are loaded by
`BaseLayout.astro`, so an article needs no local CSS or JavaScript. Existing
published posts can use this markup when their content is next edited. Adding
the shared style does not add callouts to other posts automatically.

### Accessibility and themes

Keep `role="note"` and the matching `aria-label` on the outer box. Assistive
technology can identify the type without a visible label. The SVG is decorative:
keep `aria-hidden="true"` and `focusable="false"`. The type remains available if
the icon does not load. Ordinary links inside a callout remain keyboard accessible.

Both types use the site's text, accent, accent-wash, and border tokens. The icons
inherit `currentColor`, use the navigation icons' 24-unit grid and 1.8-unit stroke,
and have distinct shapes. Light and dark mode use the same markup. Text can wrap
within the flexible content column.

The shared CSS is in `src/styles/base.css`; the two icon symbols are in
`public/icons/callouts.svg`. Check both variants on the
[style reference page](https://matlus.com/style-guide/#callout-heading) in light
and dark mode after changing either file. Check the article's Markdown twin,
links, wrapping, and accessibility attributes as well as the visual result.

Run the repository's full publication checks from `AGENTS.md` before publishing.
