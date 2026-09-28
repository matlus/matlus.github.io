---
title: Method Design
description: >-
  C# methods tell callers what they do through explicit visibility, truthful signatures, and returns that express action, query, and cardinality; their bodies orchestrate at one level.
datePublished: 2017-09-20
hero: chapter-method-design-csharp
dateModified: 2026-09-28
tags:
  - method-design
  - levels-of-abstraction
  - error-handling
  - boundary-validation
  - type-casting
  - template-method
  - design-patterns
  - csharp
section: pwi
topic: method-design
language: csharp
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Don't make me think"
- "Don't make me wonder"
- "Orchestrate or implement, never both"
- "Show me the what, not the how"
- "Caveat emptor"
- "Need-to-know basis"
- "Rule of thirds"

---

## Intent

Methods are the foundational unit of work. Good method design leads to good class design, and from there to good system design and good API design - everything in this corpus starts here. A method's job is to tell a story: it should say clearly *what* it does, and delegate *how* to whatever it calls. The reader should never have to stop and think, "wait, what is this doing?"

These guidelines are my current best judgments, open to revision when experience gives me a better one. Each abstraction, check, and branch should earn its place against the complexity it adds. Simplicity matters because a method whose assumptions and steps a reader can follow is easier to reason about and to keep reliable.

Most of the ambiguity that creeps into code comes from one of two places: reuse pursued before it is earned (see Rule of Thirds, below), and analysis skipped because it is easier not to do it. A conditional like `string.IsNullOrEmpty(middleName)` or a cast written as `as` when the type is never actually in doubt are both symptoms of the second kind: they say "I didn't work out whether this can really happen, so I wrote code for both possibilities just in case." Programming with intent means doing that analysis and then writing code that says exactly what you found - not leaving a conditional in "to be safe."

Common practice is not common sense. A great deal of what this chapter asks for runs against habits you have probably practiced for years, and that is by design: common practice became common because people did it a lot, not because someone proved it correct. Ask *why* before following it, distill the guidance down to the problem it actually solves, and judge each rule below on whether it solves that problem here - not on how many other codebases do it differently.

This chapter preserves PWI's Service Locator architecture and its exception philosophy. Nothing here asks an internal method to defensively repeat a domain rule already enforced at the Manager front door. Controller transport mapping is owned by `cs55`, and Manager/domain validation behavior is owned by `cs09`; broader boundary-model doctrine remains non-emitting until a dedicated C# chapter is admitted.

---

## Members Start Explicitly Private

**A member starts its life `private`, stated explicitly - even though `private` is already the C# default.** Programming with intent is about *showing* intent, not relying on a default the reader has to already know. An explicit `private` tells your future self and your team that the member's narrow visibility was a decision, not an accident.

```csharp
// COMPLIANT - the private modifier is stated, not implied
private static bool IsRetryableStatusCode(int httpStatusCode)
{
    return httpStatusCode == HttpStatusTooManyRequests || httpStatusCode >= HttpStatusServerErrorFloor;
}
```

If a member starts private, it can always be widened later - deliberately, when a real caller needs it. It cannot be narrowed again without risking whatever already depends on the wider access. Starting private is the only direction that keeps every future option open.

This is the member-level twin of Class Design's "Internal by Default": that chapter governs whether a *type* is visible outside its own assembly; this one governs whether an individual *member* is visible outside its own type. The reference implementation's own private, autonomous methods are the norm rather than the exception - `GatewayEmailService.IsRetryableStatusCode`, `.ParseRetryAfterSeconds`, `.CalculateRetryDelaySeconds`, and `.BuildFailureContext`; `ManagerOrdering.NormalizeToCanonicalForm`, `.IsIdenticalResubmission`, `.IsFulfillmentNotificationPending`, and `.IsConfirmationEmailPending`; `DataManagerOrdering.MapOrderRow` and `.CreateTranslatedException` - every one of them `private`, and every one `static` besides, because none of them needs anything beyond the values handed to it (see Autonomous Methods, below). Even a data-shaping intermediate can be private: `DataManagerOrdering` declares its own `PlacedOrderHeader` record as a `private` nested type that never leaves the class.

```csharp
// VIOLATION - no stated intent; a reader cannot tell this was a decision
static bool IsRetryableStatusCode(int httpStatusCode) { /* ... */ }
```

Widen a member only when a real caller outside the type proves the need - the same discipline as widening a class past `internal`, applied one level down.

---

## Public and Internal Members Are Never Virtual

**A `public` or `internal` member is never `virtual` or `abstract`.** If a member's behavior genuinely needs to vary by descendant, the public or internal member stays non-virtual and forwards to a `protected virtual` (or `protected abstract`) member carrying a `Core` suffix. Making a public member itself virtual is a real security exposure: it hands every descendant, including ones written well after the original author has moved on, the ability to change behavior a caller thinks is fixed.

```csharp
// COMPLIANT - the public surface is fixed; only the protected seam varies
public class PolicyProcessor
{
    public void Process(Policy policy)
    {
        ProcessCore(policy);
    }

    protected virtual void ProcessCore(Policy policy)
    {
        // default processing
    }
}
```

```csharp
// VIOLATION - callers cannot trust what Process actually does
public class PolicyProcessor
{
    public virtual void Process(Policy policy)
    {
        // ...
    }
}
```

`Core` is the convention for the protected hook's name. It is not an invention of the reference implementation - it is the C# team's own convention, carried into this corpus from the .NET Framework Design Guidelines' own `Dispose`/`Dispose(bool)`-style pattern of a public member forwarding to a protected virtual member named for the public one plus `Core`. It is a technical suffix with no domain meaning of its own; its job is only to mark "this is the seam," the same way `Async` marks "this returns a `Task`." The pattern's shape is what matters: a public or internal member that is never itself `virtual`, forwarding to a `protected virtual` (or `protected abstract`) member named `XxxCore`.

The reference implementation's own controllers show the same forwarding shape with the `Core` name:

```csharp
[Route("customers")]
public class CustomersController : ControllerBase
{
    private readonly DomainFacade _domainFacade;

    [HttpPost]
    public async Task<IActionResult> RegisterCustomer()
    {
        using var requestBodyReader = new StreamReader(Request.Body);
        string requestBodyJson = await requestBodyReader.ReadToEndAsync();
        CustomerRegistrationRequest customerRegistrationRequest = ParserCustomerRegistrationRequest.Parse(requestBodyJson);
        await RegisterCustomerCoreAsync(customerRegistrationRequest);
        return NoContent();
    }

    protected virtual Task RegisterCustomerCoreAsync(CustomerRegistrationRequest customerRegistrationRequest)
    {
        return _domainFacade.RegisterCustomerAsync(customerRegistrationRequest);
    }
}
```

`RegisterCustomer` is the fixed public contract every caller sees. `RegisterCustomerCoreAsync` is the one seam a descendant - here, a controller test subclass that scripts the hook instead of running the real domain - is allowed to change. Use `Core` consistently: a reader who has seen the convention once recognizes the pattern by its name alone, without needing to read the forwarding body to confirm it. The pattern this realizes is the Template Method pattern: the ancestor owns the sequence of steps, and a descendant may change what a named step *does*, never the sequence itself.

---

## Sealing an Override

