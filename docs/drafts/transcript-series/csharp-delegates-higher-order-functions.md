---
title: "So You Think You Know C#? Delegates and Higher Order Functions"
description: "Delegates let callers supply behavior to reusable methods. Lambda syntax and SingleElseException show how higher order functions add useful failure details."
datePublished: 2020-03-08
dateModified: 2020-03-08
tags: ["delegates", "error-handling", "linq", "csharp"]
hero: csharp-delegates-higher-order-functions-hardware
youtube: "https://www.youtube.com/watch?v=q1BCmwnkFfM"
repositories:
  - label: SingleElseExceptionStarter
    url: "https://github.com/matlus/SingleElseExceptionStarter"
    context: "Movie data and related examples. This article uses the demonstrated single-pass helper; the repository also contains a version that enumerates its query more than once."
draft: true
---

Many C# developers use lambdas every day. Ask what the lambda becomes, what type a method expects, or why two apparently identical delegates cannot be interchanged, and the explanation becomes less certain.

That matters. Convenient syntax can let us move quickly while hiding the mechanism we need to understand. If you have been writing C# professionally for a couple of years, I expect you to understand delegates. A senior developer ought to be comfortable explaining what the compiler and runtime are doing here.

Let's start with a delegate declaration, work through the syntax we commonly use with LINQ, and then build something useful: a method that selects exactly one item and lets its caller supply a meaningful exception when that expectation fails.

## A delegate declaration declares a type

Consider this declaration:

```csharp
internal delegate void TransformDelegate(string data);
```

It resembles a method declaration. There is a return type, a name and a parameter list. But `TransformDelegate` is the name of a **type**. The compiler emits a class derived from `MulticastDelegate`, with the machinery required to invoke methods having the declared signature. Microsoft's explanation of [the delegate class](https://learn.microsoft.com/en-us/dotnet/csharp/delegate-class) describes this relationship.

An instance of that type represents a call to a compatible method. For this example, the method accepts one `string` and returns `void`. Let's give it two methods to call:

```csharp
using System;

internal static class Program
{
    public static void Main(string[] args)
    {
        TransformDelegate a = new TransformDelegate(Method1);
        TransformDelegate b = Method2;
        TransformDelegate c = a + b;

        a.Invoke("Hello");
        c("World");
    }

    private static void Method1(string data)
    {
        Console.WriteLine("Method1: " + data);
    }

    private static void Method2(string data)
    {
        Console.WriteLine("Method2: " + data);
    }
}

internal delegate void TransformDelegate(string data);
```

The first assignment explicitly constructs a delegate for `Method1`. The second uses a method-group conversion: the compiler has enough information from the target type to create the appropriate delegate for `Method2`.

Notice the absence of parentheses after `Method1` and `Method2` in those assignments. We are identifying methods for later invocation. Writing `Method1("Hello")` would execute the method immediately, and its `void` result could not be assigned to `a`.

The final assignment combines the invocation lists of `a` and `b`. Calling `c` invokes `Method1`, followed by `Method2`, with the supplied argument. The output is:

```text
Method1: Hello
Method1: World
Method2: World
```

`a.Invoke("Hello")` and `a("Hello")` express the same delegate invocation. The shorter form can look like an ordinary method call, but `a` is a variable containing a delegate instance.

There is a useful distinction here. The declaration supplies the delegate type. Assignments create or obtain values of that type. Invocation asks a delegate value to execute its target method or methods. Keep those three steps separate in your understanding, even when the compiler lets you express them compactly.

## The delegate in Where

Now consider an ordinary LINQ expression. We have numbers and want only the even ones:

```csharp
using System;
using System.Linq;

internal static class Program
{
    public static void Main(string[] args)
    {
        var numbers = Enumerable.Range(0, 99);
        var evenNumbers = numbers.Where(EvenNumbers);

        Console.WriteLine(string.Join(", ", evenNumbers));
    }

    private static bool EvenNumbers(int number)
    {
        return number % 2 == 0;
    }
}
```

