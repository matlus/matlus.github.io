---
title: "Programming to Exceptions, Part 2: Diagnostics and Boundaries"
description: "One log record should explain a failure to the support team. Exceptions carry a message, reason, action and context, are translated where meaning is known, and are logged once."
datePublished: 2019-10-28
dateModified: 2026-10-02
tags: ["error-handling", "structured-logging", "class-design", "architecture", "csharp"]
draft: false
hero: programming-to-exceptions-diagnostics-and-boundaries
youtube: "https://www.youtube.com/watch?v=5IKczyor-f4"
---

[Programming to Exceptions, Part 1: Method Contracts and Failure](../programming-to-exceptions-method-contracts/) ended with a failure arriving at the entry point. A method couldn't keep its promise, so it threw. The exception traveled up the call stack without anyone checking for it, and the middleware caught it, logged it, and sent the caller a response.

This part looks at what that exception should carry when it arrives.

Here is the test I use. Someone on the support team opens the log and finds one failure. Can they tell what happened, where it happened, and what to do about it, from that one record, without calling the developer who wrote the code? If they can't, the system isn't finished. The information they need has to be captured somewhere, and the best place to capture it is in the exception itself.

We'll build that one step at a time:

1. A quick recap of the exception hierarchy from Part 1.
2. The message, written for the person who has to act on it.
3. The handful of facts every exception carries.
4. Contextual data: capturing the facts where the failure happens, and adding to them on the way up.
5. Translating a failure where you understand what it means.
6. The entry point, in full.
7. What each kind of failure asks of the people running the system.
8. Carrying a failure across several services, all the way back to the UI.

<span id="a-shallow-hierarchy-with-specific-leaves"></span>
<span id="business-and-technical-describe-responsibility"></span>

## Step 1: The hierarchy, briefly

Part 1 introduced the exception hierarchy. Here it is again, because everything in this part hangs off it:

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

The application has one base class, named for the application. Below it are two abstract branches: business exceptions, where a business rule refused the request, and technical exceptions, where something broke. Below those are the specific exceptions you actually throw.

Two rules shape the bottom row. Each specific exception describes one failure, and it is thrown in one place. When you see `CustomerRetrievalNotFoundException` in a log, you already know which operation failed and where to look, before you read a word of the message. A type called `ValidationException` or `TimeoutException` could have come from anywhere.

A real system ends up with a lot of these, often a hundred or more. That's fine. The hierarchy stays shallow and wide: three levels of your own classes, with many specific exceptions at the bottom. You never throw the base class or the branches. They exist to hold what the specific exceptions have in common.

<span id="write-the-message-for-the-person-who-must-act"></span>

## Step 2: Write the message for the person who must act

The message is the first thing anyone reads, so start there.

"Payment plan validation failed" tells you the category of the problem and nothing else. Which payment plan? Which rule? What should the user do now? Compare it with this:

> Payment plan amount $5,000 exceeds the $3,000 limit for Basic accounts. Premium accounts allow up to $10,000. Choose an amount within your account's limit or change the account tier.

That message names the value that was received, the rule it broke, and the ways to fix it. A good message almost always has those three parts:

> First name 'AlexandertheGreat' has 17 characters. Enter a first name with 1 to 15 characters.

When the valid choices are a small, fixed set, list them:

> Genre 'Sci-fi' is not supported. Possible values are Action, Comedy, Drama, and Science Fiction.

Including the value you received does something else, too. It shows whether the system received what the caller thinks they sent. More than one "impossible" bug has turned out to be a value that was changed somewhere between the UI and the server.

Write the message where you throw, because that's where you have the values. The method that knows the first name is 17 characters long is the one that throws, so it's the one that can say so.

If someone on your team can't understand a failure from its message, fix the message. Nobody should need a developer's private knowledge to understand what went wrong.

<span id="the-base-exceptions-diagnostic-contract"></span>
<span id="the-application-base"></span>
<span id="branch-defaults-and-a-concrete-failure"></span>

## Step 3: What every exception carries

