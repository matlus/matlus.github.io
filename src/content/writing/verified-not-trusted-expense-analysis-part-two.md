---
title: "Verified, Not Trusted: Expense Analysis, Part Two"
titleEmphasis: "Verified, Not Trusted"
description: >-
  Imperative Python controls expense analysis and verifies model contributions through source evidence,
  reconciliation, and exact calculations. Jev and LLMs handle bounded judgments.
datePublished: 2026-10-06
dateModified: 2026-10-06
hero: verified-not-trusted-expense-analysis-part-one
repositories:
  - label: Expense Analysis Workflow
    url: https://github.com/matlus/Analyze-Expenses-Workflow
    context: Python controller, bounded model decisions, and verification for Part Two.
tags:
  - verified-not-trusted
  - verification
  - jev
  - boundary-validation
  - task-composition
  - ai-workflow-patterns
  - confidence-gated-routing
  - python
related:
  - verified-not-trusted-expense-analysis-part-one
  - skills-versus-controlled-workflows
  - jev-practical-reference
draft: false
status: established
---

<!-- audit-allow: Verified, not trusted -->

## Who makes sure the work gets done?

In [Part One](/writing/verified-not-trusted-expense-analysis-part-one/), we analyzed an expense log with two prompts. The second prompt spelled out the work: parse every line, preserve uncertainty, handle refunds and duplicates, calculate with code, and then explain the results. Those instructions made the response easier to examine. We still had to establish that the requested work had happened and that the result met the requirements.

Now imagine that this analysis runs overnight for a client. Nobody is sitting beside the assistant, watching the response arrive. There is no opportunity to say, “Hang on. You counted the refund as another purchase.” The result goes into another process, and that process makes a decision based on it.

Would you be comfortable relying on the same prompt?

I would want the application to control the sequence, perform the calculations, and check the evidence before allowing a result to proceed. I would still use models where their judgment helps. I would give them much smaller jobs.

That is the subject of this part: a directed graph whose controller is imperative Python code, with model calls inside particular steps. Python decides which step runs next, what counts as an acceptable answer, when to retry, and what to do with unresolved input. Models supply judgments within those boundaries.

The theme remains ***Verified, not trusted***. I don't find “trust but verify” a useful starting point here. It grants the answer trust before we have established a reason for doing so. The order I want is ***Verified, therefore trusted***. Until the relevant checks have passed, that answer has not earned our trust. And the trust extends only as far as those checks establish.

<div class="article-callout" role="note" aria-label="Idea">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#idea"></use></svg>
  <div class="article-callout__content">
    <p><strong>Instruction is not assurance.</strong></p>
    <p>An instruction can go unperformed. It can also be performed incompletely while the model reports success. We need evidence that the work happened and that it met the requirements.</p>
    <p>In this workflow, code performs the checks before accepting the model's contribution. <strong><em>Verified, not trusted.</em></strong></p>
  </div>
</div>

## The stakes and the person in the loop

There is a spectrum here. A skill can do most of the work for a person who is present to inspect the result and ask for corrections. For a rough look at household spending, that can be a useful arrangement. We may tolerate a little back and forth because we can see the mistakes and the consequences are limited.

Move the same task into work for a company or a client, and the cost of an incorrect calculation changes. Having a person in the loop still helps, but it does not make occasional wrong totals acceptable. That person needs evidence they can review efficiently.

Then remove the person from the execution loop. The workflow may run hundreds of times, with unusual inputs arriving while nobody is watching. The checks that a person might have remembered to request now need to be part of the application.

| Situation | Who directs the work? | Where does verification happen? |
| --- | --- | --- |
| An interactive prompt or skill for a low-stakes task | The model interprets the request and chooses its actions | A person examines the work and requests corrections |
| An explicit procedure like Part One's second prompt | The model follows a stated sequence, including using code | A person checks that the procedure was followed and the results agree |
| A maintained workflow for consequential or unattended work | Imperative code controls steps, branches, retries, and acceptance | Programmed checks run during execution; unresolved cases remain visible or stop further action |

