---
title: "Programming to Exceptions, Part 1: Method Contracts and Failure"
description: "Method contracts let callers write the happy path and let failures propagate. C# examples distinguish commands, required retrieval, search, and boundary validation."
datePublished: 2019-10-28
dateModified: 2026-10-02
tags: ["error-handling", "method-design", "boundary-validation", "design-patterns", "csharp"]
draft: false
hero: programming-to-exceptions-method-contracts
youtube: "https://www.youtube.com/watch?v=5IKczyor-f4"
---

I call my approach **Programming to Exceptions**. Its starting point is that an action or command method throws an exception when it cannot do its work, rather than returning `true` or `false` to report success or failure. A query method returns the information it promises, or it throws. A caller asking `GetCustomer` for a particular customer expects to receive that customer and use it. A caller choosing `Find` or `Search` allows for the possibility that no customer matches. The method's contract expresses that difference.

The [Action Methods and Query Methods section of Method Design](/pwi/method-design/csharp/#action-methods-and-query-methods) explains those return contracts in detail. Here I develop what it means to rely on them throughout a system: failures propagate, bad data stops at the boundaries, and a catch block exists only where the application can take meaningful responsibility.

The application still has to deal with failure. The important decision is where that responsibility belongs. The method detecting a problem often knows exactly what went wrong, but has no useful way to recover. Another part of the application knows how to translate the failure into an HTTP response, a message for a user, or a recovery decision.

Separating those responsibilities changes the code throughout the system. It affects method design, validation, exception types, resource ownership, logging, and the application boundary. Applying only the return conventions while leaving failures swallowed elsewhere cannot give callers the guarantees this approach depends on.

This first part establishes those guarantees. [Part 2](../programming-to-exceptions-diagnostics-and-boundaries/) develops the exception hierarchy and the diagnostic information that travels to the boundary. The C# examples use customer registration and order placement to illustrate the design.

## Write the happy path

A thrown exception does not return normally to the caller. It leaves the current path and propagates up the call stack. That is the capability we use: reaching the next step means the preceding calls fulfilled their contracts.

Consider placing a new order. The domain receives an order-placement request. The Manager checks that it is supplied, normalizes its values, and validates it before doing dependent work. The successful sequence then places the order, publishes a fulfillment notification, records that completion, sends a confirmation email, records that completion, and returns the placement result.

These listings are teaching adaptations of that sequence. The return-based version changes the failure contracts. The throwing version shows the steps directly. The full ordering example has additional resubmission and pending-work recovery policies, discussed in [Part 2](../programming-to-exceptions-diagnostics-and-boundaries/#meaningful-handling-changes-the-outcome). Those policies belong to the operations that own them; the comparison here isolates the cost of reporting an unhandled failure through return values.

Without Programming to Exceptions, the coordinating method must inspect each failure result:

```csharp
public async Task<OrderPlacementResult?> TryPlaceNewOrderAsync(
    OrderPlacementRequest request)
{
    if (!TryPrepareOrderRequest(request, out var preparedRequest))
        return null;

    OrderPlacementResult? order = await TryCreateOrderAsync(preparedRequest);
    if (order is null)
        return null;

    if (!await TryPublishFulfillmentNotificationAsync(order))
        return null;

    if (!await TryRecordFulfillmentCompletionAsync(order))
        return null;

    if (!await TrySendConfirmationEmailAsync(order))
        return null;

    if (!await TryRecordEmailCompletionAsync(order))
        return null;

    return order;
}
```

There are six checks, and the caller inherits another obligation: inspect the returned value before doing anything that depends on the order. C# lets callers discard return values. It does not force them to remember every failure check. One forgotten check can let a failed operation go unnoticed.

With Programming to Exceptions, the same high-level work reads as a sequence:

```csharp
public async Task<OrderPlacementResult> PlaceNewOrderAsync(
    OrderPlacementRequest request)
{
    OrderPlacementRequest preparedRequest = PrepareOrderRequest(request);
    OrderPlacementResult order = await CreateOrderAsync(preparedRequest);
    await PublishFulfillmentNotificationAsync(order);
    await RecordFulfillmentCompletionAsync(order);
    await SendConfirmationEmailAsync(order);
    await RecordEmailCompletionAsync(order);
    return order;
}
```

Prepare the request. Create the order. Publish the notification. Record completion. Send the email. Record completion. Return the order information. There is no success check between calls.

If creation throws, publishing never begins. Neither completion recording nor sending the email is reached. The callers between the failure and the outer handler need no conditional statements to produce that result. The exception does it for them.

For asynchronous code, each `await` matters. Starting a task and continuing without awaiting it does not establish that the work completed. Here, each awaited call completes before the next operation begins.

The **boundary handler** in the diagram is the application's outermost catch. In a Web API application, it is the **exception-handling middleware** surrounding the request's call into the domain. An exception that no inner component handles propagates up the call stack, through the Manager, Domain Facade, and controller, until the middleware catches it. Those callers do not need conditional checks to stop the remaining work. The middleware turns the failure into an HTTP response for the caller. [Part 2](../programming-to-exceptions-diagnostics-and-boundaries/#the-outer-boundary-records-and-translates) explains how it also combines the incoming request with the exception's context before logging.

<!-- diagram:start order-placement-comparison -->
<figure id="order-placement-comparison" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/order-placement-comparison.webp" alt="Two panels compare the same seven order-placement steps. Without Programming to Exceptions, six Success? diamonds check return values and pass failure back to a caller that must check it. With Programming to Exceptions, a placement exception propagates to the boundary handler without success checks between calls. Both panels leave fulfillment, email, completion recording, and the placement result unreached after placement fails." width="1254" height="1254" loading="lazy" decoding="async" />
  <figcaption>Return-based failure reporting adds checks between calls. Programming to Exceptions lets an escaping placement failure reach the boundary handler, which is the exception-handling middleware in a Web API. This comparison distills the new-order path; resubmission and pending-work recovery policies remain within their operations.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/order-placement-comparison.webp">Open full-size order-placement comparison</a></p>
</figure>
<!-- diagram:end order-placement-comparison -->

These guarantees concern the declared contract of each operation. Exceptions do not undo earlier side effects. If an order has been accepted and a later action cannot finish, transactions, idempotency, and the defined recovery policy determine what remains durable and what work is still owed. The article on [refusals, failures, and work still owed](/writing/refusals-failures-and-work-still-owed/) develops that ordering policy.

## An action or command method completes its work or throws

An action method, also called a command method, does something: register a customer, save a record, or send a notification. My starting rule is that it returns `void`. An asynchronous action method returns `Task` or `ValueTask`, which its caller awaits. [Method Design's action-method guidance](/pwi/method-design/csharp/#action-methods-do-the-work) explains why the return type carries no success flag.

```csharp
public async Task RegisterCustomerAsync(
    CustomerRegistrationRequest customerRegistrationRequest)
{
    var providedFormRegistrationRequest =
        NormalizeToProvidedForm(customerRegistrationRequest);

    ValidatorCustomerRegistrationRequest.Validate(
        providedFormRegistrationRequest);

    bool marketingOptIn = MarketingOptInChoice.ToRecordedChoice(
        providedFormRegistrationRequest.MarketingOptInChoice);

    await _dataManagerCustomers.RegisterCustomerAsync(
        providedFormRegistrationRequest, marketingOptIn);
}
```

This method coordinates customer registration. It normalizes the request, validates it, converts the marketing preference into its stored form, and asks the Data Manager to register the customer. The validator returns normally only when the request meets its rules. The Data Manager returns normally only when registration succeeds. Neither makes the coordinating method inspect a success flag.

The Boolean in this method is a business value: the customer's recorded marketing preference. Booleans have plenty of legitimate uses. The concern is returning a Boolean to report whether a command fulfilled its contract.

Consider this alternative contract:

```csharp
public bool SaveCustomer(Customer customer);
```

Every caller must inspect the result, understand what `false` means, and decide what to do. If it forwards the failure, its caller must do the same. This obligation spreads through the entire call chain: correctness depends on every caller remembering every check. C# permits a caller to discard a return value without a compiler error, so a missed check can let execution continue after a failure. A result object with an `IsSuccessful` property imposes the same obligation when it serves as an error envelope.

With a throwing command, the caller cannot accidentally continue past the failed call merely by ignoring its result. Execution leaves that path until a suitable handler takes responsibility.

The contract must also say what completion means. A notification command might promise that a provider accepted the request; it cannot promise that a person read the message. Name and document the actual guarantee.

A creation action method can return data about the resource it created. An order-placement operation can return an order reference, total, and placement status describing the order that now exists. If it cannot create the order, it throws. [Method Design's creation-action guidance](/pwi/method-design/csharp/#creation-action-methods-may-return-created-data) explains this exception to the usual void return. Every returned field must describe the created resource. Avoid adding a return value merely to reassure the caller that the method ran.

## A query method returns what it promises

The corresponding [query-method guidance](/pwi/method-design/csharp/#query-methods-return-the-information-they-promise) requires a method to return the information it promises or throw. When the caller writes `GetCustomer(customerId)`, its intent is: “I expect this customer to exist. Give me that customer so I can work with it.” The calling code depends on receiving a usable `Customer`. It has not asked the method to see whether one might exist.

That expectation is a contract, rather than proof that the customer is still available. The method must retrieve the customer or throw if it cannot fulfill the request:

```csharp
public Customer GetCustomer(int customerId)
{
    Customer? customer = _customerStore.FindCustomer(customerId);
    EnsureCustomerWasFound(customer, customerId);
    return customer!;
}

private static void EnsureCustomerWasFound(
    Customer? customer, int customerId)
{
    if (customer is null)
    {
        throw new CustomerRetrievalNotFoundException(
            $"Customer '{customerId}' does not exist. " +
            "Supply the identifier of an existing customer.",
            CustomerLogEvent.GetCustomer,
            new ContextualData { { "Customer.Id", customerId } });
    }
}
```

The store's lookup permits absence. `GetCustomer` has a stronger contract and owns the decision that absence prevents it from fulfilling the request. Its caller receives a `Customer` or an exception. The null-forgiving operator follows the throwing check; it does not perform validation itself. A production implementation can annotate the check so nullable analysis understands the guarantee.

The caller can therefore write:

```csharp
public void SendOrderConfirmationEmail(int customerId)
{
    Customer customer = _customerDataManager.GetCustomer(customerId);
    OrderConfirmationEmail email = _emailComposer.Compose(customer);
    _emailGateway.Send(email);
}
```

If retrieval fails, composition never begins. If composition fails, sending never begins. There is no useful action this orchestration can take with a missing customer, so it leaves that failure to a place that can act on it.

Returning `null` from a method promising a customer weakens the contract. Returning an empty customer object weakens it further: the caller receives something shaped like a customer that lacks the facts the operation needs. A fabricated default can conceal the failure until another operation uses it.

These return contracts also clarify constructors and properties. If construction cannot produce the required object, fail construction. If an operation on a property violates its defined contract, communicate that failure consistently. Callers should not need to discover a different error convention for every language construct.

## Retrieval, search, and existence have different contracts

A caller choosing `FindCustomer` or `SearchCustomers` expresses a different intent: “I do not know whether there is a match. Look for one and tell me what you find.” No match is an acceptable answer to that request. [Method Design's Find and Search guidance](/pwi/method-design/csharp/#when-a-find-or-search-has-no-match) makes the same distinction.

Search and Find methods are also query methods, but they promise the result of a search rather than a required customer. Their return types must express that promise. A collection can be empty; a single-result Find method can explicitly permit `null` for no match.

| Intent | Example contract | Meaning of absence |
| --- | --- | --- |
| Retrieve a required customer | `Customer GetCustomer(int customerId)` | Throw because the requested customer cannot be supplied. |
| Search a collection | `IReadOnlyList<Customer> SearchCustomers(string name)` | Return an empty collection when there are no matches. |
| Find an optional customer | `Customer? FindCustomer(int customerId)` | Return `null` as a documented answer. |
| Ask whether a customer exists | `bool CustomerExists(int customerId)` | Return `false` when the customer is absent. |

A collection-returning query method promises a collection, and an empty collection fulfills that promise. This follows the same rule as `GetCustomer`: return what the method claims to return or do not return normally at all. A search method should still throw if the store is unavailable. Otherwise, callers would mistake an inability to search for evidence that nothing matched.

`CustomerExists` promises a Boolean answer to a specific question. Both `true` and `false` fulfill that promise. Neither is a success flag for an action method. A database failure cannot truthfully become `false`; the system has failed to answer the question and must throw.

Names help the caller recognize the intent, but the implementation and documented semantics must uphold it. Calling a nullable lookup `GetCustomer` while expecting every caller to remember a hidden exception to the contract brings the uncertainty back.

## Rely on exceptions

I tell a team: “If I hear nothing from the system, I do not need to investigate an operation failure.” I do not need to keep looking at logs to reassure myself that each method did its work. I rely on the assurance that, if an operation cannot fulfill its contract, it throws and the failure reaches the application's boundary.

That assurance depends on the design being consistent. The system rejects invalid incoming data, its methods honor their return contracts, and nobody catches a failure merely to make it disappear. A thrown exception leaves the current path and travels up the call stack. It does not return to the caller as another value that the caller might forget to inspect. We use that capability to simplify the design.

I treat exceptions as friends. I want the system to throw plenty of its own specific exceptions when requirements are not met. Most exceptions in a developed system should be those deliberate custom types. Their presence tells us the system detected and explained a condition it was designed to recognize.

A business exception is the system doing exactly what we designed it to do. We deliberately threw it because a business requirement prevented the requested action. There is no system defect to fix in that refusal; the user, UI, or calling service receives the explanation and decides what to do. A technical exception needs a different response. A timeout after bounded retries may need attention only if its frequency becomes a problem. An unexpected `NullReferenceException` or `IndexOutOfRangeException` exposes a programming defect that needs investigation. [Part 2's operating policy](../programming-to-exceptions-diagnostics-and-boundaries/#which-failures-need-attention) explains that distinction and the alerts that make it visible.

## Fail fast and fail visibly

Fail fast means detecting a violated requirement at the place that can establish it, before invalid data reaches work that depends on it. Fail visibly means communicating the problem clearly enough that it cannot pass unnoticed as an ordinary result.

I describe the domain as a house with a front door and a back door. The front door admits requests. The back door admits configuration, database results, and responses from external services. Validate the data entering through both.

This boundary-validation guidance already has a home in [Validation Philosophy: Lock the Doors](/pwi/validation-exception-handling/csharp/#validation-philosophy---lock-the-doors). Requests from a UI or an upstream service enter through the front door; responses from downstream services enter through a back door. Reject invalid data at those entry points so the rest of the domain can rely on what it receives.

The front door belongs to the domain. A browser may validate a form for convenience, but another caller can bypass that browser. The system has to enforce its own requirements. In this architecture, the Service Interface Layer translates transport input and forwards it through the Domain Facade. The Facade is the public entry point and delegates the work to Managers. Every public Manager method validates its inputs through specialized validators before doing dependent business work. Those methods are the front door where validation is enforced. Controllers and cloud functions stay focused on their transport role.

At the back door, a Configuration Provider validates raw settings when it loads them. A Gateway transforms an external service's models into the application's domain models and validates the incoming data against domain requirements. A Data Manager and its mappers check the store's result contract before returning domain data. A class reading a file has the same responsibility: validate what it reads before allowing that data into domain work. Front and back doors describe every point where data enters, however many entry points the system has. Their callers should receive valid, usable domain values.

<!-- diagram:start validated-domain-entry-points -->
<figure id="validated-domain-entry-points" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/validated-domain-entry-points.webp" alt="Five entry paths admit data into domain work only after validation: the Domain Facade delegates to public Manager methods using specialized validators; configuration, gateway model transformation, database mapping, and file reading each validate their incoming data. Invalid data exits through a thrown exception." width="1821" height="864" loading="lazy" decoding="async" />
  <figcaption>The Domain Facade delegates. Every public Manager method validates before doing work, and each other admission point validates the data it brings into the domain. Invalid data is rejected at its entry point.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/validated-domain-entry-points.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end validated-domain-entry-points -->

Once those guarantees hold, internal methods can use the values they receive without repeating the same validation throughout the call chain. A business rule can still require a conditional. A validator certainly can. Programming to Exceptions removes repeated uncertainty about completed calls; it does not remove business decisions.

Validate at the correct time, too. A customer being active at request validation does not guarantee that it remains active during a later write. Requirements involving changing shared state need enforcement where the state is authoritative, sometimes inside a transaction or database constraint.

## Caller's data, caller's problem

Inside a validated domain, an internal method should be able to rely on its caller supplying the data the method requires. If that caller passes invalid data, correct the caller or the missing boundary check. Adding guards to every downstream method can hide the same defect repeatedly without fixing how it entered the system.

This depends on a real boundary and an established contract. A public method admitting untrusted input is itself a boundary. It must validate that input even if other internal methods can rely on prior validation.

Responsibility also applies to data your own code creates. If a Gateway builds a malformed provider request from a valid business request, the consuming user did not cause that defect. Your system owns the mapping or integration problem. It should not tell the user to fix data that was correct when supplied.

That distinction will become the business and technical branches of the exception hierarchy in Part 2. A useful message identifies the failed requirement and the party able to remedy it.

## Exceptions for failure, ordinary answers for ordinary questions

The instruction “do not use exceptions for control flow” needs a concrete explanation. Exceptions necessarily change execution flow. Their useful purpose here is to stop an operation that cannot fulfill its contract.

The misuse is deliberately provoking a failure so that a catch block can answer an ordinary question.

For example, user input arrives as text, and nonnumeric text is an ordinary possibility. This implementation uses throwing conversion as a test:

```csharp
public static bool TryReadQuantity(string input, out int quantity)
{
    try
    {
        quantity = int.Parse(input);
        return true;
    }
    catch (FormatException)
    {
        quantity = 0;
        return false;
    }
    catch (OverflowException)
    {
        quantity = 0;
        return false;
    }
}
```

Use the operation designed to answer that question:

```csharp
public static bool TryReadQuantity(string input, out int quantity)
{
    return int.TryParse(input, out quantity);
}
```

The UI can now invite the user to correct the quantity when parsing returns `false`. The domain must still validate business requirements, such as a positive quantity within a permitted range. Parsing establishes that the text represents an integer; it does not establish that the integer is acceptable for this order.

Microsoft distinguishes the [Tester-Doer and Try-Parse patterns](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/exceptions-and-performance). A Tester-Doer checks a defined condition before doing the work. A Try method attempts the operation and reports a specifically defined negative outcome. Its name starts with `Try`, and its Boolean return tells the caller whether that defined attempt succeeded. A corresponding throwing operation can serve callers requiring the result.

A Try method must still throw for failures outside its negative-outcome contract. A `TryGetCustomer` can return `false` for absence while throwing for a broken connection.

The same mistake occurs when an existence method calls throwing retrieval:

```csharp
public bool CustomerExists(int customerId)
{
    try
    {
        _customerDataManager.GetCustomer(customerId);
        return true;
    }
    catch (CustomerRetrievalNotFoundException)
    {
        return false;
    }
}
```

Give the existence operation its own lookup semantics. It can ask the store whether the customer exists and return the answer without manufacturing a retrieval failure.

An existence check is also only an observation at that time. It cannot guarantee that a later retrieval or update succeeds if another operation changes the record. Enforce the required invariant during the operation that needs it.


## Frequency does not define the contract

A business refusal can be frequent and still prevent a command from completing. Consider a command whose intent is to log a user in. Incorrect credentials prevent that command from fulfilling its contract, so I represent that refusal with a specific application exception. The boundary translates it into an appropriate caller message.

That differs from asking whether a piece of text can be parsed as an integer. The parser has a defined negative answer. A command that promises to establish an authenticated session has failed to do so.

The login message must also preserve the application's disclosure policy. A useful refusal need not reveal whether a particular account exists. The contract and audience determine what the caller may learn.

The question to ask is what this method promises and whether a negative answer is part of that promise. “It happens often” does not, by itself, decide whether to return an ordinary value or throw.

## Catch where the application can take responsibility

**Catching an exception is not the same as handling it.** Catching and logging observes the failure. Catching and swallowing conceals it. Handling means taking a meaningful action the component understands, such as a defined retry, recovery, rollback, or translation.

If a method does not know how to take that action, it should not catch the exception. Let the failure propagate to the component that does. The [meaningful-handling guidance](/pwi/validation-exception-handling/csharp/#meaningful-handling) develops this responsibility.

Most orchestration has no reason to catch. Catching an exception to log its message and then returning normally makes the failed operation appear successful. Catching and returning `null`, an empty value, or a default score merely changes the form of the hidden failure.

A fallback is legitimate when the requirement explicitly says what it means. If a rating operation permits using stored data after a specific provider outage, the owning component can implement that policy. A blanket catch around the entire operation cannot establish that the stored answer is valid for every possible failure, including defects in mapping or configuration.

A method should catch only failures it understands well enough to act on. That action can be translating a provider exception into domain language, applying a defined retry or fallback policy, or restoring owned state before propagating the failure. Catch the relevant type as narrowly as that responsibility permits.

The outer boundary has a different role: it must translate any failure that escapes into the host's response. In my usual web API design, exception-handling middleware contains the outermost try-catch, and ordinary domain code has no catch blocks. Gateways translate the external failures they understand; cleanup and an explicit recovery requirement can justify other narrowly owned catches. [Part 2's order-resubmission example](../programming-to-exceptions-diagnostics-and-boundaries/#meaningful-handling-changes-the-outcome) shows a business requirement that gives a coordinating method a meaningful reason to catch a specific exception.

A command-line application handles escaping failure at its top-level invocation. A worker handles it at the boundary of the unit of work it owns. Existing host handling can be sufficient; install a custom unhandled-exception mechanism only when the default cannot meet the requirement.

## Cleanup has an owner

Letting an exception propagate does not excuse resource leaks. The component acquiring a resource has to arrange its release. In C#, `using`, `await using`, and `try-finally` express that responsibility without pretending to recover from the failure.

```csharp
public async Task WriteExportAsync(string path, byte[] content)
{
    await using var exportStream = new FileStream(
        path, FileMode.Create, FileAccess.Write);

    await exportStream.WriteAsync(content);
}
```

The stream's lifetime encloses the write. If the write fails, leaving the scope still invokes disposal. The failure propagates. C# documents these [exception-handling and cleanup mechanisms](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements).

A transaction owner can have a real reason to catch: it must roll back failed work before rethrowing. Use `throw;` to preserve the original stack trace. If rollback can itself fail, preserve both failures so that cleanup does not erase the initiating cause. When the transaction's disposal contract already supplies rollback, use that contract deliberately.

None of these mechanisms guarantees cleanup after abrupt process termination, nor does a database rollback reverse an email already accepted by another service. Resource lifetime and business recovery each need their own design.

## Performance follows the workload

Throwing and catching has a cost. A parser rejecting many inputs through exceptions can make that cost significant, which is one reason to use `TryParse` for its defined negative outcome. Measure the real workload when failure frequency or latency matters.

Avoid weakening every method contract because exceptions might be expensive. The system also pays for repeated checks, ambiguous results, and failures that take hours to diagnose. Use the appropriate ordinary-result API where one is required, and preserve explicit failure elsewhere.

With dependable contracts, the caller's successful path stays readable. Failure detection remains close to the requirement being violated. [Part 2](../programming-to-exceptions-diagnostics-and-boundaries/) follows that failure outward: the specific type, message, cause, context, and boundary response that make it useful to the people operating the system.
