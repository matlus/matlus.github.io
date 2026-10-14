# Article publication workflow

This is the editorial workflow for new website articles and substantive edits to
those articles. It coordinates the blog-writing skill, independent review,
revision, rendered inspection, metadata and publication. It is separate from the
blog-writing skill and from GitHub's deployment workflow.

## Scope and preservation

Shiv's original blog articles are protected, including recovered source material
and their current published copies. Do not rewrite or include them in an automatic
revision sweep. PWI chapters retain their separate corpus contract. An explicit
owner instruction for a particular historical article is handled separately.
Identify provenance rather than assuming a recent import or dateModified makes
an original article new. When provenance is unclear, leave its text untouched.

For an existing article, preserve the exact `datePublished` and `dateModified`
values and whether each field exists. Add neither field when absent; do not
replace a date with the editing day or normalize existing dates. This keeps
displayed dates and homepage ordering stable. Record revisions in Git and the
editorial receipt. A separately authorized date correction is a different task.
If a missing required date prevents publication, report the source gap without
inventing a date or changing the content schema.

Preserve unrelated drafts and files. Reading a source repository does not authorize
changing it. Editorial evaluation does not authorize publishing sample revisions.
Keep trial copies, cold-session outputs and detailed evidence outside the public
content collection. Use the article-review backlog for unresolved editorial work.

## 1. Brief and draft

Record the article path and baseline revision, intended reader, central teaching
claim, supplied author position, sources and revisions, related series parts,
and protected material. Record both date fields' exact values or absence, along
with applicable owner date and URL policies, in the brief.
Use the
[blog-writing skill](../.agents/skills/blog-writing/SKILL.md). For video-derived
articles, also use the
[standalone transcript workflow](../prompts/transcript-to-standalone-teaching-article.md).
The writer reads the complete relevant source and builds the example and argument
in the order the reader needs. Existing approved drafts may enter at review.

## 2. Independent teaching and evidence review

Start a fresh session or sub-agent with no drafting conversation. In Codex, use
`fork_turns="none"`. Pass the brief, complete article, source paths and revisions,
voice guidance, and the
[review prompt](../prompts/review-article-teaching-and-evidence.md). The reviewer
is read-only. Do not include expected findings, prior reviewer conclusions or
the writer's defense in its initial inputs. Provide outside critiques only after
its independent first pass. Supply enough raw evidence to check central claims.
The coordinator reads required project context first and supplies the relevant
constraints in the brief. Use an isolated input packet when project handoff files
contain earlier conclusions. A reviewer that encounters those conclusions must
disclose the exposure; restart its independent pass with a clean packet.

Require a coverage record, ranked findings with passages and evidence, and up to
three priority changes. Missing evidence leaves the affected checks unverified.
An incomplete article cannot receive a complete review. A zero-finding review
is valid; optional stylistic preferences do not create a revision requirement.

## 3. Adjudicate and revise

The writer applies the
[revision prompt](../prompts/revise-article-after-review.md), verifying findings
against the evidence and recording accepted, rejected, optional and deferred
items. Review consensus alone does not decide. Make the smallest supported
corrections and preserve the author's intent and protected evidence.
Compare both date fields against the baseline, including their presence.

Start a second fresh, read-only session using the
[revision verification prompt](../prompts/verify-article-revision.md). It receives
baseline and candidate, the brief and evidence, and the disposition record.
It compares the texts before reading earlier conclusions and reports improvement,
equivalence, regression or unresolved evidence. Regressions require correction.
Use at most two revision/verification cycles per pass; if disagreement remains,
record the exact issue and seek the owner's judgment where it affects meaning.
Do not stop for approval on routine, supported editorial corrections already
within the authorized task.

## 4. Inspect the final rendered page

Build or preview the final candidate and inspect the article at desktop and phone
widths. Check its contents entries, heading hierarchy, preserved anchors, code,
tables, diagrams, captions, alt text, callouts, collapsed material and external
links. Necessary steps must be available on the page. A Markdown review may leave
this pending, but publication requires completion. Reinspect affected sections
after subsequent prose or layout changes.
Confirm displayed dates and the article's position in the homepage list remain
unchanged by the edit.

## 5. Metadata, assets and publication checks

Use the existing independent
[description and tag extraction](../prompts/extract-description-and-tags.md)
on the final article.
Check proposed metadata against the article before accepting it. A recommended
evaluation must not become a claim that an evaluation was performed.
Apply description and tag changes without altering either date field or adding
a missing one. Recheck date preservation before committing.

### Hero and listing card

