# Rubric expansion: independent revision verification

## Verdict and scope

**Improved. No substantive regression or unresolved prose correction found.** The expansion makes rubric design usable to the intended developer: it states the deterministic-grading direction, distinguishes general rubrics from this suite's binary checks, develops the accepted policy arithmetic, and explains the actual limits of diagnosis and regrading. The prior review's sole accepted correction is resolved. Rendered inspection remains pending.

Verification performed October 17, 2026 under `prompts/verify-article-revision.md`. I compared and read the complete 529-line baseline and complete 557-line candidate, including all tables, quotations and code, before reading `rubric-expansion-review.md`, `editorial.md` or `rubric-contribution-assessment.md`. I formed the initial accuracy and teaching judgment from the texts, briefs and primary implementation evidence first, then checked the prior finding and contribution claims. This report is the only file written by this verification.

| Material | SHA-256 / identity |
| --- | --- |
| Complete baseline, `revisions/before-rubric-expansion.md` | `85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc` |
| Complete candidate, `evals-at-the-system-boundary.md` | `86de34816fc92f1eecac0a024c7be691f0e43b8387f0ad419d88af178dd48194` |
| Public implementation pin | `29104e777bd33bc707f0662573631d6682c70e9e` |
| Inspected local implementation HEAD | `55e0cb33aac71440e1cf671db3a8b3d676b58f77` |
| Both implementation Git trees | `b8b612a7adb34843bab58cd48907d083fb2c6daf`; tracked diff empty |
| Complete related Part Three | `4de952e217a2f6dbe1d7054754e030763eac61af9f5076e56a8ba425157dfd95` |
| Complete related Part Four | `e5ea1900e57432fa70359e03520119bc41e33168f477d47fef4753155399a757` |

The source checkout retains its pre-existing untracked `talks/`. The website has substantial pre-existing dirty work, including published articles and draft records; none was changed by this verifier. No tests, model sessions, builds, publication, commits or external messages were performed. Decimal calculations below are independent read-only arithmetic, not executed source tests or new eval measurements.

I read `brief.md`, `model-identity-brief.md`, `skills-publication-brief.md` and `rubric-expansion-brief.md`, the blog-writing skill and its clarity, voice/flow and spoken-teaching guidance, and the original **The Purpose and function of a Data Access Layer** sample. The reader is an application developer familiar with ordinary code and tests but new to eval terminology and implementation. The author's acceptance-boundary argument, forceful code-first direction, model/provider/effort reporting contract and published-skills position govern the assessment. Internal product branding is absent from the article; the report uses generic wording for that restriction.

## Every actual change

Candidate line numbers refer to the hash above. The complete diff contains additions and one example-count replacement; it removes no explanatory passage or section and moves nothing.

