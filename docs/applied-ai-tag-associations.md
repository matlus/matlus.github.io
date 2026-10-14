# Applied AI Engineering tag associations

On October 14, 2026, Shiv approved adding Applied AI Engineering for articles
about engineering AI applications and workflows. Using AI to develop software
alone remains under AI-Assisted Development. Tags describe what a post teaches;
their exact wording need not occur in its prose.

## Associations

An independent read-only assessment read the seven selected articles completely
and compared four nearby articles before the additions were applied.

| Article | Added tags | Evidence |
| --- | --- | --- |
| [Jev: A Practical Reference](../src/content/writing/jev-practical-reference.md) | Applied AI Engineering | Request design, bounded decisions, workflow patterns, architectures and evaluation. |
| [Using Jev Compact LLM Context](../src/content/writing/using-jev-compact-llm-context.md) | Applied AI Engineering | Context selection, source preservation, response validation and deterministic reassembly. |
| [Skills versus Controlled Workflows](../src/content/writing/skills-versus-controlled-workflows.md) | Applied AI Engineering | Allocation of control, enforced obligations, bounded model responsibility and retained evidence. |
| [Verified, Not Trusted: Expense Analysis, Part One](../src/content/writing/verified-not-trusted-expense-analysis-part-one.md) | Applied AI Engineering | Task contracts, category policy, computation and verification of the model-controlled workflow. |
| [Verified, Not Trusted: Expense Analysis, Part Two](../src/content/writing/verified-not-trusted-expense-analysis-part-two.md) | Applied AI Engineering; LLM Systems | Controlled application implementation, processors and gateways, extraction fallback and validated finding selection. |
| [Verified, Not Trusted: Expense Analysis, Part Three](../src/content/writing/verified-not-trusted-expense-analysis-part-three.md) | Applied AI Engineering; AI Workflow Patterns | Isolated evals and the worked separation of model extraction, code comparison and narrow judge rubrics. |
| [Verified, Not Trusted: Expense Analysis, Part Four](../src/content/writing/verified-not-trusted-expense-analysis-part-four.md) | Applied AI Engineering; AI Workflow Patterns; Jev; Python | Reference construction, bounded candidate selection, confidence fallback, corrective retries and the linked Python implementation. |

The Part Four Python association is supported by inspected public source:

- [ManagerExpenseAnalysis](https://github.com/matlus/Analyze-Expenses-Workflow/blob/main/packages/analyze-expenses-workflow/src/analyze_expenses_workflow/managers/manager_expense_analysis.py)
  implements the processing chain the article explains.
- [Workflow eval test](https://github.com/matlus/Analyze-Expenses-Workflow/blob/main/evals/workflow/test_expense_analysis_workflow_eval.py)
  implements isolated runs, structured outcome grading and per-check pass-rate gates.

Model Evaluation remains the existing eval subject. AI Architecture and LLM Evals
were not introduced as overlapping tags. GenAI Production is deferred. Provider
names in the selected examples do not warrant new provider collections for this
pass; Part Three's runtime setup supports its eval lesson without making provider
integration the organizing subject.

AI-native SDLC and Stampede at the Gates retain their software-delivery
classification. The Gateway Design Pattern: Roles and Responsibilities teaches
the movie-service gateway; its LLM paragraph is incidental. Logs and Artifacts:
Pipeline Breadcrumbs teaches observability using an AI pipeline as its example.
These four articles did not receive the new umbrella.

The edits retain every existing tag and change only the selected tag lists.
Descriptions, titles, article bodies, dates and their field presence, URLs,
article artwork and homepage ordering are preserved.

## Verification and topic image

Typecheck completed with zero errors, zero warnings and 34 existing hints. All
six external-link tests passed. The final build produced 330 pages and a search
index of 329 pages. Tag validation found 179 distinct tags with complete image
and prompt records. Generated internal links resolve and external links comply
with the new-tab policy. A comparison with HEAD confirmed that only tag lists
changed in all seven articles. The built topic page contains exactly those seven
articles and was inspected at desktop and 390-pixel phone widths.

The clean publication checkout's full copy audit inspected 860 files with zero
hard failures and 62 advisory flags on retained text. The primary checkout's
full working-directory audit sees 21 pre-existing hard flags in unrelated,
untracked narration-review drafts. Those drafts were not copied into the
publication checkout and remain untouched. New authored copy passes both
applicable audits; flags on retained text were reviewed.

The new topic hero has Shiv and the dark-haired woman from the left of Expense
Analysis Part One's hero standing behind the application instrument,
facing the viewer, as requested. Its complete prompt and refinements accompany
`tag-applied-ai-engineering.webp`. Repeated generation requests returned 2120 x
742 pixels. Shiv approved the final image at its native size, exact 20:7 ratio,
without upscaling or added margins. This is an accepted resolution exception to
the 2400 x 840 standard. Shiv authorized commit, push, PR and merge. Publication
uses an isolated checkout based on current main, preserving the Discover-preview
work and unrelated local drafts. The publication PR records final checks and
deployment verification against the exact merge commit.

## Workflow guidance

The extraction prompt and publication workflow now select tags from substantial
explanations and worked examples, without requiring literal keyword matches.
Language tags may also come from implementations substantially explained in
linked public repositories after relevant source inspection. A repository link,
language statistics or incidental files alone are insufficient. Supporting
passages or source paths belong in the metadata assessment.

## Deferred filtering idea

Shiv proposed successive AND filters over the existing flat vocabulary. Selecting
one tag narrows the articles; available next tags come from that remaining set.
Each additional selection requires every selected tag, and removing a selection
recomputes the results and available choices. This does not require parent-child
relationships between tags. The filtering UI remains deferred.
