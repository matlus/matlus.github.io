# Verified, Not Trusted: Designing Evals for AI Applications

You have an application that uses a large language model. You give it an expense log and a separate file containing the user's budget notes. It produces tables, comparisons and three findings about the user's spending. The answer reads well. It even says it checked its calculations.

What would you need to see before letting that answer affect a customer's records?

The instruction to check the calculations tells us what we asked the system to do. We still need evidence that it did it. **Instruction is not assurance.** That applies to arithmetic, to the documents the answer draws from, to the categories it assigns and to the conclusions it presents.

An eval gives us a way to obtain that evidence repeatedly. We arrange a scenario with known requirements, exercise the system through its boundary, and verify the result. Because a model can produce different answers to the same request, we repeat the scenario and measure how often each requirement is met.

The arranged scenario is a case. One execution of it is a trial. A grader examines evidence from a trial to decide whether a particular requirement was met.

That is the starting point. The interesting work is deciding what to verify, what evidence can establish it, and how to build an evaluator whose decisions we can examine.

This article develops that design using an expense-analysis eval implemented in Python. We will follow one requirement from the user's input through a written grading rubric, a separate model judge, a validated result and the final acceptance decision. Along the way, we will use code to verify amounts and tool activity, examine failures and distinguish what the evaluation measures from what it leaves unmeasured.

