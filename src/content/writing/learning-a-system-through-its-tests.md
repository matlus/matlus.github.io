---
title: "Learning a System Through Its Tests"
description: "Acceptance tests let teammates learn requirements and production behavior together. Follow one order through Arrange, the visible Act, independent observations, and complete assertions."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "executable-documentation", "architecture", "csharp"]
hero: learning-a-system-through-its-tests
---

A new teammate needs to understand what happens when a customer places an order
and where that behavior lives. The acceptance suite supplies a runnable starting
point. Its scenarios describe requirements, invoke production code, and compare
the resulting effects.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

In my experience, this lets a new developer learn requirements and implementation
together. I worked with an intern who understood the architecture
within two days by walking through its tests. That is an experience from systems
where I used this discipline, not a promised onboarding time for every team.

The following checkpoints show that approach using Meridian. Readers with access to a comparable project can follow the same sequence in their own debugger.

## Find one complete feature scenario

Open the Place Order requirements
and find AC-01. Then open the
expected-path test class.
Read the scenario name and the Arrange, Act, and Assert phases before stepping
into helpers.

Write down its obligations: accepted caller result, correct order and lines,
one complete fulfillment notification, and the correct captured confirmation.
The [obligation map](/writing/knowing-which-scenarios-a-feature-requires/#place-order-obligation-map) connects those
facts with their observations and comparisons.

## Prepare the same runnable environment

Within the private Meridian project, this exercise uses its documented SDK and the
[infrastructure setup](/writing/testing-against-real-infrastructure/). Start SQL Server
and RabbitMQ, provision schema and topology, and run the selected scenario:

```powershell
dotnet run --project setup/MeridianOrdering.Setup -- run-tests --project tests/MeridianOrdering.Tests/MeridianOrdering.Tests.csproj --filter "FullyQualifiedName~PlaceOrder_WhenActiveCustomerPlacesValidOrder"
```

The runner owns a newly hydrated database. For interactive debugging, configure
the IDE test runner according to the repository's test configuration and ensure
its target store is provisioned. The setup-runner command and IDE debugging are
different launch paths; verify the connection string used by the debugging process.

## Step through Arrange and inspect its values

At the customer helper, inspect the fresh identifier, Active status, and generated
email. Watch the insert create a real database record. At catalog selection,
inspect the chosen records and prices. Read the expected line totals and order total.

The request supplies quantities and SKU identities; prices come from the catalog.
Expected status is deliberate, and price constraints preserve that scenario.
The subscriber opens before the message can be published. The facade and email
capture are paired. These arrangements explain why the scenario can run alongside
other tests without borrowing another run's records or observations.

## Put a breakpoint on the visible Act

```csharp
/// Act: this is the public operation to step into.
OrderPlacementResult actualOrderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);
```

From there, follow the facade
into ManagerOrdering.
Observe validation and canonicalization, then follow the data manager to the
placement procedure. Inspect returned recorded data, fulfillment composition,
publication, email composition, and completion updates.

| Checkpoint | What the teammate learns |
| --- | --- |
| Validation | Which conditions the service accepts and how refusal is expressed |
| Catalog read and transaction | Where prices originate and which writes belong together |
| Returned stored data | Which recorded values feed subsequent work |
| Fulfillment and email | What downstream consumers receive and who builds it |
| Completion handling | What remains owed when an independent action fails |

A debugger crossing into SQL may need separate database tooling. Read the database
procedure alongside the C# call when stepping cannot enter it. The executable
scenario still provides the input and actual readback needed to understand it.

## Return to Assert and follow every actual result

After the operation, watch the test independently query the order and lines,
receive the correlated broker payload, listen for an extra notification, and
snapshot email captures. Step into the
aggregate asserter
and then its field comparisons.

The teammate now sees both the implementation and how the team verifies it.
Ask them to explain why a correct returned total would not establish that each
stored line is correct. Then ask which comparison detects the wrong customer
email, a missing line, or a changed fulfillment timestamp.

## Repeat with a different outcome

Next follow Held for Review. The order is still recorded, but fulfillment is
not required and the confirmation content changes. Then follow unknown-customer
refusal, which must leave no accepted order or outgoing work.

The [failure scenarios](/writing/refusals-failures-and-work-still-owed/) supply another
lesson: a downstream failure after commit preserves acceptance and outstanding
work. Learning only the happy path would leave those requirements undiscovered.

## Maintain the explanation by maintaining the suite

The test depends on public outcomes. A developer using a debugger can study
internal classes without making their identities part of its assertions. After
an internal refactor, the same scenario can teach the new implementation while
continuing to verify the same requirement.

This documentation remains useful because running it checks the behavior it
describes. That depends on correct requirements, accurate scenarios, and deep
assertions. A misleading test name or missing comparison needs correction; an
executable file is not automatically an accurate explanation.

Prose helps readers find the feature and understand its concepts. The maintained
suite supplies the detailed, runnable connection to production behavior. New
teammates and experienced maintainers can use the same starting point.

---

[Previous article](/writing/testing-against-real-infrastructure/) | [Series contents](/acceptance-testing/) | [Next article](/writing/the-regression-suite-the-business-is-paying-for/)
