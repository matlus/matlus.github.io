---
title: Skills versus Controlled Workflows
description: >-
  Stakes and human verification determine where workflow control belongs. Explicit
  prompts guide a model; imperative code enforces steps, checks, and use of results.
datePublished: 2026-06-19
dateModified: 2026-10-09
tags:
  - prompting
  - verification
  - verified-not-trusted
  - agent-orchestration
  - code-review
  - ai-workflow-patterns
hero: controlled-workflows
diagrams:
  - controlled-workflow
related:
  - verified-not-trusted-expense-analysis-part-one
  - verified-not-trusted-expense-analysis-part-two
status: established
---

<!-- audit-allow: Verified, not trusted -->

Suppose you ask an AI assistant to analyze your expenses. It organizes the transactions, calculates totals, and explains where your spending increased. You check the entries, question a category, and ask it to recalculate. A prompt or skill can be perfectly reasonable for that job.

Now suppose those results feed an organization's accounting records automatically. Nobody checks each run before the next system uses the answer. A missed transaction or an incorrect total can affect business decisions. Would you leave the model in charge of deciding which checks to perform and whether the work is complete?

I would not. For unattended work with serious consequences, I will not accept "it usually gets it right" as the basis for correctness.

That gives us a spectrum to work through. At one end, the stakes are low and a person verifies the work before using it. At the other, the stakes are high and execution is fully automated. Between them are useful combinations of explicit instructions, tested tools, human review, and application controls.

To choose among them, we need to understand what improves as a prompt becomes more precise, what remains under the model's control, and what changes when imperative code takes charge.

<span id="7-choosing-an-approach"></span>

## The stakes and the person in the loop

There are two dimensions to consider: the consequences of an error, and whether a person verifies the work before its result is used. They often move together in these examples, but they are separate decisions.

| | A person verifies before use | Nobody verifies each run before use |
| --- | --- | --- |
| Low stakes | A prompt or skill can support exploration, with the person checking and correcting the work. | A prompt may still be sufficient for disposable output. Add controls for failures that matter, including repeated errors and unexpected cost. |
| High stakes | Use executable checks for mandatory obligations and give the reviewer the evidence and authority to stop the work. | Put imperative code in charge of required steps, validation, and acceptance. Delegate only bounded judgments to models. |

The personal-budgeting example belongs in the first cell because we are exploring a household budget and checking the result. A system that changes financial records or makes consequential decisions belongs elsewhere, even if its input looks like the same expense table.

Human involvement also needs to mean something. A person who sees a polished report and clicks Approve has not necessarily verified it. The reviewer needs access to the source entries, assumptions, computed results, and unresolved issues, with time to examine them before the result takes effect.

Increasing the stakes demands stronger evidence. Removing the reviewer means the application must perform the required checks, or stop when it cannot establish what it needs. A human checkpoint can be part of a controlled workflow. An unattended workflow needs an explicit failed, incomplete, or unresolved outcome when the conditions for acceptance are unmet.

For worked examples of this spectrum, see [Verified, Not Trusted: Expense Analysis, Part One](/writing/verified-not-trusted-expense-analysis-part-one/) for the prompt comparison and [Verified, Not Trusted: Expense Analysis, Part Two](/writing/verified-not-trusted-expense-analysis-part-two/) for the Python-controlled workflow. Let's use that same expense-analysis task here to see where control resides.

<span id="1-start-with-a-fair-comparison"></span>
<span id="2-three-approaches-rather-than-a-binary-choice"></span>

## Three ways to organize the same work

A **skill** packages instructions, domain knowledge, and supporting resources. Those resources can include executable scripts. A **workflow** describes the procedure for doing the work. A skill can describe a workflow or invoke an application that implements one.

Coordinating the steps, their inputs, and what happens after each result is **orchestration**. The **controller** carries out that orchestration. In a model-controlled session, the model chooses actions to request, examines their results, and decides what to do next. That repeated process is the **control loop**.

Here are three arrangements we can use for the expense task:

| Approach | What we supply | Who controls progression? |
| --- | --- | --- |
| General prompt or skill | The goal, relevant knowledge, and the desired output. | The model works out much of the procedure as it goes. |
| Explicit procedural prompt or skill, with tested helpers where useful | The sequence, conditions, ambiguity and failure rules, required evidence, and maintained code for particular operations. | The model remains the controller, now following a much more explicit procedure. Helpers enforce their own local rules when invoked. |
| Imperative controller with bounded model steps | Code implementing the sequence, permitted branches, validation, retries, stopping, and result assembly. Prompts define the particular judgments delegated to models. | Application code controls progression and acceptance. Models answer assigned questions within that flow. |

The middle option improves the instructions as well as the tools. Adding a Python script to a vague prompt leaves many decisions unstated. We should first make those decisions explicit, then use tested code for operations whose behavior we can define.

These arrangements are compatible with skills. A skill can be the entry point to all three. The useful question is who controls execution after the skill has been invoked.

## First, ask for the result

Consider this prompt:

```text
Here are our quarterly expenses and budgets. Calculate spending by category,
determine which categories exceeded budget, find unusual changes, and explain
what happened.
```

It communicates the goal. It leaves the method largely to the model.

Before it can calculate a total, something has to decide which source lines are transactions, how to interpret dates and negative amounts, which category to assign, and what to do with repeated entries. The model may handle those questions well. The prompt has left it to discover and resolve them during execution.

For example, two identical entries might be an accidental duplicate or two separate purchases. A transfer with a date and an amount may still have no known spending purpose. A refund must preserve its negative sign. Correct addition cannot repair a mistake in any of those earlier decisions.

If you are examining the result yourself, you can ask about those decisions and correct them. That can be a useful interactive session. It also shows us what to improve in the prompt.

## Then, specify the procedure and its unresolved cases

For the second approach, suppose we have a documented category policy and maintained helpers for validating transactions and calculating totals. We have reviewed and tested those helpers against independently specified expectations. The following is an illustrative prompt for that setup; it assumes those resources have been supplied.

```text
Analyze the attached expense log and budget notes using the supplied category
policy and the documented validation and calculation helpers. Follow this order:

1. Account for every source line. Preserve its line identifier and original text.
   Extract the transaction date, description, and signed amount. Record any
   excluded non-transaction text with its reason. If a date or amount cannot be
   resolved from the source, list the issue and stop for clarification before
   calculating a final total.

2. Apply the supplied category policy. Keep transactions whose purpose is unknown
   explicitly uncategorized. Do not invent a category or budget to fill a gap.
   If the policy leaves a material choice unresolved, explain the choice and ask
   for clarification before proceeding.

3. Flag possible duplicates without silently deleting them. Apply the policy's
   rule for confirmed duplicates. If confirmation is required and unavailable,
   stop and ask. Preserve refunds as negative amounts under the net-spending rule.

4. Show the prepared transactions, exclusions, and unresolved issues. Run the
   supplied validation helper on those transactions. If validation fails, report
   the failure and resolve it before calculation. Do not bypass a failed check.

5. Call the supplied calculation helper with the validated transactions and
   stated budgets. Use it without replacing or rewriting its implementation.
   Show the inputs used and the returned category totals, budget comparisons,
   and monthly changes. If an input changes, repeat validation and calculation.

6. Explain three findings supported by those returned results. Preserve their
   amounts in the report and identify the supporting rows. Distinguish possible
   explanations from facts established by the log. Check the report against the
   returned results before declaring the analysis complete.
```

Notice how much more we have supplied than "use Python." We have specified prerequisites and order. We have described conditions that change what happens next. We have given ambiguity a defined outcome. We have required recalculation after a correction and a comparison between the computed result and the report.

Those rules apply to classes of input. "Flag possible duplicates and follow the confirmation policy" works beyond one particular log. "Delete row 108" would encode a decision about a particular dataset. Likewise, preserving signed amounts handles refunds generally; naming one merchant's known refund would leave the underlying rule unstated.

The category policy and helper contracts must be explicit too. "Clean the data" or "handle errors appropriately" would merely move the same unanswered questions into shorter phrases. We cannot enumerate every possible input, but we can say what to do when the supplied rules do not resolve one.

