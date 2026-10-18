# Published-skills revision verification

## Verdict and scope

**Improved. No substantive regression or unresolved prose correction found.** The
authorized reminder and dedicated section make the published-skill author's
responsibility concrete: disclose the evaluated configuration and observed
outcomes, and evaluate actual skill use separately from package validity and
invocation. The improvement is explanatory and evidential, rather than merely
shorter or smoother prose. Rendered inspection remains pending.

This is a fresh independent verification under
`prompts/verify-article-revision.md`. I read the complete baseline and candidate,
compared their complete texts and formed the first-pass judgment before reading
`skills-publication-review.md` or the corresponding editorial disposition. I then
checked that review and disposition against the actual candidate. The complete
original brief, skills-publication brief, identity brief, blog-writing skill and
its clarity, voice/flow and spoken-teaching references informed the verification.
The original Data Access Layer teaching sample and the complete local sources of
**Verified, Not Trusted: Expense Analysis, Part Three** and **Verified, Not
Trusted: Expense Analysis, Part Four** were also read.

The reader remains an application developer familiar with ordinary code and
tests, but new to eval terminology, graders, rubrics and harness design. The
author's supplied observation about missing or rudimentary skill evals is evidence
of his position, not an independently measured census of repositories. The
subscription mismatch is a hypothetical adopter example. This verification
measures neither the prevalence of inadequate evals nor installed-skill behavior.

No article or source edits, tests, model sessions, builds, commits, publication
actions or external messages were performed. Only this verification record was
written. Unrelated dirty files and existing source material were preserved.

## Exact compared versions

SHA-256 values below describe actual local file bytes:

| Role | File | SHA-256 |
| --- | --- | --- |
| Complete baseline immediately before the skills request | `revisions/identity-before-skills.md` | `b6b98d38e00a1ee168ac87a68b248b820591bb63db9d5cac4e5738ce8e420a93` |
| Complete candidate verified here | `evals-at-the-system-boundary.md` | `85b04e0a96d611eeab91bfa75841b6b06d0a744d472ff9d83bbd6f9c319188dc` |

The complete diff has two insertion regions: the introductory paragraph at
candidate line 15 and the section at lines 409–427. Removing precisely those two
additions reproduces the complete baseline text exactly. There are no deleted,
rewritten or moved baseline passages. Both versions contain the same 13 fenced
blocks, all unchanged.

The identity/results verification belongs to its separate frozen candidate,
`revisions/identity-before-skills.md`, whose hash is the baseline above. It does
not cover the later published-skills section. This document supplies that later
revision verification; it does not relabel the identity review as its evidence.

## Every actual change

Line references below are to the verified candidate. Every added paragraph is
covered, including its implication for the existing argument.

| Changed passage | Judgment and reason |
| --- | --- |
| Line 15, “The same discipline applies when you publish a skill…” | Improved. Identifies the newly authorized audience near the beginning and connects it to the immediately preceding configuration requirement. The expense example and promised implementation lesson remain intact. |
| Line 409, “Published skills owe their users the same evidence” | Improved. Names the author's responsibility plainly. Its position immediately after the results table lets the reader apply an understood measurement rather than encounter an unsupported demand first. |
| Line 411, “Everything we have established applies…” | Improved. Carries the evaluation discipline from a prompt in an application to a skill guiding an assistant. The following scope paragraph explicitly prevents interpreting this as a claim that the repository tested skill packages. |
| Line 413, “I see skill collections published without evals…” | Improved. Preserves the supplied forceful critique and first-person observation without inventing a count, survey or named accusation. The question about deciding whether a skill works leads directly to configuration mismatch and disclosure, so it has a teaching purpose. |
| Line 415, Anthropic evaluation and an OpenAI-only subscription | Improved. Preserves the exact author-supplied adopter difficulty. It also covers the reverse direction, different models within one provider and different effort settings. It says the adopter needs an evaluation, not that the different configuration must fail. |
| Line 417, instructions, scripts, references and installation | Improved. Explains the work still required after installation: invocation, following instructions, using resources and performing the task. The return to “Instruction is not assurance” deepens the opening principle. It does not promise that invoking a skill establishes correct work. |
| Line 419, disclosure and unevaluated configurations | Improved. Converts the critique into actionable publication information: provider, exact model, effort, per-check rates, counts, thresholds, revision, cases, grading criteria and evidence. Separate results and explicit unevaluated status prevent a bare “has evals” claim from silently covering every configuration. This is a recommendation, not an assertion that the harness captures all these fields. |
| Line 421, “the Sonnet prompt result above” | Improved. Demonstrates the requested specificity with a verified historical result: `claude-sonnet-5-5`, medium effort, five trials and August travel 4/5 against an 80% threshold. “Prompt result” preserves the evidence boundary. The surrounding profile is still present and shows that the single check is not the whole evaluation. |
| Line 423, installed request/invocation and complete outcome | Improved. Extends the boundary lesson to the package its users exercise, including loaded scripts and references. Explicitly separates structural validity, invocation and requirements being satisfied. The sentence that an invoked skill can still do incorrect work answers the author's clarification directly. |
| Line 425, “This repository evaluates prompt variants directly” | Improved. States the actual implementation scope and identifies installation/invocation as additional obligations. It prevents the historical table from being misrepresented as packaged-skill evidence and makes the return to prompt comparisons at line 429 intelligible. |
| Line 427, publication responsibility | Improved. Preserves the author's firm position and ties promised capability back to the component evaluation already taught. It adds no new empirical claim or invented personal experience. |

