---
title: Validation and Exception Handling
description: >-
  Where validation belongs and where it does not, exception design that fails fast and visibly, message quality, and logging that preserves the failure.
datePublished: 2017-09-20
dateModified: 2026-09-19
tags:
  - error-handling
  - csharp
  - architecture
section: pwi
topic: validation-exception-handling
language: csharp
pillar: programming-to-exceptions
---

> **PWI responsibility boundary:** The organizational review lens owns
> validation placement, gateway translation, structured diagnostic context,
> exception taxonomy, catch-site authorization including swallowing, and centralized boundary logging. Gateway Design (`cs14`)
> owns preserving the caught cause when a Gateway transforms a provider or
> transport exception. Native language review owns mechanical constructor/throw
> correctness, generic catch mechanics, and concurrent-exception
> mechanics (`AggregateException`, un-awaited tasks).

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Lock the front door, lock the back door so you're safe in the house"
- "Don't let the boogieman in"
- "Caveat emptor"
- "Fail fast and fail visibly"
- "Rule of thirds"

---

## Validation Philosophy - "Lock the Doors"

Validations should only occur at the entry points ("doors") of the system, not throughout the codebase:

**Front Door:**

- Domain boundaries where data enters the system
- NOT at the API layer

**Back Doors:**

- Service calls (Gateways) - validate responses and translate protocol errors to custom exceptions
- Configuration - use a Configuration provider that returns strongly typed values after validation

All validations should throw highly specific custom exception types with meaningful, useful messages. If a value has a finite set of possibilities, include that in the message. Always report the invalid value in the exception message.

Exceptions should carry detailed diagnostic data:

- Variable values
- Parameter values
- Step/stage where the issue occurred

Inside the system, avoid redundant validations - fix the root cause at the boundary.

**The C# door splits in two.** In a statically typed language the front door has two layers, and each has an owner in the current partial C# set:

- **Wire parsing and mapping** lives in the service interface layer and is owned by `cs55`, because the typed domain model physically cannot hold an unrepresentable wire value. A domain-owned parser may be reused to construct that domain type.
- **Business-rule validation** - lengths, ranges, duplicates, cross-field rules - lives in domain validators called by the Manager at the domain front door. It happens regardless of checks performed by a controller or any other host, because replacing the host must not remove a domain rule.

Type checks inside domain validators (`is string`, defensive casts) are a finding in C#: the compiler already locked that door.

[Intentional Model Design](/writing/intentional-model-design/) explains why the domain types passed through this door must state their required and optional fields honestly. [Clean Abstractions Around Libraries](/writing/clean-abstractions-around-libraries/) develops the Gateway, Data Manager, Configuration Provider, and message-broker seams that contain external values and failures.

**Models are never behavioral, and normalization is the Manager's first visible step.** An incoming request record initially holds exactly what arrived
- no trimming, no case folding, no canonicalizing in a constructor. A constructor that quietly rewrites its inputs is behavior nobody thinks to look at, and it hides a business rule: "blank counts as missing", "email identity is lowercase", "SKU identity is uppercase" are rules, so they are enacted where rules live - the Manager, as a named normalize step that produces a new pure-data request before anything validates, compares, or records it:

```csharp
public async Task RegisterCustomerAsync(CustomerRegistrationRequest customerRegistrationRequest)
{
    // The business rules for "provided" and for the email's recorded form are
    // enacted HERE, where they can be seen - the request model is pure data
    // holding exactly what arrived.
    var providedFormRegistrationRequest = NormalizeToProvidedForm(customerRegistrationRequest);

    ValidatorCustomerRegistrationRequest.Validate(providedFormRegistrationRequest);
    ...
}
```

Two consequences follow. Validators only report - they receive the normalized request, so they compare values directly instead of re-canonicalizing at every use site, and so does everything downstream (a resubmission comparison, a store write). And request models are preferably positional records: with no constructor body to hide behavior in, the normalize step becomes a `with` expression producing a new instance, and derive-with-changes comes free.

When reviewing structured logging and exception context, report only concrete failures in the current code path:

- Do not claim mutation/corruption of exception context unless you verify the code is mutating shared internal state rather than a defensive copy returned from a property or method.
- Do not report hypothetical secret leakage unless the current implementation actually emits, stores, or propagates the sensitive value.
- Do not escalate rare or contrived runtime edge cases unless they are realistic for the assembly boundary being reviewed.

---

## Exception Handling - "Fail Fast and Fail Visibly"

The case for exceptions starts with the weakness of the alternative. A return code is a signal the compiler never forces anyone to read: a caller can ignore it and the program marches on with bad data until the damage surfaces somewhere far from its cause. And when every call is followed by an error check, the checks become background noise woven through the happy path - background noise is exactly what a reader under deadline pressure filters out, and that is how a check gets missed. An exception cannot be missed. It stops the operation at the point of failure and does not let execution continue until something deliberately deals with it: the runtime enforces the acknowledgment the compiler never could.

Embrace exceptions for the value they bring rather than treating them as the enemy:

- Exceptions do not return. Throwing an exception means the current operation cannot fulfill its contract and cannot continue.
- Unless you can truly "handle" an exception (like retry logic), don't catch it
- Write only the happy path, letting exceptions propagate
- For specific errors (like database exceptions), catch, translate to custom exceptions with more useful business context, and rethrow
- Catch exceptions only in the designated outer boundary catcher. In ASP.NET Core that is exception middleware before the controller; the controller itself never catches.
- No logging of exceptions anywhere except that designated outer boundary catcher
- Use inheritance for exception hierarchies (one of the few places where inheritance is preferred)
- Create specific, non-generic exceptions rather than "reusable" exceptions
- Special handling may exist for "retries exhausted" exceptions that would be reattempted later

