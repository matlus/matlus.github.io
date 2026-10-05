---
title: "To LINQ or Not to LINQ"
description: "Repeated work can hide inside a short LINQ query. A customer-filtering benchmark separates string conversions, lookup choices, iteration and changed behavior."
datePublished: 2021-03-28
dateModified: 2021-03-28
tags: ["linq", "hash-sets", "lambdas", "benchmarking", "memory-allocation", "csharp"]
hero: to-linq-or-not-to-linq
youtube: "https://www.youtube.com/watch?v=D1m-RIWFrhM"
repositories:
  - label: "VariousBenchmarks"
    url: "https://github.com/matlus/VariousBenchmarks"
    context: "LinqWhereBenchmarks and the original LinqWhere results sheet."
draft: false
---

I like LINQ as a language feature. I am less happy with how easy it makes it to write a small expression that does much more work than it appears to do.

This example came from a code review. We had a query that was doing unnecessary work, so I asked the team to suggest alternatives. I put the versions into a benchmark, and the results gave us quite a bit to discuss.

The point was to make a sensible decision for that piece of production code. If a method runs occasionally, a difference measured in nanoseconds may have no practical effect. If it runs tens of thousands of times a second, repeated allocations and lookup work become more interesting. In either case, we should be able to see obvious waste and remove it without making the code difficult to understand.

## Keep the required result in view

We have six customers, with first names `aaa`, `bbb`, `ccc`, `ooo`, `ppp` and `qqq`. Three sets contain names obtained from elsewhere:

| Set | Names |
|---|---|
| Verified | `AAA`, `DDD`, `EEE` |
| Certified | `BBB`, `GGG`, `HHH`, `III`, `LLL`, `MMM`, `NNN` |
| A-list | `CCC`, `JJJ`, `KKK` |

Return the customers whose first names occur in any of the three sets, ignoring case. With this fixture, the result is the original `aaa`, `bbb` and `ccc` customer objects, in that order. The source collections should retain their contents.

The baseline is easy to read:

```csharp
return _customers
    .Where(c =>
        _verifiedCustomerNames.Contains(c.FirstName.ToUpper())
        || _certifiedCustomerNames.Contains(c.FirstName.ToUpper())
        || _aListCustomerNames.Contains(c.FirstName.ToUpper()))
    .ToList();
```

`ToList` executes the query and materializes the result. Without it, timing the creation of a deferred query would leave out the work we intend to compare. [The earlier LINQ article](/writing/csharp-linq-execution/) explains that execution distinction in more detail.

Look at the repeated `ToUpper` calls. Because `||` short-circuits, every customer does not necessarily reach all three. But a customer absent from all sets reaches all three conversions. What do we gain by converting the same name repeatedly during one predicate invocation?

## A local variable is enough

A lambda can have a statement body. That lets us calculate the uppercase name once and reuse it:

```csharp
return _customers
    .Where(c =>
    {
        var firstNameUppered = c.FirstName.ToUpper();
        return _verifiedCustomerNames.Contains(firstNameUppered)
            || _certifiedCustomerNames.Contains(firstNameUppered)
            || _aListCustomerNames.Contains(firstNameUppered);
    })
    .ToList();
```

The explicit `return` belongs to the lambda's statement body. The query still returns the same customers; the change removes repeated conversion within that body. This was my first suggestion during the review, and it was the version I was happy to use for that production scenario.

[![The six source customer names produce fifteen uppercase conversions in the short-circuit baseline and six when each name is converted once.](/images/diagrams/linq-repeated-conversions.svg)](/images/diagrams/linq-repeated-conversions.svg)

*For this fixture, the first three customers require one, two and three baseline conversions. Each unmatched customer requires three. The local-variable version performs one conversion per customer.*

Query syntax offers another way to express the reuse:

```csharp
return (from customer in _customers
        let firstNameUppered = customer.FirstName.ToUpper()
        where _verifiedCustomerNames.Contains(firstNameUppered)
           || _certifiedCustomerNames.Contains(firstNameUppered)
           || _aListCustomerNames.Contains(firstNameUppered)
        select customer).ToList();
```

Both versions perform the conversion once per customer, but they do not necessarily generate the same iterator and projection machinery. The `let` expression carries an intermediate value through the query. Similar-looking source code is a reason to compare implementations, not a guarantee of equal costs.

These examples preserve the historical `ToUpper()` behavior, which uses the current culture. The ASCII fixture is deliberately small. A production requirement for arbitrary names needs a deliberate choice of culture and comparison semantics.

## Which Contains did we call?

