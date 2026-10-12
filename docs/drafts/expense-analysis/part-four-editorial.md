# Expense Analysis, Part Four preparation

Prepared October 12, 2026. Publication copy:
`src/content/writing/verified-not-trusted-expense-analysis-part-four.md`.
Source preserved unchanged in `what-an-eval-is.source.md`, copied from
`D:/Python/Analyze Expenses Workflow/docs/articles/what-an-eval-is.md`.

## Source revisions

The website was fast-forwarded from `362a71e` to `origin/main` at `1150966`
before preparation. Existing untracked work was preserved.

The workflow repository was fetched and inspected without changing its files.
Its local HEAD, `2db60ae`, is seven commits ahead of `origin/main` at `d7be154`.
The supplied article and its 100% gates, replacement sweep and line-by-line check
are in those newer local commits. The public main snapshot has the older 80%
gate and 69 completed runs plus a failed attempt. During preparation this difference was recorded for reconciliation. With the
owner's October 12 authorization, source PR #16 was validated and merged at
`78796de225a6b9f5cc995bae95d3dcff90492b24`, incorporating final head `22452f4`.
All 487 offline tests passed, seven opt-in or environment-dependent tests were
skipped, and Ruff and Pyright were clean. Public main now supports the article's
newer claims. The source checkout was fast-forwarded to that merge.

## Editing decisions

Preserve the original teaching sequence, expense examples, findings-selection
input and output, and author's preference for code grading and code control.
The series title is **Verified, Not Trusted: Expense Analysis, Part Four**;
**What Is an Eval? A Worked Example** remains the opening lesson heading.

- Explain the failed travel total against the accepted Uber-in-Transport baseline:
  $1,631.82 minus $412.60 is $1,219.22. The prompt's failed run was its third run,
  so use "remaining run" instead of implying it was the fifth.
- Describe 4/5 as the observed rate in five runs, with no population guarantee.
- Totals reveal mismatches and can support a likely cause; they do not establish
  which line was wrong, and offsetting errors can leave a correct aggregate.
- The duplicate in this fixture is author-confirmed. The Delta entries are
  retained charges; the raw log does not establish the number of flights.
- Code graders are deterministic for the same input. Human judgment also varies.
- Explain the workflow's mixed-retailer policy, including the accepted July
  Shopping total of $526.62 alongside the original $756.72.
- Distinguish validation during a run from independent outcome grading afterward.
- Retain the 100% policy and 70 identical completed report texts, while recording
  the earlier failed attempt and its replacement. The stronger entry-by-entry
  check was added afterward and applied to saved outcomes.
- Add the Part Four related link to Part One, update Part Two's forward link,
  and align Part Three's closing paragraph with this explanatory article.

## Evidence verification

Read the Sonnet prompt scorecard and its run-03 answer under
`D:/Python/Skills and Evals/results/pwi/expense_analysis/20261010T110057Z-regrade-claude_code-claude-sonnet-5-5-medium-1892c7/`.
The travel failure explanation explicitly uses $1,631.82 as the reference under
the accepted Uber-in-Transport policy.

Independently inspected all 70 retained local workflow reports and outcomes:

- All report text is identical after normalizing CRLF/LF. There are two raw-byte
  hashes because five replacement reports have different line endings; no
  textual difference exists.
- All saved graded check verdicts are `passed`.
- Invoked the current source's `grade_ledger_lines_check` on each saved outcome:
  70 regraded, zero failures, 198 entries per outcome.
- The current suite defines 17 checks, 15 graded, all with minimum 1.0. Existing
  saved scorecards predate the extra line check and the raised threshold; do not
  describe them as newly executed 100% scorecards.

No new paid or live model runs were needed or performed.

## Metadata and images

Required independent metadata sub-agent read the entire article, Part Three and
the vocabulary. Its description is in the publication copy. Tags are existing:
`verified-not-trusted`, `verification`, `model-evaluation`, `acceptance-testing`.
No new topic images are needed.

The new built-in generated hero uses Shiv's attached portrait reference and
Part One's attached ink-style reference. Export is 1600 x 534. The faithful
top-and-bottom card outpaint exports at 1200 x 500. Complete prompts and native
image provenance are adjacent to the optimized hero assets.

