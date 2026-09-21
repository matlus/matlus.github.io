---
title: LINQ and Query Semantics
description: >-
  A query does not run when you write it, and calling it twice may not give the same answer. Deferred execution, materialization, terminal operators, and untranslatable queries.
datePublished: 2017-09-20
dateModified: 2026-09-04
tags:
  - csharp
  - data-access
  - method-design
section: pwi
topic: linq-query-semantics
language: csharp
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Don't make me wonder"
- "Fail fast and fail visibly"

---

## Intent

LINQ is everyday C#, not a specialized topic - every layer of this corpus's code touches `Where`, `Select`, `Single`, or `ToList` somewhere. That everyday-ness is exactly why it earns its own chapter: a query built with LINQ behaves differently from an ordinary method call in ways that are easy to get wrong and expensive to get wrong quietly. A query does not run when you write it. Calling it twice does not necessarily give you the same answer twice. The wrong terminal operator turns a data-integrity bug into a one-line throw with no information in it, or worse, into a silently wrong answer. And the query provider translating your query into something else - SQL, most often - can only translate what it understands, which is a narrower set of C# than you have available everywhere else.

This chapter owns the LINQ call site: deferred execution, materialization, the choice of terminal operator, and what happens when a provider cannot translate what you asked it to. Two chapters describe adjacent territory from a different angle and are worth naming up front so the boundary is clear before it comes up again in the sections below:

- Method Design (`cs04`) owns a method's declared cardinality *contract* - that a query promises exactly one result, or first-of-many - and every non-LINQ way of enforcing that contract. This chapter owns the concrete LINQ operator that enforces it once the contract is LINQ-shaped.
- Validation and Exception Handling (`cs09`) owns exception message and diagnostic-context quality in general. This chapter owns the specific, recurring case where a LINQ terminal operator is the offender.

When one LINQ call site could be described by both a method-design finding and a LINQ finding, this chapter is the sole owner of that occurrence - the other chapter cross-references it rather than raising a second finding for the same line.

---

## Deferred Execution: A Query Is a Description

A LINQ query built from `Where`, `Select`, `OrderBy`, and their relatives is not a result. It is a description of a result - an expression that says how to produce a sequence, still unevaluated. Nothing runs until something enumerates the sequence: a `foreach`, a call to `ToList()` or `Count()`, or any other operator that has to look at every element to answer its question.

This matters because the same query variable can produce different answers on different enumerations, and because every enumeration re-runs the whole description from the top - the filtering, the projection, and, if the source is a database, the round trip.

```csharp
// BAD - the query is enumerated twice, and each enumeration re-runs it
public OrderLineSummary SummarizeBackorderedLines(int orderId)
{
    var backorderedLines = _orderLines
        .Where(line => line.OrderId == orderId && line.Status == LineStatus.Backordered);

    var backorderedCount = backorderedLines.Count();          // enumeration 1
    var backorderedSkus = backorderedLines.Select(line => line.Sku).ToList(); // enumeration 2

    return new OrderLineSummary(backorderedCount, backorderedSkus);
}
```

If `_orderLines` is an Entity Framework `DbSet<OrderLine>`, this method makes two round trips to the database for what looks like one query. If the backing source is anything that can change between the two enumerations - a collection another thread is writing to, a generator with a side effect in its selector - the count and the SKU list can disagree, because they were never computed from the same snapshot of data.

```csharp
// GOOD - one enumeration, one snapshot
public OrderLineSummary SummarizeBackorderedLines(int orderId)
{
    List<OrderLine> backorderedLines = _orderLines
        .Where(line => line.OrderId == orderId && line.Status == LineStatus.Backordered)
        .ToList();

    return new OrderLineSummary(
        backorderedLines.Count,
        backorderedLines.Select(line => line.Sku).ToList());
}
```

The fix is not "avoid deferred execution" - deferred execution is the whole point of LINQ's composability, letting you build a query out of pieces before deciding to run it. The fix is to notice when a description is about to be enumerated more than once, and materialize it once, deliberately, before that happens. That deliberate step is the subject of the next section.

