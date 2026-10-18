# Model identity and recorded results follow-up

The owner requests that the existing draft explicitly teach that every eval result
must identify the model family/provider (Anthropic or OpenAI), the specific model,
the effort level used and the observed pass rates. Without this information,
"we have evals" gives an adopter no useful basis for relying on the result.
The owner also asks to use recorded data from the source repository's README.

Article: `evals-at-the-system-boundary.md` in this directory. Compare it with the
complete preserved baseline `revisions/before-model-identity.md`, SHA-256
`207d5afa9b3d3ee81950ef3c4a869674f9548726b79eaf225fdbc5b1d788bde9`.
Both date fields are absent and must stay absent. Existing headings, examples,
code, rubric quotations and source facts are protected except the explicitly
authorized clarification and results addition. No publication is requested.

Reader, overall author position, source revision and protected material are in
`brief.md`. Apply the blog-writing skill specified there. The article remains a
standalone teaching draft outside the public content collection. Do not read
earlier review reports, editorial dispositions or handoff conclusions before your
independent first pass. Coordinator has read current project instructions and
supplies their applicable constraints: preserve originals, chapters, all dates
and field absence, published articles, artwork and unrelated dirty files. Use
standalone plain teaching prose, exact titles for article links and no internal
product branding. No source-code changes, tests, model runs, commits or publishing.

Source: `D:/Python/Skills and Evals`, tracked tree as pinned by the article at
`29104e777bd33bc707f0662573631d6682c70e9e`. Relevant evidence:

- `README.md`, Results at a glance and the list/dates of recorded/regraded runs.
- `packages/prompt-evals/src/prompt_evals/managers/models/scorecard_models.py`,
  `evaluation_models.py`, grading settings, and the scorecard report renderer.
- `results/pwi/expense_analysis/` scorecard JSON files in these run folders:
  - `20261010T105946Z-regrade-claude_code-claude-opus-5-5-medium-c0bed1`
  - `20261010T110008Z-regrade-claude_code-claude-opus-5-5-medium-0b6fd3`
  - `20261010T105946Z-regrade-codex-gpt-6.1-sol-medium-83daba`
  - `20261010T110007Z-regrade-codex-gpt-6.1-sol-medium-86e1d4`
  - `20261010T110051Z-regrade-codex-gpt-6-astra-medium-d55b00`
  - `20261010T110057Z-regrade-claude_code-claude-sonnet-5-5-medium-1892c7`
  - `20261010T110145Z-regrade-claude_code-claude-haiku-5-5-medium-cd428f`
  - `20261010T110135Z-regrade-codex-gpt-6-luna-medium-43f5c3`

Opus and Sol each have a one-trial folder and a four-trial folder in this dataset;
read both to reconstruct the five-trial profile. Other listed configurations have
one five-trial folder. Verify the article's reported counts/rates from these raw
scorecards. Keep observed per-check pass rates, gate thresholds, whole-report
success, historical regrading and proposed additional capture fields distinct.

Use `prompts/review-article-teaching-and-evidence.md` in the website root for the
fresh review, and `prompts/verify-article-revision.md` for later verification.
Rendered inspection may remain pending for this Markdown draft.
