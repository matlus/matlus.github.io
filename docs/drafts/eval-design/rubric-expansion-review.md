# Rubric expansion: independent teaching and evidence review

## Coverage, reader and limitations

Reviewed October 17, 2026 against `prompts/review-article-teaching-and-evidence.md`. I read the complete candidate and complete preserved baseline, including every code block, quotation and table, before forming conclusions. I did not read prior reviewer reports, editorial dispositions or the writer's contribution assessment. The later coordinator message supplied the owner's additional deterministic-grading direction; I read the updated brief and reread the current candidate, including both new direction paragraphs.

- Candidate: `evals-at-the-system-boundary.md`, SHA-256 `c89b27ea2e0f74233f1560c03849aa4b0ac6b0a14b7d01000ef52f545da5a6f2`.
- Complete baseline: `revisions/before-rubric-expansion.md`, SHA-256 `85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc`.
- Pinned implementation revision: `29104e777bd33bc707f0662573631d6682c70e9e`; inspected local HEAD: `55e0cb33aac71440e1cf671db3a8b3d676b58f77`. Both tracked trees resolve to `b8b612a7adb34843bab58cd48907d083fb2c6daf`; the tracked diff is empty. The source checkout's untracked `talks/` was left untouched.
- Complete related article read: **Verified, Not Trusted: Expense Analysis, Part Three**, SHA-256 `4de952e217a2f6dbe1d7054754e030763eac61af9f5076e56a8ba425157dfd95`.
- Complete related article read: **Verified, Not Trusted: Expense Analysis, Part Four**, SHA-256 `e5ea1900e57432fa70359e03520119bc41e33168f477d47fef4753155399a757`.

The intended reader is the supplied application developer who knows ordinary code and tests but is new to eval vocabulary, grader selection, rubrics and harness design. The governing position is that evals exercise the functional acceptance contract at the system boundary; instruction is not assurance. Prefer deterministic grading whenever code can establish the requirement, and constrain unavoidable model interpretation with evidence and a rubric. I applied the blog-writing skill and its clarity, voice/flow and spoken-teaching references, plus the complete original **The Purpose and function of a Data Access Layer** sample.

This is a source review of an unpublished Markdown draft, not a live evaluation or publication acceptance. No models, tests, build, commit or publication ran. No rendered preview was supplied or inspected. The original trial streams were not exhaustively re-audited; existing historical measurements were checked through their retained scorecards and the README. Proposed production checks are assessed as recommendations, not implemented guarantees.

### Candidate headings read in order

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

Final sentence of the candidate body, also the baseline's final sentence:

> That is how "verified, not trusted" becomes an implementation.

## Ranked findings

### 1. Confirmed copy defect, low impact: the example count is stale

**Location:** candidate line 230, in **What exactly is a rubric?**

**Passage:** “Now apply it to three constructed responses:”

**Reader difficulty:** the table immediately following has four candidate statements. Adding the faithful $2,000 quotation expanded the example set without updating its introduction. The count contradiction is minor but visible in a section teaching precise decision rules.

**Evidence:** the baseline has three rows; the candidate adds `"You said you don't want shopping to quietly become $2,000."` as a fourth row. The addition is supported by the literal budget rubric and should remain.

**Smallest correction:** change “three” to “four” in the lead-in. Do not remove the useful boundary example.

No other substantive accuracy or teaching defect was established. No preferences are promoted to required changes.

## Evidence checks and arithmetic

### Rubric meaning and constructed budget examples

I read the complete `no_invented_budgets.md`, `three_supported_findings.md` and `tables_before_interpretation.md`, the suite definition, both inputs, the reference key, expected facts and ledger. The complete budget quotation matches its source. All four constructed verdicts follow the budget criterion: the supplied dining target, future tracking suggestion and faithful $2,000 quotation are permissible; calling travel over budget violates it even without a number. The examples are explicitly constructed and concern only that criterion. The illustrative Boolean response is not passed off as a recorded judge output.

The added explanation correctly distinguishes general rubrics, which may guide people or define score levels, from this implementation's per-check Boolean verdicts and separately recorded grading errors. It does not promise deterministic interpretation or claim that rubric precision proves judge reliability. The supported-findings rubric really combines count, agreement with the answer's tables and noncontradiction of reference facts under the accepted policy.

### All four accepted shopping policies

I compared all 198 ledger `source_text` values with their corresponding 1-based lines in the original input: zero mismatches. I independently summed counted Shopping entries with decimal arithmetic, adding the books and Steam alternatives independently. The results are:

| Policy | June | July | August | Exact three-month sum |
| --- | --- | --- | --- | --- |
| Books and Steam in Entertainment | $960.07 | $756.72 | $1,061.93 | $2,778.72 |
| Books in Shopping; Steam in Entertainment | $1,020.77 | $756.72 | $1,218.31 | $2,995.80 |
| Books in Entertainment; Steam in Shopping | $1,007.65 | $756.72 | $1,061.93 | $2,826.30 |
| Books and Steam in Shopping | $1,068.35 | $756.72 | $1,218.31 | $3,043.38 |