Two authored pastel SVG flow diagrams, with real text, alt text and captions,
explain eval anatomy and the two places verification happens. Briefs are saved
beside the diagrams. Diagram lettering and connections were visually inspected.

The hero and card were reviewed on the rendered article and listing at 390px
phone width; the desktop card measures 366.4 x 152.7 CSS pixels at a 1200px
viewport. A further 320px phone check retains the complete card scene and title.
Faces, working hands, reference, comparison stencil and tally remain visible.

## Checks and publication state

Typecheck: zero errors, zero warnings, 34 existing hints. External-link tests:
6 passed. Site build, card validation, search indexing, tags and generated local
and external-link checks passed. Blog-writing and professional-writing audits
passed for the article; the refund, uncategorized-entry and reference-key
contrasts were reviewed as substantive comparisons.

The full working-directory copy audit reports 22 hard flags in pre-existing,
untracked `docs/drafts/overview-narration-trials/` review files. Those unrelated
files remain unchanged. The tracked publication-file audit plus the new article
and hero prompts passed: 713 files, zero hard flags and 59 advisory flags.
The six new authored article, editorial and prompt files also passed their
scoped audit with zero hard flags. These are separate from the full-directory
result.

The owner approved the prepared article and publication on October 12.
The publication worktree is based on website `origin/main` at `1150966` and
contains only these publication files. Its full copy audit can therefore run
without including the primary checkout's unrelated untracked narration files.
Publication checks passed: full copy audit of 715 files, zero hard flags and
62 reviewed advisory flags; typecheck with zero errors and warnings; all six
external-link tests, four card tests and 21 feedback-worker tests; full build,
123 required article cards, 328 indexed pages, tags and generated-link checks.
The website PR records the exact merge commit, matching GitHub Pages run and
live verification. After the canonical article is live, the source README gets
a backlink. The final source PR records that update. This article has no source
video.

## October 12 synchronization with source PR #18

Shiv approved updating the publication Markdown and republishing it after
[source PR #18](https://github.com/matlus/Analyze-Expenses-Workflow/pull/18)
merged at `7ccee9f3665e1fb86ddfaccc3d9b0bdd2b93763f`.
The earlier source snapshot and preparation results above remain historical.

The reference key now supplies independently read full dates and merchant names
for all 198 lines. The existing entry-by-entry grader checks both fields, and
the article moves them out of its list of possible future checks. The stronger
reference exposed the REI refund's merchant as `Return processed - REI`; the
parser now returns `REI`. Its amount and category were already correct.

The source PR replaces the old retained results with two fresh rounds: seven
model-and-effort configurations, five runs each, twice. Independently inspected
the 70 saved outcomes and applied the current line grader to every one:

- All 70 pass, with 198 unique line numbers per outcome.
- All 1,050 saved graded verdicts pass; these include the model judge's verdicts.
- All 70 report texts are identical after normalizing line endings.
- The parser matches the reference's date, merchant and amount on all 198 lines.
- The 64 focused parser, grading and eval-configuration tests pass.

This verification reads and regrades existing artifacts. No new paid or live
model runs were performed for the website revision.

The new **Check every step, and the totals follow** section preserves the source
argument at Shiv's explicit request: tested calculation code adds verified
lines, while a model doing its own arithmetic needs its totals checked. The
workflow retains the shared total and fact checks used for comparison. The
article retains its existing category-policy and single-fixture qualifications.

The blog-writing skill governs the article edit. Existing approved artwork,
title and dates remain; the revision and initial publication share October 12.
The required metadata sub-agent read the full revision, Part Three and the tag
vocabulary using `prompts/extract-description-and-tags.md`. It retained the
existing description and all four existing tags; no new topics are needed.
The writing audit reports no punctuation errors or review items. The three
article copy-audit advisories remain substantive distinctions about refund
arithmetic, uncategorized transfers and the corrected reference key.
Republication checks are recorded in the republication PR, along with its merge
commit and matching deployment run.

Local republication checks passed: typecheck has zero errors, zero warnings and
34 existing hints; all 31 site tests pass; the full copy audit checks 715 files
with zero hard flags and 62 reviewed advisories. The tag vocabulary, production
build, 123 article cards, search indexing of 328 pages and generated-link policy
checks pass. Generated HTML contains the approved calculation argument, the REI
example and the fresh-round results, with the old retrospective claim removed.
The source repository's public README still links to the canonical article.