**An `override` in a class that is not itself `sealed` should be declared `sealed override`, unless that class is intentionally left open for further extension.** Class Design already states the default: classes in this corpus start their lives `internal sealed`. When a class is sealed, every member overridden in it is automatically sealed with it - there is no further descendant to reopen it for, so the keyword would be redundant. The rule only has teeth for the rarer case: a class that is deliberately left unsealed.

`PublisherRabbitMq` and `PublisherServiceBus` are the ordinary case: both are `sealed`, so their `override async ValueTask DisposeAsync()` members need no additional `sealed` keyword - the class declaration already closed the door.

`CustomersController` and `OrdersController` are the exceptional case, and they document why: the class is deliberately left unsealed, and `RegisterCustomerCoreAsync` is deliberately left `virtual`, because that seam exists precisely so a controller test can subclass the controller and script the hook. Sealing either one would defeat the reason the seam was built. This is the shape the exception is supposed to take: a class stays open only when the source establishes, in the class itself, that staying open is the point - never merely because nobody added `sealed` yet.

```csharp
// COMPLIANT - the class is sealed, so the override needs no further keyword
internal sealed class PublisherRabbitMq : PublisherBase
{
    public override async ValueTask DisposeAsync()
    {
        // ...
    }
}
```

```csharp
// COMPLIANT - the class stays open on purpose; the override is sealed until
// someone has an intentional reason to extend it again
internal class CommercialPolicyProcessor : PolicyProcessor
{
    protected sealed override void ProcessCore(Policy policy)
    {
        // ...
    }
}
```

---

## Autonomous Methods

**A method asks for everything it needs through its formal arguments.** It must never depend on a caller having set properties, called another method first, or otherwise mutated instance state before this method can run correctly. Set-properties-then-call is the dominant shape this violation takes in C# - a caller has to know a secret sequence that the method's own signature never reveals.

```csharp
// VIOLATION - the caller has to know a secret protocol
var calculator = new PremiumCalculator();
calculator.PolicyNumber = policyNumber;
calculator.EffectiveDate = effectiveDate;
calculator.Calculate();
var premium = calculator.Premium;
```

```csharp
// COMPLIANT - the signature tells the whole story
var calculator = new PremiumCalculator();
var premium = calculator.Calculate(policyNumber, effectiveDate);
```

Autonomy is not a ban on state. Constants, immutable configuration established at construction, and constructor-injected collaborators whose references are never reassigned are all valid transitive inputs - Class Design's Transitive Statelessness conditions describe exactly which retained references are safe. What autonomy forbids is *hidden mutable operation data*: one method stashing this call's input on the instance for a later method to discover.

`ManagerOrdering`'s private methods are the pattern in practice. Each one receives exactly the values its one job requires and nothing is fetched from instance state that a caller cannot see in the signature:

```csharp
private static bool IsIdenticalResubmission(
    OrderPlacementRequest orderPlacementRequest, string originalCustomerId, IReadOnlyList<PlacedOrderLine> originalPlacedOrderLines)
{
    // ...
}

private static bool IsFulfillmentNotificationPending(OrderMessagingState orderMessagingState)
{
    return orderMessagingState.FulfillmentActionStatus == RequiredActionStatus.Pending;
}
```

Neither of these methods could be wrong about what state it is inspecting - every value it judges arrived as a parameter.

**A guard that only re-exposes a hidden-state precondition is this rule's finding, not a separate defensive-validation finding.** When a consumer method's own `null`/empty check exists only because an earlier call was required to populate the state this method depends on, the root defect is the missing autonomy - review the consumer once, under this rule, rather than raising a second finding under Caveat Emptor (below) for the guard that merely exposes the same precondition.

---

## Method Signatures Tell the Truth

A signature is a promise to its caller. The method name identifies the operation, the parameters state what the caller must supply, and the return type states what the caller receives. A reader should not have to inspect the body to discover a stronger, hidden requirement. [Naming Conventions](/pwi/naming-conventions/csharp/) develops the choice of words in those names.

### Ask for Exactly What the Method Needs

The need-to-know basis applies to the signature itself: **give a method exactly the information it needs, nothing more and nothing less.** A missing input creates a hidden dependency on earlier calls or ambient state. An oversized input gives the method access to data it has no reason to use and makes the caller wonder which parts matter.

Suppose a price calculation uses an order's lines, tax rate, and shipping cost. Passing the whole `Order` also exposes its customer contact, payment details, and delivery address. The call site can select the three required values:

```csharp
decimal total = CalculateTotal(order.Lines, order.TaxRate, order.ShippingCost);

private static decimal CalculateTotal(
    IReadOnlyList<OrderLine> lines, decimal taxRate, decimal shippingCost)
{
    decimal subtotal = lines.Sum(line => line.Price * line.Quantity);
    return subtotal * (1 + taxRate) + shippingCost;
}
```

Now the signature tells the reader what the calculation knows. When a larger set of related values describes one operation, give that set a purpose-specific input type, such as `OrderPriceCalculationData`, and construct it at the call site. Do not pass the broad `Order` and make `CalculateTotal` extract its own smaller input: the excess access is still there. Choose individual parameters when they remain readable; use a focused type when the values form a substantial, cohesive request. A method whose actual job is to map or format the whole order can legitimately receive the whole order.

### Ask for the Capabilities the Method Uses

Accept the least specific type that still provides every operation the method actually needs. A method that only enumerates order lines can accept `IEnumerable<OrderLine>`. A method that needs indexed access can ask for `IReadOnlyList<OrderLine>`. A method that removes items from the caller's collection needs a contract that guarantees mutation. `IList<OrderLine>` exposes `RemoveAt`, but an implementation can still be read-only; `List<OrderLine>` or a domain-specific mutable collection may state the requirement more honestly. The point is the capability promised by the parameter, not a preference for an interface in every signature.

This reduced example illustrates the problem in a method that claims to accept any enumerable:

```csharp
private static IEnumerable<OrderLine> AdjustOrderLines(
    IEnumerable<OrderLine> orderLines, DateTime asOf)
{
    var mutableLines = (IList<OrderLine>)orderLines;
    for (var index = 0; index < mutableLines.Count; index++)
    {
        if (mutableLines[index].ExpirationDate < asOf)
            mutableLines.RemoveAt(index);
    }
    return mutableLines;
}
```

The cast reveals the lie: a caller can validly pass an enumerable that is not a list. The method will fail even though the caller satisfied the declared contract. Removing an element while moving forward can also skip the element that shifts into its place. Another defensive check would not correct either design choice.

If the method is meant to change the caller's collection, say so with a mutable parameter and an action name. If it is meant to produce a filtered result, leave the input alone and return the result. For example:

```csharp
private static List<OrderLine> GetUnexpiredOrderLines(
    IEnumerable<OrderLine> orderLines, DateTime asOf)
{
    return orderLines
        .Where(orderLine => orderLine.ExpirationDate >= asOf)
        .ToList();
}
```

This query only enumerates its input and deliberately returns a materialized `List<OrderLine>`. The caller can see both facts without reading the body. If callers should receive a read-only list contract instead, declare `IReadOnlyList<OrderLine>` and make that promise deliberately. Return the most informative type the contract can honestly guarantee, without exposing a concrete implementation that the public contract does not intend to promise. [LINQ Query Semantics](/pwi/linq-query-semantics/csharp/) explains when materialization itself is appropriate.

### Turn Loose Inputs Into Domain Values at the Boundary

