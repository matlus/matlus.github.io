---
title: Skills versus Controlled Workflows
description: >-
  When a useful answer is enough, and when you also have to demonstrate that a
  prescribed procedure was followed.
datePublished: 2026-06-19
dateModified: 2026-10-08
tags:
  - verification
  - agent-orchestration
  - ai-assisted-development
  - code-review
hero: controlled-workflows
diagrams:
  - controlled-workflow
status: established
---

The choice between an AI skill and a controlled workflow depends on what the task requires us to establish. Sometimes a useful answer is enough. Sometimes we must also demonstrate that a prescribed process was followed, that every required item was assessed, and that missing or invalid work did not silently become a clean result.

This guide compares those situations. It treats skills as a valuable way to communicate expertise and organize work, including skills written with extensive procedural instructions. It also explains why some requirements call for executable controls around model reasoning.

The examples are architectural and educational. They do not report the release readiness, measured accuracy, or acceptance status of any product.

Scope of these lessons: The skills and controlled workflows discussed here run automatically from start to finish. People define requirements before execution and evaluate or act on the results after the run ends. No step waits for a human decision. If required work cannot be completed, the run ends with an explicit failed, incomplete, or unresolved outcome under its execution rules. Ending a run does not mean that verification succeeded.

Verified, not trusted. A claim is accepted only when the required evidence and checks support it. A confident answer, a statement that work is complete, or agreement between models cannot substitute for verification. Verification is a condition of acceptance, rather than an optional check after accepting a claim on trust. Every verified result must also make clear what was checked and what remains uncertain. Complete execution does not prove that every model judgment is correct.

**Core teaching principle:** Use a skill to communicate expertise and guide work. Use executable controls wherever requirements demand that a procedure be enforced and its execution demonstrated. Use them together when both are needed. (Verified, not trusted.)

## 1. Start with a fair comparison

A serious review skill can contain much more than a request to read some guidelines. It might specify:

  - How to inventory the code and identify relevant classes.
  - How to determine which guidelines apply to each class.
  - How to construct and maintain a coverage matrix.
  - Which reviews must be independent and what information to withhold.
  - How to handle missing evidence, contradictory findings, and failed workers.
  - How to check completion and distinguish uncertainty from a clean assessment.
  - How to structure the final report and preserve supporting evidence.

Those instructions matter. They can substantially improve execution. The comparison in this guide is against such a carefully engineered skill, not a weak prompt saying, "Here are 500 guidelines; review my code."

Nevertheless, the completeness of the instructions does not establish the completeness of a particular execution. An assistant can interpret an instruction incorrectly, overlook an item, or accept an incomplete intermediate result. A report that says the checks were performed is not, by itself, independent evidence that they occurred.

**Teaching passage:** Even a meticulously specified skill describes the procedure the assistant is expected to follow; the instructions alone do not establish what occurred during execution. A controlled workflow turns selected requirements into executable checks, so deviations can be detected and incomplete work cannot silently qualify as complete. (Verified, not trusted.)

This is a distinction between instruction and enforcement. It is not a claim that skills always fail or that controllers always succeed.

## 2. Three approaches, rather than a binary choice

A skill is a way to package instructions and supporting resources. A workflow is a procedure. A pipeline is a workflow with stages that process inputs into outputs. A directed graph can represent dependencies and permitted transitions within that workflow.

These concepts overlap. A skill can describe a workflow, coordinate tools, or invoke a complete controller-managed pipeline.

| Approach | What it contains | Who controls progression? |
| --- | --- | --- |
| Instruction-only skill | Procedural instructions, domain guidelines, and reference material. | The assistant interprets the instructions and decides what to do next. |
| Skill with executable helpers | Instructions plus maintained scripts or tools for specific operations. | The assistant coordinates the work; helpers enforce their own local rules. |
| Controller-managed workflow or pipeline | Executable rules for required stages, inputs, transitions, validation, and failure handling. A skill may provide the entry point. | The controller governs progression; models perform assigned reasoning tasks. |

The middle category matters. A script that validates an assessment can reliably reject a malformed assessment when invoked. It does not establish that the assistant invoked it for every required assessment. Local correctness and complete orchestration are different responsibilities. (Verified, not trusted.)

A controller need not be a large graph framework. A small program with explicit sequencing, state, and validation may be sufficient. A workflow may also need loops or conditional paths rather than a fixed acyclic graph. The diagram helps people understand the procedure; executable rules provide the enforcement.

