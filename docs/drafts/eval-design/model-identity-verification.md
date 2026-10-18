# Independent revision verification: model identity and recorded results

## Verdict and exact scope

**Improved. No regression or unresolved correction remains in this identity-only revision.** The added explanation makes the owner's reporting contract explicit, demonstrates it with independently reconstructed historical results, and preserves the article's existing teaching argument. The coordinator's final chronology clarification resolves a collection-versus-selected-runs ambiguity without changing the data.

The final candidate for this report is the frozen [identity-before-skills.md](revisions/identity-before-skills.md), SHA-256 `b6b98d38e00a1ee168ac87a68b248b820591bb63db9d5cac4e5738ce8e420a93`. This report does not verify the later, separately requested skill-publication addition to the primary article. Its verdict must not be transferred to that later candidate without its own review.

Baseline: complete [before-model-identity.md](revisions/before-model-identity.md), SHA-256 `207d5afa9b3d3ee81950ef3c4a869674f9548726b79eaf225fdbc5b1d788bde9`, matching the supplied brief. The initially reviewed identity candidate had SHA-256 `879e6eb249e61966060b8704661d59ce991ec236b772b1117ccd47465461a8e7`; the final frozen version adds only the supported chronology clarification to that identity revision.

## Coverage and independence

Verified October 17, 2026 under `prompts/verify-article-revision.md`. I read the complete 465-line baseline and complete 507-line identity candidate, including their code, quotations, tables, examples and final sentence, and examined their complete diff before reading `model-identity-review.md` or the editorial disposition. I then checked the changed claims against source evidence before consulting those conclusions. Finally I reread the frozen candidate's full diff and the updated disposition after the chronology correction.

The original brief, follow-up brief, blog-writing skill, its clarity, voice-and-flow and spoken-teaching references, and the supplied original Data Access Layer article informed the voice check. The reader remains an application developer who knows ordinary code and tests and needs to learn eval design. The supplied author position remains intact: evals exercise functional acceptance requirements at the system boundary; instruction is not assurance; verification also applies to graders; and results belong to an identified configuration.

This is a read-only source verification with one written deliverable, this report. No article, baseline, archive, published content, chapter, artwork, source code or unrelated dirty file was edited by this verifier. No tests, model sessions, publishing or commits were performed. Adjacent published articles were not reassessed for overlap in this bounded revision verification.

## Complete change assessment

Line references below identify the frozen final candidate.

| Changed passage | Assessment and evidence |
| --- | --- |
| Line 13, opening configuration paragraph | Improved. It attaches observed rates to provider/family, model, effort, requirements and inputs before later discussion relies on those distinctions. It directly implements the follow-up author intent without changing the definition of an eval. |
| Lines 367-379, reporting questions and four-row information table | Improved. The questions identify actual adoption decisions and the table answers them with concrete record fields and a 4/5 example. Provider, exact model, effort and observed counts/rates remain separate. The strong statement about the usefulness of an eval claim preserves the owner's supplied position. |
| Line 380, configuration dependence and effort labels | Improved. It explains why a result does not transfer to another model or effort and avoids claiming that identically named effort settings imply equivalent compute or behavior. This is a scope rule, not an unmeasured comparison of effort settings. |
| Line 382, `Scorecard`, `ScorecardRow` and Markdown rendering | Accurate and useful. The inspected model definitions contain every named field. The renderer prints assistant/model/effort above counts, observed rates and minimums. It makes the implementation behind the reporting rule visible. |
| Line 384, provider and judge capture | Improved. `Scorecard` has no separate provider field; the archived assistant/model names identify this dataset's providers. Explicit provider capture and separate judge identity are correctly presented as production requirements rather than existing artifact fields. |
| Lines 386-390, recorded-results introduction and minimum-rate definition | Improved. The pinned README and eight scorecards support the shared variant, case, medium effort, five trials and 16 checks. The text explicitly defines the table's rate as the minimum observed per-check rate and keeps the 80% gate separate. |
| Lines 392-399, six-model table | Accurate. Every provider, exact identifier, effort, numerator, denominator, percentage and gate matches the reconstructed profiles below. The Opus and Sol profiles require both archived folders. |
| Line 401, Sonnet/Haiku/Luna interpretation | Accurate. Sonnet's two 4/5 checks both identify run-03, so two missed checks are not turned into two incorrect reports. Haiku's minimum is its 2/5 uncategorized count. Luna's three named checks are each 0/5. |
| Line 403, consequence of naming provider/model/effort/rates | Improved. The table now supplies the evidence for the distinction. Different recorded model outcomes within each provider justify requiring the exact model as well as its provider. No cause or universal ranking is inferred. |
| Line 405, historical chronology and limits | Improved after clarification. It now attributes October 8/9 to the README's original trial collection and October 10 to these regraded results. It explicitly says regrading produced no new answers and that this table measures neither effort changes nor general future reliability. |
| Line 415, replacement model-comparison paragraph | Equivalent in necessary explanation, with a useful extension to comparing effort settings. The removed warning that a prompt result does not transfer to a different model survives explicitly at line 380 and in the opening paragraph. Keeping cases, reference criteria and graders fixed remains explicit. No required explanation was lost when repetition was removed. |
| Line 503, closing reporting sentence | Improved. It gives the reader the reporting step that follows from the worked table, while preserving the existing scenario/reference/grader/execution instructions and final argument. |

