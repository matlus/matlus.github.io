---
title: "Arranging Scenarios That Stay True"
description: "Random data must preserve the named test scenario. Constrained catalog sampling, immutable builders, deliberate threshold guards, and owned identities keep arrangements correct."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "test-isolation", "data-access", "model-design", "delegates", "factory-pattern", "builder-pattern", "design-patterns", "csharp"]
hero: arranging-scenarios-that-stay-true
---

An active customer places a valid order. Before invoking the ordering operation,
we must put that customer in the database, select products, build the request,
calculate the expected outcome, and prepare to observe the messages. Each of
those decisions belongs to the arrangement.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

The [complete order walkthrough](/writing/one-order-every-obligation/) shows them
together. Here we will examine why the arrangement uses random values, how it
keeps those values inside the intended scenario, and how its helpers work.

The purpose remains confidence to go to production. The team first establishes
the business requirements, acceptance criteria, functional requirements, and
non-functional requirements, then verifies that the scenarios and expectations
correctly cover them. The arrangement must create the conditions those scenarios
claim to test.

## Decide what must be deliberate and what may vary

For the successful order, these conditions are deliberate:

- The customer exists and is Active.
- Two different catalog products are ordered at quantities three and two.
- The catalog prices keep the order at or below the review threshold.
- The expected amounts follow the formula: quantity times catalog price.

The customer identifier, order reference, and customer email can vary. Giving
each run its own identities lets it create, observe, and remove its own records.
That matters when developers share infrastructure, tests run in parallel, or
several pull-request jobs overlap. A fixed customer could be made inactive or
removed by another test while this test was using it.

Random generation serves several purposes:

| Use | What varies | What stays deliberate |
| --- | --- | --- |
| Record ownership | Customer identifiers, email identities, order references | This run owns these records and cleanup |
| Valid input variation | Names, addresses, eligible catalog choices | Required shape and the scenario's conditions |
| Invalid-value reporting | An unknown field name or opt-in value | The value violates a specific rule and must appear in the refusal |
| Closed vocabulary | A selected enum member or defined choice | The value belongs to the system's allowed set |

Random values provide sampled variation and practical protection against
collisions. They do not enumerate every input or replace named threshold and
failure scenarios.

## Separate reusable randomness from domain shapes

Meridian uses two layers. RandomDataGenerator produces letters, digits, numbers,
and samples. DataGenerators combines those primitives into this system's values.

Here is the complete string-building primitive:

<!-- Listing source: tests/MeridianOrdering.TestSupport/RandomDataGenerator.cs; method: CreateFromAlphabet -->

```csharp
/// Arrange: generate characters from the chosen alphabet.
private static string CreateFromAlphabet(string alphabet, int length)
{
    var randomCharacters = new StringBuilder(length);
    for (int characterIndex = 0; characterIndex < length; characterIndex++)
    {
        randomCharacters.Append(alphabet[RandomNumberGenerator.GetInt32(alphabet.Length)]);
    }

    return randomCharacters.ToString();
}
```

For every character, it draws an index into the alphabet. The caller chooses the
alphabet and length. The generator supplies methods for lowercase letters,
alphanumeric strings, digit strings, and proper-case words.

The domain layer gives those draws meaning:

<!-- Listing source: tests/MeridianOrdering.TestSupport/DataGenerators.cs; method: CreateExpectedOrderPlacementIdentifiers -->

```csharp
/// Arrange: reserve the customer and order identities.
public static ExpectedOrderPlacementIdentifiers CreateExpectedOrderPlacementIdentifiers()
{
    return new ExpectedOrderPlacementIdentifiers(
        CustomerId: CreateRandomNonexistentCustomerId(),
        OrderReference: CreateRandomOrderReference());
}
```

<!-- Listing source: tests/MeridianOrdering.TestSupport/DataGenerators.cs; method: CreateRandomOrderReference -->

```csharp
/// Arrange: produce an order-reference-shaped value.
public static string CreateRandomOrderReference()
{
    return $"REF-{RandomDataGenerator.GetRandomAlphaNumericString(12).ToUpperInvariant()}";
}
```

<!-- Listing source: tests/MeridianOrdering.TestSupport/DataGenerators.cs; method: CreateRandomEmailAddress -->

