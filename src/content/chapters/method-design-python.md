---
title: Method Design
description: >-
  Pure and autonomous methods, why public methods orchestrate rather than implement, consistent abstraction levels, and the split between actions and queries.
datePublished: 2017-09-20
hero: chapter-method-design-python
dateModified: 2026-09-19
tags:
  - method-design
  - python
section: pwi
topic: method-design
language: python
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Don't make me think"
- "Orchestrate or implement, never both"
- "Show me the what, not the how"
- "Caveat emptor"
- "Need-to-know basis"

---

## Pure and Autonomous Methods

### Pure Methods

Follow functional programming principles - they do not modify state:

- For the same input, they always produce the same output (deterministic)
- Have no side effects (don't modify global state, don't perform I/O operations)
- Make code easier to reason about, test, and debug
- Greatly simplify multi-threaded and parallel code

### Autonomous Methods

Even though these methods might call databases or services (and thus modify external state), they do not rely on hidden mutable per-operation class/instance state:

- Must receive operation-specific data explicitly (typically through DTOs)
- Must not require another method to be called first to populate or mutate an instance attribute
- Make async-await patterns more reliable, especially when tasks/promises return on different threads
- Follow the principle: "Pass operation-specific data in; do not rely on an earlier call to cache it on the instance"
- Provide clear boundaries of responsibility and dependencies

Immutable values established during construction are valid transitive state. This includes constants and immutable configuration DTOs or providers. Constructor-injected loggers, gateways, and stateless behavior collaborators are also valid transitive dependencies when their stored references are not reassigned. Calling a gateway that changes a database or another external system does not violate method autonomy. The prohibited design is hidden in-process sequencing: one method stores mutable operation data on `self`, and another method silently depends on that earlier call.

When a consumer method guards this required call order with a `None` check, the root defect is still the hidden mutable-state precondition. Review that consumer once as a method-autonomy violation; do not issue a second defensive validation finding for the guard that exposes the same precondition.

An encapsulated conditional is a pure predicate query. It receives the values needed to evaluate a business rule, performs no side effects, and returns the boolean answer expressed by its question-shaped name. It does not query an injected collaborator, gateway, or external system; pure calculation helpers remain acceptable. A boolean returned from an action to announce success or failure is not an encapsulated conditional.

A real store or resource existence query obtains an external fact and is an ordinary autonomous query, even when its answer is boolean. It is distinct from a business predicate evaluating supplied facts. Establish the role from complete responsibilities, body and callers; a question-shaped name or boolean annotation alone does not decide it. External queries must still avoid hidden mutable call-order preconditions.

The predicate obligation applies even to a stateless class: an `is_eligible`
method that queries an injected gateway violates that pure-input contract
without needing an earlier producer call or mutable field. This does not
forbid dependency injection for ordinary autonomous operations. Inspect the
complete predicate, its relevant helpers or collaborator contract, and its
callers before classifying it; a boolean annotation or name alone is not
proof. Report the affected method once, including when it also reads hidden
mutable operation state. An intentional immutable state-only model's simple
derived property remains permitted.

These methods support concurrent execution without race conditions or synchronization issues. Adopting these patterns allows for:

- Better testability (dependencies are explicit)
- Easier reasoning about code behavior
- More predictable performance in multi-threaded environments
- Simpler refactoring and maintenance

---

## Public Methods Must Orchestrate

For classes with meaningful complexity, every public method should orchestrate. These should be "steps" that call private methods of the class or methods of other classes. The method name should describe the step being performed. When reading a public method, you should understand **what** it does at a glance; the **how** is delegated to the steps.

**This is not a rigid rule for trivial cases.** If a method is genuinely simple (a few lines of straightforward code), don't force artificial extraction. The goal is readability and clarity, not ceremony. Apply within reason.

The public-method rule exclusively owns public inline-workflow and
partial-extraction corrections, including public methods of low-level
classes. The mixed-abstraction rule owns independently offending private
methods. Methods First owns an unjustified new-class introduction, not a
second finding for the same public method. This divides report ownership;
every applicable method still has to meet the same abstraction standard.

