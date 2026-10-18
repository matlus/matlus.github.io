# Independent teaching and evidence review: model identity addition

## Coverage, reader and limits

Reviewed on October 17, 2026 using `prompts/review-article-teaching-and-evidence.md`. This was an independent first pass: no earlier review reports, editorial dispositions or handoff conclusions were read. Only this report was written. The article and source repository were not edited. No model calls, tests, publishing, commits or external messages were performed.

The complete candidate `evals-at-the-system-boundary.md` was read, including its examples, code, tables, quotations and final sentence. The preserved baseline was compared with the candidate. The original brief, model-identity brief, blog-writing skill, its clarity, voice-and-flow and spoken-teaching references, and the supplied original Data Access Layer article were read. Both adjacent Expense Analysis articles, Part Three and Part Four, were read completely before assessing continuity and overlap.

Reader: an application developer familiar with ordinary code and tests, learning eval terminology, grader selection, rubrics and harness implementation. The supplied author position is preserved: evals exercise functional acceptance requirements at the system boundary; instruction is not assurance; results must be verified and accompanied by the configuration that produced them.

This is a source-based Markdown review of the authorized addition, with the full article read for teaching continuity. It does not establish current live-model reliability, independently validate historical judge accuracy, or certify all future inputs. Historical dates and grading setup are documented by the pinned README. Archived scorecards do not independently snapshot grader identity or exact historical prompt bytes; the article explicitly distinguishes additional production capture requirements from what these artifacts retain. No rendered preview was supplied.

## Versions and integrity

- Candidate SHA-256: `879e6eb249e61966060b8704661d59ce991ec236b772b1117ccd47465461a8e7`.
- Preserved baseline `revisions/before-model-identity.md` SHA-256: `207d5afa9b3d3ee81950ef3c4a869674f9548726b79eaf225fdbc5b1d788bde9`, matching the follow-up brief.
- Pinned source commit: `29104e777bd33bc707f0662573631d6682c70e9e`.
- Inspected local source HEAD: `55e0cb33aac71440e1cf671db3a8b3d676b58f77`.
- Both source commits resolve to tracked tree `b8b612a7adb34843bab58cd48907d083fb2c6daf`. The source working tree has only the pre-existing untracked talks directory; it was left untouched.
- Source README SHA-256: `8058a80bd1622761d2b59546bfa9ee8fa98e66d314f0ba88f29063619640d384`.
- Source `scorecard_models.py` SHA-256: `b0cba81ac34b83c964698445bc3dfc52f4af2236e3ff850c031623837bd81917`.
- Source `evaluation_models.py` SHA-256: `e171fa09a50c1150caec12d33a39a5ea88c357059d122d842268167cecbabf6b`.
- Source `scorecard_report_rendering_processor.py` SHA-256: `98f1bb462abb9e5069fdee6b3c55f2f6324b94c31d00a9464f620944ae49dfe0`.
- Part Three SHA-256: `4de952e217a2f6dbe1d7054754e030763eac61af9f5076e56a8ba425157dfd95`.
- Part Four SHA-256: `e5ea1900e57432fa70359e03520119bc41e33168f477d47fef4753155399a757`.

The comparison shows the authorized identity introduction, two new sections, a replacement of the adjacent model-comparison paragraph, and one additional sentence near the end. Existing headings remain in order. Existing code, rubric quotations, worked examples and other source facts are preserved. Neither publication nor modification date fields are present. The article stays outside the public content collection. Internal product branding is absent from the teaching prose.

## Headings read in order

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
17. Change the prompt without changing the examination
18. Preserve the interaction so a failure can be examined
19. Diagnose a wrong total using the reference ledger
20. Regrading changes the measurement, not the original answer
21. Verify the program that performs the evaluation
22. Use the evaluation to decide what the application must enforce

Final article-body sentence: That is how "verified, not trusted" becomes an implementation.

The source hierarchy consists of one H1 and ordered H2 sections, without heading-level jumps. The candidate contains no collapsed material or new figures requiring separate source coverage.

## Evidence checked and results reconstructed

The README's Results at a glance, Reading the results run list and historical dates were checked, together with the scorecard/evaluation models, grading settings and defaults, scorecard aggregator and renderer. Also checked the suite's one case, gated variant and 16 thresholds; budget notes and expected facts; the extraction instructions and quoted budget/findings rubrics; the amount and tool-use predicates; rubric judgment composition and the immutable session request. These support the teaching context surrounding the addition as well as the new claims.

Every named archived `scorecard.json` was read and parsed. All 128 check rows across the eight files were inspected for assistant/model/effort, variant, pass/trial counts, recorded pass rate, errors, threshold, gated status and threshold outcome. All use `robust-tables-first`, medium effort, 16 checks and an 80% threshold, and all record zero errored checks.

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

