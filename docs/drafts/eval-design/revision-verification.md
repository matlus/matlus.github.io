# Independent article revision verification

Reviewed October 17, 2026 under `D:/Source/Repos/matlus.github.io/prompts/verify-article-revision.md`.

## Coverage, reader and evidence limits

I read the complete baseline and complete candidate, including every table, fenced block and quotation, and compared them before reading the previous review or editorial disposition. My initial comparison identified exactly three changes: an introductory terminology paragraph, the synthetic-fixture description, and a direct recorded-grade link. I then read the previous review and disposition and checked each change against the source. This is a revision verification, not a new live evaluation or a repeat of every implementation claim in the original review.

- Baseline: `D:/Python/PWI Code Review/.workspace_tmp/pwi-operations/eval-article/baseline.md`, 463 lines, SHA-256 `aa91c61751c12071b6547ffe367adccd7d77a616f394ac1a86d0b1e253a1d648`.
- Candidate: `D:/Source/Repos/matlus.github.io/docs/drafts/eval-design/evals-at-the-system-boundary.md`, 465 lines, SHA-256 `207d5afa9b3d3ee81950ef3c4a869674f9548726b79eaf225fdbc5b1d788bde9`.
- Website HEAD: `6f2e87d60139f7ca3907b495a5b9a76e8be1ad05`. These hashes identify working-copy inputs; the candidate is an untracked draft, not a claimed committed article.
- Source HEAD: `55e0cb33aac71440e1cf671db3a8b3d676b58f77`. It and the article's pinned public revision `29104e777bd33bc707f0662573631d6682c70e9e` resolve locally to the identical tree `b8b612a7adb34843bab58cd48907d083fb2c6daf`. Source status was only the pre-existing untracked `talks/`.

The supplied reader is an application developer familiar with application code and tests, new to eval terminology, rubrics, grader selection and harness design. I read the brief, the blog-writing skill and all three supporting references, and the complete original **The Purpose and function of a Data Access Layer**. I also read the complete current working copies of **Verified, Not Trusted: Expense Analysis, Part Three** and **Verified, Not Trusted: Expense Analysis, Part Four** before assessing continuity. Those existing articles are protected dirty worktree material and were not edited.

All 20 headings were read in this unchanged order:

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

The final body sentence is unchanged: **That is how "verified, not trusted" becomes an implementation.** There are no figures, captions, footnotes or collapsed blocks in either version.

## Verdict: improved

No regression was found. The revision improves prerequisite teaching, fixture provenance and access to the recorded evidence. These are specific reader benefits, rather than a preference for shorter or smoother prose. No further prose correction is required by this verification. Rendered presentation remains pending.

### Every actual change

| Change and exact location | Evidence and consequence | Result |
| --- | --- | --- |
| Candidate line 11 adds: “The arranged scenario is a case. One execution of it is a trial. A grader examines evidence from a trial to decide whether a particular requirement was met.” | `managers/models/eval_suite_models.py:37` defines `EvalCase` with inputs and reference facts. `managers/models/trial_models.py:7` identifies a trial by variant, case and repetition. `managers/engines/engine_trial_execution.py:76` composes one assignment for each selected variant, case and repetition. The paragraph gives the novice names for concepts just introduced by the scenario and repetition explanation, before the later trial/reference sections depend on them. The detailed grader table remains in place. Its meaning is consistent with Part Four's run/trial and grader definitions. | Improved understanding; supported by the implementation. |
| Baseline line 19 becomes candidate line 21: “Our input is a synthetic teaching log styled as 198 hand-kept expenses covering June through August...” | `evals/expense_analysis/cases/june_august_2026/expense_reference_key.md:3` explicitly calls it a synthetic teaching log. Line 79 states that the input has 198 transaction rows in 201 physical lines. A read-only comparison found 198 ledger entries and zero mismatches between each ledger entry's `source_text` and the input line it names. This corrects a plausible impression that the fixture records an actual person's spending while preserving its deliberately irregular form and all example details. It adds no personal experience. | Improved accuracy of provenance. |
| Baseline line 403 becomes candidate line 405: the words “recorded run” link directly to the pinned `grade.json`. | The link targets `results/pwi/expense_analysis/20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6/trials/standard/june-august-2026/run-05/grade.json` at the article's pinned revision. `git cat-file` confirms that exact object exists locally at that revision. Its line 16 records `1563.82`; lines 70–94 contain the failed travel check, reference `1631.82`, accepted Uber-in-Transport policy and line-169 Airport Parking candidate with `-68.00` effect. The adjacent `answer.md` independently shows the $1,563.82 travel total. Readers can now inspect the precise evidence without searching run directories. The result, numbers and interpretation have not changed. | Improved traceability; the accepted review concern is resolved. |

