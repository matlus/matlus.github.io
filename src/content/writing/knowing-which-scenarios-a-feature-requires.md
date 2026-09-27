---
title: "Knowing Which Scenarios a Feature Requires"
description: "A green suite needs correct scenarios for established requirements. An obligation map connects each rule to its arrangement, expected outcome, independent observation, and assertion."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "requirements-traceability", "verification", "code-review", "csharp"]
hero: knowing-which-scenarios-a-feature-requires
---

An active customer places an order. We need to know whether the system used the
catalog prices, recorded every line, notified fulfillment, and prepared the
correct confirmation for that customer. A green test gives us useful confidence
only if its scenario and assertions cover what the feature requires.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

Before that test is written, the team establishes the business requirements,
acceptance criteria, functional requirements, and non-functional requirements.
It then verifies that the test scenarios and expectations correctly cover them.
When the required suite is green under those conditions, the team has confidence
to go to production.

This article uses Meridian's Place Order feature to show how to make those
connections. An **obligation map** records each requirement, the scenario that
exercises it, where the test gets its actual results, and what it compares.

## Begin with the established feature requirements

Place Order specifies who may order, what a line contains, where prices come from,
how totals are calculated, and which orders require review. It defines what an
accepted order records and communicates. It also defines rejection, idempotency,
partial failure, and the outstanding work after a downstream action fails.

Its acceptance criteria make these rules concrete. AC-01 describes an active
customer ordering three Widgets and two Gadgets. The stated catalog prices yield
a total of $558.97. The order is recorded, fulfillment is notified, a confirmation
email is sent, and the caller receives the accepted outcome.

The specification also names technical and non-functional obligations. Transaction
integrity, concurrent duplicate handling, canonical SKU identity, bounded retry,
and safe failure diagnostics need verification. Several arise from the chosen
implementation, so developers must identify and explain them.

The source uses BR, AC, TR, and NFR identifiers. Its functional obligations appear
in the business rules, acceptance criteria, and technical requirements; it does
not introduce a separate FR numbering scheme. We preserve those identifiers when
mapping the supplied requirements.

The approved requirements supply the expected behavior. The current implementation
shows how that behavior is implemented. A test expectation needs to remain anchored
to the requirement when the implementation changes.

## Break each outcome into verifiable obligations

Take the accepted-order criterion. Saying that the order was placed leaves too
much unspecified for a useful test. The criterion tells us what must be correct:

| Required outcome | Evidence the test needs |
| --- | --- |
| Correct result for the caller | The returned reference, total, and status |
| Correct order record | Independent readback of customer, status, total, and placement time |
| Correct order lines | Every canonical SKU, product name, quantity, catalog unit price, and line total |
| Correct fulfillment notification | The received payload, including identity, lines, total, and placement time |
| Fulfillment notified once | The required message and an observation for an additional correlated message |
| Correct customer communication | Captured recipient, subject, body, order reference, path, and count |

Some rows contain many assertions. An order line has several required values.
A notification must propagate those values correctly. Treating an entire effect
as one obligation makes the test readable; it does not reduce the comparison to
a presence check.

This is why assertion depth belongs in a completeness review. A test can exercise
the right scenario and still leave a required field unverified.

## Record the connection from requirement to assertion

<!-- diagram:start requirement-to-evidence -->
<figure class="article-diagram">
<svg id="requirement-to-evidence" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 745" role="img" aria-labelledby="requirement-to-evidence-title requirement-to-evidence-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="requirement-to-evidence-title">Requirement to scenario to actual comparison</title>
<desc id="requirement-to-evidence-desc">The arithmetic rule and accepted-order criterion determine the arrangement and expected total. The public operation executes, then independently observed caller, database, and fulfillment totals are each compared against that expectation.</desc>
<defs><marker id="requirement-to-evidence-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="65" y="25" width="510" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="320.0" y="72.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">BR-5: sum of line totals</tspan><tspan x="320.0" dy="33">AC-01: accepted order</tspan></text><path d="M 320 135 L 320 180" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#requirement-to-evidence-arrow)"/><rect x="65" y="185" width="510" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="320.0" y="216.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Valid scenario arrangement</tspan><tspan x="320.0" dy="33">live catalog prices; expected</tspan><tspan x="320.0" dy="33">totals</tspan></text><path d="M 320 295 L 320 340" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#requirement-to-evidence-arrow)"/><rect x="65" y="345" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="409.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Execute public operation</tspan></text><path d="M 320 455 L 320 500" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#requirement-to-evidence-arrow)"/><rect x="65" y="505" width="510" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="320.0" y="552.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Observe caller, store, and payload</tspan><tspan x="320.0" dy="33">compare each required total</tspan></text><text x="320" y="680" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Trace each requirement to actual checks</tspan><tspan x="320" dy="33">Review coverage and expected values</tspan></text>
</svg>
<figcaption>Trace the rule through a valid arrangement, independent expectations, the public operation, and every required comparison. A scenario name alone cannot establish coverage.</figcaption>
</figure>
<!-- diagram:end requirement-to-evidence -->

