---
title: "ASP.NET Core Web API by Hand"
description: "A terminal request delegate exposes the work behind an ASP.NET Core endpoint. A movie-service experiment compares a narrow handler with the controller pipeline."
datePublished: 2020-04-26
dateModified: 2020-04-26
tags: ["asp-net", "http", "benchmarking", "csharp"]
hero: aspnet-core-web-api-by-hand
youtube: "https://www.youtube.com/watch?v=2AQld3TLMac"
draft: false
---

Sometimes the easiest way to understand a framework is to build a small part of the application without the layer you normally rely on. You can then see what that layer supplies, where it helps, and what work you might not need for one particular operation.

In this experiment I take an ASP.NET Core movie endpoint and handle the request directly. The application still uses ASP.NET Core. The part being removed is the controller-based Web API machinery between the incoming request and the application operation.

I have worked on systems with demanding response-time requirements where unnecessary abstraction had a measurable cost. That makes me interested in what is happening underneath the convenient API. It does not make a general-purpose framework a bad choice. You need to understand what it does before deciding which responsibilities you are prepared to take on yourself.

Think of learning to ride a bicycle. The support that helps you get started is useful. Understanding how the bicycle behaves without it gives you more control. With software, that understanding also tells you when keeping the support is the sensible decision.

## Hold the application operation steady

The experiment compares two applications around the same movie-retrieval operation. Both call a Domain Facade to retrieve the movies. The database and the underlying domain work are intended to stay the same. Logging is disabled in both applications so that it does not become an accidental difference between them.

The controller application configures routing and controller endpoints. The request passes through that machinery, reaches the controller action, and produces a serialized response.

The other application registers one terminal request delegate using `app.Run`. That delegate examines the path, calls the movie operation and writes the response.

[![A controller route and a terminal request delegate both call the same Domain Facade and movie data operation, then return JSON.](/images/diagrams/aspnet-core-by-hand-pipeline.svg)](/images/diagrams/aspnet-core-by-hand-pipeline.svg)

*Both request paths reach the same movie operation. The direct handler takes responsibility for the endpoint behavior it needs.*

## The request is already available

An ASP.NET Core request delegate receives an `HttpContext`. It can read the request path and write to the response. We do not need a controller merely to gain access to those objects.

The request handler needs to recognize the path, retrieve the movies and write them to the response body:

```csharp
app.Run(async context =>
{
    var path = context.Request.Path;
    var response = context.Response;
    var body = response.Body;

    response.ContentType = "application/json";

    if (path == "/" || string.Compare(path, "/GetAllMovies",
        StringComparison.OrdinalIgnoreCase) == 0)
    {
        var movies = await GetAllMovies(s_domainFacade);
        SerializeAndWriteToResponse(body, movies);
    }
});
```

This fragment isolates request handling. `s_domainFacade` refers to the application's Domain Facade, `GetAllMovies` retrieves movie data through it, and `SerializeAndWriteToResponse` serializes that data as JSON into the response stream. Their implementations depend on the application's movie model and serializer and are omitted here. The two accepted paths lead to the same movie operation, and the response is explicitly marked as JSON.

`app.Run` is terminal here: it does not call a next middleware component. Once the request reaches this delegate, the delegate must produce the behavior that endpoint requires. The [ASP.NET Core middleware documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/) describes this terminal-delegate role.

The small size of that fragment is instructive. It is also a clue to what has been left out.

## A shorter handler has a narrower contract

The shown code does not distinguish HTTP methods. It does not supply a not-found response for an unrecognized path. It does not perform content negotiation or reproduce the controller pipeline's model-binding and validation behavior. The serialization helper and error handling also need their own examination.

Those may be reasonable omissions for a controlled experiment with one known request. They must become deliberate decisions before the endpoint is used as a replacement in an application.

That is where the tradeoff becomes useful to discuss. If the application only needs one fixed response shape and a small number of known paths, a narrower implementation can avoid work that a general solution supports. If it needs the framework's broader behavior, reimplementing that behavior may remove much of the apparent simplicity.

This example uses an ordinary terminal middleware delegate from ASP.NET Core 3.x. It predates the later minimal-API programming model.

## What the benchmark establishes

A separate benchmark client compared the two applications. These are the historical results:

| Method | Mean | Error | StdDev | Ratio | RatioSD |
|---|---:|---:|---:|---:|---:|
| `MoviesUsingWebApi` | 22.050 ms | 0.4115 ms | 0.7524 ms | 1.00 | 0.00 |
| `MoviesUsingRaw` | 9.057 ms | 0.1998 ms | 0.5732 ms | 0.42 | 0.03 |

`MoviesUsingWebApi` is the controller baseline; `MoviesUsingRaw` is the direct handler. Comparing their mean times, the controller version took about 2.43 times as long in this run. BenchmarkDotNet reports `Ratio` as the mean of its ratio distribution, so the displayed `0.42` need not equal the quotient of the two displayed means.

`Error` is half the 99.9% confidence interval, and `StdDev` describes the spread of the time measurements. `RatioSD` describes the spread of the ratio distribution. The report lists three removed outliers for the controller method, from 24.52 to 26.44 ms, and five for the direct method, from 11.10 to 11.65 ms.

These measurements have not been rerun here. They do not establish a current performance promise or a throughput limit under concurrent load.

There are limits to how far we can take that number. The available benchmark client requests the controller endpoint over HTTP and the direct endpoint over HTTPS. It also uses different local ports, and its exact revision has not been tied to the historical timing result. A repeatable comparison needs the transport, hosting mode, response bytes and endpoint behavior controlled explicitly.

Client-side allocation measurements would describe the benchmark process. They would not establish how many bytes the separately running server allocated. To compare server allocation, measure the server processes under the same workload.

A fuller experiment would first assert that both requests return the required status, content type and equivalent movie data, then compare a matched transport and hosting configuration. It would retain the runtime and serializer settings with the results. The framework's serialization path in this experiment has optimizations the hand-written version does not use, which is another reason to inspect the actual work before attributing the entire difference to “abstraction.”

## Know what you are paying for

I find these small experiments valuable because they make a hidden path visible. You can see the request, the application call and the response being written. You can then return to the controller version with a better understanding of what sits around that path.

Use that understanding when the application has a measured need. Keep the behavior it promises, identify the work it actually requires, and compare an implementation that meets those requirements. That gives you a defensible reason for choosing a direct handler or retaining the framework's facilities.