Source code paths in the first row are relative to `D:/Python/Skills and Evals/packages/prompt-evals/src/prompt_evals/`. Other source paths are relative to `D:/Python/Skills and Evals/`.

The direct grade link is an evidence-file link, so “recorded run” is an appropriate label; it is not a shortened or inaccurate linked article title. Browser navigation to GitHub was not tested. The object and contents were checked locally at the pinned revision.

## Preserved argument, examples and reported evidence

The complete diff contains only those three hunks. No section or explanatory paragraph was removed or moved. The opening assurance problem, the questions about arithmetic and grounding, the full rubric walkthrough, the distinction between model extraction and code grading, the limitations of tool-call evidence, the need to evaluate a model judge, errors in the denominator, per-check versus whole-report success, regrading and runtime enforcement all remain intact. “Instruction is not assurance” and “verified, not trusted” retain their original force and scope. No personal experience or successful measurement was invented.

A literal comparison confirms that all 13 fenced blocks, all 20 table rows, all eight quoted lines and all 20 headings are identical. This preserves the tested instruction quotations, code excerpts, schemas, reference-value excerpt and diagnostic display. Title and heading-derived anchors are unchanged; there are no new explicit anchors. The added paragraph does not replace the useful definition and explanation of graders later in the article. No necessary explanation was lost to repetition removal because no such removal occurred.

I checked the arithmetic supporting the linked example directly using decimal sums over the reference ledger:

- Dining totals are $212.74, $165.14 and $398.69; July Shopping is $756.72.
- August Travel is $1,655.92 under the baseline policy. Moving the $24.10 Uber to Transport gives $1,631.82. Subtracting the $68.00 Airport Parking entry gives the recorded $1,563.82; reported minus reference is -$68.00.
- Ledger line 169 is Airport Parking, $68.00, in Travel. Lines 167 and 168 preserve the distinct $412.60 and $450.60 Delta charges; line 108 preserves the negative $68.00 REI refund. The duplicate and category-policy qualifications remain unchanged.
- The constructed $398.71 versus $398.69 example differs by $0.02, and three passes out of five is 60%. These remain illustrative arithmetic, not newly observed model results.

The saved event stream's recorded Python command places generic `parking` matching in Gas/Transport before its Travel matching. That supports examining category assignment when diagnosing the linked failure. The candidate appropriately retains the more cautious distinction between an arithmetic candidate explanation and an observed cause. It does not convert this regraded historical artifact into a new trial or a claim about today's model reliability. No chronology or measurement changed.

The standalone contribution remains the implementation path from requirement to rubric, judge request, validated result, error handling and acceptance decision. Part Three's measured prompt comparisons and Part Four's introductory vocabulary/entry examples remain separate contributions. The three edits introduce no contradiction with those complete related texts and do not require their alteration.

## Previous review and disposition

The previous review had one actual finding, the missing direct evidence link. It was accepted and is now resolved by the correct pinned grade link. Linking the saved calculation was optional, not an unresolved requirement. The other two changes are explicitly recorded authoring improvements and are supported independently above.

The disposition says no findings were rejected or deferred. That agrees with the review; there are no harmful rejected suggestions to validate and no obligation to invent additional changes. The earlier review's broader claims about every implementation and test surface were not assumed to be fresh test or live-model results in this verification.

## Dates, protected material and pending presentation

| Field | Baseline | Candidate | Finding |
| --- | --- | --- | --- |
| `datePublished` | Absent; zero occurrences | Absent; zero occurrences | Preserved exactly |
| `dateModified` | Absent; zero occurrences | Absent; zero occurrences | Preserved exactly |

Neither version has frontmatter or an assigned public URL. No date was added, removed or changed. The draft contains no prohibited internal branding. Existing archives, chapters, published content, artwork, source code and unrelated dirty changes were not edited by this verifier. The only written file is this report.

No rendered candidate was supplied. Actual desktop/phone layout, rendered dates, homepage ordering, heading navigation, table/code overflow and clicked-link behavior remain **pending**, as required before publication. The unchanged date absence and draft location are inspected source facts; they are not claimed as rendered-page verification. No publication, assets, commits, pushes, source tests, live model sessions or paid APIs were performed.