Chapter 56 owns extracting separately testable exception-to-HTTP translation
from a catcher. Do not duplicate its inline classification/envelope extraction
under these method rules. A catcher's unrelated inline workflow detail and
the translator's own complex methods remain subject to their method owners.

**Orchestration makes the sequence and its prerequisites visible.** A short
presence check may guard dependent calls: an assertion can first record a
missing exception, inspect its cause only when the exception exists, delegate
the comparisons, and report once. This is not redundant validation of trusted
input. Do not extract a wrapper solely to make the orchestrator branch-free.
Substantial parsing, comparison, or diagnostic construction still belongs in
named implementation steps, and independent checks must not be skipped.

Operation-specific data should be explicit, so callers can understand a method's inputs without knowing a hidden call sequence. This autonomy rule is separate from the Need-to-Know rule about how much data a parameter exposes. Immutable constructor state and constructor-injected collaborators remain valid transitive inputs.

If a DTO has significantly more properties than a method needs (15-20% more), define a specialized DTO and map at the call site (see Need-to-Know Principle chapter).

Private methods, if too complex, should also orchestrate and call out to other methods in the class or ideally to methods in another specialized class. Complex logic nested inside a single method is hard to test, understand, and maintain.

**No parameter validation**: caller's data, caller's problem.

**No catching exceptions only to log it.** This is not considered "handling" an exception. Only catch exceptions if you're actually handling the exception:

- Retry for service calls
- Catch an exception to translate to a custom and highly specialized exception augmented with additional contextual data

**No being "Safe" code.** Generally, write code expecting the happy path. This avoids unnecessary conditionals adding complexity to code with zero value.

---

## Maintain Consistent Abstraction Levels

Within any method, all code should operate at the same "altitude." If a method orchestrates by calling named steps, it should orchestrate consistently throughout. Do not mix orchestration-level code with implementation-level details in the same method.

**The Problem: Mixed Abstraction Levels**

```python
# BAD - Mixed levels of abstraction
def _prepare_report_data(self, raw_data: RawData) -> ReportData:
    normalized = self._normalize_data(raw_data)        # Step - orchestration level
    enriched = self._enrich_with_metadata(normalized)  # Step - orchestration level

    # Suddenly implementing details inline - WRONG altitude
    filtered_records = []
    for record in enriched.records:
        if record.status != "archived" and record.date >= cutoff_date:
            filtered_records.append(record)

    return self._format_for_report(filtered_records)   # Back to orchestration level
```

The filtering logic isn't necessarily complex, but it's at a different altitude than the surrounding code. The method reads as "step, step, implementation details, step" - the reader must mentally shift gears.

**The Solution: Consistent Altitude**

```python
# GOOD - Consistent level of abstraction throughout
def _prepare_report_data(self, raw_data: RawData) -> ReportData:
    normalized = self._normalize_data(raw_data)
    enriched = self._enrich_with_metadata(normalized)
    active_records = self._filter_active_records(enriched)
    return self._format_for_report(active_records)
```

Now the method reads as four clear steps. The filtering details exist in `_filter_active_records`, keeping this method at a consistent orchestration level.

**This Applies to Private Methods Too**

Private methods that orchestrate should also maintain consistent abstraction levels. If a private method calls one or two other methods to do actual work (not boolean conditionals or validation, but substantive operations), and then implements other steps inline, those inline implementations should likely be extracted as well.

The refactoring signal is exactly this: "Why is this clutter here?" Extract it to keep the method clean. But partial refactoring, extracting some steps but not others, creates inconsistency that makes the method harder to read.

**Important Distinction: Business Rule Methods**

Calling a method that encapsulates a business rule (e.g., `if customer.is_eligible_for_discount()`) is NOT the same as calling out to "do a step." Business rule methods are well-named conditionals that stay at the same abstraction level as the surrounding code. They don't represent delegation of work to another step; they represent readable conditionals.