This prompt deliberately includes human clarification because it serves an interactive analysis. For an unattended run, unresolved cases need a defined stopping or exception-handling policy. Replacing "ask me" with "use your best judgment" would delegate that decision back to the model.

The second approach is therefore a more constrained, model-controlled workflow. We prescribe the procedure in much greater detail, but the controller carrying it out is still a model.

<span id="11-code-generated-during-execution"></span>

### What tested Python adds

There is a separate improvement in supplying maintained code. Asking the model to generate a calculation script during each run also asks it to decide how that calculation should be implemented. It can choose an incorrect rule and then execute it successfully.

Part One's recorded expense-analysis code illustrates this: it assigns months by line position despite an instruction to parse dates. Python executes the chosen implementation. Execution alone does not establish that the implementation matches the requirement.

Reviewed, tested, versioned helpers let us fix those implementation decisions outside the individual prompt run. Generated code can become such a helper after it has gone through those checks. Tests need expectations derived from the requirements; tests generated from the same mistaken assumption can pass alongside an incorrect implementation.

Supplying tested code improves the operation performed by the helper. It leaves the model responsible for calling it with the intended inputs, handling its failure, and using its returned values.

## Instruction is not assurance

Suppose the calculation helper returns $398.69 for August dining. The model could put $389.69 in the report, reuse a total from before a correction, or compare the wrong value with the budget. The helper could have worked perfectly in all three cases.

There is also the earlier possibility that the helper was never called. Showing code in an answer does not establish that it executed. Saying "all checks passed" does not establish which checks ran or what they examined.

**Instruction is not assurance.** An instruction can go unperformed. It can also be performed incompletely while the model reports success. The stronger prompt gives us a better procedure to follow and inspect, but it cannot establish its own execution.

For the expense analysis, we need evidence for this chain:

1. The intended operation ran.
2. It received the intended inputs.
3. Its result passed the required checks.
4. Subsequent operations used that checked result.
5. The delivered report preserved the result and its qualifications.

A successful tool call accounts for only part of that chain. The model can still skip a later check or disregard a returned value, even after being explicitly told what to do.

This is where ***Verified, not trusted*** applies. We accept a claim when the evidence and checks support it. A model's confidence, its statement that it followed the procedure, and agreement between several models cannot replace that evidence. Verification also has a scope: reproducing totals from a supplied log does not establish that the log contains every real-world expense.

For low-stakes work, a person may perform enough of this verification to make the prompt-based approach appropriate. At the high-stakes, unattended end, those obligations belong in the application.

<span id="what-we-mean-by-a-controlled-directed-graph-workflow"></span>

## Put imperative code in charge

In the third approach, we write the control flow in Python. The application calls the required operations, supplies their inputs, checks their outputs, and decides whether execution can proceed. It also builds the authoritative result from the accepted values.

The expense procedure can be represented as a **directed graph**. Its nodes are steps, and its arrows show permitted transitions and dependencies:

```text
Read and identify source lines
    -> parse and validate transactions
    -> classify where the supplied rules need semantic judgment
    -> reconcile coverage, categories, refunds, and duplicate decisions
    -> calculate totals and budget comparisons
    -> validate proposed findings against computed evidence
    -> assemble the report from accepted records

A failed check follows its defined failure path.
A permitted correction returns to the relevant earlier step and repeats
the dependent checks. Retry limits determine when that cycle must stop.
```

The graph can contain cycles. An invalid model response might trigger a bounded correction attempt followed by validation again. A changed transaction must flow through reconciliation and calculation again before the report can use it. Python owns the retry conditions, attempt limits, and final outcome.

We do not need a large graph framework to do this. Ordinary methods, conditionals, and loops can implement the graph. Drawing boxes gives us a view of the procedure; the code determines what can execute.

For an unattended workflow, failure to establish a required fact prevents a successful result. If human intervention is part of the design, code can hold the work at that checkpoint until the required decision arrives. Human decisions are explicit inputs to progression, rather than an assumption that someone will catch errors later.

### Ask the model for the smallest useful judgment

If Python can calculate a total, compare two values, enumerate records, or enforce a known policy, let Python do it. Use the model where understanding language, interpreting evidence, or making another semantic judgment is necessary.

