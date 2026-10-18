# Eval design editorial record

New local draft prepared October 17, 2026 with the blog-writing skill:
`evals-at-the-system-boundary.md`. The [brief](brief.md) records reader, author
position, source revisions and protected material. This article is separate from
the four existing Expense Analysis articles. No published content was edited.
Both `datePublished` and `dateModified` were absent in the initial draft and remain
absent. No public URL, publication metadata or new artwork has been assigned.

## Source and validation

Public source revision `29104e777bd33bc707f0662573631d6682c70e9e` has the same tree
as inspected local `55e0cb33aac71440e1cf671db3a8b3d676b58f77`:
`b8b612a7adb34843bab58cd48907d083fb2c6daf`. GitHub compare returned no changed files.
Tracked source remained unchanged; pre-existing untracked `talks/` was preserved.

The article uses actual suite definitions, the complete budget rubric, grader
instructions and response shape, amount comparison, session request model,
execution/grading/error/aggregation paths, artifact writer and regrading behavior.
Production recommendations are identified separately from implemented guarantees.
The recorded Airport Parking discrepancy links directly to its pinned grade.

Read-only checks confirmed the complete budget-rubric quotation, expected amount
facts, recorded $1,563.82 travel result, the $68 discrepancy, the $24.10 policy
difference, the constructed two-cent example, balanced code fences and absent dates.
The independent reviewer also compared all 198 ledger source texts with the input
and recalculated the quoted category totals without finding mismatches.

No live model sessions or source tests were run. Source tests were inspected to
establish what they exercise. This is article evidence review, not a new model
measurement or host acceptance result.

## Independent teaching and evidence review

A fresh read-only reviewer, with no drafting conversation, read the complete
463-line baseline, both related articles, voice guidance and source evidence.
Baseline SHA-256:
`aa91c61751c12071b6547ffe367adccd7d77a616f394ac1a86d0b1e253a1d648`.
The review recorded every heading and the final sentence. It found no material
technical defect or teaching discontinuity.
The complete [teaching review](teaching-review.md) is retained beside this record.

One supported low-priority concern was accepted: the recorded travel discrepancy
needed a direct evidence link. The revised passage links to the pinned `grade.json`.
No change was made to its numbers, diagnosis or interpretation.

Two small authoring improvements accompany that revision: define case, trial and
grader at their introduction; identify the expense log as synthetic teaching data,
consistent with the reference key. The title, headings, code, rubrics, numbers and
final argument are otherwise unchanged. There were no rejected or deferred findings.

A second fresh reviewer compared the complete baseline and candidate before reading
the first review or this disposition. Its verdict was **improved**, with no
regressions. All three edits were checked against source; both date fields remain
absent. The complete [revision verification](revision-verification.md) is retained.
The review records replace one internal product-name mention with a generic
description to comply with the website's standing wording restriction; their
findings and evidence are unchanged.

First reviewed draft SHA-256:
`207d5afa9b3d3ee81950ef3c4a869674f9548726b79eaf225fdbc5b1d788bde9`.
The article's writing audit reported zero punctuation errors and zero review items;
the scoped copy audit reported zero hard or advisory findings. All five JSON
excerpts parsed, and all three Python excerpts passed syntax parsing. The brief's
writing audit flags the noun "harness"; it is retained as the relevant technical
term. These are scoped draft checks, not website build or publication claims.
The complete draft-folder copy audit has zero hard findings and two advisory
flags in the retained reviewer reports. Both were inspected and retained because
they distinguish optional work from required work and inspected tests from
executed tests. The article itself has zero advisory findings.

## Model identity and README results follow-up

The owner requested an explicit reporting contract: model family/provider, exact
model, reasoning effort and observed pass rates must accompany an eval result.
The owner also requested examples using the source README's recorded data.
The [follow-up brief](model-identity-brief.md) records the scope and raw evidence.
The complete prior reviewed draft is preserved as
`revisions/before-model-identity.md` with the first reviewed draft hash above.