The books adjustments are $29.02 + $31.68 = $60.70 in June and $77.40 + $78.98 = $156.38 in August. Steam contributes $47.58 in June only. Thus $1,061.93 + $156.38 = $1,218.31 and $1,218.31 - $1,200 = $18.31. Every June figure and July's $756.72 remain below the approximate $1,200 target. The table, monthly conclusions and rounded-versus-exact distinction are correct. Its introduction accurately identifies the table as a writer-expanded rendering of source paragraphs, not a literal source quotation.

### Judge composition, validation and diagnosis

The suite loads the rubric for a named judge check. `LlmProcessorRubricJudgment.judge_answer` composes the quoted instructions, rubric and candidate answer; `LlmProcessorBase` creates a request with empty input files and tool kinds and a structured-output schema. The original log and entry-level ledger are not supplied in that request. `ValidatorGraderResponseResource` validates Boolean/string fields and each disputed amount's structure before constructing the verdict. `EngineTrialGrading` maps verdicts to check outcomes and then invokes `CheckOutcomeDiagnosisProcessor`.

The added limit is exact: `diagnose_judge_check_outcome` enters its diagnosis branch only for a succeeded judgment whose outcome is FAILED and whose ledger is present. Even there, usable disputed amounts must resolve to ledger buckets before an amount diagnosis is possible. PASSED and ERRORED outcomes return unchanged. A passing verdict therefore has no independent ledger-based correctness gate. The preceding paragraph already says code “attempts” to connect disputed amounts, so the addition does not imply every failure receives a diagnosis.

`AmountDiscrepancyDiagnosisProcessor` searches accepted policy compositions, favors the fewest entry mistakes and bounds the search. The retained grade for the linked standard/run-05 example contains $1,563.82 reported, $1,631.82 reference and the $68.00 line-169 Airport Parking omission candidate. The article preserves the need to confirm a numerical candidate against the saved calculation. Reviewed-label evaluation of false acceptance is clearly recommended work, not an existing implementation claim.

### Regrade and retained results

`ManagerEvaluation.regrade_evaluation` reloads the current suite, reads saved trial sessions and calls the same `_grade_and_score` operation used after live trials. For completed trials, `EngineTrialGrading` reruns fact extraction and each judge, then code checks, diagnosis and aggregation. `EvaluationArtifactEmitter` re-emits trial records and writes new grades and scorecards. The command-line host creates a distinct regrade directory and writes `regraded_from.txt`. The added passage accurately explains that original task execution is saved while grading work remains. It makes no unsupported elapsed-time promise.

I reconstructed the surrounding six-model results from the eight scorecards named by the identity brief, pooling the one-trial and four-trial folders for Opus and Sol. Lowest per-check rates are respectively 100%, 100%, 100%, 80%, 40% and 0% in article order. Sonnet's only sub-100% checks are both Delta charges retained and August travel, each 4/5; Haiku's uncategorized count is 2/5; Luna's July Shopping, August Travel and findings are each 0/5. The article retains historical trials versus regrading, per-check versus joint report success, evaluated effort versus cross-effort inference, and prompt evidence versus skill installation/invocation evidence.

## Teaching continuity, author intent and scope

The sequence introduces cases, trials and graders before using them, establishes reference independence, shows deterministic comparison and execution evidence, then teaches the rubric and follows it into a judge. The expanded policy table answers a concrete question: which numerical result is acceptable, and why must a budget conclusion follow the answer's chosen policy? The writing method arrives after the worked example and leads directly into measuring the judge. These additions fulfill the article's promised explanation without requiring a repository visit.

The new introduction and grader-selection paragraph preserve the owner's code-first direction. Their repetition has distinct work: the introduction states the design principle; the grader section applies it at the selection decision; the extractor example then demonstrates the narrow interpretation that still remains. Later schema, diagnosis and judge-label passages concern different assurances. Removing these returns merely because they mention verification would erase useful distinctions.

Complete reading of Parts Three and Four confirms substantial shared subject matter, as expected for this standalone article. Part Three builds and measures a simpler runner; Part Four explains vocabulary through selected log entries and a structured workflow. This draft contributes the library implementation path, detailed rubric construction, explicit judge limitations, model identity reporting, artifacts and regrading. The new table and rubric-writing method advance that purpose rather than merely repeating a series recap. No continuity correction or insertion of adjacent-article links is needed.

The firm stance remains supported: instruction does not establish execution; a schema-valid verdict does not establish semantic correctness; a published skill owes users evidence for their configuration. The owner's first-person observations remain personal observations. The draft does not claim a measured census of skill repositories or package acceptance based on prompt-only results. No artificial balance or softening of the position is warranted.

The complete baseline comparison shows additions only. Existing argument, headings, code, source quotations, historical results and skills section remain intact. Both date fields remain absent. There is no new frontmatter, artwork, publication action or unrelated source change in this assignment.

## Highest-value correction and pending checks

Make the one-word count correction in finding 1. Retain the added rubric explanation, policy arithmetic, writing method, diagnosis limit, regrade clarification and deterministic-grading direction. No further revision is required by this independent review.

Fresh revision verification remains a separate step after correction. Before publication, render and inspect desktop and phone layouts, including the five-column policy table, budget example table, code wrapping/overflow, heading anchors and contents entries, block quotations and link behavior. These checks are pending, not passed. No unresolved evidence conflict was found in the added teaching material.