### What we mean by a controlled directed-graph workflow

A **controlled workflow** is an explicitly designed procedure whose execution is governed by code. A **directed graph** represents its steps as nodes and its dependencies or permitted transitions as arrows. Each step has a defined purpose, required inputs, permitted evidence and tools, expected outputs, and validation and failure rules. In these automated pipelines, steps can perform ordinary computation, invoke a model or bounded agent, or check whether work may proceed. They do not request human decisions during execution. A node does not necessarily represent a sub-agent.

For example, a review workflow might inventory code, determine applicable rules, validate that review plan, dispatch assessments, check that every required result returned, independently challenge findings, and assemble a report. The controller tracks execution state and controls conditional branches, limits, retries where permitted, and stopping. Downstream work receives only the validated outputs and evidence its role permits.

**Concurrency is a design decision, not a consequence of drawing multiple boxes.** Work can run concurrently when inputs are ready, dependencies permit it, and workers will not interfere through shared state. A check that depends on another stage's output must wait. Dividing code by file may also lose caller-callee relationships, shared invariants, or behavior spanning components. Useful decomposition therefore follows reasoning and evidence boundaries, with explicit reconciliation of overlapping or interacting findings. Independent reasoning can run sequentially; simultaneous workers can still be poorly isolated or receive the same anchoring information.

**Model-family selection and cross-review are separate design choices.** A protocol may require family A and family B to form independent initial assessments, then have A challenge B's findings and B challenge A's findings. The initial passes must finish before their findings are supplied for cross-review if initial independence is required. A cross-review worker necessarily sees the assigned claim, but can receive it in a fresh context without the author's identity or unrelated conclusions. Using different families may help challenge shared assumptions; it does not prove independence or correctness. The controller must also define how disagreements are evaluated, when further adjudication is allowed, and when uncertainty remains unresolved. Agreement alone is not proof. (Verified, not trusted.)

The workflow's design therefore includes more than a list of tasks: it specifies who reasons about what, what each worker can see, what can happen concurrently, how results are checked and combined, and what prevents completion. More sub-agents or more arrows do not automatically improve assurance; each separation and comparison should serve a stated requirement.

## 3. Three claims that should not be confused

When an assistant finishes a review, we might make three different claims:

1.  **It produced useful findings.** The output contains valuable observations.
2.  **It followed the required procedure.** All prescribed assessments and constraints were observed.
3.  **The system can demonstrate that execution.** Records and checks support the claim that required work occurred.

A useful report can satisfy the first claim without establishing the second or third. This matters when the absence of a finding is interpreted as evidence that a rule was checked and no violation was found.

For exploratory work, useful findings may be the intended deliverable. For systematic verification, evidence of coverage and completion is part of the deliverable too.

**Teaching passage:** The relevant question is not merely whether the assistant produced a convincing answer, but whether the system can demonstrate that the answer was produced under the required constraints. (Verified, not trusted.)

## 4. What determinism means in an AI workflow

"Deterministic" should not be used as a single label for the entire system. Several different properties are involved.

| Property | What it means | What a controller can contribute |
| --- | --- | --- |
| Procedural consistency | The same required rules govern execution on every run. | Enforce prerequisites, required stages, permitted transitions, and stop conditions. |
| Deterministic mechanical operations | The same relevant inputs produce the same mechanical result. | Apply stable parsing, identity checks, calculations, and validation rules. |
| Deterministic policy evaluation | The same validated judgments, decisions, and policy inputs produce the same policy outcome. | Compute outcomes through explicit code rather than asking a model to reinterpret the final decision. |
| Semantic repeatability | Repeated model analysis produces the same findings and judgments. | Constrain context and execution, but cannot generally guarantee identical judgments. |
| Semantic correctness | Findings and judgments accurately represent the code and requirements. | Support evidence checks and independent challenges, but cannot guarantee correctness or exhaustiveness. |

A controlled workflow can have deterministic transition rules without following the same path on every run. If a model produces five candidates in one run and seven in another, the number of verification calls can differ. The controller can still enforce the rule that every admitted candidate must be verified.

Similarly, deterministic policy evaluation does not imply byte-identical reports across runs. Timestamps, execution identities, model answers, and other run-specific data can differ.

