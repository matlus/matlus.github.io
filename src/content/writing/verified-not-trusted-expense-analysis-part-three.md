---
title: "Verified, Not Trusted: Expense Analysis, Part Three"
titleEmphasis: "Verified, Not Trusted"
description: >-
  Evals are acceptance tests for prompts and skills: repeated isolated runs, a pass rate for each check,
  and a minimum pass rate as the gate. Code grades extracted facts and traces failures.
datePublished: 2026-10-10
dateModified: 2026-10-10
hero: verified-not-trusted-expense-analysis-part-three
repositories:
  - label: Skills and Evals
    url: https://github.com/matlus/Skills-and-Evals
    context: The expense-analysis eval suite, the one-file eval, and recorded results for six models.
tags:
  - verified-not-trusted
  - verification
  - model-evaluation
  - acceptance-testing
  - prompting
  - python
related:
  - verified-not-trusted-expense-analysis-part-one
  - verified-not-trusted-expense-analysis-part-two
  - skills-versus-controlled-workflows
  - functional-acceptance-testing-at-the-boundary
draft: false
status: established
---

<!-- audit-allow: Verified, not trusted -->

## Where are the evals?

There are hundreds of repositories offering collections of skills. "Here are the 100 skills I use every day." Fine. Where are the evals? There are just as many videos comparing skill packs and declaring a winner without a single measurement.

Which model were those skills used with, and at what reasoning effort? How often does the code-review skill actually find the problems it claims to find? How often does it report a problem that is not there? If the author switched to a newer model last month, does the skill still work? I rarely see those questions answered, and when an eval does appear, it is often a handful of examples run once. Without that evidence, you have no idea what you are buying into when you put a skill to work, whether someone else wrote it or you did.

A word about terms before we go further. A skill can bundle scripts and reference files, but at its heart is a prompt, and that prompt is the controller. So in this article I will mostly say prompt. Prompts are also what businesses actually deploy. Nobody puts a skill into production; they put prompts inside the applications that run the business.

Take one of the most popular packs, Addy Osmani's [agent-skills](https://github.com/addyosmani/agent-skills), with more than 100,000 stars on GitHub. It deserves credit here. As of this writing, it has an eval framework: structural checks, checks that the right skill is chosen for a request, and behavioral evals that run each case in a headless session and grade the transcript. It even reports a measurement most packs never mention. Its code-review skill was invoked in 5 of 7 runs on the phrasing its own test case uses. In the other two runs, the skill was not used at all. Whether a skill is used at all turns out to be a probability. Part One put it this way: **instruction is not assurance**. Writing an instruction does not ensure that it will be followed, and a skill nobody invokes is an instruction nobody reads.

What I could not find is the measurement that matters most when you adopt the pack: with the skills and without them, across repeated runs, how often does the work come out right? The behavioral results are written to a folder the repository does not keep. The README links to a "controlled head-to-head experiment" against another pack, and that comparison is one run of each pack on one feature, using Claude Sonnet 4.6 at medium effort. One run per pack cannot separate the effect of the skills from ordinary variation between runs. That repository is closer to having evals than most. Most have nothing at all.

In [Verified, Not Trusted: Expense Analysis, Part One](/writing/verified-not-trusted-expense-analysis-part-one/), we gave two prompts the same expense log and budget notes and examined a recorded response. That article was careful to say that the excerpts showed what happened in one run and did not establish how reliably either prompt works. [Verified, Not Trusted: Expense Analysis, Part Two](/writing/verified-not-trusted-expense-analysis-part-two/) moved control of the work into Python and ended on a similar note: its tests check how the program handles model answers, and live model accuracy requires separate evaluation.

This article, the third of four, is that evaluation. We take the same expense log, the same budget notes and the prompts from Part One, and measure how often each prompt produces correct results. Then we do the same across six models from two vendors.

## One run is an anecdote

Part One explained why a model can answer the same request differently each time. It generates text a token at a time, and the selection among likely next tokens can vary from one run to the next. The same prompt, the same model and the same files can produce different answers.

Here is what that looks like in practice. We ran the final prompt five times on Claude Sonnet 5.5, each run in a fresh session with the same two files. Four runs reported August travel as $1,655.92, the correct total. In the third run, the model decided that the two Delta Air Lines charges on August 14 were duplicates:

```text
Delta Air Lines - $412.60 (Aug. 14)
Delta Air Lines (8/14) - $450.60
```

They have different amounts, and the expense log gives no reason to delete either one. That run dropped $412.60 and reported August travel as $1,219.22. Nothing about the prompt changed between runs.

Suppose you had tested the prompt once and happened to get the third run. You would conclude the prompt is broken. Get any of the other four and you would conclude it works. Neither conclusion tells you how often the prompt produces the right travel total, and that is the number you need before relying on it. **One run is an anecdote. A pass rate is a measurement.**

So how do we test something that does not give the same answer twice?

## Evals are acceptance tests for non-deterministic systems

In [Functional Acceptance Testing at the Boundary](/writing/functional-acceptance-testing-at-the-boundary/), we arrange the conditions for a scenario, invoke the system's public operation, and verify the complete outcome the business requires. The test exercises the entire system, end to end, the way it will run in production. That is what gives a team the confidence to go to production.

A unit test exercises a piece of code in isolation. A suite of unit tests can pass without showing that the system meets its requirements.

An eval belongs with acceptance testing. It runs the real prompt against the real model, with the real input files, and grades the real answer. Nothing stands in for the model. The expected values are determined before the run, the system is exercised through its boundary, and the checks examine the outcome the user would receive. That is why an eval's results mean something, and why evals are worth the time and trouble. They give you the same kind of confidence to ship that acceptance tests give you for code.

What changes is the nature of the system. A prompt running on a model varies. So an eval runs each case several times, each in an isolated session, and records a **pass rate** for every check. It then compares each pass rate with a **minimum pass rate** you choose in advance. A check that passes in four of five runs has an 80% pass rate. If your minimum is 80%, that check passes the **gate**.

| | Functional acceptance test | Eval |
| --- | --- | --- |
| System under test | Application code | A prompt or skill running on a particular model |
| Behavior | The same arrangement produces the same outcome | The same input can produce different outcomes |
| Runs per scenario | One | Several, each in an isolated session |
| A single failure means | A defect to fix | One observation contributing to a pass rate |
| Release decision | Every test passes | Every gated check meets its minimum pass rate |
| What a passing result tells you | The system meets its requirements in the tested scenarios | How often the prompt met each requirement in the runs you made |

Look at that last row carefully. An eval does not make a prompt deterministic. A check that passes the gate at 80% tells you the prompt fails that check about one time in five, for that model, at that reasoning effort, on those inputs. You can deploy the skill on that basis, but you deploy it knowing that. The eval spells out the caveats you are accepting.

You must have evals. Without them, nobody knows what they are buying into: not the author of the skill, and not the person relying on it.

The two disciplines also meet in one place. The code that runs an eval is ordinary code, and it gets ordinary tests. The graders that compare amounts, read tool-call logs and calculate pass rates are deterministic. In the repository for this article, more than a hundred tests check that machinery with the model processes replaced by a spy. A one-cent difference passes; a two-cent difference fails. Those tests have to pass 100% of the time.

## What are you buying into?

Part One described two dimensions for deciding how much control a task needs: the consequences of an error, and whether a person verifies the work before its result is used. Evals give those decisions numbers.

At one end, you are exploring your household expenses with a skill, checking the entries and asking for corrections. The stakes are low and a person is in the loop. A skill that gets August travel right four times out of five can still be useful there. The eval also tells that person what to look for: if a run looks wrong, check whether it dropped one of the Delta charges.

At the other end, an organization feeds the results into its accounting records, and nobody checks each run. A prompt that reports the wrong total one time in five is not acceptable. For that work, the eval is the evidence for what Part Two did: put imperative code in charge, and use models only for bounded judgments that code can check. Those judgments still vary, so they need evals of their own. In Part Two, Jev chooses the transaction amount when a line contains two numbers, and an LLM extracts what remains unresolved. How often does Jev choose correctly, and how often does the LLM? Those answers tell you where to set the probability threshold and how often a line will be routed for further work.