The same distinction applies to a pure reused predicate over supplied text,
such as checking whether diagnostic output contains a traceback frame. Its
use does not by itself turn a cohesive discrepancy collector into a partly
extracted workflow. Assess the collector's actual complexity separately.

An already decomposed factory may finish by constructing an immutable aggregate
with named fields from its component builders, direct inputs, and simple
representation conversions. That construction need not be moved into a private
method with the same purpose. Require a concrete readability, reuse, or
responsibility benefit from further extraction. Inline collection-mapping
loops, business decisions, or resource access among delegated peer stages
remain substantive implementation work.

**Boolean Parameters Hide Two Methods**

Do not use boolean parameters to switch behavior inside a method. A boolean parameter usually means the method is hiding two different intentions behind one name:

```python
# BAD - caller must remember what True means
def publish_report(report: Report, include_draft_sections: bool) -> None:
    ...

# GOOD - intent is visible at the call site
def publish_report(report: Report) -> None:
    ...

def publish_report_with_draft_sections(report: Report) -> None:
    ...
```

If the choice is a real domain concept with more than two meaningful options, model it as a domain enum or DTO. Do not use `True`/`False` as a hidden mode switch.

A private diagnostic qualifier is different: it may describe a caller's
nullable contract while the helper always performs the same exact-type check.
For example, `map_optional_datetime` handles `None` before calling the shared
check; `allows_null` only changes the failure description. Inspect the flag's
data flow and the named entry points before claiming it changes accepted
inputs, coercion, or workflow. A public flag switching strict validation and
lossy conversion still hides materially different operations.

Boolean return values are acceptable only for predicate-style query methods that answer a domain question, such as `is_eligible_for_discount()` or `has_active_subscription()`. They are not acceptable as success/failure indicators for action methods.

**Do Not Test the Same Condition Repeatedly**

A business rule should have one clear home. If the same condition appears in several methods, extract a named predicate, domain policy, or polymorphic behavior so the condition is expressed once and reused by name. Repeated conditions make policy changes risky and force reviewers to prove that every copy still means the same thing.

**Depth of Delegation**

Count the initiating operation as level zero. Within a class, allow two
orchestration edges: orchestrator -> step -> subordinate step (three methods).
Across classes, keep an orchestration chain to three methods. Sibling steps
called by the same coordinator do not accumulate depth.

When reporting an exceeding chain, anchor the method definition of its
initiating operation at level zero and use its source-declared owning symbol.
An intermediate caller is not the reporting anchor merely because its next
handoff first exceeds the limit. Inspect the complete chain and retain the
supporting-call exclusions below.

Count responsibility handoffs, not every supporting call. A thin convenience
wrapper that only adapts arguments and delegates, or a terminal helper that
constructs an exception, does not add an orchestration level. A cohesive
assertion collector may combine independent leaf comparisons and pass their
mismatches to one final failure operation. These are useful structures, not
reasons to inline diagnostics or duplicate comparison logic.

For example, settings initialization may call timeout validation, which calls
an exception factory on rejection. An assertion may call a shared mismatch
collector, which calls message, status/action, and context comparison helpers.
A single-entry log assertion may reuse the general log assertion and its entry
comparison. Do not flag those arrangements on raw call count alone, including
when construction adds a constructor frame. These exclusions do not exempt an
ordinary workflow that keeps forwarding responsibility through more coordinators.

Do not flatten distinct scheduling, operation-specific command/translation,
resource-lifetime execution, result mapping, native-column reading, and terminal
diagnostic responsibilities merely to shorten the total call stack. For
example, an async method may offload blocking SQL work to a synchronous
operation, which uses a shared connection executor and an internal mapper.
Count nested coordination of the same workflow responsibility; these distinct
implementation responsibilities are not extra orchestration levels. A
forwarding-only layer with no adaptation or useful contract receives no such
exclusion. The complete bodies, not the collaborator names, establish the
distinction.