---

## Materialization: Naming the Moment It Becomes Real

`ToList()` and `ToArray()` are the terminal operators that turn a deferred description into a concrete, already-executed collection sitting in memory. Once you have called one, you are no longer looking at a query - you are looking at a snapshot, and every LINQ operator you chain onto it afterward runs against that in-memory snapshot, not against the original source.

Materializing has a real, ongoing cost: memory for the whole collection, and in the database case, a fully executed round trip whether or not you end up using every row. A materializing call belongs on the line only when there is a reason a reviewer can see, not by default and not "to be safe."

```csharp
// BAD - defensive materialization with no stated reason
public IReadOnlyList<string> GetActiveSkus(int catalogId)
{
    var activeProducts = _products
        .Where(product => product.CatalogId == catalogId && product.IsActive)
        .ToList();                       // why? nothing here needs a snapshot

    return activeProducts.Select(product => product.Sku).ToList();
}
```

```csharp
// GOOD - one deferred pipeline, materialized once, at the end, because the
// return type promises a concrete list
public IReadOnlyList<string> GetActiveSkus(int catalogId)
{
    return _products
        .Where(product => product.CatalogId == catalogId && product.IsActive)
        .Select(product => product.Sku)
        .ToList();
}
```

Reasons that justify a materializing call mid-pipeline: the sequence is genuinely enumerated more than once (the case in the previous section); the source is a `DbContext` or another `using`-scoped resource that will be disposed before the caller gets around to enumerating a still-deferred query; or the code is about to mutate the collection the query was built from, and needs a snapshot taken before the mutation, not a live view of it.

Once you have materialized on purpose, say so with the type. A field or variable that holds a `List<T>` you deliberately snapshotted should be typed and named as the snapshot it is - `List<OrderLine>` or `IReadOnlyList<OrderLine>` - not left declared as `IEnumerable<T>` as if it were still a live, re-runnable query. That declared-type honesty is Type Contracts' (`cs07`) territory in general; the point here is narrower: the materializing call itself is the moment the decision was made, and the declared type from that point on should not pretend the decision wasn't made.

---

## Cardinality: What the Operator Promises

A query built with a criteria clause carries an expected cardinality - exactly one result, or first-of-possibly-several - and that expectation is part of the query's contract, whether the query is written as LINQ or as a hand-read `SqlDataReader` loop. Method Design's Cardinality Is Intent section (`cs04`) owns that contract in general, with a non-LINQ worked example. This section owns the concrete LINQ operator that enforces the contract once it's a LINQ call: `Single` promises exactly one match and raises on zero or on more than one; `First` promises "the first match, and more than one is expected and fine."

Choosing the operator that doesn't match the real cardinality hides a bug instead of catching it:

```csharp
// BAD - First silently accepts duplicate SKUs on an order that should
// never have more than one line for the same SKU
OrderLine matchedLine = orderLines.First(line => line.Sku == requestedSku);
```

If the business rule is "an order has at most one line per SKU," a second, unexpected line for that SKU is exactly the kind of data problem `Single` exists to catch. `First` will not catch it - it will just return the first one it happens to encounter and let the duplicate sit there unnoticed.

```csharp
// GOOD - SingleElseException enforces exactly one and owns both failure modes
OrderLine matchedLine = orderLines.SingleElseException(
    line => line.Sku == requestedSku,
    matchedLines => new OrderLineNotFoundException(
        $"Order '{orderReference}' has {matchedLines.Count} lines for SKU '{requestedSku}'; exactly one was expected.",
        OrderLogEvent.PlaceOrder));
```

`First` is the right choice only when the requirement genuinely is first-of-many - a price history ordered most-recent-first, where any matching entry after the first is expected and irrelevant to the query's purpose:

```csharp
// GOOD - First is correct here: multiple price changes are expected,
// and only the most recent one matters
PriceChange currentPrice = priceHistory
    .OrderByDescending(change => change.EffectiveDate)
    .FirstElseException(
        change => change.Sku == requestedSku,
        () => new PriceChangeNotFoundException(
            $"No price change exists for SKU '{requestedSku}'."));
```