Another suggestion was to use `StringComparer.OrdinalIgnoreCase`:

```csharp
_verifiedCustomerNames.Contains(
    c.FirstName, StringComparer.OrdinalIgnoreCase)
```

This looks like a small variation on a hash-set lookup, but it calls a different API. `HashSet<T>.Contains` takes one argument. Supplying an item and a comparer selects the LINQ `Enumerable.Contains` overload, which searches the sequence using that comparer. It does not replace the comparer used by the existing hash set's hash table.

That is a substantial confounding factor in the original comparison. Its slower result cannot be attributed simply to ordinal case-insensitive string comparison being expensive.

If ordinal case-insensitive membership is the required contract, a separate candidate is to construct the sets with that comparer:

```csharp
var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "AAA", "DDD", "EEE"
};

bool found = names.Contains("aaa");
```

Now the set's normal membership operation uses the configured equality rules. This is an additional example, not one of the historical timing rows below. It also makes a specific semantic choice; ordinal comparison is not interchangeable with every culture-sensitive comparison. Microsoft's [string-comparison guidance](https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-strings) explains why those choices belong in the contract.

## Combining the sets changes another part of the problem

One candidate calls `UnionWith` to merge the certified and A-list names into the verified set, then performs one membership lookup. It can reduce repeated lookup work, but it modifies the verified set. If callers need those categories kept separate, that is an observable change.

It also changes the benchmark's state after its first invocation. `GlobalSetup` does not restore the original sets before every measured call. A fresh merged set, or a precomputed immutable lookup reused by the application, would be a different design with its own construction cost and lifetime.

The `Concat` candidate builds an enumerable sequence inside the predicate and searches it for each customer. `Concat` leaves the original collections unchanged. Its cost comes from the repeated sequence construction and traversal represented by that code.

These are good experiments. They become useful alternatives only after we establish which preserve the required behavior.

## What the historical results show

The following figures come from the `LinqWhere` sheet in the original workbook. They describe the six-customer fixture on the original environment, rather than a new benchmark run.

| Implementation | Mean, ns | Allocated bytes |
|---|---:|---:|
| Repeated `ToUpper`, baseline | 706.4 | 680 |
| `Contains` with explicit comparer | 1,183.2 | 800 |
| Mutating merge, single `ToUpper` | 597.9 | 472 |
| `Concat` inside predicate | 2,649.2 | 1,712 |
| Query expression with `let` | 601.3 | 704 |
| Lambda body with local variable | 390.1 | 392 |
| `foreach` through `IEnumerable<Customer>` | 430.6 | 320 |
| `for` over the array | 341.1 | 280 |
| `foreach` without conversion, wrong result | 213.1 | 72 |
| `for` without conversion, wrong result | 131.5 | 32 |

The local-variable version made a meaningful improvement in this experiment while remaining easy to read. The `for` loop was faster again, with fewer allocated bytes. We did not need that last increment for the production decision being made.

The last two rows intentionally remove the uppercase conversion without otherwise fixing case-insensitive matching. They return no customers from this fixture. I included them to investigate the cost associated with conversion and the resulting work. They cannot be selected as faster implementations of the required operation, and subtracting their means does not perfectly isolate conversion because their results and list growth differ too.

## The collection type is part of the comparison

The loop candidates need another detail. In the sample code, `_customers` is an array. `_customersEnumerable` refers to a separate `List<Customer>` containing the same customer objects. The comparison changes both the collection implementation and the type through which it is accessed.

An array-based `foreach` can be lowered differently from enumeration through an interface. LINQ also has specialized implementations for some source types. That helps explain why the syntax alone is insufficient to rank the candidates.

Delegates, interface dispatch and enumerators can contribute overhead. Those mechanisms are worth understanding, but a universal ranking of direct calls, virtual calls, delegates and interface calls would overstate the evidence. JIT optimizations, cached delegates, inlining and the actual source type affect a particular case. Likewise, `foreach` does not universally allocate.

## Be conscious of the waste

Temporary strings contribute allocation pressure even when each individual allocation is inexpensive. Their lifetime and the rest of the workload influence when garbage collection runs and how much work it has to do. Fewer unnecessary temporary objects can help; an allocation count alone does not predict the full application's latency.

I do not want to leave an obvious repeated conversion in a query merely because someone might call changing it premature optimization. The local-variable version is simple, preserves this example's behavior and makes the intent clearer. That is enough reason to consider it. The benchmark then tells us what difference it made.

Keep the desired result, collection mutations and comparison rules in view. Once those are the same, the timing has a useful meaning.