For example, the controller might supply a transaction's description and the permitted categories, then ask for a category, supporting evidence, or an unresolved response. It does not need to ask that model to prepare the entire quarterly report, choose which checks matter, or decide whether accounting is complete.

Even a bounded response needs validation. Code can check that the transaction identifier exists, the category is allowed, cited evidence belongs to the source, and all required responses are present. A valid category identifier alone does not prove that the classification is correct. Where that judgment matters, the workflow needs additional evidence, a prescribed independent assessment, or a way to leave the case unresolved.

"Smallest useful judgment" refers to responsibility, not an arbitrarily tiny context window. A reviewer may need callers, dependencies, or several source passages to answer one question correctly. Supply enough evidence for that question while keeping unrelated decisions outside the model's authority.

We can narrow report generation in the same way. Python can calculate and retain the amounts, while a model proposes findings tied to specific computed rows. The application checks those references and assembles the authoritative figures directly from the accepted records. Asking a final model to rewrite everything freely would reopen the returned-value problem at the last step.

The worked example in [Verified, Not Trusted: Expense Analysis, Part Two](/writing/verified-not-trusted-expense-analysis-part-two/) follows this separation through a Python implementation. Here, the architectural point is that Python governs the decisions we can specify imperatively, including whether a model contribution is admissible and what happens next.

<span id="3-three-claims-that-should-not-be-confused"></span>
<span id="8-example-exploratory-codebase-evaluation"></span>

## Apply the distinction to code review

Consider a different request:

> Read this repository, understand its structure, and evaluate maintainability, coupling, testability, and clarity.

A skill can supply definitions, investigation guidance, examples, and a report structure. Different runs may investigate different paths and still produce useful advice. A developer can examine the findings before changing the code.

That is a reasonable use of a skill when the deliverable is an informed evaluation. It makes a limited claim about the investigation performed.

Now change the requirement: every relevant code unit must be assessed against every applicable guideline. A useful report alone cannot establish that. We have three distinct claims to consider:

| Claim | What supports it |
| --- | --- |
| The review produced useful findings. | Findings that help explain or improve the code. |
| The required procedure was followed. | Completion of the prescribed assessments and observance of their constraints. |
| We can demonstrate that execution. | Retained inventories, inputs, results, and checks accounting for the required work. |

A report can satisfy the first without establishing the others. That becomes consequential when "no finding" is treated as evidence that a rule was checked and no violation was found.

<span id="9-example-systematic-review-against-approximately-500-guidelines"></span>

### Account for every required assessment

Suppose an organization maintains approximately 500 guidelines across its relevant Python and C# catalogs. A particular class might need 30 or 40 assessments, depending on its responsibilities and code.

<span id="a-strong-skill-still-leaves-an-execution-question"></span>

A strong skill could say:

> Inventory the review units. Determine applicable rules using the supplied criteria. Create a unit-rule matrix, assess every required pairing, retain supporting evidence, and check for missing results. Keep "not applicable," "not reviewed," "unable to assess," and "no violation found" distinct. Report completion only when every required entry is accounted for.

Those are valuable instructions. They identify order, obligations, and incomplete outcomes. If the model constructs the inventory, performs the assessments, and checks its own completion, however, the same omission can survive all three activities.

A controller can maintain the required inventory and compare it with validated returned assessments. If a class requires 40 assessments and only 37 valid results return, three remain incomplete. Duplicate responses cannot satisfy the missing obligations, and an incomplete review cannot qualify as clean.

The unit of accounting is the code-rule pairing. Several pairings can share a model call if the returned results remain individually identifiable. Narrow responsibility does not require one call per item.

<span id="coverage-has-more-than-one-meaning"></span>

There are still three separate things to check:

| Question | What can go wrong? |
| --- | --- |
| Did we identify all applicable rules? | A complete run against an incorrectly narrowed plan misses required work. |
| Did every required assessment return a valid result? | Missing or invalid work may be mistaken for absence of violations. |
| Were the assessments substantively correct? | A structurally complete review can contain mistaken judgments. |

If models help determine applicability, that step needs controls too: mandatory baseline rules, recorded applicability decisions, a defined basis for exclusions, and conservative handling of uncertainty. The same orchestration principles apply across languages, but Python and C# still need their own applicability and interpretation rules.