`Range` takes a starting value and a count. These are the 99 integers from 0 through 98. Enumerating `evenNumbers` prints 0, 2, 4 and so on through 98.

The predicate parameter of this `Where` overload has type `Func<int, bool>`. Its job is to decide whether an input integer belongs in the result. `EvenNumbers` accepts an integer and returns a Boolean, so its method group can be converted to that delegate type.

What is special about `Func`? It is a family of generic delegate types provided by the framework. In `Func<int, bool>`, `int` describes the input and the final type argument, `bool`, describes the return value. For a function with two inputs, `Func<int, int, bool>` would describe two integer parameters and a Boolean result.

The other familiar family is `Action`. `Action<string>` accepts a string and returns `void`, just as our `TransformDelegate` does. `Predicate<int>` accepts an integer and returns a Boolean. These framework delegates save us from declaring a new named delegate type for every signature.

They remain distinct types. The fact that `Predicate<int>` and `Func<int, bool>` describe the same parameter and return types does not make a variable of one type interchangeable with a variable of the other.

## From a named method to a lambda

The named method makes the pieces easy to see. We can move the same calculation into an anonymous method at the call site:

```csharp
var evenNumbers = numbers.Where(delegate(int n)
{
    return n % 2 == 0;
});
```

There is still an integer parameter and a Boolean result. We have removed the separate method name and placed its implementation where the delegate is needed.

A statement lambda expresses that same calculation like this:

```csharp
var evenNumbers = numbers.Where((int n) =>
{
    return n % 2 == 0;
});
```

For a single expression, we can remove the block and `return`:

```csharp
var evenNumbers = numbers.Where((int n) => n % 2 == 0);
```

The compiler already knows the element type of `numbers`, so it can infer the parameter type. For one parameter with an inferred type, we can also omit the parentheses:

```csharp
var evenNumbers = numbers.Where(n => n % 2 == 0);
```

This is the form most of us recognize immediately. We arrived at it by progressively removing syntax that the compiler does not need us to write. The predicate still accepts an integer and returns a Boolean. `Enumerable.Where` still receives a delegate.

Do not make the broader claim that every lambda is always a delegate. A lambda can also be converted to an expression tree when its context requires one. Here we are calling `Enumerable.Where` on an in-memory sequence, and its parameter requires a `Func<int, bool>`. The [lambda reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions) explains those conversions. Also, compact syntax alone tells us neither how many allocations occur nor whether a compiler reuses a delegate instance.

We can make the required delegate visible again by giving it a variable:

```csharp
Func<int, bool> myDel = n => n % 2 == 0;
var evenNumbers = numbers.Where(myDel);
```

The lambda expression defines the behavior. The variable `myDel` has an actual delegate type. Passing the variable to `Where` makes that type relationship explicit.

## Matching signatures do not erase type identity

Suppose we declare our own delegate:

```csharp
internal delegate bool MyFunc(int number);
```

It has the same parameter and return types as `Func<int, bool>`. This assignment is valid:

```csharp
MyFunc myDel = n => n % 2 == 0;
```

But this call does **not compile**:

```csharp
var evenNumbers = numbers.Where(myDel);
```

`Where` expects a `Func<int, bool>`. We supplied a `MyFunc`. A compatible method can be used to create either delegate, but an existing `MyFunc` value does not acquire the identity of `Func<int, bool>` merely because their signatures agree.

This is why the named `EvenNumbers` method worked earlier. The method group could be converted to the type required by `Where`. In the failing example, we first committed to a different delegate type and then tried to pass that typed value to `Where`.

Following the types answers the question much more reliably than looking at the lambda's punctuation.

## Passing behavior into a method

A higher order function accepts functions as arguments, returns functions, or both. In our C# examples, delegates provide the values through which that behavior is supplied. `Where` is already an example: it accepts the predicate that decides which items to keep.

