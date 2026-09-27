---
title: "Idempotency and Concurrent Requests"
description: "Repeated and concurrent order requests must preserve accepted outcomes without duplicate work. Compare canonical request identity, allowed race outcomes, stored facts, and outgoing effects."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "idempotency", "concurrency", "data-access", "csharp"]
hero: idempotency-and-concurrent-requests
---

A customer places an order and then submits it again. Perhaps the first response
was lost or the caller retried while waiting. The service needs a defined answer
for repeated requests and for different requests claiming the same order reference.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

Meridian's rule preserves the original outcome for identical content. Different
content under an existing reference is a conflict. Neither case may create another
order or repeat the original outgoing work. These are observable business and
technical obligations, exercised through the same public operation.

## Establish what identical means

Identity belongs to the request's meaning. SKU casing is canonicalized before
comparison, so differently cased versions of the same SKU still describe the
same product. Customer identity, ordered products, and quantities determine whether
the request agrees with the recorded order.

The complete edge-case class
contains identical and conflicting resubmissions. The identical scenario:

1. Arranges a customer, products, request, and expected recorded lines.
2. Opens its broker subscription before the original placement.
3. Places the original order and consumes its notification.
4. Submits equivalent content with changed SKU casing.
5. Compares the response with the original response, reads the stored order,
   checks one order and unchanged lines, then checks for extra broker or email work.

Consuming the first notification is important. Otherwise a delayed original
message could be mistaken for work produced by the resubmission.

Here is the complete identical-resubmission test:

<!-- Listing source: tests/MeridianOrdering.Tests/Acceptance/DomainFacade/TestPlaceOrderEdgeCases.cs; method: PlaceOrder_WhenIdenticalRequestIsResubmittedWithSameReference_ThenOriginalOutcomeIsReturnedWithoutDuplicates -->

