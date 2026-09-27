---
title: "Assertions That Verify the Whole Outcome"
description: "Assertions must compare every required field, count, and effect. Pure asserters separate observations from comparisons and report available failures together with verified expectations."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "verification", "model-design", "csharp"]
hero: assertions-that-verify-the-whole-outcome
---

The order operation returned success. We still need to establish whether it
recorded the correct customer and lines, used catalog prices, notified fulfillment
with the complete payload, and prepared the right confirmation. Those results
are the obligations of the successful-order scenario.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

An assertion compares what the requirement says should happen with what the
system produced. The business requirements, acceptance criteria, functional
requirements, and non-functional requirements must be established, and the
scenarios and expectations verified as correct. Deep comparisons then give meaning
to a green suite and support confidence to go to production.

The [complete order test](/writing/one-order-every-obligation/) shows the entire flow.
This article follows its actual results into the asserters.

## Gather actual values before comparing them

<!-- diagram:start expectations-and-actuals -->
<figure class="article-diagram">
<svg id="expectations-and-actuals" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 770" role="img" aria-labelledby="expectations-and-actuals-title expectations-and-actuals-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="expectations-and-actuals-title">Expected values meet observed values</title>
<desc id="expectations-and-actuals-desc">Expected values come from requirements and a valid arrangement. Actual values come from the executed system. Pure comparison helpers accumulate discrepancies after observations have been gathered; a gathering failure may stop the test earlier.</desc>
<defs><marker id="expectations-and-actuals-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="30" y="30" width="280" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="170.0" y="77.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Requirements</tspan><tspan x="170.0" dy="33">and valid Arrange</tspan></text><rect x="330" y="30" width="280" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="470.0" y="77.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Public operation</tspan><tspan x="470.0" dy="33">and actual effects</tspan></text><path d="M 170 140 L 170 185" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#expectations-and-actuals-arrow)"/><path d="M 470 140 L 470 185" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#expectations-and-actuals-arrow)"/><rect x="30" y="190" width="280" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="170.0" y="237.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Independent</tspan><tspan x="170.0" dy="33">expected values</tspan></text><rect x="330" y="190" width="280" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="470.0" y="237.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Gather actual</tspan><tspan x="470.0" dy="33">observations</tspan></text><path d="M 170 300 L 320 365" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#expectations-and-actuals-arrow)"/><path d="M 470 300 L 320 365" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#expectations-and-actuals-arrow)"/><rect x="65" y="370" width="510" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="320.0" y="417.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Pure comparisons</tspan><tspan x="320.0" dy="33">fields, counts, content, absence</tspan></text><path d="M 320 480 L 320 525" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#expectations-and-actuals-arrow)"/><rect x="65" y="530" width="510" height="110" rx="10" style="fill:var(--diagram-requirements-web-fill);stroke:var(--diagram-requirements-web);stroke-width:2"/><text x="320.0" y="577.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Report available discrepancies</tspan><tspan x="320.0" dy="33">across the obligation groups</tspan></text><text x="320" y="705" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">A gathering failure can stop this flow</tspan><tspan x="320" dy="33">before aggregate comparison</tspan></text>
</svg>
<figcaption>Keep expected values and actual observations independent. Pure asserters compare them and combine available discrepancies; missing observations require their own useful failure reports.</figcaption>
</figure>
<!-- diagram:end expectations-and-actuals -->

After calling PlaceOrderAsync, the scenario gathers:

- The result returned to the caller.
- A new database read of this order and its lines.
- The fulfillment message received from the broker.
- An observation for an extra message with the same reference.
- The email requests and paths recorded by this facade's Test Mediator.

Gathering is visible in the test. Asserters receive these observations as parameters.
They compare supplied values without opening a connection or receiving another
message. A reader can see where actuals came from, and the test controls observation
timeouts and correlation. The comparison can be reused with different observations.

Here is the complete stored-order comparison:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterOrderStore.cs; method: CompareCustomerStatusTotalLinesAndPlacementTime -->

