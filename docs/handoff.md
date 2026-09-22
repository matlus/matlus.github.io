# Handoff

Written 2026-09-22, at the end of the session that built this site from nothing.
Everything below is committed and deployed.

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

Live at **https://matlus.github.io**, 50 pages.

| | Count |
|---|---|
| Articles | 3 |
| PWI chapters | 12, across 6 topics |
| Aphorisms | 24, with computed backlinks |
| Tags | 16, controlled vocabulary |

**Articles**

- `Skills versus Controlled Workflows` with an interactive workflow diagram
- `Stampede at the Gates`, the problem statement
- `The AI-Native Lifecycle`, the answer to it

**Chapters**: architecture-layers, class-design, method-design and
naming-conventions and validation-exception-handling all bilingual, plus
linq-query-semantics in C# and type-annotations in Python.

**Infrastructure in place**: markdown twins on every article and chapter, generated
`llms.txt` and `llms-full.txt`, `robots.txt` with explicit AI-crawler allows, sitemap,
`Person` with `sameAs` on the homepage, `TechArticle` and `BreadcrumbList` per page,
design tokens with dark mode, a style guide page, hero image generation, and a copy
audit gating CI.

---

## Open items

### Needs a decision from Shiv

1. **Rule-catalogue chapters.** 22 of 51 corpus files are written for the review
   runtime rather than a reader, carrying rule IDs, evidence scopes and severities.
   Published raw they read as internal tooling docs. Options: publish as-is, add
   framing that explains what a rule ID is, or leave unpublished. See
   [chapter-conversion-ledger.md](chapter-conversion-ledger.md).

2. **CI wording in The AI-Native Lifecycle.** The source deck says the gated check
   "blocks rather than advises". It currently reads "runs again in CI as a gated
   check", because a standing note says pipeline disposition should not be
   overspecified and auto-fix or merge behaviour is customer-configured. If blocking
   is safe to claim publicly, restore the stronger wording.

3. **Three questions in one paragraph** in Stampede, where the writing skill prefers
   one rhetorical question per piece. Kept deliberately, since that passage is the
   argument's turn, but it is Shiv's voice to judge.

4. **The "note on numbers" section** was cut from Stampede when the real citations
   arrived. Confirm nothing was lost.

5. **SQL as a first-class example language** on `stored-procedure-data-access`.
   Assigned on the reasoning that the procedures are T-SQL while the calling side is
   Python. If the chapter is really about the access layer, it should be Python only.

### Needs authoring, not conversion

6. **Domain Facade** deserves a chapter covering more than the corpus file does:
   folder structure, levels of abstraction, and the sibling rule, where a class talks
   one level down and no further and a sibling needing a sibling is an abstraction
   failure calling for extraction. Some of this already lives in Architecture Layers,
   which has both a Levels of Abstraction and Folder Structure section and a Service
   Interface Layer section. The facade pattern is general; the Domain Facade is
   Shiv's, for the domain layer, and that distinction belongs in the opening.

7. **Video transcripts.** Around 145 videos at roughly one a week. Converting these
   is the single highest-leverage remaining task for the retrieval goal, since
   YouTube content is unreachable to most crawlers. These take real YouTube dates,
   unlike PWI chapters.

### Straightforward work

8. **17 prose chapters pending.** Each needs a one-line description and tags from the
   controlled vocabulary. Both are judgment calls; everything else is mechanical. Fill
   them into `tools/chapter-manifest.json`, mark `ready`, run the converter.

9. **Pagefind search** is specified but not installed.

10. **A diagram for The AI-Native Lifecycle**, most usefully gate one's "authored
    once, enforced at two points" flow with the integrity receipt.

11. **Design Patterns as a top-level section.** Seven pattern topics already exist.
    Wants a `design-patterns` tag plus a per-pattern tag.

12. **DNS cutover.** `astro.config.mjs` has `site: 'https://matlus.github.io'` with a
    TODO. Because this is a user site, `base` stays `/`, so the switch is one line.

13. **Media table** runs on placeholder rows in `src/data/media.ts`. Once content
    carries `youtube` and `audio` frontmatter, generate it at build time instead.

---

## Decisions already settled

Do not reopen these without new information.

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

**Two visual pipelines, kept separate.** Hero art is generated raster in the vintage
engineering sketch style. Diagrams are authored SVG. The split is decided by
retrieval: a generated picture of a directed graph contributes nothing because its
labels are pixels. Generators also garble technical text, as an existing generated
diagram's OCR demonstrates.

**Concurrency in diagrams is structural.** A stage running N instances is drawn as N
boxes. Collapsing one into a single box hides the fan-out the diagram exists to show.

**Hero originals stay out of git.** The generator returns multi-megabyte PNGs, history
keeps every version forever, Pages caps a site at 1GB, and Git LFS cannot help because
Pages does not resolve LFS pointers. Convert with `tools/prepare-image.mjs` first;
typical saving is around 90%.

---

## Workflows

### Converting chapters

`tools/chapter-manifest.json` is both the ledger and the converter's input, so they
cannot drift. Status values: `pending` (prose, needs description and tags), `ready`
(metadata filled in), `converted`, `skipped` (with a reason recorded).

```bash
# 1. Fill topic, title, description and tags into the manifest, set status "ready"
python tools/convert-chapters.py --dry-run
python tools/convert-chapters.py
npm run typecheck && npm run build && python tools/audit-copy.py src docs
```

### Generating a hero image

Use the desktop Codex binary, never the standalone CLI. The desktop app self-updates
and runs ahead; the CLI at 0.147.0 refused outright while the desktop build at
0.155.0 worked. The binary sits under a content-hashed directory, so
`tools/codex-desktop.sh` resolves the newest by modification time.

Ask explicitly for no lettering, or the model adds garbled text. The style clause is
in [image-and-diagram-guide.md](image-and-diagram-guide.md) and should be used
verbatim, with only the subject appended.

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