The section's repeated principles serve distinct decisions: why adopters need
evidence, which configuration that evidence covers, what to disclose, and which
boundary to exercise. Deleting those distinctions for brevity would lose part of
the authorized explanation. No necessary explanation was removed elsewhere.

## Source and arithmetic checks

Read-only source checks used `D:/Python/Skills and Evals`. Its current HEAD is
`55e0cb33aac71440e1cf671db3a8b3d676b58f77`; its tracked diff against the article's
pin `29104e777bd33bc707f0662573631d6682c70e9e` is empty. Both tree objects are
`b8b612a7adb34843bab58cd48907d083fb2c6daf`. This establishes the pinned tracked
content inspected here without treating the merge commit as a new experiment.

The suite defines three prompt files, one named case and sixteen checks.
`EngineTrialExecution._compose_llm_session_request` composes the selected prompt
text with an attachment note and supplies the case's input files.
`LlmSessionRequest` has prompt, files, model, effort, tools and schema fields, with
no package installation or skill-invocation contract. Both CLI gateways pass that
prompt into a fresh temporary session; the Claude gateway also includes
`--disable-slash-commands` among its isolation arguments. The new text accurately
describes direct prompt evaluation and proposes the additional package boundary.
It does not claim that repository support for installed skills already exists.

I independently read the eight scorecard JSON files named in the identity brief
and reproduced the existing results profile. Opus and Sol each require combining
their one-trial and four-trial folders; the others have five-trial folders.

| Configuration, all medium effort | Lowest per-check result across sixteen checks | Gate |
| --- | --- | --- |
| Anthropic `claude-opus-5-5` | 5/5 | Passed |
| OpenAI `gpt-6.1-sol` | 5/5 | Passed |
| OpenAI `gpt-6-astra` | 5/5 | Passed |
| Anthropic `claude-sonnet-5-5` | 4/5 | Passed |
| Anthropic `claude-haiku-5-5` | 2/5 | Failed |
| OpenAI `gpt-6-luna` | 0/5 | Failed |

In `20261010T110057Z-regrade-claude_code-claude-sonnet-5-5-medium-1892c7`,
August travel and retaining both Delta charges each pass 4/5 at a minimum of 0.8;
the other fourteen checks pass 5/5. Four divided by five is 80%, so both checks
meet the declared threshold. Its `robust-tables-first` run-03 grade records travel
as $1,219.22 and fails both checks. The $1,631.82 accepted policy minus the
$412.60 charge equals $1,219.22. A passing gate therefore does not assert that
all five complete reports were correct. The candidate's earlier joint-outcome
qualification remains unchanged.

The later diagnostic example is a different Sonnet run under `standard`:
`20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6`, run-05.
Its grade records $1,563.82 against $1,631.82, a difference of negative $68.00,
with line 169 Airport Parking as the candidate omission. The article retains
that candidate-cause qualification. This example is not the 4/5 final-prompt
profile and was not merged with it.

The inspected README identifies medium-effort trials, Sonnet/low-effort grading,
original collection on October 8–9, 2026 and regrading on October 10 without new
trial answers. The historical paragraph remains unchanged and the new section
does not convert it into current model reliability, cross-provider equivalence,
an effort comparison or a packaged-skill evaluation. These checks verify reused
recorded evidence and the changed prose's source scope; they are not a new live
evaluation or a complete fresh audit of every unchanged implementation claim.

## Complete article coverage and protected material

Every section below was read in both versions, including its examples, tables,
code and qualifications. Candidate line numbers identify the existing heading or
opening. The new section is separately covered paragraph by paragraph above.