```csharp
/// Assert: compare supplied expectations with the independent database read.
public static string? CompareCustomerStatusTotalLinesAndPlacementTime(
    string expectedCustomerId,
    OrderPlacementStatus expectedOrderPlacementStatus,
    decimal expectedOrderTotal,
    IReadOnlyList<RecordedOrderLine> expectedOrderLines,
    DateTime expectedPlacementWindowStartUtc,
    DateTime actualPlacementWindowEndUtc,
    RecordedOrder? actualRecordedOrder)
{
    if (actualRecordedOrder is null)
    {
        return OrderStoreAssertionFailedHeader + "Expected a recorded order; actual <missing>. Customer, status, total, lines, and time require the stored row.";
    }

    List<string> assertionFailures = [];
    assertionFailures.AddRange(CompareCustomerStatusAndTotal(expectedCustomerId, expectedOrderPlacementStatus, expectedOrderTotal, actualRecordedOrder));
    assertionFailures.AddRange(ComparePlacementTime(expectedPlacementWindowStartUtc, actualPlacementWindowEndUtc, actualRecordedOrder.PlacedAtUtc));
    assertionFailures.AddRange(CompareRecordedOrderLines(expectedOrderLines, actualRecordedOrder.OrderLines));

    return assertionFailures.Count == 0 ? null : OrderStoreAssertionFailedHeader + string.Join("\n", assertionFailures);
}
```

A missing order is reported before its fields are accessed. When the row exists,
the comparison evaluates customer, status, total, time, and lines and combines
the available discrepancies.

## Compare every field the obligation requires

The line comparison is small because RecordedOrderLine is a record containing
SKU, product name, quantity, unit price, and line total:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterOrderStore.cs; method: CompareRecordedOrderLines -->

```csharp
/// Assert: compare every recorded line and the complete sequence.
private static List<string> CompareRecordedOrderLines(
    IReadOnlyList<RecordedOrderLine> expectedOrderLines, IReadOnlyList<RecordedOrderLine> actualRecordedOrderLines)
{
    List<string> assertionFailures = [];
    if (!actualRecordedOrderLines.SequenceEqual(expectedOrderLines))
    {
        assertionFailures.Add(
            $"Recorded order lines do not match the expected lines (compared by SKU order).\n" +
            $"Expected Lines:\n  {string.Join("\n  ", expectedOrderLines)}\n" +
            $"Actual Lines:\n  {string.Join("\n  ", actualRecordedOrderLines)}\n" +
            $"\nBusiness Rules:\n" +
            $"  BR-2: each line names one catalog product and its quantity.\n" +
            $"  BR-4: unit prices come from the product catalog at the moment of placement.\n");
    }

    return assertionFailures;
}
```

SequenceEqual compares line records in order. Record equality covers their scalar
fields, and sequence equality covers the number of elements and their position.
A missing line, extra line, wrong quantity, wrong unit price, or changed name fails.

Expected and actual lines are both ordered by SKU. That convention is explicit
in catalog selection and database readback. If ordering is irrelevant to a
contract, use an order-independent comparison that preserves multiplicity.
Converting a list to a set can hide duplicates. Count and content both matter.

C# record equality also needs care when a record contains a collection. Equality
of the outer record does not automatically compare every element of an arbitrary
nested collection by value. Meridian's fulfillment asserter compares its line
collection explicitly and checks each required wire field.

| Observation | Required comparison |
| --- | --- |
| Caller result | Reference, total, and Placed status |
| Database order | Customer, status, total, and bounded placement time |
| Database lines | Every SKU, name, quantity, unit price, line total, and the complete sequence |
| Fulfillment message | Reference, customer, complete lines, total, and stored timestamp propagation |
| Extra notification | No additional correlated message in the quiet window |
| Confirmation request | Recipient, subject, body, order reference, path, and count |

These are AC-01's comparisons. Scenarios about pending or completed actions also
read OrderMessagingState and compare statuses and completion evidence. The AC-01
aggregate does not perform that separate query. Assertion depth follows each
scenario's obligations and must be reviewed against them.

## Counts and content both matter for email

Recording a request gives us actual values. We still need to compare its destination
and content and establish how many requests were made:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterConfirmationEmail.cs; method: CompareExactlyOneEmailSent -->