A route may have to receive a genre as a string. The domain operation does not have to keep that loose signature. Parse and validate the route value at the service boundary, then call a method that asks for a `Genre`. In this illustrative call:

```csharp
Genre genre = GenreParser.Parse(genreAsString);
IReadOnlyList<Movie> movies = await _domainFacade.GetMoviesByGenreAsync(genre);
```

Now the domain method has one meaning for its argument. It does not have to guess which strings represent valid genres or repeat the parsing on every call. A value object earns its place when it captures a real domain distinction or invariant, rather than merely wrapping a string to make a signature look typed. [Validation and Exception Handling](/pwi/validation-exception-handling/csharp/) explains who owns the boundary check.

### Put Arguments in an Order the Caller Can Read

The method's name should guide the order of its arguments. `Transfer(sourceAccount, destinationAccount, amount)` reads in the direction of the operation. Related methods should keep shared arguments in the same order when their meaning stays the same:

```csharp
AddVehicle(policyNumber, vehicleUnitNumber);
RemoveVehicle(policyNumber, vehicleUnitNumber);
```

The same consistency makes constructor chaining readable. A shorter constructor adds a default at the end and forwards its shared arguments in the same order as the longer constructor. A caller should not have to remember that one operation puts the policy number first and the next puts it last. Argument order is part of the call site's readability, even when the types happen to make an accidental swap compile.

---

## Pure Methods

Functional programming's notion of purity is stricter than C# can honestly promise, but the underlying discipline still pays off: **confine state changes to the perimeter of the system.** Picture the call graph as a tree. The classes at the leaves - the ones that make the database call, publish the message, send the HTTP request - are autonomous but not pure; they are the ones actually changing state. Every class above them, coordinating that work, can and should be both autonomous and pure: it receives explicit inputs, and it changes nothing itself.

`ManagerOrdering.PlaceOrderAsync` is not pure - it is the coordinator that decides *when* state changes happen - but the classes it ultimately calls through are the leaves that make them: `DataManagerOrdering` writes to the order store, `GatewayEmailService` sends the HTTP request, `PublisherBase` publishes to the broker. Everything in between - `NormalizeToCanonicalForm`, `IsIdenticalResubmission`, `IsFulfillmentNotificationPending` - just computes, judged only on the values it was given.

This is teaching context, not a separately enforced requirement: purity's intent already lives inside three other owners - dependency direction (architecture layers), method autonomy and abstraction levels (this chapter), and state design (Class Design). A method that is autonomous, at a consistent abstraction level, and free of retained mutable state has already satisfied everything purity was asking for.

---

## Orchestration: Describe What, Delegate How

**A public method on a class of any real complexity orchestrates.** It reads as a short sequence of named steps; the implementation detail behind each step lives in whatever it calls. Reading a well-orchestrated public method should never require understanding *how* any one step works - only *that* it happens, in this order.

`ManagerOrdering.PlaceOrderAsync` is the flagship example: every line names a step, and the method reads top to bottom as the story of placing an order.

```csharp
public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest orderPlacementRequest)
{
    var canonicalOrderPlacementRequest = NormalizeToCanonicalForm(orderPlacementRequest);

    ValidatorOrderPlacementRequest.Validate(canonicalOrderPlacementRequest);

    PlacedOrder placedOrder;
    CustomerContact customerContact;
    OrderMessagingState orderMessagingState;
    bool isNewOrder = true;
    try
    {
        (placedOrder, customerContact, orderMessagingState) =
            await _dataManagerOrdering.PlaceOrderAsync(canonicalOrderPlacementRequest);
    }
    catch (OrderReferenceAlreadyExistsException)
    {
        (placedOrder, customerContact, orderMessagingState) = await ResolveResubmissionAsync(canonicalOrderPlacementRequest);
        isNewOrder = false;
    }

    if (isNewOrder)
    {
        await PerformNewOrderActionsAsync(placedOrder, customerContact, orderMessagingState);
    }

    return new OrderPlacementResult(
        OrderReference: placedOrder.OrderReference,
        OrderTotal: placedOrder.OrderTotal,
        OrderPlacementStatus: placedOrder.OrderPlacementStatus);
}
```

Nothing here loops over a collection, builds a string, or reaches into a data reader. The `if (isNewOrder)` conditional is a genuine business branch (BR-7 resubmission policy), not an implementation detail hiding inside an orchestration step - which is exactly the distinction the next two subsections draw out.

### Consistent Abstraction Levels

Every method operates at a single altitude throughout. A method that calls named steps for some of its work and inlines equivalent work for the rest - partial extraction - forces the reader to keep shifting gears mid-method.

```csharp
// VIOLATION - mixed altitude: two named steps, then inline implementation
private static PolicyTermSummary BuildSummaryBad(PolicyTermExpirationInput input)
{
    var normalized = Normalize(input);
    var enriched = Enrich(normalized);

    var activeLines = new List<PolicyLine>();
    foreach (var line in enriched.Lines)
    {
        if (line.Status != "Archived" && line.EffectiveDate >= enriched.CutoffDate)
            activeLines.Add(line);
    }

    return Format(activeLines);
}
```

```csharp
// COMPLIANT - one altitude throughout
private static PolicyTermSummary BuildSummaryGood(PolicyTermExpirationInput input)
{
    var normalized = Normalize(input);
    var enriched = Enrich(normalized);
    var activeLines = FilterActiveLines(enriched);
    return Format(activeLines);
}
```

A readable business-rule conditional - `if (customer.IsEligibleForDiscount())`
- is not a mixed-abstraction violation. It stays at the surrounding altitude because it is a decision, not a delegated step; see Boolean Parameters and Repeated Conditions, below, for the full treatment of encapsulating exactly this kind of conditional.

A short prerequisite branch may remain visible in orchestration: collect a missing-exception discrepancy first, and inspect its cause only when the exception exists. Keep independent comparisons running and report once. A pure reused predicate is supporting calculation, not a substantive delegated workflow stage. Likewise, constructing a named immutable aggregate from already-built components does not require a forwarding-only private wrapper. Extract substantial parsing, iteration, formatting, resource access, or equivalent business work when it obscures the named sequence; neither a conditional nor a constructor call alone proves that problem.

**This applies to complex private methods too.** A private method that delegates one or two steps to other methods but implements an equivalent step inline is exhibiting the same partial-extraction problem one level down. `ManagerOrdering.PerformNewOrderActionsAsync` shows the alternative: it checks two named predicates and delegates the corresponding work to two named `Try...Async` steps, at one consistent altitude.

**Depth of delegation is bounded.** Within a class, count the initiating
orchestrator as level zero, its step as level one, and a subordinate step as
level two: two delegation edges allow three orchestration methods. Across
classes, a call chain rarely goes deeper than three orchestration methods:
Class A calls B, which calls C. `PlaceOrderAsync` calling
`PerformNewOrderActionsAsync` calling `TryPublishFulfillmentNotificationAsync`
sits exactly at the intra-class limit. A further orchestration method exceeds
it after excluding the supporting calls below; flatten that workflow chain.