The implementation is in [Skills and Evals](https://github.com/matlus/Skills-and-Evals/tree/29104e777bd33bc707f0662573631d6682c70e9e). The examples below refer to that revision. You can understand the design without opening the repository.

## Start with the outcome the user requires

Our input is a synthetic teaching log styled as 198 hand-kept expenses covering June through August, plus a short file of budget notes. Dates and formatting vary. There is a refund, a repeated transaction, two different airline charges on the same day, and transfers whose purpose is unknown.

The budget notes give us two targets:

| Spending | Target supplied by the user |
| --- | --- |
| Eating out and coffee | Under $260 per month |
| Shopping | Roughly $1,200 per month |

The user also worries that shopping might quietly reach $2,000. The notes explicitly say the other categories have no numeric budget.

The requested result includes monthly totals by category, comparisons against those targets, data-cleaning notes and exactly three important findings. The prompt requires the system to compute its totals using code and to present the tables before interpreting them.

These requirements lead to several different questions. Is August dining $398.69? Does the refund reduce spending? Did the assistant actually execute Python? Did it invent a travel budget? Do its findings agree with both its tables and the source facts?

One assertion cannot answer all of them. A correct amount does not establish that the findings are grounded. A sensible finding does not establish that the refund was handled correctly. We need separate checks whose results retain those distinctions.

Write these obligations before looking at the candidate answer. Otherwise, it is too easy to accept what the model happened to produce and call that the requirement.

## An eval exercises the system at its boundary

A functional acceptance test arranges a business scenario, invokes the application through its public operation and verifies the outcome the business requires. An eval applies that discipline to behavior involving a model.

In this example, the system being evaluated is a prompt running in a coding-assistant session, with input files and tools available to it. The session reads the files, performs its work and returns an answer. We evaluate that complete interaction.

For an application that accepts uploaded documents through an API, the corresponding acceptance boundary is that application operation. Run the real parsing, retrieval, prompt construction, model calls, calculation, validation and response construction that the operation uses. If the application persists a report, verify the persisted report as part of the outcome. Testing a prompt directly cannot establish that the surrounding application performs those steps correctly.

The three familiar parts still apply:

| Stage | In the expense-analysis eval |
| --- | --- |
| Arrange | Select the prompt, input files, reference answers, checks, model configuration and repetition count. |
| Act | Run a fresh coding-assistant session against the supplied files. |
| Assert | Grade the answer and recorded tool activity, then calculate the pass rate for each requirement. |

The model is an external dependency. It participates in the live evaluation because its behavior is what we need to measure. For deterministic tests of the evaluator itself, we replace the external process with scripted responses. Those tests establish whether the evaluator handles a known interaction correctly. The live eval establishes how the actual model behaves in the scenarios we run.

Both are necessary. They establish different things.

## The reference answer belongs outside the trial

Before the system runs, we need an independently established reference. For this example, that includes verified amounts, the accepted treatment of ambiguous entries and the supplied budget rules.

A reference answer does not require one exact response string. August travel can legitimately be $1,655.92 with an August 16 Uber in Travel, or $1,631.82 with that $24.10 charge in Transport. The evaluation must allow the policies the task permits and check their use consistently.

Here is an excerpt from the expected facts:

```json
{
  "dining_august_total": ["398.69"],
  "dining_august_budget_status": ["over"],
  "shopping_july_total": ["756.72"],
  "travel_august_total": ["1655.92", "1631.82"]
}
```

The two accepted travel amounts prevent an arbitrary category preference from becoming a false failure. They do not establish that the answer applied its chosen policy consistently throughout the report. That requires additional checks.

The suite keeps the inputs separate from the reference material:

```text
expense_analysis/
  eval_suite.json
  prompts/
    standard.md
    robust.md
    robust_tables_first.md
  cases/june_august_2026/
    inputs/
      personal_expenses.txt
      budget_notes.txt
    expense_reference_key.md
    expected_facts.json
    reference_ledger.json
  grading/
    fact_extraction_instructions.md
    fact_extraction_schema.json
    rubrics/
      no_invented_budgets.md
      three_supported_findings.md
      tables_before_interpretation.md
      ambiguous_entries_not_forced.md
```

Each trial receives copies of the files in `inputs/`. The loader rejects a referenced prompt, rubric, schema or answer-key file placed inside a case's inputs directory, where it would be copied into the trial.

Notice the design choice. Keeping the reference away from the trial is a condition the program checks. The design does not depend on telling the model to ignore an answer key sitting beside the expense log.

## Choose a grader by the evidence it examines

A grader is the component that examines evidence and decides the outcome of a check. We choose it according to the requirement.

This implementation has four named grader types:

| Grader | Evidence it examines | Decision |
| --- | --- | --- |
| `amount` | A reported amount extracted from the answer | Does it fall within one cent of an accepted reference amount? |
| `fact_value` | An extracted flag, category or status | Does it match an accepted value, ignoring case and surrounding whitespace? |
| `tool_use` | Recorded tool calls and their completion status | Did a call of the required kind, with matching input, succeed? |
| `judge` | The answer and a written rubric | Does the answer meet the criterion the rubric defines? |

The first three decisions are implemented in code. The fourth asks another model to interpret the answer against explicit criteria. The amount and fact-value paths also use a model to extract facts from prose before code compares them.

There are other useful grading methods. For example, a human can label an answer using the same criteria, or compare two answers when the question is which is more useful. Those are different evaluation designs. Our worked example uses individual acceptance checks because we need to know which requirements each answer meets.

## Extract what the answer says, then compare it in code

Suppose the answer reports August dining as $398.71. The reference says $398.69, and the amount check permits a one-cent difference. This constructed example should fail: the difference is two cents.

Getting the reported number out of a free-form response can require interpretation. The table may call the category Dining, Eating Out or Dining & Coffee. We use a model for that extraction, but give it a tightly defined job.

These are the actual extraction instructions:

```text
You are extracting facts from an AI assistant's answer to a personal expense analysis request.

Read only the answer below. Report what the answer states, not what is true. Do not recompute anything. If the answer does not state a fact, use null (or the "not_stated" / "not_mentioned" option). Copy amounts as plain numbers without currency symbols or thousands separators, for example "1655.92".
```

Why insist on reporting what the answer states? Because an extractor that fixes the answer would hide the defect we are trying to measure. The expected totals are kept out of this extraction request. The model receives the answer, the extraction instructions and a schema defining the fields it must return.

For our constructed answer, the relevant extracted field should be:

```json
{"dining_august_total": "398.71"}
```

That is one field from a larger required object. The schema also defines how to represent missing information. An omitted amount becomes `null`; a budget status can be `over`, `under` or `not_stated`. Absence is information the evaluator needs to retain.

Code then makes the amount decision. This is the comparison from `AmountCheckGradingProcessor`:

```python
@staticmethod
def _decide_check_status(
    reported_amount: Decimal | None,
    accepted_values: tuple[str, ...],
) -> CheckStatus:
    if reported_amount is None:
        return CheckStatus.FAILED
    is_accepted: bool = any(
        abs(reported_amount - Decimal(accepted_value)) <= AMOUNT_TOLERANCE
        for accepted_value in accepted_values
    )
    return CheckStatus.PASSED if is_accepted else CheckStatus.FAILED
```

The excerpt is reformatted for the page. `AMOUNT_TOLERANCE` is `Decimal("0.01")`. The decimal representation and tolerance make the comparison rule explicit. That one-cent tolerance is this suite's policy; choose the tolerance your own requirement actually permits.

The pipeline still contains a model-dependent step. If the extractor copies the wrong table cell, code will faithfully grade the wrong value. That is why the grade records the extracted facts alongside the original answer. You can inspect both. Where your application returns structured results directly, read and validate those results without inserting another model merely to extract them.

## Verify an action using its execution record

The prompt tells the assistant to use code to calculate the totals. We could ask a judge whether the answer sounds as though it used code. The session provides better evidence: the tool-call record.

The check is defined as data:

```json
{
  "check_name": "code-executed",
  "grader": "tool_use",
  "tool_kind": "shell",
  "tool_input_pattern": "\\bpython",
  "minimum_pass_rate": 0.8,
  "description": "Totals were computed by running Python, not by mental arithmetic (read from the tool-call log)."
}
```

The grader selects shell calls, matches their command text against the regular expression and requires at least one matching call to have succeeded. A failed or unfinished call does not satisfy it. The provider adapters extract the command itself, excluding a model's descriptive narration of the call.

Be precise about what that proves. The implemented predicate establishes that a successful shell command matching `\bpython` was recorded. It does not inspect the program's arithmetic or establish that its output supplied every total in the final answer. The description expresses the intended behavior; the predicate gives us the actual evidence the check collects.

We therefore retain the amount checks. For a production workflow with an explicit calculation operation, we can verify its structured inputs and outputs and the report derived from them. Select the evidence that reaches the requirement you intend to establish.

## What exactly is a rubric?

Some requirements need an interpretation of language. Consider this one: the answer must not invent budgets for categories the user has not budgeted.

The response might say, "Travel increased sharply in August." That can be a supported observation. It might say, "Travel exceeded your $1,000 budget." The input contains no such budget. Recognizing that distinction across natural-language answers is the judge's job.

A rubric is the written decision rule for that job. It states the relevant facts, what qualifies as a pass, what requires a fail and how to handle an ambiguity that could otherwise lead to inconsistent judgments.

Here is the complete `no_invented_budgets.md` rubric:

> The budget notes give exactly two targets: eating out / coffee under $260 a month, and shopping roughly $1,200 a month. They say every other category has no numeric target. The notes also say the user does not want shopping to "quietly become $2000"; referring to that $2,000 worry is quoting the user, not inventing a budget.
>
> PASS if the answer compares spending only against those two targets (and, optionally, the user's own $2,000 shopping worry), and describes other categories without claiming they are over or under a budget. Saying an unbudgeted category is growing, or suggesting the user might track it, is fine.
>
> FAIL if the answer invents a numeric budget or target for any other category (groceries, gas, subscriptions, travel, total spending, and so on) or judges another category as over or under a budget.

Read those three paragraphs as a specification.

The first paragraph supplies the facts the judge needs. We do not ask it to infer the user's budgets from general financial advice or from the candidate answer. The paragraph also handles the $2,000 statement explicitly. Without that explanation, a judge might penalize a faithful quotation of the user's concern.

The second paragraph defines acceptable behavior. An observation about growth is allowed. A suggestion to track a category is allowed. The criterion concerns invented budgets, so the judge must distinguish those observations from a claim that the user already set a target.

The third paragraph identifies the violation, including a comparison against an unstated budget even when the answer does not give that budget a number.

Now apply it to three constructed responses:

| Candidate statement | Intended verdict under this rubric | Reason |
| --- | --- | --- |
| "August dining was above your $260 target." | Pass | The target is supplied by the user. |
| "Travel increased in August; you could start tracking it separately." | Pass | This suggests future tracking without inventing an existing budget. |
| "Travel was over your monthly budget." | Fail | The user supplied no travel budget. |

These verdicts concern this criterion alone. A response can pass it while failing an amount check or giving the wrong number of findings.

The rubric constrains the judge's discretion. It removes the need to invent a standard for this particular decision, and it makes that standard available for review. The judge still has to interpret language. We have reduced ambiguity in its task; we have not made its interpretation deterministic.

## Follow the rubric into the judge

The suite connects the requirement to that text:

```json
{
  "check_name": "no-invented-budgets",
  "grader": "judge",
  "rubric_file": "grading/rubrics/no_invented_budgets.md",
  "minimum_pass_rate": 0.8,
  "description": "Only the two stated budget targets are used."
}
```

The loader reads the file and constructs a judge-check definition containing its contents. `LlmProcessorRubricJudgment.judge_answer` combines the rubric and the candidate answer into a separate grading request. This excerpt shows that composition:

```python
prompt_text: str = (
    f"{JUDGMENT_TASK_HEADING}\n\n{JUDGMENT_INSTRUCTIONS}\n\n"
    f"<rubric>\n{rubric.strip()}\n</rubric>\n\n"
    f"<answer>\n{answer_text}\n</answer>\n"
)
```

The surrounding grading instructions begin:

> You are grading one answer that an AI assistant gave to a user. Apply the rubric exactly as written and judge only what the answer says. Give a one- or two-sentence reason that names the specific evidence you relied on.

The remaining instructions ask the judge to report disputed amounts when a failure involves a contradiction with a reference amount. We will use those amounts for diagnosis later.

Each judgment has its own session. The request supplies no input files and requests no tools. Its assigned evidence is the rubric and the answer, along with a JSON schema for the result. The adapters implement those session requests according to their host's capabilities; the domain code does not assume that different hosts offer identical tool restrictions.

The delimiters make the two pieces of text distinguishable. They are a prompt convention, not an enforcement mechanism that makes an answer's contents safe or a judge infallible. Treat candidate answers as material to evaluate, and test your judge on answers that try to influence the grading as well as ordinary answers.

For the constructed travel-budget violation above, an illustrative judge response is:

```json
{
  "passed": false,
  "reason": "The answer calls travel over budget, although the rubric states that travel has no supplied budget.",
  "disputed_amounts": []
}
```

The Boolean gives code a decision it can consume. The reason identifies the passage and criterion that justify the decision. `disputed_amounts` is empty because this violation concerns an invented budget, rather than a reported amount contradicting a reference amount.

The evaluator validates that response before creating its domain result. It checks that `passed` is a Boolean, `reason` is a string and `disputed_amounts` has the required structure. A schema-valid result is usable data. Its semantic judgment still needs evaluation.

**Verified, not trusted applies to the grader too.**

## Ground a rubric in facts without prescribing one answer

The rubric for three supported findings has a more involved job. It supplies reference facts about dining, shopping and travel, including the permitted category policies. For example, its travel fact reads:

> Travel was $0 in June and July and $1,655.92 in August ($1,631.82 if the 8/16 Uber is counted as transport). It is the largest July-to-August increase.

Its pass criterion is:

> PASS if the answer gives exactly three findings (a finding may have supporting sub-points), and every number or claim in them agrees with the answer's own tables and does not contradict the reference facts under the policy the answer used. A finding may cover something not listed above if it is supported by the data.

There are two comparisons here. Agreement with the answer's tables establishes internal consistency. Agreement with the independently established reference establishes consistency with the source facts represented by that reference. A model can write a perfectly consistent explanation of an incorrect table, so we need both.

The policy alternatives matter again. If the rubric supplied only one travel total, it could reject an answer that legitimately leaves Uber in Transport. The shopping facts likewise explain what changes when books or Steam are placed in Shopping.

The rubric allows different findings because the task asks for useful analysis. It defines the obligations each finding must meet instead of demanding one preferred wording.

This also exposes the reach of the current check. The judge receives the answer and the reference facts written into the rubric. It does not receive the original expense log in this grading request. The instruction allowing other supported findings therefore does not establish that every possible new claim has been checked against all 198 entries.

For production use, decide how to close that gap. Supply the necessary source evidence to a bounded judge, expand independently verified reference coverage, or require findings to carry structured source references that code can resolve and inspect. The requirement should determine the evidence available to the grader.

## Test the judge before relying on its verdict

The judge is another model-dependent component. Writing a precise rubric is part of its design. Establishing how well it follows that rubric is another task.

Build a set of answers with reviewed labels for each criterion. Include clear passes, clear failures and cases that exercise the rubric's distinctions. For our budget check, those include quoting the $2,000 concern, suggesting a future budget, inventing a numeric budget and calling an unbudgeted category over budget without naming a number.

Run the judge on those answers. Inspect both ways it can be wrong: rejecting an acceptable answer and accepting a violating one. Repeat judgments where variability would affect your acceptance decision. Retain the answer, rubric, judge configuration, expected label, actual verdict and reason so that a disagreement can be investigated.

Those are recommended checks for a production evaluation system. The repository's scripted grader tests verify how the program handles supplied verdicts and malformed responses. They do not establish a live judge's agreement with independently reviewed labels.

When you change the judge model or the rubric, reevaluate that behavior. Otherwise, a rising score could mean the application improved, or it could mean the evaluator became more permissive. You need enough evidence to distinguish them.

## Keep a grading error visible

Sometimes the model being evaluated times out. Sometimes the extractor produces unusable JSON. Sometimes a judge cannot return a verdict. These are different events, and the design records them separately.

The grading processors allow two attempts when the structured response cannot be parsed. A valid failing verdict is accepted as a failure. The program does not keep asking until the judge approves the answer.

If extraction still fails, the fact-based checks become `errored`; the independent tool and judge checks can still be graded. A failed judge attempt errors its own check. If the trial itself did not complete, every check for that trial is marked `errored`.

These outcomes remain in the scorecard denominator. For example, three passes, one failure and one error produce a pass rate of three out of five, or 60%. The error count remains visible so that you can distinguish a rejected answer from a check the evaluator could not complete.

Dropping the error would change the measurement to successful gradings only. The implemented policy instead prevents missing verdicts from silently improving acceptance. Unexpected failures outside the explicitly handled session and grader errors are propagated; the program does not label every programming defect an ordinary failed trial.

## Make each repetition a fresh experiment

If a second run can read the first run's cleaned ledger, we are measuring a different task. If it can inherit a previous conversation's correction, it has extra information. If a personal plugin supplies additional instructions, the experiment depends on an unrecorded condition.

The execution engine creates an assignment for each selected prompt variant, case and repetition. The request makes its inputs explicit:

```python
@dataclass(frozen=True)
class LlmSessionRequest:
    prompt_text: str
    input_files: tuple[InputFile, ...]
    model_name: str
    effort_level: EffortLevel
    tool_kinds: tuple[ToolKind, ...]
    structured_output_schema: str | None
```

For each call, the gateway creates a fresh temporary working directory and copies the assigned input files into it. The adapter supplies the host-specific session, configuration and history options. The prompt variants receive an identical attachment note naming their files.

The immutable request makes the experiment legible to the execution code. The gateway owns translating it into provider arguments and translating the event stream back into an answer and tool calls. The amount grader can therefore work with domain facts without knowing which CLI produced the answer.

Fresh sessions control carryover between trials. They do not make the model deterministic, and a temporary working directory alone is not a complete security boundary. The design's purpose here is a repeatable experimental arrangement with explicit inputs and controlled session setup.

Concurrency is bounded separately for trials and grading. Timing starts after a task acquires its execution slot, so reported answer time excludes time waiting behind another trial. That matters when comparing a cheaper configuration with a faster one.

## Keep each requirement visible in the acceptance decision

The suite defines a minimum pass rate for each check. In this example it is 80%. Four passes in five attempts meet that threshold.

The gate requires every check on a designated prompt variant to meet its own threshold. A high average cannot compensate for failing to preserve a refund or repeatedly inventing budgets. The checks remain identifiable requirements all the way to the decision.

The scorecard groups results by check and prompt variant across the selected cases and repetitions. This suite currently has one case. If you add several cases, its aggregation pools their outcomes for each check. When a particular scenario must pass independently, add the appropriate scenario-level gate; otherwise, success on easy cases can conceal a failure on the critical one.

There is another distinction to preserve. Every check reaching 80% does not mean 80% of complete reports satisfied every check simultaneously. Different checks can fail in different trials. If a complete report must satisfy all obligations together, measure that joint outcome as well.

Choose the acceptance policy before examining candidate results. The example's 80% threshold is a declared bar for this experiment. It is not a suitable default for every production application. Five runs give five observations, and repeating one expense log does not establish performance across all future customers' documents.

For production, build cases from the situations the application must handle: ordinary inputs, ambiguous transactions, missing information, conflicting documents and failures of dependencies. Keep some independently reviewed cases outside the prompt-tuning loop. Set acceptance criteria according to what an incorrect outcome costs and whether a person verifies it before use.

An eval makes an acceptance decision examinable. The business still has to decide what it can accept.

## Change the prompt without changing the examination

The repository compares three prompt versions against the same inputs and grading criteria. `standard` asks for the analysis simply. `robust` adds explicit cleaning and calculation instructions. `robust-tables-first` makes the reply sequence explicit.

These versions change instructions. They demonstrate how to evaluate a proposed prompt change while keeping the examination fixed. They are not a controlled study of equivalent paraphrases.

If you also need to know whether the application tolerates different user phrasings, make that a separate set of cases. Preserve the intended business requirement, vary the request wording deliberately and inspect whether the outcome still meets it. Keep that question separate from whether adding new instructions improves the result.

Likewise, when comparing models, retain the same cases, reference criteria and grader configuration. Record which model and reasoning effort ran each trial. A prompt has been evaluated as part of a particular system configuration; its text alone does not carry the result to a different model.

## Preserve the interaction so a failure can be examined

A scorecard saying "travel total failed" is a starting point. We need to open the answer, see the extracted total and inspect the tool activity that produced it.

The implementation emits these artifacts for completed trials:

```text
scorecard.md
scorecard.json
trials/<variant>/<case>/run-01/
  answer.md
  event_stream.jsonl
  timing.json
  grade.json
```

The grade includes extracted facts, check outcomes, reasons and available diagnoses. The event stream preserves the trial's raw session output, including recorded tool activity. The scorecard records the trial model, assistant, reasoning effort and repetition count.

The library emits artifacts through a callback. The command-line host decides where to store them. That separation lets another host retain the same evaluation evidence without making the grading code depend on a particular filesystem layout.

For a production audit record, preserve the request as carefully as the response: the exact composed prompt, input bytes or stable content references, application revision, model settings, tool configuration, reference key, rubrics and grader configuration. Record both requested and resolved model identities where the provider makes them available. Retain grader requests and responses too.

Those are additional recording requirements for production. The repository's emitted run artifacts do not automatically snapshot all of that material. In particular, a prompt filename and today's file contents are insufficient to prove which prompt an older run received.

Saved files make the interaction inspectable. Immutability requires storage and retention controls that prevent or expose changes. The current results writer creates separate run directories; it does not enforce immutable storage. Choose that guarantee explicitly when the application requires it.

## Diagnose a wrong total using the reference ledger

The reference key also exists entry by entry in `reference_ledger.json`. Each entry records its source line, amount, period, category, accepted alternatives and whether it contributes to the total. Code calculates the ledger's totals and checks that they agree with the accepted amount facts when the suite loads.

That ledger lets the evaluator go further than reporting a mismatch. A [recorded run](https://github.com/matlus/Skills-and-Evals/blob/29104e777bd33bc707f0662573631d6682c70e9e/results/pwi/expense_analysis/20261010T112458Z-regrade-claude_code-claude-sonnet-5-5-medium-e976c6/trials/standard/june-august-2026/run-05/grade.json) reports August travel as $1,563.82. Under the accepted policy that keeps the August 16 Uber in Transport, the reference is $1,631.82. The difference is negative $68.00.

The diagnosis identifies this candidate explanation:

```text
Reference travel:   1,631.82
Reported travel:    1,563.82
Difference:           -68.00
Candidate omission: line 169, Airport Parking, $68.00
```

Code searches for the fewest entry mistakes that explain the difference, considering accepted category policies. It can identify an omitted entry, an extra entry, a counted duplicate or a refund with the wrong sign. It bounds the search because combinations of unrelated amounts can produce coincidental matches. When it cannot find a simple explanation, it reports that.

An arithmetic explanation is a candidate cause. Inspect the saved calculation or entry assignments to confirm what happened. That distinction keeps a useful diagnosis from becoming a claim that the evaluator observed a decision it did not observe.

For a judge failure involving a reference amount, the judge quotes the reported and reference amounts in `disputed_amounts`. Code then attempts to connect those values to the ledger and perform the same diagnosis. The judge identifies the disputed claim; deterministic code searches the recorded reference entries for an explanation.

## Regrading changes the measurement, not the original answer

Sometimes a repeated failure exposes a defect in the reference. A game-store purchase, for example, can reasonably belong in Shopping. If the task permits that policy, an evaluator should not reject it merely because its author preferred Entertainment.

The design separates trial execution from grading so that recorded answers can be graded again after a reference correction. A regrade creates a new results directory and records the source run. The original trial interaction is reused; the graders run against it under the current criteria.

This answers, "How do those recorded answers perform under the revised evaluation?" It does not answer, "How does the current model perform on a new run?" Keep that distinction in reports and deployment decisions.

Version the criteria alongside the results. A changed pass rate is meaningful only when you can tell whether the answer, the reference, the judge or the application changed.

## Verify the program that performs the evaluation

The evaluator contains ordinary software whose correctness we can test deterministically. The repository's acceptance tests invoke `DomainFacade.run_evaluation`, substitute scripted CLI interactions at the process boundary and verify the resulting scorecard and artifacts.

Those tests can establish that each trial receives the assigned files, that grading is separate from execution, that errors remain visible and that a failed gate is reported correctly. Focused grader tests establish details such as a one-cent difference passing and a two-cent difference failing.

The live eval has a separate pytest entry point. Its essential flow is:

```text
Arrange the evaluation request and artifact writer.
Call DomainFacade.run_evaluation with the real configured gateways.
Collect gated scorecard rows below their minimum pass rate.
Fail the pytest gate when that collection is nonempty.
```

The host is small because loading, execution, grading, diagnosis and aggregation already belong to the library. The command-line application uses that same public operation. Acceptance policy is not reimplemented separately for each host.

There is a method to this design. Explicit requests describe the experiment. Gateways isolate provider details. Graders have specific responsibilities. Typed outcomes preserve failures and errors. Artifacts make decisions inspectable. Regrading revisits a measurement without pretending the system produced a new answer.

Each choice helps answer a practical question about the result. Each also gives us something specific to test.

## Use the evaluation to decide what the application must enforce

An eval runs outside an individual production request. It measures how the system behaved in the scenarios we supplied. The application still needs to validate each live result before using it.

If a total must be mathematically correct, calculate and reconcile it in code. If every finding must refer to source entries, require those references and validate them. If the available evidence cannot support a requested conclusion, make that an explicit outcome of the application's contract.

The eval then exercises those paths through the application boundary, including what happens when the model produces an invalid result. A failure can lead to a better prompt, a corrected reference, a stronger validation rule or a change in where the application gives a model responsibility. The evidence tells us which decision to examine.

Start your own eval with one complete scenario and the outcome a user actually needs. Establish the reference independently. Select a grader for each obligation and give it the evidence required to decide. Run the real system repeatedly, retain the interaction and inspect disagreements. Add scenarios as you learn where the system fails.

The questions remain concrete: what must be right, what evidence establishes it, which code or judge examines that evidence, and what happens when it cannot establish the required result?

That is how "verified, not trusted" becomes an implementation.