```csharp
/// Assert: check counts, paths, and every captured confirmation.
public static string? CompareExactlyOneEmailSent(
    ConfirmationEmailMessage expectedConfirmationEmailMessage,
    IReadOnlyList<CapturedEmailRequest> actualCapturedEmailRequests,
    IReadOnlyList<string> actualEmailRequestPaths)
{
    List<string> discrepancies = [];
    if (actualCapturedEmailRequests.Count != 1)
    {
        discrepancies.Add($"Email count: expected 1; actual {actualCapturedEmailRequests.Count}");
    }

    if (actualEmailRequestPaths.Count != 1)
    {
        discrepancies.Add($"Email path count: expected 1; actual {actualEmailRequestPaths.Count}");
    }

    foreach (string actualEmailRequestPath in actualEmailRequestPaths)
    {
        if (actualEmailRequestPath != EmailsResourcePath)
        {
            discrepancies.Add($"Email path: expected {EmailsResourcePath}; actual {actualEmailRequestPath}");
        }
    }

    foreach (CapturedEmailRequest actualCapturedEmailRequest in actualCapturedEmailRequests)
    {
        string? contentReport = CompareEmailContent(expectedConfirmationEmailMessage, actualCapturedEmailRequest);
        if (contentReport is not null)
        {
            discrepancies.Add(contentReport);
        }
    }

    return discrepancies.Count == 0 ? null : ConfirmationEmailAssertionFailedHeader + string.Join("\n", discrepancies);
}
```

The method checks all available captures. An extra request fails the count and
can also reveal wrong content. A missing capture reports the count without
indexing an empty collection. The resource path is written explicitly as /emails
in the asserter, independently of the gateway's path constant.

The email asserter
includes the field comparison:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterConfirmationEmail.cs; method: CompareEmailContent -->

```csharp
/// Assert: compare recipient, subject, body, and order reference.
public static string? CompareEmailContent(
    ConfirmationEmailMessage expectedConfirmationEmailMessage,
    CapturedEmailRequest actualCapturedEmailRequest)
{
    List<(string EmailFieldName, string ExpectedFieldValue, string? ActualFieldValue)> emailFieldComparisons =
    [
        ("recipient_email_address", expectedConfirmationEmailMessage.RecipientEmailAddress, actualCapturedEmailRequest.RecipientEmailAddress),
        ("subject", expectedConfirmationEmailMessage.Subject, actualCapturedEmailRequest.Subject),
        ("body", expectedConfirmationEmailMessage.Body, actualCapturedEmailRequest.Body),
        ("order_reference", expectedConfirmationEmailMessage.OrderReference, actualCapturedEmailRequest.OrderReference),
    ];
    List<string> emailFieldMismatches = emailFieldComparisons
        .Where(emailFieldComparison => emailFieldComparison.ActualFieldValue != emailFieldComparison.ExpectedFieldValue)
        .Select(emailFieldComparison =>
            $"Field:    {emailFieldComparison.EmailFieldName}\n" +
            $"Expected: {emailFieldComparison.ExpectedFieldValue}\n" +
            $"Actual:   {emailFieldComparison.ActualFieldValue}\n")
        .ToList();
    return emailFieldMismatches.Count == 0 ? null : $"{ConfirmationEmailAssertionFailedHeader}" +
        string.Join("\n", emailFieldMismatches) +
        "\nWhat could be wrong:\n" +
        "  * The composer's content changed without its class tests (and this expectation) being updated.\n" +
        "  * The wrong customer's email was used - BR-8 requires the address on file.\n" +
        "  * A different order's request was captured - compare the order_reference values above.\n";
}
```

Meridian captures the request and returns an arranged response. It does not read
an inbox message. With a real provider, the
[Test Mediator arrangement](/writing/the-test-mediator-and-the-transport-spy/) preserves
the original customer recipient, redirects delivery, and adds inbox observations.
Assertions verify both the intended submission and the delivered message.

## Use the comparison appropriate to each value

Store amounts are decimals. Fulfillment amounts travel as strings with invariant
two-decimal formatting. Compare the required wire representation too; a
locale-dependent string can violate the consumer's contract even if a loose numeric
comparison accepts its amount.

Timestamps have different obligations:

| Obligation | Comparison | What it establishes |
| --- | --- | --- |
| Recording time | Stored time inside the operation window, allowing one minute of clock skew | The value belongs to this placement window |
| Propagation | Message time parsed and compared with independently read stored time | The recorded value reached the message unchanged |
| Completion evidence | Timestamp presence alongside the expected action status | Required evidence exists or is absent |

For propagation, the stored timestamp supplies the expected value because the
claim is that the message carries that value. Its origin needs the separate bounded
check. Agreement between store and message alone allows the same incorrect time
to appear in both.

The store asserter
contains both time and action-state comparisons. Those state scenarios check
completion timestamps for presence; they do not predict exact clock values.

## Report independent failures together

A wrong total can reach the caller result, database, fulfillment, and email.
Stopping at the first mismatch requires repeated runs to discover the rest.
Meridian collects available reports and fails once:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterSuccessfulOrderPlacement.cs; method: AssertAllAc01ObligationsAreMet -->

