# Handoff

Written 2026-09-22, at the end of the session that built this site from nothing.
Updated 2026-09-25 for twelve ratified video chapters, four new writing posts,
and the link, index, media, and search cleanup.

The purpose of this document is to let a fresh session pick up without
re-litigating settled decisions. Where a choice looks arbitrary, the reason is
recorded, because most of them were argued to a conclusion rather than guessed.

---

## What this is

A personal site covering coding, AI, and related work. PWI is a major section
rather than the whole thing.

Two audiences drive nearly every technical decision. Human readers arriving from
search, YouTube, or GitHub. And large language models, specifically **live retrieval
at inference time** rather than training ingestion, because retrieval pays off on a
short timescale and can actually be engineered for.

The motivation is concrete. The PWI material is already public as roughly 145 YouTube
videos, but only Google may train on YouTube. Publishing the same material on an open
domain makes it reachable by every crawler. That is why the site carries markdown
twins, `llms.txt`, build-time tag pages, and strict `article`/`aside` separation.
Those are not decoration.

Full specification: [website-spec.md](website-spec.md).

---

## Current state

The site's canonical origin is **https://matlus.com**. GitHub Pages has the custom
domain set with HTTPS enforced.

| | Count |
|---|---|
| Articles | 21 |
| PWI chapters | 12, across 6 topics |
| Aphorisms | 24, with computed backlinks |
| Tags | 60, controlled vocabulary |

**Articles**

- `Using Jev Compact LLM Context` follows a recorded Noul request through
  retention decisions, with downloadable teaching data and implementation snapshots.
  It links to the existing Jev reference and preserves the original source under
  `docs/source-material/`.
- `Skills versus Controlled Workflows` with an interactive workflow diagram
- `Stampede at the Gates`, the problem statement
- `The AI-Native Lifecycle`, the answer to it
- Twelve ratified chapters derived from videos, each published
  by an HTML page and a Markdown twin. Their publication dates follow the original
  YouTube videos; their modification dates record the editorial pass. Pending
  code and recording checks are tracked in `docs/article-review-backlog.md`.
  The first ten retain their ratified prose; Factory and Factory Method were
  revised from their chapter drafts against the full transcripts. Character
  entities in some source files retain ratified punctuation in the rendered HTML;
  the Markdown response decodes them back to the original characters. Two
  deliberate phrases in Design Nugget have narrow copy-audit allowances.
  Factory Method takes its publication date and primary video link from the 2013
  C# demonstration; the 2019 Let's Talk recording supplies later explanation and
  tone. Its code examples still await a frame-by-frame provenance check in the
  article review backlog.
- `Clean Abstractions Around Libraries` and `Intentional Model Design` develop
  historical PWI guidance as writing posts. They link back to the relevant PWI
  chapters, which link to them.
  Boundary validation was expanded within the Python Validation chapter; the C#
  chapter already explains its manager-front-door validator sequence.
- The two Factory posts and two original posts were published together so their
  reciprocal links resolve. The two PWI guideline posts carry the historical
  origin date 2017-09-20 and an update date of 2026-09-25. Direct video adaptations
  use YouTube's displayed publication day. The full inventory and source evidence
  are recorded in `docs/publication-date-audit.md`.

**Chapters**: architecture-layers, class-design, method-design and
naming-conventions and validation-exception-handling all bilingual, plus
linq-query-semantics in C# and type-annotations in Python.

**Infrastructure in place**: markdown twins on every article and chapter, generated
`llms.txt` and `llms-full.txt` (including all published PWI chapters), `robots.txt`
with explicit AI-crawler allows, sitemap,
`Person` with `sameAs` on the homepage, `BlogPosting` for writing, `TechArticle`
for PWI chapters, and `BreadcrumbList` per article, Pagefind search over 98 pages,
a media index generated from actual video and audio frontmatter, design tokens with
dark mode, a style guide page, hero image generation, and copy and generated-link
audits gating CI. Navigation and `llms.txt` link only to published chapter topics;
the tag cloud uses actual published tag counts.

The About page gives Shiv's two professional roles and points readers to the writing
and Programming With Intent sections. It stays deliberately brief without a public
employment history or contact details.

Verified source videos and code repositories appear in resource cards after the
article body. Editorial verification tasks remain in `docs/article-review-backlog.md`
and do not appear in published articles or their Markdown twins.