### Prefer Single and First Over Their OrDefault Cousins

`SingleOrDefault` and `FirstOrDefault` do not fail when nothing matches - they hand back `null` (or `default` for a value type) and let the caller find out later, usually as a `NullReferenceException` several lines away from the query that actually had the missing data. That is a "don't make me wonder" violation dressed up as safety: the absence was real information at the point of the query, and the `OrDefault` form throws that information away in favor of a value that looks fine until something downstream dereferences it.

```csharp
// BAD - absence is discarded here and rediscovered later as a crash
OrderLine? matchedLine = orderLines.SingleOrDefault(line => line.Sku == requestedSku);
ProcessLine(matchedLine.Quantity);   // NullReferenceException, far from the real cause
```

Reach for `SingleElseException` or `FirstElseException` so the failure surfaces at the point of truth - the query itself - in project language with the criteria that failed. Do not recommend a bare `Single` or `First`: matching the intended cardinality is only half of the contract when the framework still composes a context-free failure. If absence really is a valid, handled outcome for this call site, use the `OrDefault` form and branch on the result explicitly rather than letting a `null` propagate on the hope that nothing downstream forgets to check it:

```csharp
// GOOD - absence is a real, handled branch, not an implicit null propagation
OrderLine? matchedLine = orderLines.SingleOrDefault(line => line.Sku == requestedSku);
if (matchedLine is null)
{
    return LineAvailability.NotOnOrder;
}
```

### Context-Free Cardinality Exceptions: Take Over the Throw

Framework and BCL exceptions routinely fail every message-quality expectation this corpus holds, and LINQ's terminal operators are the canonical offenders. `Single()` failing with "Sequence contains more than one element" names no sequence, no predicate, no value - it is the moral equivalent of "index out of bounds." Do not make the reviewer guess whether failure is likely enough to deserve context. Every project-owned `Single` or `First` family call owns its throw with an `<Operator>ElseException` extension method or a semantically equivalent explicit cardinality guard. The exception factory supplies project/domain meaning and, for `Single`, receives the matched items so one delegate distinguishes "none" from "many" and can name the offenders:

```csharp
internal static class EnumerableExtensions
{
    public static T SingleElseException<T>(
        this IEnumerable<T> sequence,
        Func<T, bool> predicate,
        Func<IReadOnlyList<T>, Exception> exceptionFactory)
    {
        var matchedItems = sequence.Where(predicate).ToList();
        return matchedItems.Count == 1 ? matchedItems[0] : throw exceptionFactory(matchedItems);
    }

    public static T FirstElseException<T>(
        this IEnumerable<T> sequence,
        Func<T, bool> predicate,
        Func<Exception> exceptionFactory)
    {
        var matchedItems = sequence.Where(predicate).ToList();
        return matchedItems.Count > 0 ? matchedItems[0] : throw exceptionFactory();
    }
}
```

```csharp
OrderLine matchedLine = orderLines.SingleElseException(
    line => line.Sku == requestedSku,
    matchedLines => new OrderLineNotFoundException(
        $"Order '{orderReference}' has {matchedLines.Count} lines for SKU '{requestedSku}'; exactly one was expected.",
        OrderLogEvent.PlaceOrder));
```

`FirstElseException` has only one failure mode - nothing matched - so its factory takes no argument. The rule generalizes beyond LINQ: any framework exception whose message cannot name the offending value is a message-quality violation committed on your behalf. Own the throw site.

This is also the chapter's first worked example of the one sanctioned shape of extension method, taken up in full below: `SingleElseException` and `FirstElseException` are genuinely useful to any C# programmer working with `IEnumerable<T>`, carry no team- or project-specific policy, and exist because LINQ already put you in extension-method territory the moment you wrote `.Where(...)`.

---

## Provider Translation: IEnumerable Versus IQueryable

