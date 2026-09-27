---
title: "Testing Against Real Infrastructure"
description: "Real infrastructure must participate when transactions and messages are required outcomes. Provision SQL and broker topology, isolate runs, define observation windows, and verify actual rollback."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "test-isolation", "data-access", "csharp"]
hero: testing-against-real-infrastructure
---

An order must be recorded atomically. The database must supply catalog prices
and reject a conflicting reference. Fulfillment must receive the required message
through the broker. A test needs to exercise those responsibilities in the
infrastructure that performs them.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

Meridian runs its order scenarios against real SQL Server and a real broker.
Its ordinary CI configuration uses RabbitMQ. Its teaching email integration
captures requests; a stable real provider can support the separate
[delivery arrangement](/writing/the-test-mediator-and-the-transport-spy/#redirect-real-delivery-and-read-the-inbox).

The purpose is confidence to go to production. First establish the business
requirements, acceptance criteria, functional requirements, and non-functional
requirements and verify that scenarios and expectations correctly cover them.
Real infrastructure then participates in executing and observing those outcomes.

## Identify what must participate in this order

For an accepted order, arrange:

- **SQL Server with the actual schema and procedures.** The operation checks
  database facts and records order, lines, and initial action state.
- **The seeded catalog.** Arrange reads expected names and prices; production
  reads catalog facts at placement time.
- **A provisioned fulfillment destination.** Production publishes through its
  configured adapter.
- **An isolated subscriber opened before Act.** The test receives its own copy
  and correlates the message with this order.
- **The facade's email capture.** The gateway constructs its request and the
  test observes it at the handler.

The tables
and procedures
define constraints and the placement transaction. Using them exercises their
effects alongside the production data manager. Returning an arranged order from
a substitute could not establish that the transaction committed all required
rows or enforced the reference constraint.

## Start infrastructure, then provision the application

The Docker Compose configuration
starts SQL Server and RabbitMQ for the ordinary local setup. An optional profile
starts the Service Bus emulator and its supporting database.

The local setup sequence is:

```powershell
docker compose up -d
dotnet run --project setup/MeridianOrdering.Setup
dotnet run --project setup/MeridianOrdering.Setup -- run-tests
```

Run from the Meridian repository with its documented SDK and test configuration.
Docker starts engines; setup provisions schema, seed data, and broker topology.
A running SQL process without the required tables is not a ready order store.
A reachable broker without the destination is not a ready messaging arrangement.

These commands belong to the original solution. The accompanying listings are
reference material and do not constitute an independently runnable project.

## Give each run its own database

<!-- diagram:start infrastructure-isolation -->
<figure class="article-diagram">
<svg id="infrastructure-isolation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 740" role="img" aria-labelledby="infrastructure-isolation-title infrastructure-isolation-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="infrastructure-isolation-title">Isolation across runs and within a run</title>
<desc id="infrastructure-isolation-desc">Each run uses a fresh database, while individual tests still own distinct customer and order records, email captures, and broker observations. A process-local Service Bus lease serializes only its own process and does not coordinate other processes.</desc>
<defs><marker id="infrastructure-isolation-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<text x="320" y="35" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Run ownership and test ownership</tspan></text><rect x="65" y="75" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="122.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Fresh database for the run</tspan><tspan x="320.0" dy="33">schema, seed, procedures, teardown</tspan></text><rect x="25" y="240" width="590" height="345" rx="12" style="fill:none;stroke:var(--diagram-line);stroke-width:2;stroke-dasharray:4 7"/><text x="320" y="280" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Within that run</tspan></text><rect x="45" y="315" width="265" height="150" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="177.5" y="349.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="177.5" dy="0">Test A</tspan><tspan x="177.5" dy="33">fresh identities</tspan><tspan x="177.5" dy="33">own email</tspan><tspan x="177.5" dy="33">capture</tspan></text><rect x="330" y="315" width="265" height="150" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="462.5" y="349.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="462.5" dy="0">Test B</tspan><tspan x="462.5" dy="33">fresh identities</tspan><tspan x="462.5" dy="33">own email</tspan><tspan x="462.5" dy="33">capture</tspan></text><text x="320" y="530" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Private broker observations per test</tspan><tspan x="320" dy="33">Filter received messages by order identity</tspan></text><text x="320" y="660" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">A process-local lease cannot coordinate</tspan><tspan x="320" dy="33">separate Service Bus test processes</tspan></text>
</svg>
<figcaption>A disposable run database does not replace per-test ownership. Correlate broker messages and keep email captures private; coordinate shared Service Bus resources beyond a single process.</figcaption>
</figure>
<!-- diagram:end infrastructure-isolation -->

The setup runner creates a generated database, hydrates it, passes its connection
string to dotnet test, and drops it in finally. Here are selected statements from
the runner:

```csharp
/// Arrange: generate and hydrate the database owned by this run.
var databaseName = $"MeridianOrdering_Test_{Convert.ToHexString(RandomNumberGenerator.GetBytes(6))}";
string disposableConnectionString = CreateAndHydrateDatabase(configuredConnectionString, databaseName, cancellationToken);
```

```csharp
/// Arrange: point the test process at the newly created database.
dotnetTestStartInfo.Environment[OrderStoreConnectionStringVariable] = disposableConnectionString;
```

These statements come from different points in the method. The runner retains
the server and authentication details but replaces the database name. It validates
names against its generated pattern before creation or deletion. Cleanup ownership
begins after successful creation; hydration failure also attempts owned cleanup.

Cancellation stops the test process before its database is removed. If execution
and cleanup both fail, the original exception retains the cleanup failure in its
data. Leftover state needs diagnosable cleanup failures.

A fresh database and random record identities address different isolation scopes.
The database separates runs sharing a server. Owned identities separate scenarios
within that database and make targeted teardown explicit.

## Isolate broker observations too

If four developers consume one queue, one consumer can remove another test's
message. Random references identify messages but cannot recover those already
consumed elsewhere.

Meridian's RabbitMQ subscriber creates a private exclusive queue and binds it to
the fulfillment exchange. Each test gets a separate copy of publications routed
there. The subscriber
shows declaration and binding. Its queue can receive other orders too, so the
test helper filters by this run's order reference.

The Service Bus path leases a pre-provisioned subscription from a pool and returns
it on disposal. Test assemblies declare disjoint slices of names. Arrangement
drains leftovers from the leased subscription before Act. The
broker helpers
show both paths and bounded lease waiting.

A process-local lease pool cannot coordinate unrelated developers using the same
subscriptions. Across machines or independent CI jobs, use disjoint names,
separate environments, or an explicit coordination mechanism. Understand the
scope of the local ownership mechanism before sharing its infrastructure.

The scenario owns its subscriber with await using:

```csharp
/// Arrange: open the observation before the order publishes.
await using var subscriberFulfillmentNotifications =
    await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();
```

Subscribe first, invoke the order, then gather. Opening after publication could
miss the effect being verified.

## Give observations defined windows

Meridian allows up to ten seconds to receive the required message. A successful
receive returns when the message arrives. It then listens for an additional
correlated message during a one-second quiet window:

```csharp
/// Assert: observe the required message and any extra notification.
var actualFulfillmentNotificationPayload = await BrokerSubscriptions.ReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
var actualExtraFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
    subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);
```

The quiet-window assertion establishes that no additional correlated message was
observed in that interval. Crash recovery or later replay has separate scenarios.
The observation cannot establish absence for all future time.

Use the same discipline for a real inbox: bounded waiting, this run's identity,
and content comparisons after receipt. Provider acceptance and inbox arrival are
different observations with different timing.

## Verify rollback after the real transaction starts

Meridian's rollback scenario uses a private hydrated database with an OrderLine
insertion trigger that waits ten seconds. The SQL command timeout is two seconds.
The actual procedure starts its transaction and reaches the insertion before
timeout interrupts it.

The class owns this database:

```csharp
/// Arrange: create a private database with delayed OrderLine insertion.
private readonly DisposableOrderStore _disposableOrderStoreWithArrangedLineDelay =
    DataManagerForTest.CreateDisposableOrderStore(
        DataManagerForTest.CreateDisposableDatabaseName(),
        arrangedFault: DisposableOrderStoreFault.OrderLineInsertTimeout);
```

Here is the complete rollback scenario, with phase comments marked for reading:

<!-- Listing source: tests/MeridianOrdering.Tests/Acceptance/DomainFacade/TestPlaceOrderRollback.cs; method: PlaceOrder_WhenOrderLineInsertExceedsCommandTimeout_ThenSqlClientReportsTimeoutAndTheEntireDatabaseOperationRollsBack -->

```csharp
/// Arrange, Act, Assert: exercise a real timeout and verify complete rollback.
public async Task PlaceOrder_WhenOrderLineInsertExceedsCommandTimeout_ThenSqlClientReportsTimeoutAndTheEntireDatabaseOperationRollsBack()
{
    /// Arrange - a real schema in a private database, with a valid customer and product.
    // Its AFTER INSERT trigger waits ten seconds during OrderLine insertion.
    int expectedSqlClientTimeoutErrorNumber = -2;
    Type expectedExceptionType = typeof(OrderStoreUnavailableException);
    List<string> expectedSqlTimeoutMessagePhrases = ["Execution Timeout Expired"];
    var disposableOrderStore = _disposableOrderStoreWithArrangedLineDelay;
    var timeoutConnectionStringBuilder = new SqlConnectionStringBuilder(disposableOrderStore.ConnectionString)
    {
        CommandTimeout = 2,
    };
    var customerRecord = DataGenerators.CreateCustomerRecord(
        customerId: _expectedOrderPlacementIdentifiers.CustomerId,
        customerStatus: DataGenerators.ActiveCustomerStatus);
    DataManagerForTest.InsertCustomer(customerRecord, disposableOrderStore.ConnectionString);
    var catalogProduct = DataManagerForTest.GetRandomCatalogProducts(
        productCount: 1,
        connectionString: disposableOrderStore.ConnectionString)[0];
    // Line items are Set even at quantity 1: the product must come from the private
    // disposable store the facade is pointed at, not from the shared store the
    // builder's default reads.
    var orderPlacementRequest = RequestBuilders.OrderPlacementRequestBuilder
        .Set(request => request.OrderReference, _expectedOrderPlacementIdentifiers.OrderReference)
        .Set(request => request.CustomerId, customerRecord.CustomerId)
        .Set(request => request.OrderPlacementLineItems, [new OrderPlacementLineItem(sku: catalogProduct.Sku, quantity: 1)])
        .Build();
    var (domainFacadeInstance, testMediatorEmailService, _) = DomainFacadeFactory.CreateDomainFacade(
        overrideByEnvironmentVariableName: new Dictionary<string, string>
        {
            [DataManagerForTest.OrderStoreConnectionStringVariable] = timeoutConnectionStringBuilder.ConnectionString,
        });
    await using var domainFacade = domainFacadeInstance;
    await using var subscriberFulfillmentNotifications =
        await BrokerSubscriptions.SubscribeToFulfillmentNotificationsForTestAsync();

    var expectedOrderPlacementRecordCounts = new OrderPlacementRecordCounts(
        CustomerCount: 1, OrderCount: 0, OrderLineCount: 0, OrderMessagingStateCount: 0);

    /// Act - SqlClient's command timeout cancels execution while the trigger waits.
    // The data manager's existing SQL-error translation remains under test.
    Exception? actualException = await Record.ExceptionAsync(
        async () => await domainFacade.PlaceOrderAsync(orderPlacementRequest));

    /// Assert - the data manager preserved the SQL client's timeout as the cause.
    AsserterSqlClientException.AssertExceptionWasATimeoutException(
        actualException: actualException,
        expectedExceptionType: expectedExceptionType,
        expectedErrorNumber: expectedSqlClientTimeoutErrorNumber,
        expectedMessagePhrases: expectedSqlTimeoutMessagePhrases);

    /// Assert - the arranged customer remains, but every record created inside the
    // PlaceOrder transaction is absent. No side effect was attempted afterward.
    var actualOrderPlacementRecordCounts = DataManagerForTest.GetOrderPlacementRecordCounts(
        customerId: customerRecord.CustomerId,
        orderReference: orderPlacementRequest.OrderReference,
        connectionString: disposableOrderStore.ConnectionString);

    Assert.Equal(expectedOrderPlacementRecordCounts, actualOrderPlacementRecordCounts);

    var actualUnexpectedFulfillmentNotificationPayload = await BrokerSubscriptions.TryReceiveMessageForOrderAsync(
        subscriberFulfillmentNotifications, orderPlacementRequest.OrderReference);

    AsserterMessageBroker.AssertNoMessageArrived(
        actualUnexpectedFulfillmentNotificationPayload,
        orderPlacementRequest.OrderReference,
        RollbackRule);

    AsserterConfirmationEmail.AssertNoEmailSent(testMediatorEmailService.CapturedEmailRequests, RollbackRule);
}
```

The containing class
includes database creation and teardown. The
database helper
includes trigger installation, hydration, name validation, and record-count queries.

The scenario checks the translated timeout and preserved SQL cause, the remaining
customer, zero matching orders, lines, and messaging-state records, broker absence,
and no captured email. Its expected counts are a structured record compared with
fresh reads against the private database.

This verifies rollback after work has begun. Throwing before the first write would
exercise a different condition. The private database keeps the deliberate delay
away from other scenarios.

## Select downstream services the tests can rely on

Real downstream services are appropriate when availability and contract stability
are dependable enough for testing. Trusted here means predictable operation and
change, including advance notice when contracts will change.

A stable payment sandbox or email integration can be suitable. A dependency that
regularly disappears or changes without notice can fail the suite for reasons
outside the feature being changed. This is a practical environment constraint;
it does not change the purpose of functional acceptance testing at the boundary.

Arrange credentials, owned data, controlled recipients or destinations, capacity,
and bounded observation. Account for billable operations and effects that cannot
simply be undone. Email can capture the intended recipient and redirect to a
controlled inbox. Payment testing can use the provider's approved test environment
and operations. Integration-specific details belong with that implementation.

A selected transport seam can arrange failures on demand while retaining production
response handling. The [Test Mediator article](/writing/the-test-mediator-and-the-transport-spy/)
explains its evidence and what needs a separate real-service observation.

## Use real infrastructure at the final CI gate

The checked-in workflow
starts the Compose services, waits for healthy infrastructure, builds and checks
formatting, provisions the application, then runs tests through the disposable
database runner. It configures MERIDIAN_MESSAGE_BROKER_TYPE as RabbitMq.
This snapshot demonstrates SQL Server and RabbitMQ in CI. Cloud Service Bus and
real-provider email delivery are separate environment choices.

A team can use a local broker for development and its deployed broker in CI by
configuration, with appropriate topology and isolation. The final gate should
exercise the real infrastructure required for release, subject to the same
downstream stability constraints. Record which provider and environment each
execution receipt used.

The recorded local verification ran the selected Place Order scenarios and both
composer suites against SQL Server and RabbitMQ: 77 passed, with no failures or
skips. Assertion-report verification passed all 18 cases.
These are local execution
receipts; they do not claim a CI or cloud-provider execution for these examples.

Correct arrangements, real infrastructure, and deep assertions work together.
The required suite must cover the established scenarios and expectations. That
is the release evidence the team maintains as the system changes.

---

[Previous article](/writing/a-suite-the-team-can-keep-trusting/) | [Series contents](/acceptance-testing/) | [Next article](/writing/learning-a-system-through-its-tests/)