Action and Query method contracts are defined in the Method Design chapter. The exception layer supports those contracts: actions complete or throw, and queries return the claimed type or do not return at all.

### Meaningful Handling

Catching an exception is not handling it - it is only catching it. A codebase whose authors report "we handle exceptions everywhere" almost always means try/catch everywhere, and that is the evidence that nothing is being handled: the catches log and rethrow, or swallow, and the system goes quiet while not working as expected. In such a codebase the strongest first move is to remove the try/catches and watch what the system actually does - you cannot decide what deserves catching until the failures are visible.

Catches divide into two justified categories, and only the first is handling.

**True handling** resolves the failure - after the catch block runs, the operation continues or completes and there is nothing left to fail:

- Retrying a transient failure under a deliberate retry policy - a dropped connection, a 429 rate-limit response. A successful retry is the clearest case of actually handling an exception.
- Switching to a backup provider or fallback path when the business contract allows it
- Opening or respecting a circuit breaker to prevent cascading failures
- Absorbing a settled failure **by design** behind a durable pending record that a recovery process will replay, but only after the exact catch is accepted with `code-review: override[pwi.validation-exception-handling.csharp.catch-site-justification] - <developer-supplied reason>`. The review assistant never invents the reason. The accepted site logs at Information when the absorption is routine or Warning when it deserves operational notice.

**Justified catching that is still not handling** - the exception is still on its way out; the catch only improves it or delivers it:

- Catch-to-translate: converting a provider/SDK exception into a domain exception with a better message and richer context. A try/catch exists, but nothing was handled - a different, more meaningful exception is thrown in its place.
- The boundary catch: converting a domain exception into the API/UI/service response in the designated outer boundary component. In ASP.NET Core this is the middleware's job and the one place a catch is *expected*; controllers never catch.

Everything else - catching to log, catching to rethrow unchanged, catching to continue as if nothing happened, empty catch blocks - is neither. A pending record and an ordinary explanatory comment do not themselves authorize swallowing; the exact rule-specific override is required. If the current layer cannot take one of the actions above, do not catch the exception. Let it propagate with its context intact.

The review posture follows directly: **every catch site is a finding until it proves itself** as true handling or justified translation. ASP.NET Core controller catches are owned by the controller-specific rule, not reported again by the general catch rule. An unauthorized swallow is reported first; only after its exact occurrence is accepted does the separate absorption-logging rule consider visibility and severity. The expected homes for a catch are the boundary middleware, gateways (translation and retry), and almost nowhere else.

### Boundary Catch Strategy

For ASP.NET Core, the boundary catcher is exception middleware before the controller, never the controller action itself. The controller reads and converts the wire request, calls the domain once, composes the response, and lets every exception escape untouched; the service-boundary testing chapter (cs55) owns that service-boundary split. A non-HTTP host without middleware may put the same single catch at its outer adapter.

Boundaries are the catch sites for three reasons: **control** - a boundary is a choke point every failure passes through, so policy is applied once and consistently instead of being scattered through the core; **translation** - the boundary is where internal exception types are converted into the language the outside world speaks (status codes, headers, caller-safe messages); and **containment** - the failure is stopped at the edge instead of leaking stack traces to callers or cascading into neighboring systems.

At public system boundaries, translate exactly two failure categories:

1. The domain's base exception type. These are expected, first-class failure modes created by the system.
2. Unexpected exceptions. These are potential bugs or unclassified external failures and should be treated as critical/unexpected failures.

Host-signaled control flow is not a third failure category. In ASP.NET Core, `OperationCanceledException` accompanied by a cancelled `HttpContext.RequestAborted` means the caller ended the request. The middleware lets that cancellation propagate without logging a defect or attempting a 500 response. An `OperationCanceledException` without the request-aborted signal still flows through the unexpected branch unless an owning boundary translated it.

The boundary is where exceptions are logged, translated to API/UI/service responses, and enriched with the full input state that triggered the operation. Do not scatter logging throughout internal code.

Because there is exactly one logging boundary, there is exactly one place to **sanitize**: the boundary scrubs secrets, tokens, credentials, and sensitive payloads from exception context and request state before emitting the log. This is defense in depth - throw sites already keep secrets out of context data (see Exceptions as Reproduction Packages), and the boundary enforces it regardless of what an exception happens to carry.

In ASP.NET Core the boundary is exception-translation middleware registered ahead of the endpoints. The middleware catches, attaches request context, and writes the one log entry; an extracted `ExceptionToHttpTranslator` owns the status, headers, reason phrase, content type, and caller-safe body so that the complete translation table is class-tested without hosting a pipeline (the service-boundary testing chapter, cs55). The machine-readable answer travels in the response envelope - the status code plus `Exception-Type` and `Exception-Reason` headers a caller pivots on - and the body is caller-safe plain text:

```csharp
internal sealed class MiddlewareExceptionTranslation
{
    private readonly RequestDelegate _next;
    private readonly ILogger<MiddlewareExceptionTranslation> _logger;

    public MiddlewareExceptionTranslation(RequestDelegate next, ILogger<MiddlewareExceptionTranslation> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (OperationCanceledException)
            when (httpContext.RequestAborted.IsCancellationRequested)
        {
            // The caller ended the request. There is no failure response to deliver.
            throw;
        }
        catch (PaymentDomainException paymentDomainException)
        {
            // The boundary is the one place that can see the request, so it augments
            // the exception's contextual data before the single log write.
            paymentDomainException.AddContextualData(new ContextualData
            {
                { "HttpRequest.Method", httpContext.Request.Method },
                { "HttpRequest.Path", httpContext.Request.Path.ToString() },
            });
            LogAtBoundary(paymentDomainException);
            await ExceptionToHttpTranslator.TranslateAsync(httpContext, paymentDomainException);
        }
        catch (Exception unexpectedException)
        {
            // A defect detector, not a designed failure mode (see Foreign Exceptions).
            LogUnexpectedAtBoundary(unexpectedException, httpContext);
            await ExceptionToHttpTranslator.TranslateAsync(httpContext, unexpectedException);
        }
    }
}
```

