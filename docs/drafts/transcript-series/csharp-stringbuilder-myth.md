---
title: "So You Think You Know C#? The StringBuilder Myth"
description: "StringBuilder suits growing results, but can cost more for fixed concatenation. Compiler output, allocations and benchmark checks explain when to choose it."
datePublished: 2020-04-06
dateModified: 2020-04-06
tags: ["benchmarking", "csharp"]
hero: csharp-stringbuilder-myth-assembly
youtube: "https://www.youtube.com/watch?v=B71rabZtWWI"
repositories:
  - label: VariousBenchmarks
    url: "https://github.com/matlus/VariousBenchmarks"
    context: "StringConcatVsMutate.cs and StringConcatenationBenchmark.cs contain the original experiments."
draft: true
---

How often have you heard that you should use a `StringBuilder` whenever you concatenate strings? I have seen that advice turn a perfectly readable `ToString` implementation into a sequence of `Append` calls, with the assumption that the extra code must be faster.

That assumption deserves a benchmark.

There are two operations we need to distinguish. We can combine a known set of values into one result, or we can accumulate a result as a loop discovers more pieces. Both produce a string. They can do very different amounts of work along the way.

My default for a fixed expression is `+` or string interpolation. When a result grows over successive iterations, `StringBuilder` becomes a useful candidate. Understanding why will give you a better rule than counting plus signs.

## Four ways to produce the same sentence

Start with these six values:

```csharp
var s1 = "Hello";
var s2 = " World.";
var s3 = " How";
var s4 = " Are";
var s5 = " You";
var s6 = " Doing?";
```

The spaces are already in the values. Each of these expressions produces `Hello World. How Are You Doing?`:

```csharp
var plus = s1 + s2 + s3 + s4 + s5 + s6;
var format = string.Format("{0}{1}{2}{3}{4}{5}", s1, s2, s3, s4, s5, s6);
var interpolation = $"{s1}{s2}{s3}{s4}{s5}{s6}";
```

We can also keep assigning a larger result to the first variable:

```csharp
s1 += s2;
s1 += s3;
s1 += s4;
s1 += s5;
s1 += s6;
```

I call that last form *mutation* when discussing the variable. The variable changes which string it refers to. The existing string object's characters remain unchanged.

The original small benchmark compared these four forms. The fixed plus expression performed well; `string.Format` incurred formatting work; repeated reassignment created intermediate results. To understand those results, look at what the compiler emits.

## A row of plus signs need not mean a row of intermediate strings

For the six-string expression, the compiler used in the original experiment emitted a string array followed by a call to `string.Concat`. Conceptually, the operation was:

```csharp
var combined = string.Concat(new[] { s1, s2, s3, s4, s5, s6 });
```

That call can consider all the lengths before allocating its result. It can then copy the pieces into their final positions. It does not need to construct a separate prefix string after every plus sign.

The explicit `string.Format` call has different work to do: interpret a format string and substitute its arguments. In the historical emitted code, its six arguments went into an object array. If you need formatting, that work may be appropriate. If you only need to join strings, it is extra machinery.

Interpolation requires a little care. An interpolated expression that adds literal spaces between these values changes the result, because the values already contain spaces. After removing those extra spaces, the original compiler could lower the string-only expression to concatenation. Reducing it to four strings selected the four-string `Concat` overload, avoiding that temporary argument array.

Treat that as an observation about that compiler and target. C# 10 introduced interpolated string handlers, and modern lowering depends on the expression, target and available APIs. An interpolated expression containing numbers or formatting instructions need not follow the same path as one containing only strings. [Microsoft's explanation of C# 10 interpolation](https://devblogs.microsoft.com/dotnet/string-interpolation-in-c-10-and-net-6/) describes those changes.

