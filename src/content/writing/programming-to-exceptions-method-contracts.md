---
title: "Programming to Exceptions, Part 1: Method Contracts and Failure"
description: "Action methods do their work or throw; query methods return what they promise or don't return. Failures propagate to one catch at the entry point, and each door validates incoming data."
datePublished: 2019-10-28
dateModified: 2026-10-02
tags: ["error-handling", "method-design", "boundary-validation", "try-parse", "csharp"]
draft: false
hero: programming-to-exceptions-method-contracts
youtube: "https://www.youtube.com/watch?v=5IKczyor-f4"
---

Most of us learned to handle failure by checking. A method returns `true` or `false`, an error code, or `null`. The caller looks at the result before it moves on. Its caller does the same, and so on up the chain. We have written code this way for decades, and it works, as long as every caller checks every result, every time.

Programming to Exceptions replaces that habit. It is built on one fact about exceptions that most code fights instead of using: **a thrown exception never returns to the code that called the method.**

This article builds the approach one rule at a time:

1. Action methods return nothing. They do their work, or they throw.
2. Query methods return what they promise, or they don't return at all.
3. You catch exceptions in one place: the application's entry point.
4. You validate data where it enters the system, so the code inside can trust it.

Then we look at what your code looks like once all four hold, why the exceptions themselves should be specific, and the objections experienced programmers usually raise. The examples are in C#, but the ideas apply to any language with exceptions.

<span id="an-action-or-command-method-completes-its-work-or-throws"></span>

## Rule 1: Action methods return nothing

An action method does something. It places an order, registers a customer, or sends an email. (These are also called command methods.)

Take a method that places an order. When it succeeds, what should it return? There is nothing to return. The order is placed. So it returns `void`:

```csharp
public void PlaceOrder(Order order)
```

If you have been programming for a long time, you are probably pushing back right now. How does the caller know the order was placed? That question is why most of us would write this instead:

```csharp
public bool PlaceOrder(Order order)
```

The answer is in how a thrown exception behaves. When `PlaceOrder` cannot place the order, it throws. A throw does not return to the caller. It leaves `PlaceOrder`, skips the rest of the caller's code, and keeps moving up the call stack, method by method, until something catches it.

Now look at the caller:

```csharp
PlaceOrder(order);
SendOrderConfirmation(order);
```

There are only two possibilities. If `PlaceOrder` succeeded, execution reaches the next line and the confirmation goes out. If `PlaceOrder` failed, it threw, and the next line never runs. A confirmation is never sent for an order that was not placed.

**Reaching the next line is the success signal.** You don't need `true`. You don't need to check anything.

This puts the responsibility where the knowledge is. The method that does the work is the one that knows when the work can't be done, so it is the one that throws:

```csharp
public void PlaceOrder(Order order)
{
    if (!_customerStore.IsActive(order.CustomerId))
    {
        throw new CustomerNotActiveException($"Order '{order.Reference}' cannot be placed because customer '{order.CustomerId}' is not active. Reactivate the customer's account before placing the order.", OrderPlacementLogEvent.PlaceOrder, new ContextualData { { "Order.Reference", order.Reference }, { "Order.CustomerId", order.CustomerId } });
    }

    _orderStore.Save(orderPlacementResult);
}
```

The `if` in this method is a business rule: a customer whose account is not active can't place orders. Business rules still need conditionals. What goes away are the checks whose only job is to ask "did that last call work?"

The exception takes two arguments after its message: a log event that names the operation, and contextual data that records the facts of this particular failure. [Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) explains both. What matters here is who throws: the method that detected the problem, because it has those facts at hand.

I call the promise a method makes its **contract**. `PlaceOrder` promises that when it returns, the order is placed. It either keeps that promise or throws. There is no third outcome where it returns normally and the order was not placed.

That gives us the rule for action methods: **an action method returns nothing. When it returns, its work is done. When it can't do its work, it throws.**

Two notes for real C# code.

In asynchronous code, an action method returns `Task` instead of `void`, and the caller awaits it. The `await` waits for the work to finish. If the work threw, the exception comes out at the `await`, and the next line does not run. That only holds if you await. A task you start and never await can fail without stopping anything.

A method that creates something can return data about what it created, such as the new order's reference number. That is information the caller needs. What an action method never returns is `true` or `false`, an error code, or a result object whose only job is to say whether the method worked.

<span id="a-query-method-returns-what-it-promises"></span>

