---
title: "So You Think You Know C#? For vs. Foreach"
description: "The type a foreach loop sees determines its enumeration path. Array lowering, list enumerators and yield state machines explain the work behind the syntax."
datePublished: 2020-03-15
dateModified: 2026-10-04
tags: ["benchmarking", "iterator-pattern", "design-patterns", "csharp"]
hero: csharp-for-foreach
youtube: "https://www.youtube.com/watch?v=9bTpI86bA5E"
draft: true
---

You have probably written thousands of `foreach` loops. You give one a collection, it gives you each item, and you do something with that item. What does the compiler have to produce to make that happen?

A small benchmark gives us a reason to look. In this particular experiment, `foreach` takes about twice as long as `for` and allocates memory. The useful part is explaining those observations. Once we understand the mechanism, we can also make a class work with `foreach` without inheriting from a collection or implementing `IEnumerable<T>`.

I would still start with `foreach` when the operation is simply to visit each item. Investigate this level of optimization when measurement identifies a hot path, especially framework code called thousands of times. A benchmark of two methods does not establish a rule to replace every loop in an application.

## Start with the actual comparison

The two benchmark methods add the `Year` of every movie. Their fields are initialized before the measured operations:

```csharp
private static IList<Movie> s_MoviesList = GetMovies();
private static IEnumerable<Movie> s_Movies = GetMovies();
```

`GetMovies` builds a `List<Movie>`. These are two calls that prepare separate lists of the same movie data. One field exposes indexing through `IList<Movie>`; the other exposes enumeration through `IEnumerable<Movie>`. Keep those declared types in mind.

Here are the operations being measured:

```csharp
[Benchmark]
public int ForeachBenchmark()
{
    var total = 0;
    foreach (var movie in s_Movies)
    {
        total += movie.Year;
    }

    return total;
}

[Benchmark(Baseline = true)]
public int ForBenchmark()
{
    var total = 0;

    for (int i = 0; i < s_MoviesList.Count; i++)
    {
        total += s_MoviesList[i].Year;
    }

    return total;
}
```

Returning the sum gives the benchmark a result to consume. Collection construction is outside both methods. There is no console output inside the timed loops.

The original March 2020 result used BenchmarkDotNet 0.12.0, .NET Framework 4.8, the x86 Legacy JIT and an Intel Core i7-4771:

| Method | Mean | Error | Standard deviation | Ratio | Allocated per operation |
|---|---:|---:|---:|---:|---:|
| `ForeachBenchmark` | 440.4 ns | 0.30 ns | 0.28 ns | 2.05 | 24 B |
| `ForBenchmark` | 214.3 ns | 0.56 ns | 0.44 ns | 1.00 | No allocation reported |

The baseline explains the ratio column: one invocation of `ForeachBenchmark` took about 2.05 times the baseline's time. The 24 bytes belong to one complete invocation of the method, not to each movie.

These are historical measurements of these implementations. A different runtime, architecture, collection type or loop body can change the result. They are useful evidence for investigating the enumeration path, but they cannot tell us the cost of every `foreach` expression.

## There are two compilation steps to consider

The C# compiler translates our source into Intermediate Language, or IL. While doing that, it lowers language features into operations the runtime can execute. A compact construct such as `foreach` may require several operations in IL.

The JIT compiler subsequently turns IL into machine code. It can inline methods, remove work it can prove unnecessary, and apply other optimizations. Loop unrolling is one possible optimization: a compiler can replace some loop iterations with repeated instructions. A known iteration count does not guarantee that a particular JIT will unroll a loop.

Our benchmark measures executing code after the runtime has had its part in the process. Looking at IL helps explain how we reached that code, but IL alone is not a timing measurement or the final machine code.

There is another trap when looking under the hood. A decompiler tries to turn IL back into readable C#. It may recognize an enumeration sequence and display `foreach` again. That is convenient when you want to understand a program's intent. It hides exactly the transformation we are trying to inspect here.

Tools such as ILSpy and SharpLab can help examine lowering. Pay attention to the output mode and language reconstruction. If the decompiler has put the convenient syntax back, inspect IL or an output form that exposes the enumerator operations.

## What the enumerator does

For the `IEnumerable<Movie>` field, this is the essential shape of the loop, expressed as ordinary C# with readable local names:

```csharp
public int ForeachExpanded()
{
    var total = 0;
    IEnumerator<Movie> enumerator = s_Movies.GetEnumerator();
    try
    {
        while (enumerator.MoveNext())
        {
            Movie movie = enumerator.Current;
            total += movie.Year;
        }
    }
    finally
    {
        if (enumerator != null)
        {
            enumerator.Dispose();
        }
    }

    return total;
}
```

`GetEnumerator` supplies an object that tracks a traversal. Before the first successful `MoveNext`, there is no current movie to use. Each successful call advances to an item; `Current` then exposes that item. When `MoveNext` returns `false`, the loop has finished.

The `finally` ensures that the enumerator is disposed when control leaves the loop, including through `break` or an exception in the body. `IEnumerator<T>` includes `IDisposable`. The compiler can therefore arrange this cleanup for the generic interface path. The [language specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/statements#1395-the-foreach-statement) describes the translation and its other cases.

You may also notice `Reset` on the non-generic enumerator interface. `foreach` does not call it to start over. A new loop obtains an enumerator again. Compiler-generated iterator implementations commonly throw `NotSupportedException` from `Reset`.

Now compare that work with the indexed loop. The indexed version uses a counter, reads `Count`, fetches an item through the indexer, and adds the year. The enumeration version obtains an enumerator, advances it, reads its current item and performs cleanup. Those are different execution paths even though they produce the same sum.

There is a concrete allocation explanation for the historical result. `List<T>` has a struct enumerator, but this benchmark accesses it through `IEnumerable<Movie>`. Returning that enumerator through `IEnumerator<Movie>` can box it. On the measured runtime, the complete enumeration reported 24 bytes of allocation. Modern runtimes may optimize interface calls and allocations differently, so remeasure on the deployment runtime before carrying the number forward.

## Arrays and lists take different paths

What if the expression after `in` has the declared type `Movie[]`?

```csharp
Movie[] movies = GetMovies().ToArray();
var total = 0;

foreach (Movie movie in movies)
{
    total += movie.Year;
}
```

For a normal one-dimensional array, the compiler can use an index and the array's length. A readable representation of that lowering is:

```csharp
Movie[] array = movies;
for (int index = 0; index < array.Length; index++)
{
    Movie movie = array[index];
    total += movie.Year;
}
```

There is no need to obtain an interface enumerator for this array expression. The array creation in the first listing is illustrative setup; if we benchmark the loop, we must move that setup outside the timed method too.

A `List<Movie>` deserves its own case. Ordinary `foreach` over an expression declared as `List<Movie>` uses `List<Movie>.Enumerator`, a value type. It does **not** receive the array's indexed lowering merely because a list also supports indexing. Accessing the concrete list directly can avoid the interface boxing in the earlier example. [The `List<T>.GetEnumerator` contract](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.getenumerator) identifies the returned enumerator type.

This gives us three useful cases to distinguish:

| Expression's declared type | Typical compiler path |
|---|---|
| `Movie[]` | Array indexing and length |
| `List<Movie>` | Concrete struct enumerator |
| `IEnumerable<Movie>` | Generic enumeration interface |

The runtime object matters, and so does the type visible to the compiler. Changing only the declared type can change the generated operations.

There is also no general rule that an enumerator copies its source collection or makes traversal thread-safe. A list enumerator visits the existing list. Changes to the list can invalidate it; it is not a snapshot. Disposal provides cleanup defined by the enumerator's implementation. It does not tell the garbage collector to free an object immediately.

## A class that foreach understands

We can take this a step further. Suppose we want to write:

```csharp
var movies = new Movies();
foreach (var movie in movies)
{
    Console.WriteLine(movie.Title);
}
```

Does `Movies` have to inherit from `List<Movie>`? Does it at least have to implement `IEnumerable<Movie>`?

For this use, neither is required. Here is the five-movie form of the example. The title, image, genre and year values are retained because they make each yielded object concrete:

```csharp
internal sealed class Movies
{
    public IEnumerator<Movie> GetEnumerator()
    {
        yield return new Movie("Star Wars Episode IV: A New Hope",
            "StarWarsEpisodeIV.jpg", "Sci-Fi", 1977);
        yield return new Movie("Star Wars Episode V: The Empire Strikes Back",
            "StarWarsEpisodeV.jpg", "Sci-Fi", 1980);
        yield return new Movie("Star Wars Episode VI: Return of the Jedi",
            "StarWarsEpisodeVI.jpg", "Sci-Fi", 1983);
        yield return new Movie("Star Wars: Episode I: The Phantom Menace",
            "StarWarsEpisodeI.jpg", "Sci-Fi", 1999);
        yield return new Movie("Star Wars: Episode II: Attack of the Clones",
            "StarWarsEpisodeII.jpg", "Sci-Fi", 2002);
    }
}
```

The `Movie` state object supplies the properties used by both examples:

```csharp
internal sealed class Movie
{
    public string Title { get; }
    public string ImageUrl { get; }
    public string Genre { get; }
    public int Year { get; }

    public Movie(string title, string imageUrl, string genre, int year)
    {
        Title = title;
        ImageUrl = imageUrl;
        Genre = genre;
        Year = year;
    }
}
```

Look at the declaration of `Movies`. It has no collection base class and no interface list. It has a public, parameterless `GetEnumerator` whose return type supplies the `Current` property and a public parameterless `MoveNext` returning `bool`. That is enough for this `foreach` pattern. The compiler checks the shape at compile time. [The iteration statement reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#the-foreach-statement) gives the pattern's requirements.

This is sometimes described as duck typing: the object has the operations required for the job. Here it is a compile-time language pattern, with no need for `dynamic` or runtime member-name lookup. Naming any method `GetEnumerator` is not sufficient; its accessibility, parameters and return type must also support the pattern.

That ability has a useful boundary. `Movies` works in this `foreach`, but it still does not implement `IEnumerable<Movie>`. We cannot assume it will satisfy another API that explicitly requires that interface. Implement the interface when that is the contract callers need.

## Where yield return keeps its place

The body of `GetEnumerator` appears to return five times. A normal `return` would end the method on the first movie. How does execution reach the second one?

`yield return` asks the compiler to construct an iterator state machine. Calling this `GetEnumerator` creates the generated enumerator. Advancing that enumerator executes the iterator body until its next yield. Its state remembers where execution must resume, and its current-item field holds the movie just yielded.

For the five-movie example, the observable sequence is:

| Operation | Result |
|---|---|
| Call `GetEnumerator()` | Obtain an enumerator; the movie-producing body has not run |
| First `MoveNext()` | Construct and yield *A New Hope*; return `true` |
| Second `MoveNext()` | Resume and yield *The Empire Strikes Back*; return `true` |
| Third through fifth `MoveNext()` | Yield the remaining three movies in order |
| Sixth `MoveNext()` | Finish and return `false` |

This produces movies as the caller advances. It does not first fill a hidden list with all five. If the caller stops after the first item, the later `new Movie` expressions are never reached.

The lowered implementation has considerably more machinery than the five yield statements suggest: a generated nested class, an integer state, a current movie, interface members, and a `MoveNext` implementation that resumes at the correct point. The precise generated names are compiler details. The relationship between the state, `MoveNext` and `Current` is what explains the behavior.

Iterator blocks became available in C# 2.0. They saved us from writing that state machine by hand. The language's [version history](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-20) records that introduction.

There is real work behind this particular `GetEnumerator`: it creates a generated enumerator object, and advancing it constructs movies. That does not imply that every `GetEnumerator` allocates an object. We have already seen the concrete list's struct enumerator. Inspect the implementation that your loop actually uses.

If an iterator holds a resource inside a `try`/`finally`, disposing the enumerator allows the required cleanup when iteration ends early. That is one reason the consumer's cleanup matters. The five-movie iterator has no such resource, but a file-reading iterator could. Microsoft's [iterator documentation](https://learn.microsoft.com/en-us/dotnet/csharp/iterators) develops these execution and cleanup semantics.

There is a family resemblance to the state machine behind `async` and `await`: both preserve progress across a suspension. Their resumption mechanisms differ. The synchronous iterator advances when its caller asks for another item; an asynchronous operation resumes according to its awaited work. [Async-Await in C#](/writing/async-await-in-csharp/) and [C# 8 Async Streams](/writing/csharp-8-async-streams/) develop that next step.

## Use the explanation when a measurement needs it

We started with two loops that return the same sum. The historical result showed a difference in time and allocation, and the generated operations give us a way to investigate it. They also explain why an array, a concrete list and an interface reference need separate consideration.

Continue to use `foreach` when it expresses the operation clearly. When a measured hot path warrants closer attention, keep the input and result equivalent, keep setup outside the benchmark, and compare the actual collection types on the runtime you deploy. Then check whether the change helps the application.

The same understanding gives you a useful language feature: a class can participate in `foreach` through the enumeration pattern, and `yield return` can supply the state machine. You can write the sequence you intend while knowing what work the compiler has arranged behind it.