An obligation map makes the review concrete. For each obligation, record:

1. The source requirement and the rule it expresses.
2. The scenario, including any same-rule data rows.
3. The conditions that make the arrangement valid for that scenario.
4. The independently established expected outcome.
5. The observation used to gather what actually happened.
6. The assertion that compares the required outcome.

For AC-01's order total, the map connects BR-5's formula to the catalog products
read during Arrange. The test calculates each expected line total as quantity
times unit price and adds the results. It observes the caller's result, reads
the stored order, and receives the fulfillment payload. Its asserters compare
the total in each required representation.

Here is the calculation used in the successful-order test. The products have
already been read from the database during Arrange:

```csharp
/// Arrange: apply BR-5 to the prices read from the product catalog.
decimal expectedFirstLineTotal = firstCatalogProduct.UnitPrice * firstLineQuantity;
decimal expectedSecondLineTotal = secondCatalogProduct.UnitPrice * secondLineQuantity;
```

The test adds those amounts when building the expected order. It gathers the
actual stored values only after invoking the operation:

```csharp
/// Assert: read what the operation stored and published.
var actualRecordedOrder = DataManagerForTest.GetRecordedOrder(orderPlacementRequest.OrderReference);
var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualExtraFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualPlacementWindowEndUtc = DateTime.UtcNow;
```

The order total in the return value, database record, and fulfillment message must
each match the total established during Arrange. Reading actual values from the
system is necessary: comparing two expected models would tell us nothing about
what the operation did. The [full test and aggregate asserter](/writing/one-order-every-obligation/)
show those comparisons together.

Here is the stored-total comparison inside AsserterOrderStore. It compares the
expected amount with the value read from the order record and adds a useful
failure message when they differ:

```csharp
/// Assert: compare the expected total with the actual database value.
if (actualRecordedOrder.OrderTotal != expectedOrderTotal)
{
    assertionFailures.Add(
        $"Expected Order Total: {expectedOrderTotal}\n" +
        $"Actual Order Total:   {actualRecordedOrder.OrderTotal}\n" +
        $"Order Reference:      {orderReference}\n" +
        $"\nBusiness Rule Violated:\n  BR-5: the order total is the sum of quantity times catalog unit price across all lines.\n");
}
```

This excerpt comes from the helper's comparison method. The
complete asserter
also checks the customer, status, placement time, and complete order lines.
A map entry should identify those comparisons as well as the scenario name.

For the confirmation email, BR-8 supplies the destination and content obligations.
The test uses the customer's address on file, captures the gateway's outbound
request, and compares its fields. The production composer used to build expected
content has independent class tests that establish its output. Reusing that
composer carries a verification responsibility of its own.

