---
title: "The Test Mediator and the Transport Spy"
description: "A Test Mediator and transport spy control delivery and expose observations while production gateways run. Capture email content, script retries, and measure bounded response reads."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "mocking", "error-handling", "test-mediator", "transport-spy", "factory-pattern", "service-locator", "gateway-pattern", "design-patterns", "architectural-patterns", "csharp"]
hero: the-test-mediator-and-the-transport-spy
---

The ordering application must send a confirmation to the customer. Our test
needs to establish that the recipient, subject, and body are correct. It also
needs to avoid sending test messages to real customers.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

That gives us two practical problems: control outbound delivery and retain the
values needed for assertions. A Test Mediator and a transport spy provide the
communication between the test and that observation point.

We will use the same email example as the
[main article](/writing/functional-acceptance-testing-at-the-boundary/#the-email-problem-and-the-two-ways-to-handle-it).
Meridian deliberately has no separate running email service because it is a
teaching application. It captures the request and supplies an arranged response.
We will also explain the production arrangement with a stable real provider and
a controlled inbox.

The goal is confidence to go to production after the business requirements,
acceptance criteria, functional requirements, and non-functional requirements
are established and the scenarios and expectations verified as correct. The
observation boundary chosen for each scenario determines its available evidence.

## Give the test a two-way communication path

- **The Test Mediator** carries instructions and exposes observations for assertions.
- **The spy** sits at the selected boundary, follows those instructions, and
  records what reached it.

Arrange can specify a service-unavailable response. The spy turns that instruction
into the HTTP response seen by the production gateway. After Act, the test reads
the recorded recipient, subject, body, path, and request timing.

The PWI pattern has two implementation shapes. A separate carrier can be shared
by several spies. Alternatively, one service's Test Mediator can contain its spy.
Meridian uses the second shape: TestMediatorEmailService contains a private HTTP
message handler. The test uses its public instructions and captures without
depending on how internal production classes pass the request along.

This Test Mediator is the testing pattern described in the
PWI chapter.
It is distinct from the GoF Mediator pattern.

## Capture the confirmation at the transport boundary

<!-- diagram:start mediator-transport-seam -->
<figure class="article-diagram">
<svg id="mediator-transport-seam" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 590" role="img" aria-labelledby="mediator-transport-seam-title mediator-transport-seam-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="mediator-transport-seam-title">Capture at the transport seam</title>
<desc id="mediator-transport-seam-desc">The test configures a mediator and reads its captures. Production domain code and the real email gateway compose and handle the request. The mediator HTTP handler records it and returns an arranged response; it does not deliver email.</desc>
<defs><marker id="mediator-transport-seam-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="30" y="30" width="580" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="320.0" y="77.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Test arranges instructions</tspan><tspan x="320.0" dy="33">and reads captured requests</tspan></text><path d="M 320 140 L 320 185" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#mediator-transport-seam-arrow)"/><rect x="65" y="190" width="510" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="320.0" y="237.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Production domain and gateway</tspan><tspan x="320.0" dy="33">compose request; handle response</tspan></text><path d="M 320 300 L 320 350" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#mediator-transport-seam-arrow)"/><rect x="65" y="355" width="510" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="320.0" y="402.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Test Mediator at HTTP transport</tspan><tspan x="320.0" dy="33">capture request; script response</tspan></text><path d="M 570 355 L 570 215" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#mediator-transport-seam-arrow)"/><text x="320" y="530" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Production response handling still runs</tspan><tspan x="320" dy="33">No real email provider receives this request</tspan></text><path d="M 65 410 H 15 V 85 H 30" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#mediator-transport-seam-arrow)"/>
</svg>
<figcaption>Meridian keeps the production gateway and response handling. Its combined Test Mediator records the outgoing request and supplies a scripted transport response.</figcaption>
</figure>
<!-- diagram:end mediator-transport-seam -->

The real email gateway constructs an HTTP request. Its HttpClient receives a
handler supplied by the service locator. In the test graph, that handler comes
from TestMediatorEmailService:

<!-- Listing source: tests/MeridianOrdering.TestSupport/MediatorEmailService.cs; method: CreateHttpMessageHandler -->

```csharp
/// Arrange: create the handler paired with this Test Mediator.
public HttpMessageHandler CreateHttpMessageHandler()
{
    return new SpyingHttpMessageHandler(this);
}
```

The private SpyingHttpMessageHandler forwards SendAsync to its owning Test Mediator.
Here is the complete method that processes the request:

<!-- Listing source: tests/MeridianOrdering.TestSupport/MediatorEmailService.cs; method: HandleEmailServiceRequestAsync -->

```csharp
/// Observe: capture the wire values and construct the arranged response.
private async Task<HttpResponseMessage> HandleEmailServiceRequestAsync(HttpRequestMessage emailServiceRequest)
{
    if (_simulateUnreachable)
    {
        throw new HttpRequestException("the email service endpoint is unreachable (simulated by TestMediatorEmailService)");
    }

    string requestContentJson = emailServiceRequest.Content is null
        ? string.Empty
        : await emailServiceRequest.Content.ReadAsStringAsync();
    ScriptedEmailServiceResponse scriptedResponse;
    lock (_captureLock)
    {
        scriptedResponse = ResolveScriptedResponse();
        _capturedEmailRequests.Add(JsonSerializer.Deserialize<CapturedEmailRequest>(requestContentJson)!);
        _capturedRequestPaths.Add(emailServiceRequest.RequestUri!.AbsolutePath);
        _capturedRequestArrivalSeconds.Add(Stopwatch.GetElapsedTime(0).TotalSeconds);
    }

    var emailServiceResponse = new HttpResponseMessage((HttpStatusCode)scriptedResponse.StatusCode);
    if (scriptedResponse.RetryAfterSeconds is not null)
    {
        emailServiceResponse.Headers.Add("Retry-After", scriptedResponse.RetryAfterSeconds.Value.ToString(System.Globalization.CultureInfo.InvariantCulture));
    }

    if (scriptedResponse.ResponseBody is not null)
    {
        int responseBodyIndex;
        lock (_captureLock)
        {
            responseBodyIndex = _capturedResponseBodyBytesReadByResponse.Count;
            _capturedResponseBodyBytesReadByResponse.Add(0);
        }

        emailServiceResponse.Content = new StreamContent(new ReadCountingResponseBodyStream(this, responseBodyIndex, scriptedResponse.ResponseBody));
    }

    return emailServiceResponse;
}
```

Read the sequence:

1. Simulated unreachability throws before a request is recorded.
2. Otherwise the method reads the body produced by the real gateway.
3. It deserializes the captured wire model and records the path and arrival time.
4. It constructs the scripted status, optional Retry-After header, and optional body.
5. It returns the response to the production gateway.

The typed capture maps recipient_email_address, subject, body, and order_reference.
The Test Mediator source
contains those models, constructors, the private handler, response sequencing,
and the lazy response stream with no omitted implementation.

Meridian's normal success arrangement returns HTTP 200. Nothing is forwarded to
an email provider. The actual email values are the captured submission, compared
with the arranged customer's address and expected confirmation.

## Create the operation and its capture together

The test must inspect the capture object used by its own facade. Creating one
for the facade and another for assertions would leave the assertions reading an
object that observed nothing.

Here is the complete paired factory:

<!-- Listing source: tests/MeridianOrdering.TestSupport/ServiceLocatorTesting.cs; method: CreateDomainFacade -->

```csharp
/// Arrange: return the facade and observation objects wired into it.
public static (DomainFacade DomainFacade, TestMediatorEmailService TestMediatorEmailService, LoggerTesting LoggerTesting) CreateDomainFacade(
    IReadOnlyDictionary<string, string>? overrideByEnvironmentVariableName = null,
    TestMediatorEmailService? testMediatorEmailService = null,
    LoggerTesting? loggerTesting = null)
{
    var pairedTestMediatorEmailService = testMediatorEmailService ?? new TestMediatorEmailService();
    var pairedLoggerTesting = loggerTesting ?? new LoggerTesting();
    var domainFacade = new DomainFacade(
        new ServiceLocatorTesting(overrideByEnvironmentVariableName, pairedTestMediatorEmailService, pairedLoggerTesting));
    return (domainFacade, pairedTestMediatorEmailService, pairedLoggerTesting);
}
```

The testing service locator
retains the real configuration provider, supplies the Test Mediator's handler,
and supplies the capturing logger. Scenario configuration overrides are layered
on shared configuration rather than changing process settings for other tests.

A fresh Test Mediator starts with a fresh script and captures. Use one per scenario,
or deliberately share it across the Acts of a scenario needing cumulative observations.
Independent tests get independent instances. Capture writes are locked; tests
normally take snapshots after awaiting the operation.

## Preserve production behavior above the handler

The seam retains the facade, orchestration, composer, gateway, HTTP request
construction, response classification, retry policy, and error translation. The
production gateway
shows those paths. Database writes and broker publication use real infrastructure.

Refactoring an internal class behind the same observable contracts should not
require changing assertions about confirmation content. Changing the email
protocol requires updating the capture model or response arrangement and
independently verifying that support. The spy's wire contract is maintained code.

Capture establishes what the gateway submitted under the arranged conditions.
Physical network acceptance and inbox arrival require real-delivery observations.

## Redirect real delivery and read the inbox

<!-- diagram:start redirected-email-delivery -->
<figure class="article-diagram">
<svg id="redirected-email-delivery" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 745" role="img" aria-labelledby="redirected-email-delivery-title redirected-email-delivery-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="redirected-email-delivery-title">Two observations for real delivery</title>
<desc id="redirected-email-delivery-desc">A proposed real-provider arrangement preserves the original customer request, forwards a copy with a controlled recipient, and reads the correlated delivered message. The original capture and the inbox observation answer different questions.</desc>
<defs><marker id="redirected-email-delivery-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="65" y="25" width="510" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="320.0" y="72.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Capture the original request</tspan><tspan x="320.0" dy="33">customer recipient and content</tspan></text><path d="M 320 135 L 320 180" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#redirected-email-delivery-arrow)"/><rect x="65" y="185" width="510" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="320.0" y="216.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Copy for forwarding</tspan><tspan x="320.0" dy="33">replace recipient with test</tspan><tspan x="320.0" dy="33">address</tspan></text><path d="M 320 295 L 320 340" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#redirected-email-delivery-arrow)"/><rect x="65" y="345" width="510" height="110" rx="10" style="fill:var(--diagram-requirements-splunk-fill);stroke:var(--diagram-requirements-splunk);stroke-width:2"/><text x="320.0" y="392.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Stable real email provider</tspan><tspan x="320.0" dy="33">send to controlled test inbox</tspan></text><path d="M 320 455 L 320 500" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#redirected-email-delivery-arrow)"/><rect x="65" y="505" width="510" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="320.0" y="552.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320.0" dy="0">Read the correlated inbox message</tspan><tspan x="320.0" dy="33">compare delivered subject and body</tspan></text><text x="320" y="680" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Original capture verifies intended recipient</tspan><tspan x="320" dy="33">Inbox read verifies redirected delivery</tspan></text>
</svg>
<figcaption>For real delivery, preserve the original capture and redirect a forwarded copy. Compare the intended customer communication and the delivered message in the controlled inbox.</figcaption>
</figure>
<!-- diagram:end redirected-email-delivery -->

With a stable provider, such as SendGrid, the production arrangement can continue
past capture:

1. Prepare a unique, routable test address or alias and access to its inbox.
2. Capture the original customer recipient, subject, body, and order reference.
3. Preserve that capture unchanged. Replace the recipient in the forwarded
   request with the controlled delivery address.
4. Forward the request to the real provider and let it send the message.
5. Compare the original capture with the expected customer address and content.
6. Read this run's message from the controlled inbox within a bounded wait.
7. Compare the delivered subject and body and verify its controlled destination.

The original-recipient comparison establishes that the application selected the
correct customer. The inbox establishes what arrived after redirection. Keeping
both addresses explicit prevents successful redirection from concealing an
original recipient error. The subject and body are checked at both observations.

Parallel runs need distinct delivery identities and a way to select their own
messages, such as delivery address and order reference together. Each run owns
cleanup. An arbitrary email-shaped string does not provision an inbox; addresses
must belong to infrastructure the environment can receive and query. Provisioning
details can remain outside the order scenario.

This is the production approach described by the author. Meridian implements
capture and an arranged response. These listings contain no SendGrid adapter or
inbox client, and this article does not claim an executed real-delivery example.
Its steps explain the responsibilities that implementation must fulfill.

The delivery choice is separate from the pattern's implementation shape. A carrier
with separate spies or a combined service-specific Test Mediator can support either
capture-only scenarios or capture-and-forward scenarios.

## Script failures to verify recovery and outstanding work

Dependencies rarely fail on demand in the precise way a scenario requires. The
handler arranges response conditions while production performs its actual handling.
Meridian's recovery scenario uses this script:

```csharp
/// Arrange: refuse twice, then accept the gateway's third request.
const int ExpectedAttemptsBeforeAcceptance = 3;
var testMediatorEmailService = new TestMediatorEmailService(
    scriptedResponses:
    [
        new ScriptedEmailServiceResponse(StatusCode: TestMediatorEmailService.HttpStatusServiceTooBusy),
        new ScriptedEmailServiceResponse(StatusCode: TestMediatorEmailService.HttpStatusInternalServerError),
        new ScriptedEmailServiceResponse(StatusCode: TestMediatorEmailService.HttpStatusOk),
    ]);
```

The complete recovery test
also arranges the order, calls the public operation, reads the order and action
state, checks three captured requests and their content, verifies Completed
states and timestamps, and checks that no exception was logged. Its method name
uses delivered for arranged service acceptance; it has no inbox observation.

Here is the complete sequence-selection method:

<!-- Listing source: tests/MeridianOrdering.TestSupport/MediatorEmailService.cs; method: ResolveScriptedResponse -->

```csharp
/// Observe: select the next response and repeat the final entry thereafter.
private ScriptedEmailServiceResponse ResolveScriptedResponse()
{
    // Past the end of the script, the last answer repeats - so a one-entry script
    // is "always this", and a sequence ends in whatever it should settle on.
    int scriptedResponseIndex = Math.Min(_capturedEmailRequests.Count, _scriptedResponses.Count - 1);
    return _scriptedResponses[scriptedResponseIndex];
}
```

The script must contain at least one response. A single failing entry represents
continuing failure. A sequence ending in success represents recovery. The
failure scenarios
cover permanent rejection, transient exhaustion, unreachability, and Retry-After.
They compare the accepted order, remaining action obligations, captures, and
diagnostics required by each scenario.

CapturedAttemptCount counts requests recorded at the simulated endpoint.
Unreachability throws before capture, so the count stays zero despite gateway
attempts. Keep gateway attempts and endpoint arrivals distinct when interpreting
the observed count.

For Retry-After, the spy records arrival times and the assertion checks the gap:

<!-- Listing source: tests/MeridianOrdering.TestSupport/Asserters/AsserterConfirmationEmail.cs; method: AssertRetryWaitedForRetryAfter -->

```csharp
/// Assert: compare arrival spacing with the instructed minimum wait.
public static void AssertRetryWaitedForRetryAfter(
    double expectedMinimumWaitSeconds, IReadOnlyList<double> actualRequestArrivalSeconds)
{
    const int MinimumArrivalsToMeasureAWait = 2;
    Assert.True(
        actualRequestArrivalSeconds.Count >= MinimumArrivalsToMeasureAWait,
        $"{RetryAfterAssertionFailedHeader}" +
        $"Expected at least {MinimumArrivalsToMeasureAWait} attempts so the wait between them can be measured, " +
        $"but the email service received {actualRequestArrivalSeconds.Count}.\n");
    double actualWaitSeconds = actualRequestArrivalSeconds[1] - actualRequestArrivalSeconds[0];
    Assert.True(
        actualWaitSeconds >= expectedMinimumWaitSeconds,
        $"{RetryAfterAssertionFailedHeader}" +
        $"Field:    seconds waited before the retry\n" +
        $"Expected: at least {expectedMinimumWaitSeconds} (the Retry-After the service instructed)\n" +
        $"Actual:   {actualWaitSeconds:F3}\n" +
        $"\nWhat could be wrong: the Retry-After header is being ignored, or jitter is being subtracted\n" +
        $"from it instead of added to it - either way the system comes back sooner than it was told to.\n");
}
```

Arrival spacing includes preceding response processing and scheduling. It observes
endpoint request spacing rather than isolating one sleep call. The scenario verifies
the required minimum spacing through the production retry path.

## Observe bytes consumed when bounded reads matter

A provider can return a huge error body. A short logged excerpt does not prove
that the gateway read only a bounded prefix; it might buffer everything and then
truncate it.

ReadCountingResponseBodyStream produces leading text and filler on demand,
records bytes read, and can throw after a configured position. Here is its complete
span-based read method:

<!-- Listing source: tests/MeridianOrdering.TestSupport/MediatorEmailService.cs; method: Read -->

```csharp
/// Observe: produce bytes lazily and record how many the caller consumed.
public override int Read(Span<byte> buffer)
{
    long readableEnd = _connectionDropsAfterByteCount ?? _totalByteCount;
    if (_position >= readableEnd && readableEnd < _totalByteCount)
    {
        throw new IOException("the connection dropped mid-body (simulated by TestMediatorEmailService)");
    }

    int byteCount = (int)Math.Min(buffer.Length, Math.Min(readableEnd, _totalByteCount) - _position);
    for (int index = 0; index < byteCount; index++)
    {
        long bodyOffset = _position + index;
        buffer[index] = bodyOffset < _leadingBytes.Length ? _leadingBytes[bodyOffset] : FillerByte;
    }

    _position += byteCount;
    _testMediatorEmailService.RecordResponseBodyBytesRead(_responseBodyIndex, byteCount);
    return byteCount;
}
```

The complete source includes its asynchronous read implementations and separate
counters for each scripted response. The
body-handling scenarios
cover oversized failures, escaped credentials, an excerpt ending inside an emoji,
a dropped connection, and an oversized accepted response whose body should not
be read. They compare per-response byte consumption and resulting diagnostic text.

Give the Test Mediator explicit instructions and narrowly named observations that
assertions need. Each addition makes a particular requirement observable while
keeping the public operation and production behavior in the test.

---

[Previous article](/writing/assertions-that-verify-the-whole-outcome/) | [Series contents](/acceptance-testing/) | [Next article](/writing/refusals-failures-and-work-still-owed/)