Reusable non-throwing comparison methods and terminal public assertion
wrappers express distinct contracts. A comparison receives observations and
returns None on success or a complete failure report. The wrapper converts
that report into one assertion failure. A public aggregate can reuse the
comparison contracts, evaluate every independent obligation, and fail once
after collecting the results. Those supporting roles do not add orchestration
depth merely because comparisons are also reused by terminal wrappers. Do
not force duplicated comparison logic or catch-and-continue aggregation to
remove a supporting frame.

This allowance requires the complete comparison, collector, wrapper, and
aggregate bodies as applicable. A test path, an Asserter name, or a forwarding
layer does not prove a supporting contract. The method's own inline
complexity, class placement, and other applicable obligations remain
reviewable; this is not a general test-support depth waiver.

Orchestration means the orchestrator calls A, calls B, calls C, calls D. It does NOT mean calling A which calls B which calls C which calls D in a chain. The orchestrator coordinates; it doesn't delegate to delegates who delegate further.

**Every Class Restarts at Level Zero**

Abstraction levels are class-local. A data-layer manager sits far below a domain manager in system terms, yet inside its own class its public method is level zero and must orchestrate exactly like any other public method (create connection, begin transaction, create command, execute, commit: each step a named method one level down). Do not excuse mixed altitude in "low-level" classes; there is no class low enough to be exempt.

Report that public-method defect under Public Method Implements Rather Than
Orchestrates. Its low-level location does not create another occurrence under
Mixed Abstraction Levels or Methods First. A separate private method can
still require its own extraction.

**Refactor to Methods First, Not to Classes**

When a review finds mixed abstraction levels and no independent class responsibility is present, first extract *methods in the same class*. A class introduced solely to divide that method adds an unplanned design decision. This sequencing preference does not prohibit extracting a cohesive boundary responsibility that is already evident in the code.

The discipline:

1. Carve the method into named steps (private methods, one level down) until every method sits at a single altitude.
2. Only when the levels are clean, look for groups of methods that clearly belong together. Moving such a group into a class is then a mechanical copy-paste, not a design gamble, and often the grouping reveals itself only after step 1.
3. Apply the rule of thirds when speculative reuse is the reason for promotion (method → class → shared component). Imagined reuse is not reuse. A real boundary responsibility is a separate justification and does not require multiple callers.

**Review guidance:** flag a diff that introduces a new collaborator class as part of an altitude cleanup when the same result was achievable with private method extraction, unless the class boundary was already justified independently (an existing family, a genuine shared specialization, a boundary concern).

For example, a Data Manager may delegate provider-error interpretation and
domain-exception construction to a dedicated order-store exception translator.
The Data Manager owns store operations; the translator owns the provider-to-domain
failure mapping. One owning Data Manager is sufficient. The existence of prior
private translation helpers does not make moving that responsibility into the
translator premature, and no independent second caller is required.

Meridian's refactor correctly expresses that ownership:

```python
except pyodbc.Error as pyodbc_error:
    raise TranslatorOrderStoreExceptions.translate_place_order_exception(
        pyodbc_error, order_placement_request.order_reference, order_placement_request.customer_id
    ) from pyodbc_error
```

Do not recommend moving this capability back solely to satisfy methods-first,
and do not add structural assertions requiring translation to stay private.
The translator's actual implementation remains reviewable under applicable
rules. A class named Translator or Helper without a distinct responsibility
does not qualify for this exception.

A separately testable HTTP exception translator is also an independently
justified boundary responsibility, with Chapter 56 owning that extraction.
Methods-first violations have `warning` severity. A separately proven
Chapter 1 dependency or placement defect has its own correction and severity;
it neither escalates this extraction ID nor disappears because the class's
responsibility is justified.

---

## Method Types: Actions vs Queries

Methods fall into two distinct categories with specific contracts. This separation eliminates ambiguity and removes unnecessary conditionals from calling code.

The mechanism that makes this work is simple: exceptions do not return. If a method cannot fulfill its contract, it does not return a weaker value, a status code, `None`, or a wrapper. It raises. If execution reaches the next line, the previous method fulfilled its contract.

### Action Methods (Commands)

Action methods perform tasks or state changes. They are "doers."

**Rules:**

