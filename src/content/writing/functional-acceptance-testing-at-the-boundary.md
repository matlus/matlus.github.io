---
title: "Functional Acceptance Testing at the Boundary"
description: "Functional acceptance tests verify complete outcomes through the assembled system. Correct arrangements, deep assertions, and controlled observations support release confidence."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "verification", "regression-testing", "test-isolation", "test-mediator", "transport-spy", "design-patterns", "csharp"]
hero: functional-acceptance-testing-at-the-boundary
---

Consider an ordering system with these parts:

- **Application code** accepts an order request, checks the business rules,
  records the order, and initiates the required messages and email.
- **A database** holds customers and the product catalog. It also records the
  order information and the progress of the required actions.
- **A message broker** carries a message asynchronously to the downstream
  fulfillment service so that service can act on the order.
- **An email service** sends the order confirmation to the customer when the
  ordering application calls its HTTP API.

Those moving parts work together to fulfill the request. That is the system we
want to test.

Your system includes the application and its owned dependencies. Stable services
owned by other teams or external providers can also participate in testing through
suitable sandbox environments or approved test operations.

<!-- diagram:start acceptance-boundary-ownership -->
<figure class="article-diagram">
<svg id="acceptance-boundary-map" style="--boundary-app:var(--diagram-validation);--boundary-app-fill:var(--diagram-validation-fill);--boundary-data:var(--diagram-controller);--boundary-data-fill:var(--diagram-controller-fill);--boundary-messaging:var(--diagram-worker);--boundary-messaging-fill:var(--diagram-worker-fill);--boundary-storage:var(--diagram-artifact);--boundary-storage-fill:var(--diagram-artifact-fill);--boundary-internal:var(--diagram-requirements-web);--boundary-internal-fill:var(--diagram-requirements-web-fill);--boundary-external:var(--diagram-requirements-splunk);--boundary-external-fill:var(--diagram-requirements-splunk-fill);display:block;width:100%;max-width:640px;height:auto;margin-inline:auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 1030" role="img" aria-labelledby="site-native-title site-native-desc">
<title id="site-native-title">The application under test and its participating dependencies</title>
<desc id="site-native-desc">Test invocation connects directly to the application. A dotted system boundary contains the application and three smaller owned dependency boxes. The application, stable internal services, and stable external services have equal-sized boxes. Other teams' services are within the organization and outside the system; external services are outside the organization. All selected real services participate in testing.</desc>
<style>svg#acceptance-boundary-map text{fill:var(--diagram-label,var(--color-text));font-family:var(--font-sans,sans-serif);font-size:26px;text-anchor:middle}svg#acceptance-boundary-map .label{font-weight:650}svg#acceptance-boundary-map .small{fill:var(--color-text-muted)}svg#acceptance-boundary-map .title{font-size:29px;font-weight:650}svg#acceptance-boundary-map .app-label{font-size:29px;font-weight:750}svg#acceptance-boundary-map .boundary-label{text-anchor:start;font-size:26px}svg#acceptance-boundary-map .org{fill:none;stroke:var(--color-border-strong);stroke-width:2;stroke-dasharray:8 7}svg#acceptance-boundary-map .system{fill:none;stroke:var(--color-border-strong);stroke-width:2.2;stroke-dasharray:1 8;stroke-linecap:round}svg#acceptance-boundary-map .invocation{fill:var(--color-surface);stroke:var(--color-border-strong);stroke-width:1.7}svg#acceptance-boundary-map .app{fill:var(--boundary-app-fill);stroke:var(--boundary-app);stroke-width:3}svg#acceptance-boundary-map .data{fill:var(--boundary-data-fill);stroke:var(--boundary-data)}svg#acceptance-boundary-map .messaging{fill:var(--boundary-messaging-fill);stroke:var(--boundary-messaging)}svg#acceptance-boundary-map .storage{fill:var(--boundary-storage-fill);stroke:var(--boundary-storage)}svg#acceptance-boundary-map .internal{fill:var(--boundary-internal-fill);stroke:var(--boundary-internal)}svg#acceptance-boundary-map .external{fill:var(--boundary-external-fill);stroke:var(--boundary-external)}svg#acceptance-boundary-map .dependency{stroke-width:1.7}svg#acceptance-boundary-map .downstream{stroke-width:1.6}svg#acceptance-boundary-map .wire{fill:none;stroke:var(--diagram-line);stroke-width:2.4;marker-end:url(#site-native-arrow)}svg#acceptance-boundary-map .entry{stroke:var(--boundary-app);stroke-width:3;marker-end:url(#site-native-entry)}
</style>
<defs>
<marker id="site-native-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--diagram-line)"/></marker>
<marker id="site-native-entry" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="var(--boundary-app)"/></marker>
</defs>
<rect width="640" height="1030" fill="var(--color-bg)"/>
<text class="title" x="320" y="38">Ownership and participation</text>
<rect class="invocation" x="170" y="60" width="300" height="64" rx="7"/>
<text class="label" x="320" y="101">Test invocation</text>
<rect class="org" x="20" y="150" width="600" height="630" rx="7"/>
<text class="label boundary-label" x="50" y="184">Your organization</text>
<rect class="system" x="46" y="205" width="548" height="366" rx="7"/>
<text class="label boundary-label" x="70" y="241">Your system</text>
<path class="wire entry" d="M320 124V263"/>
<rect class="app" x="65" y="266" width="510" height="123" rx="7"/>
<text class="app-label" x="320" y="306">Application / service</text>
<text x="320" y="343">Public operation under test</text>
<text class="small" x="320" y="375">Produces the required outcomes</text>
<path class="wire" d="M320 389V410H142V438"/>
<path class="wire" d="M320 410V438"/>
<path class="wire" d="M320 410H498V438"/>
<rect class="dependency data" x="65" y="441" width="154" height="74" rx="7"/>
<rect class="dependency messaging" x="243" y="441" width="154" height="74" rx="7"/>
<rect class="dependency storage" x="421" y="441" width="154" height="74" rx="7"/>
<text x="142" y="472">Data</text><text x="142" y="502">store</text>
<text x="320" y="486">Messaging</text><text x="498" y="486">Storage</text>
<text class="small" x="320" y="550">Examples of owned dependencies</text>
<path class="wire" d="M575 327H604V605H320V620"/>
<rect class="downstream internal" x="65" y="623" width="510" height="123" rx="7"/>
<text class="label" x="320" y="663">Stable internal services</text>
<text x="320" y="700">Owned by other teams</text>
<text class="small" x="320" y="732">Real services participate in tests</text>
<path class="wire" d="M65 327H34V822H320V837"/>
<text class="small" x="320" y="808">Outside your organization</text>
<rect class="downstream external" x="65" y="840" width="510" height="123" rx="7"/>
<text class="label" x="320" y="880">Stable external services</text>
<text x="320" y="917">For example, email or payments</text>
<text class="small" x="320" y="949">Real services participate in tests</text>
<text class="small" x="320" y="1006">Test sandbox</text>
</svg>
<figcaption>The test enters through the application's public operation.</figcaption>
</figure>
<!-- diagram:end acceptance-boundary-ownership -->

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