Supporting calls do not add orchestration levels. A thin wrapper may adapt
arguments and reuse a general operation; a rejected value may be passed to a
terminal exception factory; and an assertion may combine independent leaf
comparisons through a cohesive shared collector before reporting once. Sibling
checks do not accumulate depth. Count the demonstrated responsibility handoffs,
not raw stack frames or constructor entry. Distinct scheduling, operation-specific command/translation, connection/execution, result mapping, typed column reading, and terminal diagnostic construction responsibilities do not become one deeper workflow solely because they appear in the same call stack. Preserve those responsibilities and assess excessive nesting within the same workflow after supporting calls are excluded. Forwarding-only layers that adapt no arguments and establish no useful contract remain suspect. Ordinary multi-stage workflow delegation remains bounded; class names alone do not establish an exclusion.

### Every Class Restarts at Level Zero

Abstraction levels are class-local, not system-local. A data-access class sits far below a domain manager in the system's overall layering, but inside its own class its public method is level zero, and it is held to exactly the same orchestration standard as any domain manager's public method. There is no class low enough in the stack to be excused from this.

`DataManagerOrdering.PlaceOrderAsync` - a data-layer method, about as low-level as this codebase gets - still orchestrates: it builds the command, delegates execution and mapping to `ExecuteOrderReturningProcedureAsync`, and delegates exception translation to `CreateTranslatedException`. Nothing about being "just a data manager" earns it an exemption from stating what it does in named steps.

```csharp
public async Task<(PlacedOrder PlacedOrder, CustomerContact CustomerContact, OrderMessagingState OrderMessagingState)> PlaceOrderAsync(
    OrderPlacementRequest orderPlacementRequest)
{
    using var placeOrderCommand = CommandFactoryOrders.CreatePlaceOrderCommand(orderPlacementRequest);
    try
    {
        return await ExecuteOrderReturningProcedureAsync(placeOrderCommand);
    }
    catch (SqlException sqlException)
    {
        throw CreateTranslatedException(sqlException, orderPlacementRequest.OrderReference, orderPlacementRequest.CustomerId);
    }
}
```

### Refactor to Methods First, Not to Classes

When an altitude cleanup has no independently justified class responsibility,
extract private methods within the same class first. A new class introduced
solely to divide the method adds an unplanned design decision. Apply the Rule
of Thirds when speculative reuse is the reason for promotion; it is not a
minimum-consumer requirement for a real boundary responsibility.

A Data Manager may delegate provider-error interpretation and domain-exception
construction to a dedicated store exception translator. The Data Manager owns
database operations; the translator owns provider-to-domain failure mapping.
That boundary is justified even with one owning Data Manager, and even if the
translation previously lived in private methods. Do not require an independent
second caller or recommend moving the capability back to satisfy methods-first.
Private helpers remain valid where no such responsibility warrants extraction.

Judge the actual responsibility, not the class name: naming a mechanical helper
Translator does not justify it. The collaborator's implementation, dependency
direction, and exception contracts remain separately reviewable. Structural
tests must not force translation to remain private or require extra consumers.

### Let Repetition Reveal the Design

The Rule of Thirds keeps a method or class from becoming a shared abstraction before its variations are known. Write the first use for its actual caller. When the idea appears a second time, copy and adapt it consciously. At the third use, stop and compare the three scenarios: which parts truly stay the same, and which differ? Then extract a common method, use polymorphism, or keep the implementations separate, whichever makes those real cases clearer. The third occurrence is a prompt to reconsider the design, not a requirement to extract.

For example, two notification methods may both assemble an address and a message, yet one may send email and the other may publish to a broker. A shared `SendNotification` method built from the first case could accumulate channel flags and optional parameters as the second arrives. Keeping each method honest until the common responsibility is clear avoids giving either method information or modes it does not need.

This rule addresses speculative reuse. Extract a real responsibility at its boundary when that responsibility exists, even if it has one caller. The store exception translator above has a separate job from the Data Manager; it does not need two more consumers to justify itself.

---

<span id="actions-are-void-returning"></span>

## Action Methods and Query Methods

An **action method** does work. `CancelPolicy` changes a policy; `SendConfirmationEmailAsync` sends a message. A **query method** answers a question. `GetCustomer` asks for a customer and promises to return one. These names describe what the caller is asking the method to do. The return contract tells the caller what, if anything, comes back.

The two contracts share a useful guarantee. An action method completes its work or throws an exception. A query method returns the information it promises or throws when it cannot provide that information. An exception interrupts the call, so reaching the next line means the previous method fulfilled its contract. The caller can continue without checking a success flag after every operation.

### Action Methods: Do the Work

An action method ordinarily returns `void`, or `Task`/`ValueTask` when asynchronous. Its purpose is to perform an operation, such as cancelling a policy. A return value that only reports success or failure makes every caller inspect it before continuing. If the action cannot complete, it throws instead. The return type does not carry that report as a `bool`, status code, `Result`/`Try` wrapper, or `null` meaning "it did not work."

```csharp
// COMPLIANT - an action; it does something, and has nothing to tell you
public void CancelPolicy(string policyNumber, DateTime cancellationDate)
{
    // ...
}
```

```csharp
// VIOLATION - forces the caller into a defensive check after every call
public bool CancelPolicy(string policyNumber, DateTime cancellationDate)
{
    // ...
}
```

`GatewayEmailService.SendConfirmationEmailAsync` is the realistic version of this: it retries internally, and it either returns having sent the email or throws a specific exception explaining why it could not. There is no in-between return value for the caller to inspect.

### Creation Action Methods May Return Created Data

An action method that creates a resource may return data about that resource. `InsertCustomer`, for example, can return the new customer's ID. The ID identifies the customer that now exists; it does not report whether insertion succeeded. A failed insertion throws rather than returning `-1`.

```csharp
// COMPLIANT - the sanctioned anomaly: identity of a newly created resource
public int InsertCustomer(string firstName, string lastName, DateTime dateOfBirth)
{
    // returns the new customer's ID on success, raises on failure
}
```

A creation action method may also return a small result with facts about the resource it created. `ManagerOrdering.PlaceOrderAsync` returns an `OrderPlacementResult` with `OrderReference`, `OrderTotal`, and `OrderPlacementStatus`. The status describes the order's domain state; it is not a success flag. The method returns data about an order that exists, or it throws.

For every value returned by a creation action method, ask what that value describes. A customer ID or an order total describes the created resource. A `bool`, error code, `Result<T, TError>` wrapper, or `null` used to mean "failed" describes the outcome of the operation and makes the caller inspect it before continuing. A creation result is appropriate when every field describes the resource.

```csharp
// VIOLATION - a creation "result" that is really an outcome report
public sealed class InsertCustomerResult
{
    public int? CustomerId { get; init; }
    public bool Succeeded { get; init; }
    public string? ErrorMessage { get; init; }
}
```

`InsertCustomerResult` above fails the test even though it names itself a creation result: `Succeeded` and `ErrorMessage` exist purely to report how the operation went, which is exactly what throwing on failure already covers. `OrderPlacementResult` passes the same test because none of its three fields could be replaced with "true" or "false" without losing information about the order itself.

An outcome wrapper does not change the rule. An action might return a `Result<T>`, an `Either`-style type, or a custom object with a success flag and a data property that is `null` on failure. That object still asks the caller to inspect whether the operation worked. Putting the flag inside an object does not turn it into data about a created resource; failure belongs in the exception path.

