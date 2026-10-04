---
title: "Custom Data Structure: A One-to-Many Mapping"
description: "A one-to-many map must enforce unique values and return a key from a value. Shared tests and four implementations show how correctness shapes a benchmark."
datePublished: 2020-05-17
dateModified: 2020-05-17
tags: ["one-to-many-mapping", "testing", "benchmarking", "csharp"]
hero: csharp-one-to-many-mapping
youtube: "https://www.youtube.com/watch?v=e27RquJS_Tc"
repositories:
  - label: "OneToManyMapBenchmark"
    url: "https://github.com/matlus/OneToManyMapBenchmark"
    context: "Original implementations, behavioral tests, slides and benchmark workbook."
draft: true
---

Suppose your application displays a message according to the state a customer lives in. Several states can use the same message, but a state must have exactly one assigned message. Given the state, you need to retrieve that message.

That sounds almost like a dictionary. The distinction is that we want to add a message together with several states, enforce the relationship, and later look it up in the other direction. The data structure should own those rules so every caller does not have to implement them again.

This is a useful exercise in building something from the collections .NET already provides. Start with the requirements, write tests for them, try different implementations, and then compare their performance. You can try your own version before looking at the [completed sample](https://github.com/matlus/OneToManyMapBenchmark).

## Define the relationship first

The terminology in the example calls the message the *key* and each state a *value*. A key can have many values; a value can belong to only one key. Both keys and values are unique within their respective roles.

[![Four messages map to ten values: Message 1 to Values 1–3, Message 2 to Values 4–7, Message 3 to Values 8–9, and Message 4 to Value 10.](/images/diagrams/one-to-many-mapping-values.svg)](/images/diagrams/one-to-many-mapping-values.svg)

*The groups from the source presentation. Lookup starts with a value and returns its associated message.*

Here is the original interface:

```csharp
internal interface IOneToManyMap<TKey, in TValue>
{
    void AddOneToManyMapping(TKey key, TValue[] values);
    TKey this[TValue value] { get; }
}
```

If the generic declaration distracts you, begin with strings for both types. The significant feature is the indexer: it accepts a value and returns a key. This is the direction in which the application needs to use the relationship.

For example:

```csharp
map.AddOneToManyMapping("This is Message A", new[] { "VA", "MD" });
map.AddOneToManyMapping("This is Message B", new[] { "IN" });

string message = map["VA"]; // This is Message A
```

Adding a new value to an existing key is allowed. Adding a value that already has a mapping is rejected with `ValuesHasPriorMappingToKeyException`. Looking up a value with no mapping throws `ValueNotMappedToKeyException`.

There is one more requirement that is easy to miss: if an attempted addition contains a value that is already mapped, none of that addition should take effect. Imagine adding three states when the third is already assigned. We must not leave the first two inserted after reporting failure.

## A database model makes the constraints visible

The recording presents two relational models for the same requirement. The first has a `Message` table and a `StateMessage` table. `Message.Description` is unique. `StateMessage.MessageId` references the message, while its state `Acronym` is unique.

The second represents messages and states as independent entities, with an association table between them:

[![Two source database models: Message with StateMessage details, and independent Message and State tables connected by AssocMessageState.](/images/diagrams/one-to-many-mapping-models.svg)](/images/diagrams/one-to-many-mapping-models.svg)

*Recreated from the source presentation. Primary keys, foreign keys and unique constraints preserve the original relationships.*

In the association model, the `(MessageId, StateId)` pair forms the primary key. That alone would still allow one state to appear with two different messages. The separate unique constraint on `StateId` prevents it. That constraint carries a business rule, and it is the part you must not lose when translating the model into an in-memory structure.

I use an association when the entities have their own reasons to exist. A state and a message can each exist independently of this relationship. A header/detail model is more natural when the detail exists because of its parent, such as an order line belonging to an order.

The database demonstration uses the association model, a view joining its three tables, and a stored procedure that retrieves a message description from a state acronym. The in-memory versions follow the same general idea without requiring a database round trip for each lookup.

## Use the same behavioral tests for every candidate

Before looking at a timing graph, make each implementation answer the same tests. The sample uses parameterized tests to run a shared suite against all four classes.

The suite checks successful lookup, missing-value lookup, adding values to an existing key, rejecting an existing mapping, and leaving the map unchanged when an addition contains an existing value. The last check must inspect both sides of the failure: old mappings remain, and the new values attempted before the conflict remain absent.

An exception alone does not prove the operation left its state unchanged. If the assertion stops at “it threw,” a partially applied operation can pass the test.

There is also an uncovered case in the historical implementation: a repeated new value within the same incoming array. The dictionary version checks incoming values against existing state, then inserts them one at a time. An input such as `new[] { "VA", "VA" }` passes the precheck, inserts the first value, and then fails on the second. It can leave a partial addition. The other collection implementations do not all treat this case the same way either.

That is a limit of the sample's validation, not a relaxation of the uniqueness rule. A complete contract needs to decide how it handles duplicates within the incoming batch and validate that before committing the change. Nulls, equality rules and concurrent access also need explicit contracts if the structure is to support them.

## Four ways to store the relationship

The `DataTable` implementation creates two tables and a `DataRelation`. Primary keys, a unique constraint and a foreign-key constraint express much of the schema directly. Lookup finds the value row and follows its parent relation to the key row. I like how clearly this resembles the relational model, although the generality of those classes has a cost.

The list implementation uses a list of keys with IDs and a list associating values with those IDs. Finding an item requires scanning. A `List<T>` uses an array internally, but the sample stores reference-type entries, so the contiguous part is the sequence of references.

The sorted-list implementation uses three `SortedList` collections: key to ID, ID to key, and value to key ID. Searching ordered keys uses binary search. Insertions have their own cost because the ordered storage must be maintained.

The dictionary version uses the same three relationships with dictionaries. Its lookup is short:

```csharp
if (valueToKeyIdDict.TryGetValue(value, out int keyId))
{
    return idToKeyDict[keyId];
}

throw new ValueNotMappedToKeyException(
    $"The value: {value} of type: {typeof(TValue)}, " +
    $"has not been mapped to a Key of type: {typeof(TKey)}");
```

The private indexes are implementation details. The caller still sees the same operation and the same missing-value contract. That lets us compare storage choices without forcing those choices into the application's call sites.

The sample deliberately explores these compositions. A more direct value-to-key dictionary is another candidate worth considering when the required operations permit it. It still has to satisfy the key, value and addition rules; a short indexer alone is not the whole implementation.

## Read the benchmark as a batch of lookups

The benchmark builds the mappings in setup. Each measured method then loops over the generated values, retrieves each key and returns the last result. These are successful lookups: the code creates `randomizedValues`, assigns those values to keys, then looks up that same array.

This matters because the spoken description refers to some values matching and others not matching. The recovered benchmark code does not implement that mixed hit/miss workload. A missing lookup would take the exception path and measure something different.

Selected values from the original workbook are below. Times are microseconds for the whole batch, and have not been remeasured on a current runtime.

| Values looked up per batch | DataTable | SortedList | List | Dictionary |
|---:|---:|---:|---:|---:|
| 50 | 44.629 | 39.484 | 8.946 | 1.748 |
| 200 | 236.392 | 220.601 | 126.549 | 7.036 |
| 500 | 703.443 | 669.191 | 759.295 | 18.169 |
| 1,000 | 1,586.090 | 1,479.626 | 3,093.061 | 36.148 |
| 3,000 | 5,579.467 | 5,411.074 | 28,419.517 | 116.331 |

[![Historical lookup batch times for four map implementations at five recovered input sizes.](/images/diagrams/one-to-many-mapping-benchmarks.svg)](/images/diagrams/one-to-many-mapping-benchmarks.svg)

*Selected original measurements, plotted against the actual number of values. The full batch grows with the collection; these are not single-lookup timings.*

The dictionary is fastest across these cases. The linear list beats the sorted list at smaller sizes, then falls behind. Big-O notation helps us reason about growth, but does not establish which implementation is faster at a particular small size. Comparison cost and memory access matter too.

There is another important distinction: an approximately constant-time dictionary lookup does not imply a constant-time batch of `N` lookups. Nor is a batch that searches all `N` entries using linear scans merely one linear search. The graph combines the cost of each lookup with an increasing number of lookups.

I suggested cache and prefetch behavior as a possible explanation for the small-list result in the recording. The timings alone do not isolate that cause. Similarly, the close `DataTable` and sorted-list results do not prove that their internal algorithms are identical.

The original workbook contains a suspicious list timing of `11.096` at 300 values, which I also question in the recording. It is omitted from this selected comparison rather than silently corrected. The `DataTable` row additionally reports `696000 B` allocated and `164.0625` Gen 0 collections per 1,000 operations; the workbook does not label a separate input size for those final diagnostic columns. They establish a reason to investigate allocation, without treating that number as a per-lookup allocation for every size.

Try another implementation if you have an idea. First run the behavioral tests, including the failure cases. Then measure the operations and data sizes the application actually uses. A data structure earns its place by preserving the rules as well as making useful work efficient.

Original recording: [Custom Data Structure: A One To Many Mapping](https://www.youtube.com/watch?v=e27RquJS_Tc). [Source code, presentation and historical workbook](https://github.com/matlus/OneToManyMapBenchmark).
