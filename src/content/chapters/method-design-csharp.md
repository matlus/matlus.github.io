---
title: Method Design
description: >-
  Explicit visibility, why public members are never virtual, orchestration over implementation, and return contracts that state their cardinality.
datePublished: 2026-08-30
dateModified: 2026-09-19
tags:
  - method-design
  - csharp
section: pwi
topic: method-design
language: csharp
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the Aphorism Glossary.

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

---

## Actions Are Void-Returning

This action/query convention governs ordinary application operations. A command-line adapter may return an `int` or `Task<int>` exit status to the process entry point, including the exact child `Process.ExitCode` after completion. That is an explicit process protocol, not an undocumented domain success flag. Preserve cleanup on every path and propagate the child status accurately. Do not extend this exception to ordinary application callers interpreting status codes.

**A method that does something - an action, a command - returns `void`, or `Task`/`ValueTask` for its asynchronous form.** If action methods have a problem, they do not return - they throw. Success needs no signal: the absence of an exception, on the calling line, already says the action happened. A return value that exists only to report how the operation went is what an exception is for, and an action must never carry that report in its return type - not as a `bool`, not as a status or error code, not as a `Result`/`Try`-style wrapper, and not as a `null` standing in for "it did not work."

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

**The sanctioned anomaly: a creation action may return data of the resource it just created.** Creation is the one case where an action legitimately returns something, because what it returns is not a report on the action - it is the created resource itself, or a fact about it. `InsertCustomer` returning the new customer's ID is the narrowest form: not a status code, not a `-1` for failure, only the identity, and only on the path where creation actually happened.

```csharp
// COMPLIANT - the sanctioned anomaly: identity of a newly created resource
public int InsertCustomer(string firstName, string lastName, DateTime dateOfBirth)
{
    // returns the new customer's ID on success, raises on failure
}
```

A creation action is not limited to a bare identifier - it may return a small creation result carrying data of the created resource, provided every field of that result describes the resource rather than the outcome. `ManagerOrdering.PlaceOrderAsync` returning `OrderPlacementResult` (`OrderReference`, `OrderTotal`, `OrderPlacementStatus`) is the ratified example: `OrderPlacementStatus` is domain state of the order that now exists - not an outcome flag standing in for "did this succeed." The method either returns a result describing a real order, or it throws.

**The discriminating test is simple to state and worth applying to every return value on an action: does it exist to report how the operation went, or does it carry data of the thing that was created?** The first is a violation, however it is spelled - a `bool`, a status enum, an error code, a `Result<T, TError>` or `Try`-style wrapper, or a `null` used to mean "failed." The second is fine, no matter how many fields it carries, as long as every one of those fields describes the created resource and none of them encodes success or failure.

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

**A functional-style outcome envelope is the same violation wearing a more respectable-looking costume, and it deserves calling out by name.** The shape: an action returns an object with a success/error flag alongside a data property that is `null` or empty on failure and populated on success - a `Result<T>`, an `Either`-style effect type, or a hand-rolled envelope with the same two-property skeleton. The pitch for it is always "we're not returning a `bool`, we're returning an object" - but the object exists for exactly one reason: to tell the caller whether the operation worked. That is what throwing is for, and wrapping the flag inside a class instead of returning it bare does not change what it is.

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

`PlaceOrderEffect<T>` fails the same test `InsertCustomerResult` fails: `IsSuccess` and `Error` exist only to report how the operation went, and `Data` being `null` on the failure path is just `null`-for-failure wearing a generic type parameter. A creation action may return data of the resource it created - it must never return a thing whose job is to indicate whether creating it worked, no matter how many layers of wrapping sit between that flag and the caller.

---

## Queries Return What They Claim, or They Don't Return At All

**A method that claims to return something either returns exactly that, or it throws.** "Doesn't return" means an exception - execution never reaches the caller's next line, so the caller never has to wonder whether what it asked for actually came back.

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

