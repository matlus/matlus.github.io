# Expense Analysis, Part Two publication

The owner approved publication through commit, push, pull request and merge on
October 6, 2026.

Article: [Verified, Not Trusted: Expense Analysis, Part Two](https://matlus.com/writing/verified-not-trusted-expense-analysis-part-two/).
Publication source: `src/content/writing/verified-not-trusted-expense-analysis-part-two.md`.

## Editorial and implementation evidence

The article was prepared with the blog-writing skill and reviewed against the
expense workflow at commit `6da2912fe69b41537b19c3d828515b6ffb562615`.
It explains imperative control, bounded Jev decisions, evidence-checked LLM
extraction, concurrent categorization, reconciliation, decimal arithmetic and
validated finding selection. Twelve Python excerpts structurally match the
inspected source. Two SVG diagrams show execution order and category fan-out/fan-in.

The theme uses Part One's title emphasis, bold-italic refrain and idea-callout
markup. It preserves “Instruction is not assurance” and explains “Verified,
therefore trusted.” The existing series hero is reused. Part One's closing
reference and related articles now link to Part Two; its original publication
date remains September 30, 2026.

[Independent metadata extraction](drafts/expense-analysis/metadata-review.md)
selected eight existing tags. No vocabulary or topic-hero changes are needed.

The source repository's offline suite passed 258 tests, with seven skips: six
opt-in live model experiments and one Windows symbolic-link restriction. The
eight-line walkthrough was replayed through the actual processors with scripted
model responses. Its verified totals are $159.68 classified spending, $40.00
unresolved outflow and $199.68 observed outflow. This establishes the program's
behavior for those responses; it does not measure live model accuracy.

The article distinguishes extraction's probability-based fallback from the
categorization policy, and a balanced report from approval for downstream action.
It also identifies model calls that could be removed where code already determines
the answer. These are described as opportunities for future work.

## Source links

Authenticated inspection on October 6 confirmed that the source repository remains
private. Its visibility is unchanged. Public repository resource cards and
reciprocal README links are deferred until the source is publicly accessible.
The article includes the code and explanation needed for its lesson.
There is no directly associated source video for this article.

## Release verification

The publication branch passed all six required checks: Astro typecheck, external-link
policy tests, the full build, copy audit, tag validation and generated-link checks.
Typecheck reported zero errors, zero warnings and 34 existing deprecation hints;
the six link-policy tests passed, 326 pages were indexed, and all 178 tags passed.
The full copy audit reported no hard findings. Existing advisory contrasts outside
this publication were retained; the article and new editorial copy have no findings.
Deployment verification must match the Pages run to the merge commit and inspect
the live HTML, Markdown, diagrams, canonical URL, emphasis and Part One cross-link.
The publication PR carries the final check results and deployment receipt.