```csharp
// VIOLATION - a functional-style envelope; still a signal wearing a costume
public sealed class PlaceOrderEffect<T>
{
    public bool IsSuccess { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
}

public PlaceOrderEffect<OrderPlacementResult> PlaceOrder(OrderPlacementRequest request)
{
    // ...
}
```

`PlaceOrderEffect<T>` fails the same test as `InsertCustomerResult`: `IsSuccess` and `Error` report how the operation went, while `Data` becomes `null` to signal failure. The wrapper makes the caller check for success before using the order data. A creation action method may return facts about the resource it created; failure takes the exception path.

A command-line adapter has a different contract with the process entry point: it may return an `int` or `Task<int>` exit status, including the exact child `Process.ExitCode` after completion. That is a process protocol, not a success flag for ordinary application callers. The adapter must still clean up on every path and report the child status accurately.

<span id="queries-return-what-they-claim-or-they-dont-return-at-all"></span>

### Query Methods: Return the Information They Promise

A query method supplies an answer. `GetCustomer(42)` promises a `Customer` for that ID. If the customer exists, it returns that customer. If the customer does not exist, it throws `CustomerNotFoundException`. It does not return `null` and leave every caller to discover what that means. A `Find` or `Search` query makes a different request: the caller is looking for a possible match, as explained below.

```csharp
private Customer GetCustomer(int customerId)
{
    var customer = _customers.SingleOrDefault(c => c.CustomerId == customerId);

    if (customer == null)
        throw new CustomerNotFoundException(customerId);

    return customer;
}
```

```csharp
// Fearless calling code - no defensive check needed
var customer = GetCustomer(42);
SendWelcomeLetter(customer);
```

If `GetCustomer(42)` returns, `customer` is available and the next line can send the letter. If it throws, execution never reaches `SendWelcomeLetter`. The caller needs no "did we get a customer?" branch between these lines. The same rule applies to the action method: if `SendWelcomeLetter` returns, it completed; if it cannot send, it throws.

A query method that promises a `Customer` should not return a `Result<Customer, Error>`, an `Option<T>`, or an object containing both `Customer` and `ErrorMessage` instead. Each wrapper changes what the caller receives: it must inspect and unwrap the result before it can use the customer. A caller looking for a possible match should call a `Find` or `Search` method whose name and return type express that intent.

```csharp
// VIOLATION - a wrapper is still a "maybe" in disguise
public sealed class GetCustomerResult
{
    public Customer? Customer { get; init; }
    public string? ErrorMessage { get; init; }
}
```

The ordering implementation shows the shared guarantee in both method types. `DataManagerOrdering.PlaceOrderAsync` is a creation action; `.GetOriginalOrderForResubmissionAsync` is a query. Each returns the data its contract promises or throws a relevant exception, such as `CustomerNotFoundException`, `OrderReferenceAlreadyExistsException`, `OrderStoreContractViolationException`, or `OrderStoreUnavailableException`. Neither returns a success flag or a failure wrapper. Chapter 9 explains the `OrderingBusinessException` and `OrderingTechnicalException` branches of that exception taxonomy.

### When a Find or Search Has No Match

`GetCustomer(42)` asks for a specific customer that should exist. `FindCustomer(42)` asks whether that customer exists. A single-result `Find` query may return `Customer?`, with `null` meaning there was no match. A `SearchCustomers` query that can find several customers returns an empty collection when there are none. The caller chose an operation whose name makes a missing match ordinary, and the return type states what it must handle.

```csharp
Customer? customer = FindCustomer(42); // null means no matching customer
IReadOnlyList<Customer> customers = SearchCustomers(criteria); // empty means no matches
```

These are query results. A database outage or a failure to run the search is still an exception, not a missing match. An action such as sending an email or publishing a notification does not become a query by returning `null` to mean that the work did or did not happen. It completes according to its action contract or follows the designed failure path.

---

## Cardinality Is Intent

**When a query applies criteria, how many results are expected is part of its contract - state it, and enforce it.** For an exactly-one query, diagnose a missing result and establish at-most-one through explicit duplicate detection or supplied query/schema evidence. Equality predicates on a unique key can prove at-most-one when every join preserves that bound. Do not require a redundant second read solely because a reader API returns one row; inspect the predicates, constraints, and join multiplicity. If that bound is unavailable or a join can multiply rows, explicit duplicate detection remains required. Checked-in constraints establish the supplied contract, not every deployed database. Reach for "first match" only when the requirement genuinely is "any one of possibly several will do," and let the name say so.

This chapter owns the *contract*: a method's declared cardinality, and every non-LINQ way of enforcing it. `DataManagerOrdering.ExecuteOrderReturningProcedureAsync` is a clean, non-LINQ realization of exactly this discipline, reading a `SqlDataReader` instead of a sequence:

```csharp
if (!await orderReader.ReadAsync())
{
    throw new OrderStoreContractViolationException(
        OrderStoreContractViolationMessage,
        OrderPlacementLogEvent.PlaceOrderDataOperation,
        contextualDataByName: new ContextualData
        {
            { "OrderStore.Command", orderReturningCommand.CommandText },
            { "OrderStore.OrderRowCount", 0 },
        });
}
(PlacedOrderHeader placedOrderHeader, CustomerContact customerContact, OrderMessagingState orderMessagingState) = MapOrderRow(orderReader);
if (await orderReader.ReadAsync())
{
    throw new OrderStoreContractViolationException(
        OrderStoreContractViolationMessage,
        OrderPlacementLogEvent.PlaceOrderDataOperation,
        contextualDataByName: new ContextualData
        {
            { "OrderStore.Command", orderReturningCommand.CommandText },
            { "OrderStore.OrderRowCount", 2 },
        });
}
```

Zero rows and a second row are both checked explicitly, and both raise the same exception type carrying exactly what a diagnostician needs: the command that ran, and how many rows actually came back. A bare "sequence contains more than one element" would have told nobody anything.

**Do not fabricate an existence check from a query that throws.** Catching `CustomerNotFoundException` inside a `CustomerExists` method just to return a boolean is exceptions used as control flow - the one genuine misuse this corpus rejects. Write a real existence query instead, one that answers the yes/no question directly rather than provoking and swallowing a failure.

Concrete LINQ operator selection - `Single` versus `First`, preferring `Single`/`First` over their `OrDefault` cousins, and a `SingleElseException`-style extension method that adds criteria context to a LINQ cardinality failure - is LINQ Query Semantics' (`cs08`) territory, not this chapter's: when one LINQ call could be described by both a method-design finding and a LINQ finding, `cs08` is the sole owner of that occurrence. This chapter teaches the contract; `cs08` teaches the LINQ mechanics that enforce it.

---

## Catch-and-Log Without Handling

**Catching an exception only to log it and re-raise, or to swallow it silently with no recovery logic, adds noise and destroys information - never do it.** An `except`/`catch` block earns its place only when it does genuine work: retrying, or translating a lower-level failure into a domain-specific exception carrying more context than the one it caught.

```csharp
// VIOLATION - adds nothing; origin is now harder to trace, not easier
try
{
    return await _gateway.CallAsync(data);
}
catch (ServiceException serviceException)
{
    _logger.LogException(serviceException);
    throw;
}
```

`DataManagerCustomers.RegisterCustomerAsync` shows genuine handling - translation, not logging:

```csharp
try
{
    // ...
    await registerCustomerCommand.ExecuteNonQueryAsync();
}
catch (SqlException sqlException)
{
    throw CreateTranslatedException(sqlException, customerRegistrationRequest.EmailAddress!);
}
```