```csharp
/// Assert: compare all five obligation groups and report their failures together.
public static void AssertAllAc01ObligationsAreMet(
    ExpectedSuccessfulOrderPlacement expectedSuccessfulOrderPlacement,
    DateTime expectedPlacementWindowStartUtc,
    DateTime actualPlacementWindowEndUtc,
    ActualSuccessfulOrderPlacement actualSuccessfulOrderPlacement)
{
    const int ObligationCount = 5;
    var failedObligationReports = new List<string>();

    // Obligation - the caller receives the arranged success response
    string? responseReport = CompareOrderPlacementResult(
        expectedSuccessfulOrderPlacement.OrderPlacementResult, actualSuccessfulOrderPlacement.OrderPlacementResult);
    if (responseReport is not null)
    {
        failedObligationReports.Add("OBLIGATION: the caller's response\n" + responseReport);
    }

    // Obligation - the order and its lines are recorded with catalog prices (BR-5)
    string? recordedOrderReport = AsserterOrderStore.CompareCustomerStatusTotalLinesAndPlacementTime(
            expectedCustomerId: expectedSuccessfulOrderPlacement.PlacedOrder.CustomerId,
            expectedOrderPlacementStatus: expectedSuccessfulOrderPlacement.PlacedOrder.OrderPlacementStatus,
            expectedOrderTotal: expectedSuccessfulOrderPlacement.PlacedOrder.OrderTotal,
            expectedOrderLines: expectedSuccessfulOrderPlacement.RecordedOrderLines,
            expectedPlacementWindowStartUtc: expectedPlacementWindowStartUtc,
            actualPlacementWindowEndUtc: actualPlacementWindowEndUtc,
            actualRecordedOrder: actualSuccessfulOrderPlacement.RecordedOrder);
    if (recordedOrderReport is not null)
    {
        failedObligationReports.Add("OBLIGATION: the recorded order\n" + recordedOrderReport);
    }

    // Obligation - the fulfillment message carries everything needed to act (BR-6)
    string? fulfillmentContentReport = AsserterFulfillmentNotification.CompareNotification(
            expectedOrderReference: expectedSuccessfulOrderPlacement.PlacedOrder.OrderReference,
            expectedCustomerId: expectedSuccessfulOrderPlacement.PlacedOrder.CustomerId,
            expectedFulfillmentNotificationLinePayloads: expectedSuccessfulOrderPlacement.FulfillmentNotificationLinePayloads,
            expectedOrderTotal: expectedSuccessfulOrderPlacement.FulfillmentWireOrderTotal,
            // The wire must carry the placement time the store recorded - a moment
            // only the store knows, so the read-back recorded order is its source.
            expectedPlacedAtUtc: actualSuccessfulOrderPlacement.RecordedOrder?.PlacedAtUtc,
            actualFulfillmentNotificationPayload: actualSuccessfulOrderPlacement.FulfillmentNotificationPayload);
    if (fulfillmentContentReport is not null)
    {
        failedObligationReports.Add("OBLIGATION: the fulfillment message content\n" + fulfillmentContentReport);
    }

    // Obligation - fulfillment is notified exactly once (BR-6)
    string? extraMessageReport = AsserterMessageBroker.CompareNoMessageArrived(
            actualSuccessfulOrderPlacement.ExtraFulfillmentNotificationPayload,
            expectedSuccessfulOrderPlacement.PlacedOrder.OrderReference,
            "AC-01: fulfillment is notified exactly once");
    if (extraMessageReport is not null)
    {
        failedObligationReports.Add("OBLIGATION: fulfillment notified exactly once\n" + extraMessageReport);
    }

    // Obligation - exactly one confirmation email with the composed content (BR-8)
    string? confirmationEmailReport = AsserterConfirmationEmail.CompareExactlyOneEmailSent(
            expectedSuccessfulOrderPlacement.ConfirmationEmailMessage, actualSuccessfulOrderPlacement.CapturedEmailRequests, actualSuccessfulOrderPlacement.EmailRequestPaths);
    if (confirmationEmailReport is not null)
    {
        failedObligationReports.Add("OBLIGATION: the confirmation email\n" + confirmationEmailReport);
    }

    Assert.True(
        failedObligationReports.Count == 0,
        $"\nSUCCESSFUL ORDER PLACEMENT ASSERTION FAILED\n" +
        $"{failedObligationReports.Count} of {ObligationCount} obligations failed. Each report follows.\n\n" +
        string.Join("\n\n----------------------------------------\n\n", failedObligationReports));
}
```