| Approach | Determinism and consistency |
| --- | --- |
| Instruction-only skill | Detailed instructions can improve consistency, but cannot guarantee the same execution path, checks, or findings on every run. |
| Skill with executable helpers | Helpers can perform deterministic operations; the assistant's selection and sequencing of them may still vary. |
| Controller-managed workflow | Code can enforce sequencing rules, evidence boundaries, validation, and result assembly. Model judgments, and therefore findings and conditional branches, may still vary. |

**Teaching passage:** A skill can improve consistency. A controller can enforce the procedure. Neither alone guarantees identical or correct model judgments on every run. (Verified, not trusted.)

## 5. Is this agentic? Autonomy at different levels

A controlled workflow can contain agentic behavior without an agent controlling the overall workflow. The stronger form of autonomy is a system receiving a goal, choosing actions, observing results, and revising its approach within defined boundaries.

The terminology is used broadly. Anthropic's [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) groups workflows and agents under agentic systems while distinguishing predefined orchestration from systems where the model dynamically directs its process and tool use. This is a useful architectural distinction, rather than a universal definition.

The following are working definitions for this guide. They describe where decision authority resides, not a ranking in which more autonomy is necessarily better.

| Dimension | Controlled workflow with model steps | Controlled workflow with bounded agents | Agent-directed workflow |
| --- | --- | --- | --- |
| Who defines the overall procedure? | Developers define stages and transition rules. | Developers define the overall procedure; agents choose methods within assigned stages. | The agent plans and revises the procedure within its authority. |
| What does the model decide? | An assessment, classification, transformation, or other bounded response. | How to investigate or accomplish an assigned subgoal using permitted actions. | Which subgoals to pursue, actions to take, and potentially which workers to delegate to. |
| How does execution adapt? | Through predefined branches driven by inputs and results. | Through local investigation and feedback loops, followed by controller validation. | Through ongoing planning based on observations and progress toward the goal. |
| What remains externally controlled? | Sequencing, access, validation, completion, and failure rules. | Those same controls, plus boundaries around each agent's local autonomy. | Permissions, budgets, prohibited actions, required gates, and externally enforced stopping conditions. |
| When is it a useful fit? | The procedure is understood and each model task can be specified in advance. | Required obligations are fixed, but the investigation needed to satisfy them is variable. | The route to the goal is difficult to prescribe, and adapting the plan is part of the task. |
| Suggested description | Model-assisted workflow. | Controlled workflow containing bounded agents. | Agent-directed workflow or autonomous agent system. |

### Three nuances that prevent misleading labels

**Taking different paths does not by itself make a system agentic.** Ordinary code can choose different branches for different inputs. Conversely, an agent may choose the same sensible approach repeatedly. The distinguishing question is whether the model has authority to select and revise actions toward a goal based on feedback.

**Reasoning is not the same as action autonomy.** A model that receives a fixed evidence packet and returns a verdict performs substantive reasoning. Under a stricter definition, that alone does not make it an autonomous agent. If it can choose searches, inspect permitted files, test hypotheses, and decide its next investigative action, it has more clearly agentic behavior, even when confined to one workflow stage.

**A directed graph does not exclude autonomy.** A graph can contain a node that runs an agent's investigation loop. It can also represent a general cycle of planning, acting, observing, and replanning. What matters is who determines the substantive next action, not whether the implementation can be drawn as a graph.

### Applying the distinction to review and verification

In the guideline-review example, a controller could require all 40 applicable assessments for a class while allowing a reviewer to choose how to investigate each obligation. The reviewer might follow callers, inspect dependencies, or challenge an apparent violation. It would have discretion over its investigation while lacking authority to omit required assessments or declare incomplete work complete.

For an open-ended task such as diagnosing an unfamiliar failure and proposing a repair, broader planning authority may be useful. The agent may need to discover which components matter, revise hypotheses, and choose new actions based on results. That discretion can coexist with mandatory validation before accepting a repair and externally enforced limits on time, access, or changes.

Cross-family review is a separate dimension. Having A challenge B and B challenge A can be a prescribed workflow, an agent-selected strategy, or a controller-required stage containing autonomous investigators. The number or family of the workers does not determine how agentic the system is.

For the verification architecture discussed in this guide, a precise description is **a controlled verification workflow with bounded model reasoning, and bounded agents where workers can choose investigative actions**. This identifies the authority granted to workers without implying that they can redesign the overall verification protocol. It also avoids calling every fixed model response an autonomous agent.

