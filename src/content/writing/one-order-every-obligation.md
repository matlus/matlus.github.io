---
title: "One Order, Every Obligation"
description: "One ordering scenario verifies the caller result, stored lines, fulfillment, and confirmation. Follow its complete C# test, independent observations, and accumulated failure reports."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "verification", "test-isolation", "data-access", "domain-facade", "data-manager", "gateway-pattern", "test-mediator", "transport-spy", "factory-pattern", "builder-pattern", "architectural-patterns", "design-patterns", "csharp"]
hero: one-order-every-obligation
---

Accepting an order gives the service several things to get right. The caller
needs the accepted outcome. The database needs the complete order. Fulfillment
needs enough information to act. The customer needs the correct communication.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

This article follows one complete Meridian acceptance test that verifies those
obligations through the public ordering operation. The feature's requirements,
criteria, functional and non-functional obligations, and correct scenarios and
expectations are established first. The test then supplies execution evidence
for this scenario. Its result contributes to confidence to release when the
required suite is green.

## The scenario we are verifying

<!-- diagram:start order-observation-map -->
<figure class="article-diagram">
<svg id="order-observation-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 830" role="img" aria-labelledby="order-observation-map-title order-observation-map-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="order-observation-map-title">One order, four observation channels</title>
<desc id="order-observation-map-desc">The real operation supplies a caller result and effects observed independently through database readback, broker receipt, and email capture. Those actual values meet arranged expectations in the aggregate asserter.</desc>
<defs><marker id="order-observation-map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="65" y="25" width="510" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="320.0" y="89.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Arrange request and expectations</tspan></text><path d="M 320 135 L 320 175" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><rect x="65" y="180" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="244.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Invoke real PlaceOrderAsync</tspan></text><path d="M 320 290 L 320 335" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><path d="M 160 360 L 160 335 L 480 335 L 480 360" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5"/><rect x="30" y="360" width="280" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="170.0" y="391.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Caller result</tspan><tspan x="170.0" dy="33">reference, total,</tspan><tspan x="170.0" dy="33">status</tspan></text><rect x="330" y="360" width="280" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="470.0" y="391.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Database readback</tspan><tspan x="470.0" dy="33">header and all</tspan><tspan x="470.0" dy="33">lines</tspan></text><rect x="30" y="510" width="280" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="170.0" y="557.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Broker observation</tspan><tspan x="170.0" dy="33">payload and extras</tspan></text><rect x="330" y="510" width="280" height="110" rx="10" style="fill:var(--diagram-requirements-splunk-fill);stroke:var(--diagram-requirements-splunk);stroke-width:2"/><text x="470.0" y="541.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Email capture</tspan><tspan x="470.0" dy="33">recipient, body,</tspan><tspan x="470.0" dy="33">count</tspan></text><path d="M 160 335 L 160 360" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><path d="M 480 335 L 480 360" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><path d="M 160 335 H 10 V 565 H 30 M 480 335 H 630 V 565 H 610" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><path d="M 20 345 L 20 640 L 620 640 L 620 345" style="fill:none;stroke:var(--diagram-line);stroke-width:2;stroke-dasharray:5 7"/><path d="M 320 640 L 320 690" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#order-observation-map-arrow)"/><rect x="65" y="695" width="510" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="320.0" y="759.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Compare every required obligation</tspan></text>
</svg>
<figcaption>One real operation produces four kinds of evidence. Independent observations feed complete comparisons; the returned total alone cannot verify the whole order.</figcaption>
</figure>
<!-- diagram:end order-observation-map -->

AC-01 describes an existing active customer ordering three Widgets and two Gadgets.
Using the specification's example prices, the line totals are $59.97 and $499.00,
and the order total is $558.97. The order is Placed because that total is at or
below the $10,000.00 review threshold.

The implementation of the test reads catalog products during Arrange and derives
its expectations from their actual prices. The specification's arithmetic is
the rule. Its worked example is a checkable instance of that rule.

The order uses several parts of the system:

- **The application code** validates the request and applies the ordering rules.
- **The database** supplies catalog prices and records the order and its lines.
- **The message broker** carries the asynchronous notification to fulfillment.
- **The email gateway** submits the customer's confirmation. Meridian captures
  this request in the test; it deliberately has no separate running email service.