---

## Open items

### Needs a decision from Shiv

1. **CI wording in The AI-Native Lifecycle.** The source deck says the gated check
   "blocks rather than advises". It currently reads "runs again in CI as a gated
   check", because a standing note says pipeline disposition should not be
   overspecified and auto-fix or merge behaviour is customer-configured. If blocking
   is safe to claim publicly, restore the stronger wording.

2. **Three questions in one paragraph** in Stampede, where the writing skill prefers
   one rhetorical question per piece. Kept deliberately, since that passage is the
   argument's turn, but it is Shiv's voice to judge.

3. **The "note on numbers" section** was cut from Stampede when the real citations
   arrived. Confirm nothing was lost.

### Needs authoring, not conversion

**Functional acceptance testing at the boundary** needs a dedicated article covering
precise arrangements, deep assertions against real outcomes, verification that tests
demonstrate every required feature scenario, and the accumulated regression suite at
gate two. Link it from Stampede when it exists. The 2026-09-26 revision of
Stampede establishes this argument, adds the car illustration and inline SVG figures,
and carries the recurring phrase "Verified, not trusted". The companion lifecycle
article now explains how QA builds UI regression automation alongside human UX judgment.

4. **Domain Facade** deserves a chapter covering:
   folder structure, levels of abstraction, and the sibling rule, where a class talks
   one level down and no further and a sibling needing a sibling is an abstraction
   failure calling for extraction. Some of this already lives in Architecture Layers,
   which has both a Levels of Abstraction and Folder Structure section and a Service
   Interface Layer section. The facade pattern is general; the Domain Facade is
   Shiv's, for the domain layer, and that distinction belongs in the opening.

5. **Video transcripts.** Around 145 videos at roughly one a week. Converting these
   is the single highest-leverage remaining task for the retrieval goal, since
   YouTube content is unreachable to most crawlers. Twelve ratified video chapters are
   present in the local writing collection. The remaining videos need the same editorial
   pass and real YouTube dates, unlike PWI chapters.

### Straightforward work

6. **17 prose chapters pending.** Each needs a one-line description and tags from the
   controlled vocabulary. Both are judgment calls; everything else is mechanical. Fill
   those fields and `section` (`pwi` or `acceptance-testing`) into
   `tools/chapter-manifest.json`, mark `ready`, then run the converter. Both sections
   now have topic hubs, chapter pages, and Markdown companions.

7. **A diagram for The AI-Native Lifecycle**, most usefully gate one's "authored
    once, enforced at two points" flow with the integrity receipt.

8. **Design Patterns as a top-level section.** The `design-patterns` tag covers
    named software design patterns. Architectural patterns and AI workflow patterns
    have separate tags. A dedicated section and navigation placement remain.
    The classification audit is in `docs/pattern-tag-audit.md`.

---

## Decisions already settled

Do not reopen these without new information.

**Review-only rule catalogs stay outside this workspace's content pipeline.** They
belong to the PWI code review system. The chapter manifest tracks only material
being considered for this website.

**Sections are subjects, never maturity levels.** A Research section was dropped
because a section defined by maturity forces a URL change when an idea firms up.
Maturity is a `status` field on the post. All prose lives at `/writing/<slug>`
permanently. A subject that later earns prominence gets a hub page pointing at posts
that never moved.

**Media is a view, not a section.** A recorded or narrated version of an article is
never its own page. `/media/` lists articles carrying video or audio, with the title
linking back to the canonical article.

**Verification with Intent is the Acceptance Testing section**, promoted to top-level
navigation rather than living under PWI, because functional acceptance testing at the
boundary is the practice that earns confidence to ship. Its nav card points at
`/acceptance-testing/` rather than generating a stub under `/pwi/`, which would split
retrieval across two URLs for one subject.

**Chapter numbers never appear in URLs.** The two language families number
independently: Python ch50 is test naming, C# cs50 is testing strategy. Slugs are
topical.

**Languages are named, never counted.** An earlier "applies to both" chip hard-coded
today's language count into data meant to outlive it. `scope` says whether guidance is
language-independent; `examples` says which languages have worked examples. Adding a
language is a one-line union edit, and the build fails until it has a label.