## Rule 2: Query methods return what they promise, or don't return at all

A query method retrieves information. Its signature is its promise.

```csharp
public Customer GetCustomer(int customerId)
```

This method promises a `Customer`. When a caller writes `GetCustomer(42)`, it is not asking "is there a customer 42?" It is saying "I need customer 42. Give it to me so I can work with it."

That gives us the rule for query methods: **a query method returns what it promises, or it does not return at all.**

"Does not return" means the same thing it meant in Rule 1. The method throws, and a throw never comes back to the line that called it. Either the caller gets a real `Customer`, or execution leaves the caller entirely.

Here is how most of us would write this today. Customer 42 might not exist, so we return `null`:

```csharp
public Customer? GetCustomer(int customerId)
{
    return _customerStore.FindById(customerId);
}
```

Now every caller has to check before it can do anything:

```csharp
Customer? customer = GetCustomer(customerId);
if (customer is null)
{
    // Now what?
}
WelcomeEmail welcomeEmail = _emailComposer.ComposeWelcomeEmail(customer);
```

The alternatives are no better. Return `bool` with the customer in an `out` parameter, or return a tuple of a success flag and a customer. Either way, the caller gets two things back and has to inspect one before it can trust the other.

Programming to Exceptions moves the decision into `GetCustomer`:

```csharp
public Customer GetCustomer(int customerId)
{
    Customer? customer = _customerStore.FindById(customerId);
    if (customer is null)
    {
        throw new CustomerRetrievalNotFoundException($"Customer '{customerId}' does not exist. Supply the identifier of an existing customer.", CustomerLogEvent.GetCustomer, new ContextualData { { "Customer.Id", customerId } });
    }

    return customer;
}
```

The store's lookup is allowed to come back empty. `GetCustomer` is not, because it promised a customer. So when the store finds nothing, `GetCustomer` is the one that decides this is a failure, and it throws.

The caller now reads like this:

```csharp
Customer customer = GetCustomer(customerId);
WelcomeEmail welcomeEmail = _emailComposer.ComposeWelcomeEmail(customer);
```

If `GetCustomer` returns, you are holding a real customer. You can pass it straight to the next method without a check. If it can't return one, the next line never runs.

Don't be tempted to return an empty `Customer` or a default instead of throwing. That is worse than `null`. The caller gets something shaped like a customer with none of the facts it needs, and the problem surfaces somewhere else, later, where it is much harder to trace.

<span id="retrieval-search-and-existence-have-different-contracts"></span>

### When "not found" is a normal answer

You may be thinking that sometimes not finding a customer is perfectly normal. A user types a name into a search box. No match is a valid answer to that request.

That is a different request, so it gets a different method with a different promise. The method name tells the caller which promise it is getting:

| What the caller wants | Method | What "no customer" means |
| --- | --- | --- |
| A specific customer it expects to exist | `Customer GetCustomer(int customerId)` | The promise can't be kept. Throw. |
| To search for matches | `IReadOnlyList<Customer> SearchCustomers(string name)` | Return an empty list. |
| A customer that may or may not exist | `Customer? FindCustomer(int customerId)` | Return `null`. That is part of the promise. |
| To know whether a customer exists | `bool CustomerExists(int customerId)` | Return `false`. |

All four follow the same rule: return what you promised, or don't return. The difference is what each one promised. An empty list keeps a search method's promise. `null` keeps a find method's promise. `false` is a real answer to the question "does this customer exist?", not a success flag.

All four still throw when they can't do what they promised. If the database is down, `SearchCustomers` must not return an empty list. An empty list means "I looked and found nothing." It doesn't mean "I couldn't look." Returning one when the search never happened is a lie the caller has no way to detect.

All of this depends on names that match behavior. A caller who sees `GetCustomer` writes code that assumes a customer comes back. If that method quietly returns `null`, the name has misled the caller, and the caller's code is wrong without anyone noticing. Choose the name that says what the method does, then make the method do exactly that. Names that state their intent are at the heart of [Programming with Intent](/pwi/).