```csharp
/// Arrange, Act, Assert: compare a repeated request with the original accepted outcome.
public async Task PlaceOrder_WhenIdenticalRequestIsResubmittedWithSameReference_ThenOriginalOutcomeIsReturnedWithoutDuplicates()
{
    /// Arrange - Given an order already placed, over two catalog products read from the store
    var customerRecord = ArrangedCustomers.CreateArrangedCustomer(_expectedOrderPlacementIdentifiers.CustomerId);
    int firstLineQuantity = 3;
    int secondLineQuantity = 2;
    // Price-capped so the order is Placed (BR-6) whatever the draw - AC-10 asserts
    // the original Placed outcome is returned unchanged.
    decimal maximumUnitPrice = DataGenerators.GetMaximumUnitPriceWithoutTriggeringReview(AcceptanceTestConstants.HeldForReviewThresholdTotal, firstLineQuantity + secondLineQuantity);
    var catalogProducts = DataManagerForTest.GetRandomCatalogProducts(
        2, maximumUnitPrice: maximumUnitPrice);
    var firstCatalogProduct = catalogProducts[0];
    var secondCatalogProduct = catalogProducts[1];
    var orderPlacementRequest = RequestBuilders.OrderPlacementRequestBuilder
        .Set(request => request.OrderReference, _expectedOrderPlacementIdentifiers.OrderReference)
        .Set(request => request.CustomerId, customerRecord.CustomerId)
        .Set(request => request.OrderPlacementLineItems,
        [
            new OrderPlacementLineItem(sku: firstCatalogProduct.Sku, quantity: firstLineQuantity),
            new OrderPlacementLineItem(sku: secondCatalogProduct.Sku, quantity: secondLineQuantity),
        ])
        .Build();
    var caseVariantResubmission = RequestBuilders.OrderPlacementRequestBuilder
        .Set(request => request.OrderReference, _expectedOrderPlacementIdentifiers.OrderReference)
        .Set(request => request.CustomerId, customerRecord.CustomerId)
        .Set(request => request.OrderPlacementLineItems,
        [
            new OrderPlacementLineItem(sku: LetterCasing.SwapCase(firstCatalogProduct.Sku), quantity: firstLineQuantity),
            new OrderPlacementLineItem(sku: LetterCasing.SwapCase(secondCatalogProduct.Sku), quantity: secondLineQuantity),
        ])
        .Build();
    decimal expectedFirstLineTotal = firstCatalogProduct.UnitPrice * firstLineQuantity;
    decimal expectedSecondLineTotal = secondCatalogProduct.UnitPrice * secondLineQuantity;
    decimal expectedOrderTotal = expectedFirstLineTotal + expectedSecondLineTotal;
    int expectedRecordedOrderCount = 1;
    int expectedEmailRequestCount = 1;
    List<RecordedOrderLine> expectedOrderLines =
    [
        new RecordedOrderLine(
            Sku: firstCatalogProduct.Sku,
            ProductName: firstCatalogProduct.ProductName,
            Quantity: firstLineQuantity,
            UnitPrice: firstCatalogProduct.UnitPrice,
            LineTotal: expectedFirstLineTotal),
        new RecordedOrderLine(
            Sku: secondCatalogProduct.Sku,
            ProductName: secondCatalogProduct.ProductName,
            Quantity: secondLineQuantity,
            UnitPrice: secondCatalogProduct.UnitPrice,
            LineTotal: expectedSecondLineTotal),
    ];
    var (domainFacadeInstance, testMediatorEmailService, _) = DomainFacadeFactory.CreateDomainFacade();
    await using var domainFacade = domainFacadeInstance;
    // Subscribed BEFORE the original placement and its message consumed explicitly,
    // so the quiet window after the resubmission can only ever see a message the
    // resubmission sent - deterministic on both brokers (a durable Service Bus
    // subscription could otherwise surface the original message after an
    // open-time drain, whenever propagation runs slower than the drain).
    await using var subscriberFulfillmentNotifications =
        await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();
    // The original response is the expected outcome: resubmission must return it unchanged.
    var expectedPlacementWindowStartUtc = DateTime.UtcNow;
    OrderPlacementResult expectedOrderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);
    await BrokerSubscriptions.ReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);

    /// Act - When identical content arrives with only SKU casing changed
    OrderPlacementResult actualOrderPlacementResult = await domainFacade.PlaceOrderAsync(caseVariantResubmission);

    /// Assert - the caller receives the original success response
    const string IdempotencyAssertionFailedHeader = "\nIDEMPOTENCY ASSERTION FAILED (BR-7)\n";
    Assert.True(
        actualOrderPlacementResult == expectedOrderPlacementResult,
        $"{IdempotencyAssertionFailedHeader}" +
        $"Expected (original) response:    {expectedOrderPlacementResult}\n" +
        $"Actual (resubmitted) response:   {actualOrderPlacementResult}\n");

    /// Assert - no additional order or order line exists afterward
    int actualRecordedOrderCount = DataManagerForTest.CountRecordedOrders(orderPlacementRequest.OrderReference);
    Assert.True(
        actualRecordedOrderCount == expectedRecordedOrderCount,
        $"{IdempotencyAssertionFailedHeader}" +
        $"Expected exactly {expectedRecordedOrderCount} recorded order for reference " +
        $"'{orderPlacementRequest.OrderReference}' but found {actualRecordedOrderCount}.\n");
    var actualRecordedOrder = DataManagerForTest.GetRecordedOrder(orderPlacementRequest.OrderReference);
    var actualPlacementWindowEndUtc = DateTime.UtcNow;
    AsserterOrderStore.AssertCustomerStatusTotalLinesAndPlacementTimeAreAsExpected(
        expectedCustomerId: customerRecord.CustomerId,
        expectedOrderPlacementStatus: OrderPlacementStatus.Placed,
        expectedOrderTotal: expectedOrderTotal,
        expectedOrderLines: expectedOrderLines,
        expectedPlacementWindowStartUtc: expectedPlacementWindowStartUtc,
        actualPlacementWindowEndUtc: actualPlacementWindowEndUtc,
        actualRecordedOrder: actualRecordedOrder);

    /// Assert - fulfillment receives no additional notification and no additional email is sent
    var actualUnexpectedFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
    AsserterMessageBroker.AssertNoMessageArrived(
        actualUnexpectedFulfillmentNotificationPayload,
        orderPlacementRequest.OrderReference,
        "AC-10: fulfillment receives no additional notification");
    int actualEmailRequestCount = testMediatorEmailService.CapturedEmailRequests.Count;
    Assert.True(
        actualEmailRequestCount == expectedEmailRequestCount,
        $"\nIDEMPOTENCY ASSERTION FAILED (BR-7 / AC-10)\n" +
        $"Expected no additional email: the email service should have received exactly " +
        $"{expectedEmailRequestCount} request (the original placement's), but received {actualEmailRequestCount}.\n");
}
```