```csharp
/// Arrange: create the customer email identity used by capture assertions.
public static string CreateRandomEmailAddress()
{
    return $"{RandomDataGenerator.GetRandomLowercaseAlphaString(8)}" +
        $".{RandomDataGenerator.GetRandomLowercaseAlphaString(10)}" +
        $"@{RandomDataGenerator.GetRandomLowercaseAlphaString(8)}.example";
}
```

This email generation gives the test a fresh address to record on its customer
and compare with the outbound request. Meridian captures that request without
sending it. A real-delivery test needs a routable address or alias in a domain
whose inbox the test environment can read. Keep the controlled delivery address
separate from the customer's original address; the
[email article](/writing/the-test-mediator-and-the-transport-spy/) explains both observations.

The primitive generator
also shows exact-decimal amounts drawn as scaled integers, dates drawn as whole
seconds within a range, booleans, and enum choices. Its scaled amounts and date
offsets must fit the integer ranges used by those implementations.

The domain generator
supplies the system-specific lengths and formats. A length scenario can request
an exact length by passing the same minimum and maximum. Unknown opt-in choices
are eight random lowercase letters, whose length rules out the recognized Yes
and No values. The refusal must name the value supplied. That comparison would
expose a refusal that substitutes a fixed sample value.

## Select catalog data without changing the scenario

<!-- diagram:start arrangement-constraints -->
<figure class="article-diagram">
<svg id="arrangement-constraints" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 615" role="img" aria-labelledby="arrangement-constraints-title arrangement-constraints-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="arrangement-constraints-title">Randomness inside a valid scenario</title>
<desc id="arrangement-constraints-desc">A price cap of threshold divided by five keeps every permitted choice of two distinct products with quantities three and two within the accepted-order threshold. Fresh identities separately prevent interference.</desc>
<defs><marker id="arrangement-constraints-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<text x="320" y="40" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Preserve the accepted-order scenario</tspan></text><rect x="65" y="75" width="510" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="320.0" y="122.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Catalog candidates</tspan><tspan x="320.0" dy="33">price at most threshold / 5</tspan></text><path d="M 320 185 L 320 225" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#arrangement-constraints-arrow)"/><rect x="65" y="230" width="510" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="320.0" y="277.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Choose two distinct products</tspan><tspan x="320.0" dy="33">quantities 3 and 2</tspan></text><path d="M 320 340 L 320 380" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#arrangement-constraints-arrow)"/><rect x="65" y="385" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="432.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Derive totals from live prices</tspan><tspan x="320.0" dy="33">maximum total at most threshold</tspan></text><text x="320" y="550" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Fresh customer and order identities</tspan><tspan x="320" dy="33">provide isolation, not price constraints</tspan></text>
</svg>
<figcaption>Constrain the possible draws before sampling. Derive expected amounts from the chosen catalog rows, and use fresh identities to keep the scenario independent.</figcaption>
</figure>
<!-- diagram:end arrangement-constraints -->

The placement request contains SKU and quantity. It contains no price. Production
reads the product record from the database at placement time and uses that price.
The test reads the catalog during Arrange to establish its expected amounts
independently of the returned result.

Here is the complete constrained selection method:

<!-- Listing source: tests/MeridianOrdering.TestSupport/DataManagerForTest.cs; method: GetRandomCatalogProducts -->

```csharp
/// Arrange: select distinct eligible products from the database.
public static List<CatalogProduct> GetRandomCatalogProducts(
    int productCount,
    decimal? maximumUnitPrice = null,
    string? connectionString = null)
{
    // Sampled WITHOUT replacement, so a multi-line arrangement can never accidentally
    // repeat a product (BR-3). Returned in SKU order because the order store returns
    // recorded lines ORDER BY Sku - SKU-ordered expectations then match positionally.
    //
    // maximumUnitPrice makes a scenario's implicit constraint explicit: a test
    // whose outcome depends on its derived total (e.g. staying at or under the BR-6
    // threshold so the order is Placed) caps the price so ANY draw satisfies it.
    List<CatalogProduct> catalogProducts = GetCatalogProducts(connectionString);
    if (maximumUnitPrice is not null)
    {
        catalogProducts = catalogProducts
            .Where(catalogProduct => catalogProduct.UnitPrice <= maximumUnitPrice.Value)
            .ToList();
    }

    Assert.True(
        catalogProducts.Count >= productCount,
        $"Expected at least {productCount} products in the seeded catalog" +
        $"{(maximumUnitPrice is null ? string.Empty : $" with unit price at most {maximumUnitPrice}")} " +
        $"but found {catalogProducts.Count} - run the setup tool or reseed the catalog");
    return RandomDataGenerator.GetRandomItems(catalogProducts, productCount)
        .OrderBy(catalogProduct => catalogProduct.Sku, StringComparer.Ordinal)
        .ToList();
}
```