The rule for action methods and the rule for query methods are the two method design rules Programming to Exceptions depends on. [Method Design](/pwi/method-design/csharp/#action-methods-and-query-methods) covers both in more depth, along with the method design guidelines that have nothing to do with exceptions.

## The bucket brigade

Rules 1 and 2 matter most when you look past a single call to the whole call chain.

Here is a small feature built the traditional way: welcome a customer. One public method orchestrates the work in two steps: get the customer, then send a welcome email. It doesn't do the work itself. Private methods do.

```csharp
public bool WelcomeCustomer(int customerId)
{
    Customer? customer = GetCustomer(customerId);
    if (customer is not null)
    {
        return SendWelcomeEmail(customer);
    }
    else
    {
        // Now what?
        return false;
    }
}

private Customer? GetCustomer(int customerId)
{
    return _customerStore.FindById(customerId);
}

private bool SendWelcomeEmail(Customer customer)
{
    WelcomeEmail welcomeEmail = _emailComposer.ComposeWelcomeEmail(customer);
    return _emailSender.TrySend(welcomeEmail);
}
```

Look at what happened. `GetCustomer` couldn't do its job, so it handed the problem to its caller as `null`. `WelcomeCustomer` has to check for it and send the email only when there is a customer. Then comes the `else`. What is the method supposed to do there? It can't welcome a customer who doesn't exist, and it has no way to fix the problem. All it can do is return `false` and hand the problem to its own caller. That caller has to check for `false`, and so does its caller, all the way up the call stack.

It's a bucket brigade. Nobody can put out the fire, so everyone passes the bucket to the next person. Every method in the chain has to take the bucket and pass it on.

This has three costs.

**Every caller has to check.** Every method that calls one of these has to inspect the result and decide what to do. If it can't deal with the failure, it has to return its own `false` or `null` to its own caller. The obligation spreads up the whole chain.

**One missed check breaks everything.** C# lets you call a method and ignore its return value. The compiler won't complain. If one developer forgets one check, the code carries on as if the failed step succeeded. An email goes out for an order that was never placed. A record is updated with data that was never read.

**The reason is lost.** By the time the failure reaches the top of the call stack, all that's left is `false`, and nobody has a clue why. Was the customer missing, which the caller could fix? Or was the email provider down, which we need to fix? The code at the top can't tell, so it can't respond correctly. It treats both the same way.

Here is the same feature written to Rules 1 and 2:

```csharp
public void WelcomeCustomer(int customerId)
{
    Customer customer = GetCustomer(customerId);
    SendWelcomeEmail(customer);
}

private Customer GetCustomer(int customerId)
{
    Customer? customer = _customerStore.FindById(customerId);
    if (customer is null)
    {
        throw new CustomerRetrievalNotFoundException($"Customer '{customerId}' does not exist. Supply the identifier of an existing customer.", CustomerLogEvent.GetCustomer, new ContextualData { { "Customer.Id", customerId } });
    }

    return customer;
}

private void SendWelcomeEmail(Customer customer)
{
    WelcomeEmail welcomeEmail = _emailComposer.ComposeWelcomeEmail(customer);
    _emailSender.Send(welcomeEmail);
}
```

The public method is the orchestration: two steps, one below the other, with no conditionals. It doesn't do the work. It orchestrates the work, and the private methods do it. There is nothing to check, so there is no check to forget. There are no `false` values to pass up. And the failure keeps its reason: a `CustomerRetrievalNotFoundException` carries a message that says exactly which customer was missing.

But the exception still has to go somewhere. That is Rule 3.

## Rule 3: Catch in one place, the entry point

Every application has an entry point: the place where a request, a command, or a message first enters your code. That is where the exceptions land.

In an ASP.NET Core web API, the entry point is middleware that wraps every request. This is the entry point of the system. The middleware holds the outermost try/catch, and in this design it is the only one. Every exception that escapes your code reaches it:

```csharp
public sealed class ExceptionHandlingMiddleware(RequestDelegate requestDelegate, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await requestDelegate(httpContext);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Request {Method} {Path} failed.", httpContext.Request.Method, httpContext.Request.Path);

            (int statusCode, string detail) = exception switch
            {
                MeridianOrderingException meridianOrderingException => ((int)meridianOrderingException.HttpStatusCode, meridianOrderingException.Message),
                _ => (500, "An unexpected error occurred.")
            };

            httpContext.Response.StatusCode = statusCode;
            await httpContext.Response.WriteAsJsonAsync(new ProblemDetails { Status = statusCode, Detail = detail });
        }
    }
}
```

You register it once, early in the pipeline, with `app.UseMiddleware<ExceptionHandlingMiddleware>()`.

The full middleware does four things, in this order:

1. It adds the request's input data to the exception, so the log shows exactly what the caller sent.
2. It redacts personal information from the exception's message and its contextual data.
3. It logs the failure.
4. It translates the exception into the response the caller needs: a status code and a message.

This version is deliberately simple and shows only the last two. [Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) builds the full version, including what each exception carries for the log.

`MeridianOrderingException` is the base class of every exception this application defines, and each of those exceptions declares the HTTP status it translates to. A missing customer translates to 404 Not Found. Anything the application didn't define becomes a 500 with a generic message, and it is a bug until you find out otherwise. You will see where those statuses come from when we look at the exceptions themselves.

Now trace a failure from start to finish. A request asks the API to send a welcome email to customer 42, and customer 42 doesn't exist.

1. `GetCustomer(42)` finds nothing and throws `CustomerRetrievalNotFoundException`.
2. The exception leaves `GetCustomer`. The rest of `WelcomeCustomer` never runs. `SendWelcomeEmail` is never called. No email is composed. Nothing is sent.
3. The exception leaves `WelcomeCustomer` and passes through every caller above it. None of them runs another line, so no success response goes out.
4. The exception reaches the middleware. The middleware logs it, then returns a 404 with the message "Customer '42' does not exist. Supply the identifier of an existing customer."

No method between the throw and the middleware did anything. None of them needed a single line of code to stop the remaining work. The exception did that.

Other kinds of applications have their own entry point. In a console application, it's the top of `Main`. In a background worker, it's the code that picks up each message or unit of work. Wherever it is, it's one place, and it does the same work: record the failure, then translate it for whoever is waiting.

<span id="catch-where-the-application-can-take-responsibility"></span>

## Catching is not handling

Rule 3 says the rest of your code has no try/catch blocks. That rule is stricter than it sounds, because most catch blocks in existing systems are not handling anything.

**Catch and log** observes the failure. Then the method returns normally, and its caller believes the work succeeded.

**Catch and return `false`, `null`, or a default** hides the failure. It also restarts the bucket brigade from that point.

Neither of these is handling. Handling means the code actually does something about the failure that changes the outcome.

Ask yourself honestly: if `GetCustomer(42)` fails, what is the method that called it supposed to do? It needed that customer. It can't send an email to nobody. If `PlaceOrder` fails, the next step can't confirm an order that doesn't exist. At that level, there is nothing to do. In business systems, this is nearly always the case. A method calls another method because it needs the result. Without the result, it can't continue, and it has no way to fix the problem.

So don't write a catch block that pretends to know what to do. Let the exception go to the entry point, where translating it into a response is something the code really can do.

There are a few places where a catch is legitimate. Each one changes the outcome.

**Translating an exception into one that means something.** Say you insert a new customer and the database rejects it with a unique-key violation. That exception means nothing to the person registering, and it exposes which database you use. The data access code knows exactly what it means: this customer is already registered. So it catches that one specific failure and throws an exception that says so:

```csharp
public async Task AddCustomerAsync(CustomerRegistrationRequest customerRegistrationRequest)
{
    try
    {
        await _sqlConnection.ExecuteAsync(InsertCustomerSql, customerRegistrationRequest);
    }
    catch (SqlException sqlException) when (sqlException.Number is 2627 or 2601)
    {
        throw new CustomerAlreadyRegisteredException($"A customer with the email '{customerRegistrationRequest.EmailAddress}' is already registered.", CustomerLogEvent.RegisterCustomer, new ContextualData { { "CustomerStore.Error", sqlException.Message } }, innerException: sqlException);
    }
}
```

The catch is as narrow as it can be. It catches only SQL Server's duplicate-key errors, so every other database failure still propagates untouched. The original exception travels along as the inner exception, so nothing is lost for diagnosis.

**Retrying a transient failure.** A service might return 429 Too Many Requests, or a connection might drop for a moment. Waiting and trying again can genuinely fix that, so a retry is real handling. But retries run out. When they do, you are back to not knowing what to do. So you throw a specific exception, such as `ConfirmationEmailRetryExhaustedException`, and let it travel to the entry point like any other.

**Rolling back work you own, then rethrowing.** That one is covered under the limits at the end of this article.

What never exists in this design is a catch that turns an exception into an error code, a `bool`, or a `null`. That code fights the language. It takes a failure that was traveling to the right place on its own and turns it back into a value that someone has to remember to check.

<span id="fail-fast-and-fail-visibly"></span>
<span id="callers-data-callers-problem"></span>

## Rule 4: Lock the front door and the back doors

Rules 1 through 3 make failures impossible to miss. Rule 4 makes bad data impossible to let in.

Think of your system as a house. Data can only get in through its doors.

**The front door** is the main way upstream systems work with yours. Requests come in through it from a UI, an API caller, or another service.

**The back doors** are everything else that brings data in: the downstream services your system calls, databases, message brokers that deliver messages to it, configuration, and a key vault. Even a file your system reads from local disk brings data in, so it is a back door too.

A door is the class that first receives data from outside the system. Validate everything that comes through a door, at the door. If data breaks the rules, throw a specific exception right there. Bad data never gets inside. Lock the front door and lock the back doors, and you're safe in the house.

<!-- diagram:start system-doors -->
<figure id="system-doors" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/system-doors.webp" alt="A dashed boundary labelled Your system. On its left edge, one locked Front door receives arrows from three upstream sources: UI, API caller, and Other services. On its right edge, six locked Back doors each receive an arrow from one source: Downstream services, Databases, Message brokers, Configuration, Key vault, and Local files. Green arrows lead from every door to a central card, Inside the house, which reads: Classes trust what they receive. No guard clauses." width="1774" height="887" loading="lazy" decoding="async" />
  <figcaption>Data enters the system only through its doors. Requests from upstream come through the front door; everything else comes through a back door. Each door validates what passes through it, so the classes inside can trust what they receive.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/system-doors.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end system-doors -->

Here is the front door for customer registration:

```csharp
public async Task RegisterCustomerAsync(CustomerRegistrationRequest customerRegistrationRequest)
{
    ValidatorCustomerRegistrationRequest.Validate(customerRegistrationRequest);
    await _customerStore.AddCustomerAsync(customerRegistrationRequest);
}
```

`Validate` returns normally only if the registration meets every rule. If it doesn't, it throws a `CustomerRegistrationRequestValidationException` whose message names the rule that was broken. That's Rule 1 again: an action method that does its work or throws.

The front door belongs to your system, not to the UI. A browser can validate a form to give the user faster feedback. That is a convenience. Anything that can reach your API can skip the browser, so your system enforces its own rules.

The back doors work the same way. When a downstream service responds, validate the response before you use it. When a message arrives from a message broker, validate it before you act on it. When you load configuration, validate it at startup, so a missing setting fails immediately rather than on the first request that happens to need it. When you read a file, validate what you read. Your own database is a back door too: when you read a customer row, check that it has what your code relies on before you hand it to the rest of the system.

This is what people mean by "fail fast." Catch the problem at the first point where you can, before anything has been done with it.

Validation at the front door starts with the shape of the data: the required values are present, and each value has the right type and format. Not every business rule has to be checked up front. Some rules are ones the database already enforces, and it is very good at enforcing them. If an order names a product that doesn't exist, the foreign key on the order's line items rejects the insert. The data access code translates that violation into an `UnknownProductsException`, the same way it translated the duplicate-key violation earlier. You don't need to look up every product before you try to save the order. Let the database do what it's good at.

Once every door is locked, the code inside the house can trust what it receives. Here is a method written for a system without locked doors:

```csharp
public WelcomeEmail ComposeWelcomeEmail(Customer customer)
{
    if (customer is null)
        throw new ArgumentNullException(nameof(customer));
    if (string.IsNullOrWhiteSpace(customer.EmailAddress))
        throw new ArgumentException("Customer has no email address.", nameof(customer));
    if (string.IsNullOrWhiteSpace(customer.FirstName))
        throw new ArgumentException("Customer has no first name.", nameof(customer));

    return new WelcomeEmail(customer.EmailAddress, $"Welcome, {customer.FirstName}!");
}
```

Every method in that system starts with guards like these, because none of them can trust their input. Here is the same method in a system with locked doors:

```csharp
public WelcomeEmail ComposeWelcomeEmail(Customer customer)
{
    return new WelcomeEmail(customer.EmailAddress, $"Welcome, {customer.FirstName}!");
}
```

The customer was validated at the front door when it was registered, and again at the back door when it was read from the database. By the time it reaches this method, it is a valid customer. The guards have nothing left to guard against.

If bad data ever does show up inside, don't add a guard to the method that noticed it. That fixes one symptom and leaves the hole open for every other method. Find the door the data came through and fix the check there. The caller's data is the caller's problem. Inside the house, a method can rely on its callers to give it what it needs. [Method Design](/pwi/method-design/csharp/#caveat-emptor-no-defensive-validation-inside-internal-methods) explains why internal methods carry no defensive checks.

<span id="write-the-happy-path"></span>
<span id="rely-on-exceptions"></span>

## What your code looks like now

Put the four rules together and look at a real coordinating method: preparing a new order request, placing the order, then publishing a fulfillment notice, sending a confirmation email, and recording each step.

Preparing the request takes two steps. First the method cleans it up, for example by trimming stray spaces, and applies any normalization the business requires, such as storing email addresses in lowercase. That produces a new, clean request. Then it validates that request, so the rules check exactly what the rest of the method will use. Not every system needs the first step. You clean up and normalize when the business rules call for it, or when the data arrives straight from a UI or from upstream systems that don't clean it themselves.

Here it is written the traditional way:

```csharp
public async Task<OrderPlacementResult?> TryPlaceNewOrderAsync(OrderPlacementRequest orderPlacementRequest)
{
    OrderPlacementRequest orderPlacementRequestNormalized = NormalizeOrderPlacementRequest(orderPlacementRequest);
    if (!TryValidateOrderPlacementRequest(orderPlacementRequestNormalized))
        return null;

    OrderPlacementResult? orderPlacementResult = await TryCreateOrderAsync(orderPlacementRequestNormalized);
    if (orderPlacementResult is null)
        return null;

    if (!await TryPublishFulfillmentNotificationAsync(orderPlacementResult))
        return null;

    if (!await TryRecordFulfillmentCompletionAsync(orderPlacementResult))
        return null;

    if (!await TrySendConfirmationEmailAsync(orderPlacementResult))
        return null;

    if (!await TryRecordEmailCompletionAsync(orderPlacementResult))
        return null;

    return orderPlacementResult;
}
```

Six checks, and the method's own caller inherits a seventh: it has to check this method's result before doing anything with the order. When it gets `null`, it has no idea which of the six steps failed.

Here it is written to the four rules:

```csharp
public async Task<OrderPlacementResult> PlaceNewOrderAsync(OrderPlacementRequest orderPlacementRequest)
{
    OrderPlacementRequest orderPlacementRequestNormalized = NormalizeOrderPlacementRequest(orderPlacementRequest);
    ValidatorOrderPlacementRequest.Validate(orderPlacementRequestNormalized);
    OrderPlacementResult orderPlacementResult = await CreateOrderAsync(orderPlacementRequestNormalized);
    await PublishFulfillmentNotificationAsync(orderPlacementResult);
    await RecordFulfillmentCompletionAsync(orderPlacementResult);
    await SendConfirmationEmailAsync(orderPlacementResult);
    await RecordEmailCompletionAsync(orderPlacementResult);
    return orderPlacementResult;
}
```

Normalize the request. Validate it. Create the order. Publish the notification. Record it. Send the email. Record it. Return the order. If creation throws, nothing after it runs: no notification, no email, no record. Nobody wrote a line of code to make that happen.

<!-- diagram:start order-placement-comparison -->
<figure id="order-placement-comparison" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/order-placement-comparison.webp" alt="Two panels compare the same seven order-placement steps. Without Programming to Exceptions, six Success? diamonds check return values and pass failure back to a caller that must check it. With Programming to Exceptions, a placement exception propagates to the boundary handler without success checks between calls. Both panels leave fulfillment, email, completion recording, and the placement result unreached after placement fails." width="1254" height="1254" loading="lazy" decoding="async" />
  <figcaption>The same order placement written both ways. Return values need a check after every call. With Programming to Exceptions, a failure to place the order goes straight to the boundary handler, which is the middleware in a web API, and none of the remaining steps run.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/order-placement-comparison.webp">Open full-size order-placement comparison</a></p>
</figure>
<!-- diagram:end order-placement-comparison -->

When you program to exceptions, this is what happens across the whole system:

- Success checks after method calls disappear. There is nothing to check.
- `null` checks disappear. Methods that promise a value return a real one.
- Guard clauses at the top of internal methods disappear. The doors handle that.
- try/catch blocks disappear, apart from the entry point and the few catches that really change the outcome.

What remains is the business logic. Conditionals that express business rules stay, because they are the point of the code. Everything else that remains is the happy path.

That sounds too good, so it's fair to ask where the unhappy path went. It still exists. It lives in exactly two places: the `throw` at the point where a problem is detected, and the catch at the entry point. You write each failure once, where it happens, and you translate it once, where someone is waiting for an answer. Everything in between is code for the case where things work, because that's the only case where those methods have anything to do.

This changes how you operate a system, too. I tell teams: if I hear nothing from the system, nothing failed. I don't need to search the logs to reassure myself that each method did its job. If a method couldn't keep its contract, it threw, and the failure reached the entry point and was logged. Silence means success.

That only holds if the rules hold everywhere. One catch block that swallows an exception breaks the guarantee for every caller above it.

## Specific exceptions are your friends

Once exceptions carry your system's failures, the exceptions themselves deserve some design.

Don't throw generic exceptions such as `Exception` or `InvalidOperationException`. Throw specific ones that you define. A mature system can have hundreds of them. Typically, each exception type is thrown in exactly one place in the entire codebase.

That sounds like a lot of classes. They cost almost nothing. The base classes carry the shared behavior, so a specific exception only supplies its constructor, a short stable reason, the kind of action that fixes it, and its HTTP status when that differs from its branch's default:

```csharp
public sealed class CustomerRetrievalNotFoundException : MeridianOrderingBusinessException
{
    public CustomerRetrievalNotFoundException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, logEvent, context, innerException) { }

    public override string Reason => "Customer does not exist";
    public override ExceptionAction Action => ExceptionAction.UserActionRequired;
    public override HttpStatusCode HttpStatusCode => HttpStatusCode.NotFound;
}
```

The value is in the name. When you see `CustomerRetrievalNotFoundException` in a log, you know what happened without reading the message. Because it is thrown in one place, you also know where it came from.

This applies even to failures that look identical. If the system retries calls to two different services, I don't share one `RetryExhaustedException` between them. I have `ConfirmationEmailRetryExhaustedException` and `FulfillmentNotificationRetryExhaustedException`. When one shows up in the logs, there's no investigation needed to find out which service is in trouble.

The exceptions sit in a shallow hierarchy, usually three levels of your own classes:

```text
System.Exception
└── MeridianOrderingException                    abstract
    ├── MeridianOrderingBusinessException        abstract
    │   ├── CustomerRetrievalNotFoundException
    │   ├── CustomerAlreadyRegisteredException
    │   ├── CustomerNotActiveException
    │   ├── CustomerRegistrationRequestValidationException
    │   └── UnknownProductsException
    └── MeridianOrderingTechnicalException       abstract
        ├── ConfirmationEmailRetryExhaustedException
        ├── FulfillmentNotificationRetryExhaustedException
        └── OrderStoreUnavailableException
```

(Define your own base class and name it for your application; this one belongs to an ordering application called Meridian Ordering. Derive it from `System.Exception`. Don't derive from .NET's `System.ApplicationException`, which Microsoft recommends against.)

The two branches mean very different things.

A **business exception** means the system did exactly what it was designed to do. A business rule prevented the request, and the system refused it and explained why. There is no defect to fix. The caller reads the message and decides what to do next.

A **technical exception** means something broke: a service was unreachable, or retries ran out. Someone on your side may need to look at it.

Any exception that isn't one of yours is a third kind of signal. An unexpected `NullReferenceException` or `IndexOutOfRangeException` reaching the entry point means there is a bug in the code. In a system that follows these rules, those should be rare, and each one is worth investigating.

That is why each branch carries a default HTTP status. A business exception defaults to 400 Bad Request with its message, and a technical exception defaults to 500. A specific exception such as `CustomerRetrievalNotFoundException` overrides its branch when the API needs a different status. Exceptions the application didn't define reach the middleware's generic 500. [Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) develops this hierarchy, the context each exception carries, and how the entry point uses it.

So treat exceptions as friends, not enemies. In this design, most exceptions you see in a running system are ones you threw on purpose. Each one is the system telling you, by name, about a condition it was designed to recognize.

<span id="exceptions-for-failure-ordinary-answers-for-ordinary-questions"></span>
<span id="frequency-does-not-define-the-contract"></span>
<span id="performance-follows-the-workload"></span>

## Objections you're probably having

**"Exceptions are for exceptional situations."**

This is the most common objection, and it sounds like it is about frequency: throw only for things that rarely happen. But frequency is the wrong test. The right test is whether the method can keep its promise.

Take login. Wrong passwords happen all the time. But a login command promises to sign the user in. With the wrong password, it can't keep that promise, so it throws a specific exception, and the entry point turns that into the right response. How often that happens doesn't change what the method promised.

Compare that with parsing a quantity a user typed. Text that isn't a number is an ordinary, expected answer to the question "is this a number?" That's why `int.TryParse` exists. Its promise includes a "no." The question to ask is always: what does this method promise, and is a negative answer part of that promise?

**"Isn't this just hidden control flow, like goto?"**

An exception only travels in one direction: up the call stack, to a catch you placed deliberately. In this design, that is nearly always the single catch at the entry point. That is less hidden than a `false` value that may or may not be checked at each of five levels.

The real misuse is different: provoking an exception on purpose to answer an ordinary question. This is the wrong way to read a quantity:

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

The method was built to answer the question, so use it:

```csharp
public static bool TryReadQuantity(string input, out int quantity)
{
    return int.TryParse(input, out quantity);
}
```

The same mistake shows up when an existence check calls a throwing retrieval method and catches the exception to return `false`. Give `CustomerExists` its own lookup that asks the store directly. Don't manufacture a failure to answer a yes-or-no question.

Microsoft documents this as the [Try-Parse pattern](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/exceptions-and-performance). A `Try` method has one specifically defined negative outcome, which it reports with `false`. It still throws for anything outside that outcome. A `TryGetCustomer` can return `false` when the customer doesn't exist, and still throw when the database connection fails.

**"Exceptions are slow."**

Throwing and catching an exception does cost more than returning a value. That cost is paid only when something fails, and in most business code it is small next to a database call or a network request. Where a negative answer is frequent and on a hot path, such as parsing large volumes of input, use the Try method designed for it. Measure your real workload if it matters.

Don't weaken every contract in the system because exceptions might be expensive. Return codes have costs too: checks on every call, failures that go unnoticed, and problems that take hours to diagnose because the reason was thrown away three layers ago.

**"Why not return a Result type?"**

A `Result<T>` with a success flag and an error is a well-organized return code. It is better than a bare `bool`, because it carries the reason. But the caller still has to check it, and if it can't deal with the failure, it has to return its own `Result` to its own caller. The bucket brigade is still there, just with a nicer bucket. C# does nothing to stop a caller from ignoring it.

Some languages build error propagation into their syntax. In C#, the built-in mechanism for propagating a failure to the code that can deal with it is the exception. Programming to Exceptions uses it instead of rebuilding it by hand.

<span id="cleanup-has-an-owner"></span>

## Limits

These rules simplify the code. They don't make every problem go away.

**Exceptions don't undo side effects.** If the order was saved and the confirmation email then fails, the order is still saved. An exception stops the work that hasn't happened yet. It doesn't reverse the work that has. Transactions, idempotency, and an explicit recovery policy decide what happens to work that was already done. The article [Refusals, Failures, and Work Still Owed](/writing/refusals-failures-and-work-still-owed/) covers this.

**Cleanup still has an owner.** Letting an exception propagate doesn't excuse leaking resources. The code that acquires a resource releases it, using `using`, `await using`, or `try/finally`:

```csharp
public async Task WriteExportAsync(string path, byte[] content)
{
    await using var fileStream = new FileStream(path, FileMode.Create, FileAccess.Write);

    await fileStream.WriteAsync(content);
}
```

If the write fails, the stream is still disposed as the exception leaves the method, and the exception carries on to the entry point. None of this pretends to recover from the failure. The C# documentation describes these [exception-handling and cleanup statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements).

Code that owns a transaction has a legitimate reason to catch: roll back the work, then rethrow with `throw;`, which preserves the original stack trace. If the transaction's disposal already rolls back uncommitted work, rely on that instead.

**Validation is true at the moment it runs.** A customer who was active when the request was validated might not be active by the time you write to the database. Rules that depend on shared, changing data have to be enforced where that data lives, often with a transaction or a database constraint. That is exactly where the duplicate-key violation earlier came from, and why translating it was the right response.

## What's next

This part covered the contracts that make Programming to Exceptions work: action methods that do their work or throw, query methods that return what they promise or don't return, one catch at the entry point, and locked doors so the code inside can trust its data.

[Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) follows the exception outward: the full hierarchy, the information each exception carries, and how the entry point turns it into a useful log entry and a useful response. [Programming to Exceptions, Part 3: Logging and Progress](../programming-to-exceptions-logging-and-progress/) covers structured logging and progress reporting.
