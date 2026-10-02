---
title: "Programming to Exceptions, Part 2: Diagnostics and Boundaries"
description: "Specific exceptions preserve the cause and context of a failure. Gateways and middleware carry that record across HTTP into Application Insights custom dimensions."
datePublished: 2019-10-28
dateModified: 2026-10-02
tags: ["error-handling", "class-design", "architecture", "service-interface-layer", "structured-logging", "gateway-pattern", "data-manager", "architectural-patterns", "csharp"]
draft: false
hero: programming-to-exceptions-diagnostics-and-boundaries
youtube: "https://www.youtube.com/watch?v=5IKczyor-f4"
---

A useful exception tells the application why an operation could not complete. It also gives the people investigating the failure enough information to identify the responsible component, examine the relevant input, and decide what to do next.

[Part 1](../programming-to-exceptions-method-contracts/) established the method contract: complete the promised work, return the promised data, or throw. This part follows the exception from the point of detection to the application boundary. Along the way, its type expresses the failure, its context records the facts, and any translation preserves the original cause.

That propagation lets ordinary orchestration describe the happy path as a sequence of method calls. Reaching the next step means the earlier calls fulfilled their contracts. The callers need no success check after each call, and a failed call cannot be overlooked merely because someone ignored a return value. The diagnostic and boundary design in this part makes those escaping failures useful to the component that can act on them.

