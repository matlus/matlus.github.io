---
title: "Testing the Service Interface"
description: "Interface tests verify wire conversion and exception translation at their owning boundaries. Controller Hooks, middleware checks, and hosted HTTP scenarios complement domain acceptance."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "service-interface-layer", "boundary-validation", "error-handling", "domain-facade", "architectural-patterns", "csharp"]
hero: testing-the-service-interface
---

The caller sends an HTTP request, but the ordering rules operate on a typed
OrderPlacementRequest. Something must read the body, reject invalid wire shapes,
convert valid input, call the domain, and compose the HTTP response. Exceptions
also need the correct caller-safe translation.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

Those responsibilities belong to the service interface. Meridian verifies them
alongside the maintained domain acceptance suite. Each category has an explicit
boundary and assertions for the behavior it owns.

## Assign each obligation to its owning boundary

<!-- diagram:start interface-boundary-responsibilities -->
<figure class="article-diagram">
<svg id="interface-boundary-responsibilities" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 750" role="img" aria-labelledby="interface-boundary-responsibilities-title interface-boundary-responsibilities-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="interface-boundary-responsibilities-title">Interface testing responsibility map</title>
<desc id="interface-boundary-responsibilities-desc">Controller Hook tests verify parsing and wire composition with an arranged domain response. Translator and middleware class tests verify their failure policies. Hosted HTTP tests verify routing and wiring over the real domain. Facade acceptance scenarios verify business effects.</desc>
<defs><marker id="interface-boundary-responsibilities-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<text x="320" y="35" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Each category owns its comparisons</tspan></text><rect x="25" y="80" width="285" height="125" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="167.5" y="151.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Controller Hook</tspan></text><rect x="330" y="80" width="285" height="125" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="472.5" y="118.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Wire parsing and</tspan><tspan x="472.5" dy="33">conversion</tspan><tspan x="472.5" dy="33">Domain arranged</tspan></text><rect x="25" y="240" width="285" height="125" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="167.5" y="295.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Translator and</tspan><tspan x="167.5" dy="33">middleware</tspan></text><rect x="330" y="240" width="285" height="125" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="472.5" y="295.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Failure mapping</tspan><tspan x="472.5" dy="33">Context; logging</tspan></text><rect x="25" y="400" width="285" height="125" rx="10" style="fill:var(--diagram-requirements-web-fill);stroke:var(--diagram-requirements-web);stroke-width:2"/><text x="167.5" y="455.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Hosted HTTP</tspan><tspan x="167.5" dy="33">pipeline</tspan></text><rect x="330" y="400" width="285" height="125" rx="10" style="fill:var(--diagram-requirements-web-fill);stroke:var(--diagram-requirements-web);stroke-width:2"/><text x="472.5" y="438.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Routes and wiring</tspan><tspan x="472.5" dy="33">Real domain</tspan><tspan x="472.5" dy="33">underneath</tspan></text><rect x="25" y="560" width="285" height="125" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="167.5" y="615.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="167.5" dy="0">Domain facade</tspan><tspan x="167.5" dy="33">acceptance</tspan></text><rect x="330" y="560" width="285" height="125" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="472.5" y="598.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="472.5" dy="0">Business outcomes</tspan><tspan x="472.5" dy="33">Store and outbound</tspan><tspan x="472.5" dy="33">effects</tspan></text>
</svg>
<figcaption>Keep the boundary explicit in each category. Controller conversion, exception translation, hosted wiring, and domain outcomes contribute distinct evidence to the maintained suite.</figcaption>
</figure>
<!-- diagram:end interface-boundary-responsibilities -->

| Category | Starts and ends at | What it verifies |
| --- | --- | --- |
| Facade acceptance | Public domain operation and its effects | Business outcomes, persistence, fulfillment, confirmation, failure state |
| Controller Hook | Action, with the domain Hook arranged | Raw-body conversion, parsing refusal, typed request, composed response, exception transparency |
| Translator class | Exception and HTTP context | Classification, status, headers, reason, content type, safe body |
| Middleware class | Request delegate and middleware output | Handling, contextual enrichment, logging, translation |
| Hosted pipeline | HTTP request and HTTP response | Route, resource shape, and middleware wiring with the real domain beneath |

The categories form one maintained verification discipline with clear ownership.
A controller comparison does not substitute for order-state assertions. A domain
scenario cannot represent a fractional JSON quantity in an integer parameter;
the wire parser owns that refusal.

## Follow the production controller

Here is the complete action:

<!-- Listing source: src/MeridianOrdering.Api/Controllers/OrdersController.cs; method: PlaceOrder -->