Three details matter:

- Filtering happens before sampling. Every eligible product has a price small
  enough for the intended Placed scenario.
- Sampling happens without replacement. The arrangement cannot accidentally
  select one product twice.
- Selected records are returned in SKU order, matching the order used when
  reading stored lines for positional comparison.

For quantities three and two, the maximum eligible unit price is the review
threshold divided by five. Even if both products cost that maximum, their combined
line totals remain at the threshold. Every permitted draw preserves this condition.

Here is the complete sample implementation:

<!-- Listing source: tests/MeridianOrdering.TestSupport/RandomDataGenerator.cs; method: GetRandomItems -->

```csharp
/// Arrange: shuffle a copy and take the requested distinct items.
public static List<T> GetRandomItems<T>(IReadOnlyList<T> items, int count)
{
    var shuffledItems = new List<T>(items);
    for (int itemIndex = shuffledItems.Count - 1; itemIndex > 0; itemIndex--)
    {
        int swapIndex = RandomNumberGenerator.GetInt32(itemIndex + 1);
        (shuffledItems[itemIndex], shuffledItems[swapIndex]) = (shuffledItems[swapIndex], shuffledItems[itemIndex]);
    }

    return shuffledItems.GetRange(0, count);
}
```

It copies the input, shuffles it, and takes the requested number of items. The
caller must request a valid count; the catalog helper checks that enough eligible
products exist. A small eligible set may force the same pair on successive runs.
Random selection does not promise different products every time.

## Guard scenarios that depend on an exact value

The exact-threshold scenario needs a total of $10,000.00. It uses four units of
the Calibration Rig, reads the current price, and checks the arithmetic before Act:

```csharp
/// Arrange: confirm that the catalog supports the named threshold scenario.
var catalogProduct = DataManagerForTest.GetCatalogProduct(DataGenerators.CalibrationRigSku);
int atThresholdQuantity = 4;
decimal expectedOrderTotal = catalogProduct.UnitPrice * atThresholdQuantity;
Assert.True(
    expectedOrderTotal == AcceptanceTestConstants.HeldForReviewThresholdTotal,
    $"AC-09 arrange guard: {atThresholdQuantity} x {catalogProduct.Sku} totals {expectedOrderTotal}, not exactly " +
    $"{AcceptanceTestConstants.HeldForReviewThresholdTotal} - the seeded catalog no longer supports this boundary scenario");
```

These are selected statements from the
complete threshold test.
The guard uses Assert.True during Arrange to check the scenario's premise.
Outcome comparisons belong after Act. If a seed change moves the total away from
the threshold, the guard explains why this run cannot demonstrate the named rule.

## Use factories for small models and builders for wide requests

A customer record needs an identifier, status, and email. A narrow factory
expresses that arrangement directly. A registration request has many fields;
repeating defaults in every test would obscure its distinguishing condition.

Meridian's builders register defaults with For, set scenario values with Set,
and construct requests with Build. Here is the order request builder:

```csharp
/// Arrange: register a default line; owned identifiers remain explicit.
public static ModelBuilder<OrderPlacementRequest> OrderPlacementRequestBuilder { get; } =
    new ModelBuilder<OrderPlacementRequest>()
        .For(request => request.OrderPlacementLineItems, () =>
            [new OrderPlacementLineItem(sku: DataManagerForTest.GetRandomCatalogProducts(1)[0].Sku, quantity: 1)]);
```

OrderReference and CustomerId deliberately have no defaults. Each test reserves
its identifiers before starting and supplies them explicitly. A forgotten
identifier then fails during arrangement before records can be created under an
identity the test has not reserved for cleanup.

The line default helps only when it preserves the intended scenario. An ordinary
accepted-order test explicitly sets price-constrained products. A rollback test
sets a product read from its private database. The scenario owns those conditions.