Using the first response as the expected resubmission response is appropriate
for the claim that the original outcome is preserved. It does not independently
establish that the first placement was correct. The scenario also compares stored
facts with catalog-derived expectations, and the complete successful-placement
suite establishes the original acceptance behavior.

## Refuse conflicting content without changing the original

The conflict scenario places an order, then reuses its reference with different
line content. It expects OrderReferenceConflictException with the required
classification and reference context. It reads the original order afterward and
compares its original customer, status, total, and lines. It checks no additional
notification and no extra email.

An exception alone would leave unanswered whether the original order was altered
before refusal. The complete conflict test
makes preservation part of the outcome.

## Start two requests before collecting their outcomes

<!-- diagram:start concurrent-request-outcomes -->
<figure class="article-diagram">
<svg id="concurrent-request-outcomes" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 725" role="img" aria-labelledby="concurrent-request-outcomes-title concurrent-request-outcomes-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="concurrent-request-outcomes-title">Concurrent submissions with allowed outcomes</title>
<desc id="concurrent-request-outcomes-desc">Two operations begin before outcomes are awaited. The real database transaction and uniqueness constraint arbitrate a shared reference. Identical content expects matching accepted results and one order; different content expects one success and one conflict, preserving the winning content.</desc>
<defs><marker id="concurrent-request-outcomes-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="25" y="25" width="285" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="167.5" y="56.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Request A</tspan><tspan x="167.5" dy="33">shared order</tspan><tspan x="167.5" dy="33">reference</tspan></text><rect x="330" y="25" width="285" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="472.5" y="56.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Request B</tspan><tspan x="472.5" dy="33">shared order</tspan><tspan x="472.5" dy="33">reference</tspan></text><path d="M 167 135 L 260 210" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#concurrent-request-outcomes-arrow)"/><path d="M 473 135 L 380 210" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#concurrent-request-outcomes-arrow)"/><rect x="65" y="215" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="246.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Real transaction and unique</tspan><tspan x="320.0" dy="33">constraint</tspan><tspan x="320.0" dy="33">arbitrate the shared reference</tspan></text><path d="M 320 325 L 320 370" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#concurrent-request-outcomes-arrow)"/><rect x="25" y="375" width="285" height="160" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="167.5" y="431.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Identical content</tspan><tspan x="167.5" dy="33">two same results</tspan><tspan x="167.5" dy="33">one stored order</tspan></text><rect x="330" y="375" width="285" height="160" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="472.5" y="414.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Different content</tspan><tspan x="472.5" dy="33">one accepted</tspan><tspan x="472.5" dy="33">one conflict</tspan><tspan x="472.5" dy="33">winner stored</tspan></text><text x="320" y="605" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Compare outbound effects in both cases</tspan><tspan x="320" dy="33">Starting both calls permits overlap</tspan><tspan x="320" dy="33">It does not enumerate every schedule</tspan></text>
</svg>
<figcaption>Assert the allowed outcome counts and stored content without predicting a winner. These concurrent submissions demonstrate the observed schedules, with bounded checks for extra effects.</figcaption>
</figure>
<!-- diagram:end concurrent-request-outcomes -->

Sequential repetition leaves one request fully completed before the next begins.
Concurrent requests can both reach placement while neither caller yet has a result.
The database's unique reference constraint must arbitrate their attempts.

Here is Meridian's complete concurrency helper:

<!-- Listing source: tests/MeridianOrdering.Tests/Acceptance/DomainFacade/TestPlaceOrderTechnicalRequirements.cs; method: RaceBothPlacementsAsync -->

```csharp
/// Act: start both operations before awaiting and collecting their outcomes.
private static async Task<List<object>> RaceBothPlacementsAsync(
    DomainFacade domainFacade,
    OrderPlacementRequest orderPlacementRequestOne,
    OrderPlacementRequest orderPlacementRequestTwo)
{
    Task<OrderPlacementResult> placementTaskOne = domainFacade.PlaceOrderAsync(orderPlacementRequestOne);
    Task<OrderPlacementResult> placementTaskTwo = domainFacade.PlaceOrderAsync(orderPlacementRequestTwo);
    List<object> actualConcurrentPlacementOutcomes = [];
    foreach (Task<OrderPlacementResult> placementTask in new[] { placementTaskOne, placementTaskTwo })
    {
        try
        {
            actualConcurrentPlacementOutcomes.Add(await placementTask);
        }
        catch (MeridianOrderingException meridianOrderingException)
        {
            actualConcurrentPlacementOutcomes.Add(meridianOrderingException);
        }
    }

    return actualConcurrentPlacementOutcomes;
}
```

