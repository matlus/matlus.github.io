---
title: ".NET Memory Allocations and Performance, Part 2"
description: "CPU caches reward useful data kept close together. Pipelines, branch prediction and cache lines explain why memory access patterns matter to .NET performance."
datePublished: 2019-08-17
dateModified: 2019-08-17
tags: ["cpu-hardware", "cpu-caches", "csharp"]
hero: dotnet-memory-allocations-part-2
youtube: "https://www.youtube.com/watch?v=Ge0tyJqdhxY"
draft: true
---

In [Part 1](/writing/dotnet-memory-allocations/), we followed values and references through the memory used by a .NET program. Now let us look at the hardware doing the work. A processor can execute instructions very quickly. Keeping it supplied with the instructions and data it needs is a large part of the performance problem.

This matters when you choose a data structure, decide which fields belong together, or write a loop. Two pieces of code can produce exactly the same result and make very different demands on the machine.

Before we get into that, though, look at where your application spends its time. If a request makes a series of unnecessary network or database calls, fix those first. Shaving a little time from a loop will have little effect while the request waits on those calls.

## Start with the expensive journey

My preference is to avoid making repeated trips to the same service or database when one appropriately designed operation can retrieve what the application needs. If calls are independent, consider doing them concurrently. Their independence matters: a call that needs the previous call's result cannot simply start alongside it.

The distance data travels also matters. In one system I worked on, moving a service closer to the system it communicated with made a substantial difference. No change to a C# loop could remove the round trip between those locations.

The recording uses a latency table to make this difference in scale visible. Imagine stretching a very short cache access into something you can perceive, then scaling the slower operations by the same factor. Main memory, storage and a long network journey occupy very different amounts of that imaginary time. The exact figures depend on the hardware and workload. The useful idea is to measure which journey your program is actually waiting for.

Once the larger costs are under control, the work inside the processor becomes worth examining.

## Several instructions can be in progress

Think of an instruction passing through stages: it must be obtained, decoded, supplied with its operands and executed. A pipeline overlaps those stages for different instructions. While one instruction executes, another can be decoded and another fetched.

A modern processor can also have multiple execution resources. That allows some instructions to progress alongside others, provided their dependencies and the available resources permit it. A clock frequency alone therefore does not tell us how much useful work a program gets done.

The recording illustrates this with a 3.3 GHz processor and an assumed four instructions per cycle. Multiplying those gives 13.2 billion instructions per second per core in that illustration. It is a capacity example. A dependency chain, a cache miss, or an instruction requiring a particular execution unit can prevent a real program from approaching it.

What happens when the processor reaches an `if` statement and does not yet know which path it will take? Waiting at every branch would leave useful execution capacity idle. Branch prediction lets the processor make a prediction and begin work along that path. If the prediction is wrong, work performed speculatively along the wrong path must be discarded.

Suppose we process customers and do extra work for customers in Virginia. With a mixed sequence, the outcomes might be less predictable than with customers grouped by state. That makes the access order worth investigating. It does not make sorting a free optimization: sorting costs time, changes order, and might not be permitted by the operation. Measure the whole change that the application would have to make.

## Keep the processor supplied

Main memory is large, but accessing it is expensive compared with accessing a nearby CPU cache. Caches retain data and instructions that the processor may need again. Smaller, closer caches favor low latency; larger caches retain more of the working set.

[![Four processor cores with separate instruction and data L1 caches, one L2 per core, a shared L3, and DRAM above them.](/images/diagrams/dotnet-memory-part2-cache-hierarchy.svg)](/images/diagrams/dotnet-memory-part2-cache-hierarchy.svg)

*Recreated from the recording's four-core diagram. The labels, capacities and grouping belong to that historical illustration; they are not a specification for every processor.*

Each core in this drawing has its own instruction cache and L1 data cache, followed by a private L2. The four cores share the L3. Main memory sits beyond that hierarchy. This is a useful picture of the different places a request for data might be satisfied.

It is important to keep that picture attached to the processor being discussed. Cache sizes, sharing arrangements and inclusion policies vary. Data in a smaller cache is not universally guaranteed to have a duplicate in every larger cache. Intel's [description of its Xeon Scalable cache hierarchy](https://www.intel.com/content/www/us/en/developer/articles/technical/xeon-processor-scalable-family-technical-overview.html), for example, explicitly describes a non-inclusive last-level cache.