<span id="10-example-spec-to-test-verification"></span>

### Preserve independence in Spec-to-Test Verification

An exploratory request to find possible gaps between a specification, production code, and tests can be useful as a skill. A prescribed verification protocol can require separate review roles, independent challenges, restricted evidence, and fixed outcome rules.

Suppose every admitted finding must receive an independent assessment without revealing who first proposed it. A prompt can instruct the model to arrange that. A controller can construct the verifier's input, omit the finder's identity, restrict accessible evidence through the host, and account for the required response.

| Requirement | What the controller implements |
| --- | --- |
| Restrict evidence by role | Construct role-specific inputs and restrict available files and tools. |
| Verify every admitted candidate | Retain candidate identities and require corresponding valid assessments. |
| Detect changes to reviewed source | Compare source identities at defined checkpoints. |
| Reject invalid assessments | Validate fields, identifiers, citations, and required evidence. |
| Keep different conclusions distinct | Separate production defects from weaknesses in test evidence and unresolved questions. |
| Preserve accepted judgments | Assemble the report from validated records under defined outcome rules. |

Telling a worker to ignore information leaves that information available to it. Withholding it requires control over both the supplied input and accessible context. A fresh session does not establish separation if shared history or unrestricted tools reintroduce excluded evidence.

Independent assessments can still share model biases. Different model families may offer another perspective, but agreement between them does not prove correctness. The procedure needs rules for evaluating disagreement and retaining unresolved outcomes.

## Design the graph around evidence and dependencies

Multiple boxes in a diagram do not establish that the work should run concurrently. A step must wait for inputs on which it depends. Concurrent workers must also avoid interfering through shared state.

For code review, splitting work by file can hide caller-callee relationships and behavior spanning components. Decomposition should preserve the evidence needed for each assessment, with reconciliation for overlapping or interacting findings.

A protocol might require model families A and B to form separate initial assessments, then have each challenge the other's findings. If initial independence matters, both initial passes must finish before either receives the other's conclusions. The cross-review stage necessarily sees an assigned claim, but need not see its author's identity or unrelated findings.

The controller defines these dependencies, the evidence each role receives, and when further adjudication is permitted. Independent reasoning can run sequentially. Simultaneous execution alone says nothing about independence.

<span id="4-what-determinism-means-in-an-ai-workflow"></span>

## What becomes deterministic?

Putting Python in charge does not make model judgments deterministic. It gives us a stable place to implement the rules governing those judgments and their consequences.

| Property | What imperative control can establish |
| --- | --- |
| Procedural consistency | Required prerequisites, stages, checks, and stopping rules govern each execution. |
| Mechanical operations | The same relevant inputs produce the same result from stable parsing, calculation, and validation code. |
| Policy decisions | The same validated inputs and policy produce the same acceptance or rejection outcome. |
| Semantic repeatability | Model judgments may still vary across runs. |
| Semantic correctness | Evidence checks and independent challenges support a judgment; they cannot guarantee that every interpretation is correct. |

The same transition rules can produce different paths. If one run admits five findings and another admits seven, the number of verification calls changes. Python can still enforce that every admitted finding receives the required verification.

We should expect timestamps, run identifiers, findings, and wording to vary where the design permits it. The requirement is that permitted variation cannot bypass mandatory obligations.

<span id="5-is-this-agentic-autonomy-at-different-levels"></span>
<span id="three-nuances-that-prevent-misleading-labels"></span>
<span id="applying-the-distinction-to-review-and-verification"></span>

## Where autonomy belongs

A model receiving a fixed evidence packet and returning an assessment performs reasoning. If it can also select searches, inspect permitted files, test hypotheses, and choose its next investigative action, it has more autonomy within that assignment.

| Arrangement | What the model may decide | What remains outside that decision |
| --- | --- | --- |
| Controlled workflow with model steps | A bounded classification, assessment, or transformation. | Required stages, evidence boundaries, validation, and completion. |
| Controlled workflow with bounded agents | How to investigate an assigned question using permitted actions. | The overall protocol and the obligations each investigation must satisfy. |
| Agent-directed workflow | How to plan and revise the broader procedure toward a goal. | Whatever permissions, budgets, acceptance checks, and stopping rules the host enforces. |