**Do not try to beat the system.** A method that claims to return a customer must not instead return some `Result<Customer, Error>`, an `Option<T>`, or a hand-rolled wrapper with a `Customer` property and an `ErrorMessage` property next to it. Wrapping the failure alongside the data is exactly the `None`/`null` problem wearing a different type; it forces the same defensive unwrapping on every caller that raising an exception was meant to eliminate.

```csharp
// VIOLATION - a wrapper is still a "maybe" in disguise
public sealed class GetCustomerResult
{
    public Customer? Customer { get; init; }
    public string? ErrorMessage { get; init; }
}
```

`DataManagerOrdering.PlaceOrderAsync` and `.GetOriginalOrderForResubmissionAsync` follow the contract exactly: both return the claimed tuple of order data, or they throw one of `CustomerNotFoundException`, `OrderReferenceAlreadyExistsException`, `OrderStoreContractViolationException`, or `OrderStoreUnavailableException` - never a null, never a wrapper. The exception taxonomy behind this - a `OrderingException` root splitting into `OrderingBusinessException` and `OrderingTechnicalException` branches - is Chapter 9's full territory; what matters here is that "the answer, or an exception" is the whole contract, with no third option.

**Whether a nullable return is acceptable is a judgment call, not a mechanical finding.** C#'s nullable reference types make a return type declared `T?` an honest contract: the signature itself tells every caller that absence is possible, and returning `null` through it can be entirely legitimate - some business rules genuinely allow for absence, and forcing an exception onto every "this did not happen, and that is fine" case would be manufacturing a failure where none occurred. The cost to weigh against that legitimacy is real: a nullable return pushes a `null` branch onto every caller - there's an else somewhere, and that else has to be written, tested, and kept correct. Whether a given nullable return is worth that cost cannot be judged from the method's signature alone - it depends on the business rule behind the absence and on what every caller actually does with the `null`. That makes this teaching guidance for a human to weigh in its actual context, not a mechanical rule applied from the method text in isolation: it is a question a reviewer raises about one specific nullable return, never a finding a reviewer can raise on sight.

`GatewayEmailService.AttemptSendAsync` (a nullable `EmailSendFailure?`) and `ManagerOrdering.TryPublishFulfillmentNotificationAsync` (a nullable `DateTime?`) are both examples where that judgment lands in favor of the nullable return: each method's own name and comment state exactly what `null` means - "no failure occurred" in the first case, "this did not happen, so leave it pending" in the second - and each caller's handling of the `null` is itself a stated business rule, not an afterthought bolted on to cover a gap.

**One piece of this stays mechanical, not a judgment call.** A public query whose declared type claims a value - a non-nullable return type - must return that value or throw. Never `null` through a type that promised not to hand you one, and never a `Result`/`Option`-style wrapper standing in for the honest `T?` the language already gives you for the cases where absence truly is possible. The judgment call above governs whether a method's return type should be declared nullable in the first place; once it is declared non-nullable, there is nothing left to weigh - the contract is `GetCustomer`'s, above, not a discussion.

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

**A boolean *return* is a different question, governed separately.** An action never returns a boolean to indicate success or failure - see Actions Are Void-Returning, above. A predicate query, by contrast, may legitimately return `bool` when its name asks a real business question, its inputs are explicit, and it performs no side effects.

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

A worked example combining an encapsulated conditional with other cleanup (removing a useless initialization, closing off an empty-string possibility) appears in the source material as a single before/after pair. This chapter operationalizes only the conditional-encapsulation half. Native C# review owns compiler/runtime mechanics; broader style and null-or-valid-string preferences remain non-emitting in the current partial chapter set.

---

## Boundaries With Other Chapters

Several ideas in the author's original method-design material are real and important, and are owned by name elsewhere in this corpus rather than repeated here:

- **Names of methods, parameters, and locals** - the vocabulary-of-the- business rule, the "don't invent names" rule for technical objects, and the `Async` suffix convention - belong to Naming Conventions (`cs03`).
- **How much a signature is allowed to ask for** - the need-to-know basis, and narrowing an oversized DTO to a purpose-built type - belongs to the Need-to-Know Principle (`cs02`).
- **What a parameter or return type honestly promises** - least-derived-in, most-derived-out, and `IEnumerable<T>` versus `IList<T>` - remains non-emitting until a C# Type Contracts chapter is admitted. The narrow materialized-LINQ snapshot case belongs to `cs08`.
- **Cleaning up and mapping transport data at the controller** belongs to `cs55`; **domain validation at the Manager front door** belongs to `cs09`. Broader boundary-model and null-or-valid-never-empty string doctrine remains non-emitting.
- **Choosing and calling LINQ operators** - `ToList`/`ToArray` materialization, `Single` versus `First`, preferring the non-`OrDefault` forms, and a criteria-carrying cardinality exception - belongs to LINQ Query Semantics (`cs08`). This chapter owns the *contract* (Cardinality Is Intent, above); `cs08` owns the *operator*.
- **Casts versus `as`, `var`, useless initialization, and unnecessary allocation** are handled by native C# review where mechanically provable; uncalibrated PWI style preferences remain non-emitting.

These Method Design rules apply to production methods and reusable test-support
methods. Actual test-method structure belongs to the testing chapters. An
Asserter is a specialized reusable test-support method: when an Asserter rule
owns the exact occurrence, that specialized rule takes precedence; Method
Design remains the fallback for aspects the Asserter rules do not address.
- **The Rule of Thirds** - wait for the third real occurrence of a pattern, and rewrite it each time rather than copy-pasting, so the variations surface before anything is generalized - is a shared, language-neutral aphorism referenced here and in Class Design (`cs05`) rather than owned by either.

---

## Review Questions

- Does every member state its own visibility explicitly, starting from `private`?
- Is any `public` or `internal` member also `virtual` or `abstract`? Should it forward to a `protected virtual`/`abstract` member instead?
- Is an `override` in a non-sealed class left unsealed without the source establishing that the class is an intentional extension point?
- Does every method receive everything it needs through its parameters, with nothing depended on from a prior call?
- Does a public method read as a short sequence of named steps, at one consistent altitude, with no inline implementation detail?
- Is a "low-level" class's public method held to the same orchestration standard as a domain class's?
- Does an action method's return value, if it has one, exist only to carry data of a resource it created - never to report how the operation went, whether as a bare flag or wrapped inside a `Result`/`Either`-style envelope?
- Does a query method return the type it claims, or throw - never `null`, `Optional`, or a `Result`-style wrapper?
- Where a return type is declared nullable, has someone actually weighed the business rule behind the absence and what every caller does with the `null`, rather than assuming the nullability is fine because it compiles?
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

### Orchestration
- [ ] Public methods on non-trivial classes orchestrate - they describe WHAT happens, not HOW
- [ ] No partial extraction: if some steps are delegated, all equivalent steps are delegated
- [ ] Business decisions, short prerequisite guards, pure predicates, and simple named aggregate construction are distinguished from substantive implementation steps
- [ ] Bound orchestration depth after excluding supporting calls and distinct scheduling/resource/mapping responsibilities; do not count total stack frames
- [ ] Low-level classes (data managers, adapters) hold their public methods to the same level-zero orchestration standard as domain classes
- [ ] An altitude cleanup extracts private methods before introducing a new class

### Actions and Queries
- [ ] Ordinary application actions return `void`/`Task`, never a success/failure indicator; a CLI adapter may propagate an explicit process exit status
- [ ] A resource-creation action's return value - whether a bare identifier or a small result record - carries only data of the created resource; no field of it encodes success or failure
- [ ] No functional-style outcome envelope (`Result<T>`, `Either`, or a hand-rolled success-flag-plus-data wrapper) stands in for an action's return value, however the pitch for it is framed
- [ ] Query methods return the claimed type or throw - never `null`, `Optional<T>`, or a `Result`/wrapper type
- [ ] A public query's non-nullable declared return type is honored mechanically - the value or an exception, never `null`
- [ ] A nullable return (`T?`) is a considered judgment call, not a default: the business rule behind the absence and every caller's handling of the `null` have actually been weighed, not merely assumed acceptable

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
