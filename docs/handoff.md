# Handoff

## All-article card derivatives, October 6, 2026

The owner approved the Skills versus Controlled Workflows outpainting at the
actual card size and authorized applying the approach across the article archive.
Every published article now requires a documented 1200 x 500 (12:5) companion,
including historical articles. The previous publication-date cutoff is removed.

Keep the approved hero unchanged. Settle the title and hero first, then derive
the card by extending the environment: top and bottom for wider heroes, left
and right for taller originals. Sources already at 12:5 need only a direct
export. This supersedes the separately composed default below; eight previously
approved card compositions remain. Review each result with its title and
description at desktop and phone card sizes. The image guide and reusable
card prompt document the geometry and preservation requirements.

The rollout manifest, `docs/article-card-rollout.json`, records the source
dimensions and hashes, treatment, and export dimensions for all 121 articles.
Adjacent card prompts retain the individual briefs and export provenance.
Article prose, titles, dates and hero files are unchanged. The publication PR
records the validation and deployment receipt.

## Programming to Exceptions card companions, October 6, 2026

The owner extended the card work to Programming to Exceptions Parts 1, 2 and 3.
Their 2400 x 520 heroes remain unchanged. Previously, each card fitted the full
hero into the 12:5 frame, leaving space above and below and making people small.
Three dedicated 1200 x 500 companions now bring the foreground action closer:
method-contract machinery, diagnostic inspection, and structured-log investigation.
The shared card resolver selects them by the existing hero asset names. Individual
prompts beside the assets preserve the full generation and export provenance.
Article text, metadata and dates are unchanged. The follow-up PR records checks
and publication verification.

The owner also requested website branding in browser titles. The homepage title
is `Matlus - Engineering with Intent`; article and section titles use a `| Matlus`
suffix, including Search. Author attribution remains Shiv Kumar. Search suggestions
strip the site suffix from result titles, including the former suffix in cached
search data.

## Article cards and image workflow, October 6, 2026

The owner approved the 1200 x 500 (12:5) card experiment and authorized publication
for the five articles originally published in September and October 2026. This
batch excludes the 39 older articles updated during those months. Both Expense
Analysis articles and Pipeline Breadcrumbs reuse the approved card compositions;
the two Jev articles receive companion cards based on their current heroes.
All five hero files and article dates remain unchanged.

New article heroes use 1600 x 534 (approximately 3:1); every new article also needs
a separately composed 1200 x 500 card. This supersedes earlier 60:13 hero guidance
below. The image guide, reusable card brief, writing guide, transcript workflow,
blog-writing skill and conversion tool carry the regular process. Article headers
show natural image proportions; cards use companions when available and fit older
heroes completely otherwise. The build validates card dimensions and provenance.
The publication PR records checks and deployment verification.

## Expense Analysis, Part Two publication, October 6, 2026

The owner approved commit, push, PR and merge for **Verified, Not Trusted:
Expense Analysis, Part Two**. Its publication copy is in
`src/content/writing/verified-not-trusted-expense-analysis-part-two.md`.
Part One links forward to it. The article preserves the verification refrain,
title emphasis and idea callout, and adds two flow diagrams. Its distinct hero
shows two women inspecting a floating mechanical graph with parallel branches
and convergence. The owner approved the 2160 x 468 crop for publication: it keeps
both heads, faces and working hands visible in the 60:13 frame without upscaling.
See the [publication register](expense-analysis-part-two-publication.md) for source
verification, metadata and the public source repository links. The
publication PR carries the deployment receipt.

## Pipeline Breadcrumbs publication, October 5, 2026

The owner requested a standalone teaching article from the public Pipeline
Breadcrumbs repository's design document. The
[draft](drafts/pipeline-breadcrumbs/pipeline-breadcrumbs.md) preserves that title
and includes a runnable Python example and two explanatory pastel diagrams.
The blog-writing review and independent metadata review are complete, using six
existing tags. The [editorial record](drafts/pipeline-breadcrumbs/editorial.md)
records source coverage, qualifications and passing checks.