Meridian intentionally captures the request without a separate running email
service. With a stable real provider, the production arrangement can preserve the
original request, redirect delivery to a controlled test address, and read the
message from that inbox. The map then records two observations: the original
customer recipient and content, and the delivered message at the test destination.
The [email explanation](/writing/functional-acceptance-testing-at-the-boundary/#the-email-problem-and-the-two-ways-to-handle-it)
shows why both matter.

The [Place Order obligation map](/writing/knowing-which-scenarios-a-feature-requires/#place-order-obligation-map) records the feature-level
requirements and the detailed AC-01 connections. The [complete walkthrough](/writing/one-order-every-obligation/)
shows the test and the mechanisms behind those connections.
The [Customer Registration map](/writing/knowing-which-scenarios-a-feature-requires/#customer-registration-obligation-map) applies the same
review to its 25 BR/AC identifiers and records the expected observations for its no-return operation.

## Review the arrangement as carefully as the expectation

A test named for a particular scenario has to create its defining conditions.
Consider the review threshold. The business rule releases an order whose total
is $10,000.00 or less and holds a higher total for review.

The exact-threshold scenario uses four units of the Calibration Rig. The test
reads that product's current catalog price and checks that the arranged total
is exactly $10,000.00 before calling the service. If the seed price changes, the
guard reports that the catalog no longer supports the named scenario.

Here is the arrangement guard from the exact-threshold scenario. These selected
statements show the price read and premise check; the
source method
also builds the request and expected order:

```csharp
/// Arrange: establish that this scenario lands exactly on the threshold.
var catalogProduct = DataManagerForTest.GetCatalogProduct(DataGenerators.CalibrationRigSku);
int atThresholdQuantity = 4;
decimal expectedOrderTotal = catalogProduct.UnitPrice * atThresholdQuantity;
Assert.True(
    expectedOrderTotal == AcceptanceTestConstants.HeldForReviewThresholdTotal,
    $"AC-09 arrange guard: {atThresholdQuantity} x {catalogProduct.Sku} totals {expectedOrderTotal}, not exactly " +
    $"{AcceptanceTestConstants.HeldForReviewThresholdTotal} - the seeded catalog no longer supports this boundary scenario");
```

Although this uses Assert.True, it belongs to Arrange: it checks that the inputs
create the promised scenario. After Act, the outcome assertions check whether the
system released that order and produced the required records and communications.

Without the guard, the test could continue passing while exercising a different
total. Its name and requirement reference would then describe behavior it no
longer demonstrates.

The ordinary accepted-order scenario uses constrained random selection. Its
prices are capped so that any permitted draw remains within the Placed threshold.
Randomness varies inputs inside the named scenario. The defining business
conditions remain deliberate.

Apply the same review to inactive customers, unknown products, conflicting
resubmissions, and transaction failures. The setup must establish the condition
the test claims to verify.

## Include refusals, absence, and partial failure

An invalid request must return the specific reason for rejection. It must also
leave no order or outbound work. Both parts belong to the outcome.

The rejected-path scenarios cover unknown and inactive customers, missing lines,
invalid quantities, unknown products, and duplicate products. Quantity rows of
0 and 101 demonstrate rejection outside the allowed range. Rows of 1 and 100
demonstrate the inclusive boundaries. Those are separate claims about the rule.

A failure before recording completes differs from a failed action afterward.
Meridian's rollback scenario delays an order-line insertion in a private database
until the SQL command times out. It then checks the affected table counts and
outbound absence. The arrangement requires the actual transaction to begin, so
the test verifies rollback after work has started.

After commit, the business requires the accepted order to stand. A failed
fulfillment action must remain owed, while email proceeds when possible. A failed
email must remain owed after fulfillment succeeds. A failure to record completion
must preserve the accepted order and report the resulting uncertainty.

Those requirements explain the business-required catches in the production path.
The tests verify their intended outcomes, including durable action state and
diagnostic evidence. Catching a defined operational failure to implement that
policy belongs to the feature's behavior.

## Review technical and non-functional requirements too

Business acceptance examples do not enumerate everything developers need to
verify. A unique order-reference constraint must arbitrate concurrent requests.
A malformed database response must be translated into a meaningful failure.
An email retry must honor the required delay and stop after the bounded policy.
Failure diagnostics must remain safe and bounded even when a provider returns
an oversized body or the connection drops while it is read.

These obligations come from the feature's technical and non-functional requirements.
They join the same maintained suite, with the same requirement for correct
arrangements, expectations, and observable evidence.

Some requirements concern implementation structure directly, such as using one
stored procedure for the ordinary placement transaction. Source and code review
establish those structural facts. The functional scenarios establish the resulting
behavior. Record which evidence answers which obligation rather than assigning
proof to a test that does not contain it.

## Establish who reviews what

The product team confirms the business requirements and the scenarios that
express them. Developers confirm technical obligations and the arrangements
and assertions needed to verify them. Review includes the expected values and
required absence, because either can be wrong even when a test passes.

The executable scenarios can be presented in a form stakeholders can review.
That presentation needs to remain tied to the source scenarios. If the team
uses formal sign-off, the reviewed version, ownership, and triggers for renewed
approval should be explicit.

When the business intentionally changes a rule, the affected scenarios and
expectations change with it. When an implementation change breaks an unchanged
rule, the existing scenario should expose the regression.

## Preserve what the team learns

A completeness review addresses the obligations established for the feature.
The team will also learn from later review, QA, exploratory work, generators,
mutation analysis, and incidents. Each discovered behavioral obligation needs
a permanent place in the maintained suite.

Sometimes that means adding a named scenario. Sometimes it means another data
row for the same rule or an assertion for a previously unchecked field. A
mistaken expectation requires correction against the requirement.

The release condition remains precise: the requirements have been established,
the scenarios and expectations correctly cover them, and the assembled system
passes those checks. That is how the team gives meaning to a green result and
earns confidence to go to production.


## Place Order obligation map

This is the supporting requirement-to-evidence map for the scenario-completeness
article and the order walkthrough. It uses ORD-001 at Meridian revision
`501e097f66b884615f517c5252d1ab719709f421`.

The supplied specification identifies business requirements, acceptance criteria,
technical requirements, and non-functional requirements. Functional obligations
are expressed within those sections. Their established correctness and the
correctness of the scenarios and expectations are prerequisites for release
confidence. This source map records where the evidence resides; its rows do not
constitute a separate sign-off on every requirement.

### Feature-wide requirement destinations

The evidence column distinguishes asserted outcomes, production structural review,
and reviewed provider contracts. A test reference cannot stand in for an assertion
or certify an architectural property it does not observe.

| Requirement | Required behavior or condition | Evidence locations | What to examine |
| --- | --- | --- | --- |
| BR-1 | Existing active customer | ExpectedPaths<br>RejectedPaths | Customer rows in Arrange; typed rejection and no-trace checks for unknown/inactive customers. |
| BR-2 | Nonempty valid lines; inclusive quantities; case-insensitive SKU identity | ExpectedPaths<br>RejectedPaths<br>EdgeCases | Accepted complete lines, refusal variants, quantities 0/101 and 1/100, canonical input/output. |
| BR-3 | One line per product regardless of casing | RejectedPaths | Differently cased repeated product refused; no order, message, or email. |
| BR-4 | Catalog prices at placement | ExpectedPaths | Read catalog in Arrange; derive expected line totals; compare stored and outbound values. |
| BR-5 | Complete order and correct arithmetic | ExpectedPaths<br>EdgeCases | Caller total, independent stored header and ordered lines, placement window, wire values. |
| BR-6 | Placed at or below threshold; higher totals held; complete fulfillment | ExpectedPaths<br>EdgeCases | Success/held/exact-threshold outcomes, payload content and correlated presence/absence. |
| BR-7 | Idempotency and conflicting reuse | EdgeCases<br>TechnicalRequirements | Original outcomes, unchanged stored content, no repeated actions, concurrent allowed outcomes. |
| BR-8 | One correct email to address on file | ExpectedPaths<br>FailurePaths<br>TechnicalRequirements | Captured recipient/path/content/count; composer class tests; retry and pending-action scenarios. |
| BR-9 | Specific rejection with no trace | RejectedPaths | Exact domain failure details; keyed order count, correlated message absence, no captured email. |
| BR-10 | Atomic recording; preserve accepted order and outstanding work | Rollback<br>FailurePaths<br>CompletionRecordingFailure | Affected-table counts after real timeout; accepted result, durable action states, independent progress and warnings. |
| AC-01 | Accepted ordinary order | ExpectedPaths | Detailed clause map below; aggregate caller/store/message/absence/email comparison. |
| AC-02 | Held for Review | ExpectedPaths | Complete held-order aggregate, no fulfillment, NotRequired action state, review email and accepted caller result. |
| AC-03 | Unknown customer | RejectedPaths | Customer-not-found failure and no-trace comparison. |
| AC-04 | Inactive customer | RejectedPaths | Inactive-customer failure and no-trace comparison. |
| AC-05 | No line items | RejectedPaths | Empty-list refusal; additional null-request/list/entry/SKU scenarios support the same input boundary. |
| AC-06 | Quantity outside range | RejectedPaths | Same-rule theory includes 0 and 101; failure classification and absence. |
| AC-07 | Unknown product refuses entire request | RejectedPaths | Mixed valid/unknown lines produce a typed rejection and no accepted partial order. |
| AC-08 | Repeated product | RejectedPaths | Differently cased duplicate SKUs refused, with no effects. |
| AC-09 | Exactly $10,000.00 | EdgeCases | Live Calibration Rig price, exact-total Arrange guard, complete AC-01 outcome. |
| AC-10 | Identical resubmission | EdgeCases<br>TechnicalRequirements | Original result and original records; no additional fulfillment or email, including a pending-email replay. |
| AC-11 | Conflicting resubmission | EdgeCases<br>TechnicalRequirements | Typed conflict; original record and effect preservation; competing-content race. |
| AC-12 | Recording failure | FailurePaths<br>Rollback | Unavailable store and real mid-write timeout; typed temporary failure, rollback counts, outbound absence. |
| AC-13 | Fulfillment unavailable after commit | FailurePaths | Accepted order, fulfillment Pending, independent correct email, classified logged failure. |
| AC-14 | Email unavailable after commit | FailurePaths<br>EmailServiceResponseBodies | Accepted order, fulfillment completion, email Pending, retry and safe diagnostics. |
| AC-15 | Quantities 1 and 100 accepted | EdgeCases | Same-rule boundary-valid rows with complete AC-01 comparison. |
| TR-1 | Configuration-selected message broker | TechnicalRequirements | Real RabbitMQ execution in this run; provider adapters and configuration supply the structural evidence. |
| TR-2 | Synchronous HTTP email integration | ExpectedPaths<br>TechnicalRequirements | Production gateway runs through the controlled handler; capture, content, response and retry observations. |
| TR-3 | Use provisioned destinations; fail on mistyped destination | TechnicalRequirements | Reachable broker with unprovisioned destination; explicit failure and retained required action. |
| TR-4 | Destination default and explicit override | Configuration tests | Configuration-provider destination default/override class tests; production configuration source. |
| TR-5 | One placement procedure/transaction; further read on resubmission | ResubmissionDataFaults<br>MalformedCodedError<br>Rollback | Production data-manager and SQL source establish call structure; scenarios verify translated failures, readback contract, and rollback. |
| TR-6 | Unique constraint arbitrates concurrent references | TechnicalRequirements | Identical/different-content overlap; allowed results and one recorded order; schema confirms constraint. |
| TR-7 | Atomic Pending/NotRequired state and completion evidence | ExpectedPaths<br>FailurePaths<br>TechnicalRequirements<br>CompletionRecordingFailure | State readback and completion timestamp presence; held-order NotRequired, retained Pending, replay without repeated work. |
| TR-8 | Classified exceptions, single raise sites, contextual identity | RejectedPaths<br>FailurePaths<br>ResubmissionDataFaults | Type/message/status/severity/context comparisons; single-site ownership is established by production code review. |
| TR-9 | Refuse over-capacity identifiers before persistence | RejectedPaths | Order/customer/SKU length variants and failure/absence comparisons. |
| TR-10 | Canonical SKU identity throughout | ExpectedPaths<br>RejectedPaths<br>EdgeCases | Swapped-case inputs, canonical stored/wire records, duplicate refusal, idempotent casing variation. |
| TR-11 | Failed completion recording preserves placement and ambiguity | CompletionRecordingFailure | Accepted effects, successful caller outcome, both actions Pending without stamps, two action-specific warnings with SQL causes. |
| TR-12 | Expected operational failures isolated; unexpected defects fail fast | FailurePaths<br>PlacementReadbackFaults<br>ResubmissionDataFaults | Expected families have complete state/log outcomes; production policy review establishes unexpected-failure propagation. |
| TR-13 | Restricted identifier alphabet | RejectedPaths | Disallowed-character theory refuses values at the front door and checks no trace. |
| NFR-1 | Bounded transport retry preserves obligation | TechnicalRequirements<br>FailurePaths | Transient failure recovery, Retry-After arrival gap, exhausted attempts and durable Pending state. |
| NFR-2 | No retry for permanent failure | FailurePaths | Permanent rejection provider row asserts its attempt count and retained email obligation. |
| NFR-3 | Finite attempts | FailurePaths | Configured finite retry count; exhausted request leaves email Pending and caller accepted. |
| NFR-4 | Absorbed failures logged; bounded sanitized diagnostics | FailurePaths<br>CompletionRecordingFailure<br>EmailServiceResponseBodies | Exception identity/context/severity, at most 8192 consumed bytes, bounded whole-character excerpt, redaction, status preserved after read failure. |
| NFR-5 | Construction performs no dependency I/O | Manager construction | Composition and component-constructor review establish lazy dependency use; unavailable-dependency scenarios demonstrate use-time failure. |
| NFR-6 | Agreed downstream operational contracts delimit handling | Defined operational contract | Reviewed provider contract defines required success/failure conditions and reasonable Retry-After values; no claim to anticipate arbitrary downstream behavior. |

### AC-01: detailed obligation map

The scenario reads two distinct eligible catalog products and uses quantities of
3 and 2. It caps eligible prices to preserve the Placed outcome and derives the
expected total using BR-5. It submits swapped-case SKUs and expects canonical
identity in recorded and outbound values.

| Required fact | Expected source | Observation | Actual comparison |
| --- | --- | --- | --- |
| Caller reference | Arranged request reference | PlaceOrderAsync result | Record equality in CompareOrderPlacementResult |
| Caller total | Quantity times selected catalog price, summed | PlaceOrderAsync result | Record equality in CompareOrderPlacementResult |
| Caller status | Placed for the constrained total | PlaceOrderAsync result | Record equality in CompareOrderPlacementResult |
| Correct stored order identity | Reserved order reference | Independent SQL read keyed by reference | GetRecordedOrder requires a matching row; the store asserter has no separate expected-reference parameter |
| Stored customer | Arranged active customer ID | Independently read header | CompareCustomerStatusAndTotal |
| Stored status | Placed | Independently read header | CompareCustomerStatusAndTotal |
| Stored total | BR-5 arithmetic | Independently read header | CompareCustomerStatusAndTotal |
| Placement time | Test-stamped operation/gathering interval | Independently read header timestamp | ComparePlacementTime with one-minute clock-skew allowance |
| Exactly two stored lines | Two distinct selected products | Independently read ordered lines | SequenceEqual compares count and complete records |
| Canonical SKU on every line | Catalog SKU, independent of submitted case | RecordedOrderLine.Sku | Complete record equality within SequenceEqual |
| Product name on every line | Selected catalog row | RecordedOrderLine.ProductName | Complete record equality within SequenceEqual |
| Quantity on every line | Arranged quantities 3 and 2 | RecordedOrderLine.Quantity | Complete record equality within SequenceEqual |
| Unit price on every line | Selected catalog price | RecordedOrderLine.UnitPrice | Complete record equality within SequenceEqual |
| Line total on every line | BR-5 quantity times price | RecordedOrderLine.LineTotal | Complete record equality within SequenceEqual |
| Fulfillment reference and customer | Arranged identities | Correlated broker payload | CompareNotification compares both fields |
| Fulfillment complete lines | Expected lines rendered to wire shape | Broker payload line sequence | SequenceEqual over complete wire-line records |
| Fulfillment total | Expected total formatted with invariant F2 | Broker payload total | CompareNotification string equality |
| Fulfillment placement time | Independently read stored timestamp | Parsed broker timestamp | CompareNotification exact timestamp equality |
| Fulfillment notified once in the observation | One required message and no extra correlated message | Receive followed by one-second quiet window | CompareNoMessageArrived on extra-message observation |
| Email recipient | Arranged customer's address on file | Captured request recipient | CompareEmailContent |
| Email subject and complete body | Independently class-tested production composer over expected order | Captured request subject/body | CompareEmailContent exact equality |
| Email order reference | Expected order reference | Captured request reference | CompareEmailContent |
| One email request at required endpoint | Count 1, independent /emails contract | Captured requests and request paths | CompareExactlyOneEmailSent count/path/content comparisons |

The composite asserter gathers the comparison reports for five obligation groups:
caller, store, fulfillment content, extra-message absence, and email. It reports
all available discrepancies together. Those groups contain the individual field
checks recorded above.

### Reading the evidence together

Use [the complete walkthrough](/writing/one-order-every-obligation/) for the full
test, composite method, supporting techniques, and recorded selected-run results.
Use the feature specification for the intended outcomes and production source for
structural facts. A passing selected run records execution in that environment.
Correct coverage and correct expectations are established through the feature's
requirements and scenario review.


## Customer Registration obligation map

This map complements the Place Order map. Its source is the
CUS-001 feature specification.
The specification contains ten BR identifiers and fifteen AC identifiers. It
does not supply separate FR, TR, or NFR numbering. Functional rules and technical
verification still need review; do not invent identifiers to make the map appear
complete.

The executable evidence comes from the complete registration
expected paths,
refusals,
edge cases,
failures,
and rollback.

The success asserter compares supplied values with an independent database read,
counts customers for the reserved email, and verifies system-added identity and
bounded registration time. The refusal scenarios compare specific exceptions,
problem information, and unchanged customer counts or records as appropriate.
This is a source-based review map, not a certification that every possible input
has been executed.

| Requirement | Scenario and defining arrangement | Actual observation and comparison |
| --- | --- | --- |
| BR-1 | Full/minimal request; invalid opt-in; unexpected fields | Recorded fields or refusal naming values/fields; no new customer after refusal |
| BR-2 | Missing, empty, or whitespace required fields | All required problem names and absence of a new customer |
| BR-3 | Valid email or deliberately malformed address | Accepted normalized record or specific malformed-email refusal |
| BR-4 | Submit changed email casing; arrange duplicate casing | Lowercase recorded email and case-insensitive duplicate outcome |
| BR-5 | Existing same email/name, same email/different name, shared name/new email | Specific refusal or separate accepted record; privacy and original preservation |
| BR-6 | Complete address, incomplete address, no address, state alone | Every missing required address component or exact stored optional values |
| BR-7 | Several request problems; dirty request with duplicate email | One accumulated refusal for the current stage; uniqueness only after request is clean |
| BR-8 | Full/minimal accepted request | One customer, all supplied/absent/default values, Active status, generated identity, bounded time |
| BR-9 | Await RegisterCustomerAsync | Completion without returned data; resulting store still fully compared |
| BR-10 | Unavailable store or interrupted private-database write | Temporary failure distinct from refusal; no surviving partial customer |
| AC-01 | Full request with reserved email and all supplied fields | Exact count, lowercase email, all fields, Active status, nonblank identity, bounded time |
| AC-02 | Minimal builder with optional values absent | Four required values, absent optional fields, false opt-in, system-added values |
| AC-03 | First name and company absent | Both missing fields in refusal, no new record |
| AC-04 | Whitespace first name | Missing-name refusal, no new record |
| AC-05 | Email lacks required structure | Malformed-email refusal names the submitted value, no new record |
| AC-06 | Existing customer; case variants of email and matching names | Same-customer refusal; original customer unchanged |
| AC-07 | Existing email with a different submitted name | Different-name refusal, no disclosure of existing names, original unchanged |
| AC-08 | Street/city supplied; postal code/country absent | Both missing address parts reported, no new record |
| AC-09 | Missing company, malformed email, street-only address | All five request problems together, no new record |
| AC-10 | Required fields and state alone | Accepted record retaining state with other address parts absent |
| AC-11 | Existing name, different reserved email | Accepted separate customer and preserved original |
| AC-12 | Recording unavailable or interrupted | Temporary failure and absent partial new record |
| AC-13 | Random unrecognized opt-in value | Submitted value and valid choices in refusal, no new record |
| AC-14 | Explicit forbidden field plus random unknown field | Both named in refusal; supplied status not honored; no new record |
| AC-15 | Existing email and missing name; then corrected request | First refusal contains request problem without premature duplicate disclosure; corrected request reaches duplicate policy |

### Follow no-return success into its actual state

The accepted-registration comparison follows the recorded values all the way into the stored customer:





Its helper compares email, names, company, status, optional fields, and opt-in.
The aggregate then checks a nonblank customer identifier and registration time
inside the operation window with the defined clock-skew allowance. Those are
the actual identity/time checks; the map does not claim a stronger identifier
format assertion than the code contains.

The specification's examples illustrate rules. Tests use fresh reserved email
identities and constrained arrangements rather than sharing those example
customers across runs. Existing-customer scenarios explicitly insert the customer
whose identity and privacy they need to preserve.

Technical limits introduced by the build, such as storage-driven lengths,
concurrent uniqueness, or provider translation, need their own scenarios and
review. A missing technical requirement cannot be repaired by pretending it
was part of a business maximum that the source explicitly does not define.

---

[Previous article](/writing/functional-acceptance-testing-at-the-boundary/) | [Series contents](/acceptance-testing/) | [Next article](/writing/one-order-every-obligation/)