| Candidate section | Whole-article check |
| --- | --- |
| Line 1, title and introduction | Same title, expense situation, author principle, vocabulary and teaching promise. Only the authorized reminder is added. |
| Line 23, Start with the outcome the user requires | Same inputs, targets, 198-entry context and distinct obligations. |
| Line 44, An eval exercises the system at its boundary | Same application/prompt distinction, Arrange/Act/Assert table and deterministic-test versus live-eval explanation. |
| Line 64, The reference answer belongs outside the trial | Same accepted policy alternatives, expected facts and file layout; reference isolation explanation preserved. |
| Line 113, Choose a grader by the evidence it examines | Same four named grader types and model extraction qualification. |
| Line 130, Extract what the answer says, then compare it in code | Same extraction prompt, schema example, Decimal comparison and extractor limitation. |
| Line 175, Verify an action using its execution record | Same check data and precise limitation of a successful command matching the pattern. |
| Line 198, What exactly is a rubric? | Same complete quoted budget rubric, constructed responses and interpretation explanation. |
| Line 234, Follow the rubric into the judge | Same suite binding, request composition, instructions, illustrative response and schema/semantic distinction. |
| Line 284, Ground a rubric in facts without prescribing one answer | Same findings criteria, policy alternatives and source-coverage limitation. |
| Line 304, Test the judge before relying on its verdict | Same independently reviewed-label recommendation and distinction from scripted tests. |
| Line 316, Keep a grading error visible | Same retries, error distinctions, denominator and 3/5 = 60% example. |
| Line 328, Make each repetition a fresh experiment | Same immutable request excerpt, fresh-session arrangement, timing and security qualification. |
| Line 353, Keep each requirement visible in the acceptance decision | Same thresholds, per-check pooling and joint-report caveats; no reliability inflation. |
| Line 369, Identify the model and effort whenever you report a result | Same identity/disclosure table and implemented versus recommended capture distinction. |
| Line 388, Read the recorded results with that identity attached | Same six-model table, per-check explanations, judge configuration and historical chronology. |
| Line 429, Change the prompt without changing the examination | Same variants and controlled-comparison qualification; the added scope paragraph leads back to it coherently. |
| Line 439, Preserve the interaction so a failure can be examined | Same artifacts, host separation and proposed production/immutable-record requirements. |
| Line 465, Diagnose a wrong total using the reference ledger | Same separate standard-prompt failure, arithmetic, ledger explanation and candidate-cause limit. |
| Line 486, Regrading changes the measurement, not the original answer | Same reference-correction lesson and old-answer/new-measurement distinction. |
| Line 496, Verify the program that performs the evaluation | Same acceptance-test boundary, live gate outline and division of responsibilities. |
| Line 517, Use the evaluation to decide what the application must enforce | Same live validation obligations, practical starting advice, purposeful questions and closing sentence. |

The complete comparison preserves all baseline code, JSON, tested-prompt excerpts,
rubric quotations, tables, source links, identifiers, amounts, counts, thresholds,
source line numbers and existing headings. There are no changed established
anchors or article-link labels, and no new article links requiring title
correction. Heading hierarchy remains one H1 followed by H2 sections. No internal
product branding was introduced in the additions.

Part Three already gives the forceful case for evaluating skills and disclosing
their caveats. Part Four teaches terminology through entries and compares
structured workflow checks. The new draft remains standalone and adds the
implementation design: connecting obligations, rubrics, requests, validated
judgments, code checks and retained outcomes in a reusable evaluator. The skills
section applies that developed explanation to publication responsibility. Reading
the complete related articles supports continuity; overlap is not itself a
defect or a reason to erase the authorized lesson.

## Review disposition and dates

After the independent comparison, I read the complete skills teaching review and
the matching “Applying the same rigor to published skills” editorial section.
The review reports zero substantive findings; editorial disposition is to retain
the candidate unchanged for independent verification. The candidate hash in both
records matches this verification exactly. There are no accepted correction
requests left unresolved and no rejected harmful suggestions to validate. It
would be inaccurate to invent an edit merely to demonstrate revision activity.
Retaining this candidate is supported by the independent checks above.

| Date field | Baseline | Candidate | Judgment |
| --- | --- | --- | --- |
| `datePublished` | Absent | Absent | Preserved |
| `dateModified` | Absent | Absent | Preserved |

No rendered page was supplied or inspected. Rendered date absence, desktop and
phone layout, the generated contents/anchors, tables, code overflow and the new
section's placement remain pending after the final prose/layout change. Homepage
ordering must also be confirmed in the eventual publication context; unchanged
Markdown field absence alone is not evidence of rendered ordering. This is a
verified Markdown improvement, not publication approval.