The message explains one occurrence of a failure. The people and tools that deal with failures need a few more facts, and every exception in the application should carry them. That's the job of the base class.

Here are the parts of `MeridianOrderingException` that matter for this discussion. The complete class does more, but these are the pieces you need to understand the design:

```csharp
public abstract class MeridianOrderingException : Exception
{
    protected MeridianOrderingException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, innerException)
    {
        LogEvent = logEvent;
        ContextualData = context ?? new ContextualData();
    }

    public LogEventBase LogEvent { get; }
    public ContextualData ContextualData { get; }
    public abstract string Reason { get; }
    public abstract ExceptionAction Action { get; }
    public abstract HttpStatusCode HttpStatusCode { get; }
    public virtual Severity Severity => Severity.Error;

    public void AddContextualData(ContextualData contextualData) => ContextualData.Merge(contextualData);
}
```

Let's take those one at a time.

**The message** comes from `Exception` itself. It's the explanation of this particular occurrence, written as Step 2 describes.

**The reason** is short and stable, such as "Customer does not exist." Every occurrence of the exception has the same reason, while the messages differ. Tools and dashboards group by the reason. People read the message.

**The action** says what kind of response the failure needs:

```csharp
public enum ExceptionAction
{
    UserActionRequired,
    RetryActionNeeded,
    InfraActionRequired,
    DeveloperActionRequired,
    NoActionNeeded
}
```

`UserActionRequired` means the caller has to change something, such as supplying a customer that exists. `RetryActionNeeded` means trying again later may work. `InfraActionRequired` means someone has to repair infrastructure. `DeveloperActionRequired` means there's a defect in the code. Your application can add its own values as it needs them. An action never retries anything by itself. It tells the people and tools reading the log what kind of problem they are looking at.

**The log event** names the operation that failed, as a stable value:

```csharp
public sealed class CustomerLogEvent : LogEventBase
{
    public static readonly CustomerLogEvent GetCustomer = new("GetCustomer");
    public static readonly CustomerLogEvent RegisterCustomer = new("RegisterCustomer");

    private CustomerLogEvent(string value) : base(value) { }
}
```

With a log event, you can ask the logs for every failure in `GetCustomer` without searching through message text.

**The HTTP status** is the response the failure should produce. The application's own code doesn't depend on ASP.NET to carry it, because `HttpStatusCode` is a plain .NET enum. The entry point reads it when it writes the response.

**The severity** defaults to `Error`. A specific exception can raise or lower it when that failure deserves more or less attention.

**The inner exception** also comes from `Exception`. When you translate one exception into another, the original goes here, with its own message and stack trace. Step 5 shows this.

**Contextual data** gets a step of its own, next.

Most of these facts belong to the exception type, not to the place it's thrown. So the branches supply sensible defaults, and the specific exceptions fill in the rest:

```csharp
public abstract class MeridianOrderingBusinessException : MeridianOrderingException
{
    protected MeridianOrderingBusinessException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, logEvent, context, innerException) { }

    public override HttpStatusCode HttpStatusCode => HttpStatusCode.BadRequest;
}

public abstract class MeridianOrderingTechnicalException : MeridianOrderingException
{
    protected MeridianOrderingTechnicalException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, logEvent, context, innerException) { }

    public override HttpStatusCode HttpStatusCode => HttpStatusCode.InternalServerError;
}
```

A business exception defaults to 400 Bad Request. A technical exception defaults to 500 Internal Server Error. A specific exception overrides that default only when its API needs something different:

```csharp
public sealed class CustomerRetrievalNotFoundException : MeridianOrderingBusinessException
{
    public CustomerRetrievalNotFoundException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, logEvent, context, innerException) { }

    public override string Reason => "Customer does not exist";
    public override ExceptionAction Action => ExceptionAction.UserActionRequired;
    public override HttpStatusCode HttpStatusCode => HttpStatusCode.NotFound;
}

public sealed class ConfirmationEmailRetryExhaustedException : MeridianOrderingTechnicalException
{
    public ConfirmationEmailRetryExhaustedException(string message, LogEventBase logEvent, ContextualData? context = null, Exception? innerException = null) : base(message, logEvent, context, innerException) { }

    public override string Reason => "Email service too busy";
    public override ExceptionAction Action => ExceptionAction.RetryActionNeeded;
}
```