```csharp
/// Act implementation: read, parse, invoke the domain Hook, and compose the response.
public async Task<IActionResult> PlaceOrder()
{
    using var requestBodyReader = new StreamReader(Request.Body);
    string requestBodyJson = await requestBodyReader.ReadToEndAsync();
    OrderPlacementRequest orderPlacementRequest = ParserOrderPlacementRequest.Parse(requestBodyJson);
    OrderPlacementResult orderPlacementResult = await PlaceOrderCoreAsync(orderPlacementRequest);
    OrderPlacementResultResource orderPlacementResultResource = ComposerOrderPlacementResponse.ComposeResult(orderPlacementResult);
    return Ok(orderPlacementResultResource);
}
```

The controller's domain call is behind a protected virtual Hook. The production
Hook delegates directly to the facade. A test subclass overrides it to capture
the typed request and return an arranged domain outcome. That lets the controller
test exercise its actual parsing and composition without creating a database
scenario for every wire-shape variation.

The complete Hook subclass
records the request and supports a scripted result or exception. Its parsing-only
constructor fails if the Hook is reached at all, because those scenarios expect
refusal before domain invocation.

## Compare the request and response together

The valid-body scenario supplies raw JSON with mixed-case SKU text. It expects
that text to reach the domain unchanged. Canonicalization belongs to the manager's
front door. It also supplies an arranged domain total and checks the composed
wire representation of that result.

Here is the complete test:

<!-- Listing source: tests/MeridianOrdering.Api.Tests/ControllerTests/TestOrdersControllerPlaceOrder.cs; method: PlaceOrder_WhenBodyCarriesAValidOrder_ThenTheHookReceivesTheTypedRequestAndTheResponseCarriesTheWireShapedResult -->

```csharp
/// Arrange, Act, Assert: verify the controller's forward and backward conversions.
public async Task PlaceOrder_WhenBodyCarriesAValidOrder_ThenTheHookReceivesTheTypedRequestAndTheResponseCarriesTheWireShapedResult()
{
    /// Arrange - the raw wire body with snake_case fields. No catalog participates
    // (the hook is scripted), so the SKU is any well-formed value - carried in
    // MIXED casing, because the controller must hand it to the domain VERBATIM:
    // canonicalization is the Manager's front-door step (TR-10), not the boundary's.
    string wireSku = LetterCasing.SwapCase(DataGenerators.CreateRandomNonexistentSku());
    int orderedQuantity = 7;
    string requestBodyJson = ApiTestHelpers.CreatePlacementRequestBodyJson(
        orderReference: _expectedOrderPlacementIdentifiers.OrderReference,
        customerId: _expectedOrderPlacementIdentifiers.CustomerId,
        sku: wireSku,
        quantity: orderedQuantity);
    // The typed request the controller must hand to the hook, and the scripted
    // domain outcome the controller must compose into the wire response.
    var expectedOrderPlacementRequest = new OrderPlacementRequest(
        orderReference: _expectedOrderPlacementIdentifiers.OrderReference,
        customerId: _expectedOrderPlacementIdentifiers.CustomerId,
        orderPlacementLineItems: [new OrderPlacementLineItem(sku: wireSku, quantity: orderedQuantity)]);
    var scriptedOrderPlacementResult = new OrderPlacementResult(
        OrderReference: _expectedOrderPlacementIdentifiers.OrderReference,
        OrderTotal: 458.97m,
        OrderPlacementStatus: OrderPlacementStatus.Placed);
    var expectedOrderPlacementResultResource = new OrderPlacementResultResource(
        OrderReference: _expectedOrderPlacementIdentifiers.OrderReference,
        OrderTotal: "458.97",
        OrderPlacementStatus: "Placed");
    var ordersController = new OrdersControllerForTest(scriptedOrderPlacementResult);
    ApiTestHelpers.AttachHttpRequestWithBody(ordersController, requestBodyJson);

    // Act
    IActionResult actualActionResult = await ordersController.PlaceOrder();

    /// Assert - request and response discrepancies are reported together.
    OrderPlacementRequest? actualOrderPlacementRequest = ordersController.CapturedOrderPlacementRequest;
    AsserterController.AssertOrderRequestAndResponseAreAsExpected(
        expectedOrderPlacementRequest, expectedOrderPlacementResultResource, actualOrderPlacementRequest, actualActionResult);
}
```

The arranged amount is a composition input; this category does not calculate
catalog prices. The aggregate controller asserter compares the captured request
and returned response together. Its
complete implementation
shows which fields it compares.

Parsing scenarios separately verify malformed JSON, missing fields, wrong root
shape, wrong line-item shape, and non-integer quantities. They compare the required
problem information and verify that the Hook was never reached.

## Preserve an exception until its owning handler processes it

