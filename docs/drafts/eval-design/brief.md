# Eval design article brief

Article: `docs/drafts/eval-design/evals-at-the-system-boundary.md`.
Working title: **Verified, Not Trusted: Designing Evals for AI Applications**.
New standalone teaching draft outside the public content collection. No publication
or update date fields are present. No public URL has been assigned.

Reader: an application developer who knows ordinary application code and tests but
does not yet understand eval terminology, grader selection, rubrics or the design
of an evaluation harness. The article must teach the implementation and the reason
for each choice without requiring the reader to open the repository.

Author position supplied October 17, 2026: evals deserve a standalone pedagogical
article covering what they are, why they are needed, grader kinds, actual rubrics
and their use, and production implementation. Treat evals as functional acceptance
tests at the system boundary. Preserve the principles "verified, not trusted" and
"instruction is not assurance." Explain deliberate design through code and examples.
Preserve the force of that position while grounding technical claims in evidence.

Source repository: `D:/Python/Skills and Evals`.
Inspected local revision: `55e0cb33aac71440e1cf671db3a8b3d676b58f77`.
Public main verified October 17: `29104e777bd33bc707f0662573631d6682c70e9e`.
GitHub compare reports one merge commit ahead and no differing files, so the
inspected tracked source tree is identical. Source working tree has only pre-existing
untracked `talks/`; leave it untouched.

Evidence to inspect:

- `evals/expense_analysis/eval_suite.json`, all `grading/` files and the case's
  budget notes, expected facts, reference key and ledger.
- `packages/prompt-evals/src/prompt_evals/domain_facade.py` and
  `managers/manager_evaluation.py`.
- `managers/data_managers/data_manager_eval_suite.py`, its suite validators and
  `processors/reference_ledger_totals_processor.py`.
- `managers/engines/engine_trial_execution.py`, `engine_trial_grading.py`, all
  relevant grading processors and LLM processors, including the response validator.
- `managers/models/llm_session_models.py`, `grading_models.py`, and scorecard models.
- `managers/gateways/gateway_claude_cli.py`, `gateway_codex_cli.py` and protocol.
- `managers/processors/scorecard_aggregation_processor.py`, artifact emitter and
  `apps/prompt-evals-app/src/prompt_evals_app/results_directory_writer.py`.
- `packages/prompt-evals/tests/acceptance/domain_facade/` and focused amount,
  tool-use and grader-response class tests; `evals/expense_analysis/test_expense_analysis_prompt_eval.py`.
- Recorded failure: `results/pwi/expense_analysis/20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6/trials/standard/june-august-2026/run-05/grade.json`
  and its answer/event stream.

Related articles: website source files
`src/content/writing/verified-not-trusted-expense-analysis-part-three.md` and
`verified-not-trusted-expense-analysis-part-four.md`. The new article stands alone
and focuses on implementing the acceptance contract and explaining code decisions.
Read those parts completely before judging overlap or continuity.

Voice: `C:/Users/shivk/.codex/skills/blog-writing/SKILL.md` and its references.
Representative original sample: website
`docs/source-material/matlus-wayback/articles/The Purpose and function of a Data Access Layer.txt`.
Plain connected explanations, concrete examples and purposeful questions. No
invented experience or claims of verification unsupported by the supplied sources.

Protected: all existing website articles, original archives, PWI chapters,
existing artwork, source repository code and all pre-existing working tree changes.
Only the new draft and its editorial files are in scope. Drafting does not authorize
publication, commits, pushes, model campaigns or new media generation.

Follow `prompts/review-article-teaching-and-evidence.md` for the fresh independent
review and `prompts/verify-article-revision.md` for revision verification. A Markdown
review can leave rendered desktop/phone inspection pending; it is required before
publication. Both date fields must remain absent in this draft.