For the review example, Python can require all 40 assessments while an investigator chooses how to examine each one. That worker can follow callers and challenge an apparent violation without gaining authority to omit an assessment or declare missing work complete.

Broader planning can be useful when diagnosing an unfamiliar failure. Discovering which components matter and revising hypotheses may be part of the job. At the consequential end of our spectrum, that investigation still needs externally enforced acceptance checks before its proposed repair can take effect.

A directed graph can contain such an investigation loop. Branches and cycles also exist in ordinary programs. The graph's shape, worker count, and model family do not tell us who has authority to choose the next substantive action.

Anthropic's [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) makes a related distinction between predefined workflows and agents that dynamically direct their process and tool use. Naming the actual authority granted to the model is more useful here than treating "agentic" as a measure of quality.

<span id="6-benefits-costs-and-limitations"></span>
<span id="12-where-a-controllers-assurance-ends"></span>

## The cost of control and the limits of assurance

A controller requires engineering. We have to define contracts, implement the procedure, test failure paths, maintain integrations, and retain evidence. A prompt is easier to revise while we are still discovering what the procedure should be.

| Approach | What we gain | What we still have to account for |
| --- | --- | --- |
| General prompt or skill | Flexible exploration and a quick way to apply domain knowledge. | The model chooses much of the method; the result needs review appropriate to its use. |
| Explicit procedure with tested helpers | Fewer unstated choices, inspectable intermediate work, and stable implementations of particular operations. | The model still controls sequencing, calls, recovery, and use of returned values. |
| Imperative controller | Testable enforcement of prerequisites, coverage, validation, failure rules, and result assembly. | The controller can contain defects, encode an incomplete procedure, or accept insufficient evidence. Model judgments remain fallible. |

Code earns assurance through its requirements and tests. A controller that merely forwards one large prompt has implemented very little of the control we have discussed.

Test the failures that would invalidate the result. Missing assessments must prevent completion. Duplicate responses must not satisfy two obligations. Invalid citations must be rejected. Excluded evidence must be absent from worker inputs and inaccessible through their tools. A correction to an input must invalidate dependent results.

The boundary includes the assistant invoking the controller. A skill instruction to use a runner does not prove that every conversational answer came from it. A downstream system should accept the validated runner artifact and required status, rather than infer success from an assistant's summary. Execution properties such as the requested model route also need host evidence where the protocol depends on them.

These controls establish bounded claims about procedure and evidence. They do not establish that the specification itself is complete or that every model judgment is correct.

<span id="13-discussing-reliability-without-inventing-percentages"></span>

### Measure the properties you depend on

We can explain why a missing-result check improves assurance without inventing a percentage improvement in accuracy. Numerical reliability claims need a defined benchmark, scoring method, and observed results.

Evaluate applicability against an independently established reference. Measure required assessment completion, detection of known defects, unsupported findings, and variation across repeated runs. Deliberately supply missing, malformed, and contradictory results to check whether the required failure behavior occurs.

A successful example demonstrates that run. Repeated evaluation helps characterize behavior across the cases tested. Neither gives an unchecked future answer a free pass.

<span id="14-how-to-prompt-well-before-you-need-a-workflow"></span>

## Improve the prompt while it is still the right tool

The first improvement to an interactive task is often a clearer prompt. Specify the sequence, make consequential choices explicit, and expose evidence a person can inspect. Use computation for the mechanical work and model reasoning for interpretation.

<span id="use-code-for-exact-arithmetic-and-aggregation"></span>

### Calculate before interpreting

The expense prompts above show the progression from requesting totals to prescribing preparation, validation, calculation, and interpretation. A shorter improvement to the general prompt would be:

> Use code to calculate total spending by category, budget variance for each category with a stated budget, and month-by-month totals. Show the calculated tables first. Then analyze those computed results and explain the most significant changes or anomalies.

This moves arithmetic into executable operations. The fuller procedural prompt also handles the inputs and unresolved cases on which those calculations depend. In both versions, we still need evidence that the operation ran and that the findings used its result.

