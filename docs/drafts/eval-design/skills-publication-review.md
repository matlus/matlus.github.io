# Published-skills addition: independent teaching and evidence review

## Coverage, reader and limitations

Reviewed October 17, 2026. Read the complete 529-line candidate and complete
507-line baseline, including every code block, table, quotation and final paragraph.
The current candidate includes the author's final clarification at line 417:
"The assistant still has to invoke the skill, follow its instructions, use any
required resources and perform the work."

The reader is the application developer specified in `brief.md`: familiar with
ordinary application code and tests, unfamiliar with eval vocabulary, grader
selection, rubrics and harness design. No additional prerequisites were assumed.

Read `skills-publication-brief.md`, `brief.md`, `model-identity-brief.md`, the
blog-writing skill and its clarity, voice/flow and spoken-teaching references,
and the complete original Data Access Layer teaching sample. Applied
`prompts/review-article-teaching-and-evidence.md` and the baseline-comparison
requirements in `prompts/verify-article-revision.md`. No prior reviewer reports,
editorial dispositions or handoff conclusions were consulted.

Read the complete current sources of **Verified, Not Trusted: Expense Analysis,
Part Three** and **Verified, Not Trusted: Expense Analysis, Part Four**, including
their tables, code, figure descriptions and conclusions, before judging overlap.
These are the local dirty versions supplied for this review; this is not a claim
about the currently deployed website.

Source verification was read-only against local repository objects at
`29104e777bd33bc707f0662573631d6682c70e9e`. The local HEAD is
`55e0cb33aac71440e1cf671db3a8b3d676b58f77`; both tracked trees resolve to
`b8b612a7adb34843bab58cd48907d083fb2c6daf`, and the tracked diff against the pin
is empty. The pre-existing untracked `talks/` was untouched. Inspected the README,
suite, session request model, trial execution engine, both session gateways,
scorecard models, all eight scorecards underlying the six-model table, and the
two relevant Sonnet trial grades. This focused evidence check verifies the reused
results and prompt-versus-package scope; it does not constitute a new evaluation
of the models or a fresh implementation audit of every existing harness claim.

The owner's observation about absent or rudimentary skill evals is the source for
that first-person account. No market census was conducted or implied. Installed
skill behavior has not been measured by this review. No tests, model sessions,
builds, publication actions or source/article edits were performed. Rendered
desktop and phone inspection remains pending.

## Version fingerprints

All values are SHA-256 of the actual local file bytes read.

| Source | SHA-256 |
| --- | --- |
| Candidate `evals-at-the-system-boundary.md` | `85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc` |
| Baseline `revisions/identity-before-skills.md` | `b6b98d38e00a1ee168ac87a68b248b820591bb63db9d5cac4e5738ce8e420a93` |
| `skills-publication-brief.md` | `3558ff0e904c51b884a39ee32e7f40fad05d6b2d4be70f541b5a269b046bb55f` |
| `brief.md` | `02c005da34072d9a824cdfa0fdb4ee8e85da56c16ef13d5d014bae1cbb7fb916` |
| `model-identity-brief.md` | `e89a8458e0bcb331f651f5a24a33531181d189ae710eff8f6e2a4df088518933` |
| Part Three local source | `4de952e217a2f6dbe1d7054754e030763eac61af9f5076e56a8ba425157dfd95` |
| Part Four local source | `e5ea1900e57432fa70359e03520119bc41e33168f477d47fef4753155399a757` |
| Original Data Access Layer sample | `ba6d94aa137005d146003403e66e8d83725e8e222207fee6f083f3df64c17c14` |

## Complete article headings read, in order

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

The baseline contains the same ordered headings except item 17, which is new.
Both bodies end with the identical sentence:

> That is how "verified, not trusted" becomes an implementation.

## Findings and verdict

**Zero substantive findings. Verdict: improved.** The authorized additions give
the published-skill adopter a concrete reason to demand the same evidence taught
throughout the article. No correction is required by this review.

### Author intent and the subscription problem

The introductory reminder at line 15 establishes the extended audience without
interrupting the initial expense example. Lines 411–417 then develop the owner's
actual concern: the skills he sees lack adequate behavioral evidence or omit the
configuration behind the claim. "I see" keeps this as his supplied observation;
it does not turn it into a measured claim about all skill repositories. The
question at line 413 earns its place because the following paragraphs answer how
an adopter can decide what the evidence means.

Line 415 preserves the specific situation in the brief: an Anthropic result does
not establish behavior for an adopter with only an OpenAI subscription. It also
explicitly covers the reverse direction, different models under one provider and
different effort settings for one model. It does not imply that changing provider
necessarily makes the skill fail. The responsibility is to evaluate the intended
configuration. This follows the preceding explanation at lines 369–407, including
the distinction between provider effort labels and equivalent compute.

The author's firm position survives at lines 417 and 427. Installation and a
promising description do not establish capability; publishing creates a duty to
show what users can rely on. No artificial balance or unsupported personal
experience was added.

### What the author should disclose