The unexpected branch deliberately preserves the escaped exception's actual type in `Exception-Type`. That is not permission for provider exceptions to cross an abstraction boundary. A `SqlException`, `RequestFailedException`, or other implementation-specific type should already have been translated by its data manager or gateway into a domain-specific custom exception. If a foreign type does reach this branch, its appearance in the header is a defect signal: a guard or translation is missing and must be fixed at the owning boundary. The middleware does not conceal that evidence or replace the escaped exception with a generic wrapper.

The exact boundary mechanism can vary by host, but the principle does not: domain exceptions are translated deliberately; unexpected exceptions are treated as bugs, logged critical, and answered with a bare 500 whose body deliberately reveals nothing about the internals.

### Technical vs Business Exception Branches

Beneath the domain's base exception, define exactly two branches, and make every custom exception descend from one of them:

```csharp
public abstract class MyAppException : Exception { }                    // domain base

public abstract class MyAppBusinessException : MyAppException { }       // the caller must fix it
public abstract class MyAppTechnicalException : MyAppException { }      // we must fix it
```

- **Business exceptions**: a requirement was not met by the caller - invalid input, out-of-range date, unknown identifier, failed login. The system is fine; the caller (user or consuming system) has something to correct. These are the exceptions you throw of your own accord when you don't like what you were given.
- **Technical exceptions**: the system's own machinery failed - misconfiguration, unreachable database, malformed file, provider outage. Nothing the caller sends differently will help; an operator or developer must intervene.

The branch is load-bearing downstream: boundaries map business exceptions to 4xx-style caller-facing responses and technical exceptions to 5xx-style responses with critical logging/alerting; monitoring treats a spike in business exceptions as caller behavior and a spike in technical exceptions as an incident. The branch also decides **who gets woken up**: business exceptions are triageable by analysts and support staff without paging the dev team; technical exceptions are dev/ops' problem and should reach them. When defining a new custom exception, choosing its branch is part of the design - "is this the caller's problem or ours?" must have an answer.

**In C#, the mapping lives ON the exception.** The property uses the BCL's `System.Net.HttpStatusCode` enum rather than an unqualified integer. The branch bases declare the default (`HttpStatusCode.BadRequest` on the business branch, `HttpStatusCode.InternalServerError` on the technical branch), a leaf may deliberately override it (a reference conflict answering `HttpStatusCode.Conflict`), and the base carries an abstract `Reason` - one short caller-safe sentence, the HTTP reason-phrase register. The boundary middleware then maps mechanically from the exception instead of maintaining a parallel type-to-status table that drifts. Convert the enum to an integer only at the host boundary where ASP.NET Core's response API requires one:

```csharp
using System.Net;

public abstract class MyAppException : Exception
{
    // ... constructor overloads (see Exception Design Principles) ...

    public abstract string Reason { get; }

    public abstract HttpStatusCode HttpStatusCode { get; }

    public virtual Severity Severity => Severity.Error;
}

public abstract class MyAppBusinessException : MyAppException
{
    public override HttpStatusCode HttpStatusCode => System.Net.HttpStatusCode.BadRequest;
}

public abstract class MyAppTechnicalException : MyAppException
{
    public override HttpStatusCode HttpStatusCode => System.Net.HttpStatusCode.InternalServerError;
}
```

`Severity` mirrors the Application Insights severity levels name for name and value for value (`Verbose`, `Information`, `Warning`, `Error`, `Critical`), so the severity the code records is the severity the telemetry store shows. Severity remains the **logging site's** call when the site knows better - the same publish failure may be Information or Warning where an explicitly accepted durable pending path absorbs it and Error where nothing does.

Below the two branches the hierarchy stays **broad, not deep**: one specific exception type per distinct scenario, all direct descendants of a branch. Do not build taxonomy trees within the branches.

### Foreign Exceptions Are Always Technical - and Always Diagnostic