Notice what the specific exceptions don't do. They don't build their own messages. The message changes with every occurrence, so it comes from the place that throws. The reason, the action and the status are the same every time, so the class supplies them. Notice, too, that the base class's constructor requires a log event. Nobody can create one of these exceptions and forget to say which operation failed.

<span id="values-that-can-be-recorded-predictably"></span>

## Step 4: Contextual data

The message tells a person what went wrong. Contextual data records the facts they'll need to investigate it, and often to reproduce it: the inputs the method received, the values it was working with, and the identifiers of the things involved.

### Capture it where you throw

The best time to capture those facts is the moment you throw, because that's when you have them. Once the method has thrown, its local variables are gone.

Here is the email gateway, the class that talks to the email service, at the point where it gives up. It has retried, as Part 1 described, and the service is still too busy:

```csharp
throw new ConfirmationEmailRetryExhaustedException($"The email service was still too busy after {attemptCount} attempts. The confirmation email was not sent.", EmailLogEvent.SendConfirmationEmail, new ContextualData { { "Email.TemplateName", confirmationEmail.TemplateName }, { "EmailService.AttemptCount", attemptCount }, { "EmailService.LastStatusCode", (int)httpResponseMessage.StatusCode } });
```

Look at where each fact comes from. `confirmationEmail` is the method's input argument. `attemptCount` is a local variable. `httpResponseMessage` is the last response the service sent back. The gateway records all three, because when someone investigates this failure later, those are exactly the facts they'll want, and nobody else has them.

Give the keys consistent names across the application, such as `Customer.Id`, `Order.Reference` and `EmailService.AttemptCount`. When every exception that involves an order records it as `Order.Reference`, you can search the logs for one order and find every failure it was part of.

Leave credentials out of contextual data entirely. Personal information is a separate case, because sometimes it's what you need to understand the failure. The entry point redacts it before anything is logged, as Step 6 shows.

### Add to it on the way up

There's a gap in that throw. The gateway sends emails. It doesn't know which order this email was confirming. That isn't a flaw in the gateway. It was given a `ConfirmationEmail` to send, and it shouldn't need to know anything about orders.

The method that asked for the email does know. It composed the email from an order, so it has the order reference right there. It can add the order reference to the exception's contextual data as the exception passes through, and then let it keep going:

```csharp
private async Task SendConfirmationEmailAsync(OrderPlacementResult orderPlacementResult)
{
    ConfirmationEmail confirmationEmail = ComposeConfirmationEmail(orderPlacementResult);
    try
    {
        await _gatewayEmailService.SendAsync(confirmationEmail);
    }
    catch (MeridianOrderingException meridianOrderingException)
    {
        meridianOrderingException.AddContextualData(new ContextualData { { "Order.Reference", orderPlacementResult.OrderReference } });
        throw;
    }
}
```

This catch adds the order reference to the contextual data and rethrows, and that's all it does. `throw;` on its own rethrows the same exception object with its original stack trace, so nothing about where the failure started is lost. The exception continues up the call stack to the entry point, exactly as it would have without the catch. It just arrives knowing which order it belonged to.

Don't mistake this for handling the exception. Nobody handles `ConfirmationEmailRetryExhaustedException`. The gateway threw it on purpose, and from that moment it's on its way to the entry point. The method that adds the order reference didn't throw it and isn't trying to recover from it. While the exception passes through, it adds contextual data that will help someone understand the problem, debug it and reproduce it. Step 5 looks at what handling really means.

I ran into this all the time in a document-processing system. Code deep inside the system would find a problem with a page or a field, and it had no idea which document it was working on. It didn't need to. A few levels up, the code that had picked up the document knew its name and type. That's where we added them, and then let the exception carry on.