Line 419 supplies actionable disclosure: provider, exact model, effort, per-check
rates, counts, thresholds, skill revision, cases, grading criteria and linked
evidence. It asks authors to keep results separate by supported configuration and
identify unevaluated configurations. The reader can distinguish an observation
from an acceptance threshold, rather than receiving a bare "passed" label.

This paragraph is a recommendation for published skills. It does not say the
current harness automatically captures every proposed field. The earlier scorecard
discussion explicitly distinguishes existing fields from recommended explicit
provider/judge capture, and the later artifact section distinguishes emitted
artifacts from a complete production audit record.

### Structural checks, invocation and successful work

Line 423 separates three questions clearly: is the package structurally valid,
was the skill invoked, and did the complete outcome meet its requirements? The
reader is told that invocation alone can accompany incorrect work. The proposed
installation/request exercise extends the existing boundary lesson at lines
44–62. It is presented as evaluation design, with no invented claim of a successful
installed-skill test.

Line 425 states the implementation's actual scope: direct prompt variants.
`eval_suite.json` defines three prompt files, one expense case and sixteen checks;
`EngineTrialExecution._compose_llm_session_request` uses that prompt text plus the
attachment note and input files. `LlmSessionRequest` contains no skill package,
installation or invocation contract. The Claude gateway supplies
`--disable-slash-commands` as part of its isolation arguments; the Codex gateway
sends the composed prompt on stdin to a fresh session. These are concrete support
for refusing to treat the existing prompt results as packaged-skill evidence.

### Reused Sonnet result and the complete table

The example at line 421 deliberately says "Sonnet prompt result." In the pinned
Sonnet scorecard from run folder
`20261010T110057Z-regrade-claude_code-claude-sonnet-5-5-medium-1892c7`, the recorded
model is `claude-sonnet-5-5`, effort is `medium`, repetitions are five and
`passes_gate` is true. The `robust-tables-first` rows show:

| Check group | Passes / trials | Minimum |
| --- | --- | --- |
| August travel | 4/5 | 80% |
| Both Delta charges retained | 4/5 | 80% |
| Each of the other fourteen checks | 5/5 | 80% |

The corresponding run-03 grade reports $1,219.22 and marks both travel and Delta
retention failed. Thus one defective report can coexist with the declared gate
passing. This supports the new example and the surrounding warning about
per-check rates versus complete-report success.

Also inspected the seven other scorecards identified in the identity brief.
The Opus and Sol profiles each combine their one-trial and four-trial folders;
all sixteen checks pass in both pieces. Astra passes all sixteen checks in its
five trials. Haiku's lowest row is uncategorized count at 2/5; Luna has July
shopping, August travel and supported findings at 0/5. These reproduce the table's
100%, 100%, 100%, 80%, 40% and 0% minima and its four passing/two failing gates.
The README dates the original trial collection to October 8–9 and regrading to
October 10. The article retains that chronology and does not present regrading
as new answers or these prompt results as skill-package results.

The separate diagnostic example later in the article points to the standard
Sonnet run-05 in `20261010T112458Z-...-e976c6`. Its grade records $1,563.82 versus
$1,631.82 and the $68 Airport Parking candidate. This is a different prompt/run
from the 4/5 final-prompt example, with its own link and scope. There is no
numerical or referential conflict introduced by the addition.

### Whole-article continuity and preservation

The full article still develops one expense example from obligations and
independent references through extraction, code checks, judge rubrics, errors,
isolated trials, gates, retained evidence and enforcement in the application.
The new section belongs after the concrete configuration table: the reader first
learns what a result means and then sees why a skill consumer needs it. The return
to direct prompt comparisons immediately afterward remains intelligible because
line 425 explicitly restores the worked implementation's scope.

Part Three already argues for skill evals, provider/effort identity, caveat labels
and comparison of skill instructions. Part Four teaches eval vocabulary,
reference checks and structured workflow outputs. The new draft intentionally
reuses the same lesson and data but has a distinct contribution: explaining the
acceptance contract and implementation decisions in the reusable Python harness.
The added section applies that developed design to publication responsibility;
it does not require a reader to have opened either adjacent article. This is a
useful return, not a supported reason to delete or compress the author's point.

The complete baseline comparison contains only the introduction reminder and new
published-skills section. The title, existing headings, code, rubric quotations,
results table, links and final sentence are preserved. Neither baseline nor
candidate contains `datePublished` or `dateModified`; both absences remain intact.
No new article links need title correction. Source heading hierarchy is one H1
followed by H2 sections, with no numbering regression.

## Required next checks

No prose changes are requested. Preserve the first-person observation, explicit
subscription example and prompt-versus-installed-skill distinction in any later
revision.

After the last prose/layout change and before publication, inspect the rendered
desktop and phone article: contents entries, generated anchors, tables and code
overflow, quotations, any figures or collapsed material introduced during layout,
and the new section's placement. Confirm rendered date absence and homepage
ordering as applicable to the eventual publication workflow. No rendered page
was supplied, so these presentation checks remain pending; this review grants
no publication approval.
