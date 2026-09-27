---
title: "Refusals, Failures, and Work Still Owed"
description: "Failure timing determines what an order still owes. Verify refusal, real transaction rollback, post-commit action failures, and accepted effects whose completion could not be recorded."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "error-handling", "data-access", "data-manager", "architectural-patterns", "csharp"]
hero: refusals-failures-and-work-still-owed
---

An order can be refused before recording begins, interrupted during recording,
or accepted before a downstream action fails. Those situations leave different
obligations. The tests need to establish the caller's outcome and what remains
in the database, broker, and email capture.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

We will follow those stages in Meridian. The business requirements, acceptance
criteria, functional requirements, and non-functional requirements establish
the expected outcomes. Correct scenarios and expectations, exercised through
the assembled system, give the team confidence to go to production.

## Start with the stage at which the problem occurs

<!-- diagram:start failure-and-outstanding-work -->
<figure class="article-diagram">
<svg id="failure-and-outstanding-work" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 790" role="img" aria-labelledby="failure-and-outstanding-work-title failure-and-outstanding-work-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="failure-and-outstanding-work-title">Failure stage and durable obligations</title>
<desc id="failure-and-outstanding-work-desc">Before acceptance, refusal or rollback leaves no accepted order or outbound work. After commit, the accepted order survives and failed actions remain owed. An externally accepted effect followed by failed completion recording creates uncertainty that both observations must preserve.</desc>
<defs><marker id="failure-and-outstanding-work-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<text x="320" y="35" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">The failure stage changes the obligations</tspan></text><rect x="25" y="80" width="285" height="135" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="167.5" y="140.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Refused before</tspan><tspan x="167.5" dy="33">recording</tspan></text><rect x="330" y="80" width="285" height="135" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="472.5" y="140.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">No accepted order</tspan><tspan x="472.5" dy="33">No outbound work</tspan></text><rect x="25" y="250" width="285" height="135" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="167.5" y="310.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Recording</tspan><tspan x="167.5" dy="33">interrupted</tspan></text><rect x="330" y="250" width="285" height="135" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="472.5" y="293.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Real rollback</tspan><tspan x="472.5" dy="33">No surviving</tspan><tspan x="472.5" dy="33">partial order</tspan></text><rect x="25" y="420" width="285" height="135" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="167.5" y="480.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Action fails after</tspan><tspan x="167.5" dy="33">commit</tspan></text><rect x="330" y="420" width="285" height="135" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="472.5" y="447.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Accepted order</tspan><tspan x="472.5" dy="33">stands</tspan><tspan x="472.5" dy="33">Failed action</tspan><tspan x="472.5" dy="33">remains owed</tspan></text><rect x="25" y="590" width="285" height="135" rx="10" style="fill:var(--diagram-requirements-web-fill);stroke:var(--diagram-requirements-web);stroke-width:2"/><text x="167.5" y="650.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Effect accepted;</tspan><tspan x="167.5" dy="33">state update fails</tspan></text><rect x="330" y="590" width="285" height="135" rx="10" style="fill:var(--diagram-requirements-web-fill);stroke:var(--diagram-requirements-web);stroke-width:2"/><text x="472.5" y="617.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Accepted effect</tspan><tspan x="472.5" dy="33">observed</tspan><tspan x="472.5" dy="33">Completion remains</tspan><tspan x="472.5" dy="33">uncertain</tspan></text>
</svg>
<figcaption>Read failures against the stage reached. A Pending completion record can coexist with an externally accepted effect, so both facts belong in the assertions.</figcaption>
</figure>
<!-- diagram:end failure-and-outstanding-work -->

| Stage | Required outcome | Observations |
| --- | --- | --- |
| Invalid request | Specific refusal with no accepted order or outbound work | Exception, order count, broker observation, email captures |
| Dependency unavailable before commit | Meaningful failure and no completed placement | Failure classification, resulting state, forbidden effects |
| Write interrupted inside transaction | Complete rollback | All affected table counts, timeout cause, outbound absence |
| Downstream action fails after commit | Accepted order stands; failed action remains Pending | Caller result, order, action state, independent action, logs |
| Action accepted but completion update fails | Accepted order stands; durable evidence remains uncertain | External acceptance, Pending state, missing timestamp, warning and cause |