The new sections follow the existing explanation of rates and acceptance gates, so readers have the concepts needed to interpret the results. The table is introduced and then explained through individual failures. The added questions are purposeful and answered. No personal experience was invented, no supplied conviction was softened, and no technical claim was added merely to make the prose sound stronger.

## Source identity and inspected facts

Source repository: `D:/Python/Skills and Evals`. Pinned commit `29104e777bd33bc707f0662573631d6682c70e9e` and inspected local HEAD `55e0cb33aac71440e1cf671db3a8b3d676b58f77` both resolve to tree `b8b612a7adb34843bab58cd48907d083fb2c6daf`. The source status contains only the pre-existing untracked `talks/` directory. Thus the inspected tracked files match the article's pinned tree.

| Inspected source file | SHA-256 |
| --- | --- |
| `README.md` | `8058a80bd1622761d2b59546bfa9ee8fa98e66d314f0ba88f29063619640d384` |
| `managers/models/scorecard_models.py` | `b0cba81ac34b83c964698445bc3dfc52f4af2236e3ff850c031623837bd81917` |
| `managers/models/evaluation_models.py` | `e171fa09a50c1150caec12d33a39a5ea88c357059d122d842268167cecbabf6b` |
| `managers/processors/scorecard_report_rendering_processor.py` | `98f1bb462abb9e5069fdee6b3c55f2f6324b94c31d00a9464f620944ae49dfe0` |
| `managers/processors/scorecard_aggregation_processor.py` | `80143a733fbeaf0bc57f8c6243b8e4caea99e39273cac429e15f0028d1635d7b` |

The abbreviated source paths above are under `packages/prompt-evals/src/prompt_evals/`. I also inspected grading models, `GradingSettings`, configuration defaults, the suite's selected case and gated variant, and all selected regrade provenance files.

The scorecard and row models directly establish the named fields and absence of a provider field. `CodingAssistant` distinguishes `claude_code` and `codex`. The aggregator divides passed outcomes by all selected outcomes and requires every gated row to meet its own minimum; it does not calculate whole-report success. The renderer prints assistant, model and effort before the check table. These are inspected implementation facts.

The pinned README's Results at a glance documents medium trial effort and Claude Code/Sonnet/low-effort grading. Configuration defaults agree: `claude_code`, `sonnet`, `low`. Defaults alone would not prove the configuration of historical graders, because settings can be overridden. The historical grading configuration is therefore a documented README claim consistent with the implementation, not a separately attested identity recovered from scorecard fields. The recorded trial model identifiers likewise establish what the archive records, not an independent provider attestation of a resolved backend model.

## Raw scorecard reconstruction