This isn't something every method does, and it's not a rule you have to follow. Most methods never catch anything, as Part 1 said. When you're deciding whether to add a catch like this, ask yourself one question: when this exception shows up in the log, what will I need to know to understand the problem and reproduce it? If a method up the call stack has some of that information and the throwing code doesn't, that method is the place to add it. Otherwise, leave the exception alone.

<span id="translate-where-you-understand-the-external-failure"></span>

## Step 5: Translate where you understand the failure

<span id="meaningful-handling-changes-the-outcome"></span>
<span id="preserve-every-failure-from-concurrent-work"></span>

### What handling means

The word "handling" gets used loosely, so it's worth being precise about it.

You handle an exception at the first catch: the first place your code meets an exception it didn't throw. A database driver, a file API or a third-party SDK has thrown its own exception, in its own vocabulary, and your code catches it. That catch is your one chance to handle it, and handling means doing something that changes the outcome. You can translate it into one of your own exceptions, so the rest of the system understands what happened. You can retry, when waiting and trying again might succeed. You can roll back work you own before letting the failure continue.

Once your code throws one of its own exceptions, there's nothing left to handle. It was thrown on purpose, it says what went wrong, and it travels to the entry point. A method that catches it on the way up, as in Step 4, is augmenting it: adding contextual data that will help someone understand the problem, debug it and reproduce it. That's worth doing, but it doesn't change the outcome, so it isn't handling.

Plenty of catch blocks look like handling and aren't. The most common is catch, log and rethrow, and it rarely happens just once. I've seen call chains six levels deep where every method catches the exception, logs it and throws it again. The same failure ends up in the log six or seven times, and none of those copies adds anything. Ask why, and the answer is usually: "I don't know if somebody logged it before me, and I don't know if somebody will log it after me, so I'm logging it." That's the wrong reason. In this design, the answer is known: the entry point logs every failure, once.

Swallowing an exception isn't handling either. Neither is catching one and returning `false`, `null` or an error code. None of these changes the outcome, and the last two hide the failure.

### Translating a database failure

Translation is the most common way to handle an exception. Part 1 showed one case: a duplicate-key error from SQL Server, translated into `CustomerAlreadyRegisteredException`.

Part 1 also said that a missing product could be left to the database. The foreign key on the order's line items rejects any product that doesn't exist, and the data access code translates that rejection. Here is that translation:

```csharp
public async Task SaveOrderAsync(OrderPlacementRequest orderPlacementRequest)
{
    try
    {
        await _sqlConnection.ExecuteAsync(InsertOrderSql, orderPlacementRequest);
    }
    catch (SqlException sqlException) when (sqlException.Number == 547 && sqlException.Message.Contains("FK_OrderLineItems_Products"))
    {
        throw new UnknownProductsException($"Order '{orderPlacementRequest.OrderReference}' names one or more products that don't exist. Check the product IDs and submit the order again.", OrderPlacementLogEvent.SaveOrder, new ContextualData { { "Order.Reference", orderPlacementRequest.OrderReference }, { "Order.ProductIds", string.Join(",", orderPlacementRequest.LineItems.Select(orderPlacementLineItem => orderPlacementLineItem.ProductId)) }, { "OrderStore.Error", sqlException.Message } }, innerException: sqlException);
    }
}
```

Why translate at all? A `SqlException` with error number 547 is cryptic, and it's specific to SQL Server. If it escaped the data access code, every method above it would need to understand SQL Server's error numbers to know what went wrong. That's a leaky abstraction: a detail of how one class does its work leaking into the rest of the system. Translated, the rest of the system sees `UnknownProductsException`, which says what happened in words anyone can read.

Translation also protects you from change. Suppose you move to a different database tomorrow. The new database reports a missing product with a different error, so the catch inside the data access code changes. But the same scenario still throws the same `UnknownProductsException`, and nothing above the data access code has to change at all.

Three things make this a good translation.