The complete method checks caller result, stored order, fulfillment content,
extra-message absence, and confirmation. Each comparison returns null on success
or a report on failure. The aggregate prefixes failures with obligation names
and includes the failed-group count.

Within a group, independent fields accumulate discrepancies too. Missing data
needs a guard first: report a missing line collection before accessing its elements,
then compare independent fields that remain available.

Accumulation has a practical limit. If a query cannot complete or a required broker
message does not arrive, gathering can stop before the aggregate runs. That is
an observation failure. When gathering succeeds and values disagree, it is a
comparison failure. Both fail the scenario, with different diagnostic information.

## Verify the reporting mechanism itself

An asserter is code the team depends on. Meridian supplies fabricated expected
and actual values to verify that independent discrepancies reach its report.
These tests exercise comparison infrastructure; they do not execute the order flow.

Here is the complete five-obligation reporting test:

<!-- Listing source: tests/TestingInfrastructure/TestAssertionReports.cs; method: SuccessfulPlacement_WhenEveryObligationFails_ThenReportsFiveFailuresOnce -->

```csharp
/// Assert infrastructure: fabricate wrong observations and verify the resulting report.
public void SuccessfulPlacement_WhenEveryObligationFails_ThenReportsFiveFailuresOnce()
{
    var expectedPlacedOrder = new PlacedOrder("expected", "expected-customer", OrderPlacementStatus.Placed, 12m, new DateTime(2026, 9, 10), []);
    var expectedSuccessfulOrderPlacement = ExpectedSuccessfulOrderPlacement.CreateFrom(expectedPlacedOrder, new CustomerContact("expected-customer", "expected@example.test"));
    var actualFulfillmentNotificationPayload = new FulfillmentNotificationPayload("wrong", "wrong", null, "wrong", "wrong");
    var actualSuccessfulOrderPlacement = new ActualSuccessfulOrderPlacement(
        new OrderPlacementResult("wrong", 0m, OrderPlacementStatus.HeldForReview),
        new RecordedOrder("wrong", "wrong", "wrong", 0m, DateTime.MinValue, []),
        actualFulfillmentNotificationPayload, actualFulfillmentNotificationPayload,
        [new CapturedEmailRequest("wrong", "wrong", "wrong", "wrong")], []);

    TrueException actualTrueException = Assert.Throws<TrueException>(() =>
        AsserterSuccessfulOrderPlacement.AssertAllAc01ObligationsAreMet(
            expectedSuccessfulOrderPlacement, expectedPlacedOrder.PlacedAtUtc, expectedPlacedOrder.PlacedAtUtc, actualSuccessfulOrderPlacement));

    AsserterExceptionMessage.AssertMessageContains(
        ["5 of 5", "caller's response", "recorded order", "fulfillment message content", "exactly once", "confirmation email", "Email path count"],
        actualTrueException.Message);
}
```

It supplies wrong caller, store, broker, and email data, catches the xUnit failure,
and checks that all five obligation names appear. Those literal wrong values are
deliberate probes of reporting behavior.

The assertion-report tests
also cover missing captures, simultaneous path and content differences, missing
exceptions, malformed diagnostics, and a correct email-response observation that
returns no report. Equal, unequal, and missing inputs exercise different duties.
The recorded local execution passed all 18 report cases.

## Establish expected values independently

For prices and totals, Arrange reads selected catalog records and applies approved
arithmetic. It does not adopt the returned total as its expectation. The expected
aggregate factory converts that expected order into its required representations.

The email expectation borrows the production composer. That saves repeated
representation logic, but a wrong composer could agree with itself. Its
independent class tests
verify required subjects, bodies, amounts, and alternative-status content.
The fulfillment composer tests
perform the corresponding verification. Those checks are the condition for
borrowing the components to establish expectations.

The PWI Test Assertions chapter
provides the surrounding conventions. Keep expected values and actual observations
clear in parameter names and messages. Compare all required fields and report
differences a teammate can understand. Maintaining those comparisons protects
the behavior the business continues to depend on.

---

[Previous article](/writing/arranging-scenarios-that-stay-true/) | [Series contents](/acceptance-testing/) | [Next article](/writing/the-test-mediator-and-the-transport-spy/)