A person in the loop does not change that preference for business work. A reviewer's time matters too. I want the process to get as much right as possible, so the person verifies the result instead of correcting it. That still means code in charge, with the model asked only for the semantic judgment the code cannot make, returned as structured data that code checks and acts on.

Notice what decides the stakes. Some advice scales the process with the size of the change: a small tweak gets a quick check, and a production change gets the full review. Size is the wrong measure. Changing how one merchant is categorized is a small change, and if the results feed an organization's records, a miss is expensive. Ask what a miss costs and who pays for it.

Then consider someone else's skill. Which model was it evaluated on, and at what reasoning effort? You may subscribe to Anthropic while its author uses OpenAI, or the other way around. The threshold its author was happy with may not be one you are willing to live with. When you use a skill you did not write, you inherit its failure rate. If nobody measured it, you inherit a failure rate nobody knows. Your own skills are no different. If you have not measured them, you do not know their failure rate either.

Models do not stand still either. A new version arrives every month or two, and your skill was written and tested against the one you used at the time. Does it still work on the new model, which is hopefully smarter? Does it work on a cheaper model you would like to use? Which reasoning effort does it need? Higher effort costs more and takes longer, and the eval tells you the lowest effort at which the skill still passes. Maybe the skill needs changes to work with the newer version. An eval answers those questions in an afternoon. Run the same suite against the new model and compare the scorecards. You find out what you would be compromising on before your users do.

That makes an eval the regression suite for a prompt. Change the prompt, change the model, change the reasoning effort, then run the eval again.

## Prompts inside a product

Part of the problem is the word. "Skill" sounds like something the model has acquired. A skill is a prompt, sometimes with some code attached, and everything we measure in this article applies to it.

Before evals had a name, I was writing them for prompts inside a product. The prompts extracted metadata from documents, and each prompt had its own set of tests, run several times against the model we used in production. That model was first GPT-3.5 Turbo and later GPT-4o. When I tweaked a prompt to fix one metadata item that kept coming out wrong, the tests for the other items told me whether I had gone backwards.

The tests earned their keep every time the model changed. When Azure deprecated GPT-3.5 Turbo and we moved to GPT-4o, the prompts needed rework before they performed within the bar I had set. For some items that bar could be lower; for others it needed to be higher. I also ran the same tests against newer OpenAI models and Claude Sonnet, models we could not use in production, to see whether a stronger model found what GPT-4o was missing. Then Azure deprecated GPT-4o, and our hand was forced again. GPT-5.2 and GPT-5.3 were reasoning models and needed their own versions of the prompts, maintained separately. They also took much longer to respond, so time became one more thing to measure. Could I simplify a prompt to cut the time and still get the results I needed?

<div class="article-callout" role="note" aria-label="Note">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#note"></use></svg>
  <div class="article-callout__content">
    <p><strong>Model changes never stop.</strong> Azure, Anthropic and OpenAI all retire models, so a prompt in a product keeps moving to new ones. You will also keep looking for a cheaper option.</p>
    <p>I treat evals as a certification ladder. When a new model arrives, run the evals across the models and reasoning efforts available to you. Pick the cheapest combination that meets every threshold you require, consistently. Then confirm that the more expensive models and higher efforts also meet them. A prompt certified once, on one model, is a one-time result. Certification is something you repeat.</p>
  </div>
</div>

That is the job evals do, whatever you call them. And notice where those prompts lived: inside an application, doing work the business depended on.

Skills work well in the right context. I use skills in my own work, in a developer's inner loop, where I check the output before it goes anywhere. In that context, a skill that is usually right saves me time, and I know its caveats because I wrote it. The trouble starts when the same skill moves into a different context: inside an application, running unattended, with customers depending on the result. I am watching colleagues being sold skills as though they were ready for that context. Experience is beside the point here. The mistake is treating two different contexts as one.

The same question applies to the people who write skills. Much of the popular advice comes from people who build tools for developers. Their users are experts who notice bugs, work around them and upgrade every week. That is a legitimate context, and a skill tuned for it can serve it well. A business whose customers depend on the result being right is a different context. Before you adopt someone's skills, ask what they build and who carries the cost when a skill misses.

An eval tells you which context a skill is ready for. Without one, a skill is a reassuring description of what it is supposed to do.