**It's narrow.** SQL Server reports error 547 for any constraint violation, so the filter also checks which constraint failed. Every other database error passes through untouched.

**It happens where the meaning is known.** The data access code knows that this particular constraint means "unknown product." The code above it doesn't know that, and shouldn't have to.

**It keeps the original.** The `SqlException` goes in as the inner exception, with its stack trace, and its message is recorded in the contextual data. Nothing the database said is lost.

The same exception can mean different things in different places. A missing file might mean "no such customer" in one store and "the storage is broken" in another. Translate it in the place that knows which one it is.

Translate once, too. Don't wrap an exception at every level just because it passed through. Once it's one of yours, it already says what it means, and the methods above it should let it go by.

<span id="the-outer-boundary-records-and-translates"></span>
<span id="one-diagnostic-record-with-the-relevant-facts"></span>

## Step 6: The entry point, in full

Part 1 showed a simple version of the middleware and listed the four things the full version does: add the request's input data, redact personal information, log the failure, and translate it into a response. Here is the full version:

```csharp
public sealed class ExceptionHandlingMiddleware(RequestDelegate requestDelegate, RequestDiagnostics requestDiagnostics, PersonalDataRedactor personalDataRedactor, ExceptionLogger exceptionLogger, HttpErrorTranslator httpErrorTranslator)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await requestDelegate(httpContext);
        }
        catch (MeridianOrderingException meridianOrderingException)
        {
            meridianOrderingException.AddContextualData(requestDiagnostics.CaptureRequestData(httpContext));
            DiagnosticRecord diagnosticRecord = personalDataRedactor.Redact(meridianOrderingException);
            exceptionLogger.Log(diagnosticRecord);
            await httpErrorTranslator.WriteAsync(httpContext, meridianOrderingException);
        }
        catch (Exception exception)
        {
            DiagnosticRecord diagnosticRecord = personalDataRedactor.Redact(exception, requestDiagnostics.CaptureRequestData(httpContext));
            exceptionLogger.LogUnexpected(diagnosticRecord);
            await httpErrorTranslator.WriteUnexpectedFailureAsync(httpContext);
        }
    }
}
```

There are now two catches, one for each kind of failure that can arrive.

**The first catch is for the application's own exceptions.** These are failures the system was designed to recognize, so they carry everything from Steps 2 to 4. The middleware adds the one thing nobody deeper in the call stack had: the request itself, including its path, its correlation identifier and the input fields you've decided are safe to record. Then the redactor removes personal information from the message and the contextual data, the logger writes the record, and the translator writes the response using the exception's status code and message.

**The second catch is for everything else.** A `NullReferenceException`, an `IndexOutOfRangeException`, or any other exception the application didn't define. Nothing in the code expected it, so it's a bug until you find out otherwise. The middleware still records the request data, so there's something to investigate, but the caller gets a plain 500 with a generic message. Internal details of a bug don't belong in a response.

Each collaborator is a small class with one job. `RequestDiagnostics` knows which parts of a request are worth recording. `PersonalDataRedactor` knows what personal information looks like in this application. `ExceptionLogger` writes to wherever your logs go, and [Programming to Exceptions, Part 3: Logging and Progress](../programming-to-exceptions-logging-and-progress/) covers that. `HttpErrorTranslator` turns a failure into a response. None of them needs to know anything about orders or customers.

<!-- diagram:start exception-middleware-enrichment -->
<figure id="exception-middleware-enrichment" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/exception-middleware-enrichment.webp" alt="Exception-handling middleware surrounds a domain operation. A request enters the domain operation, and an exception propagates out of it to Catch escaping exception. From there, one path runs through Add request data, which also receives the request data, then Redact personal data, then Diagnostic log. A second path takes the exception to Translate to HTTP response, which sends a status code for a known failure or 500 for an unexpected one to the caller outside the middleware." width="1821" height="864" loading="lazy" decoding="async" />
  <figcaption>The middleware catches the exception, adds the request data, removes personal information and logs one record. Separately, it translates the exception into the response the caller sees.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/exception-middleware-enrichment.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end exception-middleware-enrichment -->

