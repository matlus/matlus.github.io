---
title: "Let's Talk - Null Conditional Operator. No Thank you!"
description: "Use null-conditional calls only when skipping work is correct. Required logging and optional disposal expose the difference between nullable warnings and runtime behavior."
datePublished: 2022-02-21
dateModified: 2022-02-21
tags: ["null-conditional-operator", "nullable-reference-types", "error-handling", "csharp"]
hero: null-conditional-operator-no-thank-you
youtube: "https://www.youtube.com/watch?v=RtC8LZXlPt8"
repositories:
  - label: "HighPerformanceLoggingAndInMemoryLogger"
    url: "https://github.com/matlus/HighPerformanceLoggingAndInMemoryLogger"
    context: "ApplicationLogger and the original InsertBlogPost example."
draft: false
---

Every time I see a null-conditional operator, I want to know why it is there.

That might sound excessive for a question mark and a dot. But `?.` makes a decision: if this object is null, skip the member access. When the member is a method, that can mean skipping work the program was supposed to do. Is that what you intended?

I see this often in code reviews. Someone wants to make a call safe, or remove a compiler warning, and adds `?.`. The warning disappears. The code runs. Everyone is happy until an operation quietly stops happening.

**Use the null-conditional operator only when skipping the operation is the correct behavior.** Think about the code after you have written it. Read it as someone who has no access to the intention in your head. Does it say what you meant?

## What the question mark says

Consider these two calls:

```csharp
applicationLogger.LogDebug(nameof(InsertBlogPost), blogPost);
applicationLogger?.LogDebug(nameof(InsertBlogPost), blogPost);
```

The first call requires a logger. If `applicationLogger` is null, the program throws a `NullReferenceException` at that access. The second call accepts its absence and skips `LogDebug`.

That is a behavioral difference. You have decided that the application can continue without making this logging call.

Sometimes that decision is correct. But if logging is required, the question mark has changed your requirement. It says, "If the logger is missing, ignore it. I'm fine with that."

Are you fine with that?

The same question applies to a chain such as `a?.B?.C`. Each conditional access introduces a place where evaluation can stop because a receiver is null. Someone reading that expression must now account for those missing objects. If they cannot actually be missing in a valid execution, why are we making the next person search for paths that should not exist?