The stage determines what must be preserved. Treating every failure as a generic
exception assertion would miss most of these requirements.

## Refuse an unknown customer and inspect the consequences

The unknown-customer test reserves a random customer identifier but inserts no
customer under it. Other request data remains valid, so the named refusal is
the reason the operation cannot proceed.

Here is the complete scenario:

<!-- Listing source: tests/MeridianOrdering.Tests/Acceptance/DomainFacade/TestPlaceOrderRejectedPaths.cs; method: PlaceOrder_WhenCustomerDoesNotExist_ThenOrderIsRejectedAndLeavesNoTrace -->

```csharp
/// Arrange, Act, Assert: refuse an unknown customer and verify the resulting observations.
public async Task PlaceOrder_WhenCustomerDoesNotExist_ThenOrderIsRejectedAndLeavesNoTrace()
{
    /// Arrange - Given a customer id that exists nowhere in the customer store. What
    // is ordered plays no part in this rejection, so the builder's default line
    // items (a valid catalog product read from the store) stand.
    string nonexistentCustomerId = _expectedOrderPlacementIdentifiers.CustomerId;
    var orderPlacementRequest = RequestBuilders.OrderPlacementRequestBuilder
        .Set(request => request.OrderReference, _expectedOrderPlacementIdentifiers.OrderReference)
        .Set(request => request.CustomerId, nonexistentCustomerId)
        .Build();
    List<string> expectedTerms = ["rejected", nonexistentCustomerId, "does not exist"];
    int expectedHttpStatusCode = 400;
    Severity expectedSeverity = Severity.Error;
    var (domainFacadeInstance, testMediatorEmailService, _) = DomainFacadeFactory.CreateDomainFacade();
    await using var domainFacade = domainFacadeInstance;
    await using var subscriberFulfillmentNotifications =
        await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();

    // Act
    var actualCustomerNotFoundException = await Assert.ThrowsAsync<CustomerNotFoundException>(
        async () => await domainFacade.PlaceOrderAsync(orderPlacementRequest));

    /// Assert - the rejection states the specific reason, and the full exception
    // contract holds: caller-facing fields plus the diagnostic renderings
    AsserterException.AssertMessageStatusSeverityAndContextAreAsExpected(
        actualException: actualCustomerNotFoundException,
        expectedMessagePhrases: expectedTerms,
        expectedHttpStatusCode: expectedHttpStatusCode,
        expectedSeverity: expectedSeverity,
        expectedContextualData: new Dictionary<string, object> { ["Order.CustomerId"] = nonexistentCustomerId });

    /// Assert - gather the traces a rejection must not leave: the recorded-order
    // count from the store, and the broker's quiet window listened through
    int actualRecordedOrderCount = DataManagerForTest.CountRecordedOrders(orderPlacementRequest.OrderReference);
    var actualUnexpectedFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);

    /// Assert - no order or order line is recorded, fulfillment is not notified,
    // and no email is sent: all three checked and reported together
    AsserterNoTrace.AssertLeavesNoTrace(
        actualRecordedOrderCount: actualRecordedOrderCount,
        actualUnexpectedFulfillmentNotificationPayload: actualUnexpectedFulfillmentNotificationPayload,
        actualCapturedEmailRequests: testMediatorEmailService.CapturedEmailRequests,
        orderReference: orderPlacementRequest.OrderReference,
        businessRuleDescription: AcceptanceTestConstants.NoTraceRule);
}
```

The exception assertions compare the specific type, meaningful message phrases,
status, severity, and customer context. The test also reads the order count,
observes the broker, and supplies email captures to its no-trace asserter.

Here is the complete no-trace implementation:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterNoTrace.cs; method: AssertLeavesNoTrace -->