## Make the model prove its answer

If the threshold someone else accepted is not one you can live with, how do you get more consistent results? Part Two gave the largest part of the answer: put code in charge and give the model the smallest judgment the code cannot make. There is a second technique I use within each model step. Make the model prove its answer.

Suppose a model has to find a transaction's amount. I do not ask for the amount alone. I also ask which line it found the amount on and the exact text it took it from. If it found nothing, I ask where it looked and what it found instead. Some of that evidence code can check: does that line exist, and does it contain that text? The rest, such as the reasoning, code cannot verify. I keep it anyway, saved with the result as a record we can examine if a question comes up later.

The same applies to adversarial prompts, the ones that ask a model to find what is wrong. "This code is wrong" is worthless on its own. Where is it wrong? On which line? Why, and what would be better? Code can check that the line exists and contains what the model is calling out. The explanation and the suggested fix go into the saved evidence.

In my experience, requiring that proof also makes the model do a better job. It cannot hand back an answer without showing where it came from. And when it does get something wrong, the evidence shows you where to look.

Then measure the result. Whether proof requirements improve your prompt on your model is a question an eval can answer.

## The eval suite is data

Let's look at how this eval is built. I'll use the simplest version, a single Python file you can read top to bottom. It reads an eval suite folder:

```text
evals/expense_analysis/
  eval_suite.json                    the prompt variants, the cases and the checks
  prompts/
    standard.md                      the standard prompt from Part One
    robust.md                        the more precise prompt from Part One
    robust_tables_first.md           the precise prompt with an explicit reply order
  cases/june_august_2026/
    inputs/                          the only files a trial session ever sees
      personal_expenses.txt
      budget_notes.txt
    expected_facts.json              the expected answers
    reference_ledger.json            the expected answers, entry by entry
    expense_reference_key.md         the reference key, for people
  grading/
    fact_extraction_instructions.md
    fact_extraction_schema.json
    rubrics/                         one rubric per judged check
```

The input files are exactly the ones from Part One. The expected values come from a reference key computed independently from the expense log in Python. Where the log supports more than one reasonable policy, the key accepts each one, provided the answer discloses which it used. The August 16 Uber charge is an example. It could be part of the trip or ordinary transport, so the key accepts both travel totals:

```json
"travel_august_total": ["1655.92", "1631.82"]
```

Keep the expected values where only the grading code can read them. Every file in `inputs/` is copied into the trial's working folder, where the model can open it. An answer key in that folder would turn the eval into a reading test. The loader refuses an eval suite that places a graded file inside `inputs/`.

`eval_suite.json` wires these files together. It defines 16 checks. Here are three of them:

```json
{
  "check_name": "travel-august-total",
  "grader": "amount",
  "fact_name": "travel_august_total",
  "minimum_pass_rate": 0.8,
  "description": "August travel is $1,655.92 (or $1,631.82 if the 8/16 Uber stays in transport)."
},
{
  "check_name": "code-executed",
  "grader": "tool_use",
  "tool_kind": "shell",
  "tool_input_pattern": "\\bpython",
  "minimum_pass_rate": 0.8,
  "description": "Totals were computed by running Python, not by mental arithmetic (read from the tool-call log)."
},
{
  "check_name": "tables-before-interpretation",
  "grader": "judge",
  "rubric_file": "grading/rubrics/tables_before_interpretation.md",
  "minimum_pass_rate": 0.8,
  "description": "Computed tables appear before the interpretation."
}
```

Each check names its grader and its minimum pass rate. The other checks cover the dining totals, the August dining budget, the refund, July shopping, the duplicate, both Delta charges, the eight uncategorized transfers, the largest month-over-month increase, transfers not being forced into a category, three supported findings, and no invented budgets. Most of them come straight from the checklist at the end of Part One.

The suite also names its **gated** variant, the prompt whose pass rates decide whether the eval passes. The other prompts run alongside it for comparison.

Here is the whole path from the eval suite to the gate. The next three sections follow it step by step.