- **Return `None`** - Actions have no reason to send information back to the caller
- **No success/failure indicators** - Never return booleans or status codes (1 for success, -1 for failure)
- **Failure = Exception** - If the action cannot complete, raise an exception; never return a failure status

**Exception - Resource Creation:** When an action creates a new resource (e.g., inserting a record), the method may return the newly created ID. However, it must never return a status code for failure. If creation fails, raise an exception.

**Exception - Process Protocol:** A CLI adapter may return an integer consumed
as the process exit status, including forwarding a child process's
`CompletedProcess.returncode` into `sys.exit(run_tests(...))`. A documented
configuration failure may also select the CLI's failure code. That adapter
implements the process protocol; ordinary application callers must still
receive meaningful exceptions rather than interpret action status integers.
Resource cleanup remains unconditional, including on a nonzero child status.

```python
# GOOD - Action method
def send_notification(notification: UserNotification) -> None:
    # Either succeeds or raises exception
    ...

# GOOD - Resource creation returns ID only
def create_customer(customer_data: CustomerCreationData) -> CustomerId:
    # Returns ID on success, raises exception on failure
    ...

# BAD - Returns success indicator
def send_notification(notification: UserNotification) -> bool:
    # Caller now needs: if send_notification(...): ...
    ...

# BAD - Returns status code
def create_customer(customer_data: CustomerCreationData) -> int:
    # Returns 1 for success, -1 for failure - NEVER do this
    ...
```

### Query Methods (Information Providers)

Query methods retrieve and return data. They answer questions.

**Rules:**

- **Return what is claimed or do not return at all** - If a method claims to return a `Customer`, it returns a `Customer` or raises an exception. No middle ground.
- **No "safe" defaults or status wrappers** - Do not return `Optional`, `Result[T, Error]`, or union types that wrap error information alongside data
- **No `None` for "not found"** - If the caller expects a specific result and it cannot be provided, raise an exception

**Exception - Collection Queries:** Methods returning collections should return an empty collection (not `None`) when no items match. An empty result is a valid answer to "what items match this criteria?"

Chapter 9 owns the retrieve/search/find absence contract and the independent
requirement to keep the operation's name consistent through its flow. Do not
also report the same return-or-raise correction under Chapter 5. Chapter 5
retains other promised single-entity query failures and failure-wrapper
contracts. A reusable comparison returning None on success or a complete
failure report is not a missing-entity query and remains permitted.

```python
# GOOD - Returns claimed type or raises
def get_customer(customer_id: CustomerId) -> Customer:
    customer: Customer | None = self._repository.find(customer_id)
    if customer is None:
        raise CustomerNotFoundException(customer_id)
    return customer

# GOOD - Collection returns empty list, not None
def get_orders_for_customer(customer_id: CustomerId) -> list[Order]:
    # Returns [] if no orders exist - this is valid
    return self._repository.find_orders(customer_id)

# BAD - Returns None for not found
def get_customer(customer_id: CustomerId) -> Customer | None:
    # Caller now needs: if customer is not None: ...
    ...

# BAD - Wraps result with error info
def get_customer(customer_id: CustomerId) -> Result[Customer, str]:
    # Caller now needs to unwrap and check
    ...
```

### Cardinality Is Intent

When a query applies criteria, the expected cardinality is part of the contract; encode it, don't dodge it:

- **Exactly one expected**: the analyst said this criteria yields one record. Write the query to raise when it finds zero *or more than one*: both mean the analysis or the data is wrong, and finding that out is the point. Do not use a first-match call to quietly survive the ">1" case; that converts an analysis error into silent nondeterminism.
- **First-of-many expected**: only when multiple matches are genuinely valid and any one will do, and the name/shape should make that plain.

Exactly-one need not mean reading every row when the supplied SQL predicate,
unique constraints, and join multiplicity already prove at most one. A query
by a unique order reference without a multiplying join may use `fetchone()`
and retain its missing-row diagnostic. A primary-key join to one messaging
state row preserves that bound. Require duplicate detection when the bound is
unproven or a one-to-many join can multiply rows; do not infer duplicates from
the API name alone. This proof applies to the supplied query/schema contract,
not to an uninspected deployed database.