```csharp
/// Assert: compare the three supplied forbidden-effect observations.
public static void AssertLeavesNoTrace(
    int actualRecordedOrderCount,
    FulfillmentNotificationPayload? actualUnexpectedFulfillmentNotificationPayload,
    IReadOnlyList<CapturedEmailRequest> actualCapturedEmailRequests,
    string orderReference,
    string businessRuleDescription)
{
    const int TraceCheckCount = 3;
    var failedCheckReports = new List<string>();

    if (actualRecordedOrderCount != 0)
    {
        failedCheckReports.Add($"TRACE: expected no recorded order for '{orderReference}'; actual {actualRecordedOrderCount}");
    }

    string? messageReport = AsserterMessageBroker.CompareNoMessageArrived(
        actualUnexpectedFulfillmentNotificationPayload, orderReference, businessRuleDescription);
    if (messageReport is not null)
    {
        failedCheckReports.Add("TRACE: fulfillment was notified\n" + messageReport);
    }

    if (actualCapturedEmailRequests.Count != 0)
    {
        failedCheckReports.Add($"TRACE: expected no email; actual {actualCapturedEmailRequests.Count}\n{businessRuleDescription}");
    }

    Assert.True(
        failedCheckReports.Count == 0,
        $"\nNO TRACE ASSERTION FAILED\n" +
        $"{failedCheckReports.Count} of {TraceCheckCount} no-trace checks failed. Each report follows.\n\n" +
        string.Join("\n\n----------------------------------------\n\n", failedCheckReports));
}
```