<figure class="article-diagram">
  <img class="article-diagram__image" style="max-width: 640px;" src="/images/diagrams/expense-analysis-eval-flow.svg" alt="The eval suite defines prompt variants, cases and checks. Each variant runs N times, each run in an isolated session. Every answer and its event stream is saved. A model extracts amounts and code decides them, code reads the tool-call log, and a judge applies a rubric. Pass rates form the scorecard, and a pytest assertion requires every gated check to meet its minimum pass rate." loading="lazy" />
  <figcaption>Every run is isolated and saved. A model extracts the reported amounts and code decides whether they are correct; code reads the tool-call log; a judge applies a rubric only where code cannot decide. The pass rates from every run feed the scorecard and the gate.</figcaption>
</figure>

## Act: one isolated session per run

Each run starts a brand-new Claude Code session with `claude -p`, in a temporary folder that contains only the two input files. Look at the flags:

```python
def build_claude_command(session_request: SessionRequest) -> list[str]:
    command: list[str] = [
        "claude", "-p",
        "--model", session_request.model,
        "--effort", session_request.effort,
        "--restricted",               # ignore the user's settings, plugins and hooks; confine file tools to the folder
        "--strict-mcp-config",        # no MCP servers
        "--disable-slash-commands",   # no skills
        "--no-session-persistence",   # keep eval sessions out of the user's history
        "--permission-mode", "dontAsk",
        "--tools", ",".join(session_request.tools),
        "--output-format", "stream-json", "--verbose",  # one JSON event per line, including every tool call
    ]  # fmt: skip
    # Under the dontAsk permission mode the CLI denies every call to a tool that is available but not pre-approved,
    # so the same tool list must be repeated as --allowedTools.
    if session_request.tools:
        command += ["--allowedTools", ",".join(session_request.tools)]
    if session_request.json_schema:
        command += ["--json-schema", session_request.json_schema]
    return command
```

Most of these flags exist to remove my environment from the measurement. If the session picked up my settings, my installed skills, my MCP servers or my history, the eval would measure my setup instead of the prompt. Every run is independent: nothing from the previous run is available to the next one. The model and the reasoning effort are fixed for the whole eval, because a result only means something when you know what produced it.

The session gets a short list of tools: a shell, and tools to read, write, edit and find files. The prompt asks for code, so the model needs somewhere to run it.

`--output-format stream-json` matters for grading. The session reports one JSON event per line, including every tool call the model made and the result it received. The eval keeps that event stream beside the final answer, so the evidence for each run is on disk after the run.

The same eval suite also runs in OpenAI's Codex CLI, using `codex exec` with equivalent isolation. That is how the GPT models in the results below were evaluated. The one-file version shown here drives Claude Code only.

## Assert: the model extracts, code decides

Now we have an answer. How do we grade it?

The tempting approach is to ask another model whether the answer is right. But a model grading arithmetic is one more non-deterministic answer we would have to verify. ***Verified, not trusted*** applies to the grader too.

So the amounts are graded in two steps. First, a separate session with no tools reads the answer and fills a JSON schema with the facts the checks need, such as `travel_august_total` and `refund_treatment`. That model only reports what the answer says. Then code decides whether each reported value is correct:

```python
def is_amount_accepted(actual_amount: str | None, expected_amounts: Iterable[str]) -> bool:
    if actual_amount is None:
        return False
    try:
        amount: float = float(actual_amount.replace("$", "").replace(",", ""))
    except ValueError:
        return False
    return any(abs(amount - float(expected_amount)) <= AMOUNT_TOLERANCE for expected_amount in expected_amounts)
```

An answer that never states the total fails. So does an answer whose total is not a number, or one that differs from every accepted value by more than one cent. The extractor can misread an answer, and when it does, the extracted facts saved with the run show exactly what it read. What it cannot do is decide that $1,219.22 is close enough.

The `code-executed` check reads the tool-call log. Part One pointed out that displayed code does not prove it ran. This check does not look at the answer at all. It looks at the shell commands the session actually executed and passes only when a command matching `python` ran successfully. An answer that shows code it never executed fails this check, however convincing the code looks.

The prompt says "show the code" and "Don't estimate totals or do the arithmetic in your head." Instruction is not assurance. In these recorded runs, every session did run Python, and we know that from the log. The prompt's request alone would not tell us.

