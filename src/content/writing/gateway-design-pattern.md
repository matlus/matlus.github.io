---
title: "The Gateway: An API in Your Domain's Language"
description: "A Gateway presents business operations, translates service models and transforms failures into domain exceptions, keeping external service details behind one boundary."
datePublished: 2019-07-28
dateModified: 2026-09-27
hero: gateway-design-pattern
tags: ["library-boundaries", "error-handling", "model-design", "gateway-pattern", "architectural-patterns", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=CABe1phGonw"
repositories:
  - label: Gateway example
    url: "https://github.com/matlus/Gateway-Example-YouTube"
    context: Movie service with SOAP and REST client Gateways
---

A Gateway gives your application an API for the work it needs from an external service. Its method names, inputs, outputs, and exceptions belong to your application's domain. The Gateway handles the service's protocol and the details needed to turn a business request into service calls.

I use Gateways when a system talks to other applications, web APIs, or services such as language model providers. Database access has a separate role in this architecture: the Data Manager and its supporting classes.

Three responsibilities define the Gateway: provide the business operation, translate the models, and transform the failures. A class that exposes an SDK unchanged leaves those responsibilities with its callers.

## Service agent, proxy and Gateway

These names are sometimes used interchangeably. I distinguish them by the abstraction each supplies, so a team can discuss them without ambiguity.

| Role | What it abstracts | What its caller sees |
|---|---|---|
| Service agent | Communication through a protocol, such as HTTP or TCP. | Protocol operations, such as sending an HTTP request. |
| Proxy | The remote service's API, represented locally. | Operations and models that correspond to the service contract. |
| Gateway | The external service as used by this business system. | The business operations, domain models, and exceptions the system needs. |

A generated SOAP proxy illustrates the middle row. It brings the service's operations into C#, but the caller still has to understand that service contract. An SDK often occupies a similar position: it offers the provider's capabilities through local methods and types.

I picture these responsibilities as concentric sets. The service agent supplies communication. The proxy adds the service contract. The Gateway adds the business-facing abstraction. That picture describes responsibilities; it does not require three separate classes or an inheritance hierarchy.

A Gateway can use a proxy that uses a service agent. A small Gateway may contain all the necessary implementation itself. Where several Gateways repeat HTTP and JSON handling, they can compose a focused service agent for that shared protocol work.

## Give the business one operation

Suppose the application needs to process a credit-card payment. From its point of view, it supplies the payment information and asks for the payment to be processed.

The provider may require a sequence of calls. One response may supply an identifier needed by the next request. The Gateway owns that provider-specific sequence and presents one business operation to the application.

The distinction matters when a provider changes. Another provider may require two calls where the first required four. If both satisfy the same business requirement, the Gateway implementation can change while the business-facing operation remains the same. A new business requirement may still require an API change; the abstraction preserves the contract while the requirement is unchanged.

Only expose capabilities the system uses. A provider's SDK may contain hundreds of methods. The application's Gateway does not need to reproduce them all.

Use the domain's words, too. A service may call its items movies while your business calls them entertainment. The Gateway can expose `GetEntertainmentByGenreAsync`. The service endpoint's name and spelling remain implementation details.

<!-- diagram:start gateway-domain-boundary -->
<figure id="gateway-domain-boundary" class="article-diagram article-diagram--raster">
  <img class="article-diagram__image" src="/images/diagrams/gateway-domain-boundary.webp" alt="The Manager sends a domain request to the Gateway. The Gateway sends a service request to the external service, receives its response or failure, and returns a domain result or throws a domain exception. The Manager and Gateway are inside the application boundary." width="1671" height="941" loading="lazy" decoding="async" />
  <figcaption>The Gateway translates in both directions. The Manager sees domain operations, results and exceptions; service request formats, resource models and protocol failures stay behind the Gateway.</figcaption>
  <p class="article-diagram__full"><a href="/images/diagrams/gateway-domain-boundary.webp">Open full-size Gateway boundary diagram</a></p>
</figure>
<!-- diagram:end gateway-domain-boundary -->

## Keep service models behind the Gateway

The application has domain models. The service has resource models shaped for its own API. The Gateway accepts the application's models, constructs the service request, and converts the response into the application's models.

This is easy to lose while implementing a service integration. You spend time reading the provider's documentation and working with its SDK. Its types become familiar, and using them directly in the business code feels convenient. That spreads knowledge of the provider through the application.

Keep the resource types inside the integration instead. A model conversion should make the business result explicit, including the fields and validation the domain needs.

The original movie example uses separate client and server classes with matching names and shapes. It does not demonstrate a conversion between different shapes. The following teaching example makes that conversion visible: the service returns `Title` and `Year`, while the domain exposes `Entertainment` with `Title` and `ReleaseYear`.

```csharp
public sealed record Entertainment(string Title, int ReleaseYear);

internal sealed record MovieResource(string? Title, int Year);
```

`MovieResource` belongs inside the Gateway implementation. A caller receives `Entertainment`, so a change to the service resource can be handled at that boundary.

## Translate failures into the domain

Services report failures in different ways. A SOAP endpoint may return a fault. An HTTP endpoint may use an error status and a response body. Another API may return HTTP 200 and put a failure indicator inside its JSON.

The Gateway must understand the service's actual contract. Checking only the status code is sufficient only when that contract defines success that way. When the response includes an application-level failure indicator, inspect it before returning a successful result.

I program to exceptions. The calling application should receive a meaningful domain exception with the service's useful diagnostic context. It should not have to parse an HTTP response or inspect a SOAP fault to discover what happened.

For example, an unsupported movie genre becomes `InvalidGenreException`. The message can explain which genre was rejected and list the supported choices. A communication failure is a different condition and deserves its own exception. Keep credentials and other sensitive values out of diagnostic messages.

An Exception Transformer can perform the conversion for a Gateway. The Gateway remains responsible for applying it at the right point and keeping protocol failures behind its API.

## One business API over SOAP and REST

The original repository contains a movie service, its domain layer, and a Windows Forms client. The service exposes the same movie lookup through two endpoints: SOAP and HTTP/JSON. Its movie data is held in memory, so the demonstration does not require a database.

The client has `MoviesGatewayBase`, `MoviesGatewaySoap`, and `MoviesGatewayRest`. The base defines the business API; the descendants implement their protocols. This excerpt is the genre operation from that base:

```csharp
public IEnumerable<Movie> GetMoviesByGenre(Genre genre)
{
    return GetMoviesByGenreCore(genre);
}

protected abstract IEnumerable<Movie> GetMoviesByGenreCore(Genre genre);
```

The public method delegates to the implementation hook. `Movie` and `Genre` are the client's domain types. The full base also exposes a year lookup and a disposal contract. The original REST descendant leaves the year lookup unimplemented, so the worked comparison here concerns genre lookup.

The variant goes at the end of the class name. The family then sorts together: `MoviesGatewayBase`, `MoviesGatewayRest`, `MoviesGatewaySoap`.

The service deliberately rejects the `NA` genre to make its failure behavior observable. On the SOAP side, that becomes a fault whose code identifies `InvalidGenreException`. On the REST side, the service returns an error response with an `Exception-Type` header and a collection of notices in the body. Each client Gateway converts that condition into its own `InvalidGenreException`.

The client can display the same kind of failure whichever protocol supplied it:

```text
Please provide a valid genre. Possible values are:
Action, Animation, Drama, Musical, SciFi, Thriller.
```

The similarly named exceptions on the client and server are separate classes. They share no assembly. When I own both ends, a stable failure identifier on the wire makes that correspondence useful for troubleshooting. For a third-party service, the Gateway must interpret the identifiers and error information that service supplies.

Use an explicit set of recognized failures. The service's exception identifier is data to interpret; it should not cause arbitrary exception types to be loaded or constructed.

## A complete HTTP teaching implementation

Here is a self-contained adaptation using modern asynchronous HTTP and JSON APIs. It retains the sample's genre endpoint and `Exception-Type` convention, adds the different model shapes above, and defines explicit fallback failures. It is teaching code, rather than an excerpt from the historical implementation.

The exceptions and genre type are defined here so the implementation can be read without opening the repository:

```csharp
using System;

public enum Genre { NA, Action, Animation, Drama, Musical, SciFi, Thriller }

public sealed class InvalidGenreException(string message) : Exception(message);
public sealed class MovieServiceUnavailableException(string message, Exception inner)
    : Exception(message, inner);
public sealed class MovieServiceFailureException(string message) : Exception(message);
public sealed class MovieServiceResponseInvalidException(string message)
    : Exception(message);
```

The Gateway's public method shows its steps: retrieve the resources, then convert them into the domain result. The lower-level methods implement HTTP, failure interpretation and mapping.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

internal sealed class MoviesGatewayRest : IDisposable
{
    private readonly HttpClient client;

    public MoviesGatewayRest(Uri serviceAddress)
        : this(serviceAddress, new SocketsHttpHandler()) { }

    internal MoviesGatewayRest(Uri serviceAddress, HttpMessageHandler transport)
    {
        client = new HttpClient(transport, disposeHandler: true)
        {
            BaseAddress = serviceAddress
        };
    }

    public async Task<IReadOnlyList<Entertainment>> GetEntertainmentByGenreAsync(
        Genre genre, CancellationToken cancellationToken = default)
    {
        MovieResource[] resources = await GetMovieResourcesAsync(genre, cancellationToken);
        return resources.Select(ConvertToEntertainment).ToArray();
    }

    private async Task<MovieResource[]> GetMovieResourcesAsync(
        Genre genre, CancellationToken cancellationToken)
    {
        try
        {
            using HttpResponseMessage response = await client.GetAsync(
                $"api/movies/{genre}", cancellationToken);

            await ThrowIfServiceFailedAsync(response, cancellationToken);

            return await response.Content.ReadFromJsonAsync<MovieResource[]>(
                cancellationToken: cancellationToken)
                ?? throw new MovieServiceResponseInvalidException(
                    "The movie service returned no movie collection.");
        }
        catch (JsonException)
        {
            throw new MovieServiceResponseInvalidException(
                "The movie service returned data that could not be read as its expected JSON response.");
        }
        catch (HttpRequestException exception)
        {
            throw new MovieServiceUnavailableException(
                "The movie service could not complete the request.", exception);
        }
        catch (OperationCanceledException exception)
            when (!cancellationToken.IsCancellationRequested)
        {
            throw new MovieServiceUnavailableException(
                "The movie service request timed out.", exception);
        }
    }

    private static async Task ThrowIfServiceFailedAsync(
        HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        NoticeResource[] notices = await response.Content.ReadFromJsonAsync<NoticeResource[]>(
            cancellationToken: cancellationToken)
            ?? throw new MovieServiceResponseInvalidException(
                "The movie service returned no failure information.");

        if (notices.Length == 0 || notices.Any(notice =>
            notice is null || string.IsNullOrWhiteSpace(notice.Message)))
        {
            throw new MovieServiceResponseInvalidException(
                "The movie service returned a failure without a meaningful notice message.");
        }

        string detail = string.Join(Environment.NewLine, notices.Select(notice =>
            $"Property: {notice.Property}. Message: {notice.Message}. " +
            $"Severity: {notice.Severity}. Source: {notice.Source}."));

        if (response.Headers.TryGetValues("Exception-Type", out IEnumerable<string>? names)
            && names.Contains(nameof(InvalidGenreException), StringComparer.Ordinal))
        {
            throw new InvalidGenreException(detail);
        }

        throw new MovieServiceFailureException(
            $"The movie service rejected the request (status {(int)response.StatusCode}). {detail}");
    }

    private static Entertainment ConvertToEntertainment(MovieResource resource)
    {
        if (resource is null || string.IsNullOrWhiteSpace(resource.Title) || resource.Year <= 0)
        {
            throw new MovieServiceResponseInvalidException(
                "The movie service returned an item without a valid title and release year.");
        }

        return new Entertainment(resource.Title, resource.Year);
    }

    public void Dispose() => client.Dispose();

    private sealed record NoticeResource(
        string? Message, string? Property, string? Severity, string? Source);
}
```

The configuration for this example supplies an absolute base address with a trailing slash, such as `https://movies.example/`. The Gateway appends the relative endpoint. The resource's `Year` becomes the domain's `ReleaseYear`; the title and positive year are validated before a result leaves the Gateway.

The failure decoder expects this service's JSON notice collection. A malformed body, empty collection, or notice without a message becomes `MovieServiceResponseInvalidException`. A recognized failure becomes `InvalidGenreException`. A different HTTP failure with a readable notice body becomes `MovieServiceFailureException`. There is an explicit outcome when a header is absent or unrecognized.

The historical exception transformer has branches that do not throw for an absent or unknown exception header, and the SOAP implementation returns some unrecognized exceptions unchanged. Those paths would need completing before relying on the abstraction for every failure. The adaptation supplies the HTTP fallback; it does not claim that the original example already covers all cases.

The internal transport constructor allows an example check to supply controlled HTTP responses while running the real Gateway. Production construction uses `SocketsHttpHandler`. The Gateway owns its `HttpClient` and handler and disposes them together. Caller-requested cancellation propagates as cancellation; a timeout is translated into service unavailability.

This example addresses one endpoint and its documented response shapes. A real integration must also implement the service's authentication, size limits, retry rules and any application-level errors inside successful responses. Keep those policies in the Gateway or its focused subordinate classes.

## Ownership and orchestration

The Manager creates the Gateway with the Service Locator's help, supplies its validated settings, and is responsible for disposing what it creates. The SDK or protocol client stays inside the Gateway.

For an LLM integration, a Processor or Engine can receive the Gateway the Manager already owns. The Engine passes that same Gateway to its own LLM Processors. Those consumers use the reference; they do not create or dispose another Gateway.

The Manager orchestrates the application's business steps. The Gateway orchestrates the service calls required for its operation. These are different responsibilities at different abstraction levels. A complicated application workflow can belong in an Engine while the provider-specific call sequence still belongs behind a Gateway.

## An API gateway is a separate component

An API gateway is a deployed server-side component in front of services. It can route requests and may present an API that combines or simplifies several service operations.

The client-side Gateway described here is a class owned by the consuming application. It can call an API gateway just as it calls another service endpoint. The deployed API gateway does not automatically supply the client's domain models, names, or exception behavior.

The design check is straightforward: read the client Gateway's public methods as a description of what the business asks the service to do. Then inspect its implementation for the translation and failure handling needed to honor that description.

## Further reading

- [Programming With Intent](/pwi/) collects the architecture and implementation guidance.
- [Functional acceptance testing](/acceptance-testing/) explains verification through the application's public boundary.