<span id="externalize-the-requirement-inventory-before-generating-tests"></span>

### Establish the requirement inventory before generating tests

**General request:**

> Read these business requirements, generate all the acceptance tests we need, and confirm that every requirement is covered.

**More explicit procedure:**

> First extract the business rules and acceptance criteria into a numbered inventory. Do not generate tests yet. Show the inventory and flag ambiguity for review. Once the inventory is resolved, generate acceptance-test scenarios mapped to those requirement IDs. Finally, show the requirement-to-test mapping and identify any requirement with no mapped scenario. Do not claim complete coverage while required entries remain unresolved or unmapped.

The inventory makes intermediate decisions visible. Mapping scenarios to it makes omissions easier to detect. We still have to check the inventory against the source and determine whether each scenario actually demonstrates its requirement. A populated mapping cell alone proves neither.

<span id="use-deterministic-discovery-before-semantic-impact-analysis"></span>

### Discover references before reasoning about impact

**General request:**

> I changed the signature of getUser(). Search the repository and tell me everything that will break.

**More explicit procedure:**

> Use repository search or static-analysis tooling to enumerate references to getUser() first. Show the call-site inventory and the scope of the search. Then analyze each discovered call site for effects of the signature change. Record unresolved references or dependencies and distinguish them from unaffected callers.

The search supplies an inventory for the reasoning to examine. Its coverage still depends on the search scope and tooling. Dynamic references or code outside the repository may require further investigation. Exposing that limit is more useful than claiming every caller was found without evidence.

<span id="use-real-execution-for-claims-about-runtime-behavior"></span>

### Execute tests before reporting their outcome

**General request:**

> Write tests for this change, inspect them, and tell me whether they will pass.

**More explicit procedure:**

> Generate the tests, execute them with the real test runner, and report the runner's actual results. Explain any failures. If execution is unavailable or incomplete, state that limitation and do not report the tests as passing.

The runtime supplies evidence about what executed. Reviewing what the tests assert remains necessary: passing tests can still encode the wrong requirement.

These prompts improve model-controlled work. They make the intended procedure and its limits easier to inspect. When acceptance depends on demonstrating that every prescribed obligation was fulfilled, implement those obligations in the controller.

<span id="15-teaching-examples-at-a-glance"></span>

## Choose for the consequences of the result

| Task and use | Suitable starting point | Why |
| --- | --- | --- |
| Explore household expenses while checking entries and totals | Explicit prompt or skill, with calculation helpers | A person verifies and resolves ambiguity before using the findings. |
| Evaluate a codebase for maintainability advice | Skill with investigation guidance | Useful observations can meet the goal without claiming exhaustive coverage. |
| Perform an advisory code review | Procedural skill with useful helpers | A developer checks suggestions; the required scope remains explicit. |
| Render a report interactively from validated records | Skill invoking maintained rendering code | Code preserves the mechanical output, while the person checks that the intended records were used. |
| Review every required unit-rule pairing or execute a prescribed verification protocol | Imperative controller, optionally invoked through a skill | Coverage, evidence separation, validation, and incomplete outcomes are mandatory obligations. |
| Feed consequential business records or decisions without per-run human verification | Imperative controller with narrowly bounded model judgments | Required checks and use of accepted values must be part of execution. |

The number of steps does not decide this. A short task can have serious consequences. A lengthy investigation can remain exploratory and useful under human review.

<span id="16-discussion-questions-for-learners"></span>

Before choosing, ask what happens if the result is wrong, who checks it before use, which decisions can be expressed as code, and what evidence permits completion. Then ask what prevents a missing step or ignored return value from becoming an accepted result.

A careful prompt deserves credit for the choices it makes explicit. Tested helpers deserve credit for the operations they implement. For high-stakes unattended work, I want imperative code to enforce how those operations are combined, and models to contribute only the judgments the application actually needs. **Instruction is not assurance.** The result still has to be verified.

## Reference note

OpenAI's [Build skills documentation](https://learn.chatgpt.com/docs/build-skills) describes skills as packages of instructions, resources, and optional scripts. The three approaches here are an engineering framework for locating control and verification responsibilities. They are not vendor-defined product categories or a measured comparison of model accuracy.