Some requirements need judgment. Did the computed tables come before the interpretation? Are there exactly three findings, each supported by the numbers? For those, a judge session applies a written rubric. Here is part of the rubric for the findings:

```text
PASS if the answer gives exactly three findings (a finding may have supporting sub-points), and every number
or claim in them agrees with the answer's own tables and does not contradict the reference facts under the
policy the answer used.

FAIL if there are more or fewer than three findings, or any finding states a number or trend that contradicts
the answer's tables or the reference facts (for example "dining has been over budget every month").
```

The judge is a model, so its verdicts vary too. Use a judge only where code cannot decide, and write the rubric as precisely as the checks you would write in code.

One more distinction matters. When a session crashes or times out, its checks are recorded as **errored**, a status of their own. An errored check still counts against the pass rate, because the run produced nothing usable, but the scorecard lists it separately. A failure in your infrastructure should never read as a weakness in the prompt.

## Pass rates and the gate

After every run is graded, the pass rate for each check is a simple division:

```python
@dataclass(frozen=True)
class ScorecardRow:
    check_name: str
    variant_name: str
    minimum_pass_rate: float
    run_count: int
    passed_count: int
    errored_count: int
    is_gated: bool

    @property
    def pass_rate(self) -> float:
        # An errored check is not a pass, so it stays in the denominator, as in the library's scorecard.
        return self.passed_count / self.run_count if self.run_count else 0.0

    @property
    def meets_minimum_pass_rate(self) -> bool:
        return self.pass_rate >= self.minimum_pass_rate
```

The eval is a pytest test, and it ends with an ordinary assertion:

```python
actual_gated_rows: list[ScorecardRow] = [scorecard_row for scorecard_row in actual_scorecard_rows if scorecard_row.is_gated]
actual_rows_below_minimum: list[ScorecardRow] = [gated_row for gated_row in actual_gated_rows if not gated_row.meets_minimum_pass_rate]
assert not actual_rows_below_minimum, (
    f"{len(actual_rows_below_minimum)} of {len(actual_gated_rows)} gated checks are below their minimum pass rate:\n"
    + "\n".join(describe_row_below_minimum(scorecard_row) for scorecard_row in actual_rows_below_minimum)
)
```

Here the eval and the acceptance test look alike again. The assertion is binary. What it asserts is different: every gated check met the minimum you chose, across the runs you made. Before the assertion, the eval writes a scorecard with the pass rate of every check for every prompt variant, so a failing gate tells you which checks fell short and by how much.

## What the runs show

Each run below used medium reasoning effort, and each answer was graded in Claude Code by Sonnet at low effort. The recorded runs in the repository were produced by the library version of this eval, which reads the same eval suite and applies the same checks.

First, the three prompts on the same task:

| Prompt | Claude Opus 5.5, 5 runs | Claude Sonnet 5.5, 5 runs |
| --- | --- | --- |
| Standard | Fails: uncategorized transfers 0/5, largest increase 2/5, three findings 3/5, August travel 4/5 | Fails: uncategorized transfers 0/5, largest increase 2/5, three findings 2/5, tables first 3/5, August travel 3/5 |
| More precise | Fails only tables before interpretation, 0/5 | Fails only tables before interpretation, 1/5 |
| Precise, tables first | Passes, every check 5/5 | Passes, two checks at 4/5 |

The standard prompt fell short where Part One said it leaves decisions unstated. The answers kept the transfers and cash withdrawals apart from spending; Opus, for example, grouped them under "Transfers & cash." But in no run did either model identify the eight entries whose purpose the log does not state. The standard prompt never asked for that, and the eval checks it. The findings and the month-over-month comparison also missed in several runs.

The more precise prompt fixed every analysis problem. Its one remaining failure is instructive. Step 5 of that prompt says, "Show me the computed tables before your interpretation." Opus led with its conclusions in all five runs anyway. That is **instruction is not assurance**, measured: the instruction was in the prompt, and the models did not reliably follow it.

The third variant changes only the reply order, stating explicitly that the tables come first. With that change, Opus passed every check in every run.

This is the comparison to ask of any skill pack: does the model do better with the instructions than without them, across repeated runs? Skill packs are often promoted in two directions at once. Models skip steps, so every skill should anticipate their excuses. Models are now smart enough, so prune your skills. Either can be true for a particular model and task. An eval with and without the skill tells you which.