We commonly think of a method's parameters as data: a year, a customer identifier, an amount. A delegate parameter lets the caller supply a piece of behavior as well. The receiving method can run its general algorithm while the caller determines a specific decision within it.

This gives us another way to vary behavior, alongside techniques such as polymorphism. It does not mean every method should take a collection of callbacks. I don't use higher order functions everywhere. I do expect developers to understand them well enough to recognize where that separation helps.

Let's use one to improve a failure that LINQ leaves rather poorly explained.

## What does “more than one matching element” tell us?

Imagine that we expect exactly one movie for a particular year:

```csharp
var requiredYear = 2019;
var requiredMovie = s_AllMovies.Single(m => m.Year == requiredYear);
```

Our sample contains seven movies for 2019. `Single` cannot return one of them because its contract requires exactly one match. It throws an `InvalidOperationException`. No matching movie is also a failure. `First` would express a different requirement: accept the first match even if more exist.

I have a problem with the information we get from that exception. Which sequence was involved? What were we looking for? How many items matched? Which items were they?

A message saying that a sequence contains more than one matching element leaves those questions unanswered. I also find `InvalidOperationException` a poor name for communicating this business failure. The person diagnosing the problem needs to know what happened in the application, and the framework has no knowledge of our movies or the requested year.

Think about the analyst who first receives the error. A message identifying the requested year and the matching movies can make the problem understandable immediately. A generic collection error can send it through several people before anyone discovers the relevant input.

The caller already knows the missing context. How can we let it supply the exception while keeping the selection method reusable?

## SingleElseException

The method needs the sequence, a predicate and a function that constructs an exception. The exception function should receive the matched items so that its message can explain the actual failure.

Here is the extension method:

```csharp
internal static class EnumerableExtensions
{
    public static T SingleElseException<T>(
        this IEnumerable<T> sequence,
        Func<T, bool> predicate,
        Func<IEnumerable<T>, Exception> exceptionFactory)
    {
        var matchedItems = new List<T>();

        foreach (var item in sequence)
        {
            if (predicate(item))
            {
                matchedItems.Add(item);
            }
        }

        if (matchedItems.Count == 1)
        {
            return matchedItems[0];
        }

        throw exceptionFactory(matchedItems);
    }
}
```

The algorithm is straightforward. Enumerate the input once and collect every item that satisfies the predicate. Return the item when there is exactly one. Otherwise, ask the caller's function to construct an exception and throw it.

Look carefully at `Func<IEnumerable<T>, Exception>`. Its input is the collection of matches. Its return type is `Exception`. The caller returns an exception object; this method performs the `throw`. On the successful path the exception factory is never called.

The helper knows nothing about movies, years or the wording of the error message. All of that belongs to the caller. We have separated the general selection rule from the explanation of what a failed selection means in this application.

## A complete movie example

The following console program combines that helper with the seven matching entries from the sample data. To keep it self-contained, the `Movie` model includes only the title, genre and year used here; the original also has an image URL. The exception message is completed here to demonstrate the diagnostic information the caller can provide.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

internal static class Program
{
    public static void Main(string[] args)
    {
        var movies = new[]
        {
            new Movie("Avengers: Endgame", "Sci-Fi", 2019),
            new Movie("The Intruder", "Drama", 2019),
            new Movie("Bolden", "Drama", 2019),
            new Movie("Clara", "Sci-Fi", 2019),
            new Movie("Captain Marvel", "Sci-Fi", 2019),
            new Movie("The Hustle", "Comedy", 2019),
            new Movie("All Is True", "Drama", 2019)
        };

        var requiredYear = 2019;

        try
        {
            var requiredMovie = movies.SingleElseException(
                m => m.Year == requiredYear,
                matchedMovies =>
                {
                    var matches = matchedMovies.ToList();
                    var message = new StringBuilder();

                    message.AppendLine(
                        $"Expected exactly one movie for {requiredYear}; " +
                        $"found {matches.Count}.");

                    foreach (var movie in matches)
                    {
                        message.AppendLine(
                            $"{movie.Title} ({movie.Year}, {movie.Genre})");
                    }

                    return new FilterMovieException(message.ToString());
                });

            Console.WriteLine(requiredMovie.Title);
        }
        catch (FilterMovieException exception)
        {
            Console.Write(exception.Message);
        }
    }
}