It invokes both asynchronous operations before awaiting either task. It then
collects successful results or domain exceptions. It does not use Task.WhenAll,
and an unexpected exception escapes and fails the test.

This arrangement permits overlap. It does not force both requests to pause at
the same database statement, nor enumerate every possible schedule. One task
can progress substantially before the other reaches the contested operation.
Describe the evidence as outcomes of these concurrent submissions.

## Compare allowed outcomes without predicting the winner

The differing-content race requires one success, one conflict, and zero unexpected
outcomes. The outcome comparison counts types rather than assuming the first
request must win:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterConcurrentOrderPlacement.cs; method: CompareOutcomeCounts -->

```csharp
/// Assert: compare allowed outcome counts without depending on completion order.
public static string? CompareOutcomeCounts(
    int expectedSuccessCount, int expectedConflictCount, int expectedUnexpectedOutcomeCount,
    IReadOnlyList<object> actualPlacementOutcomes)
{
    int actualSuccessCount = actualPlacementOutcomes.OfType<OrderPlacementResult>().Count();
    int actualConflictCount = actualPlacementOutcomes.OfType<OrderReferenceConflictException>().Count();
    int actualUnexpectedOutcomeCount = actualPlacementOutcomes.Count - actualSuccessCount - actualConflictCount;
    List<string> discrepancies = [];
    if (actualSuccessCount != expectedSuccessCount)
    {
        discrepancies.Add($"Success count: expected {expectedSuccessCount}; actual {actualSuccessCount}");
    }

    if (actualConflictCount != expectedConflictCount)
    {
        discrepancies.Add($"Conflict count: expected {expectedConflictCount}; actual {actualConflictCount}");
    }

    if (actualUnexpectedOutcomeCount != expectedUnexpectedOutcomeCount)
    {
        discrepancies.Add($"Unexpected outcome count: expected {expectedUnexpectedOutcomeCount}; actual {actualUnexpectedOutcomeCount}");
    }

    return discrepancies.Count == 0 ? null : "CONCURRENCY ASSERTION FAILED\n" + string.Join("\n", discrepancies) +
        $"\nOutcomes: {string.Join("; ", actualPlacementOutcomes)}";
}
```

The complete concurrent scenarios
also check the resulting store and outbound effects. The identical-content race
expects both callers to receive the same accepted result while only one order
and one set of outgoing actions result. The differing-content scenario identifies
the winning request before comparing stored customer and line content.

The constraint acts in the real database. A separate check that asks whether a
reference exists cannot alone prevent two callers passing that check together.
The schema and placement procedure
show how the actual transaction and uniqueness authority participate.

## Repetition must preserve outstanding work too

A failed original email leaves its action Pending. The resubmission scenario
creates a new facade with a recovered email endpoint and submits the same order.
It verifies that request repetition does not itself replay the action and that
the Pending state remains. The accepted order's original outcome still stands.

This separates request idempotency from recovery policy. An out-of-band recovery
worker, if introduced, needs tests for its own operation, state changes, recipient
deduplication, and ambiguous completion cases.

## Keep concurrency, capacity, and delivery claims precise

The broker quiet window supplies bounded evidence of no additional correlated
notification. Email captures supply counts within the awaited operation. Together
with store checks, they establish the demonstrated request behavior.

They do not establish exactly-once delivery across crashes, later recovery, or
every schedule. Load and resilience testing address additional specified concerns,
such as resource limits under sustained contention. Those responsibilities join
the release plan without weakening the functional suite's purpose.

With requirements established and correct scenarios and expectations covering
these outcomes, green boundary tests give the team confidence that this build
preserves its promised repeated-request behavior.

---

[Previous article](/writing/refusals-failures-and-work-still-owed/) | [Series contents](/acceptance-testing/) | [Next article](/writing/testing-the-service-interface/)