The `catch` block does not log-and-rethrow the `SqlException` unchanged; it converts a store-specific error code into one of several precise domain exceptions, each carrying the context a diagnostician actually needs (`CustomerAlreadyRegisteredException`, `EmailRegisteredToDifferentNameException`, `CustomerStoreUnavailableException`). `ManagerOrdering.TryRecordFulfillmentNotificationCompletionAsync` shows the other genuine case - a caught exception that is deliberately absorbed because the design says so, and says so out loud:

```csharp
catch (OrderStoreUnavailableException orderStoreUnavailableException)
{
    // BR-10: the order was already accepted and fulfillment already accepted
    // its notification. A failed evidence update cannot reverse either fact or
    // prevent the independent email action. Pending carries the ambiguity into
    // recovery, and the warning is the only immediate diagnostic evidence.
    _logger.LogException(orderStoreUnavailableException, severity: Severity.Warning);
}
```

The difference between this and the violation above is not the presence of a log call - it is that this `catch` block is the one place a considered design decision (BR-10) chose to absorb the failure, and the comment states that decision rather than leaving a bare log-and-swallow for a future reader to puzzle over.

---

## Caveat Emptor: No Defensive Validation Inside Internal Methods

**Buyer beware.** If a method's signature clearly states what it needs, and a caller inside the system sends the wrong thing, that is the caller's defect, not this method's problem to guard against. No guard clauses, no `ArgumentNullException` thrown defensively at the top of an internal method, no `if (value is null) return;` safety net catching a state that an internal contract already rules out.

```csharp
// COMPLIANT - no guard clauses; the caller's data is trusted
private static string BuildMailingLabel(string firstName, string lastName, string city)
{
    return $"{firstName} {lastName}{Environment.NewLine}{city.ToUpperInvariant()}";
}
```

Extrapolate this through the whole system and nobody inside it validates anything defensively, because every domain rule was enforced at the Manager front door and every external representation was translated at its owning boundary. This chapter owns only the method-design consequence: once those doors are locked, an interior method does not repeat the same defensive checks. The broader boundary-model and null-or-valid-string doctrines remain non-emitting until their dedicated C# owner is admitted.

The reference implementation's own internal methods carry no defensive checks. `NormalizeToCanonicalForm` and `IsIdenticalResubmission` take exactly the values they need and act on them; the one validation call in `PlaceOrderAsync`, `ValidatorOrderPlacementRequest.Validate(canonicalOrderPlacementRequest)`, runs once, right after canonicalization, at the manager's own front door - nothing downstream of it re-checks what it already confirmed.

A `public` argument-validation analyzer recommending `ArgumentNullException.ThrowIfNull` on every public parameter is not wrong on its own ground - it is answering a different question. That guidance governs a *public* API's outermost surface; this rule governs *internal and private* mechanics between code that already trusts itself. The two are a scope split, not a contradiction, and a reviewer should say so rather than reading them as conflicting advice.

---

## Make String and Type Assumptions Explicit

### String and Configuration Contracts

Whether to represent a value with `string.Empty`, test it with `IsNullOrEmpty` or `IsNullOrWhiteSpace`, or trim it starts with the contract for that value. If a boundary has already established that a string is non-null and trimmed, an internal method should not call `IsNullOrWhiteSpace` to defend against states that contract excludes. If an empty string remains a valid, distinct state, `value.Length == 0` states the narrow check. If the incoming value can genuinely be null or whitespace, check that at the boundary and decide whether to reject or normalize it there. `Trim`, `TrimStart`, and `TrimEnd` change data; use the one that matches the input rule rather than applying trimming everywhere as a precaution.

The routing-configuration example makes these decisions concrete. Its `GetRoutingActiveStatus` query returns `false` when the cloud role environment is unavailable because that behavior is a stated requirement. When the environment is available, it reads the `RoutingActive` setting: an empty value means `false`, a valid Boolean string is parsed, and an absent or invalid setting raises a `ConfigurationProviderException`. The caller can then translate that exception into an HTTP error response. The example's rule for an empty value is specific to that configuration contract; another setting might require an exception instead. The query returns a Boolean because it answers a Boolean question, while the boundary owns parsing and failure translation.

### Cast Versus `as`: State Whether a Mismatch Is Expected

Some teams advise using `as` for every reference-type conversion because it does not throw when the type is wrong. That only moves the decision. The method still has to know what to do with the resulting `null`. If it cannot do its work with any other type, give it a parameter of that type where possible. If a broader signature is required, a direct cast states the expectation and lets a mismatch fail where it occurs. The caller or the boundary that supplied the value must correct the wrong type.

Consider this illustrative action method. Its name promises to publish an approved invoice, but a wrong type makes it return normally without publishing anything:

```csharp
private void PublishApprovedInvoice(object message)
{
    var invoice = message as ApprovedInvoice;
    if (invoice != null)
        _publisher.Publish(invoice);
}
```

The method has no useful action for another type. If callers already know the type, its signature should say so:

```csharp
private void PublishApprovedInvoice(ApprovedInvoice approvedInvoice)
{
    _publisher.Publish(approvedInvoice);
}
```

If an external contract requires `object`, cast to `ApprovedInvoice` before publishing so a wrong type fails at the assumption. With `as`, a missing null check would defer the failure until code tries to use the value; the check in the first version hides the failure entirely. Neither path gives this method a useful response to the wrong type.

Consider this attribute-mapping code. It asks reflection for one attribute type, uses `as`, then checks for both a null array and an empty one:

```csharp
var attrs = fieldInfo.GetCustomAttributes(typeof(CodeMappingAttribute), false)
    as CodeMappingAttribute[];

if (attrs == null || attrs.Length == 0)
    continue;

foreach (var attr in attrs)
{
    this.enumToCodeMapping[enumVal] = attr.Code;
    this.codeToEnumMapping[attr.Code.ToUpperInvariant()] = enumVal;
}
```

`GetCustomAttributes` returns an array, including an empty array when it finds no matching attributes. Its no-match result is never `null`. The `as` conversion is the only operation here that could turn a non-null array into `null`, and that would mean the array was not a `CodeMappingAttribute[]`. The null check cannot detect the no-attributes case. If the only intention is to do nothing when there are no attributes, the length check adds nothing either: `foreach` already runs zero times for an empty array. The combined check obscures which condition the author actually expects and what the method should do about a type mismatch.

A direct cast states the expectation that the returned array itself has the requested attribute type. It raises an `InvalidCastException` at the conversion if that assumption is false. The loop needs no preliminary check:

```csharp
var attrs = (CodeMappingAttribute[])fieldInfo
    .GetCustomAttributes(typeof(CodeMappingAttribute), false);

foreach (var attr in attrs)
{
    this.enumToCodeMapping[enumVal] = attr.Code;
    this.codeToEnumMapping[attr.Code.ToUpperInvariant()] = enumVal;
}
```

That direct cast depends on the concrete array type. The [documented signature of `MemberInfo.GetCustomAttributes(Type, bool)`](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.memberinfo.getcustomattributes) promises `object[]` or an empty array, but does not promise that the array object is a `CodeMappingAttribute[]`. For code that must rely on the documented API contract, [the generic overload](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.customattributeextensions.getcustomattributes) requests typed attributes directly and also lets an empty result pass through the loop:

```csharp
foreach (CodeMappingAttribute attr in
    fieldInfo.GetCustomAttributes<CodeMappingAttribute>(false))
{
    this.enumToCodeMapping[enumVal] = attr.Code;
    this.codeToEnumMapping[attr.Code.ToUpperInvariant()] = enumVal;
}
```

There are cases where `as` has a job. `DeterminePolicyConversionMessageStatus` accepts the .NET `Exception` base type because it must classify both application business exceptions and other exceptions. The method cannot assume which kind arrived, and it has a result for either one:

```csharp
private static PolicyConversionStatusCode DeterminePolicyConversionMessageStatus(
    Exception exception)
{
    var businessException = exception as AutoConversionBusinessException;
    if (businessException != null)
        return PolicyConversionStatusCode.BusinessError;

    return PolicyConversionStatusCode.TechnicalError;
}
```

Here `null` means the exception is not an `AutoConversionBusinessException`. The method then returns `TechnicalError`; it handles both possible types. Use a cast when this value **must** have the expected type and the method has no valid response to a mismatch; use `as` when a different type is genuinely possible and the method handles that outcome. [Always Use `as` Operator? No Thank You](/writing/always-use-as-operator-no-thank-you/) develops the same argument with another example.

---

## Boolean Parameters and Repeated Conditions

Trace what a Boolean actually controls. A private diagnostic qualifier may select wording while the same native-type acceptance check runs on every path and separately named nullable/non-nullable APIs already expose the contract. That flag does not create two hidden validation modes. A public flag selecting strict validation versus lossy coercion, or otherwise selecting separately meaningful operations, remains a mode-switch concern.


**Treat any `bool` in a method signature with suspicion, but not with alarm.** The suspect case is not "a boolean exists" - it is faux-generality: a `bool` added to make one method play more than one role, on the speculative promise that "tomorrow, if I want to do this other thing, the flag will already be there." That promise is rarely kept. What it produces instead is a method whose implementation grows a conditional for every flag combination anyone has ever added, when two plainly named methods would have kept each intention in its own place, or a meaningfully named enum would have made one operation's closed set of modes explicit.

```csharp
// VIOLATION - the caller has to remember what the flag means
public void SendStatement(Customer customer, bool isDuplicate)
{
    if (isDuplicate) { /* ... */ } else { /* ... */ }
}
```

```csharp
// COMPLIANT - two intentions, two names
public void SendStatement(Customer customer) { /* ... */ }
public void SendDuplicateStatement(Customer customer) { /* ... */ }
```

```csharp
// ALSO COMPLIANT - one operation, explicit closed vocabulary
public enum StatementKind { Original, Duplicate }
public void SendStatement(Customer customer, StatementKind statementKind) { /* ... */ }
```

Writing `SendStatement(customer, isDuplicate: true)` can make that one call
site easier to read, but the named argument is controlled by the caller and
does not repair the Boolean mode-switch contract itself.

Not every boolean parameter is a mode switch in disguise, though. A boolean that carries a genuine piece of domain data - a fact about the thing being acted on, rather than an instruction about how to act on it - is not suspect merely for being a `bool`. `DataManagerCustomers.RegisterCustomerAsync(customerRegistrationRequest, marketingOptIn)` passes `marketingOptIn` straight through to a stored-procedure parameter; it branches no code path inside the method at all. The test is not "is there a `bool` in the signature" - it is "does this method do one of two different things depending on the value." `SendStatement` fails that test; `RegisterCustomerAsync` does not.

**This is a warning, and only when the bool is not a business datum.** The warning still applies when the method is small and pure: `true` or `false` does not communicate which meaningful behavior was requested without consulting the method's contract. Flagging a boolean parameter is never a mechanical "a `bool` was found" finding: it is raised only after confirming the flag is not domain data like `marketingOptIn`, and it is raised together with an explanation of why the mode-switch shape is a problem in that specific case - which conditional it will grow, or which two intentions it is quietly merging - not a bare citation of the pattern's name. The correction is either separate intention-revealing methods or, when one operation genuinely has modes, a meaningfully named enum.

**A boolean *return* is a different question, governed separately.** An action method never returns a boolean to indicate success or failure; see Action Methods and Query Methods above. A predicate query method may legitimately return `bool` when its name asks a real business question, its inputs are explicit, and it performs no side effects.

```csharp
// COMPLIANT - a business question, encapsulated
private static bool IsGoodStudentDriver(int age, decimal gradePointAverage, bool isFullTimeStudent)
{
    return age < 25 && gradePointAverage >= 3.0m && isFullTimeStudent;
}
```

### Encapsulating Conditionals

A raw conditional built from field comparisons tells the reader *how* a decision is made without saying *what* the decision is:

```csharp
if (policyTermRecord.ExpirationActivityTimestamp == DateTime.MaxValue ||
    policyTermRecord.ExpirationActivityTimestamp == DateTime.MinValue)
{
    expirationDate = policyTermRecord.TermExpirationDate;
}
```

Ask the analyst what this condition means to the business, and extract it to a method whose name states the answer:

```csharp
if (PolicyTermRecordHasNoExpirationActivityTimestamp(policyTermRecord.ExpirationActivityTimestamp))
{
    expirationDate = policyTermRecord.TermExpirationDate;
}

private static bool PolicyTermRecordHasNoExpirationActivityTimestamp(DateTime expirationActivityTimestamp)
{
    return expirationActivityTimestamp == DateTime.MaxValue || expirationActivityTimestamp == DateTime.MinValue;
}
```

Now the caller reads a business statement, not an implementation detail, and this is the same predicate shape as `IsGoodStudentDriver`, above: an explicit-input, side-effect-free method whose name is the answer to a domain question. An encapsulated conditional stays a pure predicate query: it does not reach into an injected collaborator, a gateway, or any external system to get its answer, and pure calculation methods it calls internally remain fine. A boolean returned by an action to announce success or failure is never an encapsulated conditional, no matter how it is named.

`ManagerOrdering` applies exactly this discipline in production: `IsIdenticalResubmission`, `IsFulfillmentNotificationPending`, and `IsConfirmationEmailPending` are each a raw condition given a business name, called from `PlaceOrderAsync` and `PerformNewOrderActionsAsync` as a single readable line rather than an inline comparison.

**The same condition tested more than once is a design defect, not a style preference.** If the same business rule appears in several methods, it has drifted out of its one home; extract it to a single named predicate (as above), a policy object, or a polymorphic design, and call that one thing everywhere the rule applies. Two copies of "is this a good student driver" are two chances for the rule to quietly diverge.

When a conditional chooses among interchangeable behaviors, consider whether the behavior belongs in polymorphic implementations. That removes repeated type or mode selection from the methods that use the behavior. A `switch` can still be the clearest choice for a small, finite set of cases known at that point in the design. The choice depends on the variations the system must support, not on a ban on `switch`. [Design Nugget: Evolution to Strategy](/writing/design-nugget-evolution-to-strategy/) works through a switch and a strategy design rather than assuming one always wins.

A worked example combining an encapsulated conditional with other cleanup (removing a useless initialization, closing off an empty-string possibility) appears in the source material as a single before/after pair. The condition is the method-design lesson. The string-contract reasoning above explains why an empty check may be unnecessary, while native C# review owns mechanically provable initialization and allocation issues. Neither point makes every string or style preference into a blanket method rule.