The caller's intent determines what a query method promises. `GetCustomer` promises a particular customer the caller expects to use. `Find` and `Search` allow no match, expressed as `null` for a nullable single result or an empty collection for multiple results. `CustomerExists` promises a Boolean answer. Each must return what its contract promises or throw if it cannot provide that answer. [Part 1's retrieval, search, and existence section](../programming-to-exceptions-method-contracts/#retrieval-search-and-existence-have-different-contracts) and [Method Design's query-method guidance](/pwi/method-design/csharp/#query-methods-return-the-information-they-promise) explain the distinction.

My aim is that a support or triage person can understand a failure from one diagnostic record without first asking the developer to reconstruct what happened. Clear exception messages and structured context are part of the system's design work.

## A shallow hierarchy with specific leaves

Each application has its own base exception, named for that application. It descends from `System.Exception`. Two abstract branches distinguish business refusals from technical failures. Concrete exception types descend from those branches.

For an application that registers customers and places orders, the hierarchy could look like this:

```text
System.Exception
└── MeridianOrderingException                    abstract
    ├── MeridianOrderingBusinessException        abstract
    │   ├── OrderPlacementCustomerNotFoundException
    │   ├── CustomerNotActiveException
    │   ├── UnknownProductsException
    │   └── OrderReferenceConflictException
    └── MeridianOrderingTechnicalException       abstract
        ├── OrderStoreUnavailableException
        ├── EmailServiceUnavailableException
        ├── EmailServiceTooBusyException
        └── MessageBrokerPublishException
```

The hierarchy is broad and shallow. Depending on its complexity, a project can have 100, 150, or 200 concrete custom exceptions without needing many inheritance levels. The number follows the failure scenarios the system needs to distinguish.

The abstract types establish the diagnostic contract and shared defaults. Throw the concrete types. Throwing the application base would identify the application while saying little about what failed.

<!-- diagram:start custom-exceptions-hierarchy -->
<figure id="custom-exceptions-hierarchy" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/custom-exceptions-hierarchy.webp" alt="A custom exception hierarchy: Exception is the ancestor of AppNameBaseException, which branches into abstract business and technical bases. The business branch includes validation exceptions and an abstract critical-business base with a concrete unsupported-state exception. The technical branch includes concrete timeout, downstream-service, and message-broker exceptions. Circles mark abstract classes, stars mark concrete classes, and arrows point toward ancestors." width="1820" height="864" loading="lazy" decoding="async" />
  <figcaption>Application-specific abstract bases separate business refusals from technical failures. Concrete types identify individual failure scenarios. Circles mark abstract classes; stars mark concrete classes. Arrows point to ancestors. In this example, AppName is a placeholder for the application's name; the critical-business branch groups exceptions with a shared policy.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/custom-exceptions-hierarchy.webp">Open full-size exception hierarchy</a></p>
</figure>
<!-- diagram:end custom-exceptions-hierarchy -->

Define each concrete exception for one specific failure scenario and one originating throw location. Do not design concrete exceptions for reuse across unrelated operations. When you see the type in a log, you should already know which operation failed and where to look. A service-specific timeout or retry-exhaustion type identifies that dependency immediately; a generic reusable timeout type does not. A type named `CustomerRegistrationRequestValidationException` immediately narrows the operation to investigate. A type named `ValidationException` could have come from anywhere.

A single validator can report several related input violations together. Those violations belong to the same request-validation scenario. That does not justify reusing its exception for an unrelated provider timeout or a different operation's rules.

The intended hierarchy is for the failures the application deliberately defines. Framework and vendor exceptions can still occur. Translate the ones understood at their boundary; the final unexpected-exception handler remains necessary for the rest.

## Business and technical describe responsibility

A **business exception** says that the request cannot proceed under the business requirements. An unknown customer, an inactive customer, or a reference reused with different order content can all prevent order placement. The system is working correctly when it recognizes and reports that refusal. The exception does not, by itself, imply a defect in the system, the user, the UI, or the calling service. The consumer receives the business explanation and decides whether to correct the request or choose another action.

A **technical exception** says that the system cannot carry out the work because of an infrastructure, configuration, integration, or implementation problem. An unavailable store and a malformed provider request generated by the application are examples. Asking the user to change an otherwise valid order cannot fix them.

Classify the meaning of the failure at your application's abstraction level. A database exception can report a business refusal enforced by a stored procedure. Conversely, an external HTTP 400 can be a technical failure when your Gateway built the bad request. The source technology and status number do not decide responsibility on their own.

Severity is a separate decision. A business refusal can demand critical attention, and a technical interruption can be temporary. If several business failures share a meaningful critical policy, an abstract critical-business branch can express it. If only one leaf needs a different severity, override that leaf. Add hierarchy levels only for shared behavior or policy.

## Which failures need attention

Programming to Exceptions also determines how I operate a system. I rely on failures reaching the boundary, where the application records them and answers the caller. I do not routinely search the logs for evidence that the successful path ran. Most custom exceptions, business or technical, describe conditions the system already knows how to report.

A business exception is the system doing exactly what we designed it to do. We threw it intentionally. There is no system defect to fix: the application enforced its rule, and the consuming UI or service deals with the refusal. Do not treat the presence of that exception as a reason to scatter try-catch blocks through the code.

A custom technical exception can also describe a known operating condition. A downstream service timed out, or bounded retries were exhausted. The request could not complete, so the web service reports a technical failure, normally an HTTP 500 under this policy. There is only so much the application can do about an unavailable dependency. A single occurrence does not necessarily need someone to intervene.

Frequency can change that decision. Define an alert for a particular exception type occurring more than an agreed number of times within an agreed interval. Application Insights custom dimensions let the rule distinguish a recurring timeout from unrelated failures and identify the downstream service involved. Set the threshold from the service's operating requirements; it is not a fixed number for every application.

Unexpected framework exceptions have a different meaning. A `NullReferenceException`, `IndexOutOfRangeException`, or similar failure in application code indicates a programming defect to investigate. The outer handler initially classifies it as an unexpected technical failure, returns HTTP 500, and records it for notification and diagnosis. Fix the defect or the missing boundary guarantee. Wrapping it in a custom type without correcting the cause would leave the problem in place.

These policies let us distinguish a designed refusal, an occasional dependency failure, and an unexpected bug. Exceptions give us that evidence because we let them propagate and preserve their specific meaning.

## Write the message for the person who must act

“Payment plan validation failed” names a category without explaining the failed requirement. A useful message names the value, the constraint, and, where appropriate, the available correction:

> Payment plan amount $5,000 exceeds the $3,000 limit for Basic accounts. Premium accounts allow up to $10,000. Choose an amount within your account's limit or change the account tier.

Those amounts are illustrative policy values. The production message must use the actual rule and account facts.

For a missing customer, include the requested identifier. For an invalid date range, include the range and the ordering rule. For an unsupported state, name the state and the permitted options when revealing them is appropriate.

If someone on the team cannot understand the failure from the message, fix the message. Do not make them depend on a developer's private explanation. The message must identify the received value, explain exactly what violates the requirement, and give the correction when one is available:

> First name 'AlexandertheGreat' has 17 characters. Enter a first name with 1 to 15 characters.

For a small bounded set, provide the actual supported values:

> Genre 'Sci-fi' is not supported. Possible values are Action, Comedy, Drama, and Science Fiction.

Those are illustrative constraints and choices. Use the application's real values. Boundary acceptance tests can verify that a message contains the value they supplied, the violated constraint, and the available correction. That also reveals whether the system received the same value the caller sent. Keep credentials and other values that must not be disclosed out of messages and diagnostic records.

Keep a short, stable `Reason` alongside the detailed `Message`. The reason supports classification and response translation. The message explains this particular occurrence. A stable log-event identifier identifies the operation or stage without requiring log queries to parse prose.

The message must also be suitable for its audience. A user needs a business explanation. An operator may need the provider's original error, the attempted operation, and configuration identifiers. Preserve those internal facts in diagnostics while deliberately choosing the caller-facing information.

## The base exception's diagnostic contract

The following C# implementation gives the application base a shared diagnostic contract. Its concrete exceptions supply the meaning of each failure. The principles apply independently of the host: an API, worker, and command-line application can all consume the same domain exception.

| Field or capability | Purpose |
| --- | --- |
| Application name and concrete exception type | Identify the owning application and failure scenario. |
| Message and reason | Explain this occurrence and classify its meaning. |
| Action | State the remedy category, such as user correction, retry, infrastructure repair, or developer investigation. |
| Log event | Identify the operation or failure stage using a stable value. |
| Severity | Supply a default suitable for logging and alerting, overridable by a leaf. |
| Suggested HTTP status | Supply the application's default translation policy; the host writes the response. |
| Contextual data | Carry relevant input, local facts, operation details, and service identifiers. |
| Original exception and cause chain | Preserve the failures underneath a translation, including their stack traces. |
| Boundary enrichment | Attach request facts and correlation information that the throw site did not have. |
| Diagnostic text and JSON | Render the same diagnostic snapshot for reading and structured storage. |
| Unexpected-exception adapter | Record a foreign failure without pretending that it is a known application scenario. |

An action expresses what kind of response is appropriate. It is not an instruction to retry automatically. A retry still requires an owning component, a bounded policy, and knowledge that repeating the work is safe.

The suggested HTTP status is metadata in this design. It introduces no dependency on ASP.NET. Use `System.Net.HttpStatusCode` in C# and convert it to its numeric wire representation at the host boundary. A non-HTTP host can use the reason, action, and severity without constructing an HTTP response.

### Values that can be recorded predictably

Diagnostic context should have a defined shape. The C# compiler can restrict callers to supported values through overloads. The container copies input context, returns snapshots, and normalizes dates, enums, paths, and bytes explicitly. That avoids retaining arbitrary mutable application objects in a failure record.

```csharp
using System.Collections;
using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

public enum Severity
{
    Verbose, Information, Warning, Error, Critical
}

public enum ExceptionAction
{
    UserActionRequired,
    RetryActionNeeded,
    InfraActionRequired,
    DeveloperActionRequired,
    DependencyMissingActionRequired,
    ManualIngestionUnforeseen,
    ManualIngestionAnticipated,
    ManualReattemptAutomatedIngestion,
    RetrySnapshotRecovery,
    RetrySnapshotDeletion,
    NoActionNeeded
}

public abstract class LogEventBase
{
    protected LogEventBase(string value) => Value = value;
    public string Value { get; }
}

public sealed class ContextualData : IEnumerable<KeyValuePair<string, object?>>
{
    private readonly Dictionary<string, object?> _values = new();

    public ContextualData() { }

    public ContextualData(ContextualData source)
    {
        foreach (var entry in source)
            _values[entry.Key] = entry.Value;
    }

    public void Add(string name, string? value) => _values[name] = value;
    public void Add(string name, bool value) => _values[name] = value;
    public void Add(string name, int value) => _values[name] = value;
    public void Add(string name, long value) => _values[name] = value;
    public void Add(string name, decimal value) => _values[name] = value;
    public void Add(string name, float value) => Add(name, (double)value);
    public void Add(string name, double value) =>
        _values[name] = double.IsFinite(value)
            ? (object)value : value.ToString(CultureInfo.InvariantCulture);
    public void Add(string name, DateTime value) =>
        _values[name] = value.ToString("O", CultureInfo.InvariantCulture);
    public void Add(string name, DateTimeOffset value) =>
        _values[name] = value.ToString("O", CultureInfo.InvariantCulture);
    public void Add(string name, Guid value) => _values[name] = value.ToString();
    public void Add(string name, Enum value) => _values[name] = value.ToString();
    public void Add(string name, FileSystemInfo value) => _values[name] = value.FullName;
    public void Add(string name, byte[] value) =>
        _values[name] = Convert.ToBase64String(value);

    internal void Merge(ContextualData source)
    {
        foreach (var entry in source)
            _values[entry.Key] = entry.Value;
    }

    internal Dictionary<string, object?> Snapshot() => new(_values);

    public IEnumerator<KeyValuePair<string, object?>> GetEnumerator() =>
        _values.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

public sealed record ExceptionCause(
    string ExceptionType, string Message, string? StackTrace);

public sealed record ServiceFailureData(
    string ApplicationName,
    string OriginatingService,
    string Operation,
    string CorrelationId,
    string ExceptionType,
    string Reason,
    string Message,
    string Action,
    string Severity,
    int HttpStatusCode,
    IReadOnlyDictionary<string, object?> Context,
    string? ExceptionDetails,
    ServiceFailureData? DownstreamFailure);
```

The ingestion and snapshot actions illustrate application-specific remedies from systems doing that work. An ordering application can keep the categories it actually needs. Explicit action values preserve the difference between “retry this known operation,” “ask the user to correct input,” and “someone must repair infrastructure.”

Repeated context keys replace their prior value. Adding boundary information must not fail merely because a key already exists. The base below reserves its identity and policy fields by writing them after supplemental context, so enrichment cannot rename the exception or change its status.

Use names such as `Order.Reference`, `Customer.Id`, and `DownstreamService` consistently. For a nested request, capture approved scalar fields or an explicitly serialized, redacted snapshot. Binary encoding makes bytes representable; it does not make their contents safe to log.

### The application base

The base requires a message and log event when constructed. Leaves supply the reason, remedy, and default HTTP translation. The diagnostic snapshot reads those overridden properties after construction, rather than invoking subclass policy while the base constructor is running.

```csharp
public abstract class MeridianOrderingException : Exception
{
    public const string ApplicationName = "MeridianOrdering";
    private readonly ContextualData _context;

    protected MeridianOrderingException(
        string message,
        LogEventBase logEvent,
        ContextualData? context = null,
        Exception? innerException = null)
        : base(message, innerException)
    {
        LogEvent = logEvent;
        _context = context is null ? new() : new(context);
    }

    public LogEventBase LogEvent { get; }
    public abstract string Reason { get; }
    public abstract ExceptionAction Action { get; }
    public abstract HttpStatusCode HttpStatusCode { get; }
    public virtual Severity Severity => Severity.Error;
    public ServiceFailureData? DownstreamFailure { get; private set; }

    public ExceptionCause? Cause => InnerException is null ? null :
        new(InnerException.GetType().Name,
            InnerException.Message, InnerException.StackTrace);

    public void AddContextualData(ContextualData context) => _context.Merge(context);

    public void AttachDownstreamFailure(ServiceFailureData failure) =>
        DownstreamFailure = failure;

    public ServiceFailureData ToServiceFailureData(
        string originatingService, string operation, string correlationId) =>
        new(ApplicationName, originatingService, operation, correlationId,
            GetType().Name, Reason, Message, Action.ToString(),
            Severity.ToString(), (int)HttpStatusCode, _context.Snapshot(),
            ToString(), DownstreamFailure);

    public IReadOnlyDictionary<string, object?> GetDiagnosticData(
        bool includeStackTrace = true)
    {
        Dictionary<string, object?> data = _context.Snapshot();
        data["ApplicationName"] = ApplicationName;
        data["ExceptionType"] = GetType().Name;
        data["Message"] = Message;
        data["Reason"] = Reason;
        data["Action"] = Action.ToString();
        data["LogEvent"] = LogEvent.Value;
        data["Severity"] = Severity.ToString();
        data["HttpStatusCode"] = (int)HttpStatusCode;
        if (DownstreamFailure is not null)
            data["DownstreamFailure"] = DownstreamFailure;

        if (Cause is { } cause)
        {
            data["CausedBy"] = cause.ExceptionType;
            data["Cause"] = cause.Message;
            data["CauseStackTrace"] = includeStackTrace ? cause.StackTrace : null;
            data["CauseChain"] = includeStackTrace
                ? InnerException!.ToString() : cause.Message;
        }

        if (includeStackTrace)
            data["StackTrace"] = StackTrace;

        return data;
    }

    public string ToDiagnosticString(bool includeStackTrace = true) =>
        string.Join(Environment.NewLine,
            GetDiagnosticData(includeStackTrace).Select(entry =>
                $"{entry.Key}: {FormatValue(entry.Value)}"));

    private static string FormatValue(object? value) => value switch
    {
        null => string.Empty,
        string text => text,
        _ => JsonSerializer.Serialize(value, DiagnosticJson.Options)
    };

    public string ToJson(bool useCustomDimensionsEnvelope = false)
    {
        IReadOnlyDictionary<string, object?> data = GetDiagnosticData();
        object payload = useCustomDimensionsEnvelope
            ? new Dictionary<string, object?> { ["custom_dimensions"] = data }
            : data;
        return JsonSerializer.Serialize(payload, DiagnosticJson.Options);
    }

    public static string GetExceptionDetails(Exception exception) =>
        exception is MeridianOrderingException known
            ? known.ToDiagnosticString()
            : UnhandledExceptionDiagnostics.ToJson(exception);
}

public static class UnhandledExceptionDiagnostics
{
    public static string ToJson(
        Exception exception, string logEvent = "UnexpectedException",
        ContextualData? context = null)
    {
        Dictionary<string, object?> data = context?.Snapshot() ?? new();
        data["ApplicationName"] = MeridianOrderingException.ApplicationName;
        data["ExceptionType"] = exception.GetType().FullName;
        data["Message"] = exception.Message;
        data["Reason"] = "Unexpected application failure";
        data["Action"] = ExceptionAction.DeveloperActionRequired.ToString();
        data["LogEvent"] = logEvent;
        data["Severity"] = Severity.Critical.ToString();
        data["HttpStatusCode"] = (int)HttpStatusCode.InternalServerError;
        data["Source"] = exception.Source;
        data["HResult"] = exception.HResult;
        data["HelpLink"] = exception.HelpLink;
        data["StackTrace"] = exception.StackTrace;
        data["ExceptionDetails"] = exception.ToString();

        if (exception.InnerException is { } cause)
        {
            data["CausedBy"] = cause.GetType().Name;
            data["Cause"] = cause.Message;
            data["CauseStackTrace"] = cause.StackTrace;
        }

        var attributes = new Dictionary<string, object?>();
        foreach (DictionaryEntry entry in exception.Data)
        {
            if (entry.Key is string name)
                attributes[name] = Normalize(entry.Value);
        }
        data["Attributes"] = attributes;
        return JsonSerializer.Serialize(data, DiagnosticJson.Options);
    }

    private static object? Normalize(object? value) => value switch
    {
        null or string or bool or int or long or decimal => value,
        float number => Normalize((double)number),
        double number => double.IsFinite(number)
            ? (object)number : number.ToString(CultureInfo.InvariantCulture),
        DateTime date => date.ToString("O", CultureInfo.InvariantCulture),
        DateTimeOffset date => date.ToString("O", CultureInfo.InvariantCulture),
        Enum enumeration => enumeration.ToString(),
        Guid identifier => identifier.ToString(),
        FileSystemInfo path => path.FullName,
        byte[] bytes => Convert.ToBase64String(bytes),
        Exception cause => new ExceptionCause(
            cause.GetType().Name, cause.Message, cause.StackTrace),
        _ => $"<{value.GetType().FullName}>"
    };
}

public sealed class ApplicationExceptionJsonConverter
    : JsonConverter<MeridianOrderingException>
{
    public override void Write(Utf8JsonWriter writer,
        MeridianOrderingException value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value.GetDiagnosticData(), options);

    public override MeridianOrderingException Read(ref Utf8JsonReader reader,
        Type typeToConvert, JsonSerializerOptions options) =>
        throw new NotSupportedException("Diagnostics are output-only.");
}

public static class DiagnosticJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
        Converters = { new ApplicationExceptionJsonConverter() }
    };
}
```

`InnerException` retains the original exception object and its causal chain within the process. `Cause` supplies a small immediate-cause view. The diagnostic snapshot includes both the immediate cause and the complete causal rendering, including multiple inner failures when the cause is an aggregate exception. `DownstreamFailure` separately preserves the structured failure received over HTTP, because a remote exception object cannot travel across that boundary as an in-process object.

`ToJson` supports a flat diagnostic object and a `custom_dimensions` envelope for a telemetry adapter requiring that shape. The converter supports writing a value declared as the application base through `System.Text.Json`. Diagnostics describe a failure; reconstructing a throwable exception from stored JSON is a separate capability this example deliberately does not provide.

The unexpected adapter records the standard exception properties and supported values in `Exception.Data`. Provider-specific attributes, such as an SDK's nested error body or source exception, need a provider adapter that extracts their useful facts deliberately. Avoid blindly evaluating every property of a foreign object during failure reporting. Preserve the original provider message after redacting any credentials it contains.

The exception instance belongs to one failing operation. Its supplemental context can be enriched as that failure travels outward; snapshots prevent a diagnostic consumer from altering its stored context. Do not share and mutate one exception instance across unrelated requests.

### Branch defaults and a concrete failure

```csharp
public abstract class MeridianOrderingBusinessException
    : MeridianOrderingException
{
    protected MeridianOrderingBusinessException(string message,
        LogEventBase logEvent, ContextualData? context = null,
        Exception? innerException = null)
        : base(message, logEvent, context, innerException) { }

    public override HttpStatusCode HttpStatusCode => HttpStatusCode.BadRequest;
}

public abstract class MeridianOrderingTechnicalException
    : MeridianOrderingException
{
    protected MeridianOrderingTechnicalException(string message,
        LogEventBase logEvent, ContextualData? context = null,
        Exception? innerException = null)
        : base(message, logEvent, context, innerException) { }

    public override HttpStatusCode HttpStatusCode =>
        HttpStatusCode.InternalServerError;
}

public sealed class OrderPlacementLogEvent : LogEventBase
{
    public static readonly OrderPlacementLogEvent PlaceOrderDataOperation =
        new("PlaceOrderDataOperation");

    private OrderPlacementLogEvent(string value) : base(value) { }
}

public sealed class OrderPlacementCustomerNotFoundException
    : MeridianOrderingBusinessException
{
    public OrderPlacementCustomerNotFoundException(string message, LogEventBase logEvent,
        ContextualData? context = null, Exception? innerException = null)
        : base(message, logEvent, context, innerException) { }

    public override string Reason => "Customer does not exist";
    public override ExceptionAction Action => ExceptionAction.UserActionRequired;
}
```

The branch defaults of 400 and 500 are starting policies. A leaf can specify conflict, not found, unavailable, or another status when the API contract requires it. A customer missing during order placement is a refusal of that request; a missing resource at a customer retrieval endpoint may need a different HTTP translation. Choose deliberately.

## Translate where you understand the external failure

A Gateway owns the application's conversation with an external service. It translates models and failures at that boundary. A Data Manager owns the corresponding store conversation. Their callers should use the application's domain language.

For example, a stored procedure may report that an order's customer does not exist using a documented SQL error number. The Data Manager can translate that number into `OrderPlacementCustomerNotFoundException`:

```csharp
try
{
    await orderCommand.ExecuteNonQueryAsync();
}
catch (SqlException sqlException) when (sqlException.Number == 50001)
{
    throw new OrderPlacementCustomerNotFoundException(
        $"Order placement was rejected because customer '{customerId}' " +
        "does not exist. Supply an existing customer identifier.",
        OrderPlacementLogEvent.PlaceOrderDataOperation,
        new ContextualData
        {
            { "Order.Reference", orderReference },
            { "Order.CustomerId", customerId },
            { "OrderStore.Error", sqlException.Message }
        },
        innerException: sqlException);
}
```

This translation preserves the original exception as the cause and retains the store's message for diagnosis. Other documented SQL failures need their own translations; the catch above makes no claim to handle them.

A file-backed customer store can similarly translate `FileNotFoundException` into customer absence if its storage contract says that a missing customer file means no such customer. If a shared storage file vanished, it represents a storage failure instead. The same framework exception can have different domain meanings.

Translate at the level that knows that meaning. Do not wrap every exception at every method merely because it passed through. An already meaningful application exception can propagate unchanged.


For a service Gateway, preserve the attempted operation, originating application service, downstream service, correlation or originating message identifier, and relevant outbound request data. Keep both a domain explanation and the redacted original provider message. Those facts identify which system failed and what it was trying to do.

The [Gateway article](/writing/gateway-design-pattern/) develops this responsibility. Together with resource-model mapping, exception translation forms an anticorruption boundary: the external service's vocabulary and protocol do not spread through the domain.

## Meaningful handling changes the outcome

Catching an exception intercepts its propagation. Handling it requires a meaningful action. Logging alone is observation; swallowing a failure without a recovery decision conceals it. Catch only when the component understands how to act on that failure. Otherwise, let it travel up the call stack to a component with that responsibility.

Catching merely to log and rethrow repeats observations without changing the application's ability to proceed. Leave failures alone until a component has a defined responsibility for them. The middleware's HTTP translation is such a responsibility: it turns the escaping domain failure into the response the caller must receive.

A bounded retry is meaningful when the component understands a transient failure and can repeat the operation safely. It needs a maximum number of attempts, an appropriate delay, and a final specific failure carrying the cause and attempt context. Rate limiting can call for a different remedy from a service outage. A malformed request should not spend the same retry ladder as a connection interruption.

For example, an HTTP 429 can tell an email Gateway to wait through `Retry-After`, add suitable jitter, and retry within a bounded attempt limit. An SDK may present that condition as an exception; a direct HTTP client may present a response. The Gateway owns the same recovery decision in either case. If an attempt succeeds, it completes the promised work. If the attempts are exhausted, it throws a specific exception such as `ConfirmationEmailRetryExhaustedException`, retaining the final cause and attempt context. The catch earned its place by implementing recovery. It did not make the failed work disappear.

A fallback provider is meaningful when it fulfills the same requirement. A circuit breaker can prevent repeated calls to a known failing dependency. These policies belong with the component owning that conversation. They are not reasons to put broad catch blocks around unrelated business orchestration.

Consider an order-placement requirement that allows a caller to resubmit an order using the same reference: identical content must receive the original outcome, while different content must be refused as an order-reference conflict. The store's unique constraint can report that the reference already exists. The coordinating Manager catches that specific exception, retrieves the existing order, and compares its content with the request to enforce the resubmission rule. A pre-check could lose a concurrent race, so handling the authoritative constraint outcome is part of the business policy.

That is different from catching missing-customer retrieval merely to implement a Boolean existence query method. Here, an attempted write meets an authoritative constraint, and the owning component resolves what that means.

Cleanup and rollback can also justify a catch followed by propagation. Preserve the original failure with `throw;` when rethrowing it from its catch, or attach it as `InnerException` when translating. The [C# reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements) explains the stack-trace distinction. A cleanup failure must not silently replace the failure that initiated cleanup.

## The outer boundary records and translates

A web API normally has two failure categories at its exception boundary:

1. An application exception with a known diagnostic contract and translation policy.
2. An unexpected exception that escaped without that contract.

The first handler adds the request facts available at the boundary, records the failure at its declared severity, and creates the appropriate response. The second records an unexpected failure with critical diagnostic attention and returns a caller-safe 500 response. An unexpected exception is a reason to investigate missing validation, a missing translation, or an implementation defect.

The following is the shape of that boundary. Its collaborators represent the application's explicit request-capture, logging, and HTTP policies:

```csharp
public async Task InvokeAsync(HttpContext httpContext)
{
    try
    {
        await _next(httpContext);
    }
    catch (MeridianOrderingException applicationException)
    {
        applicationException.AddContextualData(
            _requestDiagnostics.CaptureApprovedContext(httpContext));

        _exceptionLogger.Record(applicationException);
        await _httpTranslator.WriteAsync(httpContext, applicationException);
    }
    catch (Exception unexpectedException)
    {
        ContextualData requestContext =
            _requestDiagnostics.CaptureApprovedContext(httpContext);

        _exceptionLogger.RecordUnexpected(unexpectedException, requestContext);
        await _httpTranslator.WriteUnexpectedFailureAsync(httpContext);
    }
}
```

In the usual application, this middleware is the outermost try-catch. The domain detects failures and throws them; ordinary callers let them propagate. The narrowly scoped catches described above exist to satisfy particular business and recovery requirements. An ASP.NET application and a FastAPI application use the same arrangement, although their host APIs differ.

Ordinary domain failures need these two categories. The host must honor its own lifecycle rules. Recognized request cancellation belongs to the host's cancellation policy. Once an HTTP response has started, the translator cannot replace it with a new error response; it must follow the host's termination policy. Streaming endpoints require particular care around that boundary.

Malformed JSON or other input that cannot bind also belongs to the Service Interface Layer. Configure binding and formatting so callers receive the defined transport refusal before the domain operation starts. Keep domain validation and business decisions in the domain rather than duplicating them in controllers.

<!-- diagram:start exception-middleware-enrichment -->
<figure id="exception-middleware-enrichment" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/exception-middleware-enrichment.webp" alt="Exception-handling middleware surrounds a domain operation. A propagated exception and the original request meet at diagnostic enrichment, then produce an internal log record and a separate caller-safe HTTP response." width="1821" height="864" loading="lazy" decoding="async" />
  <figcaption>The exception-handling middleware has both the incoming request and the exception's local context. It combines them for logging, then writes the appropriate HTTP response. Catching here does not resume the failed domain operation.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/exception-middleware-enrichment.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end exception-middleware-enrichment -->

The response needs the correct status and a stable machine-readable explanation. It can use a JSON error body, or an agreed header contract with a human-readable body. The caller should not have to parse an English message to decide whether an error is a business refusal or a temporary failure.

HTTP reason phrases cannot carry that contract across protocol versions: [HTTP/2 has no reason phrase](https://www.rfc-editor.org/rfc/rfc9113.html#section-8.3.2). Put the reason in an explicit response field or header. A service consuming that response can map its defined error contract into its own exception hierarchy at its Gateway.

The service-to-service diagnostic response and the message displayed to an end user have different audiences. A service participating in the diagnostic chain must transport the context its upstream consumer needs. The UI application can record that full approved chain while showing the user only the appropriate business explanation. Define those transport and display policies deliberately, and keep credentials out of either record.

## Carry the failure chain across services

Consider a UI application calling service A, which calls B, which calls C. The requests travel inward through the service chain. A failure detected in C travels back through B and A to the UI application.

C's exception-handling middleware has both the exception thrown by its domain and the incoming request from B. It augments the exception with that request before producing the diagnostic error response. The response includes the concrete failure, its reason and action, the originating service, the correlation identifier, the throw-site context, and the relevant request data. C can also write a service-local log before returning that response.

B's Gateway receives C's HTTP failure. It reads the defined diagnostic payload, translates the failure into B's domain language, and preserves C's complete failure record as `DownstreamFailure`. It adds what B was attempting to do and what it sent to C. If the failure escapes B's domain, B's middleware adds the incoming request from A and sends that combined record upstream.

A follows the same rule. It preserves B's record, including C's record, adds the facts of its own call to B, and includes the incoming UI request at A's boundary. Finally, the UI application records the resulting chain in its **main application log**. That main log is the place used to investigate the UI operation; it can contain the complete failure chain without requiring a separate centralized logging system for all services.

Services may keep their own local logs as well. Those records can help their owners, but reproducing the UI failure should not depend on manually gathering and joining them. The required diagnostic chain already travelled upstream with the failure.

<!-- diagram:start service-failure-diagnostic-chain -->
<figure id="service-failure-diagnostic-chain" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/service-failure-diagnostic-chain.webp" alt="Requests travel from a UI through services A and B to C. A failure at C returns over HTTP; B and A each retain the downstream failure record inside their own enriched record. The UI's main log contains the complete A, B, C diagnostic chain." width="1821" height="864" loading="lazy" decoding="async" />
  <figcaption>C supplies the original failure record. B and A preserve that record while adding their own context and incoming request. The UI application receives the whole chain and records it in its main log; services may also log locally.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/service-failure-diagnostic-chain.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end service-failure-diagnostic-chain -->

The wire model above makes that nesting explicit. Each `ServiceFailureData` records one service's view and links to the downstream record. `ToServiceFailureData` builds the current hop from the enriched exception; the HTTP translator serializes that value as the service's diagnostic error body. Its originating-service field names where that hop's exception arose. Following the downstream records identifies the original failure in C. Keep that root distinguishable from the service currently translating the failure. A failure detected in C must not appear to have originated in A merely because A sent the final HTTP response.

Within one process, `InnerException` preserves an exception object. Across HTTP, serialize a defined diagnostic model. Recreating only an exception with the remote message loses the structured request and failure facts that make the chain useful. The Gateway can attach the received model directly:

```csharp
ServiceFailureData downstreamFailure =
    await _failureReader.ReadAsync(errorResponse, cancellationToken);

var applicationException = new DownstreamOrderServiceException(
    "The order service could not complete the request.",
    ServiceLogEvent.RequestOrder,
    new ContextualData
    {
        { "Operation", "Request order from service B" },
        { "DownstreamService", "B" },
        { "CorrelationId", correlationId },
        { "Order.Reference", orderReference }
    });

applicationException.AttachDownstreamFailure(downstreamFailure);
throw applicationException;
```

This sketch leaves the operation-specific exception, log event, and validated wire reader to that service. The reader must check the agreed payload contract. A response that cannot supply valid diagnostic data is itself an integration failure; preserve the available response status and approved response content instead of inventing a remote cause.

At each hop, capture relevant inputs and outputs, including the outbound request and downstream diagnostic response. Use service-qualified names so B's incoming request cannot overwrite C's throw-site facts. Carry the same operation correlation identifier through the chain. Give the transport model a version when its shape becomes a shared service contract.

That record lets a developer reproduce the problem at C using C's request and local values, or follow the full UI call using the captured requests and responses at each hop. The speed of diagnosis depends heavily on how much useful information survives into the main log. Capturing it when the failure occurs avoids relying on someone's memory of the call.

## One diagnostic record with the relevant facts

For an escaping failure, let the outermost responsible handler write its diagnostic record. Intermediate components can attach context without logging the same exception again. That produces a record containing the application meaning, original cause, local values, and boundary request facts together.

Capture relevant input in a form that can help reproduce the failure. That may include a redacted request snapshot, approved headers, customer and order identifiers, the attempted downstream operation, and the specific data element violating the rule. Buffer or capture permitted request data before the body is consumed; a handler cannot assume the original body is still readable after processing fails.

## Application Insights custom dimensions

The contextual data is intended to become structured logging properties. In Application Insights, those properties appear as **custom dimensions**, exposed as `customDimensions` in its application-scoped log tables. Other structured logging systems provide the same capability under their own property or attribute conventions.

The logger must map the snapshot into those properties. A JSON object named `custom_dimensions`, or a formatted diagnostic string written as the message, does not by itself configure Application Insights ingestion. The telemetry adapter has to supply the values through its supported property mechanism. The [Application Insights telemetry model](https://learn.microsoft.com/en-us/azure/azure-monitor/app/data-model-complete) describes custom properties on telemetry items.

Store fields such as `ExceptionType`, `Action`, `OriginatingService`, `DownstreamService`, `Order.Reference`, and `Customer.Id` as separate dimensions. For a distributed failure, retain the full nested chain and promote useful facts about its root cause into stable dimensions such as `Failure.OriginatingService` and `Failure.ExceptionType`. Promote those facts from the actual originating record, rather than the last service to wrap it.

A log query can then identify a particular failure without searching prose:

```kusto
exceptions
| where tostring(customDimensions["Failure.OriginatingService"]) == "C"
| where tostring(customDimensions["Order.Reference"]) == "ORDER-1042"
| project timestamp, problemId, customDimensions
```

This example uses the Application Insights application-scoped `exceptions` schema. When querying the underlying workspace's [`AppExceptions` table](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/appexceptions), the corresponding property column is `Properties` and the timestamp is `TimeGenerated`. Match the query to the scope in use.

The same dimensions support filters for user-correctable refusals, provider timeouts, and failures requiring infrastructure action. They can feed dashboards and [log search alert rules](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule). A support engineer can open a matching record, inspect the boundary request and local values, and reproduce the failure using the captured facts.

<!-- diagram:start exception-context-custom-dimensions -->
<figure id="exception-context-custom-dimensions" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/exception-context-custom-dimensions.webp" alt="Incoming request information and throw-site context form an exception diagnostic record. Application Insights stores individual custom dimensions including ExceptionType, Failure.OriginatingService, Order.Reference, CorrelationId, and CauseChain, supporting filtering, frequency alerts, and reproduction." width="1942" height="809" loading="lazy" decoding="async" />
  <figcaption>Useful context becomes searchable custom dimensions. Expose the originating service and other filter fields individually, preserve the cause chain, and use the captured request and relevant state to reproduce the problem.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/exception-context-custom-dimensions.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end exception-context-custom-dimensions -->

Retain the chain as structured data or a defined JSON property, and keep the dimensions used for filtering individually accessible. Check the telemetry adapter's limits on property size and retained data. A truncated diagnostic chain cannot support the complete investigation the design intends, so large reproduction records may need approved durable storage with a reference carried in the log.

I generally avoid informational logging that narrates every step of an otherwise dependable call chain. A complete failure record removes much of the reason for those “entered method” and “leaving method” messages. Business audit records, operational measurements, and evidence of required recovery work still serve their own purposes. A component that deliberately handles a failure and continues must fulfill whatever recording obligation that policy defines; the outer exception handler will never see a swallowed failure.

Exceptions also integrate with debugger, profiler, and runtime instrumentation. Explicit types and clear causes make those tools more useful without requiring every caller to implement another failure-reporting convention.

Request context greatly improves reproduction, but a request alone cannot reproduce every incident. Changing database state, concurrency, provider responses, and configuration versions can matter. Capture those facts when the scenario needs them, and describe remaining uncertainty honestly. Keep failure reporting reliable: serialization and logging problems must not conceal the initiating failure.

## Turn an unexpected failure into an explicit contract

An unexpected-exception record is a starting point for investigation. Determine why the failure escaped as an unclassified framework or vendor exception. Correct the producer of invalid internal data, add missing boundary validation, or define a specific translation at the external boundary that understands it.

Then verify the behavior. For a business refusal, inspect the concrete type, message, remedy, and context, together with the side effects the failed request must not leave. For a technical failure, preserve its cause and verify the resulting durable state. Verify that the HTTP boundary writes the intended status and safe explanation while keeping internal details in the diagnostic record.

Useful measures include how often unexpected failures escape, how long diagnosis takes, whether support can identify the responsible service, and whether users can correct a refusal from its message. A more explicit system can reduce unexpected failures as previously unknown scenarios gain validation, translation, and tests. That improvement has to be observed in the system; the hierarchy alone cannot guarantee it.