The introduction and closing instructions now reinforce the reporting contract.
Two added sections explain the required identity and use the README's six-model,
medium-effort dataset. The table names each provider and exact model, reports the
lowest observed per-check count/rate and keeps the gate outcome separate. It
explains the individual Sonnet, Haiku and Luna results, the 80% threshold, the
five-trial scope and historical regrading dates. The later comparison paragraph
was shortened to avoid repeating the new explanation.

Source inspection confirmed the current scorecard records assistant, model,
effort, repetitions and check-level counts/rates, with no standalone provider
field. Explicit provider and judge-configuration capture is presented as a
production recording requirement. No implementation field was invented or added.

Both the writer and a fresh independent reviewer reconstructed the figures from
all eight archived scorecards: 16 checks over five trials per configuration,
including the one-plus-four runs for Opus and Sol. Lowest check rates are
100%, 100%, 100%, 80%, 40% and 0% in article order. The complete
[follow-up teaching review](model-identity-review.md) found no substantive issue.
Disposition: the teaching review requires no correction. During independent
revision verification, one chronology clarification was accepted: attribute
October 8/9 to the README's original trial collection, rather than implying that
the six-model table establishes trial dates across that entire collection.
The selected scorecard regrade provenance names October 9 source runs. The
October 10 regrading and all counts/rates remain unchanged.

Teaching-review candidate SHA-256:
`879e6eb249e61966060b8704661d59ce991ec236b772b1117ccd47465461a8e7`.
The article and follow-up brief have zero hard or advisory copy findings.
The article's writing audit has zero punctuation errors and one reviewed flag for
the technical noun "harness", which is retained. All existing JSON/Python excerpts
still parse. Both date fields remain absent. No live model run or source test was
needed or performed. Rendered inspection of the new tables remains publication work.

Independent revision verification judged the identity/results revision improved
with no unresolved correction. Its exact frozen candidate is
`revisions/identity-before-skills.md`, SHA-256
`b6b98d38e00a1ee168ac87a68b248b820591bb63db9d5cac4e5738ce8e420a93`.
The [identity verification](model-identity-verification.md) explicitly excludes the
later skill-publication addition below and must not be presented as its review.

## Applying the same rigor to published skills

The owner explicitly extends the article's purpose to skills other people publish
and adopt. Preserve the supplied observation about absent or rudimentary skill
evals, and explain why missing provider/model/effort data prevents a subscriber
using another configuration from knowing what the skill will do for them.
The [skills brief](skills-publication-brief.md) records the author's position.

An introductory reminder and a dedicated section now apply the evaluation contract
to published skills. The section covers the subscription/provider mismatch,
explicit disclosure of tested configurations and observed rates, labeling untested
configurations, and evaluating actual installation/invocation plus the outcome.
It keeps packaging checks, invocation and correct work distinct, and explicitly
identifies this repository's recorded results as prompt evaluations rather than
evidence of an installed skill package. The critique is presented as the author's
observation, without inventing a survey of repositories.

The complete [skills teaching review](skills-publication-review.md), from a fresh
reader, found zero substantive findings. It checked the complete article and
baseline, source scope and Sonnet example. Disposition: retain the reviewed
candidate unchanged for independent revision verification. Candidate SHA-256:
`85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc`.
Both date fields remain absent; no existing code, tables or quoted rubrics changed.

A second fresh reader compared the complete identity baseline and current skills
candidate before consulting prior conclusions. The
[skills revision verification](skills-publication-verification.md) judged it
**improved**, with no substantive regressions. It independently checked the
Sonnet evidence and prompt/package distinction. The current article remains at
SHA-256 `85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc`.
Its final scoped copy audit has zero hard or advisory findings; the writing audit
has zero punctuation errors and the retained technical-noun flag described above.
Comparison checks preserve every prior code fence, table and rubric quotation.
These later reviews supersede the initial draft review only for their named
additions; all publication and rendered-page work remains separate.

## Rubric contribution and deterministic-grading direction