The controller should pass a domain exception through unchanged. Testing only
ReferenceEquals would miss mutation of that same object. The test snapshots its
context before Act and checks both identity and context afterward:

<!-- Listing source: tests/MeridianOrdering.Api.Tests/ControllerTests/TestOrdersControllerPlaceOrder.cs; method: PlaceOrder_WhenTheDomainHookThrows_ThenTheVerySameExceptionInstancePassesThroughUntouched -->

```csharp
/// Arrange, Act, Assert: preserve exception identity and its pre-operation context.
public async Task PlaceOrder_WhenTheDomainHookThrows_ThenTheVerySameExceptionInstancePassesThroughUntouched()
{
    // domain rejection. The controller must not catch, wrap, re-create, or enrich
    // it: translation is the middleware's job. The complete contextual data is
    // snapshotted BEFORE the act, so the assertion can prove the instance came
    // through not just reference-same but unmodified.
    string requestBodyJson = ApiTestHelpers.CreatePlacementRequestBodyJson(
        orderReference: _expectedOrderPlacementIdentifiers.OrderReference,
        customerId: _expectedOrderPlacementIdentifiers.CustomerId,
        sku: DataGenerators.CreateRandomNonexistentSku(),
        quantity: 1);
    var scriptedDomainException = new CustomerNotFoundException(
        $"Order placement request was rejected: customer '{_expectedOrderPlacementIdentifiers.CustomerId}' does not exist");
    Dictionary<string, object> expectedContextualDataSnapshot =
        scriptedDomainException.ContextualDataByName.ToDictionary(
            contextualEntry => contextualEntry.Key, contextualEntry => contextualEntry.Value);
    var ordersController = new OrdersControllerForTest(scriptedDomainException);
    ApiTestHelpers.AttachHttpRequestWithBody(ordersController, requestBodyJson);

    // Act
    var actualCustomerNotFoundException = await Assert.ThrowsAsync<CustomerNotFoundException>(
        async () => await ordersController.PlaceOrder());

    /// Assert - the very same instance, untouched
    AsserterUntouchedExceptionPassThrough.AssertExceptionPassedThroughUntouched(
        expectedSameExceptionInstance: scriptedDomainException,
        expectedContextualDataSnapshot: expectedContextualDataSnapshot,
        actualException: actualCustomerNotFoundException);
}
```

The pass-through asserter
checks removed, added, and changed entries as well as reference identity.
Middleware owns later enrichment and translation. This test ensures the controller
does not silently acquire that responsibility.

## Verify translation and hosted wiring at their own boundaries

Translator tests construct specific exceptions and inspect the exact response
status, headers, content type, and body. Business refusal messages are intended
for callers; infrastructure failures need safe responses that preserve useful
classification without exposing internal diagnostic context.

The complete translator tests
and middleware tests
verify those responsibilities independently. The hosted smoke test then verifies
that the actual HTTP pipeline reaches translation.

Here is the complete host factory:

<!-- Listing source: tests/MeridianOrdering.Api.Tests/HttpPipelineTests/TestPlaceOrderHttpPipeline.cs; method: CreateApiFactory -->

```csharp
/// Arrange: host the pipeline with the real facade built through test composition.
private static WebApplicationFactory<Program> CreateApiFactory()
{
    // The whole production pipeline hosts as-is; only the facade registration is
    // replaced with one built through ServiceLocatorTesting - the same seam every
    // suite uses, moved to the composition root.
    return new WebApplicationFactory<Program>().WithWebHostBuilder(webHostBuilder =>
        webHostBuilder.ConfigureServices(services =>
        {
            services.RemoveAll<DomainFacade>();
            services.AddSingleton(_ => DomainFacadeFactory.CreateDomainFacade().DomainFacade);
        }));
}
```

The complete pipeline scenarios
post genuine HTTP requests, use the real domain beneath, and assert route and
response shape or translation presence. They do not repeat every order-state
comparison. Their facade registration is replaced with test composition, so
the run verifies this hosted graph rather than certifying every production
registration or deployed setting.

## Retain one coherent release argument

The primary behavioral artifact is the assembled domain suite with correct
requirements, scenarios, expectations, and complete outcome comparisons. Interface
obligations still need evidence. Meridian places that evidence in explicit
categories rather than duplicating every business scenario at every layer.

The PWI Service-Boundary Testing chapter
explains these ownership boundaries. Together they let a reviewer say which
evidence verifies the business behavior, wire conversion, translation, and hosted
registration. The purpose remains confidence to go to production with the
required behavior verified before exposure.

---

[Previous article](/writing/idempotency-and-concurrent-requests/) | [Series contents](/acceptance-testing/) | [Next article](/writing/a-suite-the-team-can-keep-trusting/)