The complete outcome includes the caller's reference, total, and status; the
recorded order and lines; one fulfillment notification with the required content;
and one confirmation request for the address on file. The [obligation map](/writing/knowing-which-scenarios-a-feature-requires/#place-order-obligation-map)
connects those requirements to the observations and comparisons below.


## Read the whole test before its helpers

The complete method below comes from Meridian. Its phase comments use
`/// Arrange`, `/// Act`, and `/// Assert` for this article; its executable
statements are unchanged. Arrange establishes inputs and expectations, Act invokes
the operation, and Assert gathers actual results and compares them with those
expectations. Its imports, containing
class, reserved identifiers, initialization, and teardown are in the
complete source file.
The explanations below describe the supporting helpers and show selected listings.

```csharp
public async Task PlaceOrder_WhenActiveCustomerPlacesValidOrder_ThenOrderIsRecordedFulfillmentNotifiedAndConfirmationEmailed()
{
    /// Arrange - Given an active customer, two catalog products read from the store
    // (randomized - the seeded catalog is the single source of truth for product
    // data), and listeners on both channels. Quantities mirror the AC-01 example.
    var customerRecord = ArrangedCustomers.CreateArrangedCustomer(_expectedOrderPlacementIdentifiers.CustomerId);
    int firstLineQuantity = 3;
    int secondLineQuantity = 2;
    // The price cap makes AC-01's implicit constraint explicit: whatever the draw,
    // the derived total stays at or under the BR-6 threshold, so the order is Placed.
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
            new OrderPlacementLineItem(sku: LetterCasing.SwapCase(firstCatalogProduct.Sku), quantity: firstLineQuantity),
            new OrderPlacementLineItem(sku: LetterCasing.SwapCase(secondCatalogProduct.Sku), quantity: secondLineQuantity),
        ])
        .Build();
    // The expected outcome is written ONCE, as the complete PlacedOrder: BR-5's
    // own arithmetic (quantity x catalog unit price) applied to the prices just
    // read. (The spec's worked example, 3 x Widget + 2 x Gadget = $558.97, stays
    // in the spec document as the example to check by hand.) Every other expected
    // value - the caller's response, the recorded order lines, the wire-shaped
    // fulfillment lines, and the composed email - is built from this PlacedOrder
    // by CreateFrom, so the test does not repeat them.
    decimal expectedFirstLineTotal = firstCatalogProduct.UnitPrice * firstLineQuantity;
    decimal expectedSecondLineTotal = secondCatalogProduct.UnitPrice * secondLineQuantity;
    var expectedPlacedOrder = new PlacedOrder(
        OrderReference: orderPlacementRequest.OrderReference,
        CustomerId: customerRecord.CustomerId,
        OrderPlacementStatus: OrderPlacementStatus.Placed,
        OrderTotal: expectedFirstLineTotal + expectedSecondLineTotal,
        PlacedAtUtc: DateTime.UtcNow,
        PlacedOrderLines:
        [
            new PlacedOrderLine(
                sku: firstCatalogProduct.Sku,
                productName: firstCatalogProduct.ProductName,
                quantity: firstLineQuantity,
                unitPrice: firstCatalogProduct.UnitPrice,
                lineTotal: expectedFirstLineTotal),
            new PlacedOrderLine(
                sku: secondCatalogProduct.Sku,
                productName: secondCatalogProduct.ProductName,
                quantity: secondLineQuantity,
                unitPrice: secondCatalogProduct.UnitPrice,
                lineTotal: expectedSecondLineTotal),
        ]);
    var expectedSuccessfulOrderPlacement = ExpectedSuccessfulOrderPlacement.CreateFrom(
        expectedPlacedOrder,
        new CustomerContact(CustomerId: customerRecord.CustomerId, EmailAddress: customerRecord.Email));
    // One call creates the DomainFacade and its paired test doubles, interconnected
    // through the testing service locator; this test needs the email Test Mediator.
    var (domainFacadeInstance, testMediatorEmailService, _) = DomainFacadeFactory.CreateDomainFacade();
    await using var domainFacade = domainFacadeInstance;
    await using var subscriberFulfillmentNotifications =
        await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();

    var expectedPlacementWindowStartUtc = DateTime.UtcNow;

    /// Act - When the customer places an order with two line items
    OrderPlacementResult actualOrderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);

    /// Assert - gather what actually happened, visibly: read the recorded order
    // back from the store, receive the fulfillment message from the broker, and
    // listen through the quiet window for any extra message
    var actualRecordedOrder = DataManagerForTest.GetRecordedOrder(orderPlacementRequest.OrderReference);
    var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
    var actualExtraFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
    var actualPlacementWindowEndUtc = DateTime.UtcNow;

    /// Assert - every AC-01 obligation, reported together: the caller's response,
    // the recorded order and its two lines carrying catalog prices, fulfillment
    // notified exactly once with everything needed to act, and exactly one
    // confirmation email with the composed content to the address on file
    var actualSuccessfulOrderPlacement = new ActualSuccessfulOrderPlacement(
        actualOrderPlacementResult,
        actualRecordedOrder,
        actualFulfillmentNotificationPayload,
        actualExtraFulfillmentNotificationPayload,
        testMediatorEmailService.CapturedEmailRequests.ToArray(),
        testMediatorEmailService.CapturedRequestPaths.ToArray());
    AsserterSuccessfulOrderPlacement.AssertAllAc01ObligationsAreMet(
        expectedSuccessfulOrderPlacement: expectedSuccessfulOrderPlacement,
        expectedPlacementWindowStartUtc: expectedPlacementWindowStartUtc,
        actualPlacementWindowEndUtc: actualPlacementWindowEndUtc,
        actualSuccessfulOrderPlacement: actualSuccessfulOrderPlacement);
}
```

The test has three visible jobs: establish the scenario and its expected outcome,
invoke the public operation, and gather and verify what happened. Each helper
exists to support one of those jobs.

## Own the identities and the customer record

The containing class reserves a customer identifier and an order reference before
arrangement starts. Its asynchronous teardown deletes the records owned by those
identifiers even if arrangement, execution, or assertions fail.

ArrangedCustomers
creates the customer and inserts it into the real database. The production
customer check therefore encounters an actual active customer. The test keeps
the arranged contact information so its email expectation uses the address on file.

```csharp
/// Arrange: create records owned by this run.
private readonly ExpectedOrderPlacementIdentifiers _expectedOrderPlacementIdentifiers =
    DataGenerators.CreateExpectedOrderPlacementIdentifiers();

var customerRecord = ArrangedCustomers.CreateArrangedCustomer(
    _expectedOrderPlacementIdentifiers.CustomerId);
```

The random customer and order identifiers keep concurrent runs from changing or
removing one another's records. A fixed customer shared by developers or parallel
CI jobs would make this scenario depend on what those other runs were doing.

Active status, valid quantities, and the order's relation to the review threshold
establish the business scenario. Random identities keep its records separate.

## Select data that preserves the named scenario

The test asks for two catalog products without replacement. Their permitted
maximum price is calculated from the review threshold and the sum of the
quantities. If both selected prices are at or below that cap, three units of one
product plus two of the other remain at or below the threshold.

DataManagerForTest
reads the catalog, filters prices when a cap is supplied, checks that enough
eligible products exist, samples them, and returns them in SKU order. That order
matches the database's line ordering for positional comparison.

The cap prevents a random selection from turning this Placed scenario into a
Held for Review scenario. Sampling without replacement prevents accidental
duplicate products. With the supplied seed, the eligible set can constrain which
products are selected; randomness does not promise a different product set on
every run.

The request uses swapped letter casing for the selected SKUs. Expected recorded
and outbound values retain canonical uppercase identity. This lets the same
scenario verify that input casing does not change which product was ordered.

The request builders
and immutable ModelBuilder
keep the request arrangement readable. Explicit Set calls expose the identifiers
and line items that determine this scenario.

Here is the catalog selection and request arrangement from the complete test:

```csharp
/// Arrange: choose valid products and quantities.
int firstLineQuantity = 3;
int secondLineQuantity = 2;
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
        new OrderPlacementLineItem(sku: LetterCasing.SwapCase(firstCatalogProduct.Sku), quantity: firstLineQuantity),
        new OrderPlacementLineItem(sku: LetterCasing.SwapCase(secondCatalogProduct.Sku), quantity: secondLineQuantity),
    ])
    .Build();
```

The request supplies SKU and quantity. It supplies no price. During the operation,
the production code reads each product record in the database and uses its catalog
price. The earlier test-side read gives us the price for our expectation.

## Establish the expected order once

The expected line totals come from the selected catalog prices and BR-5's formula:
quantity multiplied by unit price. Their sum establishes the expected order total.
The expected PlacedOrder carries the complete line values and the required status.

The expected order is built before the operation runs:

```csharp
/// Arrange: calculate expected values from the catalog and business rule.
decimal expectedFirstLineTotal = firstCatalogProduct.UnitPrice * firstLineQuantity;
decimal expectedSecondLineTotal = secondCatalogProduct.UnitPrice * secondLineQuantity;
var expectedPlacedOrder = new PlacedOrder(
    OrderReference: orderPlacementRequest.OrderReference,
    CustomerId: customerRecord.CustomerId,
    OrderPlacementStatus: OrderPlacementStatus.Placed,
    OrderTotal: expectedFirstLineTotal + expectedSecondLineTotal,
    PlacedAtUtc: DateTime.UtcNow,
    PlacedOrderLines:
    [
        new PlacedOrderLine(
            sku: firstCatalogProduct.Sku,
            productName: firstCatalogProduct.ProductName,
            quantity: firstLineQuantity,
            unitPrice: firstCatalogProduct.UnitPrice,
            lineTotal: expectedFirstLineTotal),
        new PlacedOrderLine(
            sku: secondCatalogProduct.Sku,
            productName: secondCatalogProduct.ProductName,
            quantity: secondLineQuantity,
            unitPrice: secondCatalogProduct.UnitPrice,
            lineTotal: expectedSecondLineTotal),
    ]);
var expectedSuccessfulOrderPlacement = ExpectedSuccessfulOrderPlacement.CreateFrom(
    expectedPlacedOrder,
    new CustomerContact(CustomerId: customerRecord.CustomerId, EmailAddress: customerRecord.Email));
```

ExpectedSuccessfulOrderPlacement.CreateFrom then creates the required representations
of that expected order: the caller result, recorded lines, fulfillment lines,
wire-formatted amounts, and confirmation email. This avoids retyping the same
expected facts in several places.

The complete expected-model factory
shows each conversion. Amounts on the fulfillment wire use invariant two-decimal
formatting. The email expectation uses the production composer, whose
independent class tests
verify the content it produces. Those tests are the condition for borrowing that
composer as an oracle.

The expected placement time in the arranged model is not an exact prediction
of the database clock. The stored timestamp has a separate bounded-time check,
and its propagation into fulfillment has an exact-value check.

## Arrange the operation and fulfillment observation

The factory gives the test its public facade and the email capture object used
by that same facade. The test also subscribes to fulfillment before placing the
order, so it can observe the message when the operation publishes it:

```csharp
/// Arrange: create the operation and its observation objects.
var (domainFacadeInstance, testMediatorEmailService, _) = DomainFacadeFactory.CreateDomainFacade();
await using var domainFacade = domainFacadeInstance;
await using var subscriberFulfillmentNotifications =
    await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();
```

The database and broker are real. The test uses the order reference to identify
its own fulfillment message. BrokerSubscriptions
provides the subscription and correlation helpers. We will explain the email
capture separately after following the assertions.

## Invoke the public operation visibly

The Act is the call to DomainFacade.PlaceOrderAsync. Someone reading or debugging
the scenario can find the operation being tested immediately.

```csharp
/// Act: invoke the public ordering operation.
var expectedPlacementWindowStartUtc = DateTime.UtcNow;

OrderPlacementResult actualOrderPlacementResult =
    await domainFacade.PlaceOrderAsync(orderPlacementRequest);
```


The facade delegates to
ManagerOrdering. The
manager validates the request, canonicalizes SKU identity, asks the production
data manager to place the order, and performs the new order's required actions.

The data manager
calls the SQL procedures.
The ordinary placement procedure checks customer and catalog facts, calculates
totals, and writes the order, lines, and initial action states in one transaction.
It returns the recorded order data that the production path uses for outbound work.

After commit, fulfillment is published and confirmation is submitted when required. Successful
actions acquire completion evidence. Business-required failure handling preserves
the accepted order and pending obligations when a defined operational action
cannot complete. The source listing includes those policies; later articles will
follow their distinct scenarios in detail.

This walkthrough describes the internals to teach the implementation. The
acceptance test's contract remains the public operation and its observable effects.
It does not assert that a particular internal class or method was called.

## Gather independent evidence

After the Act, we gather what the operation produced:

- **The returned result** comes from the completed public operation.
- **The stored order and its lines** come from a new database query using this
  run's order reference, independently of the production data manager.
- **The fulfillment payload** comes from receiving this order's broker message.
- **The extra-message observation** comes from listening for another message
  for the same order during the quiet window.
- **The email requests and paths** come from the capture object used by this facade.

Here are the database and broker reads:

```csharp
/// Assert: gather the actual database and broker results.
var actualRecordedOrder = DataManagerForTest.GetRecordedOrder(orderPlacementRequest.OrderReference);
var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualExtraFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualPlacementWindowEndUtc = DateTime.UtcNow;
```

The test combines those observations with the returned result and email captures:

```csharp
/// Assert: compare the full expected and actual outcomes.
var actualSuccessfulOrderPlacement = new ActualSuccessfulOrderPlacement(
    actualOrderPlacementResult,
    actualRecordedOrder,
    actualFulfillmentNotificationPayload,
    actualExtraFulfillmentNotificationPayload,
    testMediatorEmailService.CapturedEmailRequests.ToArray(),
    testMediatorEmailService.CapturedRequestPaths.ToArray());
AsserterSuccessfulOrderPlacement.AssertAllAc01ObligationsAreMet(
    expectedSuccessfulOrderPlacement: expectedSuccessfulOrderPlacement,
    expectedPlacementWindowStartUtc: expectedPlacementWindowStartUtc,
    actualPlacementWindowEndUtc: actualPlacementWindowEndUtc,
    actualSuccessfulOrderPlacement: actualSuccessfulOrderPlacement);
```


These observations serve different obligations. A correct return value cannot
establish that the database wrote every line. A correct database row cannot
establish that fulfillment received the complete payload. A correct message
cannot establish that the customer communication used the right address.

The helper that reads the order uses the expected reference as its query key.
The store asserter checks customer, status, total, lines, and placement time.
It does not contain a separate expected-reference parameter; the keyed readback
establishes which order is being examined.

The placement window begins immediately before the operation and ends after
gathering. The store comparison permits one minute of clock skew on either side.
This is a bounded check that the recorded time belongs to this placement. The
fulfillment comparison parses the wire timestamp and compares it with the
independently read stored timestamp, verifying propagation of that recorded value.

The broker's extra-message check uses a one-second quiet window. It establishes
that no additional correlated message was observed in that window. This test does
not prove absence for all future time or exactly-once delivery after crashes and
later recovery. Email capture is a synchronous observation of the requests that
reached the handler during this operation.

## Compare every obligation and report the complete failure

The aggregate asserter calls the comparisons for all five obligation groups.
It collects each returned failure report and makes one final xUnit assertion.

```csharp
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

The comparisons are pure checks over the expected and actual data supplied by
the test. They perform no database or broker reads. Gathering remains visible
in the scenario, while detailed comparison remains reusable.

AsserterOrderStore
compares the customer, status, total, placement window, and complete ordered line
records. Record equality includes SKU, product name, quantity, unit price, and
line total. Sequence equality includes the line count and order.

AsserterFulfillmentNotification
compares reference, customer, lines, total, and placement time.
AsserterConfirmationEmail
compares request and path counts, the /emails path, recipient, subject, body, and
order reference. AsserterMessageBroker
checks the unexpected-message observation.

Accumulation makes a failed outcome easier to understand. A wrong total can
appear in the caller result, stored order, fulfillment notification, and email.
The report preserves the failed comparisons that are available instead of
stopping at the first mismatch. A gathering failure, such as a missing required
database row, can still stop the test before the aggregate comparison is reached.

The assertion-report tests
deliberately supply wrong or missing observations and check the diagnostic reports.
The reporting mechanism earns its own verification.

## Email capture: protect recipients and observe the submitted confirmation

We need to check the customer's address, subject, and body without sending test
messages to real customers. We also need access to those values after the order
operation has finished.

Meridian is a teaching application. It has no separate running email service.
Its Test Mediator
records the outgoing request and returns an arranged HTTP 200 response for this
scenario. It forwards nothing to an email provider. The captured requests and
paths are therefore the email actuals used by the asserter above.

DomainFacadeFactory
creates the facade and its mediator together. The production configuration
provider, managers, validators, data manager, publisher, composers, and email
gateway remain in the operation's path. The mediator's HttpMessageHandler captures
at the point where the gateway's request would leave for the email service.
The gateway still constructs the request and interprets the response.

With a stable real provider and a controlled test inbox, the arrangement can
also verify delivery:

1. Capture the original request, preserving its intended customer recipient,
   subject, body, and order reference.
2. Replace the recipient in the forwarded request with a unique, routable test
   address. Keep the original capture unchanged.
3. Forward the request and let the real provider send the message.
4. Compare the original capture with the expected customer and confirmation.
5. Read this run's message from the controlled inbox within a defined timeout.
   Compare the delivered subject and body, and verify the controlled recipient.

The capture verifies whom the application intended to contact. The inbox verifies
what arrived after redirection. Parallel runs need distinct addresses or aliases
that the test environment can receive, plus correlation to each run's order.
Meridian implements request capture; the real delivery arrangement described here
is the production approach, and requires its own provider and inbox support.

The [Test Mediator and Transport Spy article](/writing/the-test-mediator-and-the-transport-spy/)
shows the same example's capture method, paired factory, failure scripts, and
response-body observations. It also explains the separate mediator-and-spies
shape and the combined shape Meridian uses. Those implementation shapes can
support different delivery arrangements.

## Change the scenario and follow the changed obligations

The second scenario in the same complete test class
orders three Turbine Blades. It reads the live price and guards that the total
exceeds the review threshold.

The caller receives Held for Review. The order and lines are still recorded.
Fulfillment must remain absent, its action state is NotRequired, and the email
must acknowledge review without promising fulfillment. The
held-order asserter
compares those obligations together.

Customer Registration supplies another useful example: a successful operation
returns nothing, yet it must record every supplied value correctly. Its
full and minimal registration tests
and accepted-registration asserter
show how observable state provides the outcome to verify.

## Recorded execution of the examples

These listings come from Meridian revision
501e097f66b884615f517c5252d1ab719709f421. They belong to its .NET 10 solution;
the inline listings are excerpts from that project. The full solution remains private.
The following command records how its selected scenarios were executed.

With SQL Server and RabbitMQ running and test configuration in place, the
disposable-database runner can select the two ordering scenarios:

```powershell
dotnet run --project setup/MeridianOrdering.Setup -- run-tests --project tests/MeridianOrdering.Tests/MeridianOrdering.Tests.csproj --filter "FullyQualifiedName~TestPlaceOrderExpectedPaths"
```

The runner hydrates a fresh database and removes it after the run. It keeps this
execution separate from an existing shared test database.

The broader verification for these examples ran all selected Place Order tests and
both production composers' class tests against real SQL Server and RabbitMQ:
77 test cases passed, with no failures or skips. A separate run of the assertion
report tests passed all 18 cases. Those receipts establish the selected execution
results; scenario and expectation review establishes what the results mean.

This one scenario shows why the arrangement and assertion work is substantial.
The test supplies evidence for the accepted order across its required effects.
Once the feature's correct scenarios and expectations cover its established
requirements, green results across the required suite give the team confidence
to go to production.

---

[Previous article](/writing/knowing-which-scenarios-a-feature-requires/) | [Series contents](/acceptance-testing/) | [Next article](/writing/arranging-scenarios-that-stay-true/)