Now look at what reaches the log when the confirmation email fails. This is the record from Step 4's failure, after the order placement method added the order reference and the middleware added the request:

```json
{
  "ApplicationName": "MeridianOrdering",
  "ExceptionType": "ConfirmationEmailRetryExhaustedException",
  "Message": "The email service was still too busy after 4 attempts. The confirmation email was not sent.",
  "Reason": "Email service too busy",
  "Action": "RetryActionNeeded",
  "LogEvent": "SendConfirmationEmail",
  "Severity": "Error",
  "HttpStatusCode": 500,
  "Email.TemplateName": "OrderConfirmation",
  "EmailService.AttemptCount": 4,
  "EmailService.LastStatusCode": 429,
  "Order.Reference": "ORD-20261102-0042",
  "Request.Method": "POST",
  "Request.Path": "/orders",
  "Request.CorrelationId": "7f3c9a1e"
}
```

Read it as the person on the support team would. Which operation failed? Sending the confirmation email. Why? The email service kept answering 429 Too Many Requests, four times. What kind of problem is it? A retry later should work. Which order? `ORD-20261102-0042`. Which request? A `POST` to `/orders`, with a correlation identifier that ties it to everything else that request did.

That's the test from the beginning of this article, passed. One record, and nobody had to call a developer. Three different places contributed to it: the gateway that threw, the method that added the order reference, and the middleware that added the request. Each one recorded what only it knew.

<span id="which-failures-need-attention"></span>
<span id="turn-an-unexpected-failure-into-an-explicit-contract"></span>

## Step 7: What each kind of failure asks of you

The hierarchy also changes how you run the system. Each kind of failure that reaches the entry point asks something different of the people watching it.

**A business exception asks nothing of you.** The system did exactly what it was designed to do. A rule refused a request, and the caller got a message explaining why. There's no defect to fix. Whoever made the request, a user or another service, reads the message and decides what to do next. Seeing business exceptions in the log is no reason to add try/catch blocks anywhere.

**A technical exception asks for attention when it repeats.** A service timed out, or retries ran out. One occurrence usually doesn't need anyone. There's only so much the application can do about a service that's down, and the next request may succeed. But if `ConfirmationEmailRetryExhaustedException` shows up fifty times in ten minutes, something is wrong with the email service. So set alerts on specific exception types, triggered when one occurs more often than you've agreed it should within a given period. The specific type tells you which service is in trouble before you open a single record. Part 3 shows how these records become searchable in Application Insights.

**An unexpected exception asks you to find a bug.** Anything the application didn't define, caught by the middleware's second catch, means the code did something nobody designed it to do. Treat each one as a bug until you find out otherwise. Then fix the cause. Usually that means adding a missing check at one of the doors from Part 1, or translating a vendor exception in the place that understands it, as in Step 5. Wrapping the bug in a custom exception without fixing its cause only hides it.

Put together, this is why I can tell a team that silence means success. Every business refusal is reported to the person who can act on it. Every technical failure is recorded with the facts to diagnose it, and repeated ones raise an alert. Every bug arrives as an unexpected exception that asks to be fixed. Nothing fails quietly.

<span id="carry-the-failure-chain-across-services"></span>

## Step 8: Carry the failure across services

So far, everything has happened inside one application. Most systems today are several services calling each other, and that's where this design pays off the most.

Picture a UI application that calls service A. Service A calls service B, and service B calls service C. Something fails in C.

In many systems, here's what the person investigating sees. The UI log says the request to A failed. A's log says the call to B failed. B's log says the call to C failed. C's log, if they can find it, has the actual failure. Four logs, often owned by four teams, and someone has to line them up by timestamp to piece together one story.

Now follow the same failure through services that each use the entry point from Step 6.