| Changed passage | Verification and effect |
| --- | --- |
| Line 19, introduction: “keep as much grading as possible in deterministic code” | Improved. States the owner's direction before the implementation tour and explains the judge's added variability. Its claim is constrained discretion and inspectability, not guaranteed correctness or deterministic model behavior. |
| Line 119, grader selection: “Prefer a deterministic grader whenever code can establish whether the requirement was met” | Improved. Applies that direction at the actual choice of grader, then leads into the existing four-type table. The next paragraphs and extraction example explicitly retain the model-assisted extraction limitation. The return to the principle has a different teaching purpose from the introduction. |
| Line 210, general rubric scope and this suite's PASS/FAIL/error behavior | Improved. Rubrics can serve humans or scored performance; this suite requests a Boolean verdict for each named judge check. An unavailable judgment becomes an error rather than a completed pass/fail observation. `JudgeVerdict`, response validation and `EngineTrialGrading` support the implementation-specific account. |
| Line 212, bounded acceptance scope | Improved. The actual budget rubric asks about invented budgets; the findings rubric combines exactly three findings with support and consistency. The passage correctly avoids claiming literal single-property atomicity for every rubric. |
| Lines 230–238, “three” changed to “four” and added $2,000 quotation row | Improved. The new row exercises an explicit exception in the unchanged source rubric. All four verdicts are sound and labeled constructed; the one-word correction now agrees with the four body rows. |
| Lines 307–314, policy-table introduction and four Shopping profiles | Improved. Converts source paragraphs and an adjustment rule into a visible worked table. Its authorship and exact-cent totals are distinguished from literal rubric text and rounded narrative period totals. Every amount recomputes from the source ledger; see below. |
| Line 316, monthly policy consequences | Improved. Makes the consequence of the books policy concrete: August changes from below target to $18.31 above the approximate target. Steam changes only June, so it does not change that conclusion. The text keeps “roughly” and requires the finding to follow the answer's policy. |
| Line 318, reference-comparison reasoning | Improved. Precomputed facts remove the need to reconstruct those reference totals in the judge request. The judge still identifies policy and interprets claims against tables and references. The next retained paragraphs explicitly limit coverage to the supplied rubric facts, rather than all possible claims against all 198 entries. |
| Line 326, rubric-writing sequence | Improved. Generalizes after the worked examples: name the obligation, identify evidence, establish references independently, calculate amounts in code, state alternatives, define conditions and test a concrete answer. The $2,000 boundary case ties the method to what the reader has just seen; the final sentence leads naturally to testing the judge. This is advice, not a claim that the repository implements a reviewed-label judge-validation dataset. |
| Line 510, failed-judge-only diagnosis limit | Improved. `diagnose_judge_check_outcome` requires a successful judgment whose check outcome is FAILED and a present reference ledger. Passing and errored outcomes return unchanged. Disputed amounts must also parse and resolve to a ledger bucket. The preceding retained “attempts” language prevents a promise that every failure receives a diagnosis. Reviewed labels are recommended to expose false acceptance. |
| Line 518, fresh graders during regrade | Improved. The implementation reads recorded trial sessions, then calls the normal grading path, which requests extraction and judge sessions again before code checks and aggregation. The addition prevents “reuse” from sounding like no model work remains. It gives no fixed duration or speed claim. |

## Budget examples and exact policy arithmetic

I read the complete budget notes, original expense input, reference key, expected facts, the three relevant rubric files and the suite. The four constructed budget statements apply only to the invented-budget criterion:

1. August dining above the supplied $260 target: pass.
2. Travel growth and a suggestion to track it: pass; no existing travel budget is asserted.
3. Faithfully quoting the user's $2,000 Shopping worry: pass; the rubric expressly permits it.
4. Calling Travel over its monthly budget: fail; the user supplied no such target, even without a numeric claim.

The baseline's qualification that passing this criterion does not establish other checks remains. No illustrative response is presented as a recorded model result.

I matched all 198 ledger `source_text` fields to their 1-based source lines: zero mismatches. Independently summing counted Shopping entries using PowerShell decimal arithmetic, with the books and Steam alternatives varied independently, gives:

| Books policy | Steam policy | June | July | August | Exact three-month sum |
| --- | --- | --- | --- | --- | --- |
| Entertainment | Entertainment | $960.07 | $756.72 | $1,061.93 | $2,778.72 |
| Shopping | Entertainment | $1,020.77 | $756.72 | $1,218.31 | $2,995.80 |
| Entertainment | Shopping | $1,007.65 | $756.72 | $1,061.93 | $2,826.30 |
| Shopping | Shopping | $1,068.35 | $756.72 | $1,218.31 | $3,043.38 |

Books contribute $29.02 + $31.68 = $60.70 in June and $77.40 + $78.98 = $156.38 in August. Steam contributes $47.58 in June only. Thus August Shopping becomes $1,061.93 + $156.38 = $1,218.31, or $18.31 above $1,200. All June alternatives and July remain below target. The article's table, sums and conclusions are correct. The source rubric's approximate period totals round these exact sums to $2,779, $2,996, $2,826 and $3,043 respectively.

`ReferenceLedgerTotalsProcessor` computes ledger buckets under accepted policy combinations in code, including period-wide category totals. `DataManagerEvalSuite` loads the references and rubric contents. The `three_supported_findings.md` request nevertheless receives its written reference facts, not the complete raw log or a newly attached four-row table. The article distinguishes the teaching expansion from that source quotation and states the actual evidence limit.