All eight JSON scorecards were parsed. Every one of their 128 rows was checked for variant, counts, recorded rate, error count, threshold, gated status and threshold outcome. All use `robust-tables-first`; all thresholds are 0.8; every row is gated; all error counts are zero. Each scorecard's row denominator matches its repetition count and its observed rate equals passed count divided by trial count.

All folder paths below are under `results/pwi/expense_analysis/`.

| Archived run folder | Repetitions | Scorecard JSON SHA-256 |
| --- | --- | --- |
| `20261010T105946Z-regrade-claude_code-claude-opus-5-5-medium-c0bed1` | 1 | `4a9aac6654eb32f160787bbe60217cd28053eba0701d8cffaa952578ac4ca63b` |
| `20261010T110008Z-regrade-claude_code-claude-opus-5-5-medium-0b6fd3` | 4 | `acc08a1575e374683b4a303553beef0423055a8ce6744841d3851d94d31ca175` |
| `20261010T105946Z-regrade-codex-gpt-6.1-sol-medium-83daba` | 1 | `7c0fb5efef81b0c13a172355b161350fddcc8eda4778f68014d255c4d70993c2` |
| `20261010T110007Z-regrade-codex-gpt-6.1-sol-medium-86e1d4` | 4 | `62eb9c5e2e00590194a6d9750914ba9931a3a95b159dc57804e550622c834db8` |
| `20261010T110051Z-regrade-codex-gpt-6-astra-medium-d55b00` | 5 | `d9a01cc5b5f8abbbe522915df657a7ef210c6e764b77e6657df6fa13c63acd09` |
| `20261010T110057Z-regrade-claude_code-claude-sonnet-5-5-medium-1892c7` | 5 | `962d41466acf79bd4b96dd693a08a75caf8281a4c39fa11c9c2ec838c24aa494` |
| `20261010T110145Z-regrade-claude_code-claude-haiku-5-5-medium-cd428f` | 5 | `025dd3eb1a9ce466a79adecf97ef45937ff1c06a68f94918fcc6a02271828201` |
| `20261010T110135Z-regrade-codex-gpt-6-luna-medium-43f5c3` | 5 | `b932e323ad9624eae08001665a942a8c279814846291341f791ff4fd3ebb0e12` |

For Opus and Sol, corresponding per-check numerators and denominators are summed: `(1 + 4)/(1 + 4) = 5/5`. Each of their 16 checks is 1/1 in the first file and 4/4 in the second. Reading only the four-trial folder would not support a five-trial claim. Other models have one five-trial scorecard each. No unrelated earlier Opus runs or other prompt variants were pooled into the table.

| Provider | Recorded model | Effort | Reconstructed minimum across 16 checks | Gate |
| --- | --- | --- | --- | --- |
| Anthropic | `claude-opus-5-5` | medium | 5/5 = 100% | Passed |
| OpenAI | `gpt-6.1-sol` | medium | 5/5 = 100% | Passed |
| OpenAI | `gpt-6-astra` | medium | 5/5 = 100% | Passed |
| Anthropic | `claude-sonnet-5-5` | medium | 4/5 = 80% | Passed |
| Anthropic | `claude-haiku-5-5` | medium | 2/5 = 40% | Failed |
| OpenAI | `gpt-6-luna` | medium | 0/5 = 0% | Failed |

Complete reconstructed per-check counts are below. Opus and Sol columns include both constituent files.

| Check | Opus | Sol | Astra | Sonnet | Haiku | Luna |
| --- | --- | --- | --- | --- | --- | --- |
| `dining-june-total` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 2/5 |
| `dining-july-total` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `dining-august-total` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `dining-august-over-budget` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `refund-netted` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `shopping-july-total` | 5/5 | 5/5 | 5/5 | 5/5 | 4/5 | 0/5 |
| `duplicate-flagged` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `both-delta-charges-kept` | 5/5 | 5/5 | 5/5 | 4/5 | 5/5 | 2/5 |
| `travel-august-total` | 5/5 | 5/5 | 5/5 | 4/5 | 3/5 | 0/5 |
| `uncategorized-entry-count` | 5/5 | 5/5 | 5/5 | 5/5 | 2/5 | 4/5 |
| `largest-increase-is-travel` | 5/5 | 5/5 | 5/5 | 5/5 | 4/5 | 2/5 |
| `code-executed` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `ambiguous-entries-not-forced` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `tables-before-interpretation` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |
| `three-supported-findings` | 5/5 | 5/5 | 5/5 | 5/5 | 4/5 | 0/5 |
| `no-invented-budgets` | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 | 5/5 |

