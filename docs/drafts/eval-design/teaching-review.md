# Independent teaching and evidence review

Reviewed October 17, 2026. Read-only review; the article and source repositories were not changed. No model sessions, tests, publication, commits or paid APIs were run.

## Coverage, reader and limitations

Complete draft: `D:/Source/Repos/matlus.github.io/docs/drafts/eval-design/evals-at-the-system-boundary.md`, 463 lines, SHA-256 `aa91c61751c12071b6547ffe367adccd7d77a616f394ac1a86d0b1e253a1d648`. Website HEAD at review: `6f2e87d60139f7ca3907b495a5b9a76e8be1ad05`. The hash identifies the reviewed working copy; it is not a claim that the draft is committed.

Reader supplied by the brief: an application developer familiar with ordinary code and tests, new to eval terminology, grader selection, rubrics and harness design. The review used `prompts/review-article-teaching-and-evidence.md`, the complete brief, the blog-writing skill and all three supporting voice references, and the complete original sample **The Purpose and function of a Data Access Layer**.

Headings read in order:

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
15. Change the prompt without changing the examination
16. Preserve the interaction so a failure can be examined
17. Diagnose a wrong total using the reference ledger
18. Regrading changes the measurement, not the original answer
19. Verify the program that performs the evaluation
20. Use the evaluation to decide what the application must enforce

Final article-body sentence: **That is how "verified, not trusted" becomes an implementation.** All prose, tables, code and quoted rubrics were read. There are no collapsed blocks or figures in this draft.

Both related articles were read completely, including their code, tables, figure captions and closing text: **Verified, Not Trusted: Expense Analysis, Part Three** and **Verified, Not Trusted: Expense Analysis, Part Four**. The new article's contribution is implementation reasoning and the path from a criterion through a rubric, a structured judge response, error handling and acceptance. Its necessary recap of references, grader kinds and pass rates advances that standalone explanation. I found no material contradiction or unnecessary duplication requiring removal.

Source evidence was inspected locally at `D:/Python/Skills and Evals`, HEAD `55e0cb33aac71440e1cf671db3a8b3d676b58f77`. Its tree and the article's pinned public revision `29104e777bd33bc707f0662573631d6682c70e9e` both resolve to `b8b612a7adb34843bab58cd48907d083fb2c6daf`; the relevant tracked trees have no difference. Source status remained only the pre-existing untracked `talks/`. No current provider behavior or live judge accuracy was tested. This review establishes fidelity to the checked-in implementation and recorded evidence, not current host acceptance or a fresh model measurement. No outside critique was used.

## Findings

No confirmed technical defect or material teaching discontinuity was found. One supported editorial concern remains.

### 1. Give the recorded travel failure a direct evidence link

**Status:** Supported editorial concern, low priority. This is a traceability improvement, not a correction to the numbers or explanation.

**Location:** Lines 403–417, under **Diagnose a wrong total using the reference ledger**. Exact opening: “A recorded run reports August travel as $1,563.82.”

**Reader difficulty:** This is the article's concrete recorded result, but the passage gives neither a link nor a run identifier. The opening repository link fixes the source revision, yet a reader wishing to inspect the saved answer, grade or calculation must search many run directories. The article itself teaches that a failure should lead back to its evidence.

**Evidence:** At the pinned revision, `results/pwi/expense_analysis/20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6/trials/standard/june-august-2026/run-05/grade.json` contains the reported `1563.82`, reference `1631.82`, accepted Uber-in-Transport policy, and line-169 Airport Parking candidate with `-68.00` effect. The adjacent `answer.md` reports $1,563.82. The saved event stream contains the calculation and its output; the category matching puts `parking` in Gas/Transport before reaching the Travel category, accounting for the $68 travel difference. The draft correctly calls the deterministic diagnosis a candidate and does not claim the total alone proves causation.

**Smallest effective correction:** Link “A recorded run” directly to the pinned `grade.json`, and optionally link “saved calculation” to the adjacent event stream. No new section or expanded retelling is needed. Use this grade target:

`https://github.com/matlus/Skills-and-Evals/blob/29104e777bd33bc707f0662573631d6682c70e9e/results/pwi/expense_analysis/20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6/trials/standard/june-august-2026/run-05/grade.json`

## Evidence checks supporting the review

- The suite, all files under `grading/`, budget notes, expected facts, reference key and ledger support the stated targets, rubric quotations and accepted policies. Reading all 198 ledger entries and comparing their source text with the input produced zero mismatches. Decimal summation reproduces dining $212.74/$165.14/$398.69, July shopping $756.72 and baseline August travel $1,655.92. Moving the $24.10 Uber gives $1,631.82; subtracting $68 gives $1,563.82. The constructed two-cent failure and 3/5 = 60% example are correct.
- `domain_facade.py`, `manager_evaluation.py`, the suite loader and validators, and `reference_ledger_totals_processor.py` support the public operation, separation of trial inputs from referenced grading files, ledger reconciliation, and separation of execution from grading.
- Execution and grading engines, the amount/fact/tool/judge processors, both LLM processors, their base class and response validator, and session/grading/scorecard models support the illustrated requests, one semantic retry after unusable structured output, preservation of failures and errors, and domain response validation. A valid failing verdict is not retried for a better verdict. Unexpected unhandled failures propagate.
- Both CLI gateways and the gateway protocol support fresh working directories, file copies, adapter-owned provider translation and tool-record mapping. The draft carefully says a judge request asks for no tools and acknowledges host capability differences; it does not incorrectly promise identical enforcement across the adapters. Its warning that temporary directories are not a complete security boundary is warranted.
- Aggregation pools selected cases by variant/check, keeps errors in the denominator and requires all gated rows to meet their thresholds. The distinction between per-check rates and the joint success rate of complete reports is accurate and useful. Five repetitions and an 80% threshold are correctly identified as this experiment's arrangement, not a universal production guarantee.
- The artifact emitter, results writer, regrade path and live pytest entry point support the reported layout, callback boundary, new regrade directory/source record and gated-row assertion. The draft correctly identifies additional production provenance and immutability requirements as recommendations rather than features already provided by the emitted artifacts.
- Acceptance-test arrangements and assertions inspected under `tests/acceptance/domain_facade/` cover scripted process-boundary trials, separate grading sessions, errors, regrades, diagnosis, timing and artifact output. Focused amount, tool-use and grader-response class tests support the examples and malformed-response handling. Tests were read, not executed; their existence is not reported as a fresh test pass or evidence of a live judge's accuracy.

## Teaching, voice and scope assessment

The opening poses a concrete assurance problem and answers it through one continuous expense example. Grader and rubric definitions arrive before use; the complete budget rubric, candidate statements, composed judge prompt and illustrative JSON response make the central path understandable without opening the repository. Repeated returns to accepted category policies add a different point each time: fair references, consistent findings, and bounded diagnosis.

The author's position remains forceful and supported: instruction is not assurance, evals exercise acceptance obligations at the system boundary, and graders require verification too. The draft introduces no first-person experience needing corroboration. Its code excerpts match the implementation, with the amount method explicitly identified as reformatted. Recommendations for production evidence, live judge calibration, scenario coverage and runtime validation are separated from implemented behavior. The final section turns the explanation into concrete design decisions rather than repeating a slogan alone.

The draft is standalone, has one H1 followed by consistent H2 headings, contains no prohibited internal branding, and has neither date field. Its only link label is the repository name, so there are no inaccurate linked article titles to correct.

## Highest-value change and unresolved checks

1. Add the direct pinned link to the recorded travel grade. No further substantive revision is requested by this review.

Rendered desktop and phone inspection remains pending, as allowed for this Markdown review. Before publication, inspect table overflow, code readability, heading anchors/contents and link behavior in the actual article layout. This review does not substitute for the publication workflow, copy-audit execution, or verification of a subsequently revised article. No unresolved source claim prevents the present teaching/evidence assessment.