## Implementation path and surrounding claims

The primary implementation evidence is under `D:/Python/Skills and Evals/packages/prompt-evals/src/prompt_evals/`, with suite/input evidence under `evals/expense_analysis/` and host persistence under `apps/prompt-evals-app/src/prompt_evals_app/`.

- `managers/engines/llm_processors/rubric_judgment_processor.py` composes instructions, rubric and answer; `llm_processor_base.py` requests a structured session with empty input files and tool kinds. The judge has no raw expense log or reference ledger in that request. The schema and `ValidatorGraderResponseResource` check a Boolean, reason string and disputed-amount structure. This supplies usable data, not semantic proof.
- `EngineTrialGrading` requests fact extraction and judgments for a completed trial, grades explicit facts and tool outcomes in code, then invokes diagnosis. Its handled failures remain distinct `errored` outcomes. A valid failing verdict is accepted; the two-attempt structured-response loop does not retry until approval.
- `CheckOutcomeDiagnosisProcessor` returns passing and errored judge outcomes unchanged. On eligible failures it parses disputed amounts and locates their reference bucket. `AmountDiscrepancyDiagnosisProcessor` considers accepted compositions and seeks the fewest mistakes, with a maximum of three and restricted larger searches. An entry-level arithmetic match remains a candidate cause requiring saved-calculation inspection.
- The retained standard/run-05 grade actually reports $1,563.82 against $1,631.82, with a negative $68.00 difference and the line-169 Airport Parking omission candidate. This is distinct from the final-prompt Sonnet failure used in the six-model comparison.
- `ManagerEvaluation.regrade_evaluation` calls `EngineTrialExecution.read_recorded_trials`, then `_grade_and_score`. The former parses saved sessions; the latter emits trial records again, invokes live `grade_trials`, emits grades and aggregates the scorecard. `EvaluationArtifactEmitter`, host `main.regrade` and `ResultsDirectoryWriter` establish the new regrade directory and `regraded_from.txt` provenance. Reusing original answers does not create new trial measurements.

I independently reconstructed the six-model comparison from all eight scorecards specified in `model-identity-brief.md`, pooling Opus's and Sol's one-trial and four-trial folders by check. All have 16 checks and five trials per model at medium effort. Lowest per-check rates are 100%, 100%, 100%, 80%, 40% and 0% in article order. All meet an 80% check threshold except Haiku and Luna. Sonnet's only sub-100% checks are August Travel and both Delta charges, each 4/5; Haiku's uncategorized count is 2/5; Luna's July Shopping, August Travel and supported findings are 0/5. README records the Sonnet/low-effort grader configuration and original October 8/9 trial collection versus October 10 regrading. This verification checks retained historical evidence; it does not rerun the measurements or independently reconstruct every original trial command.

The identity and published-skills passages remain unchanged. They retain the provider/model/effort distinction, counts and thresholds, per-check versus whole-report success, the limited five-trial case scope, and historical trials versus regrading. The supplied first-person criticism of skill collections remains an author observation, not an invented survey. Actual installed-skill invocation and outcome checks remain proposed extensions; this prompt suite is not misrepresented as package acceptance evidence.

## Teaching sequence, voice and protected material

The complete reading covered these unchanged headings in order:

1. Verified, Not Trusted: Designing Evals for AI Applications
2. Start with the outcome the user requires
3. An eval exercises the system at its boundary
4. The reference answer belongs outside the trial
5. Choose a grader by the evidence it examines
6. Extract what the answer says, then compare it in code
7. Verify an action using its execution record
8. What exactly is a rubric?
9. Follow the rubric into the judge
10. Ground a rubric in facts without prescribing one answer
11. Test the judge before relying on its verdict
12. Keep a grading error visible
13. Make each repetition a fresh experiment
14. Keep each requirement visible in the acceptance decision
15. Identify the model and effort whenever you report a result
16. Read the recorded results with that identity attached
17. Published skills owe their users the same evidence
18. Change the prompt without changing the examination
19. Preserve the interaction so a failure can be examined
20. Diagnose a wrong total using the reference ledger
21. Regrading changes the measurement, not the original answer
22. Verify the program that performs the evaluation
23. Use the evaluation to decide what the application must enforce