Everything above holds for `IEnumerable<T>` sequences running entirely in process - LINQ to Objects, evaluating one element at a time through compiled delegates. `IQueryable<T>` looks like the same fluent surface but works differently underneath: each operator you chain builds an expression tree, and nothing is compiled to running code until a provider - Entity Framework, most commonly - reads that tree and translates it into another query language, typically SQL, at the moment of enumeration.

That translation step is the source of a failure mode `IEnumerable<T>` does not have: the provider can only translate expressions it understands. A predicate built entirely from property comparisons and simple operators translates cleanly. A predicate that calls an arbitrary C# method - a local method, a compiled business rule, anything the provider has no SQL equivalent for - does not.

```csharp
// BAD - IsRushEligible is ordinary C#, not something the provider can turn
// into SQL; this throws at the point of enumeration, or on an older
// provider silently pulls the entire orders table into memory first
IQueryable<Order> rushOrders = _dbContext.Orders
    .Where(order => IsRushEligible(order));
```

Depending on the provider and its version, an untranslatable expression either throws a clear exception naming the clause it could not translate, or
- in older provider behavior, and in any hand-rolled `IQueryProvider` that was not built to guard against it - falls back to evaluating the untranslatable part in memory, after pulling every row from the source first. The throw is the safer failure: loud, and traceable straight back to the offending line. The silent fallback is the dangerous one, because the code keeps working in a development database with a hundred rows and stops scaling the moment it meets a production table.

```csharp
// GOOD - the predicate is expressed in terms the provider can translate;
// the C# business rule runs after materialization, over an in-memory list
List<Order> candidateOrders = _dbContext.Orders
    .Where(order => order.Status == OrderStatus.Placed && order.ShippingMethod == ShippingMethod.Express)
    .ToList();

List<Order> rushOrders = candidateOrders
    .Where(order => IsRushEligible(order))
    .ToList();
```

The second query's `ToList()` is exactly the justified materialization from the earlier section: the provider-translatable filtering happens first, server-side, narrowing the set before it comes into memory; the provider-opaque business rule runs afterward, in process, against a deliberately snapshotted list. Reaching for a broader `IEnumerable<T>` or `IList<T>` parameter to make a downstream method accept either an `IQueryable<T>` still-deferred source or an already-materialized list is a Type Contracts (`cs07`) question about what the signature honestly promises its caller; this chapter's concern is narrower and sits one level below that - whether the specific expression you handed the provider can actually run where you asked it to run. Provider translation failures outside LINQ - an external service's query language, a message broker's filter syntax - are Gateway Design's (`cs14`) territory; this chapter owns the LINQ-to-provider case specifically.

---

## Extension Methods: The One Sanctioned Shape

The Framework Design Guidelines put this bluntly: if the class is yours, don't extend it; if the class is not yours, don't extend it. Net-net, don't use extension methods. The ban is symmetric, and ownership never softens it. Extending a class the team does not own plants a private dialect on a public type. Extending a class the team does own is simply pointless: the implementation is already in the team's hands, so a capability the class needs becomes an ordinary method on the class itself. There is no situation where "our class, but extended from the outside" beats just adding the method. This corpus follows that guidance directly, and this chapter is where the reasoning belongs, because the language feature exists in C# for exactly one reason: LINQ needed it. `Where`, `Select`, and `OrderBy` are extension methods on `IEnumerable<T>` and `IQueryable<T>`; without the feature, LINQ's fluent syntax would not exist in the form this chapter has been using throughout.

That LINQ needed the feature is not a permission slip for anything else. Beyond the guideline itself, three practical failures each independently wipe out whatever convenience the dot syntax was supposed to buy.

First, extension methods break the expectations of everyone who already knows the type. An experienced C# developer knows the framework types cold: which methods they carry, what parameters those methods expect, what they return. A team that extends those types plants methods that developer does not know exist, is not looking for, and does not know how to use; every one of them raises the questions "does this method exist? what does it do? when should I use it?" on a type that was supposed to hold no surprises. The same failure hits code-generating models: they are trained on the framework's real surface, not on any team's private additions, so they neither reach for those methods when writing code nor recognize them when reading it.