We will use Meridian Ordering as the example. Start with one successful order,
follow everything that should happen, and then work through how to test it.

The code excerpts below follow the same acceptance test. The
complete test class
includes its setup and cleanup; the [full walkthrough](/writing/one-order-every-obligation/)
explains the supporting code.

## What should happen when an order is placed?

An existing active customer orders three Widgets and two Gadgets. A Widget costs
$19.99 and a Gadget costs $249.50. The two line totals are $59.97 and $499.00,
giving an order total of $558.97. The total is below the review threshold, so
this order should be placed and released to fulfillment.

These values come from the feature's worked acceptance example. The order request
supplies a product identifier and quantity for each line. A product identifier
is called a SKU.

To get a product's price, the system reads that product's record from the Product
table in the database when it places the order. It uses the UnitPrice stored in
that record to calculate the line total. The caller does not supply the price
in the order request.

A successful placement has several consequences:

- One row is created in the Order table. It records the order reference, customer
  identifier, Placed status, total, and placement time.
- Two rows are created in OrderLine. Each records the canonical SKU, product name,
  quantity, catalog unit price, and line total for its product.
- A fulfillment notification goes through the message broker. It carries the
  reference, customer, placement time, total, and complete line information so
  fulfillment has what it needs to act on the order.
- The email service is called with one confirmation for the customer's address
  on file. Its subject identifies the order. Its body identifies each product,
  quantity, price, line total, and the order total.