Its three checks are order count, correlated broker observation, and captured
email count. It does not independently count order lines or messaging-state rows.
Read helper bodies when judging assertion depth. The
[rollback scenario](/writing/testing-against-real-infrastructure/#verify-rollback-after-the-real-transaction-starts)
separately reads counts for all affected tables.

The complete refused-path class
also covers inactive customers, missing lines, invalid quantities, unknown
products, and duplicates. Each arrangement needs to establish its particular
invalid condition while keeping unrelated conditions valid.

## Interrupt a real write and verify rollback

Meridian's private fault database delays OrderLine insertion. The production
procedure starts its transaction and the SQL client's command timeout interrupts
execution. The test verifies the translated exception and the original timeout
cause, then reads customer, order, line, and messaging-state counts from that
database. The customer remains; the attempted placement's records are absent.

It also verifies no correlated notification during the quiet window and no
email capture. That is evidence about an interrupted real transaction. A fabricated
exception before entering the store would demonstrate a different condition.

## Preserve an accepted order when an action fails

After commit, the order exists. BR-10 requires that a failed fulfillment or email
action cannot reverse its acceptance. Each required action has its own state:

- Pending means the action remains owed or its completion has not been recorded.
- Completed means completion evidence was recorded.
- NotRequired means this order does not require that action, as with fulfillment
  for a Held for Review order.

If fulfillment fails, confirmation can still proceed. If email fails after
fulfillment succeeds, fulfillment's completion remains recorded and email stays
Pending. The failure-path scenarios
read that state and verify caller, effects, and diagnostics together.

These requirements explain the production catches. A catch that implements
accepted-order policy is itself behavior to verify. The thesis's instruction
about exposing failures does not prohibit required handling. Preserve the failure
meaning in state and diagnostics while returning the outcome the business requires.

## Observe acceptance when completion recording fails

The next case is more subtle. Fulfillment accepts its notification, and the email
endpoint returns acceptance. Updating the database to Completed then fails.
The outgoing effects happened, but the durable row still says Pending.

Meridian arranges a private database whose messaging-state update trigger fails.
Here is the complete test:

<!-- Listing source: tests/MeridianOrdering.Tests/Acceptance/DomainFacade/TestPlaceOrderCompletionRecordingFailure.cs; method: PlaceOrder_WhenCompletionRecordingFailsAfterOutboundActionsSucceed_ThenCallerStillSeesSuccessAndActionsRemainPending -->

```csharp
/// Arrange, Act, Assert: observe accepted effects alongside failed completion recording.
public async Task PlaceOrder_WhenCompletionRecordingFailsAfterOutboundActionsSucceed_ThenCallerStillSeesSuccessAndActionsRemainPending()
{
    /// Arrange - the private database behaves normally until the procedure attempts
    // to mark successful fulfillment and email actions as Completed.
    var disposableOrderStore = _disposableOrderStoreWithArrangedCompletionRecordingFailure;
    var customerRecord = DataGenerators.CreateCustomerRecord(
        customerId: _expectedOrderPlacementIdentifiers.CustomerId,
        customerStatus: DataGenerators.ActiveCustomerStatus);
    DataManagerForTest.InsertCustomer(customerRecord, disposableOrderStore.ConnectionString);
    int orderedQuantity = 1;
    decimal maximumUnitPrice = DataGenerators.GetMaximumUnitPriceWithoutTriggeringReview(AcceptanceTestConstants.HeldForReviewThresholdTotal, orderedQuantity);
    var catalogProduct = DataManagerForTest.GetRandomCatalogProducts(
        productCount: 1,
        maximumUnitPrice: maximumUnitPrice,
        connectionString: disposableOrderStore.ConnectionString)[0];
    // Line items are Set because the product must come from the private disposable
    // store the facade is pointed at, not from the shared store the builder's
    // default reads.
    var orderPlacementRequest = RequestBuilders.OrderPlacementRequestBuilder
        .Set(request => request.OrderReference, _expectedOrderPlacementIdentifiers.OrderReference)
        .Set(request => request.CustomerId, customerRecord.CustomerId)
        .Set(request => request.OrderPlacementLineItems,
            [new OrderPlacementLineItem(sku: catalogProduct.Sku, quantity: orderedQuantity)])
        .Build();
    decimal expectedOrderTotal = catalogProduct.UnitPrice * orderedQuantity;
    var expectedConfirmationEmailMessage = ComposerConfirmationEmail.Compose(
        new PlacedOrder(
            OrderReference: orderPlacementRequest.OrderReference,
            CustomerId: customerRecord.CustomerId,
            OrderPlacementStatus: OrderPlacementStatus.Placed,
            OrderTotal: expectedOrderTotal,
            PlacedAtUtc: DateTime.UtcNow,
            PlacedOrderLines:
            [
                new PlacedOrderLine(
                    sku: catalogProduct.Sku,
                    productName: catalogProduct.ProductName,
                    quantity: orderedQuantity,
                    unitPrice: catalogProduct.UnitPrice,
                    lineTotal: expectedOrderTotal),
            ]),
        new CustomerContact(CustomerId: customerRecord.CustomerId, EmailAddress: customerRecord.Email));
    var expectedOrderPlacementResult = new OrderPlacementResult(
        OrderReference: orderPlacementRequest.OrderReference,
        OrderTotal: expectedOrderTotal,
        OrderPlacementStatus: OrderPlacementStatus.Placed);

    var (domainFacadeInstance, testMediatorEmailService, loggerTesting) = DomainFacadeFactory.CreateDomainFacade(
        overrideByEnvironmentVariableName: new Dictionary<string, string>
        {
            [DataManagerForTest.OrderStoreConnectionStringVariable] = disposableOrderStore.ConnectionString,
        });
    await using var domainFacade = domainFacadeInstance;
    await using var subscriberFulfillmentNotifications =
        await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();

    /// Act - both recipients accept their independent effects, and each subsequent
    // completion-recording attempt reaches the arranged failing update trigger.
    OrderPlacementResult actualOrderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);

    /// Assert - once the order transaction committed, completion-recording trouble
    // could not turn the accepted order into a failed placement (BR-10).
    Assert.Equal(expectedOrderPlacementResult, actualOrderPlacementResult);

    /// Assert - placement committed before the outbound actions began.
    var actualOrderPlacementRecordCounts = DataManagerForTest.GetOrderPlacementRecordCounts(
        customerId: customerRecord.CustomerId,
        orderReference: orderPlacementRequest.OrderReference,
        connectionString: disposableOrderStore.ConnectionString);
    Assert.Equal(
        new OrderPlacementRecordCounts(
            CustomerCount: 1,
            OrderCount: 1,
            OrderLineCount: 1,
            OrderMessagingStateCount: 1),
        actualOrderPlacementRecordCounts);

    /// Assert - both effects were accepted before completion recording failed.
    var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications,
        orderPlacementRequest.OrderReference);
    Assert.Equal(orderPlacementRequest.OrderReference, actualFulfillmentNotificationPayload.OrderReference);
    AsserterConfirmationEmail.AssertExactlyOneEmailSent(
        expectedConfirmationEmailMessage,
        testMediatorEmailService.CapturedEmailRequests,
        testMediatorEmailService.CapturedRequestPaths);

    /// Assert - the failed update leaves both successful effects represented as
    // Pending with no completion evidence: the contradictory state under study.
    var actualOrderMessagingStateRecord = DataManagerForTest.GetOrderMessagingState(
        orderPlacementRequest.OrderReference,
        connectionString: disposableOrderStore.ConnectionString);
    AsserterOrderStore.AssertActionStatusesAndCompletionEvidenceAreAsExpected(
        expectedFulfillmentActionStatus: OrderActionStatus.Pending,
        expectedFulfillmentMessagePublished: false,
        expectedConfirmationEmailActionStatus: OrderActionStatus.Pending,
        expectedConfirmationEmailSent: false,
        actualOrderMessagingStateRecord: actualOrderMessagingStateRecord);

    /// Assert - both absorbed failures crossed the real SQL Server boundary,
    // were translated by the production data manager, and were logged separately
    // with enough action identity to diagnose what remains ambiguous (NFR-4).
    const string OrderReferenceContextKey = "Order.Reference";
    const string OrderActionTypeContextKey = "OrderAction.Type";
    IReadOnlyList<LoggedExceptionEntry> actualLoggedExceptionEntries = loggerTesting.LoggedExceptionEntries.ToArray();
    AsserterLog.AssertExceptionsLogged(
        expectedExceptionType: typeof(OrderStoreUnavailableException),
        expectedSeverity: Severity.Warning,
        expectedContextualDataByException:
        [
            new Dictionary<string, object>
            {
                [OrderReferenceContextKey] = orderPlacementRequest.OrderReference,
                [OrderActionTypeContextKey] = "FulfillmentNotification",
            },
            new Dictionary<string, object>
            {
                [OrderReferenceContextKey] = orderPlacementRequest.OrderReference,
                [OrderActionTypeContextKey] = "ConfirmationEmail",
            },
        ],
        actualLoggedExceptionEntries: actualLoggedExceptionEntries);
    Assert.True(
        loggerTesting.LoggedExceptionEntries.All(loggedExceptionEntry => loggedExceptionEntry.Exception.InnerException is SqlException),
        "NFR-4: each absorbed completion-recording failure must carry its original SQL Server cause");
}
```

The assertions establish accepted caller output, committed record counts, a
received fulfillment reference, the complete captured confirmation, two Pending
states without completion timestamps, two warnings identifying the actions, and
preserved SQL causes. This scenario checks the fulfillment reference as acceptance
evidence; full fulfillment content is verified by the successful-order scenarios.

Pending therefore cannot always be interpreted as proof that an external action
never happened. A recovery policy must address that uncertainty before replaying
irreversible effects. Recipient deduplication, reconciliation, and a recovery
worker need their own requirements and scenarios. They are outside this demonstrated
Meridian implementation.

## Assert useful failure information without leaking secrets

Failures need enough information to explain the problem in a test run and in
production: a precise condition, meaningful message, expected status and severity,
operation identity, relevant values, and original cause where appropriate.
The exception asserter
checks that contract. Diagnostic rendering checks ensure context survives into
the forms people use to investigate incidents.

Safe diagnostics are also requirements. The email response-body scenarios verify
bounded reads, bounded excerpts, Unicode integrity, and absence of credential
fragments. A mid-body read failure must preserve the already known response
classification. The [Test Mediator article](/writing/the-test-mediator-and-the-transport-spy/#observe-bytes-consumed-when-bounded-reads-matter)
shows how the test observes actual consumption.

Unexpected defects should remain visible. Catching a known operational failure
to implement a stated policy differs from converting arbitrary defects into
apparent success. Review the allowed catch scope, then test the state and
diagnostic obligations it implements.

---

[Previous article](/writing/the-test-mediator-and-the-transport-spy/) | [Series contents](/acceptance-testing/) | [Next article](/writing/idempotency-and-concurrent-requests/)