---

## Boundaries With Other Chapters

The method-design decisions above stand on their own. These articles develop adjacent topics in more detail:

- [Naming Conventions](/pwi/naming-conventions/csharp/) covers the words used for methods, parameters, and locals, including domain vocabulary and the `Async` suffix. This chapter explains what an action or query name promises its caller.
- [Validation and Exception Handling](/pwi/validation-exception-handling/csharp/) covers validation at the boundary where data enters the domain. This chapter explains why an internal method can trust inputs that boundary has already checked.
- [LINQ Query Semantics](/pwi/linq-query-semantics/csharp/) covers operator choices such as `Single` versus `First` and when to materialize a sequence. This chapter explains what result cardinality and collection type the method promises.

These Method Design rules apply to production methods and reusable test-support
methods. Actual test-method structure belongs to the testing chapters. An
Asserter is a specialized reusable test-support method: when an Asserter rule
owns the exact occurrence, that specialized rule takes precedence; Method
Design remains the fallback for aspects the Asserter rules do not address.

---

## Review Questions

- Does every member state its own visibility explicitly, starting from `private`?
- Is any `public` or `internal` member also `virtual` or `abstract`? Should it forward to a `protected virtual`/`abstract` member instead?
- Is an `override` in a non-sealed class left unsealed without the source establishing that the class is an intentional extension point?
- Does every method receive everything it needs through its parameters, with nothing depended on from a prior call?
- Does a parameter promise every capability the body requires, without a cast to a more capable collection type?
- Does each method receive exactly the data it uses, with a purpose-specific input when a broad object would expose unrelated data?
- When `as` returns `null`, does this method have a defined response, or does it dereference the value or silently skip the work?
- Does the return type state the useful result honestly, and does argument order make related calls readable?
- Does a public method read as a short sequence of named steps, at one consistent altitude, with no inline implementation detail?
- Is a "low-level" class's public method held to the same orchestration standard as a domain class's?
- Does an action method's return value, if it has one, exist only to carry data of a resource it created - never to report how the operation went, whether as a bare flag or wrapped inside a `Result`/`Either`-style envelope?
- Does a query method with a non-nullable return type provide the value it promises or throw, without returning `null` or a failure wrapper?
- Does a single-result `Find` query use `null` only for no match, while a multi-result `Search` query returns an empty collection?
- Does any action use a nullable result to report whether the work happened, contrary to the action contract?
- Does a criteria query encode its expected cardinality, and does a cardinality failure carry the criteria that produced it?
- Does a `catch` block do genuine work - retry or translation - or does it only log and re-raise (or silently swallow)?
- Does an internal method validate its own trusted inputs defensively, when Caveat Emptor says it should not?
- Is a boolean parameter a genuine piece of domain data, or is it faux generality - a flag added so one method can play more than one role? If it is the latter, has it been raised as a warning with the specific obscured intentions and the appropriate separate-method or meaningful-enum correction?
- Does the same business condition appear in more than one place instead of behind one named predicate?

---

## Code Review Checklist

When reviewing method design, verify:

### Visibility and Virtuality
- [ ] Every member states `private` (or its intended wider access) explicitly rather than relying on the default
- [ ] No `public` or `internal` member is `virtual` or `abstract`; behavior variation is forwarded to a `protected virtual`/`abstract` member
- [ ] An `override` in a non-sealed class is itself `sealed`, unless the class documents an intentional reason to stay open

### Autonomy and Purity
- [ ] No method depends on a caller having set properties or called another method first to populate hidden instance state
- [ ] Immutable constructor state, constants, and constructor-injected stateless collaborators remain valid transitive inputs
- [ ] State changes are confined to the classes actually performing them; coordinating classes above them stay pure

### Method Signatures
- [ ] A parameter provides every capability the method uses without a hidden cast to a narrower collection type
- [ ] Each method receives exactly the data it needs; a broad model is narrowed at the call site when the method uses only a subset
- [ ] A result type honestly states whether a collection is materialized and which capabilities callers may rely on
- [ ] Related methods and chained constructors keep shared arguments in a readable, consistent order
- [ ] Loose transport values are parsed into domain values before the domain operation receives them
- [ ] A direct cast states an expected type that should fail visibly on mismatch; `as` has a meaningful response when it returns `null`

### Orchestration
- [ ] Public methods on non-trivial classes orchestrate - they describe WHAT happens, not HOW
- [ ] No partial extraction: if some steps are delegated, all equivalent steps are delegated
- [ ] Business decisions, short prerequisite guards, pure predicates, and simple named aggregate construction are distinguished from substantive implementation steps
- [ ] Bound orchestration depth after excluding supporting calls and distinct scheduling/resource/mapping responsibilities; do not count total stack frames
- [ ] Low-level classes (data managers, adapters) hold their public methods to the same level-zero orchestration standard as domain classes
- [ ] An altitude cleanup extracts private methods before introducing a new class
- [ ] Shared methods or components follow demonstrated repetition unless a distinct responsibility already justifies extraction

<span id="actions-and-queries"></span>

### Action Methods and Query Methods
- [ ] Ordinary application actions return `void`/`Task`, never a success/failure indicator; a CLI adapter may propagate an explicit process exit status
- [ ] A resource-creation action's return value - whether a bare identifier or a small result record - carries only data of the created resource; no field of it encodes success or failure
- [ ] No functional-style outcome envelope (`Result<T>`, `Either`, or a hand-rolled success-flag-plus-data wrapper) stands in for an action's return value, however the pitch for it is framed
- [ ] Query methods with non-nullable return types provide the claimed value or throw, without returning `null` or a failure wrapper
- [ ] A public query's non-nullable declared return type is honored mechanically - the value or an exception, never `null`
- [ ] A single-result `Find*` query may return `T?` for no match; a multi-result `Search*` query returns an empty collection
- [ ] An action never uses a nullable return to report whether the work happened

### Cardinality
- [ ] A criteria query's expected cardinality (exactly one vs. first-of-many) is stated and enforced, including in non-LINQ forms
- [ ] A cardinality failure's exception carries the criteria that produced it
- [ ] No existence check is fabricated by catching a retrieval exception

### Exception Handling
- [ ] No `catch`/`except` block that only logs and re-raises, or silently swallows, with no genuine recovery or translation
- [ ] A `catch` block that absorbs a failure states, in a comment, the design decision that makes absorption correct
- [ ] Exception translation adds real context; it does not just wrap the original exception's message unchanged

### Defensive Validation
- [ ] No guard clauses or defensive `null`/empty checks inside internal or private methods
- [ ] Validation exists once, at the boundary where data enters the system, not repeated internally
- [ ] A guard that only re-exposes a required prior-call precondition is reviewed once, as a method-autonomy finding - not duplicated here

### Boolean Signatures
- [ ] A boolean parameter is genuine domain data, not faux generality - a flag added so one method can play more than one role
- [ ] A boolean mode-switch finding is raised as a warning, including for a small pure method, and recommends separate intention-revealing methods or a meaningful enum; a named Boolean argument alone is not treated as a correction
- [ ] A boolean return is either a query answering a real business question, or (never) a success/failure indicator from an action
- [ ] A repeated business condition is extracted to one named predicate, policy, or polymorphic design rather than copied