**Need-to-know is an aphorism, not a topic.** It belongs to method design: pass a
method exactly what it needs, nothing more.

**Two visual pipelines, kept separate.** Hero art is generated raster in a technical
editorial ink style, with subjects drawn from each article. Diagrams are authored SVG.
The split is decided by retrieval: a generated picture of a directed graph
contributes nothing because its labels are pixels. Generators also garble technical
text, as an existing generated diagram's OCR demonstrates.

**Concurrency in diagrams is structural.** A stage running N instances is drawn as N
boxes. Collapsing one into a single box hides the fan-out the diagram exists to show.

**Hero originals stay out of git.** The generator returns multi-megabyte PNGs, history
keeps every version forever, Pages caps a site at 1GB, and Git LFS cannot help because
Pages does not resolve LFS pointers. Convert with `tools/prepare-image.mjs` first;
typical saving is around 90%.

---

## Workflows

### Publishing cross-links

After an article is live at its canonical `https://matlus.com/` URL, add that URL
to the matching YouTube video's description. Keep its existing repository and
reference links. Add the PWI homepage to videos in the Programming with Intent
playlist. If the article uses a public code repository, link the repository's
README to the article and retain the repository link in the article. Verify each
match against the video description and the repository before editing.

As of 2026-09-25, the 132 channel videos have the site homepage link, the 52
Programming with Intent playlist videos have the PWI homepage link, and the ten
videos with live matching articles have direct article links. The Factory and
Factory Method posts add three more matching video descriptions, bringing the
direct video links to thirteen. Five matching public
repositories now link back to the live articles. The cross-link changes were
published from separate clean checkouts under `D:\Source\Repos\matlus-cross-links`.

### Converting chapters

`tools/chapter-manifest.json` is both the ledger and the converter's input, so they
cannot drift. Status values: `pending` (prose, needs description and tags), `ready`
(metadata filled in), `converted`, `skipped` (with a reason recorded).

```bash
# 1. Fill section, topic, title, description and tags into the manifest, set status "ready"
python tools/convert-chapters.py --dry-run
python tools/convert-chapters.py
npm run typecheck && npm run build && python tools/audit-copy.py src docs prompts && python tools/check-tags.py
python tools/check-links.py dist
```

### Generating a hero image

Use the desktop Codex binary, never the standalone CLI. The desktop app self-updates
and runs ahead; the CLI at 0.147.0 refused outright while the desktop build at
0.155.0 worked. The binary sits under a content-hashed directory, so
`tools/codex-desktop.sh` resolves the newest by modification time.

Ask explicitly for no lettering, or the model adds garbled text. Use the shared
visual traits in [image-and-diagram-guide.md](image-and-diagram-guide.md), then
choose a concrete subject from the article's claim. Engineering machinery is
optional subject matter.

New tags also need heroes. Base each scene on the tag description and the pages
the tag gathers, save `tag-<slug>.prompt.md` beside `tag-<slug>.webp`, and run
`python tools/check-tags.py` before publishing. The tag workflow is in
[image-and-diagram-guide.md](image-and-diagram-guide.md#tag-page-heroes).

---

## Gotchas

- **Astro extracts `getStaticPaths` into its own module.** Constants declared in
  component frontmatter are out of scope there. Typecheck passes, build fails. Two
  builds broke on this.
- **`as const satisfies` narrows unions**, so an optional property is absent from the
  members that lack it and every consumer must narrow. Annotate the type instead. This
  broke `NAV.children` and `topic.pillar`.
- **Grid tracks need `minmax(0, ...)`.** A bare `1fr` has an `auto` minimum, letting a
  wide code block set a floor on the track and push the page past a phone viewport.
- **Long unbreakable tokens force page overflow.** Chapter prose quotes file paths and
  fully qualified identifiers past 60 characters. Without `overflow-wrap: break-word`,
  a paragraph's minimum width exceeded a phone's viewport and no column sizing could
  fix it.
- **GitHub auto-enables Jekyll on a new user site**, and its build wins the race.
  Switch with `gh api -X PUT repos/<owner>/<repo>/pages -f build_type=workflow`.
- **The Stampede standalone HTML in Drive cannot be unpacked** from a text export. It
  is a self-unpacking JS bundle, and the export mangles the base64 payload. Open it in
  a browser and save the rendered text if its extra content is wanted.
