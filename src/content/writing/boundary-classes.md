---
title: "Boundary Classes: One Idea at Many Doors"
description: "Boundary classes keep provider details behind application contracts. A C# shipping gateway shows where to parse JSON, validate the quote and translate failures."
datePublished: 2026-11-19
hero: boundary-classes
tags: ["boundary-validation", "error-handling", "public-surface", "dependency-inversion", "acceptance-testing", "architectural-patterns", "gateway-pattern", "configuration-provider", "data-manager", "adapter-pattern", "design-patterns", "csharp"]
---

You’re reviewing the checkout code. The configuration provider turns a text setting into the shipping service’s `Uri`. The shipping gateway gives checkout a JSON string. A few lines later, checkout is looking for a field called `days` and deciding what to do when the field is missing.

Both classes sit at a boundary. The configuration provider reads an outside value and gives the application something it can use. The gateway makes the HTTP call, but leaves the job of understanding the reply to checkout. If the shipping service renames `days` to `deliveryDays`, why should checkout have to change?

I think of these classes as the doors of the system. Each door is responsible for what crosses it. A gateway, a configuration provider, a data manager and a message broker adapter all do a version of that job. You can see what it takes by fixing the shipping gateway first.

## Follow the quote into checkout

Here is the method in the gateway that checkout started with. `Http` is its HTTP client, and `_serviceBaseAddress` is the service address from configuration.

```csharp
public async Task<string> GetQuoteJsonAsync(string postcode)
{
    var quoteUri = new Uri(_serviceBaseAddress,
        $"quote?postcode={Uri.EscapeDataString(postcode)}");
    using var response = await Http.GetAsync(quoteUri);
    return await response.Content.ReadAsStringAsync();
}
```

For `AB12 3CD`, the service might return `{"price": 12.50, "days": 3}`. As written, the method could also hand back the body of an HTTP 503 with the status lost. This is a pass-through gateway. The caller has to recognize the service’s payload and decide whether it contains a quote at all. Keep the provider’s types, field names and failure codes in the class that talks to it.

Start with what checkout needs. Given a postcode, it needs a shipping price in the agreed currency and a delivery estimate in whole days. This service sends both as positive JSON numbers. The price must fit in a `decimal` and the day count must be written as an integer that fits in an `int`. If the gateway cannot supply a usable quote, report a shipping failure. That gives the caller a small contract, `GetQuoteAsync` returning a `ShippingQuote`.

## Separate malformed JSON from an unusable quote

The gateway has two checks to make after the HTTP request succeeds. First it parses the response. A reply that ends at `{"price": 12.50,` is malformed JSON. Then it validates the quote itself. A reply of `{"price": 12.50, "days": "3"}` parses, but the service contract requires a JSON number for `days`.

Watch where each failure is translated. The catch for malformed JSON sits around `JsonDocument.Parse`. A successful parse gives us a document whose root and fields we can check. The application gets a typed quote or a shipping exception, with the original parser exception kept as the inner cause when parsing fails.

```csharp
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

public sealed record ShippingQuote(decimal Price, int Days);

public class ShippingServiceException : Exception
{
    public ShippingServiceException(string message, Exception? innerException = null)
        : base(message, innerException) { }
}

public sealed class ShippingQuoteMalformedJsonException : ShippingServiceException
{
    public ShippingQuoteMalformedJsonException(string postcode, JsonException innerException)
        : base($"Shipping service returned malformed JSON for postcode {postcode}.", innerException) { }
}

public sealed class ShippingGateway(Uri serviceBaseAddress)
{
    private static readonly HttpClient Http = new();

    public async Task<ShippingQuote> GetQuoteAsync(string postcode,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(postcode);
        var quoteUri = new Uri(serviceBaseAddress,
            $"quote?postcode={Uri.EscapeDataString(postcode)}");

        string json;
        try
        {
            using var response = await Http.GetAsync(quoteUri, cancellationToken);
            response.EnsureSuccessStatusCode();
            json = await ReadResponseTextAsync(response.Content, postcode, cancellationToken);
        }
        catch (HttpRequestException failure)
        {
            throw new ShippingServiceException(
                $"Could not get a shipping quote for postcode {postcode}.", failure);
        }
        catch (OperationCanceledException failure) when (
            !cancellationToken.IsCancellationRequested && failure.InnerException is TimeoutException)
        {
            throw new ShippingServiceException(
                $"Timed out getting a shipping quote for postcode {postcode}.", failure);
        }

        return ParseQuote(json, postcode);
    }

    private static async Task<string> ReadResponseTextAsync(HttpContent content, string postcode,
        CancellationToken cancellationToken)
    {
        try
        {
            return await content.ReadAsStringAsync(cancellationToken);
        }
        catch (Exception failure) when (failure is NotSupportedException
            or InvalidOperationException { InnerException: ArgumentException })
        {
            throw new ShippingServiceException(
                $"Shipping service declared an unsupported character encoding for postcode {postcode}.",
                failure);
        }
    }

    private static ShippingQuote ParseQuote(string json, string postcode)
    {
        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(json);
        }
        catch (JsonException parseFailure)
        {
            throw new ShippingQuoteMalformedJsonException(postcode, parseFailure);
        }

        using (document)
        {
            JsonElement root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
                throw new ShippingServiceException(
                    $"Expected a shipping quote object for postcode {postcode}.");

            if (!root.TryGetProperty("price", out JsonElement priceElement)
                || priceElement.ValueKind != JsonValueKind.Number
                || !priceElement.TryGetDecimal(out decimal price)
                || price <= 0)
                throw new ShippingServiceException(
                    $"Shipping service returned a missing or invalid price for postcode {postcode}.");

            if (!root.TryGetProperty("days", out JsonElement daysElement)
                || daysElement.ValueKind != JsonValueKind.Number
                || !daysElement.TryGetInt32(out int days)
                || days <= 0)
                throw new ShippingServiceException(
                    $"Shipping service returned missing or invalid days for postcode {postcode}.");

            return new ShippingQuote(price, days);
        }
    }
}
```