When an exactly-one query fails its cardinality, the raised exception must carry the **criteria and their values** ("expected exactly one policy for policy_number=X, effective_date=Y; found 3"); a bare "sequence contains more than one element" gives the analyst nothing to work with (Chapter 6 message rules). A small `single_else_raise(items, error_context)` helper standardizes this.

Do not fabricate existence checks from queries that raise: catching `CustomerNotFoundException` inside `does_customer_exist()` to return a boolean is the one genuine misuse of exceptions as control flow: write a real existence query instead.

Cardinality Is Intent exclusively owns that catch-to-boolean existence correction. Do not duplicate the same replacement under generic catch/swallow or predicate purity. Independently lost unrelated failures, hidden-state preconditions, and business-predicate defects that remain after the replacement retain their own rules.

### The Shared Principle: Execution Implies Success

The goal of this separation is **fearless code after method calls**:

- If execution reaches the line after a method call, the operation succeeded
- No need to check return values, unwrap optionals, or test for `None`
- Eliminates the "sea of ifs" where every call is followed by defensive checks

```python
# Fearless calling code - no conditionals needed
def process_order(order_id: OrderId) -> None:
    order: Order = get_order(order_id)                    # Either returns Order or raises
    customer: Customer = get_customer(order.customer_id)  # Same guarantee
    validate_order(order)                                 # Succeeds or raises
    send_confirmation(customer, order)                    # Succeeds or raises
    # If we reach here, everything worked
```

---

## Code Review Checklist

When reviewing method design, verify:

### Orchestration

- [ ] Public methods orchestrate - they describe WHAT happens, not HOW
- [ ] Public methods read like high-level workflow descriptions
- [ ] Steps are delegated to well-named submethods or other classes
- [ ] Complex private methods also orchestrate (no deeply nested logic)
- [ ] Trivial methods are not over-engineered with forced extraction

### Consistent Abstraction Levels

- [ ] Each method operates at a consistent "altitude" throughout
- [ ] No mixing of orchestration-level calls with inline implementation details
- [ ] If a method orchestrates some steps, it orchestrates all steps (no partial extraction)
- [ ] Business rule methods (boolean conditionals) are distinguished from delegation steps
- [ ] After supporting calls and distinct implementation responsibilities are excluded, intra-class orchestration has at most two edges from level zero and cross-class orchestration has at most three methods

### Conditionals

- [ ] Short prerequisite branches remain visible; substantial implementation is delegated without skipping independent work
- [ ] Boolean parameters are not used as hidden mode switches
- [ ] Predicate-style boolean returns answer domain questions, not success/failure
- [ ] Repeated business-rule conditions are extracted to one named predicate, policy, or polymorphic design
- [ ] No redundant safety checks after internal calls whose contracts already guarantee the state

### Actions vs Queries

- [ ] Application actions return `None` or a newly created resource ID and raise on failure; a proven CLI adapter may return a process exit code
- [ ] Query methods return the claimed type or raise an exception
- [ ] Query methods never return `None` for "not found" (raise exception instead)
- [ ] Collection queries return empty collections, not `None`
- [ ] Retrieve/search/find absence and mid-flow name consistency retain their Chapter 9 owner; comparison-report success is not entity absence

### Method Parameters

- [ ] Methods receive only what they need (need-to-know basis)
- [ ] No parameter validation - caller's data, caller's problem
- [ ] Operation-specific data is passed explicitly; no prior method call must populate hidden mutable instance state
- [ ] Immutable constructor state and injected collaborators remain valid transitive inputs
- [ ] Predicate queries evaluate explicit inputs without dependency queries or side effects; the ordinary autonomous-operation injection allowance does not waive predicate purity

### Exception Handling

- [ ] No catching exceptions just to log and rethrow
- [ ] Exceptions caught only when truly handled (retry, translation)
- [ ] Happy path code only - no "safe" defensive patterns