Second, nothing stops two extension methods with the same name, on the same receiver type, from living in different namespaces with different implementations. Which one runs is decided by the using directives at the top of the file, so a routine namespace or using-directive change silently swaps in a wildly different implementation while every call site still reads exactly the same. A team can lose days to that failure precisely because nothing at the call site changed. It adds no value and produces exactly the head-scratching moments a codebase exists to avoid.

Third, discoverability is missing in both directions. Without the right using directive, the dot shows nothing, so a developer who does not already know the namespace cannot find the method in the IDE at all; and a reader who meets the method in existing code cannot tell it from a framework method they have simply never seen. A method that only works because somebody remembers a namespace is not a designed API; it is a trap with the compiler's blessing.

The one sanctioned exception is narrow: an extension method that is genuinely useful to the *entire* C# community - any C# programmer, on any project, with no team-specific or enterprise-specific knowledge riding along - may earn the shape. `SingleElseException` and `FirstElseException`, above, clear that bar: any developer working with `IEnumerable<T>` can use them, and they carry nothing but a delegate the caller supplies. So does `DisposeIfNotNullAsync`, covered fully in Async Resource Lifecycle (`cs11`): a null-safe dispose for any `IAsyncDisposable?`, with nothing project-shaped in it.

Code that encodes team or project policy fails the community bar even when it is shaped exactly like an extension-method candidate - every method takes the same receiver type as its first parameter, and it would compile equally well with `this` in front of that parameter. The reference implementation's `SqlParameterAdder` is the worked example: every method's first parameter is a `SqlCommand`.

```csharp
// GOOD - a plain internal static class, not an extension method, because
// the sizes, precision, and null-handling here are the reference implementation's own schema
// knowledge, not something the whole C# community should find on SqlCommand
internal static class SqlParameterAdder
{
    public static void AddText(SqlCommand command, string parameterName, string? parameterValue, int size)
    {
        command.Parameters.Add(parameterName, SqlDbType.NVarChar, size).Value = (object?)parameterValue ?? DBNull.Value;
    }

    public static void AddUnboundedText(SqlCommand command, string parameterName, string parameterValue)
    {
        // -1 is SqlClient's spelling of NVARCHAR(MAX).
        command.Parameters.Add(parameterName, SqlDbType.NVarChar, -1).Value = parameterValue;
    }

    public static void AddUtcTimestamp(SqlCommand command, string parameterName, DateTime? parameterValue)
    {
        var timestampParameter = command.Parameters.Add(parameterName, SqlDbType.DateTime2);
        timestampParameter.Scale = 3;
        timestampParameter.Value = (object?)parameterValue ?? DBNull.Value;
    }

    public static void AddBoolean(SqlCommand command, string parameterName, bool parameterValue)
    {
        command.Parameters.Add(parameterName, SqlDbType.Bit).Value = parameterValue;
    }
}
```

`AddText` and `AddUtcTimestamp` exist because `AddWithValue` is banned on this project: it lets the driver infer the parameter's type instead of stating it, and a `DateTime` passed that way lands as the legacy millisecond-imprecise `DATETIME` instead of the store's `DATETIME2(3)` columns, while per-value string sizing fragments the query plan cache with one plan per distinct length. Those are real facts about SQL Server type inference and the reference implementation's own column widths - not something every C# programmer touching a `SqlCommand` needs or wants. Writing these as `this SqlCommand` extension methods would put schema-specific parameter sizing on every `SqlCommand` in every project that happened to import the namespace, which is precisely the "private dialect on a public type" failure mode this section opened with.

```csharp
// BAD - shaped as an extension method; the receiver type gains parameter
// sizing and precision policy that belongs to the reference implementation's schema, not to
// every SqlCommand a C# developer will ever hold
internal static class SqlCommandExtensions
{
    public static void AddText(this SqlCommand command, string parameterName, string? parameterValue, int size)
    {
        command.Parameters.Add(parameterName, SqlDbType.NVarChar, size).Value = (object?)parameterValue ?? DBNull.Value;
    }
}
```