1. **C throws.** Its middleware adds the request it received from B, and logs the failure locally if C keeps its own log. Then it sends back an error response that contains the whole diagnostic record: the exception type, message, reason, action, contextual data and request.
2. **B receives C's error response.** The class in B that calls C reads that record. It throws one of B's own exceptions, which says in B's terms what went wrong, and attaches C's record to it, unchanged. It also adds what B was trying to do and what it sent to C.
3. **B's middleware catches it.** It adds the request B received from A and sends back B's record, with C's record nested inside.
4. **A does the same.** It keeps B's record, which already contains C's, and adds its own.
5. **The UI receives the whole chain** and writes it to its own log.

<!-- diagram:start service-failure-diagnostic-chain -->
<figure id="service-failure-diagnostic-chain" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/service-failure-diagnostic-chain.webp" alt="Requests travel from a UI through services A and B to C. A failure at C returns over HTTP; B and A each retain the downstream failure record inside their own enriched record. The UI's main log contains the complete A, B, C diagnostic chain." width="1821" height="864" loading="lazy" decoding="async" />
  <figcaption>C supplies the original failure record. B and A each keep the record they received and add their own facts around it. The UI receives the whole chain and records it in its log.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/service-failure-diagnostic-chain.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end service-failure-diagnostic-chain -->

Here is a trimmed version of what the UI's log holds. Each record keeps the one it received under `DownstreamFailure`:

```json
{
  "Service": "A",
  "ExceptionType": "OrderServiceRequestFailedException",
  "Message": "The order service could not place order 'ORD-20261102-0042'.",
  "Request.Path": "/checkout",
  "DownstreamFailure": {
    "Service": "B",
    "ExceptionType": "InventoryServiceRequestFailedException",
    "Message": "The inventory service could not reserve stock for order 'ORD-20261102-0042'.",
    "Request.Path": "/orders",
    "DownstreamFailure": {
      "Service": "C",
      "ExceptionType": "WarehouseStoreUnavailableException",
      "Message": "The warehouse store did not respond within 30 seconds.",
      "Reason": "Warehouse store unavailable",
      "Action": "InfraActionRequired",
      "Warehouse.Id": "WH-07",
      "Request.Path": "/reservations"
    }
  }
}
```

Read it from the outside in, and you have the whole story in one place. The checkout failed because the order service couldn't place the order. The order service failed because the inventory service couldn't reserve stock. The inventory service failed because warehouse store `WH-07` didn't respond, and that needs someone to look at the infrastructure. Every service along the way said what it was doing and what it received, in its own words.

That's the advantage. Whoever is looking at the UI's log, or at any service at the top of a call chain, can see exactly what happened and where, without collecting logs from four services and lining them up. The record that explains the failure traveled back with the failure. It's especially valuable in a microservices system, where a single user action can pass through many services and the services are often owned by different teams.

A few things keep the chain trustworthy:

- **Each service records its own name.** The failure started in C. A must not look like the origin just because A sent the last response.
- **Each service keeps the record it received unchanged.** It adds its own facts around that record, and never edits the record itself.
- **Every service passes along the same correlation identifier.** That ties the chain to everything else the original request did.
- **The UI decides what to show the user.** It logs the whole chain, but the person at the screen sees only the business explanation, such as "We couldn't place your order. Please try again in a few minutes."

The mechanics are the same steps you've already seen. Each service throws specific exceptions with context (Steps 3 and 4), translates the failure it received into its own terms while keeping the original (Step 5), and lets its middleware add the request and respond (Step 6). The only addition is that the error response carries the record, so the next service up has something to keep.

<span id="application-insights-custom-dimensions"></span>

## What's next

This part followed a failure from the place it was detected to the log and the response. The message speaks to the person who has to act. The exception carries a reason, an action, a log event, a status, and contextual data captured where the failure happened. Methods higher up the call stack add what only they know. Failures from other code are translated where their meaning is understood. The entry point adds the request, redacts, logs and responds, and across services the whole chain comes back to the top.

[Programming to Exceptions, Part 3: Logging and Progress](../programming-to-exceptions-logging-and-progress/) picks up from the log record: what to log and where, how to make these records searchable in Application Insights, and how to report progress for work that takes a long time.