The owner supplied a Gemini explanation of rubrics and requested incorporating
useful material with a complete blog-writing/review pass. The owner then stated
the governing direction: avoid adding model-grader variability where code can
verify the requirement, and constrain necessary model judgments with a rubric.
The [rubric brief](rubric-expansion-brief.md) records this scope. The complete
prior article is `revisions/before-rubric-expansion.md`, SHA-256
`85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc`.

The introduction and grader-selection section now state that direction plainly.
The rubric explanation makes this implementation's completed binary decisions,
named acceptance obligations and unavailable-verdict errors explicit. A passing
$2,000 quotation is added to the constructed examples. The findings section now
shows the four accepted Shopping policy combinations with monthly and exact
three-month totals, explains how the pre-established facts constrain comparison,
and gives a practical rubric-writing sequence before judge validation.

The diagnosis and regrading passages explain their actual implementation scope.
The [contribution assessment](rubric-contribution-assessment.md) records accepted
ideas and corrections to the outside explanation, including the continued need
for interpretation, failed-check-only ledger diagnosis, candidate causes and
fresh grader model sessions during regrading. No fixed-seconds performance or
automatic detection of every erroneous judge verdict is claimed.

A fresh independent [teaching/evidence review](rubric-expansion-review.md) read
the complete candidate and baseline, source and related articles. It recomputed
all four Shopping profiles from the ledger and checked all 198 source rows.
Review candidate SHA-256:
`c89b27ea2e0f74233f1560c03849aa4b0ac6b0a14b7d01000ef52f545da5a6f2`.
Its only finding was a low-impact count error: the constructed-response lead-in
still said three after adding the fourth example. Disposition: accepted and
corrected to four. No other substantive finding requires a change. The corrected
complete candidate enters fresh revision verification. Both date fields remain
absent, and all prior rubric quotations, code and recorded model results remain
unchanged. Rendered inspection is still separate publication work.

A second fresh reviewer compared the complete baseline with the corrected
candidate before reading the earlier review, disposition or contribution
assessment. The [rubric revision verification](rubric-expansion-verification.md)
judged the revision **improved**, with no substantive regressions. It verified
the four-example count, accepted-policy arithmetic, code-first framing and actual
diagnosis/regrading paths. All existing code, rubric quotations, recorded model
results and date-field absence remain preserved.

Current article SHA-256:
`86de34816fc92f1eecac0a024c7be691f0e43b8387f0ad419d88af178dd48194`.
Article and editorial copy checks report zero hard or advisory findings. The
contribution assessment has two inspected advisory contrasts, retained because
they distinguish grading errors from completed verdicts and a three-month period
from a calendar quarter. The writing check has zero punctuation errors and retains
the previously explained technical-noun flag. No model sessions, source tests,
publication or source-code changes were made.

## Remaining publication work

This is a Markdown draft for owner review. Independent revision verification and
final article copy audits are complete. Actual desktop and phone rendering,
description/tag extraction, artwork, publication checks and publication are separate
later work. No existing article, date, artwork or unrelated change was modified to
prepare it. The draft, brief, full reviews and this compact record remain here.

Host policy rejected the native PowerShell cleanup of
`D:/Python/PWI Code Review/.workspace_tmp/pwi-operations/eval-article/`.
No alternate deletion mechanism was attempted. Manual cleanup is needed for that
owned operation folder, which contains the comparison baseline, temporary review
outputs and an empty tool-temp directory. It contains no checkout or worktree.
Keep this website draft folder and its complete review records; the retained
operation folder can be removed after that preservation is confirmed.


## Publication continuation, October 17, 2026

The owner subsequently authorized publication, commit, push, PR and merge. The
Markdown-stage checkpoint above records the state before that authorization.
The [publication receipt](publication.md) records the publication copy, content
hash comparison, independent metadata, approved artwork, rendered inspection and
checks. The [metadata assessment](publication-metadata.md) explains tag selection.
The draft remains preserved here; its publication copy has identical body text
with its title moved into frontmatter. No prior published article was revised.