The test at every call site is never "would the dot be convenient here." It is "does the entire C# community need this, with nothing of ours riding along for the ride." `SqlParameterAdder` fails that test and stays a plain static class, called explicitly with its receiver as an ordinary first argument. `SingleElseException` passes it, because LINQ already established the pattern and the method adds nothing but a generic, project-agnostic delegate contract on top.

---

## Boundaries With Other Chapters

Several ideas that touch LINQ code are owned by name elsewhere in this corpus rather than repeated here:

- **A query's declared cardinality contract**, including its non-LINQ enforcement forms such as a manually-read `SqlDataReader` - belongs to Method Design's Cardinality Is Intent section (`cs04`). This chapter owns the LINQ operator that enforces the contract once the call is LINQ-shaped.
- **What a parameter or return type honestly promises** - `IEnumerable<T>` versus `IList<T>`, and whether a materialized snapshot should be typed as one - belongs to Type Contracts (`cs07`). This chapter's provider- translation concern is narrower: whether a specific expression can run where it was asked to, independent of how the surrounding signature is typed.
- **General exception message and diagnostic-context quality** belongs to Validation and Exception Handling (`cs09`). This chapter owns the specific, recurring case of a LINQ terminal operator's context-free framework exception.
- **Null-safe disposal**, including `DisposeIfNotNullAsync`, belongs to Async Resource Lifecycle (`cs11`). It is cited here only as a second example of the community-bar test for extension methods.
- **Provider translation and response safety for external services** belongs to Gateway Design (`cs14`). This chapter owns the LINQ-to-query-provider case specifically.
- **Allocation awareness and general C# style** belong to the native style guidance (`cs26`/`cs27`).

---

## Review Questions

- Is a deferred query enumerated more than once, and if so, was that intentional or an accident of how the variable was reused?
- Does every `ToList()`/`ToArray()` call have a reason a reviewer can find - proven repeated enumeration, an about-to-close scope, or a needed snapshot before mutation - rather than being there defensively?
- Does a criteria query's chosen operator (`Single` versus `First`) match the cardinality the business rule actually promises?
- Is `SingleOrDefault`/`FirstOrDefault` used only where absence is a real, explicitly handled outcome, rather than as a way to defer a failure to wherever the `null` eventually gets dereferenced?
- Does a LINQ cardinality failure on a plausible failure path carry the criteria that produced it, instead of a bare framework message that names no sequence, predicate, or value?
- Does a query built against `IQueryable<T>` stay within what the provider can translate, and if a business rule can't be translated, is it applied deliberately after a materializing call rather than causing a throw or a silent full-table pull?
- Is an extension method's receiver type genuinely improved for the entire C# community, with nothing team- or project-specific riding along - or should this be a plain static method instead?

---

## Code Review Checklist

When reviewing LINQ and query code, verify:

### Deferred Execution and Materialization
- [ ] A deferred query is not enumerated more than once without a stated reason
- [ ] `ToList()`/`ToArray()` calls are justified - repeated enumeration, a closing scope, or a required snapshot - not defensive
- [ ] A deliberately materialized collection is typed and named to reflect that decision, not left looking like a still-deferred query

### Cardinality
- [ ] The chosen operator (`Single` versus `First`) matches the source's proven cardinality
- [ ] `SingleOrDefault`/`FirstOrDefault` is used only where absence is a real, explicitly handled branch
- [ ] A cardinality failure on a plausible failure path is taken over with a criteria-carrying exception, not left as a bare framework message

### Provider Translation
- [ ] Predicates and projections against `IQueryable<T>` stay within what the provider can translate
- [ ] A provider-opaque business rule is applied after a deliberate, justified materialization, not left to throw or silently pull an entire table into memory

### Extension Methods
- [ ] No extension method exists on any type, whether the team owns the type or not; ownership never relaxes the ban
- [ ] Any extension method present clears the whole-C#-community bar and carries no team- or project-specific policy
- [ ] A capability needed on a type the team owns is an ordinary method on that type, never an extension
- [ ] Policy-carrying, receiver-shaped code is a plain static method, called explicitly, not disguised as a member of the receiver type