The request builders
show registration defaults and a derived minimal request. Each default is a
delegate evaluated at Build time, so two builds draw fresh values. The minimal
builder replaces nine optional defaults with null while leaving the full builder
intact. CompanyName remains part of the required registration shape.

Here are the complete Set and value-resolution methods:

<!-- Listing source: tests/MeridianOrdering.TestSupport/ModelBuilders/ModelBuilder.cs; method: Set -->

```csharp
/// Arrange: return a builder with this scenario value.
public ModelBuilder<TModel> Set<TValue>(Expression<Func<TModel, TValue>> propertyExpression, TValue value)
{
    var scenarioValuesBySetProperty =
        new Dictionary<string, object?>(_scenarioValuesBySetProperty, StringComparer.OrdinalIgnoreCase)
        {
            [PropertyNameOf(propertyExpression)] = value,
        };
    return new ModelBuilder<TModel>(scenarioValuesBySetProperty, _defaultDelegatesByForProperty, _constructorParameterInfos);
}
```

<!-- Listing source: tests/MeridianOrdering.TestSupport/ModelBuilders/ModelBuilder.cs; method: ResolveValue -->

```csharp
/// Arrange: resolve explicit values first, then fresh defaults.
private object? ResolveValue(ParameterInfo constructorParameterInfo)
{
    // Constructor parameters are matched to properties by name, case-insensitively
    // (orderReference <-> OrderReference), the same convention the models follow.
    string propertyName = constructorParameterInfo.Name!;
    if (_scenarioValuesBySetProperty.TryGetValue(propertyName, out object? scenarioValue))
    {
        return scenarioValue;
    }

    if (_defaultDelegatesByForProperty.TryGetValue(propertyName, out Func<object?>? defaultValueDelegate))
    {
        return defaultValueDelegate();
    }

    throw new ModelBuilderPropertyNotSetException(
        $"The builder was given no value for {typeof(TModel).Name}.{propertyName} " +
        $"(type {constructorParameterInfo.ParameterType.Name}). " +
        "Set the property in the test's Arrange, or register a For default where the builder is created.");
}
```

Set copies the scenario-value dictionary and returns a new builder. For similarly
copies the default-delegate dictionary. Existing instances are treated as immutable.
Tests can share a registered builder while retaining their own overrides. An
explicit null supplied with Set takes precedence over a default. An unresolved
constructor parameter throws an exception naming the missing property.

The ModelBuilder
includes For, Build, constructor selection, and property-expression handling.
It constructs these models through their public constructors and matches parameter
names to property names without case sensitivity. That convention fits these
models; other constructor designs need their own consideration.

## Reserve cleanup identities before creating records

The containing test class reserves the identifiers in a field. Teardown uses
those identifiers even if arrangement fails or an assertion stops the method:

```csharp
/// Arrange: establish cleanup ownership before creating records.
private readonly ExpectedOrderPlacementIdentifiers _expectedOrderPlacementIdentifiers =
    DataGenerators.CreateExpectedOrderPlacementIdentifiers();
```

The complete test class
shows initialization and teardown. The order reference identifies the broker
message too, but broker consumption also needs isolation. An identifier cannot
recover a message another consumer has already removed from a shared queue.

## Make failures possible to investigate

These generators use cryptographic draws and expose no replay seed. Re-running
a failed test generates new identities and may select new eligible data. For
diagnosis, retain the request, selected catalog values, expectations, and observed
results when they matter to the failure. Meridian's comparison reports include
many expected and actual values; they do not provide a complete replay record for
every failure, particularly one interrupting arrangement or gathering.

A discovered input-sensitive bug needs a maintained scenario or constrained
regression case. Preserve the condition that caused it while continuing to use
per-run identities for ownership of unrelated records.

The PWI Test Structure and Organization chapter
and Test Naming Conventions chapter
provide the surrounding discipline. A reader should be able to find Arrange,
Act, and Assert and understand the condition and outcome from the scenario name.
For resubmission, the deliberate second Act stays visible because the repeated
request is the behavior being verified.

---

[Previous article](/writing/one-order-every-obligation/) | [Series contents](/acceptance-testing/) | [Next article](/writing/assertions-that-verify-the-whole-outcome/)