Sonnet's two failing rows both name `june-august-2026/run-03`. Its travel row records 1219.22 against accepted 1655.92 or 1631.82, with a diagnosis proposing the omitted 412.60 Delta entry. That supports the article's one-incorrect-trial explanation without turning a proposed diagnosis into independently observed execution behavior.

## Historical provenance and final clarification

README lines 209-212 describe the whole collection as original recordings from October 8 and 9, regraded October 10 without new trial answers. Its run list identifies the exact one-plus-four splits used above. All eight selected `regraded_from.txt` files point to original run folders whose names begin `20261009`; each also records that its old folder was removed after regrading and that the regraded folder retains answers and event streams.

The initially reviewed wording could attach the collection's two-date span too directly to the selected six-model table. The coordinator accepted the supported clarification to: “The README dates the original trial collection to October 8 and 9, 2026; these results were regraded on October 10 against the revised reference key.” The frozen final candidate contains that wording. The attribution and scope are now precise. No new model execution, changed reference result, changed rate or changed article date field is implied.

The archive supports historical observations under the revised reference. It does not independently snapshot every original composed prompt byte or grader configuration, establish live judge accuracy, compare effort levels, or establish future model reliability. The article's existing production-capture discussion and the new limitations preserve those distinctions.

## Review disposition

Only after the independent comparison and evidence checks did I read `model-identity-review.md` and the follow-up section of `editorial.md`. The teaching review's candidate hash is the initially reviewed `879e6eb...` version. It had no substantive findings requiring revision, and the editorial record correctly reports that outcome. There are no accepted first-review findings left unresolved, no rejected harmful suggestions to adjudicate, and no need to invent a correction merely because this is a verification step.

The updated editorial disposition separately records the chronology clarification identified during verification, its collection-versus-selected-runs reason, the October 9 source pointers and unchanged October 10 regrading/counts. That disposition agrees with the final frozen candidate. Relative to the first reviewed identity text, the final text is equivalent in model identities and numerical results and improved in chronology precision. Relative to the preserved pre-identity baseline, the overall verdict is improved.

## Protected material, dates and pending presentation checks

The complete baseline-to-candidate diff contains four localized hunks: the opening addition, the two new sections, the model-comparison paragraph replacement and the closing sentence addition. All existing headings remain verbatim and in order. The title and final sentence remain exactly:

- Title: `Verified, Not Trusted: Designing Evals for AI Applications`.
- Final sentence: `That is how "verified, not trusted" becomes an implementation.`

All 13 existing fenced blocks are identical between baseline and identity candidate, as are all eight blockquote lines. Existing prompt names, JSON/Python examples, recorded outputs, rubric quotations, reference tables, monetary arithmetic, source links and established headings/anchors are unchanged. The two new headings are within the expressly authorized results explanation. Internal product branding is absent from the added teaching prose.

| Date field | Baseline | Frozen final candidate | Result |
| --- | --- | --- | --- |
| `datePublished` | Absent; no value | Absent; no value | Preserved |
| `dateModified` | Absent; no value | Absent; no value | Preserved |

Both files begin with the article H1 and contain no publication frontmatter. Date-field occurrence counts are zero in both. The historical dates in the result discussion describe evidence provenance and do not add publication metadata.

This remains a standalone Markdown draft outside the public content collection. No rendered page was supplied. Desktop/phone table layout, rendered headings and anchors, rendered date presentation and homepage ordering remain pending; no claim of visual or live-site verification is made. Inspect the final rendered article after its last prose or layout change before publication. An empty audit is not the basis of this verdict: the complete comparison, source definitions, raw counts, provenance and preserved material are.