The new material does not disrupt that path. The reader first gets requirements and independent reference facts, then code comparison and execution evidence, then the semantic rubric example and its session boundary. The four-policy table makes an existing ambiguity visible before the writing method generalizes it. Judge evaluation follows when the reader knows what the judge must do. Later diagnosis and regrading add operational limits after artifact inspection has made those limits intelligible. No required explanation is lost through shortening, removal or movement.

The complete related **Verified, Not Trusted: Expense Analysis, Part Three** and **Verified, Not Trusted: Expense Analysis, Part Four** confirm shared subject matter and the same code-first direction. This article still supplies its own vocabulary and examples, then explains the library implementation more deeply. It requires no preceding article to understand the rubric or grader. Existing article content and dates were read only, not revised or newly verified as published behavior.

The voice remains direct, concrete and explanatory. The opening question still names a real verification problem; the worked budget and policy examples answer concrete decisions. The owner's forceful recommendation is neither softened into a preference among equal alternatives nor expanded into an unsupported guarantee. No experience or opinion is invented. The recurring verification principle serves different responsibilities rather than accidental repetition.

Mechanical comparison confirms all 23 heading lines, all 13 fenced code/text/JSON blocks and all eight blockquote lines are identical between baseline and candidate. This preserves the original extraction instructions, JSON/code examples, complete budget rubric and findings quotations. Existing tables retain their contents, with only the authorized fourth budget example added and a new policy table inserted. The six-model table is unchanged. The title, anchors derived from headings and final sentence are unchanged:

> That is how "verified, not trusted" becomes an implementation.

## Prior review, disposition and outside material

After the independent pass, I read `rubric-expansion-review.md` and its corresponding disposition in `editorial.md`. The review assessed candidate hash `c89b27ea2e0f74233f1560c03849aa4b0ac6b0a14b7d01000ef52f545da5a6f2` and found one stale count. Current line 230 now says “four constructed responses,” and the table contains exactly four statements, including the useful $2,000 quotation. The accepted finding is fully resolved without deleting the example. The disposition lists no rejected or deferred finding; no further correction is implied by an absence of edits.

I then checked the writer's contribution assessment against the source already inspected. Its accepted teaching ideas are borne out by the candidate. Its decisions not to claim all rubrics are binary/model-only, strict single-property atomicity, deterministic interpretation, ledger-based detection of every bad verdict, proven causal diagnosis, or fixed-seconds/model-free regrading are justified. The budget rubric supplies semantic rules and targets, while `tables_before_interpretation.md` specifies order without numeric ledger facts; neither supports a universal claim that rubrics are precomputed arithmetic. The exact Shopping table is a writer-expanded teaching aid. These are sound corrections or limits on outside material, rather than missed opportunities requiring more prose.

The original outside-model explanation was not independently available as a separate source in this verification; I do not certify the assessment as a verbatim or exhaustive account of it. I verified the assessment's substantive claims against actual files and call paths. No claim in the candidate depends on accepting that outside explanation as authority. No harmful prior-review suggestion was identified; the review requested only the correct count.

## Dates and pending presentation

`datePublished`: absent in baseline; absent in candidate. `dateModified`: absent in baseline; absent in candidate. Neither version has frontmatter. There is no added, removed or altered date value, and no owner-authorized date correction was needed.

This remains an unpublished draft outside the public content collection. No rendered page was supplied or produced. Rendered dates and homepage ordering are therefore **pending**, not confirmed unchanged by a browser inspection. Before publication, inspect the final candidate at desktop and phone sizes, especially the five-column policy table, four-example table, code wrapping/overflow, quotations, heading/contents anchors and links. No later prose or layout revision is covered by this hash-specific verification.
