---
title: "Extension Methods? No Thank You!"
description: "Keep project-specific helpers as static methods: extension methods hide behavior behind namespaces and can change meaning with imports. Use them when they serve the wider C# community."
datePublished: 2019-09-20
hero: extension-methods-no-thank-you
dateModified: 2026-09-25
tags: ["public-surface", "method-design", "csharp", "extension-methods"]
youtube: "https://www.youtube.com/watch?v=3wBLnARrbDE"
repositories:
  - label: MovieServiceYouTube
    url: "https://github.com/matlus/MovieServiceYouTube"
    context: Code examples
---

My concern is the public surface and discoverability of extension methods, not whether their syntax is convenient.

## The Guideline Nobody Wants to Follow

The Framework Design Guidelines say it in the bluntest possible form: if the class is not yours, do not extend it; if the class is yours, do not extend it. Net-net, **do not use extension methods**.

I do not agree with that because a book said it. I agree with it because I have paid for the alternative. I have seen teams extend .NET classes, project classes, utility classes, anything that had a dot in front of it, and then act surprised when the codebase became a private dialect. That is not senior engineering. That is a self-inflicted wound.

The problem is not that extension methods are technically hard. They are cool. I can appreciate the lowering, the static class, the static method, the `this` parameter. But *cool is not a design argument*. Did you improve the public surface, or did you hide one more thing on a need to know basis?

## LINQ Is the Exception, Not the Permission Slip

LINQ depends on extension methods, and I use LINQ. Let us get that out of the way, because the cheap rebuttal is always sitting there. `Where`, `Select`, `OrderBy`, all of that works because `System.Linq` gives collections a fluent surface. Without extension methods, LINQ would still exist as functionality, but the syntax would be worse. I like the syntax.

That does not give my team permission to staple its own private vocabulary onto every object it touches. LINQ works because the namespace is effectively baseline in a new C# project and because the feature is aimed at the whole C# community. You say dot on an `IEnumerable<T>` and you see the methods. That is the pit of success.

Most application extension methods do the opposite. They are invisible until the right namespace is imported. A new engineer joins the team, says dot, and sees nothing. Or worse, the engineer sees a method that looks like part of the framework and has no idea where it came from. If the only reason the call site works is that somebody remembered a private namespace, you did not design an API. You set a trap.

## Discoverability Is Not a Minor Problem

I keep hearing people downgrade discoverability to a minor inconvenience. I do not buy it. **Discoverability is part of the contract**. If I cannot find the thing by using the type honestly, I am not being invited through the front door.

I have been the experienced C# developer dropped into a codebase where methods showed up on .NET types that I had never seen before. Is this a new version of C#? Is this a framework method? What does it do? There was an `AsList` near a `ToList`, with subtle differences. That is not expressive code. That is code asking me to carry tribal memory before I can even read the call site.

And it cuts both ways. If you build your habits around your team's extension methods, then move to another team, you are lost in the other direction. The method you expect is not there. The baseline language has been replaced by a local accent. I do not want my ability to program C# to depend on memorizing whichever utilities happened to be fashionable in the last project.

## Same Name, Different Namespace, Real Bug

The nastiest version is not invisibility. The nastiest version is false familiarity. I have seen two extension methods on the same type, with the same name, in different namespaces, implemented slightly differently because two parts of the system needed almost the same behavior. We had a real bug, and it took too long to find because nobody thought to F12 into something that looked obvious.

That is the part extension method fans understate. Change a `using`, change the behavior. The call site did not change. The method name did not change. The receiver type did not change. The black box changed because the namespace changed.

Do I want a language feature that lets a namespace swap alter which behavior I get from a dot call? Not unless the bar is extremely high. There are enough real problems without adding this nonsense. I would rather spend code review budget on requirements, data shape, failure modes, and boundaries.

## The Functionality Is Not the Problem

When I say no to extension methods, I am not saying no to the functionality. That distinction matters. A helper is often valuable. The question is whether it deserves to masquerade as a member of the type.

Here is the version I am wary of. It takes useful database command setup and turns it into an extension method.

```csharp
internal static class DbCommandExtensions
{
    public static void AddCommandParameter(
        this DbCommand dbCommand,
        string parameterName,
        ParameterDirection parameterDirection,
        DbType dbType,
        object? value,
        int size)
    {
        var dbParameter = dbCommand.CreateParameter();
        dbParameter.ParameterName = parameterName;
        dbParameter.Direction = parameterDirection;
        dbParameter.DbType = dbType;
        dbParameter.Value = value;
        dbParameter.Size = size;
        dbCommand.Parameters.Add(dbParameter);
    }
}
```

Now look at the actual shape in the MovieService code. It is just a private static helper in the command factory that needs it.

```csharp
private static void AddCommandParameter(
    DbCommand dbCommand,
    string parameterName,
    ParameterDirection parameterDirection,
    DbType dbType,
    object? value,
    int size)
{
    var dbParameter = dbCommand.CreateParameter();
    dbParameter.ParameterName = parameterName;
    dbParameter.Direction = parameterDirection;
    dbParameter.DbType = dbType;
    dbParameter.Value = value;
    dbParameter.Size = size;
    dbCommand.Parameters.Add(dbParameter);
}
```

