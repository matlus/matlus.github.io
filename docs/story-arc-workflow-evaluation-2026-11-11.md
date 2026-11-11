# Story-arc workflow integration

Shiv authorized incorporating [issue #131](https://github.com/matlus/matlus.github.io/issues/131)
into the publication pipeline and assessing the related light article revision
in [issue #132](https://github.com/matlus/matlus.github.io/issues/132).
Baseline: `7633805879c5e579f377a0bb9c567104e466975a`.

## Parity and additions

The existing blog-writing skill and reader-path review already cover much of
the proposed arc. There is no large conflict with their teaching sequence.
The [shared checklist](article-story-arc.md) makes all nine checks explicit and
connects them to drafting, fresh teaching review, adjudication, fresh revision
verification and the final publication receipt.

| Issue check | Existing coverage | Added emphasis |
| --- | --- | --- |
| Establishing shot/shared confusion | Recognizable situation, reader assumptions and context before the example | Establish setting, stakes and detail to watch; personal learning only when supplied |
| Hook | Early purpose and destination | Test the first line and opening for subject and reason to continue |
| Word pictures | Concrete examples, code, data and observable results | Examine abstract passages for an imaginable action or useful analogy |
| Suitable structure | Article-form awareness and foundation before solution | Identify the intended progression; named narrative structures remain optional tools |
| Chekhov's gun | Review of questions, roadmaps, repetition and promised measurements | Track emphasized details and abandoned threads through to their payoff |
| Named villain | Difficulty or misconception identified in the brief | Name the concrete obstacle early; develop supported consequences and failed remedies where useful |
| Sugar coating | Reader motivation, examples and the author's conversational voice | Identify necessary learning and the experience that helps the reader stay with it |
| Bookend | Useful returns to earlier examples and a meaningful conclusion | Check whether the ending resolves an opening question or changes its meaning |
| Limits beat | Claims/evidence review, scope and technical qualifications | Retain explicit assessment of measured and unmeasured outcomes throughout |

The issue's narrative devices are adapted to each article's form. Neither an
invented first-person experience nor a dramatic antagonist is required. Causal
blame and failed remedies need evidence or clear hypothetical framing. The
checklist does not publish neuroscience or engagement claims from its source.
Every check receives met, needs revision or not applicable, with passages or a
reason. Consequential unresolved findings must be adjudicated before readiness.

Local checks are now explicitly required before pushing, including the additional
test scripts in the deployment workflow. Hosted CI availability does not decide
editorial acceptance. Deployment identity and live verification remain separate.
No deployment configuration was changed.

## Bounded five-article trial

A fresh reviewer received complete baseline texts, the updated review prompt,
voice guidance and checklist in an isolated packet. It did not receive the issues,
handoff, expected findings or earlier conclusions. A second fresh reviewer read
complete baseline/candidate pairs before dispositions. Only the authorized eval
article has a changed candidate; the four controls remain byte-identical.

| Article | Form | Initial arc assessment | Revision comparison |
| --- | --- | --- | --- |
| Verified, Not Trusted: Designing Evals for AI Applications | Implementation-led teaching argument | Nine met; no consequential defect | Light opening/grader/closing refinement assessed separately in the article receipt |
| Verified, Not Trusted: Expense Analysis, Part Four | Introductory worked explanation | Nine met | Equivalent, unchanged control |
| Jev: A Practical Reference | Lookup reference | Eight met; separate bookend not applicable | Equivalent, unchanged control |
| Logs and Artifacts: Pipeline Breadcrumbs | Design walkthrough | Nine met | Equivalent, unchanged control |
| Stampede at the Gates | Sustained argument | Nine met | Equivalent, unchanged control |

The initial pass recorded 44 met decisions and one justified not-applicable
decision. It did not demand new anecdotes, metaphors or dramatic outlines from
the controls. The eval baseline already works; the owner's requested refinements
are optional improvements, not a repair to a failed story arc. The separate
[article receipt](eval-story-arc-revision-2026-11-11.md) records their adjudication.

Complete ordered-heading/final-sentence coverage, passage assessments, review
outputs, baseline/candidate copies and detailed checks are retained outside the
public content collection in the November 11 story-arc evidence packet.
No known defect was seeded and no detection or engagement rate was measured.
The trial provides evidence about applicability and preservation for these five articles.
Control-source validation and series-wide conclusions were outside its scope.
Protected originals, source archives, chapters, control articles and artwork
remain unchanged. Workflow changes are committed separately from article edits.