The useful habit is to inspect the generated work when it matters. The number of operators visible in source is a poor allocation counter. The current [runtime implementation of `String.Concat`](https://github.com/dotnet/runtime/blob/v10.0.0/src/libraries/System.Private.CoreLib/src/System/String.Manipulation.cs) also lets you follow length calculation, result allocation and copying directly.

## What `+=` does to an immutable string

Consider the smaller example:

```csharp
var text = "Hello";
var original = text;
text += " World";
Console.WriteLine(original); // Hello
Console.WriteLine(text);     // Hello World
```

We need enough space for both pieces in the result. The existing `Hello` object cannot grow into `Hello World`. Concatenation produces a result containing the original characters followed by the appended characters, and the assignment changes `text` to refer to that result. `original` still refers to `Hello`.

![Five cells spelling HELLO are copied into the first five positions of a new eleven-cell string spelling HELLO WORLD. The original five cells remain unchanged.](/images/diagrams/csharp-string-concatenation-copy.svg)

The conceptual diagram uses capital letters to make each character clear. Its arrows show copying into the new result; the blank cell holds the space before `WORLD`.

If we do this repeatedly, each growing prefix becomes an input to the next operation. We copy characters that we have already copied. For equal-sized, nonempty pieces, the copied prefixes grow approximately like 1, 2, 3, 4 and so on. The accumulated copying can become quadratic in the number of pieces.

There are allocation costs as well as copying costs. Repeated concatenation can allocate intermediate result strings that a single fixed concatenation avoids. They become eligible for collection when nothing retains them. String literals may be interned, so assigning away from a literal does not establish that its object will be collected.

Managed allocation can be very fast. That does not make it free, and it does not pay for copying or later garbage collection. If the same operation runs frequently, all three costs matter.

## A `ToString` call is still one result

Suppose a DTO has several properties and its `ToString` method combines those values. Use a clear fixed expression. I would not introduce a builder simply because there are several properties.

What if the application calls that method thousands of times? Each call still produces its own completed result. It has not become one string that grows across thousands of iterations. The structure of the operation matters.

There may be a separate opportunity to cache the completed result if the underlying values cannot change, or if invalidation is handled correctly. That is a different design decision. A builder does not automatically eliminate the cost of repeatedly producing the same output.

Now change the problem. A loop receives pieces and the caller wants the complete result only after the loop finishes. That is the situation where we should look closely at a builder.

## Compare the work inside the loop

The larger benchmark uses between two and ten strings, each fifty characters long. It creates those input strings during setup. The benchmark methods then combine the same prepared inputs.

These are the original repeated-concatenation methods. `NumberOfStrings` is the selected input count, and `stringsToConcat` is the prepared array:

```csharp
public string PlusOperatorLoop()
{
    string concatenatedString = null;
    for (int i = 0; i < NumberOfStrings; i++)
    {
        concatenatedString += stringsToConcat[i];
    }
    return concatenatedString;
}

public string ConcatLoop()
{
    string concatenatedString = null;
    for (int i = 0; i < NumberOfStrings; i++)
    {
        concatenatedString = string.Concat(concatenatedString, stringsToConcat[i]);
    }
    return concatenatedString;
}
```

Both keep feeding a growing prefix into the next concatenation. Writing `Concat` explicitly does not change that structure. The original sample starts with `null`, which concatenation treats as an empty contribution. In code with nullable reference types enabled, make that choice explicit or start with `string.Empty`.

The builder version accumulates characters and converts the accumulated content once:

```csharp
public string StringBuilderLoop()
{
    var stringBuilder = new System.Text.StringBuilder();
    for (int i = 0; i < NumberOfStrings; i++)
    {
        stringBuilder.Append(stringsToConcat[i]);
    }
    return stringBuilder.ToString();
}
```

Keep `ToString()` outside the loop if you only need the final result. Asking for a new string after every append would introduce a different workload.

The benchmark also includes versions without a loop. `PlusOperator` uses an explicit expression for each count from two through ten. `ConcatMethod` calls the two-, three- or four-string overload for those counts, then passes the existing array for larger counts. `StringBuilder` spells out the same number of `Append` calls rather than looping. These distinctions explain what the labels mean; they are not interchangeable implementations of the same underlying work.

## Read the historical results with their limitations

The chart recreates the original workbook's values. Its horizontal axis is the number of fifty-character inputs; its vertical axis is elapsed time in nanoseconds. These are historical measurements from the original experiment, not a fresh performance claim about current .NET.

![Eight historical string-concatenation series for two through ten fifty-character strings. Repeated plus and Concat loops rise to about 550 nanoseconds; fixed concatenation remains below 200; the builder variants lie between.](/images/diagrams/csharp-stringbuilder-benchmarks.svg)

At ten inputs, the recorded values were:

| Method label | Time, ns | Allocated bytes |
|---|---:|---:|
| PlusOperator | 181.85 | 1,136 |
| PlusOperatorLoop | 550.91 | 5,672 |
| ConcatMethod | 154.71 | 1,032 |
| ConcatLoop | 564.55 | 5,672 |
| StringBuilder | 405.28 | 3,072 |
| StringBuilderLoop | 405.89 | 3,072 |
| StringBuilderLoopCached | 306.39 | 3,104 |
| StringJoin | 182.27 | 1,048 |

For this workload, introducing a builder into a fixed concatenation increased both time and allocated memory. At ten inputs, the builder loop did better than repeatedly concatenating a growing prefix. At two inputs, however, the overhead of constructing and finishing a builder dominated. There is no universal crossover point to memorize from these nine input counts.

The `Join` result surprised me because it was close to fixed concatenation. There is an important qualification in the saved source:

```csharp
return string.Join('\0', stringsToConcat);
```

That separator is a NUL character. It is not an empty separator. With ten fifty-character inputs, this method returns 509 characters, including nine separators; concatenation returns 500. The chart preserves that original experiment, but this row does not produce the same output as the other rows. For a comparison requiring no separator, use `string.Join(string.Empty, stringsToConcat)` and measure that separately.

The source also contains a `StringFormat` method that inserts spaces between the parts. It is absent from this eight-series chart and also differs from plain concatenation. Output equality belongs in benchmark preparation, before interpreting timings.

The cached-builder label needs its own explanation too.

## What a builder stores

A builder provides mutable construction storage. Appending into available storage avoids allocating a complete replacement string for each growing prefix. Once the result is ready, `ToString()` produces the string the caller needs.

Implementation details have changed over .NET's lifetime. Older implementations used string-based internal storage; .NET 4 introduced the chunked design. Those internal construction techniques do not give application code permission to mutate an ordinary published string.

In the .NET 10 implementation, the builder holds a character array and a link named `m_ChunkPrevious` to an earlier chunk. Growth can retain existing chunks and add storage instead of copying the entire accumulated prefix. The implementation uses an 8,000-character growth heuristic; that is neither an 8 KB size nor an absolute maximum allocation. `ToString()` allocates the final contiguous string and copies the chunks into it. [The runtime source](https://github.com/dotnet/runtime/blob/v10.0.0/src/libraries/System.Private.CoreLib/src/System/Text/StringBuilder.cs) shows those fields and operations.

Small construction chunks can reduce large intermediate allocations. They do not prevent a sufficiently large final string from entering the large object heap. A builder changes where and when work happens; it does not make the final result or its copying disappear.

## Reusing a builder requires ownership and a capacity policy

The sample includes a copy of Microsoft's internal `StringBuilderCache` pattern. It keeps one cached builder per thread. `Acquire` takes a suitable builder out of the cache and clears its length, or creates one. `GetStringAndRelease` obtains the completed string and offers the builder back for reuse.

Removing it from the cache while it is in use matters. Two operations must not append to the same builder concurrently. After releasing it, the caller must stop using it. A thread-local cache is also not a general ownership model for work that moves between threads.

The benchmark calls that helper like this:

```csharp
public string StringBuilderCachedLoop()
{
    var stringBuilder = StringBuilderCache.Acquire(NumberOfStrings * StringLength * 2);
    for (int i = 0; i < NumberOfStrings; i++)
    {
        stringBuilder.Append(stringsToConcat[i]);
    }
    return StringBuilderCache.GetStringAndRelease(stringBuilder);
}
```

`StringBuilderCache` here is supplied by the sample; it is not a public framework API to call from an arbitrary application.

There is a mistake in the capacity calculation that we should understand before copying it. `StringBuilder` capacity is a count of characters. Multiplying by two because a UTF-16 code unit occupies two bytes is unnecessary. For these non-null inputs, `NumberOfStrings * StringLength` is the required character count.

The copied cache only retains builders whose capacity is at most 360. With fifty-character inputs, the expression above asks for 200 characters at two inputs and 300 at three inputs. At four inputs it asks for 400, and at ten it asks for 1,000. Those larger builders fall outside the cache's reuse policy.

Consequently, the row named `StringBuilderLoopCached` does not demonstrate caching throughout the chart. At four through ten inputs it also measures a newly allocated builder with a generous initial capacity. Pre-sizing changes growth behavior even when reuse never occurs. That is why we must read the implementation behind a benchmark label.

If the approximate result size is known, supplying a sensible initial capacity is a useful experiment. If all the pieces are already in an array and simply need concatenating, `string.Concat` is another direct candidate. Introduce a cache only when measured reuse justifies its ownership and retention rules.

## Choose from the operation you actually have

For a fixed set of values, I prefer a readable plus expression or interpolation. I would ask for evidence before replacing it with a builder in the name of performance.

For a result that grows over successive iterations, avoid repeatedly rebuilding the entire prefix by habit. Try a builder, finish it once, and compare it with any direct operation available for your input. Include the cost of obtaining the final string.

Then check that every candidate returns the same characters. Inspect the compiler's output where it explains a difference. Record the runtime and input sizes. Measure time and allocations together.

`StringBuilder` is useful when its construction strategy fits the work. Understanding that strategy gives us a reason to choose it.