- The caller receives the order reference, total, and Placed status.

For an example reference of REF-A1, Meridian's confirmation content is:

```text
Subject: Meridian Supply order confirmation REF-A1

Thank you for your order REF-A1.

Widget: 3 x $19.99 = $59.97
Gadget: 2 x $249.50 = $499.00

Order total: $558.97
```

The system also records the progress of required fulfillment and email actions
in OrderMessagingState. That allows outstanding work to remain recorded when an
action cannot complete. We will return to those failure scenarios later. For now,
we are following the ordinary successful placement and its customer-facing and
fulfillment outcomes.

This is the business behavior we need to verify. The customer should receive
confirmation for the right order and amount. Fulfillment should receive the right
items and quantities. The database should contain the order the customer placed.

## Arrange a customer that belongs to this test

The operation requires an existing active customer. Arranging that customer
means creating the customer record the operation will use and inserting it into
the database before placing the order.

Two shortcuts can make different runs reuse the same customer:

- Hard-code a customer identifier in the test and use it on every run.
- Use a predefined customer already in the database.

Consider what happens when several developers run the tests against that database.
CI can also run multiple scenarios in parallel, and several pull-request pipelines
can run at the same time. Whenever those runs share resources, the fixed customer
can become part of several tests' arrangements and cleanup.

One test may change that customer's status to exercise an inactive-customer
scenario. Another may remove the customer during cleanup. A successful-order
test using the same customer now depends on the timing of those other tests.
An earlier run can also leave records that affect a later run on the same machine.

For this scenario, the test arranges:

- **A fresh random customer identifier**, so each run creates its own customer.
- **A fresh random email address**, recorded on that customer. The test will
  check that the confirmation uses this address.
- **Active customer status**, because this successful-order scenario requires
  an active customer.
- **The customer record in the database**, so the production customer check
  finds the customer we arranged.
- **A fresh random order reference**, so this run's order and messages can be
  identified separately from those belonging to another run.
- **Cleanup using those identifiers**, so the test removes its own records when
  it finishes, including when it fails.

Random identifiers help keep each run's records separate. Active status is
deliberate because it defines the scenario. Random data generation should
preserve that condition.

Here is the arrangement in code. The containing test class reserves the identifiers,
and the test method creates and inserts the active customer:

```csharp
/// Arrange: reserve this run's identities and create its customer.
private readonly ExpectedOrderPlacementIdentifiers _expectedOrderPlacementIdentifiers =
    DataGenerators.CreateExpectedOrderPlacementIdentifiers();

var customerRecord = ArrangedCustomers.CreateArrangedCustomer(
    _expectedOrderPlacementIdentifiers.CustomerId);
```

CreateArrangedCustomer builds the customer record with the reserved identifier and
inserts it into the database. The containing class uses those reserved identifiers
again during cleanup.

## Arrange the products and expected results

The products already exist in the catalog. The test reads their database records
to get the product identifiers, names, and prices it needs. These are shared
reference records; the test creates its own customer and order without changing
the catalog.

The product arrangement has several steps:

- **Select two different catalog products.** The test must avoid choosing the
  same product twice because this scenario requires two valid order lines.
- **Use quantities of three and two.** Those quantities are deliberate inputs
  for the successful-order scenario.
- **Limit the prices eligible for selection.** The combined quantities and
  prices must keep the total at or below the review threshold, regardless of
  which eligible products the test selects.
- **Calculate the expected line totals from the prices just read.** Multiply
  each product's UnitPrice by its ordered quantity, then add the line totals to
  get the expected order total.
- **Submit differently cased product identifiers.** The test expects the system
  to recognize those products and record and send their identifiers in uppercase.

Reading the prices avoids hard-coding catalog values that could become outdated
when the database is reseeded. The worked example explains the arithmetic; the
executable test calculates its expectations from the records it selected.

This code reads the eligible product records and builds the request. The request
contains product identifiers and quantities:

```csharp
/// Arrange: read catalog products and build the request.
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

Before calling the system, the test establishes the expected:

- Reference, total, and status returned to the caller.
- Order and line values recorded in the database.
- Fulfillment message content.
- Confirmation content and recipient, using the arranged customer's email address.

The assertions will compare these expectations with what actually happened.

Here is the complete expected order for these two lines, followed by the factory
that builds its expected caller, database, fulfillment, and email representations:

```csharp
/// Arrange: establish the complete expected outcome.
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