**Teaching passage:** Autonomy can exist at different levels. A controller may govern the overall verification procedure while individual agents choose how to investigate their assigned questions. An agent-directed workflow gives the agent broader authority to plan and revise the procedure itself. Both can use explicit boundaries and executable controls; the difference is which decisions are delegated to the model.

The skill comparison and the autonomy comparison answer different questions. A skill describes how expertise and instructions are supplied. The autonomy comparison describes who chooses actions during execution. A skill can guide any of these three arrangements, and an agent-directed workflow still needs an execution environment that enforces its non-negotiable boundaries.

## 6. Benefits, costs, and limitations

| Dimension | Instruction-only skill | Skill with executable helpers | Controller-managed workflow |
| --- | --- | --- | --- |
| Initial effort | Relatively quick to author and revise. | Tools require implementation and testing. | Execution rules, contracts, adapters, and failure paths require engineering. |
| Flexibility | The assistant can adapt its method to unfamiliar situations. | Adaptable around the operations supported by helpers. | Adaptation occurs within explicitly supported paths. |
| Procedural consistency | Depends on instruction following and context. | Stronger within individual operations; overall coordination can vary. | Required stages and transitions can be enforced and tested. |
| Evidence boundaries | Instructions express intended limits; actual access depends on the host. | Helpers can restrict their own inputs and access. | Controller and host mechanisms can construct and enforce worker-specific boundaries. |
| Failure handling | The assistant interprets failures and chooses a response. | Helpers detect specific failures; the assistant may choose recovery. | Explicit rules govern stopping, retrying, continuing, and reporting incomplete outcomes. |
| Traceability | Conversation history can help, but accounting may be incomplete. | Structured tool outputs improve traceability. | Designed records can account for required inputs, stages, and results. |
| Maintenance | Easy to edit, though interactions among instructions can be difficult to diagnose. | Instructions and helper interfaces both need maintenance. | Greater engineering burden, with explicit components and regression tests. |
| Main limitation | A convincing answer does not establish procedural compliance. | Correct helpers do not establish that every required operation occurred. | Correct execution does not establish that model judgments are correct or exhaustive. |

These are tendencies and capabilities, not automatic guarantees. A controller that merely forwards a large prompt adds little procedural assurance. Its value comes from the controls actually implemented and tested.

## 7. Choosing an approach

| Question | A skill is often sufficient when | Prefer executable orchestration when |
| --- | --- | --- |
| What counts as success? | A useful draft, explanation, or set of suggestions meets the need. | Success also requires evidence that a prescribed procedure was followed. |
| May the assistant choose the method? | Different investigation paths are acceptable. | Certain steps, ordering, or restrictions are mandatory. |
| May work be combined or omitted? | The assistant may reasonably simplify the task. | Every required item or assessment must be accounted for. |
| How strict is independence? | Additional perspectives are helpful. | Separate contexts and withheld information are explicit requirements. |
| How costly is silent deviation? | A user can readily inspect and correct the result. | An unnoticed omission could invalidate the result or its downstream use. |
| How strict are outputs? | Presentation and wording can vary. | Other processes depend on validated identities, fields, verdicts, or status rules. |
| What should happen on failure? | Adapting the method or reporting a limitation is acceptable, without waiting for a human decision during the run. | Specific failures must prevent progression or prevent a clean result. |
| Must hosts behave consistently? | Some host-dependent behavior is acceptable. | Supported hosts must meet a common execution contract. |
| How mature is the procedure? | Exploration and refinement of the method are the objective. | Important requirements are stable enough to encode and test. |

A practical progression is to allow discretion where useful output is sufficient, add helpers where individual operations require exactness, and introduce a controller where correctness depends on how those operations are combined.

The decisive factor is the assurance requirement, not simply the number of steps. A short workflow can require strict control. A lengthy exploratory task can still be well suited to a skill.

## 8. Example: exploratory codebase evaluation

Consider the request:

> Read this repository, understand its structure, and evaluate maintainability, coupling, testability, and clarity.

A skill can supply definitions, investigation guidance, examples, and a report structure. Different runs may examine different paths or emphasize different weaknesses while still providing useful evaluations.

If the user expects informed advice rather than exhaustive rule coverage, variation can be acceptable. Preserving flexibility may be more valuable than prescribing every investigation step.

