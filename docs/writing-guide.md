# Writing guide

## Blog voice and teaching flow

Use the [blog-writing skill](../.agents/skills/blog-writing/SKILL.md) for every
website article and article edit, regardless of whether its source is a video
transcript, notes, code or original writing. It combines clarity principles with guidance
on introducing ideas, developing examples, explaining code, and preserving his
opinions and purposeful questions. Pronouns follow the context.

The [recovered Matlus archive](source-material/matlus-wayback/README.md) contains
53 original articles as writing samples and source material. Read a relevant
sample when preparing a substantial draft. Preserve the archive and make
editorial changes in publication copies.

## Standalone articles

An article teaches the subject directly. Its reader should not need to know that
a video or transcript supplied the material. Avoid "in the video," "the presenter
explains," "as shown on screen," and similar narration in prose and captions.
Keep YouTube and repository links as optional resources in frontmatter and resource
cards, without making them prerequisites for understanding the article.

Turn visual demonstrations into written examples with the needed code, inputs,
results, diagrams and explanation. A reference to a figure or listing must point
to something actually present on the page. Removing a screen reference must not
remove the teaching that surrounded it. Keep historical measurement limits and
sample limitations explicit, expressed in terms of the experiment or code.
Source corrections and provenance comparisons belong in editorial records.

Use the [transcript workflow](../prompts/transcript-to-standalone-teaching-article.md)
when adapting a recording. Before accepting a draft, read its body, captions,
alternative text and conclusion without the source open. Check for both explicit
video references and implicit dependencies on unseen demonstrations.

## Article images

Every article prepared for publication needs a 1600 x 534 hero (approximately 3:1)
and a separate 1200 x 500 listing card (12:5). Follow the
[image guide](image-and-diagram-guide.md#required-article-card-workflow) and
[card brief](../prompts/generate-article-card.md). Use the hero as the visual
edit target after the title and hero are settled. Outpaint into the card ratio,
preserving the complete scene and existing subject scale; a matching-ratio hero
only needs a card-sized export. Recompose only if the derivative is unreadable.
Inspect complete faces and working hands in the full card with its title at
about 366 x 153 image pixels and at phone widths. Save both
optimized assets and their exact prompts; verify the listing selects the companion.
Keep existing approved heroes for image-only card additions. Social preview images
have their own dimensions and build process.

## Links and publication checks

Every off-site HTTP(S) hyperlink must open a new tab. This includes YouTube,
Microsoft documentation, GitHub repositories and other references, whether the
link appears in prose, raw HTML, a resource card or a shared component. Internal
article links and section anchors keep their normal navigation behavior.

Use ordinary Markdown links when writing. The shared rendering middleware adds
`target="_blank"` and `rel="noopener noreferrer"` to external anchors in the final
HTML, preserving other useful relationship values such as `nofollow`. This runs
for preview and static publication and requires no reader-side JavaScript.
The original source archives and Markdown text remain intact.

Before publishing, run the complete checks in `AGENTS.md`, then run
`python tools/check-links.py dist`. The generated-link check also enforces this
external-link policy on every HTML page and runs in deployment CI. Verify an
external article link in the browser as part of the rendered-page review.

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
