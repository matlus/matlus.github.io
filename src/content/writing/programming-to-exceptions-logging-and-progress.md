---
title: "Programming to Exceptions, Part 3: Logging and Progress"
description: "Each failure is logged once at the entry point, with its facts as Application Insights custom dimensions for KQL queries and alerts. A shared progress logger reports long-running work."
datePublished: 2019-10-28
dateModified: 2026-10-02
tags: [error-handling, structured-logging, architecture, acceptance-testing, progress-reporting, csharp]
draft: false
hero: programming-to-exceptions-logging-and-progress
youtube: "https://www.youtube.com/watch?v=5IKczyor-f4"
youtubeLabel: "Programming to Exceptions: the companion recording"
---


[Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) ended with one log record that explains a failure. The support team can read it and know which operation failed, why, what kind of problem it is, and which order and request were involved, without calling a developer.

That record is only useful if someone can find it. When a customer calls about order `ORD-20261102-0042`, the person on the support team needs to find that order's failure in seconds. And some work never fails at all. It just runs for hours, and somebody wants to know how far it has got.

This part covers both. We'll build it one step at a time:

1. Deciding what goes in the log.
2. Logging each failure once, at the entry point.
3. Letting the host decide where log records go.
4. Making the record searchable in Application Insights.
5. Reporting progress for work that takes a long time.
6. One progress logger for the whole run.
7. Capturing what you need to reproduce a failure.
8. Testing the record people will actually use.

<span id="give-each-record-a-purpose"></span>

## Step 1: Decide what goes in the log

Every record in the log should be there for a reason. In this design, there are two main reasons.

**A failure.** Something couldn't be done, and the exception arrived at the entry point carrying its explanation. That's the record from Part 2.

**Progress.** A long-running job is still working, and the people watching it want to know which step it's on and how much is done. Steps 5 and 6 cover this.

Your application may have other records with their own defined purposes, such as a business audit trail or operational measurements. Those are requirements, and you design them deliberately, like any other feature.

What doesn't belong in the log is a running commentary. You've probably seen logs full of lines like "Entering PlaceNewOrder," "Calling GetCustomer," "Leaving PlaceNewOrder." They make the log bigger, they cost money to store, and when something does fail, they leave someone to piece the story together from hundreds of lines. The exception already tells that story, in one record. So I don't write those lines.

<span id="record-the-escaping-failure-at-the-outer-boundary"></span>

## Step 2: Log each failure once, at the entry point

Part 2 showed the middleware at the entry point catching every failure that escapes the domain code. It adds the request data, redacts personal information, logs the record and writes the response. That's the one place a failure gets logged.

Nothing else logs it. The methods between the throw and the entry point let the exception travel. A method may add contextual data on the way up, as in Part 2, but it doesn't log. If every method in a call chain six levels deep catches, logs and rethrows, the same failure lands in the log six or seven times, and the copies add nothing. The entry point is where all the facts finally come together, and that's why it's the right place to write them down.