Next, six models on that final prompt:

| Model | Assistant | Gate | Below 5/5 |
| --- | --- | --- | --- |
| Claude Opus 5.5 | Claude Code | Passed | none |
| GPT-6.1 Sol | Codex | Passed | none |
| GPT-6 Astra | Codex | Passed | none |
| Claude Sonnet 5.5 | Claude Code | Passed | both Delta charges kept 4/5, August travel 4/5 |
| Claude Haiku 5.5 | Claude Code | Failed | uncategorized transfers 2/5, August travel 3/5, three more checks at 4/5 |
| GPT-6 Luna | Codex | Failed | July shopping 0/5, August travel 0/5, three findings 0/5, four more checks below 5/5 |

Sonnet's two misses are the third run we started with: one mistaken duplicate, counted once by the Delta check and once by the travel total. Below Sonnet and Astra, the problems change character. Haiku and Luna make analysis errors. Haiku moved IKEA out of Shopping in one run and merged Transport and Travel into a single category in another. Luna counted pharmacy purchases and Amazon Prime as Shopping and left travel charges out of the travel total. A more precise prompt helps less there than a more capable model.

Five runs is a small sample. It is enough to see that the standard prompt cannot be relied on to leave transfers uncategorized, and that Luna is not ready for this task. It is not enough to promise that a 5/5 check never fails. If you need tighter numbers, run more repetitions. The cost is time and usage, and that cost is small compared with discovering the failure rate in production.

## When a check fails, the eval should tell you why

When a functional acceptance test fails, its message tells you what was expected and what happened instead. The first version of this eval only did half of that. A failed amount check said "reported 1219.22; expected 1655.92 or 1631.82." A failed findings check quoted the judge: June shopping of $1,068.35 contradicts the reference value of $1,020.77. Both describe what went wrong. Neither says why, so someone had to reconcile 198 expense lines by hand to find out.

Since we already know the correct answer, the eval should be able to explain a wrong one. So the reference key also exists entry by entry. `reference_ledger.json` lists every line of the expense log with its category, any other category an accepted policy allows, and whether it counts toward a total. The duplicate Trader Joe's entry is in the ledger, marked as not counted.

When a total is wrong, code searches the ledger for the fewest entry mistakes that add up exactly to the difference: a reference entry left out, an entry from another category counted in, the duplicate counted, or the refund counted as a purchase. It first applies any accepted policy that brings the reference closer to the answer. Here is the cause it recorded for one of Haiku's runs:

```text
Travel 2026-08: reported 1,563.82, reference 1,631.82 (under the accepted policy 'August 16 Uber in Transport'),
a difference of -68.00. Explained by: left out line 169 "Airport Parking - $68.00 (August 14)" (-68.00).
```

That is a failure message we can act on. The search is deliberately conservative. Among dozens of entries, three arbitrary amounts can add up to almost any difference by coincidence, so beyond two mistakes it only considers plausible ones. When nothing simple explains the difference, it says so instead of guessing.

Judged checks get the same treatment. The judge is asked to quote any amount it rejects and the reference value it compared it with. Code then traces that amount in the ledger. The judge never explains the cause itself, so the explanation is not one more model's opinion.

The scorecard groups these causes across runs. One cause appearing in several runs points to a systematic mistake.

<figure class="article-diagram">
  <img class="article-diagram__image" style="max-width: 640px;" src="/images/diagrams/expense-analysis-failure-trace.svg" alt="A reported total and the entry-by-entry reference ledger feed a search in code. Code applies any accepted policy that brings the reference closer, computes the difference, and searches for the fewest entry mistakes that add up exactly to it. It reports the cause, such as a left-out Airport Parking line, or says that no simple cause was found. The scorecard groups causes across runs." loading="lazy" />
  <figcaption>Code compares a wrong total with the reference ledger and looks for the fewest entry mistakes that explain the difference. When nothing simple explains it, the eval says so.</figcaption>
</figure>

## Sometimes the eval is wrong

It can also point to a mistake in the eval.

When we first graded the runs, GPT-6.1 Sol and GPT-6 Astra failed the findings check in several runs. Every one of those failures traced to the same line:

```text
Shopping 2026-06: reported 1,068.35, reference 1,020.77 (under the accepted policy 'Barnes & Noble in Shopping'),
a difference of +47.58. Explained by: counted line 16 "June 4: Steam, 47.58" (+47.58), which the reference puts in Entertainment.
```

Steam is a store that sells games. The reference key put it in Entertainment. Both models had put it in Shopping and said so in their answers. That is the same kind of judgment as treating books as Shopping, which the key already accepted. The models were applying a reasonable, disclosed policy, and the eval was marking them wrong for it.

So the fix belonged in the key. Steam in Shopping became an accepted policy, the ledger and the rubric were updated, and the recorded answers were graded again without running the models a second time. Sol and Astra now pass every check.

The episode taught us something about the judge as well. Astra's answers had passed the findings check in all five runs when they were first graded, Steam included. Graded again against the same key, with the judge now also asked to quote the amounts it disputed, three of the five failed. A grader that is a model needs the same skepticism as the model it grades. Keep as much of the grading in code as you can, and pay attention when a judged check changes without a reason.

An eval tests your expectations as well as the prompt. When several strong models fail a check the same way, with the same disclosed reasoning, look at the expected answer before you rewrite the prompt.

## Run it yourself

The complete eval suite, the one-file eval and the recorded results are in the [Skills and Evals repository](https://github.com/matlus/Skills-and-Evals). Every recorded run includes the scorecard, each model's answer, the full session event stream, and the grade for every check.

With Python 3.14, [uv](https://docs.astral.sh/uv/) and a signed-in Claude Code installation, this runs the one-file eval with five runs of each prompt on Sonnet:

```bash
uv sync --all-packages --all-groups
uv run pytest evals/minimal -s --eval-model sonnet --eval-effort medium --eval-repetitions 5
```

The test writes a scorecard and one folder per run under `results/minimal/expense_analysis/`, and it fails if any gated check falls below its minimum pass rate. Each run takes a minute or two.

To evaluate one of your own skills, start with the folder structure above. Choose a few realistic cases, write down the expected results before running anything, decide which checks code can grade, and pick a minimum pass rate that suits the stakes.

## Put a label on every skill

Here is what I would like every skill to ship with: a short label stating its caveats. The intended context, whether a person is expected to check the result, the models and effort levels it was evaluated with, the results, the known failure modes, and what a run costs. If it has never been evaluated, the label should say so.

This is the label for the final expense-analysis prompt in this article:

| Caveat | This prompt |
| --- | --- |
| Intended context | Exploring your own expenses, with you checking the result. Not for unattended accounting. |
| Person in the loop | Assumed |
| Evaluated with | Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5 in Claude Code; GPT-6.1 Sol, GPT-6 Astra and GPT-6 Luna in Codex. Medium reasoning effort, 5 isolated runs each. |
| Results | Opus, Sol and Astra pass every check in every run. Sonnet passes, with two checks at 4/5. Haiku and Luna fail. The scorecards are in the repository. |
| Known failure modes | Can treat two same-day charges with different amounts as duplicates. Weaker models put pharmacy purchases and subscriptions in Shopping, leave travel charges out of the travel total, or merge Transport and Travel. |
| Not evaluated | Other expense logs, longer periods and other currencies. |
| Typical cost | About a minute or a minute and a half per run. Claude Code reports about $0.35 per run on Opus 5.5 and $0.18 on Sonnet 5.5, before grading. |

That is mine. Where is yours?

The next time someone offers you a skill, ask for its label. If the answer is "I use it every day and it works great," you have heard about some good answers. You have not been given a measurement.

The same applies to your own skills. Every time you change the prompt or move to a new model, run the eval again and read the scorecard before you rely on the result.

In Part Four, we put the directed graph from [Verified, Not Trusted: Expense Analysis, Part Two](/writing/verified-not-trusted-expense-analysis-part-two/) through these same evals. Code controls every step there, and a model makes only the judgments code cannot. How much does that raise the pass rates over the more precise prompt from Part One?

***Verified, not trusted.*** Trust follows the evidence, and for a prompt, the evidence is a measured pass rate.