Distance helps the analogy, but it is only part of the explanation for latency. Cache organization, access circuitry, contention and the path taken to satisfy a request all contribute. NUMA, where memory access characteristics depend on the processor and memory location, is a further system-level concern; it is not simply another name for this L1/L2/L3 hierarchy.

## A cache line brings neighboring data

Imagine going to a store for one item and bringing back the neighboring items you are likely to need next. That is the useful part of the cache-line analogy. A cache deals with chunks of adjacent memory, commonly 64 bytes on the processors discussed here.

If the next value you need is in that same line, obtaining the line has already brought it close. If the next value is somewhere else, the program may need another line. A load can still request a smaller value, such as a byte or integer; the cache-line size describes the surrounding transfer and coherence granularity.

This is one reason contiguous data is interesting. An array of integers stores its elements inline. An array of references keeps the references contiguous, while the objects they refer to can be elsewhere. Walking those objects can involve additional memory accesses that simply walking the reference array does not reveal.

Hardware prefetchers can recognize some access patterns and request data ahead of its use. A regular forward walk gives them a different problem from repeatedly following unrelated references. That does not guarantee that an array wins every comparison, but it gives us a reason to test a more compact representation.

## The order of a loop changes the access pattern

Consider a rectangular C# array:

```csharp
int[,] values = new int[rows, columns];

long sum = 0;
for (int row = 0; row < rows; row++)
{
    for (int column = 0; column < columns; column++)
    {
        sum += values[row, column];
    }
}
```

The rightmost index varies fastest in the storage of a rectangular .NET array. This loop follows that order. Reversing the loops visits the same elements, but successive accesses jump between rows.

[![A three by four array visited in storage order compared with a column-first traversal that jumps between rows.](/images/diagrams/dotnet-memory-part2-traversal.svg)](/images/diagrams/dotnet-memory-part2-traversal.svg)

*An explanatory example using C# rectangular-array storage. Both traversals visit the same twelve values; the sequence of addresses differs.*

As the matrix grows, the working set and the distance between accesses change. The recording shows a row-versus-column timing comparison to illustrate that effect. The direction that benefits depends on the actual storage layout: row-first traversal is not a universal rule for every matrix library or language.

A bend in a timing graph is a clue to investigate. It does not, on its own, prove that the program just exceeded a particular cache. Counters, controlled changes in data size and an understanding of the generated code give us stronger evidence.

## Bring the fields you use together

Suppose a customer object contains hundreds of fields, while a frequently executed calculation uses five. Fetching and following a large collection of those objects may involve much more data than the calculation needs.

One possibility is to prepare a compact representation containing the five relevant values and process that. The smaller working set may fit better in cache, and the values needed together can be stored together. But building the representation has a cost. For a single pass, copying may outweigh the saving. For repeated work over the same data, the balance may change.

The question is concrete: how many useful values do we get from the memory we bring into the processor, and how often will we reuse them? Start with that question rather than assuming that changing a class to a struct will make an application fast.

## Separate variables can still interfere

There is another consequence of cache lines. Two threads can update different variables that happen to occupy the same line. The threads do not share a variable, but the hardware must coordinate ownership of the line containing both variables. Repeated writes can make that line move between cores. This is false sharing.

An appropriate layout can separate frequently written data used by different threads. The benefit depends on the actual layout and workload, so padding every field would be a poor response. Padding also increases the working set. Intel's [optimization manual](https://www.intel.com/content/dam/doc/manual/64-ia-32-architectures-optimization-manual.pdf) discusses false sharing and the relevant cache-line behavior.

Cache coherence is also separate from the synchronization contract of your program. It does not make a compound operation atomic or remove the need for the appropriate .NET synchronization primitives.

## Turn the explanation into a test

The purpose of understanding the hardware is to give yourself better hypotheses. Perhaps a compact representation will reduce the working set. Perhaps repeated walks can become one pass. Perhaps a branch or a shared cache line explains a hot path.

Keep a correct baseline, change one thing, and measure the result under the conditions that matter to the application. Include any sorting, copying or preparation that the real operation must pay for. You can then explain both what improved and what you spent to obtain that improvement.

Original recording: [.NET Memory Allocations and Performance, Part 2](https://www.youtube.com/watch?v=Ge0tyJqdhxY).