The email composer used by that factory has independent class tests, which verify
its content before the acceptance test borrows it to build expectations.

## Prepare to observe fulfillment

Before placing the order, the test opens a broker subscription. It uses the order
reference to identify its own message. Isolated queues or subscriptions and owned
cleanup keep parallel runs from treating another test's message as their result.

```csharp
/// Arrange: subscribe before the operation publishes its message.
await using var subscriberFulfillmentNotifications =
    await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();
```

The test also has access to the requests recorded at the email-service boundary.
We will explain that email arrangement separately after following the result
through the assertions.

## Place the order through the public operation

With the arrangement in place, the test calls the same public ordering operation
that the application uses:

```csharp
/// Act: place the order through the public operation.
var expectedPlacementWindowStartUtc = DateTime.UtcNow;

OrderPlacementResult actualOrderPlacementResult =
    await domainFacade.PlaceOrderAsync(orderPlacementRequest);
```

The production path performs validation, applies the rules, executes the database
transaction, publishes fulfillment, and calls the email gateway. The test exercises
that path through its entry point. It does not call each internal component
separately to assemble an answer of its own.

## Verify everything the successful order should produce

After the call completes, the test gathers the actual results. These are the
values produced by the operation, which we now need to compare with the expectations:

- **Read the order and its lines from the database**, using this test's order
  reference. The test-side reader queries the tables independently of the
  production data manager.
- **Receive the fulfillment message from the broker**, using the same reference
  to identify the message.
- **Listen for another message for that order**, to check for an extra notification
  during the observation window.
- **Read the recorded email requests**, including their recipient, subject, body,
  reference, and request path.
- **Keep the caller's returned result**, which came directly from PlaceOrderAsync.

The database and broker reads are visible in the test:

```csharp
/// Assert: gather actual values from the database and broker.
var actualRecordedOrder = DataManagerForTest.GetRecordedOrder(orderPlacementRequest.OrderReference);
var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualExtraFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualPlacementWindowEndUtc = DateTime.UtcNow;
```

The test puts these actuals together with the caller result and the email captures,
then passes both the expected and actual outcomes to the asserter:

```csharp
/// Assert: compare expected and actual outcomes.
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

The comparisons cover the required fields and counts:

| Outcome | What the test compares |
| --- | --- |
| Caller result | The expected reference, total, and Placed status |
| Order record | The correct customer, status, total, and placement time, read back using this order's reference |
| Order lines | Exactly the expected lines, including every SKU, name, quantity, unit price, and line total |
| Fulfillment message | The correct reference, customer, complete lines, total, and recorded placement time |
| Fulfillment count | The required correlated message and no additional correlated message in the observation window |
| Confirmation request | Exactly one request at the required path, with the correct recipient, subject, body, and order reference |

The store comparison checks every required field in each order line. For example,
Quantity and UnitPrice both have to match their expectations, even when a mistake
in one happens to leave the overall total looking plausible. The notification
and email comparisons verify that the required values reached those destinations
correctly too.

The recorded placement time is checked against the operation's time window, with
the defined clock-skew allowance. The fulfillment timestamp is compared with the
actual timestamp read from the stored order. This verifies both when the order
was recorded and whether that recorded time was carried into the message.

Finding an order row alone would miss a wrong total or missing line. Finding a
message alone would miss a wrong quantity. Capturing an email alone would miss
a wrong recipient or incorrect confirmation body. The assertions compare the
actual values with the established expectations.

For fulfillment, the test also listens for an extra message during a defined
quiet window. That provides bounded evidence about duplicate notification in this
scenario. Later articles explain the observation window and the separate concerns
of retry, concurrency, and recovery.

Meridian groups these comparisons in an asserter that reports all available
mismatches together. If the total is wrong in the caller result, database,
fulfillment payload, and email, the team gets the failed comparisons in one report.
The [complete order walkthrough](/writing/one-order-every-obligation/) shows the full
test, its asserters, and the production code behind this flow.

## The email problem and the two ways to handle it

We need to verify the intended recipient, subject, and body. We also need to keep
a test run from sending messages to real customers. If we use a real provider,
we need a way to find the delivered email and compare it with our expectation.

A Test Mediator and a transport spy give the test access to that information:

- **The spy** sits where the application's email request would leave for the
  provider. It records what the application is about to send and controls whether
  that request is forwarded.
- **The Test Mediator** makes the recorded information available to the test and
  carries any instructions the spy needs for this scenario.

The production code still builds the email for the customer's address on file.
The test can therefore verify that intended destination before any redirection.

### Meridian: capture the request and return an arranged response

Meridian is a teaching application. It deliberately does not include a separate
running email service. Building that additional system would add complexity that
we do not need to explain ordering and boundary testing.

Its email Test Mediator captures the outgoing HTTP request and returns the
arranged response. For the successful-order test, it returns HTTP 200. The request
does not leave for an email provider, and there is no delivered email to read.

The test can assert:

- The captured recipient is the arranged customer's address on file.
- The captured subject and body match the expected confirmation.
- The captured order reference is correct.
- Exactly one request was made to the expected email resource path.

Here are the email actuals in the test. They were recorded while the production
gateway was processing the order:

```csharp
/// Assert: read the captured email requests and paths.
testMediatorEmailService.CapturedEmailRequests.ToArray()
testMediatorEmailService.CapturedRequestPaths.ToArray()
```

Meridian combines the Test Mediator and its private transport spy in one class.
The controlled HttpMessageHandler is the spy beneath the production HTTP gateway.
That implementation detail explains where capture happens; it does not change
which email fields the scenario must verify.

### A production application: redirect delivery and read the inbox

Suppose the application uses a stable real email provider, such as SendGrid.
The Test Mediator and spy can support a different arrangement:

1. Prepare a test-controlled delivery address and a way to read its inbox.
2. When the outgoing request reaches the spy, capture its original recipient,
   subject, body, and order reference. Preserve that capture unchanged.
3. In the request being forwarded, replace the recipient with the controlled
   test address. The application itself still builds the original customer email.
4. Forward the request to the real provider and let the provider send it.
5. Assert that the original captured recipient was the correct customer's address,
   and that the original subject and body matched the expectation.
6. Read the delivered email from the test inbox. Identify this run's
   message using its delivery address and order reference, within a defined timeout.
7. Compare its delivered subject and body with the expected confirmation and check
   that it arrived at the controlled address.

The two recipient checks establish different facts. The capture proves which
customer the application intended to contact. The inbox proves delivery to the
test destination after the spy redirected it. The subject and body are verified
at both observations.

Parallel runs need distinct, deliverable test addresses or aliases within an
email domain the test environment controls. Generating an arbitrary address is
not enough; the environment must be able to receive and read mail for it. Each
run must also be able to identify and clean up its own messages. The details of
providing those inboxes can be handled separately from the ordering test.

This verifies that our application submits the right confirmation and that the
expected message arrives through the real integration. We are verifying the
order's communication requirement, rather than building a test suite for the
email provider's internal implementation.

The production delivery arrangement described here is the approach I would use
with a suitable provider and test inbox. Meridian implements the capture-only
arrangement above.

The pattern can keep the Test Mediator separate from its spies or combine one
service's mediator and spy, as Meridian does. Those are implementation shapes;
capturing without forwarding and redirecting a real delivery are choices about
what a particular test does at the transport boundary.

The [Test Mediator and Transport Spy article](/writing/the-test-mediator-and-the-transport-spy/)
explains this same email example in detail, including the two shapes and their
two-way communication. The email Test Mediator source
provides its implementation.

## This is functional acceptance testing at the boundary

We started with the ordering system and the behavior the business requires.
We arranged the conditions for one scenario, invoked its public operation, and
verified the required results across the assembled system.

The boundary gives the test an entry point and a set of effects to observe.
Inside that path, the production components have to work together. A validator
that works when called directly is of no use to this order if the production
path never calls it. Likewise, a correct calculation has to reach the stored
order, fulfillment message, and confirmation.

End to end here means the complete ordering operation of the service under test.
The database and broker behavior participate in the evidence. The selected email
transport gives us controlled responses and observable requests. HTTP parsing,
routing, and response translation have their own responsibilities at the service
interface, which we will explain separately.

## Why invest this much work?

The purpose is confidence to go to production. The arrangement and assertions can
take as much effort as implementing the feature, or more. They establish that the
actual system produces the outcomes the business depends on.

The successful order is one scenario. The feature also requires review, refusal,
threshold, resubmission, concurrency, and failure scenarios. Each has its own
correct conditions and expectations.

There is a prerequisite behind the release decision. The business requirements,
acceptance criteria, functional requirements, and non-functional requirements have
already been established. We have also verified that the feature's scenarios and
expectations are correct and cover those requirements. Once those conditions are
met, green tests give the team confidence to go to production.

The [scenario-completeness article](/writing/knowing-which-scenarios-a-feature-requires/) explains
that connection. Correct arrangements, deep assertions, and review give meaning
to the suite's green result.

## Practical choices for real services

We use real downstream services wherever they are stable enough to support testing.
Trusted means we can rely on their availability and change process. Stable payment
or email sandboxes can be suitable. An unreliable or rapidly changing dependency
can cause failures unrelated to our build and needs a practical arrangement.

Local and CI infrastructure must support isolated data, subscriptions, and cleanup.
Multiple pull-request runs may have separate infrastructure or share it; the
arrangements must respect that actual setup. The final CI gate should exercise
real infrastructure, subject to the same downstream stability considerations.

These decisions make the testing usable. The remaining articles explain them
through the scenarios that require them.

## The regression suite protects the business's investment

While a team concentrates on a new feature, the business still depends on
everything that worked before that sprint. Those obligations remain even when
the developers working on them have moved to other projects.

In my experience, the additional time the business pays for testing purchases
that continuing regression protection. Each completed feature joins the maintained
suite. When the team changes the system, the suite checks the earlier features
alongside the new work.

A failure in an earlier scenario tells us that the change had a consequence we
did not intend. We can address it before exposing customers to it. When behavior
changes intentionally, we review the changed requirement and update its scenarios
and expectations accordingly.

The suite also accumulates what we learn. A missed scenario found during review,
QA, a later release gate, or production becomes a permanent regression scenario.
The next release carries that knowledge forward.

## The tests teach the system

A new teammate can find a feature, read its scenarios, and debug the operation
each test invokes. The requirements and their running implementation are available
together.

They can watch validation apply the rule, see the order recorded, follow the
outbound work, and return to the assertions that verify the result. A refusal
scenario shows why the system rejects a request and what must remain unchanged.
A failure scenario shows what the system owes when part of the work cannot finish.

Written documentation helps people find their way through a system. The executable suite supplies the
detail and the continuing check that the described behavior still works. It gives
the team a way to learn the system that follows the system as it evolves.

## One maintained behavioral verification discipline

The position developed in this series is that functional acceptance testing at
the boundary is the primary, mandatory behavioral verification artifact. Under
the supporting architecture, coding, failure-handling, and review discipline, it
gives the team the evidence it needs to release the service's behavior.

Other techniques can help discover missing scenarios, examine dense rule clusters,
or evaluate separate concerns. A contract can express an obligation. A generator
can find an input we overlooked. A mutation run can expose a weak assertion.
The assembled system must still demonstrate the required behavior before release.
Those discoveries strengthen the same maintained boundary suite.

Capacity, security, resilience, user experience, and deployed environment readiness
also have release responsibilities. They contribute their own evidence. The
behavioral suite establishes that the service fulfills its established obligations;
green tests do not certify every production condition or provide mathematical
certainty about every possible input.

The team can be proud of what it sends to production because it has done the work
to understand and verify it. The confidence comes from correct requirements,
correct scenarios and expectations, and complete outcomes passing through the
assembled system. That is the purpose of the discipline, and the reason for the
effort this series will explain.

## Follow the implementation in more detail

- [Arranging Scenarios That Stay True](/writing/arranging-scenarios-that-stay-true/) explains
  random identities, constrained data selection, builders, and cleanup ownership.
- [Assertions That Verify the Whole Outcome](/writing/assertions-that-verify-the-whole-outcome/) shows
  field comparisons, timestamps, accumulated reports, and expectation verification.
- [The Test Mediator and the Transport Spy](/writing/the-test-mediator-and-the-transport-spy/)
  follows email capture, response scripts, real-delivery redirection, and inbox checks.
- [Testing Against Real Infrastructure](/writing/testing-against-real-infrastructure/)
  explains provisioning, database and broker isolation, rollback, and the CI gate.

---

[Series contents](/acceptance-testing/) | [Next article](/writing/knowing-which-scenarios-a-feature-requires/)
