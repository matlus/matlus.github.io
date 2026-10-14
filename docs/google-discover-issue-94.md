# Google Discover preview implementation

Scope: [issue 94](https://github.com/matlus/matlus.github.io/issues/94).
Implementation is isolated on `codex/discover-94`. Publication status and live
deployment evidence are recorded in the issue and implementation PR.

## Requirements and implementation

The shared head permits large image previews while retaining supplied indexing
restrictions. Each article selects an optimized 1200 x 675, 16:9 companion for
Open Graph, Twitter and its structured-data image. Open Graph dimensions come
from the imported asset. URLs use the canonical site origin and refer to files
included in the build. Article headers show By Shiv Kumar linked to About;
structured author URLs use that same page.

The About-page statement puts Shiv's experience, coded experiments, videos and
reasoning first. It explains how he shares code or builds independent examples
when workplace details cannot be shared. AI assists with refining his draft
afterward, while the ideas, engineering judgments and established writing style
remain his. The statement retains the separate teaching and evidence review,
revision and independent comparison, and his responsibility for publication.
It describes the established workflow without claiming that every historical
article underwent it or that all review was performed by people.

The approved heroes and 1200 x 500 listing cards stay intact. Each new preview
uses generated outpainting, as requested by the owner. Writing previews use the
approved card where its closer composition makes the defining action readable;
corpus and overview previews use their approved heroes. No generic logo is used.
Each preview has an adjacent complete prompt, source hash, measured dimensions
and export record. Originals remain outside Git. The preview itself adds no
image request to the reader's article page.

The publication workflow, writing guide, image guide, standing instructions and
new preview prompt account for this deliverable on future articles. The source
check includes historical writing, corpus chapters and overview pages; drafts
may remain unfinished. The built-output check verifies image permission, absolute
URLs, available image bytes, measured dimensions, matching metadata and authors.
Its tests reject missing assets, wrong sizes, conflicting images and missing
attribution. The existing card and external-link checks remain in use.

## Mobile PageSpeed baseline

Measured on October 14, 2026, using PageSpeed Insights' mobile browser interface.
The public API returned HTTP 429 with a zero daily quota; the browser reports
completed successfully. These are single-load laboratory results on the deployed
site before this branch's changes: emulated Moto G Power, slow 4G, Lighthouse
13.5.0, HeadlessChromium 153.0.8010.36.

| Page | Performance | FCP | LCP | TBT | CLS | Speed index | Report |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | 79 | 1.1 s | 5.3 s | 0 ms | 0 | 3.7 s | [Mobile lab report](https://pagespeed.web.dev/analysis/https-matlus-com/atj6mij8jy?form_factor=mobile) |
| Verified, Not Trusted: Expense Analysis, Part Four | 77 | 1.2 s | 5.5 s | 70 ms | 0 | 4.4 s | [Mobile lab report](https://pagespeed.web.dev/analysis/https-matlus-com-writing-verified-not-trusted-expense-analysis-part-four/7higtya1j0?form_factor=mobile) |
| Logs and Artifacts: Pipeline Breadcrumbs | 76 | 1.2 s | 5.8 s | 0 ms | 0 | 4.5 s | [Mobile lab report](https://pagespeed.web.dev/analysis/https-matlus-com-writing-pipeline-breadcrumbs/ecn5ehqud9?form_factor=mobile) |

All three reports showed **No Data** for real-user experience. This supplies no
field Core Web Vitals verdict. Live post-change scores require publication;
the baseline scores are not presented as measurements of this branch.

### Supported fixes

PageSpeed identified the homepage's first card as its LCP image, with lazy loading
and no high fetch priority. The first feed image now loads eagerly at high priority;
remaining cards retain lazy loading. Article heroes also receive high priority.
A 640-pixel card candidate and 800-pixel hero candidate reduce the gap between
available responsive sizes. Part Four's report specifically identified a
1024-pixel hero selected for a roughly 665-pixel rendered resource.

PageSpeed also identified prose diagrams without intrinsic dimensions. The build
now reads their actual local image bytes and inserts width/height into generated
HTML, reserving the correct ratio. Explicit source sizes are preserved and
external images are not fetched. Article Markdown, captions, diagrams and dates
remain untouched. Tests cover measured SVG dimensions, preservation, idempotence
and unavailable image bytes.

### Follow-up outside this change

The reports flagged short cache lifetimes, render-blocking CSS and some DOM work.
Cache policy requires a hosting decision; changing the site's delivery platform
is outside issue 94. CSS/DOM restructuring and the homepage's existing contrast
finding should be evaluated separately. The measured CLS was zero on all three
pages. Keep these findings distinct from the targeted image-loading fixes.

## Preservation and verification

Article prose, code, recorded results, citations, titles, URLs, dates and field
presence, homepage ordering, approved heroes and listing cards are protected.
This branch changes shared presentation and adds preview companions; it does
not revise article content or submit indexing requests.

The final verification receipt below records source comparisons, preview
inspection, rendered desktop/phone checks and repository publication checks.
Before authorized publication, reconcile concurrent website changes, rerun all
checks, match deployment to the exact intended merge commit, and verify live
metadata, author links and image responses. Discover appearance is not guaranteed
by these changes.

Sources: [Google Discover guidance](https://developers.google.com/search/docs/appearance/google-discover)
and [helpful-content authorship guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content#who-created-the-content).

## Local verification receipt

Baseline revision: `82e884af91b93d1ebf211156b37e5a8ed8ed153e`.
Before publication, the branch was rebased onto
`6f2e87d` to incorporate PR 95's homepage pagination fix. The only overlapping
component was ArticleFeed: the new first-image priority is combined with the
reserved grid rows, resize handling and stable paging controls from that fix.
The preservation comparison checked **1,373 tracked files** across content,
approved hero/card artwork, recovered originals, diagrams and downloads against
their baseline Git objects. Every file matched, including date fields and their
presence. The primary checkout's pre-existing work was left in place.

All **134 published article, chapter and overview pages** have separate inspected
16:9 previews. Optimized previews total 19,156,218 bytes, about 18.3 MiB. The
[asset register](article-preview-rollout.json) records each source and preview,
hashes, measured dimensions, bytes, derivation and inspection. Comparisons at
366 pixels and complete preview/title sheets at 320 pixels retain the scene,
cast, defining objects and relationships. Generated originals and inspection
evidence remain outside Git. The maintained converter was exercised with a
reviewed 16:9 original and correctly rejected a wide hero as a preview input.

The asset workflow was exercised across varied teaching forms and styles:
Expense Analysis Part Four, Skills versus Controlled Workflows, Pipeline
Breadcrumbs, C# 8 Async Streams and a historical REST article. This tested people,
workshop scenes, dark sculpted artwork and quiet paper illustrations. It changed
no article prose or editorial-review stages. Corpus examples include the labelled
Method Design scene; the labels and public/private arrangement remain intact.

The repository publication checks passed: typecheck, external-link tests, build,
copy audit, tag check and generated-link check. Typecheck reported zero errors,
zero warnings and 34 existing deprecation hints. The copy audit reported zero
hard findings and 62 existing advisories in protected or unrelated material;
new copy and preview prompts introduced none. The About statement and new issue
record also passed the professional-writing audit.

The 13 preview/dimension tests, five feed-order tests and four card tests passed.
The build checked 134 representative previews and linked authors, 123 required
listing cards, 95 measured prose-image dimensions and the search output. All
generated local links resolve and external destinations retain the new-tab policy.

Rendered production-build inspection includes desktop and 320/390-pixel phone
viewports. Article headers preserve their natural-ratio heroes and existing date
formatting. Authorship is readable and linked; code, tables and dense diagrams
scroll within their containers. The homepage retains its six-item pagination,
ordering and card compositions, with only the first image loading at high
priority. About-page inspection includes the production statement separately
from the article byline. No live post-change performance or deployment claim is
made by this local receipt.