That is cleaner because it tells the truth. The command factory is doing command factory work. It is not pretending that every `DbCommand` in the universe needed one more public verb.

I want to be honest about the strength of my own objection here, because this is a borderline case rather than a clear one. I have made exactly this helper an extension method on past projects. If this project needed it in enough places, it could reasonably become one again. The rule of thirds applies: if I need it a second time I can move it, and if I need it a third time that is the signal to refactor. What I will not do is invent the reuse upfront because I have seen the pattern before. And even when it clears the bar, the team may still prefer a plain static method, which is a perfectly good answer.

## The Bar Is the Entire C# Community

My bar is not personal usefulness. It is not team usefulness. It is not company usefulness. **The bar is whether the entire C# community using that type could reasonably want the method, and whether the method carries nothing unrelated along for the ride**.

Take the tempting `DateTime` example. Someone wants a string like "ten minutes ago" and decides to extend `DateTime`. Already I am suspicious, because now formatting policy is sitting on a primitive time type. Then the helper wants something from elsewhere in the application, a customer object perhaps, and at that point the type has been dragged into a part of the system it never asked to know about. That is coupling disguised as convenience.

This is the same instinct behind Abstraction in Software Design. Keep the object autonomous where it can be autonomous. Keep helpers stateless and pure where they can be stateless and pure. Do not couple an innocent type to your workflow and call that discoverable because IntelliSense shows a dot.

## The Null Reference Trick Is Cool, and Still a Trap

There is one extension method trick that still makes me smile: you can call an extension method on a null reference. Once you understand the compiler lowering, it is not magic. The call becomes a static method call, and the receiver is just the first argument. Still, at the call site, it looks like you called a method on null and survived.

That can clean up ugly disposal code. Here is the cluttered version.

```csharp
if (dbDataReader != null)
{
    await dbDataReader.DisposeAsync();
}

if (dbCommand != null)
{
    await dbCommand.DisposeAsync();
}

if (dbTransaction != null)
{
    await dbTransaction.DisposeAsync();
}
```

The MovieService code uses a small extension for this instead.

```csharp
[ExcludeFromCodeCoverage]
internal static class DisposableExtensions
{
    public static async ValueTask DisposeIfNotNullAsync(this IAsyncDisposable? disposable)
    {
        if (disposable != null)
        {
            await disposable.DisposeAsync();
        }
    }
}

private static async ValueTask DisposeAsync(
    DbDataReader? dbDataReader,
    DbCommand? dbCommand,
    DbTransaction? dbTransaction,
    DbConnection dbConnection)
{
    await dbDataReader.DisposeIfNotNullAsync();
    await dbCommand.DisposeIfNotNullAsync();
    await dbTransaction.DisposeIfNotNullAsync();
    await dbConnection.DisposeAsync();
}
```

Read the last line again, because it is the whole point and it is easy to skim past. The reader, the command and the transaction each get the dispose-if-not-null treatment, because any of them may never have been assigned if something failed earlier. **The connection does not, because the connection can never be null there.** It was created before any of this could fail.

That distinction is deliberate and it is speaking volumes to me. Same file, four lines, and the difference between them tells you exactly which objects are uncertain and which are not. Write `dbConnection.DisposeIfNotNullAsync()` and you have thrown that information away, and told the next reader that a null connection is a state this code expects.

I can defend the helper itself. Any .NET developer dealing with multiple disposables outside nested `using` blocks can understand the need. It pulls in no customer object, no project policy, no data access rule. Even then, I hesitate, because somebody on the team may not know it exists and may write the null checks manually. If the team says, "Shiv, it meets your bar, but we still do not want it as an extension method," I am fine with that. The functionality survives as a static helper. We lose only the dot.

## Extension Method Is Just Syntax

The HTTP client example is the scar tissue. There is a content method that reads JSON into a type, `ReadAsAsync<T>`, and for years I knew the functionality existed while still forgetting which package and namespace made it appear. Was it in Web API client? Which assembly? Which namespace? What was the exact name again, `ReadAsAsync`, `ReadAsync`, something else?

That is not me performing confusion for the camera. That is the ordinary cost of hiding behavior behind namespace availability. I understand why they did it. They did not want to couple `HttpClient` and its core content abstractions to JSON serialization. Fine. Understanding why a thing exists does not force me to like the result.

So here is where I land. If an extension method benefits the whole community of the type, carries no unrelated coupling, improves the call site materially, and stays discoverable in normal use, then it may deserve to be one. But if it is for you, your project, your team, or your company's private habits, make it a static method and pass the object in. The compiler was going to do that anyway.

And to be clear about what this dislike rests on: it is not a matter of personal taste. **My likes and dislikes are not based on preference, they are based on experience.** I have paid for the alternative, on real projects, with real time lost.

## Summary

- Extension methods can hide a public surface behind namespace knowledge. Discoverability matters: readers should be able to find and understand a call without private team memory.
- LINQ serves the broader C# community. Its useful fluent syntax does not justify attaching a project-specific vocabulary to every type.
- Two extensions with the same name in different namespaces can change behavior when a `using` changes, even though the call site looks the same.
- For project-specific helpers, I usually prefer ordinary static methods. An extension such as `DisposeIfNotNullAsync` can be defensible when it serves the wider type community without bringing unrelated policy along. The dot alone is not a design argument.
