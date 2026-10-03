# Turn a transcript into a standalone teaching article

Use this prompt for an owner-authorized blog article derived from a technical
video. It complements `docs/transcript-ratification-handoff.md`. The article is
written for someone who has neither watched the video nor opened its repository.
PWI corpus chapters retain their separate mechanical conversion contract.

## Inputs

- The complete transcript and any existing chapter or canonical manuscript.
- The public source video, its verified publication date, and relevant public code.
- The owner's corrections and current guidance, which take precedence over older
  recordings or manuscript wording.
- The site's frontmatter schema and any existing published article URL.

## Writing brief

Read the complete source before drafting. Establish the central teaching claim,
the responsibilities or distinctions that support it, and the examples needed to
make it understandable. Apply the blog-writing skill at
`.agents/skills/blog-writing/SKILL.md` to new article prose.
Preserve the author's position and technical vocabulary.

Make a coverage checklist from the complete transcript before drafting. Carry
each substantive concept, rationale, distinction, qualification and example into
the article. Repeated emphasis can identify the central teaching claim; retain
the explanation even when the repeated wording is removed. For example, a
Factory article must explain programming to an interface at the call site,
including the base-typed variable, the base class's public methods and the
Factory's responsibility for selecting the concrete descendant.

Explain concepts when first introduced. Replace greetings, screen references,
requests to pause a video, and recording chatter with explanations that work on
the page. Use the author's first-person voice where it expresses an actual
position or experience. Do not invent anecdotes or conclusions.

Put the needed code inline. Define the example's relevant models, exceptions and
dependencies. Verify repository excerpts against the actual source. Identify
reduced or adapted teaching implementations explicitly and explain differences
that affect behavior. Compile and exercise complete teaching examples when
practical; distinguish those checks from verification of the historical system.

Add a diagram when it makes a relationship easier to follow. Derive its brief with
`prompts/generate-pastel-boxology.md`, using the approved pastel architectural
style. Preserve the actual components, arrow directions and boundaries. Inspect
the generated labels and connections, and supply descriptive alt text and a
caption that carries the important relationships into Markdown exports.

Keep the video as an optional source resource in frontmatter and resource cards.
Do not refer to the video, recording, transcript or chapter draft in the article
body. Avoid narration such as "the video shows," "in the recording" or "the
later discussion explains." Explain the concept and example directly. The
article must teach everything needed without the reader watching or opening
another source. State the limits of a reduced teaching example in terms of its
behavior, and keep provenance comparisons in editorial records.

Store private transcript links outside the public
repository. Record editorial tasks in `docs/article-review-backlog.md`; retain
reader-facing qualifications when they affect interpretation of a sample.

Before publication, compare the finished article against the coverage checklist
and scan its body for recording references, missing code dependencies and absent
screen references. Remove recording logistics, not the teaching they surround.

## Assets and publication

Create an article-specific technical editorial ink hero using the site's image
guide. Save each selected image's complete prompt beside the asset and convert
raster originals to the repository's optimized format.

Have a read-only metadata sub-agent apply
`prompts/extract-description-and-tags.md` to the full final article. Reuse the
controlled vocabulary. Add any necessary new tags with their own hero prompts
and images, then run the tag checker.

Preserve published URLs. Add the requested hub links and useful further reading.
Run the professional-writing audit, site copy audit, typecheck, build, tag check
and generated-link check. Inspect the rendered article, code and figures.

Commit, push, open a PR, merge or publish only within the owner's authorization.
For joint publication, keep a first revision outside the content collections until
both articles can be activated together. After publication, verify the deployment
against its merge commit, fetch the canonical article pages and Markdown twins,
and complete the public video and repository cross-links required by `AGENTS.md`.
