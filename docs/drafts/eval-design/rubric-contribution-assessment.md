# Rubric contribution assessment

The owner supplied Gemini-generated explanatory material and authorized using
useful parts after source verification, blog-writing revision and the complete
editorial process. The implementation and actual rubric files remain authority.
This assessment records the writer's decisions; fresh reviewers do not read it
before their independent first pass.

## Incorporated teaching

- Make the acceptance-specification role explicit: a named check, supplied
  criteria, a completed PASS/FAIL judgment and a pass-rate gate. Define the actual
  implementation without claiming all rubrics are binary or model-only.
- Display all four accepted Shopping combinations for books and Steam. Expand the
  source's stated policy adjustments into a writer-authored teaching table; show
  independently calculated three-month totals to the cent. The raw Markdown
  rubric states some alternatives as adjustments and uses rounded period totals.
- Add a concrete passing quotation of the user's $2,000 shopping concern to the
  existing constructed-response table, keeping the original rubric unchanged.
- Explain why pre-established reference facts let the judge compare claims
  against accepted results without reconstructing the ledger for those facts.
- Give a short rubric-writing sequence leading into the existing judge-validation
  section: obligation, evidence, independent references, alternatives, explicit
  conditions and legitimate boundary cases.
- Clarify the actual failure-diagnosis and regrading paths where the outside
  explanation could otherwise imply stronger guarantees.

The owner's later instruction establishes the article's governing direction:
prefer deterministic grading, use model judgment only for necessary interpretation,
and constrain it with evidence and a rubric. This now appears in the introduction
and before grader selection. Existing extraction discussion retains the fact that
a model-based extractor also adds a model-dependent step.

## Claims corrected or not adopted

- A rubric can guide humans and can describe graded performance. This suite's
  separate model judges return binary verdicts; an unavailable judgment is an
  error, not a binary observation. The article distinguishes these scopes.
- Literal single-property atomicity does not describe the findings rubric: it
  checks both the required count and the support/consistency of the findings.
  The useful design principle is a bounded, named acceptance obligation with
  explicit conditions and an interpretable result.
- Supplied facts reduce the need to derive reference numbers; the judge still
  interprets wording, identifies policy and compares claims. A rubric constrains
  discretion without proving deterministic or consistently correct interpretation.
- The table covers the reference's four accepted Shopping policies, not every
  possible real-world classification or every condition of the complete eval.
  June–August is a three-month period, not a calendar quarter.
- `no_invented_budgets.md` supplies user-stated targets and semantic boundary
  rules. It does not consist of precomputed totals. `tables_before_interpretation.md`
  specifies an ordering requirement without a numerical reference ledger.
- Code validates verdict structure and diagnoses suitable failed checks. The
  diagnosis is a candidate arithmetic explanation, not proof of an exact observed
  line-item decision. Passing judge checks bypass this ledger-diagnosis path, so
  it cannot automatically expose a judge's false acceptance or undue leniency.
  The reviewed-label evaluation described in the article addresses judge accuracy.
- Regrading reuses the trial answers but invokes extraction and judge model
  sessions again. No evidence supports an instantaneous or fixed-seconds duration,
  and "without re-running models" would incorrectly include grader models.
- The preference for deterministic checks is retained while preserving the
  actual model-assisted extraction path for free-form answers. Its deterministic
  comparison does not make the full extraction-and-grading pipeline deterministic.

## Primary evidence and arithmetic

Source pin: `29104e777bd33bc707f0662573631d6682c70e9e` in
`matlus/Skills-and-Evals`, identical tracked tree to inspected local
`55e0cb33aac71440e1cf671db3a8b3d676b58f77`.

Read all actual rubric text, the reference key, the judge processor and schema,
grading engine, diagnosis processor and `ManagerEvaluation.regrade_evaluation`
through `_grade_and_score`. The latter reruns `grade_trials`, whose extraction
and judgment methods invoke their configured model sessions.

Using Decimal arithmetic, the four Shopping profiles are:

| Books in Shopping | Steam in Shopping | June | July | August | Three-month total |
| --- | --- | --- | --- | --- | --- |
| No | No | 960.07 | 756.72 | 1061.93 | 2778.72 |
| Yes | No | 1020.77 | 756.72 | 1218.31 | 2995.80 |
| No | Yes | 1007.65 | 756.72 | 1061.93 | 2826.30 |
| Yes | Yes | 1068.35 | 756.72 | 1218.31 | 3043.38 |

The book adjustments are 60.70 in June and 156.38 in August; Steam adds 47.58 in
June only. These values agree with the independently established reference key.
No existing rubric quotation, code, model-result table or source test was changed.
This is evidence verification for prose; no live model evaluation was performed.