The limitation should be reflected in the claim: the output is an evaluation based on the investigation performed. It is not automatically proof that every class was assessed against every relevant standard.

## 9. Example: systematic review against approximately 500 guidelines

Suppose an organization maintains Python guidelines and is developing a corresponding C# set. Across the relevant catalog, there are approximately 500 rules. A particular class might require 30 or 40 assessments based on its responsibilities and code content.

The objective is not merely to find some defects. It is to ensure that every in-scope code unit receives every required assessment.

| Responsibility | What must be established |
| --- | --- |
| Inventory | Every relevant file, class, function, or other review unit is accounted for. |
| Applicability | Each unit is assigned the rules relevant to its role and content. |
| Execution | Every required unit-rule pairing receives an assessment. |
| Completion validation | Missing, failed, or invalid assessments remain visible and prevent a claim of complete review. |
| Evidence | Assessments identify the rule, reviewed code, conclusion, and supporting evidence or reasoning. |
| Reporting | No violation found, not applicable, not reviewed, and unable to assess remain distinct. |

The logical unit of accounting is the code-rule pairing. That does not require a separate model call for every pairing. Assessments may be batched where appropriate, provided the accounting and evidence remain intact.

### A strong skill still leaves an execution question

The skill could explicitly require:

> Create a class-rule matrix, assess every applicable pairing, check for missing assessments, and report completion only when every required entry is accounted for.

This is a strong instruction. However, if the assistant constructs the matrix, decides applicability, performs the assessments, and checks its own completion, an omission can survive all four activities. The final report may faithfully reflect an incomplete matrix.

A controller can maintain an explicit required inventory and compare it with validated returned assessments. If a class requires 40 assessments and only 37 valid results return, three entries remain incomplete. They cannot silently become clean assessments.

### Coverage has more than one meaning

| Question | Why it matters |
| --- | --- |
| Applicability coverage: did we identify all rules that should apply? | Completing an incorrectly narrowed review plan does not establish full coverage. |
| Execution coverage: did every required assessment complete? | Missing work must not be interpreted as absence of violations. |
| Judgment accuracy: were the assessments substantively correct? | A complete set of assessments can still contain mistaken conclusions. |

If applicability is model-assisted, it needs its own controls. Possible approaches include mandatory baseline rules, explicit applicability decisions, conservative handling of uncertainty, and independent checks of routing. A "not applicable" decision should have a defined basis rather than becoming an unexplained escape from review.

Receiving a structurally valid assessment does not prove that the model reasoned correctly or examined every relevant behavior. Execution records support bounded claims about work performed and evidence supplied; substantive accuracy requires additional evaluation.

The same orchestration principles can apply to Python and C#, but language-specific applicability and interpretation still need their own definitions and validation.

**Teaching passage:** A complete code review must account for every required code-rule assessment. A controlled workflow can detect missing assessments and prevent incomplete work from being reported as complete. Model judgments remain fallible, but coverage and completion need not depend solely on the model remembering to follow instructions. (Verified, not trusted.)

## 10. Example: Spec-to-Test Verification

An exploratory request to identify possible specification and test gaps can be appropriate for a skill. A prescribed verification protocol adds stronger requirements, such as:

  - Keep production-defect findings distinct from weaknesses in test evidence.
  - Restrict what each review role receives.
  - Preserve candidate identity and provenance through processing.
  - Independently challenge every admitted candidate.
  - Validate returned assessments and expose uncertainty.
  - Apply defined outcome rules and preserve validated verdicts in the report.

Consider the requirement that each candidate receive independent verification without revealing the finder's identity. The assistant can be instructed to do this. A controller can additionally construct the verifier's input, omit finder identity, restrict evidence access through the host, account for execution, and validate the response.

Telling a worker to ignore information is different from withholding that information from its input and accessible context. A fresh session alone is also insufficient if shared history or unrestricted tools reintroduce excluded evidence. The relevant boundary must be implemented across input construction and host execution.

Fresh contexts support independence, but do not eliminate shared model biases. Different model families can provide another perspective, but do not establish correctness or turn agreement into proof.

| Requirement | Instruction-level approach | Executable control |
| --- | --- | --- |
| Restrict evidence by role | Tell the assistant what each worker may see. | Construct role-specific inputs and restrict available tools or files. |
| Verify every admitted candidate | Tell the assistant to launch each verification. | Account for candidates and require corresponding valid results. |
| Detect changes to bound source | Tell the assistant to check for drift. | Compare source identities at defined gates. |
| Reject invalid assessments | Describe acceptable answers and citations. | Parse and validate responses under explicit rules. |
| Preserve final judgments | Instruct the assistant not to rewrite verdicts. | Assemble authoritative outputs from validated records. |