Give the gateway an absolute service address ending in `/`, such as `https://shipping.example/api/`. The request for `AB12 3CD` goes to `/api/quote?postcode=AB12%203CD`. A successful reply with `12.50` and `3` becomes `ShippingQuote(12.50m, 3)`. The string `"3"` produces a shipping exception about `days`. The truncated reply produces `ShippingQuoteMalformedJsonException`, which a caller can also catch as a `ShippingServiceException`.

On modern .NET, reading the response as text can fail because the service named an unknown encoding or one the runtime disables. The gateway translates those failures while it is reading the body. It also translates HTTP failures such as a 503 and a timeout. A caller that cancels the request still gets cancellation.

Now checkout can decide whether a three-day estimate meets the delivery promise. That decision belongs to checkout. The gateway’s job is to make sure it has a usable estimate to decide with. This gateway buffers the whole reply from a fictional provider. For a real provider, decide how much data and time the gateway can spend on a quote, and whether retrying the operation makes sense.

## Ask what crosses each door

Look at what the caller passes in, gets back and handles when the call fails. The boundary class takes the application’s input and translates it for the provider. On the way back, it checks what came in and translates it into a result or a failure the application understands. Some boundaries only work in one direction.

**Configuration provider.** Suppose the service address is entered as `https://shipping.example/api`. Read it as an absolute web URI and normalize the path once so it ends in `/`. A missing required setting should produce an error about that setting before the gateway is created. A different setting, such as an optional tracking URL, might default to no link when the key is absent. If the source distinguishes an absent value from an explicit `null`, an empty string or a string of spaces, decide how each is handled in the setting’s contract. The gateway receives the normalized service address. [The Configuration Provider: Roles and Responsibilities](/writing/configuration-provider-design-pattern/)

**Data manager.** A checkout operation may ask for an order and receive an `Order`. The data manager runs the query and maps and checks the returned columns before handing over that order. When a known uniqueness constraint rejects a duplicate order reference, the data manager can report that duplicate in the application’s terms and keep the original exception for diagnostics. Recognize the specific constraint before making that translation.

**Message broker adapter.** Publish an `OrderPlaced` event in the application’s own terms. The publisher maps the event to the broker’s wire format. On receipt, a subscriber can parse the message, check its fields and hand the application an event it can use. If it hands the caller an opaque acknowledgement token, the caller returns that token to the same subscriber. In the RabbitMQ and Service Bus sample, the two implementations hide their broker-specific tokens behind `void Acknowledge`. The Service Bus method can return while settlement is still in progress. If the application needs to know settlement finished, design the contract so the caller can observe completion with either broker. [Adapter Design Pattern: Testing Service Bus Using RabbitMQ Locally](/writing/adapter-pattern-rabbitmq/)

The names tell me what the class is responsible for. I’d still call a class that stores and retrieves orders a data manager if its SDK uses HTTP. Look at what the caller asks it to do.

## Design the contract before extracting an interface

`GetQuoteAsync` already gives checkout a usable abstraction. I start with that concrete gateway when there is one provider and one way to make the call. Give the gateway its service address and let it own the HTTP work. Checkout should be able to ask for a quote without assembling an HTTP client, a parser and an exception mapper.

If I have two shipping providers to support, I can put the quote contract in an interface or a base class and have both providers implement it. Checkout and the provider implementations then depend on an application-owned contract. That is dependency inversion. The design work is checking that each implementation can actually supply a price and an estimate with the meaning checkout expects. A provider that gives only a date range may require a different contract. Decide what checkout needs to promise before extracting the interface. [SOLID IS OLD: Dependency Inversion Needs a Good Abstraction](/writing/solid-is-old/)

## Test the result the caller cares about

For the gateway, arrange a service that gives it the truncated reply. Call `GetQuoteAsync` and expect a shipping exception for that postcode. Arrange the valid reply and expect a price of `12.50` and a three-day estimate. Those observations tell you what crossed the boundary.

For checkout, run the scenario through the application’s entry point. If the checkout requirement says an unusable quote prevents the order from being placed, assert that outcome. Observe any side effects the requirement names, such as whether an order was saved. A test that only verifies a call to `GetQuoteAsync` can pass even if checkout goes on to save an order it should have rejected.

There is a concrete example of that testing shape in Meridian Ordering. The C# acceptance test places an order through the Domain Facade, checks the returned result, reads the persisted order back and listens for the fulfillment message. It checks the composed confirmation email at the transport seam. That last check verifies the request the system makes to the email service. Delivery to the recipient is a separate outcome. [Functional Acceptance Testing at the Boundary](/writing/functional-acceptance-testing-at-the-boundary/)

Go back to the checkout review. The configuration provider gives the gateway a usable service address. The gateway gives checkout a quote. You can read the delivery decision without learning the shipping service’s field names. If the service renames `days`, change the mapping in the gateway and check that checkout still gets the same three-day estimate.