The second prompt describes a sequence, but the model is still responsible for carrying it out. Asking it to write and run a script does not, by itself, establish that the script used the correct inputs or applied every rule.

A skill can also invoke the maintained workflow in the third row. Skills are a way to package instructions and capabilities; they do not require us to surrender control of the underlying calculation. The useful questions are: Who controls execution? What is verified? What happens when verification fails? I discuss that distinction further in [Skills versus Controlled Workflows](/writing/skills-versus-controlled-workflows/).

Higher stakes and less human oversight justify more work on explicit rules, evidence, and failure behavior. The expense example lets us examine what that extra work looks like. Its report exposes unresolved entries; an application that acts on the report must also decide which unresolved conditions prohibit action.

## Give the model the smallest useful job

Before adding a model call, I want to ask: Can ordinary code do this step?

Adding amounts, grouping transactions by month, comparing a total with a budget, preserving line numbers, and producing a Markdown table all have rules we can implement directly. A model adds no useful judgment to those operations.

Understanding an unfamiliar transaction description is different. A model may help decide which category the description supports. A line containing several dates or amounts may also need contextual interpretation. Even then, we can often narrow the job to choosing among values that code has already found.

The implementation uses Jev for these bounded decisions. TypeSafe describes Jev as a System One model: it produces typed judgments rather than free-form prose. Its `Choice` operation selects among supplied options and returns probabilities. That suits a question such as “Which of these source amounts is the transaction amount?” See the [System One documentation](https://docs.typesafe.ai/concepts/system-one) and [Choice reference](https://docs.typesafe.ai/primitives/choice).

An LLM can perform classification too. The architectural decision is to isolate the judgment behind a small contract so that code can inspect the answer. Here, Jev handles choices, and an LLM is available for unresolved extraction and a final, tightly constrained selection of findings. All the controller and processing code shown below is Python.

Notice how small those jobs are. The model does not receive authority to remove transactions, change the category policy, calculate a total, or invent a report finding.

## The graph is visible in the controller

The main operation in `ManagerExpenseAnalysis` shows the order of work. The excerpts below retain the implementation's members with their outer class indentation removed; imports and surrounding members are omitted. The processor methods provide the details we'll examine next.

```python
async def analyze_expenses(self, expense_lines: Sequence[str], confirmed_duplicate_line_numbers: tuple[int, ...] = ()) -> ExpenseAnalysisResult:
    ValidatorExpenseLines.validate(expense_lines)
    parsed_expense_lines: tuple[ParsedExpenseLine, ...] = await self._parse_and_extract(expense_lines)
    expense_categorization_slots: tuple[ExpenseCategorization | None, ...] = await self._categorize_lines(parsed_expense_lines)
    expense_transactions: tuple[ExpenseTransaction, ...] = await self._expense_reconciliation_processor.reconcile(
        parsed_expense_lines, expense_categorization_slots, confirmed_duplicate_line_numbers
    )
    expense_calculation_result: ExpenseCalculationResult = await self._calculate(expense_transactions)
    expense_findings: tuple[ExpenseFinding, ExpenseFinding, ExpenseFinding] = await self._expense_findings_llm_processor.findings(
        expense_calculation_result
    )
    return self._build_result(
        parsed_expense_lines, expense_categorization_slots, expense_transactions, expense_calculation_result, expense_findings
    )
```

Read down the method. Input validation precedes parsing. Categorization finishes before reconciliation. Reconciliation precedes calculation. Findings are selected only after calculation has completed its checks.

There is no model deciding whether reconciliation seems necessary today. The next call is written into the program.

<figure class="article-diagram">
  <img class="article-diagram__image" style="max-width: 560px;" src="/images/diagrams/expense-analysis-imperative-flow.svg" alt="Python controls input validation, a parsing cascade, concurrent per-line categorization, reconciliation, calculation, verified finding selection, and report rendering. Jev and LLM calls sit inside specific stages." loading="lazy" />
  <figcaption>The controller fixes the path. Model answers become inputs to checks inside that path. Unresolved extraction remains visible; invalid reconciliation or an unrecoverable later-stage failure prevents a completed report.</figcaption>
</figure>

We can describe this as a directed graph without introducing a graph framework. Calls establish dependencies, conditions establish branches, and a task group provides fan-out and fan-in. The extraction and findings processors also contain bounded retry loops. Drawing the main path as a sequence does not remove those branches or retries.

The benefit comes from who controls those transitions. Python does.

## Eight lines to follow through the workflow

We'll use a small, invented log so we can follow every entry. The line numbers below are positions in the input, starting at one; they are not part of the source text.

```text
2026-06-01 | Kroger | $82.18
2026-06-01 | Kroger | $82.18
2026-06-02 | Cafe | charge $7.50; available balance $102.00
2026-06-03 | ATM withdrawal | $40.00
2026-06-04 | Bank transfer | -$15.00
2026-07-01 | Kroger | $50.00
2026-07-02 | Target | $20.00
2026-07-03 | Unknown store | amount missing
```

For this example, the caller confirms line 2 as a duplicate of line 1. We'll use monthly targets of $100 for Dining & Coffee and $100 for Shopping. These are example targets, separate from Part One's budgets.

To make the path reproducible, the walkthrough fixes the model responses: Jev leaves line 3's amount unresolved, the LLM identifies the $7.50 charge, and the missing amount on line 8 stays unknown. Later category proposals are stated where they matter. These choices illustrate execution paths; they are not measurements of model accuracy.

## 1. Parse what code can parse

The first processor searches each line for dates and amounts using explicit parsing rules. A single supported date or amount can be read directly. Multiple candidates create an issue to resolve. A missing field stays missing.

The result preserves the source alongside the extracted values:

```python
@dataclass(frozen=True, slots=True)
class ParsedExpenseLine:
    line_number: int
    source_text: str
    occurred_on: date | None
    description: str | None
    amount: Decimal | None
    issues: tuple[str, ...]
```

`line_number` and `source_text` provide the connection back to the input. `None` has a specific meaning: the field has not been established. The `issues` tuple records why further work is needed. The frozen dataclass makes each result a value to pass between steps; later processors create updated values.

Amounts use `Decimal`. The parser reads the decimal amount from its source text, preserves signed amounts, and applies explicit refund rules. Dates come from the entry itself. Where a year is missing, the processor infers one only when the available dates support that inference; it does not silently substitute today's year.

Line 1 has one date and one amount, so Python can establish both. Line 3 has two amounts: $7.50 and $102.00. Choosing the first number unconditionally would hide a decision inside a convenient parsing shortcut. This parser records the ambiguity. Line 8 has no amount to extract at all.

The loop makes source coverage explicit:

```python
def _parse_lines(self, expense_lines: Sequence[str], inferred_year: int | None) -> tuple[ParsedExpenseLine, ...]:
    parsed_expense_lines: list[ParsedExpenseLine] = []
    for line_number in range(1, len(expense_lines) + 1):
        source_text: str = expense_lines[line_number - 1]
        issues: list[str] = []
        occurred_on: date | None = self._parse_line_date(source_text, inferred_year, issues)
        amount: Decimal | None = self._parse_line_amount(source_text, issues)
        description: str | None = self._parse_line_description(source_text, issues)
        parsed_expense_lines.append(ParsedExpenseLine(line_number, source_text, occurred_on, description, amount, tuple(issues)))
    return tuple(parsed_expense_lines)
```

The `append` runs for every line, including lines the parser cannot complete. There is no filter that discards a result because `issues` is nonempty. That gives later reconciliation something to account for. A failed parse cannot quietly make an expense disappear.

## 2. Ask Jev to choose from source evidence

The parsing cascade is also explicit:

```python
async def _parse_and_extract(self, expense_lines: Sequence[str]) -> tuple[ParsedExpenseLine, ...]:
    parsed_expense_lines: tuple[ParsedExpenseLine, ...] = await self._expense_line_parsing_processor.parse(expense_lines)
    inferred_year: int | None = self._expense_line_parsing_processor.infer_year(expense_lines)
    jev_parsed_expense_lines: tuple[ParsedExpenseLine, ...] = await self._expense_line_jev_extraction_processor.extract_uncertain_lines(
        parsed_expense_lines, inferred_year
    )
    return await self._expense_line_extraction_llm_processor.extract_uncertain_lines(jev_parsed_expense_lines, inferred_year)
```

Calling each processor does not mean calling each model. The Jev processor considers eligible ambiguities, and the LLM processor receives only lines whose issues remain unresolved.

For line 3, Python has already located two amount occurrences. The Jev question offers a finite set:

| Choice key | Meaning |
| --- | --- |
| `candidate_0` | The source occurrence containing `$7.50` |
| `candidate_1` | The source occurrence containing `$102.00` |
| `none` | None of these is the transaction field |

The question asks which amount affects the account as the transaction, taking the surrounding wording into account. We need the model's interpretation of “charge” and “available balance.” We already have code that can read the numbers.

Here is the gate that decides whether to accept the selected candidate:

```python
def _accepted_candidate_index(self, choice_decision: ChoiceDecision, candidate_descriptions_by_choice_key: Mapping[str, str]) -> int | None:
    if (
        choice_decision.choice not in candidate_descriptions_by_choice_key
        or choice_decision.probabilities[choice_decision.choice] < self._minimum_choice_probability
    ):
        return None
    if choice_decision.choice == self._NONE_CHOICE:
        return None
    return int(choice_decision.choice.removeprefix(self._CANDIDATE_PREFIX))
```

There are three checks worth noticing. The choice must belong to the supplied set. The probability associated with that choice must meet the configured minimum. And `none` remains a valid way to decline selection.

The gate uses `probabilities[choice]`. Jev also returns a separate `confidence` value; the two fields are not interchangeable. This implementation's routing decision uses the selected option's probability.

After selection, Python retrieves the original occurrence, parses it again, rejects an occurrence identified as a balance, and applies the amount's sign and refund rules. The model supplies an index into evidence that the application already holds.

That probability threshold is a routing rule. It cannot prove that the selected amount is correct. A confidently wrong selection still has to face the source and policy checks, and those checks have limits too. The threshold needs evaluation against representative inputs before we rely on it operationally.

This is ***Verified, not trusted*** applied to a small answer. Restrict the possible answer, check the choice, and derive the value from the source.

## 3. Use the LLM for what remains unresolved

Suppose Jev chooses `none` for line 3, or the selected probability is below the minimum. Python leaves the amount unresolved. The next processor can ask the LLM to extract the missing information.

This fallback also covers other unresolved parsing problems that Jev's candidate selection cannot solve. A failed Jev extraction request can leave a line for this stage. The LLM is given the unresolved source lines, the known fields, an output schema, and instructions to supply evidence.

For the amount on line 3, the relevant part of the proposed answer is:

```json
{
  "amount": "7.50",
  "amount_evidence": "$7.50",
  "amount_evidence_index": 0
}
```

This is a fragment of a line response, not the complete response schema. The full response also carries line identity, source text, and the date and description fields. The amount is a decimal string. The zero-based index identifies an occurrence among the line's amount candidates.

Why bother with an occurrence index? Because the same number can appear twice. “Charge $50.00; balance $50.00” contains identical amount text with two different meanings. Checking that the string occurs somewhere would not establish which occurrence the model used.

The amount-validation method shows where the accepted value comes from:

```python
def _validated_amount(
    self,
    original_parsed_expense_line: ParsedExpenseLine,
    extracted_amount: str | None,
    amount_evidence: str | None,
    amount_evidence_index: int | None,
) -> Decimal | None:
    if original_parsed_expense_line.amount is not None:
        return self._validated_known_amount(original_parsed_expense_line.line_number, original_parsed_expense_line.amount, extracted_amount)
    if extracted_amount is None:
        return None
    amount_validation_evidence: _AmountValidationEvidence = _AmountValidationEvidence(
        original_parsed_expense_line.source_text,
        original_parsed_expense_line.line_number,
        extracted_amount,
        amount_evidence,
        amount_evidence_index,
    )
    amount_evidence_occurrence: AmountEvidenceOccurrence = self._required_amount_occurrence(amount_validation_evidence)
    evidence_amount: Decimal = self._amount_from_occurrence(original_parsed_expense_line.source_text, amount_evidence_occurrence)
    self._require_matching_amount_evidence(original_parsed_expense_line.line_number, extracted_amount, evidence_amount)
    return evidence_amount
```

If Python already knows the amount, the response cannot change it. Otherwise, the processor requires a supported source occurrence, derives the amount from that occurrence, and checks that the proposed decimal value agrees. It returns `evidence_amount`, the value reconstructed from the source.

Other checks require the correct source text and line numbers, preserve known dates and amounts, and validate evidence for newly extracted fields. A schema-valid response is only the beginning of acceptance.

The processor allows two semantic attempts in total: the first response and one retry. It retains successful resolutions and retries the remaining problems. Unresolved or failed extraction stays visible with issues; it does not acquire an invented value to keep the report looking complete. In our example, line 8 remains without an amount.

A model cannot recover a purchase amount that the supplied record does not contain. More eloquent instructions do not create the missing evidence.

***Verified, not trusted*** means accepting only what the checks support, including accepting that a field is still unknown.

## 4. Categorize complete lines concurrently

Once extraction finishes, each complete line can be categorized independently. This is the fan-out portion of the graph. The manager creates a task for each parsed line and limits concurrent categorization work to eight:

```python
async def _run_categorization_tasks(self, parsed_expense_lines: tuple[ParsedExpenseLine, ...]) -> tuple[ExpenseCategorization | None, ...]:
    semaphore: asyncio.Semaphore = asyncio.Semaphore(8)

    async with asyncio.TaskGroup() as task_group:
        tasks: tuple[asyncio.Task[ExpenseCategorization | None], ...] = tuple(
            task_group.create_task(self._categorize_one(parsed_expense_line, semaphore)) for parsed_expense_line in parsed_expense_lines
        )
    return tuple(task.result() for task in tasks)
```

The per-line method first checks for a date, description, and amount. An incomplete line returns `None` for its categorization slot. A complete line enters the semaphore and asks the categorization processor to do its work.

<figure class="article-diagram">
  <img class="article-diagram__image" style="max-width: 640px;" src="/images/diagrams/expense-analysis-category-fanout.svg" alt="The manager fans out complete lines into concurrent Jev category choices followed by Python policy. An incomplete line bypasses the model. Fan-in gathers one ordered slot for every source line." loading="lazy" />
  <figcaption>Each complete line gets a Jev proposal and a code-enforced category decision. The task group gathers results in source order. Line 8 retains an empty category slot.</figcaption>
</figure>

Jev is used again here, for a different question. The options now come from a fixed expense-category catalog. The processor asks for the category supported by the transaction, then applies application policy:

```python
async def categorize(self, source_line_number: int, source_text: str, description: str | None = None) -> ExpenseCategorization:
    decision: ChoiceDecision = await self._gateway.choose(source_text, self._choice_question())
    model_category, probabilities = self._translate_decision(decision)
    category, policy_note = self._apply_category_policy(description, model_category)
    return ExpenseCategorization(
        source_line_number=source_line_number,
        source_text=source_text,
        category=category,
        model_category=model_category,
        policy_note=policy_note,
        confidence=decision.confidence,
        probabilities=probabilities,
    )
```

Keeping `model_category` separately from `category` is useful. We can see both the model's proposal and the application's final decision. If a policy changes that decision, `policy_note` explains it.

For example, suppose Jev proposes Shopping for the merchant-only Target entry. Python assigns Other because the purchased item is unknown. Suppose Jev proposes Other for the ATM withdrawal and bank transfer. Python assigns Uncategorized because neither description establishes a spending purpose. Exact known-merchant rules supply the configured category for merchants such as Kroger.

These rules are repeatable, inspectable decisions. They also remain policies with limits. A merchant name does not prove which items were purchased. Classifying a Kroger charge according to the catalog verifies application of that rule; a receipt would provide stronger evidence about the purchase itself.

There are two implementation details we should be precise about. First, this version asks Jev about every complete line before applying the deterministic policy, even when a known-merchant rule will determine the result. It retains the proposal for inspection. If that proposal has no useful role in a particular application, moving conclusive rules ahead of the model call would remove unnecessary model work.

Second, **the probability-based LLM fallback in this implementation belongs to date and amount extraction**. Categorization uses Jev followed by code policy; it does not currently send low-probability category decisions to an LLM. The same routing idea could be added there, but its accepted outputs and failure policy would need to be defined and tested.

### Fan-in preserves the relationship to the source

Tasks may finish in any order. The tuple of tasks is created in input order, and `task.result()` is read in that same order after the task group completes. Completion order therefore cannot attach a category to the wrong transaction.

Our resulting slots are:

```text
1 groceries
2 groceries
3 dining_coffee
4 uncategorized
5 uncategorized
6 groceries
7 other
8 None
```

The final slot matters. The source line has not vanished because there was nothing to categorize.

A failed category request has different behavior from an incomplete source line: it propagates through the task group and prevents successful completion. The code does not disguise a failed service call as an ordinary empty categorization.

## 5. Reconcile every source line

The reconciliation processor receives the parsed lines and their aligned category slots. It checks the lengths and verifies that each nonempty category result names the corresponding line and source text:

```python
@staticmethod
def _validate_alignment(
    parsed_lines: tuple[ParsedExpenseLine, ...],
    categorizations: tuple[ExpenseCategorization | None, ...],
) -> None:
    if len(parsed_lines) != len(categorizations):
        raise ValueError("Each parsed expense line must have a corresponding categorization slot")

    for parsed_line, categorization in zip(parsed_lines, categorizations, strict=True):
        if categorization is not None and (
            categorization.source_line_number != parsed_line.line_number
            or categorization.source_text != parsed_line.source_text
        ):
            raise ValueError(f"Categorization does not match expense source line {parsed_line.line_number}")
```

Equal counts alone would allow two category results to be swapped. Checking both identity and source text catches that mismatch before amounts are assigned to categories. The processor then creates one ledger transaction per source line.

Each transaction receives one treatment:

| Treatment | Lines | Effect |
| --- | --- | --- |
| `included_spending` | 1, 3, 6, 7 | Include the signed amount in its month and category |
| `excluded_duplicate` | 2 | Retain the entry and its link to line 1; count no second charge |
| `uncategorized_outflow` | 4 | Retain the $40 withdrawal as unresolved outflow |
| `uncategorized_credit` | 5 | Retain the −$15 transfer separately from spending totals |
| `unparsed` | 8 | Retain the source and its missing amount; contribute no invented number |

This is where our confirmed duplicate takes effect. The caller supplies `(2,)` as `confirmed_duplicate_line_numbers`. The processor verifies that the indicated entry is an exact adjacent duplicate with matching parsed values. An invalid confirmation raises an error.

Two identical charges can both be real. Code can establish that two recorded lines match; it cannot establish from that fact alone that only one purchase occurred. Requiring an explicit confirmation keeps that decision visible. The confirmation is supplied before execution, so it does not require an interactive question in the middle of a run. With no confirmation, both entries remain countable.

A categorized refund stays in `included_spending` with its negative amount. The bank transfer on line 5 is different: its purpose is unknown, so subtracting it from Groceries or Shopping would invent a relationship. The separate credit treatment preserves that distinction.

We can now answer “What happened to line 2?” and “Why is line 8 missing from the total?” directly from the ledger. That is evidence we can inspect.

## 6. Calculate the amounts in Python

At this point the calculations have defined inputs and rules. There is no useful reason to delegate addition to a model.

The calculation processor groups included transactions by month and category. Within each group, the relevant construction is:

```python
MonthlyCategoryTotal(
    month=month_and_category[0],
    category=month_and_category[1],
    amount=sum((cls._dated_amount(transaction)[1] for transaction in category_transactions), Decimal(0)),
    source_line_numbers=tuple(sorted(transaction.parsed_line.line_number for transaction in category_transactions)),
)
```

The amount is a decimal sum, and the result carries the contributing source line numbers. Those two pieces travel together. If we question a total, we can find its inputs.

Here are the classified amounts for our example:

| Month | Category | Amount | Source lines |
| --- | --- | ---: | --- |
| June 2026 | Groceries | $82.18 | 1 |
| June 2026 | Dining & Coffee | $7.50 | 3 |
| July 2026 | Groceries | $50.00 | 6 |
| July 2026 | Other | $20.00 | 7 |

The processor separately totals unresolved outflow and adds it to classified spending to produce its defined measure of *observed outflow*:

```text
June: 82.18 + 7.50 = 89.68 classified
      89.68 + 40.00 unresolved = 129.68 observed outflow

July: 50.00 + 20.00 = 70.00 classified and observed outflow

Both months: 159.68 classified + 40.00 unresolved = 199.68 observed outflow
```

That $199.68 is not a bank-balance reconciliation or a claim that all the money bought known goods and services. It includes the unresolved cash withdrawal, excludes the unknown-purpose credit, and cannot include line 8's missing amount. The name of a total and its definition matter as much as its arithmetic.

Budget variance is `actual - target`. June Dining & Coffee is $7.50 against $100, so its variance is −$92.50. July has no classified Dining & Coffee spending, giving a variance of −$100.00.

Shopping is also zero against $100 in each month. Does that establish that no shopping occurred? Look at line 7. Its $20 Target charge is in Other because the item is unknown. Python adds a shopping-coverage qualification to the July comparison. The arithmetic is exact; the evidence supporting the shopping category is incomplete.

Month-to-month change is `current - previous`. Groceries falls from $82.18 to $50.00, a change of −$32.18, supported by lines 1 and 6. The implementation compares adjacent reported months; it does not create missing calendar months with assumed zero spending.

None of this requires generated reasoning. It requires defined measures, signed amounts, and code whose behavior we can test.

## 7. Check what the totals establish

The calculation processor also checks that line identities are unique, every ledger line has a treatment, category totals agree with monthly classified totals, and classified spending plus unresolved outflow agrees with observed outflow. A failed reconciliation raises an error before findings are selected.

For our example, the record includes:

```json
{
  "source_line_count": 8,
  "included_line_numbers": [1, 3, 6, 7],
  "duplicate_line_numbers": [2],
  "unresolved_line_numbers": [4],
  "unresolved_credit_line_numbers": [5],
  "unparsed_line_numbers": [8],
  "classified_spending": "159.68",
  "unresolved_outflow": "40.00",
  "observed_outflow": "199.68",
  "is_balanced": true
}
```

Read `is_balanced` together with the rest of that record. Eight lines are accounted for, and the defined totals agree. One amount is still missing, and one outflow still has no identified purpose.

The checks establish internal consistency and source coverage within the supplied log. They do not establish that the log contains every real expense or that a model-informed category is semantically correct. An incorrect category can produce perfectly consistent arithmetic.

For an automated process that releases a payment or posts a client report, I would make the acceptance conditions explicit at the consuming boundary. For example, a policy might prohibit proceeding while any amount remains unparsed, or require supporting documents for particular categories. That is an additional application decision. This example can return a balanced report with unresolved entries, so a caller must not treat `is_balanced` as approval for every downstream use.

***Verified, not trusted*** requires us to say what was verified. Otherwise, even a field called `is_balanced` can acquire more authority than it deserves.

## 8. Let the LLM select findings it cannot rewrite

The last model-assisted step is particularly useful to examine. We want three findings. It would be easy to send the totals to an LLM and ask it to write a summary. Then we would need to inspect any new arithmetic, claims, and wording it introduced.

This implementation first builds candidate findings in Python. Each candidate has an ID, a statement produced from calculated values, and its source line numbers:

```python
@dataclass(frozen=True, slots=True)
class _FindingEvidence:
    evidence_id: str
    statement: str
    source_line_numbers: tuple[int, ...]
```

Candidates include budget breaches, large category changes, and qualifications about unresolved amounts or shopping coverage. Python also identifies findings that must appear, such as an applicable dining-budget breach, the largest category change, and a shopping-coverage qualification.

The model's response contract is deliberately small:

```python
class _ProposedFinding(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="forbid", frozen=True)

    evidence_id: str = Field(min_length=1)

class _FindingsResponse(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="forbid", frozen=True)

    proposed_findings: tuple[_ProposedFinding, _ProposedFinding, _ProposedFinding] = Field(alias="findings")
```

The LLM selects three distinct evidence IDs. It is instructed to include the required IDs. It does not write the finding text or calculate another number.

For our example, the largest category change is the $32.18 fall in Groceries, and the Target purchase makes the shopping-coverage qualification relevant. Those findings are required by code. One possible third selection highlights the $40 unresolved outflow. The first two cannot be omitted merely because a model prefers a more cheerful summary.

Python checks that the response contains exactly three distinct IDs, that every ID exists in the candidate set, and that the required IDs are present. It then copies the selected candidates' statements and source references into the final result. An invented ID fails validation. A missing required finding fails validation. After the bounded retry is exhausted, the findings operation fails.

This arrangement gives the LLM a constrained selection task. Its choices can still vary where there is room to choose, but it cannot alter the numbers or make up the selected statements.

There is also an obvious opportunity to remove work: if the rules already require exactly three candidates, code could select those directly. This version still calls the LLM. The principle applies here too: if the application has already determined the answer, another model call needs a reason.

The final Markdown report is composed by Python from the structured result. Formatting tables and inserting verified statements do not require another model.

## What have we gained?

We have moved a substantial amount of responsibility into code we can inspect and test. A model no longer controls whether the parser, reconciliation, or calculation runs. It cannot decide to skip a required finding. Its answer cannot silently overwrite a known amount.

We also have smaller places to investigate when something goes wrong. A questioned total leads to a set of ledger lines. A changed category retains the original model proposal and the applied policy. An unresolved amount leads back to its original source text. The result carries the information needed to ask a precise question.

The repository's offline tests exercise parsing, evidence checks, policies, reconciliation, calculations, and invalid model responses. One integration test uses the original 198-entry expense fixture, confirms its duplicate, retains eight unresolved outflows, and reproduces $11,758.68 in observed outflow under the workflow's rules. Its model answers are supplied by test doubles, so it checks how the program handles those answers. Live model accuracy requires separate evaluation.

This does not make the entire pipeline deterministic. Model-dependent choices can vary. What it does is give us deterministic control over the sequence and over how accepted inputs become calculated outputs, while restricting the places where model judgment can affect the result.

That is why I would put in this effort for consequential, repeated, or unattended work. An interactive skill can still be the right interface. Underneath it, I want the application to do every step it can do reliably, ask models for the judgment it needs, and verify each contribution before using it.

When you design your next workflow, look at each model call and ask: What is the smallest answer I need? What evidence will let code check it? What happens if that check fails?

***Verified, not trusted.*** Trust follows the evidence that the required work was done and met its requirements.