These controls explain why a verification pipeline can justify more engineering than an exploratory analysis skill. They do not establish that every defect will be found or that the specification itself is correct and complete.

## 11. Code generated during execution

A detailed skill may direct the assistant to create scripts or other tooling as needed. This can be useful, but introduces implementation choices during the task itself.

**Code generated during a prompt is not the same thing as a controlled implementation.** The generated code may perform deterministic operations once it exists, but the model still decides what code to generate, what inputs to construct, what conditions to compare, and what the code treats as the complete inventory. A different run may generate a different script or encode different assumptions. Maintained, reviewed, tested, versioned code removes those implementation decisions from each prompt execution; model reasoning around that code can still remain probabilistic.

| Responsibility | Decision being made |
| --- | --- |
| Interpret the procedure | What does a requirement such as independent verification mean operationally? |
| Construct an implementation | Which workers, scripts, inputs, and checks should implement it? |
| Execute it | What runs, in what order, and what happens after a failure? |
| Judge evidence | Are the proposed findings supported? |
| Declare completion | What is sufficient to say the task is finished? |

Repeated runs may choose different structures, validation rules, or recovery behavior. They do not necessarily do so on every run; the point is that the instructions alone do not fix these implementation decisions.

Generated tests may also reflect the same misunderstanding as the generated implementation. Passing those tests is useful evidence, but may not establish conformity with the original requirement.

Generating code is not inherently the problem. If the code is reviewed, tested against independently specified expectations, versioned, and reused, it becomes a maintained implementation. Assurance is weaker when the implementation is improvised and accepted within the same execution without those checks.

## 12. Where a controller's assurance ends

A controller can contain defects, enforce an incomplete procedure, or trust weak evidence. It does not become reliable merely because it is ordinary code.

Useful controls require explicit requirements and proportionate tests. For example, tests should establish that missing assessments prevent completion, duplicate results do not satisfy two obligations, invalid citations are rejected, and excluded information is absent from worker inputs.

The boundary also includes the coding assistant that invokes the controller. A skill instruction to use the runner is not itself a guarantee that every conversational answer came from it. Where that distinction matters, consumers should recognize validated runner artifacts as the authoritative result and distinguish them from an assistant's informal analysis.

Likewise, the controller can enforce that a specific model route is requested only to the extent supported by the host. Unknown or unavailable execution properties should remain explicit rather than being inferred from instructions.

The benefit is a stable, inspectable place to enforce and test procedural requirements. It is not a guarantee of semantic infallibility.

## 13. Discussing reliability without inventing percentages

It is reasonable to expect stronger assurance when omissions become detectable and required checks become enforceable. It is not reasonable to assign a numerical improvement, such as 40% versus 80%, without measurements.

A useful evaluation would measure separate properties:

  - Correctness of rule applicability against an independently established reference.
  - Completion of required assessments.
  - Detection of known violations and frequency of unsupported findings.
  - Variation across repeated runs on the same inputs.
  - Whether deliberately missing, malformed, or contradictory results produce the required failure behavior.

"Materially stronger assurance" is an appropriate qualitative claim when supported by concrete controls. Accuracy percentages require a defined benchmark, scoring method, and observed results.

## 14. How to prompt well before you need a workflow

A controlled workflow is not the first answer to every AI task. A prompt or skill can often produce a much better result simply by assigning different kinds of work to the mechanisms best suited to them.

In a prompt-driven session, the assistant may inspect files, call tools, generate and execute code, create intermediate tables, or search a repository. The assistant still decides how to coordinate those actions. There is no external controller proving that every required step occurred. That distinction matters, but it does not make the executable work inside the session unimportant.

**Teaching rule:** Do not ask the model to reason through work that can be made mechanical. Ask it to use deterministic code, search, parsing, execution, or other exact operations for the parts that can be computed or enumerated, and reserve model reasoning for interpretation and judgment. (Verified, not trusted.)

### Use code for exact arithmetic and aggregation

**Less effective prompt:**

> Here are our quarterly expenses and budgets. Calculate spending by category, determine which categories exceeded budget, find unusual changes, and explain what happened.