The local preview is at `http://127.0.0.1:4325/writing/pipeline-breadcrumbs/`, with
the owner-approved workshop hero showing a developer and assistant inspecting
pipeline artifacts. Its 1980 x 429 crop retains the standard 60:13 ratio; the
owner accepted this smaller native size temporarily. The article now follows
source revision `13c6b48bfb089c0de7f7c894488205a61d967eb6` from the
`artifact-sink-protocol` branch (source PR #3 was open during review). It explains
the sink-class decision, revised API names and hosted blob-storage stand-in.
The example and all four demo profiles run against that revision; 122 source
tests pass. Publication was subsequently authorized, including commit, push,
PR merge and repository backlink. The source PR remains open; the article pins
the tested public commit. See the [publication register](pipeline-breadcrumbs-publication.md).
Future article edits belong in `src/content/writing/pipeline-breadcrumbs.md`. The earlier Let's Talk publication, live verification and backlinks
are complete in PR #64; its follow-up automation is stopped.

## Let's Talk publication, October 5, 2026

The owner approved publishing **Let's Talk - Null Conditional Operator. No Thank
you!** with its original February 21, 2022 dates, exact video title, two-woman
article hero, explanatory diagram and two new illustrated topics. The complete
blog-writing, source and metadata reviews are retained in the
[publication register](lets-talk-publication.md). The owner approved native
2100 x 455 article and 2120 x 742 topic exports without upscaling.

Creating Instances, Using Inheritance already belongs to published Design PR #63;
keep its URL and verify its existing reciprocal links. This completes the selected
Let's Talk playlist except the explicitly excluded Impostor Syndrome recording.
Use separate background Chrome tabs for video-description work. The publication
PR carries deployment and backlink receipts.

## Design articles approved for publication, October 5, 2026

The owner approved the six reviewed Design articles for publication. Their
publication copies preserve both datePublished and dateModified at the original
source-video calendar dates, June 2020 through February 2021. Keep those equal
dates and historical feed positions. Retained drafts are preparation snapshots;
future article edits belong in `src/content/writing/`.

The blog-writing skill and independent metadata review confirm standalone
teaching prose and reconciled descriptions/tags. Six existing article heroes,
three topic heroes and seven inline diagrams accompany the batch, including three
reproductions of inspected source drawings. The shared
article header enforces the same 60:13 frame as other articles. Historical code
limits remain explicit, including unawaited broker settlement and the original
movie mapper's positional assumption. See the
[publication register](design-series-publication.md) for the six source
associations and deployment/backlink verification. Service Interface Layer
Pattern remains deferred; the four previously published playlist articles stay
unchanged.

## Standalone Performance revisions and hero framing, October 5, 2026

The six published Performance articles now teach their examples directly, with
video narration and unseen-screen references removed from prose and captions.
YouTube and repository resources remain in frontmatter and the resource cards.
The owner supplied the Web API benchmark screenshot: the article now includes
both complete timing rows, their uncertainty columns and the reported ratio.
Historical dates and code excerpts are preserved. Retained preparation drafts
remain historical review copies; use the publication copies for further edits.

`AGENTS.md`, the blog-writing skill, writing guide and transcript prompt require
standalone articles and the blog-writing skill for every article. Article headers
now enforce the documented 60:13 frame. The image guide specifies 2400 x 520
article exports, and `prepare-image.mjs` enforces exact dimensions and rejects
upscaling. Existing hero files retain their original pixels and use the shared
display crop. The three Programming to Exceptions articles also have the owner's
replacement heroes, exported at exactly 2400 x 520. The owner authorized committing,
pushing and merging this revision on October 5. The publication PR records its
merge commit and deployment verification.

## Remaining Performance articles approved for publication, October 4, 2026

The owner requested the remaining six Performance articles using the earlier
source, writing, metadata and verification process, with fuller and more varied
hero scenes. All six drafts, six article heroes, nine inline figures and three
new illustrated topics were reviewed and approved for publication. Both dates equal each video's
original public YouTube calendar date, from 2019 through 2022. Generated HTML,
Markdown and chronological feed placement have been verified.

The six articles have publication copies under `src/content/writing/`; retained
drafts preserve the reviewed source text. Required preparation site checks pass,
as do the isolated preview build, generated links and 48 grouped C# behavior
checks. See [the preparation register](transcript-series-preparation.md) for the
review inventory, asset paths and local preview, and
[the verification record](drafts/transcript-series/performance-verification.md)
for source qualifications. The [publication register](performance-articles-publication.md)
records the source associations and directs readers to the publication PR for
deployment and backlink receipts. Code Reviewer remains the next collection.

## C# and Performance article publication, October 4, 2026

The owner approved the eleven completed transcript-derived articles for publication.
Publication copies, eleven selected heroes, nine source-faithful SVG diagrams and
24 new topic heroes are published and pass the full local checks. See
[the publication register](transcript-series-publication.md) for article URLs,
verification and deployment status. The six remaining Performance articles were
subsequently prepared as the separate review batch above.
The earlier review pause has ended for this eleven-article publication batch.
The owner subsequently requested dateModified equal datePublished on all eleven,
so they retain their historical feed positions. Keep this policy on publication
copies and retained drafts. The shared body type is now 1rem (16px at the default
browser setting), with smaller h2/h3/h4 headings inside prose. Code blocks apply
the code-size ratio once, avoiding nested scaling at the smaller body size.
All off-site HTTP(S) links now open a new tab. Shared HTML middleware applies this
to Markdown, raw HTML and component links; policy tests and the generated-link
check enforce it in CI. The writing guide and AGENTS.md document the rule.
All eleven source-video descriptions and both verified public sample-repository
READMEs now link back to their articles. Existing video descriptions were preserved.

## Recovered articles and blog-writing skill, October 3, 2026

The 53 recovered Matlus articles are preserved under
`docs/source-material/matlus-wayback/`, with text, HTML, original capture metadata,
55 images, a manifest, and checksums. Four image references remain unrecovered.
The archive is immutable source material and evidence of Shiv's writing voice.
All 53 articles now have publication copies under `src/content/writing/`, retaining
their original prose, code, titles and dates. Each has a new editorial ink hero;
59 inline illustrations replace the old image positions, including explanatory
replacements for four missing captures. Captions distinguish reconstructions from
historical screenshots. The metadata review added 71 reconciled topics, each with
a distinct hero and saved prompt. Historical article URLs redirect to `/writing/`.
See `docs/recovered-articles-publication-plan.md` for verification and deployment
evidence, and `docs/article-review-backlog.md` for preserved source limitations.

Shiv explicitly chose to set `dateModified` equal to `datePublished` for all 53
recovered articles. Preserve that policy in the importer and publication copies:
recovery must not promote historical articles to the newest position in the feed.
The site's existing sorting behavior remains unchanged.

Shiv requested a separate blog-writing skill that adds his voice and teaching
flow to the professional-writing clarity principles. The repository skill lives
at `.agents/skills/blog-writing/`; professional-writing stays unchanged. Preserve
opinions, conviction, and purposeful questions. Introduce concepts when readers
need them and develop examples in an intelligible order. Pronoun choice follows
meaning rather than a prescribed pattern.

The skill is generalized across blog subjects and formats. The recovered corpus
provides the foundation, with transcript samples adding voice evidence. Keep
subject-specific positions in supporting examples and derive reusable guidance
about explanation, pacing, questions, distinctions, and conviction. Forceful
rule teaching is one aspect of the voice; practical notes and patient tutorials
also inform it.

The skill also draws on a focused sample of the raw Programming To Exceptions
and Separate State from Behavior transcripts in Drive. Shiv clarified that strong
rules should keep their force: teach the principle and its reasoning, then explain
a justified exception when it matters to the example. Keep essential scope and
meaningful qualifications without burying the point under hypothetical caveats.
See the skill's `references/spoken-teaching.md` for the source observations.
His follow-up distinguishes genuine special cases, such as a creation command
returning an identifier, from separate operations: get promises an entity or an
exception, while search allows no match. Search is not a caveat to get. Preserve
these contracts and introduce each operation at the right point in the lesson.

These articles have no associated videos or GitHub repositories for publication.
Historical references remain in the article bodies. Recovered inline images served
as references for new artwork. See the archive README for the recovery limits.

## Programming to Exceptions consolidation, October 2, 2026

The shared series now has three parts: method contracts, exception design and
boundaries, then logging and progress. Part 3 receives the detailed Application
Insights section and its figure from Part 2 and adds deliberate progress reporting
for long-running work. Parts 1 and 2 retain missing validation, normalization,
provider-translation and concurrent-failure guidance from the older references.
See `programming-to-exceptions-consolidation.md` for the source-coverage map and
conflicts resolved under the owner's guidance.

The old C# and Python Validation and Exception Handling corpus files are retained
unchanged as drafts. Their HTML URLs and former topic hub redirect to the shared
Programming to Exceptions hub; their Markdown URLs return the three-part reading
guide. They are excluded from public article/chapter listings and search.
Part 2's published logging headings remain as links into Part 3.

The three posts share the source recording and retain its 2019-10-28 date, with
the October 2 revision date. New topic heroes cover Try-Parse and Progress Reporting;
Part 3 has its own ink illustration. Article typography and layout are unchanged.

Consolidation commit `7e6de669fd5487b74ae1e5db04c477d73c8df8f8` deployed in
Pages run 37041511666. Live checks verified all three articles, the shared hub,
legacy redirects and Markdown guides. The source video's description now links to
all three parts, independently confirmed through fresh public metadata. Meridian
repository visibility remains private, so public code backlinks remain deferred.

## Homepage article browsing, October 2, 2026

The homepage now leads with an article feed instead of repeating the header's
section menus. Six results appear at a time; Newer articles and Older articles
change the result group in place without navigating to another page. All cards
are present in the static HTML, so articles remain reachable without JavaScript.
The feed uses the latest of the article's publication and revision dates for
recency, with original publication dates retained and labeled alongside updates.
The shared card layout, site width, and article typography are unchanged.

Programming to Exceptions initially presented the shared Part 1 and Part 2 reading
path. The subsequent consolidation above adds Part 3 and replaces the former
language-specific pages with redirects after preserving their useful teaching.

## Programming to Exceptions publication, October 2, 2026

The pillar hub leads with Part 1 and Part 2 in reading order under "Read the
articles." `loadPwiPillarArticles` keeps that reading list separate from
chapter-topic routing and excludes drafts.
Both posts also remain in Writing and search. Their original 2019 date determines
their position in the chronological Writing list.

The two articles are published from `src/content/writing`, with the
shared source recording's verified date of 2019-10-28 and an October 2 revision
date. Publication commit `f97196261f72035feedaf0577f0e6892c77111e3` deployed
successfully in Pages run 37027699821. Both canonical URLs returned HTTP 200,
and fresh public YouTube metadata verified the two description backlinks and
the preserved PWI link. See `programming-to-exceptions-publication-plan.md`
for execution and deployment evidence.

Part 1 places the order-placement comparison early and defines boundary handler
as exception-handling middleware in a Web API. Part 2 develops specific throw
locations, actionable messages, meaningful handling, request enrichment, HTTP
diagnostic transport, and Application Insights custom dimensions. The retrieval
and order-placement examples have distinct concrete exception types. The C#
base is an explicitly synthesized teaching contract, with no changes to Meridian.

Both parts have heroes, and six raster figures have accessible descriptions,
captions, full-size links, and retained drawing prompts. Structured Logging has
its own topic hero and metadata. The approved system font, smaller headings,
and tighter gap below headings are included; body width, paragraph spacing,
18px article text, and line spacing retain their existing values.

Both full Meridian repositories remain private. Their public resource links and
README backlinks are deferred until the owner publishes the corresponding code.


## Header search repair, September 30, 2026

Issue #51 reproduced on the live homepage: the header accepted input but showed
no results, while `/search/` worked. The Pagefind index was already published with
141 pages. Astro had inlined the header script before Vite replaced its
`__VITE_PRELOAD__` marker, so the dynamic import failed before requesting Pagefind.

`astro.config.mjs` now keeps JavaScript as external assets through the final build
processing. Header search logs load failures, retries failed module downloads on
the next interaction, and handles search failures with reader-facing guidance.
`npm run build` also runs `tools/check-search.mjs`, which rejects unresolved preload
markers and missing or empty search assets. Browser checks cover both search entry
points, no matches, keyboard navigation, and recovery from a simulated HTTP 503
on the initial module request.

## Sculpted 3D article illustrations, September 30, 2026

The owner approved two additional illustration prompts after trials across
acceptance testing, source-grounded answers, and order fulfilment:
`prompts/generate-sculpted-3d-infographic.md` for mostly frontal dimensional icons,
and `prompts/generate-3d-technical-diorama.md` for miniature environments with
deeper perspective. Both include the tested satin treatment, an optional matte
refinement, and optional people with explicit physical-scale guidance.

The image guide links both workflows and records the trials' limits. The
assistant writes the complete scene brief and checks the generated relationships,
readability, and human scale. Pastel diagrams remain the default, and hero and
tag art retain the ink style. The exploratory images remain outside the repository.

## Site chrome refresh, September 30, 2026

Shiv liked the theme, header, and article layout of an AI-blog reference site and asked
for the same ideas here. All of it is token-driven and needs no new dependencies.

- **Theme toggle.** A moon and sun button in the header. An inline script in
  `BaseLayout.astro` sets `data-theme` before first paint from the saved choice
  (`localStorage` key `theme`), else the system preference. The token blocks in
  `tokens.css` already carried both palettes.
- **Header menus.** Every top-level item is a bordered box with a bold label, a tiny
  second line, and a count chip, and opens a dropdown on hover or focus. Writing and
  Media list their newest real entries, and Acceptance Testing lists the first four
  articles of `src/data/acceptance-series.ts`, so none of them needs hand-kept links.
  About has no dropdown because it has nothing to preview. Below 1200px the bar collapses
  to the hamburger drawer, because the boxes need about 1150px.
- **Homepage.** A stats strip (articles, chapters, topics, last updated) computed from
  published content by `src/lib/site-stats.ts`, section cards with an icon tile and a
  count, and a gradient wash under the header from `--gradient-wash`.
- **Articles.** "On this page" in the sidebar, built at build time from the rendered
  headings and highlighted while scrolling by `TableOfContents.astro`. One measured
  value, `--anchor-offset` (bar height plus 12px), sets both where a clicked heading
  stops and where it counts as current. A click pins the chosen entry until the reader
  scrolls on their own, so short final sections still select correctly. Topic chips moved
  from the sidebar to the header.
- **Cards.** `ArticleCard.astro` (thumbnail, tags, title, summary, date, Markdown link,
  and rounded video and audio boxes) and `SectionCard.astro` (icon tile, count, title,
  text) are the two shared listing components. They serve the Writing, Acceptance
  Testing, PWI, Media, and tag pages. Media is a card grid with the All, Video, and Audio
  filter. PWI pillar cards show each pillar's hero, and pillar pages list published
  topics as article cards from `loadTopicCards` in `src/lib/pwi-topic-links.ts`, with
  unpublished topics in a short list below. The video box shows the article title under "Video on YouTube" and links to
  the recording. No audio exists yet; the audio box renders when an entry has `audio`.
- **Search.** The magnifier opens a popover (`SiteSearch.astro`) with live results from the
  Pagefind index, loaded on first use. It also opens with `/` or Ctrl+K, moves with the arrow
  keys, and closes with Escape. The magnifier stays a link to `/search/` for readers without
  JavaScript. The index exists only after `npm run build`, so `astro.config.mjs` serves
  `dist/pagefind` to the dev server; it is as old as the last build.
- **Tags.** A tag is a link to its topic page, which lists everything carrying it. Tags in
  cards are real links above the card's own link. A PWI topic such as Class Design and the
  tag of the same name are different pages on purpose: the topic page is the chapter hub,
  and the tag page gathers every article and chapter about the subject.
- **Logo.** The mark is a raster now. `docs/source-material/matlus-logo-master.png` is the
  1254px master with thickened stems. `node tools/prepare-logo.mjs` trims it and writes
  `public/logo/matlus-mark-<width>.png` for every display size, plus the square favicon,
  `favicon.ico`, and `apple-touch-icon.png`. The header and footer use `srcset`, so each
  screen density gets a file made for it. The old `matlus-logo.svg` and favicon SVGs stay in
  `public/` so published URLs keep working. To change the logo, replace the master and
  rerun the script.
- **Footer.** Brand, Topics (the ten most used), Explore, Connect (GitHub, YouTube,
  llms.txt), a copyright line whose year refreshes in the browser, and a faded
  "Engineering with Intent" mark matching the header tagline. No email address appears
  anywhere, by decision.

## Functional acceptance-testing series, September 27, 2026

Sixteen articles are prepared under `src/content/writing`, with publication dates
of June 15, 2026 and revision dates of September 27, 2026. The acceptance-testing
hub lists their reading order from `src/data/acceptance-series.ts`.
See `docs/acceptance-series-publication.md` for the visual inventory and source
access decision. Each article has a distinct vintage hero; thirteen inline SVG
diagrams use the site tokens, and the main article has an illustrated PNG figure.
The figures preserve explanatory captions in Markdown exports.
Meridian's full C# and Python repositories remain private. Publish the inline
examples only, and add public repository cross-links when that status changes.

The owner subsequently selected the illustrated system boundary PNG for the
main article's first content figure. The previous ownership SVG was removed;
thirteen SVG figures remain elsewhere in the series. The PNG lives permanently
at `public/images/diagrams/functional-acceptance-testing-system-boundary.png`.

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

**Hero and diagram styles.** Hero art uses the technical editorial ink style, with
subjects drawn from each article. On 2026-09-27, Shiv approved pastel architectural
infographics as the default for illustrated diagrams, including generated PNG or JPEG. Simple
boxology can use SVG in the same visual style. Use
`prompts/generate-pastel-boxology.md`. The assistant derives and writes the complete
drawing brief from the article or supplied source; Shiv need not fill in a prompt.
The preferred reference uses the first, moderately sized heading revision.
The approved diagrams and their drawing briefs are retained in
`public/images/diagrams/`, listed in `docs/diagrams.md`. Check generated text, arrow origins,
and enclosure membership. Explain a raster diagram's important relationships in
alt text, a caption, or nearby prose.

The two sculpted 3D article illustration prompts approved on 2026-09-30 are
documented at the top of this handoff and in the image guide. Select them when
their dimensional icons or miniature environments suit the article.

**Concurrency in diagrams is structural.** A stage running N instances is drawn as N
boxes. Collapsing one into a single box hides the fan-out the diagram exists to show.

**Hero originals stay out of git.** The generator returns multi-megabyte PNGs, history
keeps every version forever, Pages caps a site at 1GB, and Git LFS cannot help because
Pages does not resolve LFS pointers. Convert with `tools/prepare-image.mjs` first;
typical saving is around 90%.

---

## Workflows

### Writing callouts

Use [writing-guide.md](writing-guide.md) for reusable idea and note boxes in new
or existing articles. The shared style uses a lightbulb for an idea and a folded page
for a note, with accessible type labels and theme-aware colours. Both variants
appear on the style reference page. The expense-analysis article contains the
first editorial use.

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