With several services, each service's entry point does the same thing for the failures that reach it. A service can keep its own log of the failures it reports. The UI application at the top of the chain receives the whole chain, as Part 2's [Step 8](../programming-to-exceptions-diagnostics-and-boundaries/#carry-the-failure-chain-across-services) showed, and its log has everything needed to investigate the whole request.

There is one case where a failure is logged somewhere else: when code really handles it. Part 2 defined handling as doing something that changes the outcome. Suppose the email gateway retries, and the third attempt succeeds. There's no exception anymore. The confirmation email went out, and the entry point will never hear about the first two attempts. If you want to know that the email service is struggling, the gateway is the only place that knows, so it records a warning right there. A routine recovery like this can be logged as Information. A recovery that's unusual but acceptable can be a Warning. Either way, keep these records separate from real failures, so an alert about failures doesn't fire every time a retry succeeds.

<span id="keep-provider-wiring-in-the-host"></span>

## Step 3: Let the host decide where records go

Part 2's middleware handed each record to an `ExceptionLogger`. That class belongs to the application. Where its records end up is a different question, and only the host answers it.

The host is the program that starts the application: `Program.cs` in an ASP.NET Core Web API. It's the one place that knows whether this deployment sends logs to Application Insights, to the console, to a file, or to all three. None of the classes that do the application's work should know any of that. They shouldn't create loggers for a particular product or decide where records go. When the destination changes, only the host changes.

Here's the record the redactor produces, and the logger that writes it:

```csharp
public sealed record DiagnosticRecord(string ExceptionType, string Message, Severity Severity, IReadOnlyList<KeyValuePair<string, object?>> Properties);
```

```csharp
public sealed class ExceptionLogger(ILogger<ExceptionLogger> logger)
{
    public void Log(DiagnosticRecord diagnosticRecord)
    {
        WriteDiagnosticRecord(ToLogLevel(diagnosticRecord.Severity), "{ExceptionType}: {FailureMessage}", diagnosticRecord);
    }

    public void LogUnexpected(DiagnosticRecord diagnosticRecord)
    {
        WriteDiagnosticRecord(LogLevel.Error, "Unexpected {ExceptionType}: {FailureMessage}", diagnosticRecord);
    }

    private void WriteDiagnosticRecord(LogLevel logLevel, string messageTemplate, DiagnosticRecord diagnosticRecord)
    {
        using (logger.BeginScope(diagnosticRecord.Properties))
        {
            logger.Log(logLevel, messageTemplate, diagnosticRecord.ExceptionType, diagnosticRecord.Message);
        }
    }

    private static LogLevel ToLogLevel(Severity severity) => severity switch
    {
        Severity.Verbose => LogLevel.Debug,
        Severity.Information => LogLevel.Information,
        Severity.Warning => LogLevel.Warning,
        Severity.Error => LogLevel.Error,
        Severity.Critical => LogLevel.Critical,
        _ => LogLevel.Error
    };
}
```

`ILogger` is .NET's standard logging interface. The logger doesn't know or care which products are listening on the other side of it.

Look at how the record's properties travel. `Properties` holds everything from Part 2's record: the reason, the action, the log event, the contextual data, the request data and the stack trace. `BeginScope` attaches all of them to the log entry as separate named properties. The two values in the message template, `{ExceptionType}` and `{FailureMessage}`, become named properties too. So the entry has a readable message, and every fact is also stored on its own, with its own name.

Notice also what the logger doesn't receive: the exception object. The redactor has already removed personal information from the message and the properties. If the logger were handed the exception as well, the provider would record the exception's original message, and the redaction would be wasted. The stack trace travels as one of the properties instead.

Now the host:

```csharp
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.Configure<OpenTelemetryLoggerOptions>(openTelemetryLoggerOptions => openTelemetryLoggerOptions.IncludeScopes = true);
builder.Services.AddSingleton<ExceptionLogger>();
```

The first line connects the application's logging to Application Insights. The second one matters more than it looks. Application Insights 3.x is built on OpenTelemetry, and OpenTelemetry leaves scope values out unless you turn them on. Without that line, every property passed to `BeginScope` is silently dropped, and you're left with only the message. Version 2.x included scope values by default, which is why this catches people who upgrade. [Microsoft's migration guidance](https://github.com/microsoft/ApplicationInsights-dotnet/blob/main/MigrationGuidance.md) describes the change.

Whatever SDK and version you deploy, check the result for yourself. Cause one failure, open the record in Application Insights, and confirm every property arrived on its own.

<span id="application-insights-custom-dimensions"></span>

## Step 4: Make the record searchable

In Application Insights, those named properties are called **custom dimensions**. They appear in a column named `customDimensions` on each log entry, and you can filter and group by any one of them. Other structured logging systems have the same idea under their own names, such as properties or attributes.

That's the point of everything Part 2 did with key names. Because `Order.Reference` is stored as its own dimension, finding every failure for one order is a simple query. Application Insights uses a query language called KQL, the Kusto Query Language:

```kusto
traces
| where tostring(customDimensions["Order.Reference"]) == "ORD-20261102-0042"
| project timestamp, message, customDimensions
```

`traces` is the table where Application Insights stores log entries written without an exception object, which is how the `ExceptionLogger` writes them. If you query the underlying Log Analytics workspace directly, the same entries are in the [`AppTraces` table](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/apptraces), where the column is called `Properties` and the timestamp is `TimeGenerated`.

The same dimensions drive alerts. Part 2's Step 7 said that a technical exception asks for attention when it repeats, and that you set alerts on specific exception types. This query finds every confirmation email that couldn't be sent:

```kusto
traces
| where tostring(customDimensions["ExceptionType"]) == "ConfirmationEmailRetryExhaustedException"
```

Make it a [log search alert rule](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-create-log-alert-rule) that counts the results over ten minutes and fires above fifty, and you'll hear about trouble with the email service before customers start calling. You can filter the same way on `Action` to find every failure that needs infrastructure work, or on `LogEvent` to see everything that failed in one operation.

<!-- diagram:start exception-context-custom-dimensions -->
<figure id="exception-context-custom-dimensions" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/exception-context-custom-dimensions.webp" alt="Incoming request information and throw-site context form an exception diagnostic record. Application Insights stores individual custom dimensions including ExceptionType, Failure.OriginatingService, Order.Reference, CorrelationId, and CauseChain, supporting filtering, frequency alerts, and reproduction." width="1942" height="809" loading="lazy" decoding="async" />
  <figcaption>Useful context becomes searchable custom dimensions. Expose the originating service and other filter fields individually, preserve the cause chain, and use the captured request and relevant state to reproduce the problem.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/exception-context-custom-dimensions.webp">Open full-size diagram</a></p>
</figure>
<!-- diagram:end exception-context-custom-dimensions -->

### Searching across services

The chain from Part 2's Step 8 needs one more thing. The UI's record nests B's record under `DownstreamFailure`, and B's record nests C's. That whole chain is stored as one property, so nothing is lost. But the most useful facts are at the bottom of it: the service where the failure started and the exception it threw.

So the logger at the top of the chain copies those two facts out of the innermost record and stores them as dimensions of their own, `Failure.OriginatingService` and `Failure.ExceptionType`. They must come from the innermost record. Service A sent the last response, but the failure started in C. Now you can ask which services are causing failures, and what kind:

```kusto
traces
| where tostring(customDimensions["Failure.OriginatingService"]) == "C"
| summarize Occurrences = count() by FailureExceptionType = tostring(customDimensions["Failure.ExceptionType"])
```

### Watch the size

Application Insights limits how long each property value can be. A large chain, or a large request, can be cut short, and a truncated record can't support the investigation it was designed for. Check the limits for the SDK you use. When a record really is too large, store the full record somewhere durable that your team is allowed to use, and put a reference to it in the log.

<span id="long-running-work-needs-deliberate-progress-events"></span>

## Step 5: Report progress for long-running work

So far, every record has been about a failure. Some work needs another kind.

In the document-processing system I mentioned in Part 2, a single run read thousands of documents. For each one, it extracted the text, built the metadata and stored the results. A run could take hours. While it was running, there was no failure to report, and an exception can't tell you which step a document that's still being processed has reached. People wanted to know: where is it, how much is done, and is it stuck? Only the process itself could answer that, so it had to report its progress.

Progress uses the same vocabulary as exceptions. In Part 2, every exception carried a log event, a stable value naming the operation that failed. The processing steps get log events of their own:

```csharp
public sealed class DocumentProcessingLogEvent : LogEventBase
{
    public static readonly DocumentProcessingLogEvent TextExtraction = new("Step_2.4_TextExtraction");
    public static readonly DocumentProcessingLogEvent MetadataExtraction = new("Step_2.5_MetadataExtraction");

    private DocumentProcessingLogEvent(string value) : base(value) { }
}
```

The value carries the step's number, so the steps sort in order and you can talk about "step 2.4" with anyone on the team. The same value appears in a progress record and in any exception thrown during that step. When text extraction fails, the last progress line and the failure record name the same step.

Report progress at the boundaries of each step. Announce the step, do the work, then announce that it's done:

```csharp
private ExtractedDocument ExtractText(Document document)
{
    _progressLogger.StepStarted(DocumentProcessingLogEvent.TextExtraction, document.Id);
    ExtractedDocument extractedDocument = _textExtractor.Extract(document);
    _progressLogger.StepCompleted(DocumentProcessingLogEvent.TextExtraction, document.Id, extractedDocument.PageCount);
    return extractedDocument;
}
```

If `Extract` throws, the code never reaches `StepCompleted`. That's exactly what you want. The exception travels to the entry point with its step and its document, and the log never claims a step finished when it didn't. For the same reason, don't put the completion call in a `finally` block. A `finally` block runs whether the work succeeded or failed, so it would report success for failed work.

Inside a long step, report how much has been done:

```csharp
foreach (DocumentPage documentPage in document.Pages)
{
    extractedDocumentPages.Add(ExtractPage(documentPage));
    _progressLogger.StepProgress(DocumentProcessingLogEvent.TextExtraction, document.Id, extractedDocumentPages.Count, document.Pages.Count);
}
```

"12 of 40 pages" tells the person watching how far the step has got and, with the elapsed time, how fast it's going. If the count hasn't moved in ten minutes, something is stuck. Choose an interval that suits the work. Every page is fine for a 40-page document. For a step that processes a million rows, report every ten thousand. Don't report every tiny operation, and don't write the document's contents into the log.

<span id="one-progress-logger-owns-the-presentation"></span>

## Step 6: One progress logger for the whole run

Notice that the processing code above only supplies facts: which step, which document, how many pages. It doesn't format a message. That's the progress logger's job, and there's one progress logger for the whole run.

The progress logger is created for one run, so it already knows the run's identifier. It owns the message wording, the readable step names and the property names. If every processor wrote its own banners, you'd end up with ten different formats, and nobody could write one query that covers them all.

Each progress record carries the same named properties:

| Property | What it identifies |
| --- | --- |
| `Run.Id` | The processing run. |
| `Document.Id` | The document being processed. |
| `LogEvent` | The step, such as `Step_2.4_TextExtraction`. |
| `Progress.State` | Started, in progress or completed. |
| `Progress.CompletedCount` | How much of the step is done. |
| `Progress.TotalCount` | How much there is in total, when it's known. |
| `Progress.ElapsedMilliseconds` | How long the step has taken so far. |

The run identifier and document identifier matter when two runs overlap, or when many documents are processed at once. Without them, you can't tell whose progress a line describes.

The same facts also produce a line a person can read. The progress logger turns `Step_2.4_TextExtraction` into "Step 2.4 Text extraction," so a run file looks like this:

```text
Run 20261102_141500_invoices, started 14:15:00
Step 2.4 Text extraction started: document INV-2291
Step 2.4 Text extraction: 12 of 40 pages
Step 2.4 Text extraction: 40 of 40 pages
Step 2.4 Text extraction completed: document INV-2291, 40 pages in 8.2 seconds
```

Where these records go is the host's decision again. I send progress to the console and to a file for each run, where the person watching the job can read it. Application Insights gets the failures. Progress goes there too only when someone needs to query it or build a dashboard from it, because sending every progress line costs money and makes the failures harder to find. A third-party SDK's own progress and retry messages are part of the same decision, and the host sets their levels. [Logs and Artifacts: Pipeline Breadcrumbs](../pipeline-breadcrumbs/) builds this kind of step logging out in full, together with the files each step saves.

One last point about the step values. Once a query, a dashboard or an alert uses `Step_2.4_TextExtraction`, that value is part of a contract. If you reorganize the pipeline and quietly rename the step, the dashboard goes blank and nobody notices until it matters. Keep established values, or change them on purpose and update everything that uses them. The readable names and the order the steps are displayed in can change freely.

<span id="reproduction-needs-the-relevant-state"></span>

## Step 7: Capture what you need to reproduce

Part 2 asked a question to decide what contextual data to capture: when this exception shows up in the log, what will I need to know to understand the problem and reproduce it? The record from Part 2 answers most of it: the request, the values at the throw, the step that failed, and the chain of causes.

Sometimes reproduction needs more than that. A failure may depend on what was in the database at the time, how a downstream service responded, which version of the configuration was running, or what other work was happening at the same moment. When one of those facts affects the scenario, capture it. A copy of the request alone can't promise that every failure can be reproduced.

Keep the facts that explain the fix, too. A configuration failure should name the setting, the value it rejected, the range or units it accepts, and what to do about it. Redaction protects credentials and personal information, and leaves ordinary operational facts readable. A connection string that won't parse can report where the error is and what syntax was expected without repeating a password that may be in it. Cutting off the end of a value that contains a secret doesn't count as redaction, because part of the secret may still be there.

Finally, logging itself can fail. The serializer can throw on an unusual value, or Application Insights can be unreachable. When that happens, the original failure must not disappear with it. Decide in the host what happens when the preferred destination isn't available: at the very least, write the exception type, the message and the correlation identifier to the console, so there's still something to start from.

<span id="verify-the-record-people-will-actually-use"></span>

## Step 8: Test the record people will actually use

A test that only checks whether a logging method was called proves very little. The tests should check the record someone will open when something goes wrong.

An acceptance test supplies known input, causes one specific failure, and then reads the record that was actually written. For the confirmation email failure, that means checking:

- The exception type is `ConfirmationEmailRetryExhaustedException`.
- The message says what happened and what to do, using the values from this request.
- The reason, action and log event are the ones that failure should have.
- The contextual data has the attempt count, the last status code and the order reference.
- The request data is present, with personal information redacted.
- The HTTP response has the right status and the caller-safe message. Test this separately from the log record, because the two have different readers.

Then check the things that only show up once the real logging configuration is in place. Each property should arrive as its own custom dimension. The readable message and the properties should describe the same failure. When several pieces of work fail together, every one of their failures should be recorded. For a chain of services, the record should name the service where the failure started and keep what each service added.

For long-running work, check that the started and completed records for a step carry the same run, document and step, that the counts mean what they claim, and that failed work never produces a completed record. And check that the progress records you rely on still appear with the log levels you run in production.

These tests prove that the log contains the evidence people will need. When the support team can find the failure, read what happened and recover the inputs that caused it, the team can reproduce the problem and confirm the fix much sooner.

## Bringing the series together

[Programming to Exceptions, Part 1: Method Contracts and Failure](../programming-to-exceptions-method-contracts/) gave every method a simple promise: do the work or throw, return what was asked for or throw. [Programming to Exceptions, Part 2: Diagnostics and Boundaries](../programming-to-exceptions-diagnostics-and-boundaries/) made each exception carry everything needed to understand it, and gave the entry point the job of recording it. This part made that record easy to find, added progress for work that takes a long time, and tested that both say what they should.

Put together, the code that does the work stays simple, every failure is recorded once with the facts to explain it, and the people running the system can see what's happening without asking the developers who wrote it.