internal sealed class Movie
{
    public string Title { get; }
    public string Genre { get; }
    public int Year { get; }

    public Movie(string title, string genre, int year)
    {
        Title = title;
        Genre = genre;
        Year = year;
    }
}

internal sealed class FilterMovieException : Exception
{
    public FilterMovieException(string message) : base(message)
    {
    }
}

internal static class EnumerableExtensions
{
    public static T SingleElseException<T>(
        this IEnumerable<T> sequence,
        Func<T, bool> predicate,
        Func<IEnumerable<T>, Exception> exceptionFactory)
    {
        var matchedItems = new List<T>();

        foreach (var item in sequence)
        {
            if (predicate(item))
            {
                matchedItems.Add(item);
            }
        }

        if (matchedItems.Count == 1)
        {
            return matchedItems[0];
        }

        throw exceptionFactory(matchedItems);
    }
}
```

Running it produces:

```text
Expected exactly one movie for 2019; found 7.
Avengers: Endgame (2019, Sci-Fi)
The Intruder (2019, Drama)
Bolden (2019, Drama)
Clara (2019, Sci-Fi)
Captain Marvel (2019, Sci-Fi)
The Hustle (2019, Comedy)
All Is True (2019, Drama)
```

These are the sample's stored year values. The selection operates on those values; it does not consult a film catalogue.

The exception factory can use `requiredYear` even though that value is not a parameter of the factory. The lambda captures the surrounding local variable. That is a closure. It lets the caller combine its search criteria with the matched items supplied by the helper.

Changing `requiredYear` to 2020 gives a message reporting zero matches. Reducing the input to a single 2019 movie returns that movie, and execution reaches `Console.WriteLine(requiredMovie.Title)` without constructing an exception. A different application can supply a different exception type and message while reusing the same extension method.

The catch block is included so the small console program displays the message. Where an application handles or logs the exception is a separate decision from constructing a useful exception at the point of failure.

## The cost of explaining every match

This helper deliberately collects all matches. That gives the exception factory enough information to list them, but it also means reading the complete input and storing the matches. Use it with finite sequences where that diagnostic detail is worth the work.

Framework `Single` can fail as soon as it finds a second match; it does not need the remaining matches to establish that the exactly-one condition is false. Our helper has chosen a different failure path to obtain better information. It is not a performance replacement for `Single`, nor does this compact teaching implementation reproduce all of the framework method's argument validation.

Because the helper materializes its matches, the exception factory can inspect that list without re-running the original input sequence. The extra `ToList` in the completed message example copies those already collected references; it does not execute the original query again. An application can choose a more specific collection contract if avoiding that copy matters.

## Understand the mechanism before relying on the shortcut

Learning only the shortest lambda syntax reminds me of learning to ride with training wheels. Eventually you need to understand how to balance the bicycle. In programming, the compiler's conveniences are useful, but you should be able to explain the work they represent.

Experience also resembles driving a familiar road. Someone who knows its bends and hills can anticipate what is coming. An unfamiliar driver has to discover each turn as it arrives. Understanding delegate types gives you that familiarity when a compact expression stops compiling or a callback behaves differently from what you expected.

We began with a declared delegate type and two ordinary methods. We then followed the same idea through method groups, anonymous methods and lambdas. Finally, we used a delegate parameter to let a caller explain a failed movie selection in the application's own terms. The syntax becomes much easier to reason about once those relationships are clear.