Conditional access also does not make the called code immune to failure. When the receiver exists, the member executes normally and can throw. The operator handles the null receiver by skipping that access; that is the extent of the protection. [C# operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/member-access-operators).

## Start with the intention

Suppose an application creates its logger at startup, then uses that logger throughout its work. In my mind, the logger is required. Once startup has initialized it, subsequent operations should use it directly.

Here is a reduced, runnable example. `ApplicationLogger` writes to the console so the behavior is visible without a logging provider. `SaveBlogPost` prints a simulated save; it does not write to a database.

```csharp
#nullable enable
using System;

internal static class Program
{
    private static ApplicationLogger? applicationLogger;

    private static void Main()
    {
        applicationLogger = new ApplicationLogger();
        var blogPost = new BlogPost("Null Conditional Operator");

        applicationLogger.LogDebug(nameof(Main), blogPost);
        InsertBlogPost(blogPost);
    }

    private static void InsertBlogPost(BlogPost blogPost)
    {
        SaveBlogPost(blogPost);
        applicationLogger.LogDebug(nameof(InsertBlogPost), blogPost);
    }

    private static void SaveBlogPost(BlogPost blogPost)
    {
        Console.WriteLine($"Saved: {blogPost.Title}");
    }
}

internal sealed record BlogPost(string Title);

internal sealed class ApplicationLogger
{
    public void LogDebug(string operation, BlogPost blogPost)
    {
        Console.WriteLine($"{operation}: {blogPost.Title}");
    }
}
```

The normal execution prints:

```text
Main: Null Conditional Operator
Saved: Null Conditional Operator
InsertBlogPost: Null Conditional Operator
```

Notice the sequence in `Main`. Initialize the logger, use it, then call `InsertBlogPost`. The logger should be available in both methods.

However, the compiler warns about dereferencing a possibly null reference inside `InsertBlogPost` (`CS8602`). It can track the assignment followed by the direct call in `Main`. It does not carry that proof into this separate method merely because we know the method is called after initialization.

Why did I declare the field nullable in the first place? If I declare it like this instead:

```csharp
private static ApplicationLogger applicationLogger;
```

the compiler reports `CS8618`: the non-nullable field has not been initialized when construction finishes. Assigning it later in `Main` does not satisfy that initialization analysis.

This is where the temptation starts. The warning suggests making the field nullable, so we add `?`. Now another warning appears at a use of that field, so we add another question mark there. We have been following the warnings without asking what our changes mean.

The field now advertises possible absence. The call now treats absence as a reason to skip work. Neither expresses my intention for this logger.

## A clean compile can conceal missing work

Change the last line of `InsertBlogPost` to:

```csharp
applicationLogger?.LogDebug(nameof(InsertBlogPost), blogPost);
```

That removes `CS8602`. With the existing startup sequence, the output remains the same, because the logger exists. That successful run tells us nothing about whether skipping the call would be correct.

To expose the difference, deliberately break startup. Replace the body of `Main` with this:

```csharp
private static void Main()
{
    InsertBlogPost(new BlogPost("Null Conditional Operator"));
}
```

The static field still has its default null value. With the conditional call, the program prints only:

```text
Saved: Null Conditional Operator
```

It then returns normally. The logging call has disappeared from the execution.

With the ordinary `.` call, the simulated save still prints, but the missing logger causes a `NullReferenceException` when the program attempts to log. Now the broken assumption is visible.

| Logger state | Ordinary call | Null-conditional call |
|---|---|---|
| Initialized | Calls `LogDebug` | Calls `LogDebug` |
| Null | Throws at the access | Skips `LogDebug` |

<figure>
  <a href="/images/diagrams/null-conditional-required-call.svg"><img src="/images/diagrams/null-conditional-required-call.svg" alt="After a simulated save, a missing logger causes an ordinary call to throw, while a null-conditional call skips the log and returns normally." loading="lazy" /></a>
  <figcaption>The missing logger is the same defect in both paths. Conditional access changes whether that defect interrupts the operation or silently omits the log.</figcaption>
</figure>

If every insert requires a logging call, a normal return with no log is a bug. Making that path quiet has hidden the problem.

The earlier save has already happened on both paths. A real requirement to save data and its audit record together needs an appropriate persistence design. A question mark, a direct call, or an exception by itself supplies no transaction guarantee.

## Fix the initialization problem

If the logger should exist, find out why it does not. Fix the initialization path. Adding conditional access at the point of use does nothing to establish the missing object.

In this particular static entry-point design, I know the initialization order. I can keep the non-nullable declaration and narrowly suppress the initialization warning:

```csharp
#pragma warning disable CS8618
private static ApplicationLogger applicationLogger;
#pragma warning restore CS8618
```

`Main` still has to initialize it before calling anything that uses it. `InsertBlogPost` keeps its ordinary call:

```csharp
applicationLogger.LogDebug(nameof(InsertBlogPost), blogPost);
```

This preserves the required operation. The suppression is an assertion about the startup order that I have checked. It does not initialize the field, and it does not protect the program if someone later breaks that order.

I do not find this expression of the design particularly satisfying. I would prefer a cleaner way to express that this field is initialized early in the entry point and required afterward. But I will not turn required work into optional work to make a warning disappear.

There is another option at the call site. With a nullable field, the null-forgiving operator suppresses the warning for that expression:

```csharp
private static ApplicationLogger? applicationLogger;

// Inside InsertBlogPost:
applicationLogger!.LogDebug(nameof(InsertBlogPost), blogPost);
```

`!` does not test for null or change the runtime value. If the field is null, this call still throws. If it is initialized, the call proceeds. It removes a warning without introducing the skip performed by `?.`. [C# null-forgiving operator](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/null-forgiving).

That addresses the call, but I still object to the field declaration in this example: it expresses optionality where I intend a required logger. Choose deliberately. Do not scatter suppressions through a program whose initialization you have not established.

An attribute such as `[NotNull]` also describes a promise to static analysis. It does not construct a logger. Annotating a field cannot perform the missing initialization, and it does not remove the need to justify that promise.

The three pieces of syntax are easy to conflate, so keep their jobs clear:

| Syntax | Meaning here |
|---|---|
| `ApplicationLogger?` | Annotates a reference as possibly null for static analysis. |
| `applicationLogger?.LogDebug(...)` | Skips the call at runtime when the receiver is null. |
| `applicationLogger!.LogDebug(...)` | Suppresses a nullable warning for the receiver; runtime access remains an ordinary call. |

Nullable reference annotations provide compiler analysis and warnings. They do not create a different runtime reference type or insert runtime checks that enforce the annotation. [Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types).

## When skipping really is correct

Disposal provides a useful contrast. A resource might never have been created. In that case, there is nothing to dispose, and skipping disposal is exactly right.

This small example makes the two paths explicit:

```csharp
using System.IO;

MemoryStream? stream = null;
try
{
    stream = new MemoryStream();
    stream.WriteByte(42);
}
finally
{
    stream?.Dispose();
}
```

If construction fails before the assignment, `stream` is null and cleanup has no stream to dispose. If construction succeeds, the `finally` block disposes the created stream, including when subsequent work fails. Here the question mark expresses a real possibility and the correct response to it.

Compare that with a scope entered only after construction succeeds:

```csharp
var stream = new MemoryStream();
try
{
    stream.WriteByte(42);
}
finally
{
    stream.Dispose();
}
```

The `finally` block belongs to the `try` entered after successful construction. Adding `?.` to this disposal call would suggest uncertainty that this local flow does not have. A `using` statement normally handles this straightforward lifetime more concisely; the explicit blocks make the difference in initialization paths visible.

## Read the code you have written

My frustration comes from seeing the same sequence repeatedly: a tool points at a possible problem, someone removes the squiggle, and nobody checks whether the resulting code still expresses the intended behavior.

The compiler and the IDE are useful. They cannot decide whether your application is allowed to omit a logging call or a business operation. That decision belongs to the requirements and the design.

I liked the convenience of this feature when it arrived. After seeing the bugs caused by its misuse, I would rather not have it for the benefit it gives me. That is my opinion, based on the code I have had to review. The operator does have legitimate uses. Use it when you can explain both why the object may be null and why skipping the access is correct.

Before leaving a `?.` in your code, answer those two questions. If the object is required, establish it and use it. If absence is expected, make the intended behavior on that path clear. The next person should be able to read the code and understand the same intention you had when writing it.