A third category exists at triage time, though it never appears in the hierarchy: the **foreign exception** - a BCL exception (`KeyNotFoundException`, `InvalidOperationException`, `FormatException`, `NullReferenceException`), an SDK exception (`SqlException`, `HttpRequestException`, a provider SDK's family), or any runtime exception that escaped to the boundary untranslated. Foreign exceptions are always technical, and they carry a second meaning: **an escaped foreign exception is itself a defect report.** It means one of:

- a **missing guard** - a door that should have validated and didn't
- a **missing translation** - a gateway or abstraction boundary that let its implementation's exception leak
- a **bad assumption** - code that trusted a condition the locked doors never actually guaranteed
- an **unhandled infrastructure condition** - a failure mode nobody classified

In a correctly built system, every exception reaching the boundary is one we authored. The boundary's `catch (Exception)` exists to detect the ones that aren't - it is a defect detector, not a designed failure mode. A recurring foreign exception type in the boundary's critical logs is a to-do with an address: find the site that should have guarded or translated, and fix it there. A `NullReferenceException` in that log deserves special contempt: with nullable reference types enabled (the type contracts chapter, cs07), it means someone silenced the compiler's warning instead of answering it.

### Exceptions as Reproduction Packages

A strong domain exception is a structured diagnostic package, not just a stack trace. It should carry enough context to reproduce and diagnose the failure without guessing:

- Operation or step/stage
- Relevant method parameters and local decision values
- Business identifiers such as customer ID, document ID, account tier, or correlation ID
- Provider status codes, error codes, request IDs, and response snippets when safe
- The log event the throw site was executing under

The payoff is a closed reproduction loop: the boundary log holds the input state plus the context the throw site captured, so a developer can replay the exact failing request instead of guessing it back into existence. "It only happens in production" stops being a category of bug.

The C# expression of the package is a **constrained context class**: a `ContextualData` type holding a private `Dictionary<string, object>` behind compile-time-constrained `Add` overloads (string, int, long, float, double, decimal, bool, DateTime). The compiler refuses unsupported value types at the call site, so the diagnostics pipeline never meets a value it cannot render. Keys follow the `Subject.Datum` convention (`Order.Reference`, `EmailService.HttpStatusCode`) so data added at different layers stays qualified and does not read as a contradiction. Each contributor chooses its own subject prefix and does not intentionally reuse an existing name. Boundary additions use a boundary-owned prefix such as `HttpRequest.Method`, `HttpRequest.Path`, or `InputRequest.OrderReference` rather than an unqualified name such as `Path` or `Reference`.

The package is **deliberately augmentable after construction**: the boundary adds what only it can see (the request method and path, the full input state) via `AddContextualData` before the single log write. Adding an existing name replaces its value rather than throwing while an exception is already in flight. That fail-safe behavior keeps diagnostic augmentation from creating a second failure; it is not a recommendation to overwrite another contributor's data. This remains authoring guidance, not a duplicate-key code-review detector.

The causal chain is part of the package: an exception translated from another carries the original through the `innerException` constructor parameter, and the diagnostic renderings surface it (`CausedBy`, `Cause`) - the original cause is usually the actual explanation, and it must never be lost.

Do not add secrets, tokens, raw credentials, or sensitive payloads to exception context. Add enough safe context to reproduce the problem.

### When Catching Exceptions is Appropriate

**Retry logic:**

```csharp
public async Task<ServiceResponse> CallExternalServiceAsync(ServiceRequest serviceRequest)
{
    for (int sendAttemptNumber = 1; sendAttemptNumber <= _maximumSendAttempts; sendAttemptNumber++)
    {
        try
        {
            return await _serviceClient.SendAsync(serviceRequest);
        }
        catch (TransientServiceException transientServiceException)
        {
            if (sendAttemptNumber == _maximumSendAttempts)
            {
                throw new ServiceUnavailableException(
                    $"The service could not take the request after {_maximumSendAttempts} attempt(s)",
                    ServiceLogEvent.SendRequest,
                    contextualDataByName: new ContextualData
                    {
                        { "Service.SendAttemptCount", sendAttemptNumber },
                        { "Service.LastError", transientServiceException.Message },
                    },
                    innerException: transientServiceException);
            }
            await Task.Delay(TimeSpan.FromSeconds(CalculateBackoffSeconds(sendAttemptNumber)));
        }
    }
    throw new UnreachableException("the retry loop either returns or throws");
}
```

**Exception translation with context enrichment:**

```csharp
public async Task<byte[]> DownloadDocumentAsync(string documentId)
{
    try
    {
        return await _storageClient.DownloadAsync(documentId);
    }
    catch (RequestFailedException requestFailedException)
    {
        throw new DocumentDownloadException(
            $"Document '{documentId}' could not be downloaded from storage",
            DocumentLogEvent.Download,
            contextualDataByName: new ContextualData
            {
                { "Document.Id", documentId },
                { "Storage.ErrorCode", requestFailedException.ErrorCode ?? "unknown" },
                { "Storage.StatusCode", requestFailedException.Status },
            },
            innerException: requestFailedException);
    }
}
```

### Centralized Exception Transformation (Gateway Pattern)

When a class has multiple methods that all need to transform SDK exceptions into domain exceptions, **centralize the transformation logic immediately**. This is complex code - the "Rule of thirds" exception applies: do not duplicate even once.

**Problem - Duplicated Exception Handling:**

```csharp
// BAD - Same exception transformation logic duplicated in every method
internal sealed class BlobStorageGateway
{
    public async Task<byte[]> DownloadBlobAsync(string blobPath)
    {
        try
        {
            return await _blobClient.DownloadAsync(blobPath);
        }
        catch (Exception exception)  // Too broad!
        {
            throw new BlobOperationsException($"Failed to download: {blobPath}", innerException: exception);
        }
    }

    public async Task UploadBlobAsync(string blobPath, byte[] blobContent)
    {
        try
        {
            await _blobClient.UploadAsync(blobPath, blobContent);
        }
        catch (Exception exception)  // Same pattern repeated
        {
            throw new BlobOperationsException($"Failed to upload: {blobPath}", innerException: exception);
        }
    }

    // ... repeated in DeleteBlobAsync, ListBlobsAsync, BlobExistsAsync, etc.
}
```

**Solution - Centralized, Failure-Specific Exception Transformation:**

```csharp
// GOOD - one precise failure type, translated centrally with rich context
internal sealed class StorageGatewayAzure
{
    [DoesNotReturn]
    private void ThrowRateLimitExceededException(
        RequestFailedException rateLimitException, string operation, ContextualData contextualDataByName)
    {
        contextualDataByName.Add("Gateway.Name", GetType().Name);
        contextualDataByName.Add("Provider.Name", "Azure Blob Storage");
        contextualDataByName.Add("Gateway.Operation", operation);
        contextualDataByName.Add("Provider.StatusCode", rateLimitException.Status);

        throw new BlobRateLimitExceededException(
            $"Azure Blob Storage rate limit persisted during {operation}",
            StorageGatewayLogEvent.RateLimitExceeded,
            contextualDataByName: contextualDataByName,
            innerException: rateLimitException);
    }

    // Now each method is simple and consistent:
    public async Task<byte[]> DownloadBlobAsync(string blobPath)
    {
        try
        {
            // ... actual download logic
            return blobContent;
        }
        catch (RequestFailedException requestFailedException) when (requestFailedException.Status == 429)
        {
            ThrowRateLimitExceededException(
                requestFailedException,
                operation: nameof(DownloadBlobAsync),
                contextualDataByName: new ContextualData { { "Blob.Path", blobPath } });
            throw new UnreachableException("the raising method always throws");
        }
    }
}
```

Other classified failures use their own concrete exception types. Not-found, authentication, authorization, rate-limit, connection, and service-unavailable failures do not collapse into one `BlobOperationsException`. The shared raising method centralizes translation for one precise failure family; structured context identifies the gateway, provider, operation, retry information, and resource.

**Key Benefits:**

1. **Catch the specific retryable provider failure** rather than broad `Exception` - exception filters (`when (...)`) classify without catch-and-rethrow
2. **Preserve the precise failure family after retry exhaustion**
3. **Extract all available error details** (status, retry guidance, provider, operation)
4. **Consistent context structure** across all exceptions
5. **Single place to fix bugs** in error handling
6. **`[DoesNotReturn]`** documents that the method always throws; native C# review owns that annotation contract in the current partial set

### When NOT to Catch Exceptions

```csharp
// BAD - Catching just to log
try
{
    ProcessDocument(document);
}
catch (Exception exception)
{
    _logger.LogError(exception, "Failed");
    throw;  // This is NOT handling
}

// BAD - Swallowing exceptions
try
{
    SendNotification(user);
}
catch (Exception)
{
    // Silent failure is never acceptable
}

// BAD - Catching too broadly
try
{
    ComplexOperation();
}
catch (Exception)
{
    return null;  // Hiding failures behind null
}
```

---

### Concurrent Failures: Preserve Every Inner Exception

When multiple concurrent operations can each fail - a `Task.WhenAll` fan-out, a bounded batch under `SemaphoreSlim` (see the LLM-based processor design chapter's executor contract, cs24) - the failure story must preserve **every** inner failure, not just the first one observed.

`await Task.WhenAll(...)` rethrows only the *first* faulted task's exception; the complete set survives on the task object. Code that awaits the combined task and lets the single rethrown exception propagate has silently discarded its siblings:

```csharp
// BAD - two of three failures vanish from the diagnostics
await Task.WhenAll(documentIngestionTasks);

// GOOD - observe this document-ingestion batch and surface its complete failure set
Task allDocumentIngestionTasks = Task.WhenAll(documentIngestionTasks);
try
{
    await allDocumentIngestionTasks;
}
catch (Exception firstFaultedException)
{
    AggregateException aggregateException =
        allDocumentIngestionTasks.Exception?.Flatten()
        ?? new AggregateException(firstFaultedException);
    IReadOnlyList<Exception> documentIngestionFailures = aggregateException.InnerExceptions;
    throw new DocumentIngestionBatchException(
        $"Document ingestion failed for {documentIngestionFailures.Count} document(s)",
        DocumentIngestionLogEvent.IngestBatch,
        contextualDataByName: CreateDocumentIngestionFailureContext(documentIngestionFailures),
        innerException: aggregateException);
}
```

The organizational rule this chapter owns: a concurrent batch that can fail per item surfaces **one domain exception carrying all terminal item failures** (the LLM-based processor design chapter's run-to-completion contract, cs24), never a bare `AggregateException` leaking to callers and never a single arbitrary inner failure standing in for the set. The native language lane owns the mechanics (`AggregateException` flattening, un-awaited task observation, `async void`).

The flattened `AggregateException` is deliberately nested inside the domain `DocumentIngestionBatchException`; it does not escape as the caller-facing exception. It preserves every original exception object, type, stack trace, and causal chain while the outer domain type states which concrete batch operation failed. `BatchProcessingException` would be too generic: every batch domain names its actual operation in the exception type.

**Anti-pattern:** catching around a fan-out with `catch (Exception)` and logging the one exception you happened to receive. The stringified first failure tells you nothing about the other N-1, and debugging becomes archaeology.

---

### `[DoesNotReturn]`: Document Terminal Domain Raising Methods

Domain exception translators, classifiers, and terminal raising methods whose every reachable path throws (for example, `ThrowBlobOperationException` or a `ClassifyProviderError` funnel) should be annotated with `[DoesNotReturn]` (`System.Diagnostics.CodeAnalysis`). Native C# review owns the annotation contract in the current partial set; this chapter owns whether translation is centralized and throws the correct domain exception.

```csharp
[DoesNotReturn]
private void ThrowClassifiedProviderException(Exception providerException, string operation)
{
    // Translate ANY provider exception into a domain exception. ALWAYS throws.
    switch (providerException)
    {
        case RateLimitException rateLimitException:
            throw new ProviderRateLimitException(...);
        case IOException or SocketException or TimeoutException:
            throw new ProviderTransportException(...);
        default:
            throw new ProviderGatewayException(...);
    }
}
```

Why the annotation matters:

1. **Documents intent.** Readers see immediately that this is a terminal raising method, not a method that might return and continue.
2. **Flow analysis enforces it.** Nullable-state and reachability analysis treat code after the call as unreachable; a branch that forgets to throw is flagged.
3. **Eliminates dead-code noise at call sites.** No dummy `return` statements after the raising method's call.

Use `[DoesNotReturn]` only when complete control flow proves that every path throws a domain exception. A conditional validation guard such as `ThrowIfNegative(...)` returns normally for valid input and is not annotated. (Where the compiler cannot see through the raising method - a call inside a `catch` that must satisfy definite assignment - the C# idiom is a trailing `throw new UnreachableException(...)` stating the invariant.)

---

## Exception Design Principles

### Specific, Not Generic

```csharp
// GOOD - Specific exceptions
public sealed class CustomerNotFoundException : MyAppBusinessException { ... }

public sealed class PaymentDeclinedException : MyAppBusinessException { ... }

public sealed class DocumentParsingException : MyAppTechnicalException { ... }

// BAD - Generic "reusable" exceptions
public sealed class NotFoundException : Exception { ... }      // Too generic
public sealed class ProcessingException : Exception { ... }    // What processing?
```

The type name is itself the primary signal - a self-documenting error code richer than any integer registry. A reader who sees `PaymentDeclinedException` in a log knows what happened before reading a word of the message, and a monitoring system that sees a spike in one type knows which subsystem to point at. Generic types forfeit that signal and force everyone back to parsing message strings.

A useful heuristic: **each exception type usually maps to one throw site** (or one centralized transformer). Reuse is valid across any number of sites or gateways only when every use represents the same precise failure condition and requires the same response. Wrapping the same broad provider or SDK exception class in different operations does not establish one precise condition. Treat those construction sites as related only when the source proves the same terminal failure and response, or when every operation delegates to one centralized terminal transformer. Two sanctioned reuse families:

- **Adapter parity**: sibling adapters behind one contract (a RabbitMQ and a Service Bus publisher) throw the same exception type for the identical problem with the identical message shape - same case, different transport underneath.
- **Configuration failure modes**: one exception type per failure mode - missing key, empty value, whitespace value, invalid value - reused by every settings provider through one shared reader, because a per-setting exception type would say nothing new; the setting name travels in the message and context. (The configuration provider chapter (cs16) owns the family.)

By contrast, one object-storage-operation exception spanning upload and deletion failures is too general: context cannot make a generalized type specific. Technical, business, and validation classification belongs in exception ancestry rather than being repeated in every concrete exception name.

### The Constructor Discipline

Every custom exception is `sealed`, marked `[ExcludeFromCodeCoverage]` (hundreds of exceptions of pure boilerplate would otherwise drown the coverage signal - exceptions are never unit-tested in isolation), and carries a fixed overload set:

```csharp
[ExcludeFromCodeCoverage]
public sealed class CustomerNotFoundException : MyAppBusinessException
{
    public CustomerNotFoundException()
    {
    }

    public CustomerNotFoundException(string message)
        : base(message)
    {
    }

    public CustomerNotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public CustomerNotFoundException(
        string message, LogEventBase logEvent, ContextualData? contextualDataByName = null, Exception? innerException = null)
        : base(message, logEvent, contextualDataByName, innerException)
    {
    }

    public override string Reason => "Customer does not exist";
}
```

The first three are the standard .NET exception constructors; the fourth is **the canonical construction** - message, the throw site's log event, contextual data, and the causal exception. A throw without a log event stands out in review.

**Messages are composed at the throw site, not inside the exception.** The throw site has the offending values in scope, so including them costs one interpolation; the exception class stays pure (fixed `Reason`, no payload properties, no message templates). Two consequences the discipline depends on:

- Grepping a production log message lands at the **throw site** - the place with the context - not at a class file.
- Per-type message consistency is guaranteed by the one-throw-site heuristic above, not by a constructor. Payload facts travel as contextual data; a typed payload property is added only when a *programmatic* consumer needs it (rule of thirds).

The message-at-throw-site rule owns stored instance payload, internal message construction, and a Reason that varies with instance data. Constructor discipline owns only the exception's structural shape: sealing, coverage exclusion, branch-base abstraction, and the required overloads. The two rules never report the same correction.

**The log event is a throw-side argument, never a per-type constant.** An orchestration sets its current log event before each step it invokes; the catch block hands that event to the exception it constructs. The same exception type thrown during different steps carries different events - that is the point.

### Rich Context Data

Exceptions should carry everything needed for diagnosis. The domain base builds the diagnostic envelope on demand - application name, exception type, reason, severity, status code, message, log event - and augments it with the throw site's qualified contextual data, so every rendered exception has one predictable, queryable shape. The envelope values come from the exception's own properties; ordinary callers do not add exception type, severity, or status as contextual entries. The base may project both the envelope and the contextual entries into Application Insights custom dimensions so operators can search and filter them together.

```csharp
throw new BlobNotFoundException(
    $"Blob 'path/to/file.pdf' was not found in container 'documents'",
    BlobOperationLogEvent.Download,
    contextualDataByName: new ContextualData
    {
        { "Blob.Path", "path/to/file.pdf" },
        { "Blob.Container", "documents" },
        { "Provider.StatusCode", 404 },
        { "Provider.ErrorCode", "BlobNotFound" },
    },
    innerException: requestFailedException);
```

The base exposes two renderings that must always agree: a human-readable diagnostic text (one `Key: Value` line per entry, stack trace last) and a JSON rendering for response and telemetry pipelines. Test support asserts the agreement as an invariant on every asserted exception (the test-assertions chapter's (cs53) four verification layers).

### Inheritance for Exception Hierarchies

```csharp
// Base exception for the domain
public abstract class MyAppException : Exception { ... }

// The two branches
public abstract class MyAppBusinessException : MyAppException { ... }
public abstract class MyAppTechnicalException : MyAppException { ... }

// Specific exceptions - sealed leaves, direct descendants of a branch
public sealed class InvalidEmailFormatException : MyAppBusinessException { ... }
public sealed class PaymentGatewayTimeoutException : MyAppTechnicalException { ... }
```

The bases are `abstract` - the compiler enforces what Python could only document: only problem-specific leaf exceptions are ever thrown.

---

## Exception Messages

Exception messages should be:

1. **Clear and actionable** - State what went wrong and what might fix it
2. **Include the invalid value** - Don't just say "invalid"; show what was invalid
3. **Include valid options** - If there's a finite set of valid values, list them

Whoever owns a bounded set exposes its ready-to-render form (an enum's parser exposes the joined valid values; a class owning a collection exposes them joined), so throw sites never hand-assemble the list and messages never drift from the set.

### Write for the People Resolving the Failure

The **message** must help the person triaging, diagnosing, or correcting the
failure understand what happened and what to do next. Business failures may be
resolved by analysts, business users, or support staff. Technical failures may
require developers, infrastructure staff, or operators. Use plain, actionable
language appropriate to that failure; do not assume every message is for a
business analyst.

The **structured context** supplies diagnostics for searching, correlating,
and reproducing the failure: relevant inputs, identifiers, provider codes, and
the failed operation or stage. Necessary facts may appear in both the message
and context. Context supplements an actionable message; it is not a reason to
remove facts needed to fix the problem.

For configuration failures, explicitly identify the setting or environment
variable, its non-sensitive rejected value, the validation failure, and the
permitted values, units, or corrective action. These are operational facts,
not automatically developer-only jargon. Avoid unexplained implementation
names, stack-trace fragments, and diagnostic dumps that do not help explain or
correct the failure. Secret redaction remains a separate requirement and does
not justify hiding a setting name or an ordinary timeout value. This exception
message policy does not change assertion-message guidance.

The fixed, caller-safe `Reason` and outer response boundary keep their
separate contracts; an operational `Message` is not automatically a public
HTTP response.

This C# adaptation of Meridian Python's timeout validation is a compliant
message construction; the complete adapted provider is a focused corpus control:

```csharp
return new ConfigurationSettingValueInvalidException(
    $"Configuration setting '{CommandTimeoutSecondsVariableName}' received '{commandTimeoutSetting}'. " +
    $"{commandTimeoutValidationProblem} " +
    $"Enter an integer from 0 to {int.MaxValue}. " +
    "Use 0 for no command timeout, or a positive integer for the timeout in seconds; leave the setting unset to use 0.",
    ConfigurationLogEvent.OrderStoreSettingsRetrieval,
    new ContextualData
    {
        { "Configuration.EnvironmentVariableName", CommandTimeoutSecondsVariableName },
        { "Configuration.EnvironmentValue", commandTimeoutSetting }
    });
```

Do not flag it for naming the environment variable or its non-sensitive value.
Meridian C#'s existing `RequiredSettingReader` likewise correctly identifies
the setting and distinguishes missing, empty, and whitespace values in its
messages. Both forms help developers or infrastructure operators make the fix.

```csharp
// GOOD - Clear, actionable, includes value and options
throw new InvalidDocumentTypeException(
    $"Document type '{documentType}' is not supported. Valid types are: {DocumentTypeParser.JoinedSupportedTypes}",
    DocumentLogEvent.ClassifyDocument);

// BAD - Vague, no context
throw new InvalidDocumentTypeException("Invalid document type");
```

### Context-Free Framework Exceptions from LINQ

Framework exceptions raised by LINQ's terminal operators (`Single`, `First`, and their `OrDefault` forms) are a distinct, LINQ-specific case of the message- quality problem above. The LINQ query-semantics chapter (cs08) owns them: it teaches taking over the throw so the exception carries the selection criteria instead of a bare "Sequence contains more than one element" or "Sequence contains no elements."

---

## Logging Policy

### Default: Log Exceptions Only

In a system programmed to exceptions, the default logging policy is: **log exceptions, log nothing else**. If you don't hear from the system, it's all good. Informational logging scattered through business flows is the sibling of defensive validation - code written because the author doesn't trust the system - and in decades of production business systems the need for it essentially never materializes. Logging happens at boundaries (see Boundary Catch Strategy); interior code neither logs nor swallows.

**The .NET wiring:** the domain logs through its own narrow logger seam (a `LoggerBase` whose one method logs a domain exception), implemented over the **host's** `ILogger` - the composition root registers the production service locator from the host's `IConfiguration` and `ILoggerFactory`, so which providers are attached (console, Application Insights, anything OpenTelemetry-compatible) is a host decision the domain never sees. Contextual data travels in the logging **scope** (`ILogger.BeginScope`), which is the shape structured providers index - Application Insights renders scope entries as custom dimensions, so the reproduction package becomes queryable telemetry without any provider-specific code in the domain.

One absorbing-site nuance the policy sanctions: after the exact swallow is explicitly accepted with the rule-specific override and visible durable recovery state, it is logged at its one absorbing site at Information or Warning. Absorbed is not silent. Information is valid for an intentionally routine event; Warning is valid when it deserves operational notice. Error or Critical incorrectly puts accepted self-healing behavior into the alerting stream. Without the override, the primary problem remains unauthorized swallowing regardless of the log call. The ordinary interior-logging rule does not duplicate either stage.

### The Sanctioned Exception: Long-Running Stepped Processes

Long-running, multi-step pipelines (document-processing runs of 17-18 steps per document; ingestions running hours to weeks over thousands of documents) earn **progress logging**, because the operational question they raise is one exceptions cannot answer: *"this has been going on for 18 hours - where are we at?"* Rules:

1. **Step-boundary events, named from a shared vocabulary.** Progress logs and exceptions draw from the same `LogEvent` taxonomy - one event vocabulary for the whole pipeline. In C# the taxonomy is the smart-enum `LogEventBase` family: an abstract base with per-domain-area sealed descendants exposing `static readonly` instances, so the vocabulary is typed, discoverable, and closed. Event values encode position and name (`Step_2.4_VisionMetadataTextConversion`), grouped by phase, so a log line places you in the pipeline exactly.
2. **A step-boundary logger owns the format.** One class renders events (banner separators, `STEP 2.4: Vision Metadata Text Conversion - STARTED/COMPLETED`, optional detail line). Steps never hand-format progress banners.
3. **In-step progress carries counts.** Within a long step, per-unit lines include the measurable ("Completed page 12 (34 metadata lines)") - enough to see rate and detect stalls, never payload dumps.
4. **A decent amount, not too much - structured as if a human needs to read it.** Because one will: progress logs exist for a person (or a coding assistant) staring at a run trying to understand what happened. Human-readable step names (PascalCase-parsed to display names), message-first formatting, no noise. Logs are breadcrumbs in the same sense as the artifact-persistence-callbacks chapter's (cs25) artifacts, and land beside them.
5. **Renumbering steps is a breaking change for monitoring.** Retain legacy event values (marked as such) when steps are reorganized; dashboards and alerts key on them.
6. **Logger configuration is composition-root-owned.** In ASP.NET Core that means the host's `ILoggerFactory`; provider attachment, per-run file sinks, and third-party SDK logger decisions happen once, at the entry point - never inside steps.

Review lens: informational logging in a *non*-long-running business flow is a finding (default policy applies); a long-running pipeline with **no** step-boundary logging is equally a finding (operations is blind); hand-rolled per-step banner formatting, payload dumps, and step events invented outside the LogEvent taxonomy are findings. Analyzer note: performance-focused logging analyzers (CA1848 LoggerMessage delegates) target hot logging paths; an exception-only logging policy has no hot path, and the cold-path suppression with a stated justification is the house answer, not a redesign.

The build blueprint is `../code_implementation_guidelines/progress-logging-implementation-guidelines.md`.

---

## Code Review Checklist

When reviewing validation and exception handling, verify:

### Validation Location

- [ ] Validation occurs at system boundaries (front door, back door), not everywhere
- [ ] `cs55` owns controller wire parsing/mapping; Managers invoke domain validators so changing hosts cannot remove business rules
- [ ] Models are pure data: no trimming, case folding, or canonicalizing in constructors - the Manager normalizes visibly, then validates, then acts
- [ ] Downstream code trusts the normalized form instead of re-canonicalizing at each use site
- [ ] No type checks in domain validators - the compiler locked that door
- [ ] No redundant validation inside the system
- [ ] Gateway validates external service responses
- [ ] Configuration provider validates and returns strongly-typed values

### Exception Usage

- [ ] Every catch site proves itself: true handling (retry, fallback, explicitly overridden absorb-behind-pending-record), justified translation (gateway catch-to-translate, boundary middleware), or the host's explicit caller-cancellation pass-through - any other catch is a finding
- [ ] `OperationCanceledException` passes through without logging or a 500 only when `HttpContext.RequestAborted` is cancelled; other cancellation exceptions remain unexpected unless an owning boundary translated them
- [ ] No catching exceptions just to log and rethrow
- [ ] No unauthorized swallowing: a durable pending record and ordinary comment are insufficient without the exact rule-specific override and developer-supplied reason
- [ ] No broad `catch (Exception)` that hides failures behind `null`
- [ ] Exceptions propagate to entry point layer for logging
- [ ] Foreign/runtime exceptions reaching the boundary are treated as defects (missing guard or missing translation), not as a designed failure mode
- [ ] The logging boundary sanitizes context and request state before emitting

### Gateway Exception Translation

- [ ] Catch the SDK's root exception family (e.g., `RequestFailedException`, `SqlException`, `HttpRequestException`) or filter with `when (...)` - not generic `Exception`
- [ ] All SDK exceptions are translated to domain exceptions - no SDK exceptions leak to callers
- [ ] Implementation details don't leak (caller can't tell if it's SQL Server, Postgres, Azure, AWS)
- [ ] Translations carry the original through `innerException` - the causal chain is never lost

### Centralized Exception Transformation (Gateways)

- [ ] Exception transformation logic is centralized (not duplicated in each method)
- [ ] Error codes are mapped to user-friendly messages
- [ ] All available error details are extracted (status codes, error codes, request IDs)
- [ ] Transformation is terminal on every path when designed as a raising method (native C# review owns the `[DoesNotReturn]` annotation)
- [ ] Context structure is consistent across all exceptions

### Exception Design

- [ ] Exceptions are specific, not generic ("CustomerNotFound" not "NotFound")
- [ ] Each exception type maps to one throw site (or one centralized transformer, or a sanctioned reuse family) - no type thrown from many unrelated places
- [ ] Leaves are `sealed` and `[ExcludeFromCodeCoverage]`; branch bases are `abstract`
- [ ] Every leaf carries the standard overloads plus the canonical (message, logEvent, contextualData, innerException) constructor
- [ ] Messages are composed at the throw site; the class carries a fixed `Reason` and no message templates
- [ ] `HttpStatusCode` uses `System.Net.HttpStatusCode`, comes from the branch base (`BadRequest`/`InternalServerError`), and has deliberate leaf overrides only
- [ ] `Severity` uses the Application Insights vocabulary; an explicitly accepted absorbing site logs at Information or Warning, never Error/Critical, and never silently
- [ ] Exceptions carry rich context data (values, parameters, stage) via the constrained context type
- [ ] Exception messages include the invalid value
- [ ] Exception messages include valid options when applicable (rendered by the set's owner)
- [ ] Exception messages help the people resolving the failure, including developers and infrastructure staff; actionable setting names, non-sensitive values, and corrections remain in the message alongside structured diagnostics

### Happy Path Code

- [ ] Code is written for the happy path only
- [ ] No defensive checks for "just in case" scenarios
- [ ] No `if (result is null)` patterns after internal calls
- [ ] Execution reaching next line implies success

### Concurrent Failures

- [ ] Fan-out failure paths surface the complete inner-failure set in one domain exception (the LLM-based processor design chapter's (cs24) run-to-completion contract)
- [ ] No bare `AggregateException` leaking to callers; no single arbitrary inner failure standing in for the set

### Terminal Raising Methods

- [ ] Domain transformers and classifiers designed as terminal raising methods throw on every reachable path; conditional validation guards may return normally (native C# review owns `[DoesNotReturn]` annotation findings)
