---
title: "Abstraction in Software Design, with Examples"
description: "Give callers domain operations while collections and gateways own the details: service orchestration, model mapping and translation of recognized failures into domain exceptions."
datePublished: 2021-02-28
dateModified: 2021-02-28
hero: abstraction-in-software-design-examples
tags: ["library-boundaries", "composition-over-inheritance", "model-design", "task-composition", "error-handling", "gateway-pattern", "architectural-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=mkn7ry-ZZdM"
repositories:
  - label: MovieServiceYouTube
    url: "https://github.com/matlus/MovieServiceYouTube"
    context: Movie gateway, domain models and database exception translation
  - label: OneToManyMapBenchmark
    url: "https://github.com/matlus/OneToManyMapBenchmark"
    context: Generic map implementations behind the domain-vocabulary example
draft: true
---

One way to understand abstraction is to watch the caller's job change.

At first, the caller may know which collection to search, which three endpoints to call, how to combine their results and what a database error means. After a useful abstraction is introduced, the caller can ask for the thing it actually needs. The knowledge of how to obtain it has a home elsewhere.

Let's work through a few examples, starting with a collection and ending with a gateway whose responsibility includes failures. The useful question throughout is: **what does the application want to say?**

## Encapsulation and the caller's perspective

I find it useful to distinguish encapsulation from abstraction this way. Encapsulation concerns the implementation of a class: the state and behavior kept together, the members hidden and the members exposed. Abstraction concerns the view offered to the person using it.

The same encapsulated component can serve two applications that want different public operations. Each application may benefit from its own abstraction around that component. The underlying mechanism has not changed; the way the caller wants to use it has.

Terminology varies, so I am not trying to settle every historical use of these words. This distinction helps me design from the calling perspective.

Take .NET's `List<T>`. Its implementation uses an array. When more capacity is needed, it can allocate a larger array and copy the elements. You can add items without managing that process yourself. The public collection operations provide a useful view over the storage mechanism. [List<T> documentation](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1)

The distinction between `Count` and `Capacity` is still useful. If you know you will add about 3,000 items, you can start with:

```csharp
var titles = new List<string>(capacity: 3000);
```

That reserves room without adding 3,000 elements. `titles.Count` is still zero. You do not need to choose a prime capacity; the list manages its array growth.

Sorting supplies another example. You ask the list to sort according to the desired comparison. The implementation selects the sorting machinery. The documented introspective sort uses insertion sort, heapsort or quicksort according to the partition size and recursion depth. You express the required order without selecting each internal algorithm. [List<T>.Sort](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.sort)

An abstraction can hide mechanics while retaining the controls that are useful to its caller.

## A map knows keys and values; the domain knows messages and states

Suppose several states share the same message. We associate a message with its states, then later look up the message for one state.

The [one-to-many map](/writing/csharp-one-to-many-mapping/) supports that relationship. Its vocabulary is appropriately general: add a mapping, then use an indexer to retrieve a key from a value.

```csharp
map.AddOneToManyMapping("Service is available", new[] { "VA", "MD" });
string message = map["VA"];
```

That code can work perfectly well. But read it as someone learning the business operation. “One-to-many mapping” and an indexer explain the data structure. They do not express the application's intention as directly as `AssociateMessageToStates` and `GetStateMessage`.

Here is a complete reduced implementation using state abbreviations as strings. It makes the same composition decision while using a direct reverse dictionary to keep the example small:

```csharp
public sealed class StateMessages
{
    private readonly Dictionary<string, string> messagesByState =
        new Dictionary<string, string>(StringComparer.Ordinal);

    public void AssociateMessageToStates(string message, IEnumerable<string> states)
    {
        var batch = states.ToArray();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        foreach (string state in batch)
        {
            if (state == null || !seen.Add(state) || messagesByState.ContainsKey(state))
                throw new ArgumentException("Each state must have one message.", nameof(states));
        }

        foreach (string state in batch)
            messagesByState.Add(state, message);
    }

    public string GetStateMessage(string state)
    {
        return messagesByState[state];
    }
}
```

The batch is checked before any entries are added, so a conflicting state does not leave half the operation applied. This small version uses exact, case-sensitive state strings, throws for an unmapped state and assumes callers supply a non-null message and sequence. It has no concurrent mutation contract. The generic sample provides its own types and more elaborate mapping machinery; those details are separate from the caller-facing vocabulary being taught here.

The call now reads:

```csharp
var stateMessages = new StateMessages();
stateMessages.AssociateMessageToStates("Service is available", new[] { "VA", "MD" });
string message = stateMessages.GetStateMessage("VA");
```

`StateMessages` has a collection. It does not inherit the collection's entire public surface. Another application could use the same underlying map behind a different vocabulary because it has a different purpose.

Passing an `IEnumerable<string>` also expresses that the method needs to enumerate the supplied states. It does not need an API for modifying the caller's collection. That parameter type alone does not guarantee immutability, but the implementation here enumerates and copies it before applying changes.

## Does your domain collection need to be a List?

This is where composition becomes important. Declaring `List<Customer>` supplies a type argument to a generic class; it does not create a subclass. The inheritance question arises when you declare something like `Customers : List<Customer>`.

Do you want `Customers` to expose every list operation? Can callers insert at arbitrary positions, remove ranges and reorder the contents? Are those operations part of the domain contract?

If the domain needs a more specific surface, keep the list inside a class and expose those operations. The result is often easier to understand and harder to misuse.

The point of “prefer composition over inheritance” is to make this decision deliberately. Inheritance claims substitutability through the base contract. Reusing a convenient container implementation is insufficient reason to expose that contract as the meaning of your domain object.

## Three service calls for one movie

Now consider a movie service with three endpoints. One returns titles and image URLs. Another returns titles and categories. A third returns titles and years.

The title connects the fragments. The domain wants a movie containing all four pieces of information.

An initial gateway might expose three public methods mirroring those endpoints. That hides the HTTP calls but leaves the domain to orchestrate them, match the titles and assemble a movie. The domain still knows the service's fragmented representation.

Who should do that work?

The gateway should. The domain's request is “get all movies.” It should not need to know that fulfilling the request takes three calls. The gateway can make those independent requests concurrently, check their results and combine the returned information.

![Three provider responses containing categories, image URLs and years enter one gateway. It joins and maps them into domain Movie objects for the caller.](/images/diagrams/design-movie-gateway.svg)

*New explanatory diagram of the service boundary. The three response shapes remain inside the gateway; the caller receives its own Movie model.*

Concurrency avoids deliberately waiting for one independent request before starting the next. Total completion still includes scheduling, response processing and mapping; it is not a promise that elapsed time exactly equals the longest network request.

## Whose Movie is it?

Even after combining the responses, returning `ImdbMovie` leaves another question unresolved. Does the application's model still depend on this particular service?

The service calls one field `Category` and supplies a string. The domain calls that concept `Genre` and uses an enum. Those choices belong to different sides of the boundary.

Here are reduced models for a complete mapping example:

```csharp
public enum Genre { Action, Comedy, Drama, SciFi, Thriller }
public sealed record Movie(string Title, string ImageUrl, Genre Genre, int Year);

internal sealed record CategoryRow(string Title, string Category);
internal sealed record ImageRow(string Title, string ImageUrl);
internal sealed record YearRow(string Title, int Year);
```

The three row types describe the provider's responses. `Movie` describes what the domain wants back. Keeping those models separate allows the gateway to translate between them.

The following teaching mapper joins by title. It requires unique titles and exactly the same title set in all three responses. That explicit requirement prevents a missing or differently ordered fragment from quietly becoming part of the wrong movie:

```csharp
internal static class MovieMapper
{
    public static IReadOnlyList<Movie> JoinAndMap(
        IEnumerable<CategoryRow> categories,
        IEnumerable<ImageRow> images,
        IEnumerable<YearRow> years)
    {
        var categoryByTitle = categories.ToDictionary(x => x.Title, StringComparer.Ordinal);
        var imageByTitle = images.ToDictionary(x => x.Title, StringComparer.Ordinal);
        var yearByTitle = years.ToDictionary(x => x.Title, StringComparer.Ordinal);
        var titles = new HashSet<string>(categoryByTitle.Keys, StringComparer.Ordinal);

        if (!titles.SetEquals(imageByTitle.Keys) || !titles.SetEquals(yearByTitle.Keys))
            throw new InvalidOperationException("The movie responses contain different titles.");

        return categoryByTitle.Values.Select(row => new Movie(
            row.Title,
            imageByTitle[row.Title].ImageUrl,
            ParseGenre(row.Category),
            yearByTitle[row.Title].Year)).ToArray();
    }

    private static Genre ParseGenre(string category)
    {
        return category switch
        {
            "Action" => Genre.Action,
            "Comedy" => Genre.Comedy,
            "Drama" => Genre.Drama,
            "Sci-Fi" or "SciFi" => Genre.SciFi,
            "Thriller" => Genre.Thriller,
            _ => throw new InvalidOperationException("The movie category is unsupported.")
        };
    }
}
```

This is an intentionally small mapping implementation. It is case-sensitive and rejects duplicate titles through `ToDictionary`. Title is only a suitable join key when the provider guarantees its uniqueness. A service allowing different movies with the same title needs a stable movie identifier instead.

The linked MovieService gateway uses a different implementation: it advances three enumerators together and combines each position. That assumes matching order and length across responses; it does not perform a title-keyed join. The mapper above makes the association explicit and is useful when ordering differs. It does not make the historical gateway's assumption disappear.

## Put the orchestration inside the gateway

Here is a compact gateway around those models and mapper. It uses a caller-owned `HttpClient` configured with the service base address, and the three relative endpoint names from the sample. The client outlives the gateway's calls; this class does not dispose it.

```csharp
public sealed class MovieCatalogUnavailableException : Exception
{
    public MovieCatalogUnavailableException(string message) : base(message) { }
}

public sealed class MovieGateway
{
    private readonly HttpClient client;

    public MovieGateway(HttpClient client)
    {
        this.client = client;
    }

    public async Task<IReadOnlyList<Movie>> GetAllMovies(CancellationToken cancellationToken)
    {
        var categories = ReadRows<CategoryRow>("WithCategories.json", cancellationToken);
        var images = ReadRows<ImageRow>("WithImageUrls.json", cancellationToken);
        var years = ReadRows<YearRow>("WithYears.json", cancellationToken);

        await Task.WhenAll(categories, images, years).ConfigureAwait(false);

        return MovieMapper.JoinAndMap(
            await categories.ConfigureAwait(false),
            await images.ConfigureAwait(false),
            await years.ConfigureAwait(false));
    }

    private async Task<T[]> ReadRows<T>(string path, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync(path, cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
            throw new MovieCatalogUnavailableException("The movie catalog could not be retrieved.");

        return await response.Content.ReadFromJsonAsync<T[]>(
            cancellationToken: cancellationToken).ConfigureAwait(false)
            ?? throw new MovieCatalogUnavailableException("The movie catalog returned no data.");
    }
}
```

The listings use the standard `System`, collections, LINQ, HTTP, HTTP JSON, threading and task namespaces. This reduced gateway demonstrates concurrency, response disposal, mapping and an application-facing error for unsuccessful responses. It leaves transport exceptions, JSON errors, cancellation and mapping errors visible. A production boundary needs decisions for those cases based on their actual meaning; the sample is not a complete failure policy.

The domain makes one request and receives its model. A second provider might use completely different endpoints and data shapes, yet satisfy the same domain requirement.

## The same need can meet a relational model

Imagine another service returning movies, genres and the associations between them. Now assembling a movie requires following identifiers through an association table instead of combining properties by title.

A relational model can also allow one movie to belong to several genres. That does not mean our single-`Genre` domain model can silently discard the extra values. The example assumes one genre for the application's use case. If the real requirement includes several, the domain contract must represent them or state a deliberate selection rule.

Whatever the provider's representation, ask the same question: what does the domain need? The gateway owns the translation from the provider's relationships into that model.

If the source is a database under your control, a stored procedure can perform the joins and return the agreed result shape. That keeps schema knowledge on the database side and gives the application another useful boundary. A database is designed to perform relational joins; whether a particular query performs well still depends on its plan, indexes and data.

Changing the tables can then require changing the procedure without changing the application-facing operation, provided its behavior and returned data remain the same. [Dependency Inversion](/writing/solid-is-old/) follows that relationship further.

## Exceptions can leak too

A successful result is only half the contract.

Suppose the database rejects a movie because its title already exists. A database exception mentioning a duplicate key in `dbo.Movie` exposes both a provider type and a schema-specific message. A caller that only knows `CreateMovie` should not need to interpret either to recognize the duplicate-title problem.

The MovieService data manager recognizes that failure and throws a `DuplicateMovieException`. Here is its relevant catch block; the surrounding method owns opening the connection, executing the command, transaction cleanup and disposal:

```csharp
catch (DbException e)
{
    dbTransaction.RollbackIfNotNull();

    if (e.Message.Contains("duplicate key row in object 'dbo.Movie'",
        StringComparison.OrdinalIgnoreCase))
    {
        throw new DuplicateMovieException(
            $"A Movie with the Title: {movie.Title} already exists. Please use a different title", e);
    }
    else
    {
        throw;
    }
}
```

`RollbackIfNotNull` is the sample's transaction helper. `DuplicateMovieException` is an application exception whose constructor preserves the supplied exception as its inner exception. Those implementation details support a more meaningful public failure: this title is already in use.

Keep that inner exception. The domain-facing message can explain the problem while diagnostics retain the original cause.

The recognition logic has a limitation: it matches provider message text. That text can vary with provider, version and language, and matching it to a business cause depends on the schema's constraints. A provider error code plus the relevant constraint identity is a stronger basis when available. Do not copy the string check as a universal duplicate detector.

Also notice the plain `throw` for unrecognized failures. The example deliberately handles the known case and lets other database exceptions escape. It therefore offers a specific translation, not total isolation from every provider exception.

I prefer evolving those translations from failures we understand. Catching every exception and pretending it means the same business problem destroys information. An HTTP status has the same requirement: translate its meaning in the context of that service's contract, rather than assuming every `400` means a duplicate movie.

## Follow the knowledge

In the collection example, data-structure vocabulary moved behind `StateMessages`. In the gateway, endpoint coordination and vendor models moved behind `GetAllMovies`. At the failure boundary, a recognized database condition became a domain exception without losing its original cause.

Each abstraction becomes useful by making the caller's operation simpler and more expressive. It gives the implementation a clear responsibility for the details that remain necessary.

That is the perspective I want you to practice. Start with what the caller needs now. Give that need a precise name and shape. Then put the work, the mappings and the relevant failure knowledge on the side of the boundary that owns them.