Opus and Sol each require adding corresponding per-check counts from their one-trial and four-trial files. Each check is 1/1 plus 4/4, yielding 5/5. Treating only the latest four-trial folder as the five-trial evidence would be incorrect; the candidate's five-trial profile is supported by the pair and the README's combined profile.

| Provider and model | Reconstructed lowest per-check result | Gate | Evidence for interpretation |
| --- | --- | --- | --- |
| Anthropic `claude-opus-5-5` | 5/5, 100% | Passed | All 16 checks are 5/5 across the pair. |
| OpenAI `gpt-6.1-sol` | 5/5, 100% | Passed | All 16 checks are 5/5 across the pair. |
| OpenAI `gpt-6-astra` | 5/5, 100% | Passed | All 16 checks are 5/5. |
| Anthropic `claude-sonnet-5-5` | 4/5, 80% | Passed | `both-delta-charges-kept` and `travel-august-total` are each 4/5; the other 14 are 5/5. Both failures identify run-03. |
| Anthropic `claude-haiku-5-5` | 2/5, 40% | Failed | `uncategorized-entry-count` is 2/5; travel is 3/5. Three further checks are 4/5 and the remaining checks 5/5. |
| OpenAI `gpt-6-luna` | 0/5, 0% | Failed | July shopping, August travel and supported findings are 0/5. June dining, both Delta charges and largest increase are 2/5; uncategorized count is 4/5; the remaining checks 5/5. |

The article's reported rates and gates exactly match these results. Sonnet's failure reasons identify the same third trial for both checks, supporting the sentence about one incorrect trial. Its travel result was 1,219.22 against accepted 1,655.92 or 1,631.82. The recorded diagnosis proposes the missing 412.60 Delta charge. The addition does not turn two missed checks into two failed trial reports.

`Scorecard` explicitly stores `coding_assistant`, `model_name`, `effort_level` and `repetitions`; `ScorecardRow` explicitly stores passed/trial counts, observed pass rate and minimum. The renderer prints assistant, model and effort before the table and formats the check counts/rates separately from the gate. There is no separate provider field. `CodingAssistant` distinguishes Claude Code and Codex; the archived names and README identify the providers for this dataset. Explicit production provider and judge-identity capture remains a recommendation, not a claimed existing field.

The aggregator counts passes over all selected check outcomes, including errors in the denominator, and requires all gated rows to meet their minimum. The article correctly distinguishes that gate from a joint complete-report success rate. Its six-model table labels the minimum across the 16 observed per-check rates; it does not label it as report reliability.

The README documents Sonnet at low effort through Claude Code for graders, and the implementation's defaults agree. The README documents trial recording on October 8 and 9 and regrading on October 10. The candidate preserves that chronology, explains that regrading reused existing trial answers and makes no empirical claim about changing effort levels.

## Teaching continuity, voice and scope

The introduction attaches results to a configuration before later claims depend on it. The new sections come after the reader has learned pass rates and gates, so the measured table can be interpreted immediately. The first section explains what identity to retain; the second supplies actual counts and demonstrates the consequence. The later model-comparison paragraph now advances to keeping the examination fixed instead of repeating the earlier explanation. The final added sentence turns the reporting principle into a practical instruction.

The force of the owner-supplied position remains clear. The questions concern an adopter's real decisions, and the source example answers them. The article introduces the rubric, shows the actual text, follows it into a request and a validated verdict, and explains the limits of each piece of evidence. The additional table is explained before and after it appears. No invented first-person experience or unmeasured effort comparison was introduced.

Part Three already teaches model/effort dependence and presents the same historical dataset; Part Four supplies expense-level vocabulary and workflow comparisons. Reusing that dataset here supports the standalone implementation explanation promised in the brief. The additional schema/rendering explanation, exact identifiers, provider capture distinction and minimum-rate interpretation make the repetition useful for this article's reader. No conflict with the adjacent articles' named results was found. No revision to protected adjacent material is indicated.

## Substantive findings

None. No confirmed defect, supported editorial concern or unresolved new numerical claim requires correction in the reviewed addition. No preference-only changes are proposed.

## Highest-value actions and pending checks

1. Preserve the current distinction between observed per-check rates, threshold decisions, whole-report success and historical regrading during later editing.
2. Run the workflow's revision-verification step against this candidate and its preserved baseline. This independent review supplies findings; it is not the later verifier's disposition.
3. Before publication, inspect a rendered desktop and phone view, including the new wide tables, headings/anchors and surrounding flow. Rendered inspection remains pending and does not block retaining this standalone Markdown draft.

There are no unresolved arithmetic or configuration-identity conflicts in the authorized addition. A new model campaign or live grader study is unnecessary to substantiate these explicitly historical observations.