**Better prompt:**

> Use code to calculate total spending by category, budget variance for each category, and the month-by-month totals. Show the calculated tables first. Then analyze those computed results and explain the most significant changes or anomalies.

The model is still coordinating the task, but arithmetic and aggregation no longer depend on language reasoning. The model can concentrate on explaining what the computed results mean.

### Externalize the requirement inventory before generating tests

**Less effective prompt:**

> Read these business requirements, generate all the acceptance tests we need, and confirm that every requirement is covered.

**Better prompt:**

> First extract the business rules and acceptance criteria into a numbered inventory. Do not generate tests yet. Show that inventory. Then generate acceptance-test scenarios mapped to those requirement IDs. Finally, show the requirement-to-test mapping and identify any requirement that remains ambiguous or has no mapped scenario.

This does not prove that the extracted inventory is complete or that every generated test is correct. It does make the intermediate reasoning visible, reduces dependence on the model remembering relationships implicitly, and makes obvious gaps easier for a human to inspect.

### Use deterministic discovery before semantic impact analysis

**Less effective prompt:**

> I changed the signature of getUser(). Search the repository and tell me everything that will break.

**Better prompt:**

> Use repository search or static-analysis tooling to enumerate references to getUser() first. Show the resulting call-site inventory. Then analyze each discovered call site and explain whether the signature change affects it.

The mechanical search answers where the references are. Model reasoning answers what the change means at each reference. Keeping those questions separate generally produces a stronger result than asking the model to perform both implicitly.

### Use real execution for claims about runtime behavior

**Less effective prompt:**

> Write tests for this change, inspect them, and tell me whether they will pass.

**Better prompt:**

> Generate the tests, execute them with the real test runner, and report the runner's actual results. Then explain any failures.

The model can propose code and interpret failures. The runtime establishes what actually happened. A passing generated test is still not proof that the test correctly represents the requirement.

These techniques improve prompt-driven work without changing who controls the overall task. The assistant may still omit a step, choose a different path on another run, or misunderstand the source material. When the requirement changes from "produce a strong, inspectable result" to "demonstrate that every prescribed obligation was executed under enforced constraints," the problem has crossed into controlled-workflow territory.

Two especially useful live demonstrations are financial analysis from a tabular expense dataset and business-requirements-to-acceptance-test generation. In both cases, the audience can see the difference between asking for an answer and asking the assistant to expose intermediate structure, use executable operations where appropriate, and then apply model reasoning to the resulting evidence.

## 15. Teaching examples at a glance

| Task | Suitable starting point | Why |
| --- | --- | --- |
| Explore a codebase's maintainability and structure | Instruction-only skill | Useful observations can satisfy the task despite variation in investigation and emphasis. |
| Perform an advisory code review | Skill, potentially with helpers | Suggestions are evaluated by a developer; exhaustive procedural coverage may not be required. |
| Render a report from validated structured data | Skill with maintained validation and rendering helpers | Exact mechanical operations can be delegated to code while the assistant handles interaction. |
| Review all relevant code against a large guideline catalog | Controller-managed workflow with a skill entry point | Applicability, assessment accounting, evidence, and incomplete outcomes require explicit treatment. |
| Execute a prescribed Spec-to-Test verification protocol | Controller-managed pipeline with a skill entry point | Evidence separation, independent candidate assessment, validation, and outcome rules are part of the requirement. |

## 16. Discussion questions for learners

1.  What would count as success for this task: a useful answer, complete procedural execution, or both?
2.  If a required assessment were omitted, what would detect the omission?
3.  Who determines the assessment inventory, and how is that determination checked?
4.  What information must a worker be unable to access, rather than merely instructed to ignore?
5.  Which decisions should remain open to model judgment, and which should be fixed by policy or code?
6.  What evidence would justify saying the work is complete?
7.  Which properties may vary between runs without violating the requirement?
8.  Where should autonomy reside: in the overall plan, within particular investigations, or only in bounded judgments?
9.  Does calling the system agentic clarify who controls its actions, or hide that distinction?

## Reference note

OpenAI's [Build skills documentation](https://learn.chatgpt.com/docs/build-skills) describes skills as packages of instructions, resources, and optional executable scripts, and identifies deterministic behavior as a reason to use scripts. The three-way comparison in this guide is an engineering framework for deciding where execution control belongs, not a vendor-defined classification or a measured comparison of products.