Treat the article hero and its listing card as separate deliverables. Once the
title and hero are settled, run
[the card generation prompt](../prompts/generate-article-card.md) with the approved
hero as its image reference. Measure the source and derive the 1200 × 500 card
at its own 12:5 ratio. Preserve the scene through outpainting; if its defining
action remains too small at card size, recompose that action using the hero as
reference while keeping every person and meaningful companion. Record the reason.
A hero already at 12:5 can use a direct export.
Follow [the image guide](image-and-diagram-guide.md) and preserve the source hero.
For new artwork, attach its approved brightness and colour reference. Compare
the hero and card as a pair for consistent saturation and light after export.

Save the complete generation brief, refinements, measured source/output dimensions
and export method beside the card. Inspect the actual full card with its title
and description at about 366 × 153 image pixels in the desktop grid and at phone
widths. Check recognizable subjects, complete faces and hands, defining objects,
scene relationships and legibility. Compare the cast with the hero: every person
and meaningful companion must remain. Correct stretching, missing subjects, harmful
cropping or unreadable composition before publishing. File dimensions and a
nonempty prompt alone do not establish a usable card.

For an existing article, first check its approved companion and saved prompt.
Keep approved artwork when it still passes this inspection; editorial changes
alone do not require generating new images. Inspect the card again when the
title, image or listing layout changes. Record the hero/card asset names,
derivation method and rendered inspection in the publication receipt.

### Discover and social preview

Every published article also needs a separate **1200 x 675, 16:9 preview**.
After the title, hero and listing card are settled, use
[the preview generation prompt](../prompts/generate-article-preview.md) to outpaint
approved article artwork. Choose the hero or approved card by its relevance and
readability. Preserve the full scene, cast, meaningful objects and relationships;
extend the existing environment into the new margins. Keep both approved images.

Measure the generated original and optimized export; save the complete brief,
refinements and export method beside `<hero-name>-preview.webp`. Inspect the
preview with its title at about 366 x 206 pixels and 320 x 180 pixels. Compare it
with the source for intact people, faces, hands, defining objects and connections.
File dimensions alone do not establish a usable preview. Existing approved
previews remain in use when they pass this inspection; a prose edit alone does
not require regeneration. Record all three asset names and the inspection receipt.

Confirm the built page permits large image previews, provides an absolute,
accessible `og:image` with measured width/height and matching `twitter:image`,
and identifies that same preview in article structured data. Check that the
visible byline and structured author link to `/about/`. Preserve date values,
field presence and their display behavior. The About page describes the actual
article-production process separately from the byline.

### Automated checks

Run the complete
publication checks in [AGENTS.md](../AGENTS.md), including both writing audits.
The build validates companion dimensions and prompts, then checks that both the
homepage and Writing index render companion cards. It also validates preview
dimensions/provenance for published writing, chapters and overviews, then checks
image URLs and bytes, matching social/structured metadata and authors in built
article HTML. Run `npm run test:previews` for the generated-output validator.
Visual inspection remains a
separate required check.
Review all flags in context. Resolve consequential evidence conflicts before
publication, or state a justified scope limitation in the relevant explanation.
Keep unfinished editorial tasks outside published prose.

## 6. Authorized publication and verification

Commit, push, create a PR and merge only within the owner's authorization. Include
a concise receipt in the editorial record or PR: article and source revisions,
baseline and final content hashes, the review-prompt version,
coverage, findings and dispositions, independent comparison verdict, rendered
inspection, audits and build. The receipt should let a future editor see what
was checked without rerunning the entire process.
Include the before/after date-field comparison in that receipt.

GitHub's [deployment workflow](../.github/workflows/deploy.yml) repeats its
automated repository checks, builds the approved content and deploys it. It does
not start writing, review, revision or model sessions. Ordinary deployment retries
reuse the approved content. A later substantive article change starts a new
editorial pass; a deployment retry alone does not.

Verify deployment against the exact merge commit, then check the live article,
Markdown twin and changed assets against the checked build. Complete existing
public source-video and repository backlink requirements within authorization.

## Workflow trials

Test workflow changes on four or five varied, non-archival articles before broad
use. Include different teaching forms and subjects, plus an unchanged control.
Keep original and candidate copies separate from published content. Run the
review and revision verification in fresh sessions without expected findings.
Independently adjudicate suggestions against passages and source evidence.

Report detected defects, useful editorial findings, rejected suggestions, missed
known issues, and any regression in candidate revisions. Known defects used for
evaluation stay outside the reviewer's inputs. Historical pre-edit versions can
test recovery; current repaired versions can test false alarms. A small trial
supports limited adoption and does not establish a general detection rate.

Commit workflow changes separately from later article revisions. Record which
trials improved, remained equivalent, regressed or stayed unresolved, and verify
that originals, public articles and protected archives remain unchanged.
