---
title: Class Design
description: >-
  Internal by default, behavior-only classes against state-only types, the two sanctioned uses of interfaces, and closing concrete descendants.
datePublished: 2017-09-20
dateModified: 2026-09-04
tags:
  - class-design
  - csharp
  - naming
section: pwi
topic: class-design
language: csharp
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Rule of thirds"
- "Express your intent in code, not comments"

---

## Intent

C# types should make it obvious whether they represent behavior or state. There are two kinds of types, with an absolute separation between them:

- A **behavior-only class** coordinates work and holds no mutable state across invocations.
- A **state-only type** carries data and has no behavior beyond simple read-only projections of the data it already holds.

A **hybrid type** is one that does both: a `record` or DTO that also runs business workflow, or a service that also owns the domain data it operates on. Hybrids are a design violation. They are hard to reason about because the caller cannot tell whether invoking a member changes the object, and they are hard to test because behavior and data cannot be substituted independently. A simple read-only computed property on a state type is not a hybrid; a command that mutates the type's data or reaches out to collaborators is.

This separation keeps behavior deterministic, makes concurrency safer, and prevents inheritance from becoming an invisible dependency mechanism.

Every type also declares how far it is visible: `internal` by default, and `public` only where a real consumer outside its own assembly requires it. See Internal by Default, below.

This chapter preserves PWI's Service Locator architecture. A Service Locator may assemble behavior classes and their collaborators. The design question is whether the resulting objects have clear responsibilities and stable state, not whether they were created by a dependency injection container.

---

## Internal by Default

A class states its visibility the moment it is declared, and that declaration is a design decision, not an afterthought. The default for every class in this corpus is `internal`. A class becomes `public` only when a concrete consumer outside its own assembly needs it - never by default, and never "just in case."

This is the class-level expression of the same discipline the author applies at the member level: classes start their lives `internal sealed`, and widen only when there is a proven reason to. Method Design governs whether an individual member is explicitly `private`; this chapter governs whether the *type itself* is visible outside its own assembly at all.

Two reasons, and only two, widen a class past `internal`:

1. **It is the assembly's own public entry point.** The domain facade, the request and result models that cross its boundary, and the exception taxonomy those calls can throw are the surface a caller needs. Nothing else has to be public for a caller to use the domain.
2. **A different production assembly has to construct or wire it.** A host's composition root lives in a separate assembly and has to reference the Service Locator contract, the concrete locator, the logger contract, and the configuration provider in order to register them at startup. That is a genuine, permanent consumer - not a convenience, and not a test.

Test white-box access is a third, unrelated mechanism, and it must never be used to justify `public`. `InternalsVisibleTo` grants a named test assembly access to `internal` members without widening the type for every other consumer - the same shape as an internal constructor that only a test assembly is meant to call.

```csharp
// COMPLIANT - internal by default; public only at the facade
internal sealed class ManagerOrdering : IAsyncDisposable
{
    // orchestrates order placement; nothing outside this assembly
    // calls it directly
}

public sealed class DomainFacade : IAsyncDisposable
{
    // the domain's one public entry point
    public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest orderPlacementRequest)
    {
        // ...
    }
}
```

```csharp
// VIOLATION - no consumer outside the assembly needs this
public sealed class DataManagerCustomers
{
    // ...
}
```

A class that "might be useful outside the assembly someday" is not a reason to make it `public`; that is the same imagined-reuse mistake the Rule of Thirds warns against. Widen a class when a real consumer proves the need, not before.

---

## Behavior-only Classes

A behavior class takes one of two shapes in C#, and the shape follows directly from what the class needs to retain.

### Static Classes for Collaborator-less Behavior

Most behavior classes need no collaborators at all: a validator that only inspects the values it is given, a composer that only assembles a message from its arguments, a canonicalizer that only transforms a value. An instance exists to hold state; a behavior class with nothing to retain has no state for an instance to hold, so constructing one buys nothing. A behavior class with nothing to retain **must** be an `internal static class` - every member `public` or `internal static`, and the type never instantiated. This is teaching guidance today; it becomes an enforced rule at operationalization.

```csharp
// COMPLIANT - no collaborators, no instance, nothing to retain
internal static class ValidatorString
{
    public static List<string> ValidateRequiredText(string fieldName, string fieldValue)
    {
        if (string.IsNullOrWhiteSpace(fieldValue))
        {
            return [$"'{fieldName}' must contain text but was empty or whitespace"];
        }
        return [];
    }
}
```

Never name a collaborator-less behavior class, or its folder, after the category it falls into - "utility," "utilities," "helper," and "helpers" are banned words in this corpus, whether as a class name, a folder name, or a description in review commentary. Name the class by what it does instead: `ValidatorString`, `ComposerConfirmationEmail`, `SkuCanonicalizer`, `CommandFactoryOrders`. A class that resists being named by what it does is doing too many things, and the fix is to split it - never to reach for a category name that hides the question.

**Critical exclusion: transitive statelessness does not mean "make it static."** A behavior class that retains stateless collaborators, a connection string, or settings assigned once in its constructor is an instance class *by design*, not a static class that is somehow behind on a refactor. A manager holding a `readonly` gateway and a `readonly` settings provider, or a data manager holding a `readonly` connection string, must never be pushed toward `static` - the whole point of Transitive Statelessness (below) is that these classes hold references without holding mutable state, and a constructor is exactly how they receive those references. Reserve an instance class - a constructor and `readonly` fields - for a behavior class that genuinely needs to retain something across its public methods: a stateless collaborator (Transitive Statelessness, below), a disposable resource, or an immutable value read once at construction and used by every call (a connection string, for example). Giving a class a constructor and fields it never uses is the same "just in case" instinct Internal by Default and the Rule of Thirds both warn against: it invites a caller to construct an instance the class does not need, and it gives the type collaborators it never uses.

Static and instance behavior classes are reviewed identically for statelessness. A `static` class cannot smuggle in mutable state through an instance field, because it has none - but a `static` field mutated after initialization is exactly as much a violation as a mutable instance field would be. The requirement is that behavior does not change across calls; whether the class is `static` or holds `readonly` collaborators is a construction detail, not a design choice with its own set of rules.

### Instance Classes with Retained Collaborators

A behavior class may retain stateless collaborators in `readonly` fields. It must not retain request data, counters, caches, last-result fields, or collections that change as public methods run. Public methods receive the data needed for one operation and return the result of that operation.

```csharp
// COMPLIANT - stateless collaborators, no retained state
internal sealed class DocumentProcessor
{
    private readonly DocumentGatewayBase _documentGateway;
    private readonly SchemaValidatorBase _validator;

    public DocumentProcessor(
        DocumentGatewayBase documentGateway,
        SchemaValidatorBase validator)
    {
        _documentGateway = documentGateway;
        _validator = validator;
    }

    public Task<ProcessedDocument> ProcessAsync(
        Document document,
        CancellationToken cancellationToken)
    {
        var validated = _validator.Validate(document);

        return _documentGateway.ProcessAsync(validated, cancellationToken);
    }
}
```

```csharp
// VIOLATION - mutable state in a behavior class
internal sealed class DocumentProcessor
{
    private readonly Dictionary<string, Result> _cache = new();
    private int _processedCount;
    private Result? _lastResult;

    public Result Process(Document document)
    {
        _processedCount++;                      // counter
        _lastResult = Compute(document);        // last-result field
        _cache[document.Id] = _lastResult;      // accumulated collection

        return _lastResult;
    }
}
```

Every field above changes across calls. The class is non-deterministic, unsafe under concurrency, and cannot be tested without ordering the tests.

### Transitive Statelessness

`readonly` prevents reassignment of the reference; it does not prove the object behind the reference is stateless. `_cache` above is `readonly` and still mutates. A behavior class that retains collaborators is stateless only when all of the following hold:

1. Every collaborator field is `readonly`.
2. Every collaborator field is assigned exactly once, in the constructor, and never reassigned afterwards.
3. Each retained collaborator is itself a stateless service, or carries an explicit lifetime and concurrency contract.
4. No field accumulates data as public methods run.
5. The same inputs to a public method always produce the same outputs.

The number of collaborators is not the concern. One stateful collaborator is a violation; five stateless ones are not.

---

## State-only Types

[Intentional Model Design](/writing/intentional-model-design/) develops the question of whether a type's required and optional fields describe one honest data shape. Its examples include C# records and nullable fields alongside Python dataclasses and `None`. The article also connects model design to [clean library boundaries](/writing/clean-abstractions-around-libraries/).

Use `record` types or immutable sealed classes for data contracts. Prefer positional records for compact value objects, and records with `init` accessors when named properties improve clarity.

```csharp
internal sealed record OrderSummary(
    decimal Total,
    int ItemCount);
```

A `record` is not automatically immutable. Settable properties, mutable collection properties, and members that change referenced objects all make a record an unsafe state contract.

```csharp
// VIOLATION - record with a mutable surface
internal sealed record OrderSummary
{
    public decimal Total { get; set; }          // settable
    public List<OrderLine> Lines { get; set; } = new();  // mutable collection
}
```

```csharp
// COMPLIANT - immutable surface, read-only collection contract
internal sealed record OrderSummary(
    decimal Total,
    IReadOnlyList<OrderLine> Lines);
```

Expose collections through intention-revealing read-only contracts and back
them with immutable values. `IEnumerable<T>` is correct when the consumer is
promised only iteration. Use `IReadOnlyList<T>` when count, order, or indexed
access is part of the contract, and `IReadOnlyDictionary<TKey, TValue>` when
keyed lookup is part of it. Do not flag a getter-only `IEnumerable<T>` merely
because a heavier read-only collection interface could have been exposed.

An explicitly justified, documented performance-critical model may relax this immutability requirement. The justification belongs in a comment on the type itself, not left for a reviewer to guess at; an unexplained mutable field on a state type is still a violation.

### Producing a Changed Copy

Because a state type is immutable, "updating" one always means producing a new instance rather than mutating the existing one. C# gives record types a built-in mechanism for exactly this: a `with` expression produces a new instance with the named properties changed and every other property copied from the original, which is untouched.

```csharp
OrderSummary discountedSummary = orderSummary with { Total = discountedTotal };
```

Prefer a `with` expression over adding a second constructor overload or a hand-written "copy with changes" method; it is the idiomatic C# expression of the same need Python meets by constructing a new frozen instance from an existing one.

### No Business Rules in Constructors

A state-only type's constructor may accept and store values; it must not transform them according to a business rule, no matter how small the transform looks. Canonicalizing a code, normalizing a string's case, clamping a number to a valid range - these are business decisions, and a business decision belongs in the behavior class that owns the workflow, not in a data constructor that runs before any workflow exists to see it happen.

```csharp
// VIOLATION - the constructor silently applies a business rule
public sealed record OrderPlacementLineItem
{
    public OrderPlacementLineItem(string sku, int quantity)
    {
        Sku = sku.ToUpperInvariant();   // a business rule, hidden here
        Quantity = quantity;
    }

    public string Sku { get; }

    public int Quantity { get; }
}
```

```csharp
// COMPLIANT - the model holds exactly what arrived; the behavior class
// canonicalizes visibly, as a named step the reviewer can find
public sealed record OrderPlacementLineItem
{
    public OrderPlacementLineItem(string sku, int quantity)
    {
        Sku = sku;
        Quantity = quantity;
    }

    public string Sku { get; }

    public int Quantity { get; }
}

internal sealed class ManagerOrdering
{
    public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest orderPlacementRequest)
    {
        var canonicalRequest = NormalizeToCanonicalForm(orderPlacementRequest);
        // ...
    }
}
```

The test is not "is this transform simple?" - `ToUpperInvariant()` is about as simple as a transform gets. The test is "is this a business decision the analyst could someday change?" If yes, it belongs in the behavior class that enacts it, at a line a reviewer can find and a test can pin, not inside a constructor that runs on every code path whether or not the caller wanted the rule applied.

---

## Polymorphism

Introduce an abstract base only when multiple interchangeable implementations are real or imminent. One implementation is not evidence of polymorphism. Service Locator construction does not require an abstract base for every class. In practice, genuine polymorphism accounts for roughly 10-15% of types.

Polymorphism in this corpus is expressed with abstract base classes, never with interfaces. The house pattern: an abstract base named for the concept plus a `Base` suffix - often pure-abstract, because commonality is pulled up into the base only once it is actually found across two or more descendants, not speculatively - and sealed, finished implementations named for the concept plus a suffix describing the variation (`PublisherRabbitMq`, `PublisherServiceBus`). The shared name root also groups the family together wherever files are listed alphabetically.

### Interfaces: Two Sanctioned Uses, and No Others

An interface is not the mechanism for polymorphism here, and the reasoning is not tradition - the classic justifications for reaching for one don't survive scrutiny in C#. "Program to an interface, not an implementation" predates the `interface` keyword by years and originally just meant "program to the API" - it recommends nothing about the keyword. "Loose coupling" is the sharper miss for C# specifically: that claim is imported from languages where a class reference coupled you to a real file - a `.pas` unit, a `.h` header. In .NET a `using` names a *namespace*, an idea that can span many assemblies, and a class reference couples you to that idea exactly as loosely, or as tightly, as an interface reference does. There is no file-level coupling for an interface to save you from. C# 8 default interface implementations are rejected outright: once an interface can carry a method body, it stops being distinguishable from a class, and the language has gained complexity without buying anything back.

That leaves exactly two sanctioned uses for an interface in this corpus:

1. **Capability ("-able") interfaces** - `IDisposable`, `IComparable`, `IEnumerable`. These express a genuine can-do relationship: a type *is* one thing (its class, its base), *has* some things (its fields), and separately *can do* certain things a caller may want to treat generically across unrelated types. Implementing several of these on one class is honest, because each one names a distinct capability, not a family of interchangeable implementations.
2. **Interface segregation, used rarely** - slicing a consumer's view of a fat API down to the sliver it actually needs. The real shape: a gateway sitting far below a Service Locator that exposes dozens of methods needs exactly one of them, `CreateHttpMessageHandler`. Handing the gateway a reference to the whole Service Locator would let it reach for anything the Service Locator offers, today or after the next careless change. The gateway instead depends on a narrow interface exposing only `CreateHttpMessageHandler`, and the Service Locator implements it. This bends the dependency direction - the low-level gateway is dictating a contract the high-level Service Locator must satisfy - and that inversion is the deliberate cost of keeping the sliver narrow. Reach for this when a consumer's need really is that narrow; it is not a default way to decouple two classes that would otherwise just call each other directly.

One boundary matters before applying any of this: the stance governs interfaces **you define**, not interfaces the framework hands you. *Consuming* a framework-defined interface is ordinary and expected - The reference implementation's `ConfigurationProvider`, its `SettingsProviderXxx` family, and the `ServiceLocator` all accept the host's `IConfiguration` (`Microsoft.Extensions.Configuration`), because that is the type the .NET host composes and there is no other way to receive it. What is strongly discouraged is *defining your own* configuration-provider interface - or any interface of your own - to stand in front of a family your abstract-base polymorphism already covers.

Outside those bounds, the operational rule is deliberately narrower than the teaching posture. A finding emits only when completed repository evidence proves one implementation and no current justification. The reviewer judges the supplied repository and does not invent an undocumented future. A developer may retain the interface through a reasoned occurrence override that states the concrete near-term variation, for example that the system is at its initial stage and a second implementation is planned. Broader questions about interface posture remain non-emitting.

When a project-owned interface is justified, its family follows the
organizational `I` prefix convention. This chapter owns that PWI polymorphic-
family name. Native C# review owns ordinary casing mechanics, and Naming
Conventions (`cs03`) does not duplicate the interface occurrence.

### Polymorphic Type Naming Conventions

When a family of types is polymorphic, **consistent naming is critical** for navigation and maintainability.

- **Concept name**: the name used when discussing the abstraction (`Publisher`, `DocumentLoader`)
- **Abstract base**: concept name + `Base` suffix (`PublisherBase`)
- **Implementations**: concept name + a descriptive suffix that differentiates the implementation (`PublisherRabbitMq`, `PublisherServiceBus`)

This matters because it produces alpha-sort grouping (all related types appear together in Solution Explorer and in `using` lists), a scannable structure, a suffix that makes the implementation strategy obvious, and navigation that needs no guessing about which file holds which implementation.

```csharp
// GOOD - abstract base contract, Base suffix, sealed finished implementations
internal abstract class PublisherBase : IAsyncDisposable
{
    public abstract Task PublishAsync(string messageBody);

    public abstract ValueTask DisposeAsync();
}

internal sealed class PublisherRabbitMq : PublisherBase
{
    // ...
}

internal sealed class PublisherServiceBus : PublisherBase
{
    // ...
}
```

Both implementations are finished, so both are `sealed`. `PublisherBase` itself is the extension contract - every member is `abstract`, so there is nothing left for `sealed` to add to it.

In Solution Explorer, alpha-sorted:

```
PublisherBase.cs
PublisherRabbitMq.cs
PublisherServiceBus.cs
```

Instantly visible: one abstract base with two finished implementations.

This is also the Service Locator's config-driven swap point, and the creation path deserves a word here even though its full treatment belongs to the Service Locator and factory chapters. Choosing which publisher runs is not a test-swap concern - it is a configuration-driven choice made once, at startup, from a setting - so it does not go through the Service Locator. It goes through a plain static factory that reads the setting and returns the base type. `MessageBrokerFactory` is exactly this: an `internal static class` that switches on the configured broker type and returns `PublisherBase`. `ManagerOrdering` calls it once, in its own constructor, reads the setting from the configuration provider, and holds the returned instance in a `readonly` field - `_publisherFulfillmentNotifications` - for its lifetime. Contrast this with something that genuinely does need a test-swap seam: a gateway's `HttpMessageHandler` is created through the Service Locator even though the thing being swapped lives inside the gateway, because a test needs to substitute it. The mechanism follows the need - config-driven variant selection uses a factory; anything a test needs to substitute goes through the Service Locator.

```csharp
// BAD - inconsistent naming makes navigation difficult
internal abstract class MessageSender { }

internal sealed class RabbitMqSender : MessageSender { }           // root differs
internal sealed class AzureServiceBusPublisher : MessageSender { } // unrelated name
internal sealed class PublisherViaHttp : MessageSender { }         // another pattern
```

A type that merely accepts or calls an abstract base is a **consumer**, not an implementation. Naming rules apply to the family, not to everything that touches it.

**Common suffix patterns.** By source or location: `Environment`, `KeyVault`, `TableStorage`, `Filesystem`, `BlobStorage`, `S3`, `Database`. By technology: `Http`, `Grpc`, `InMemory`, `Fake`. By strategy: `Cached`, `Batched`. By business context: `Production`, `Development`, `Test`.

Abbreviate only when the abbreviation is universally recognized. `S3` is fine; `KV` is not.

### Close Concrete Descendants by Default

An inheritance declaration must also communicate whether another inheritance step is intended. A concrete class that descends from another class as a finished implementation is declared `sealed`: the class participates in a hierarchy, but it is not being offered as the start of another one.

Leaving a descendant open is exceptional. The source must establish that the class is itself an intentional extension contract, such as an abstract class with unimplemented abstract members or a supported subclass API whose `protected` seams are used by further descendants. Absence of `sealed` alone does not express that design decision.

`sealed` is not required where the language already prevents inheritance: interfaces, `enum` types, `struct` types, and `static` classes. Unlike Python's `@final`, which type checkers enforce, `sealed` is enforced by the C# compiler and the runtime.

The Publisher hierarchy above is the worked example. `PublisherBase` is abstract because it is still an extension contract - every member is `abstract`, so a descendant must resolve all of them before it can run. `PublisherRabbitMq` and `PublisherServiceBus` are finished implementations with nothing left to resolve, so both are `sealed`.

A hierarchy occasionally runs three levels deep when a middle level is itself a genuine, unfinished extension contract - hierarchical exception taxonomies are the niche, middleware-only case most readers will not touch directly, and even there only the leaves are ever sealed.

If the inheritance relationship itself is inheritance for extension, remove or redesign the relationship. Adding `sealed` does not repair an invalid hierarchy.

---

## Inheritance and Composition

There are two kinds of inheritance, and this corpus permits only one:

- **Inheritance for polymorphism**: behavior varies across a family that callers treat uniformly through the base contract. Permitted, and expressed with an abstract base, not an interface (see Polymorphism, above).
- **Inheritance for extension**: inheriting base functionality in order to add more on top. **Not used.** Extension couples descendants to everything the ancestor exposes, produces hierarchies whose branches need each other's members, and invites future misuse. Prefer composition: a class that needs several capabilities constructs and owns the classes providing them.

### Need-to-Know Applies to Hierarchies

The Need-to-Know Principle extends to inheritance: **a base class must not expose any member that is not required by every descendant, today or in the future.** "Available but please don't use it" is not a design. A `protected` member that one descendant should not touch is one refactor away from being made `public` in that descendant, so `protected` members are part of the inherited surface and are in scope.

If descendants need different subsets of functionality, that functionality belongs in composable collaborator classes, not in the ancestor.

When shared infrastructure is genuine (every descendant needs it), a shallow, one-level base is acceptable: a flat base holding truly universal mechanics, with descendants compositing exactly the capability classes they need.

```csharp
// VIOLATION - inheritance for extension
internal class ReportGenerator
{
    public Report Generate(ReportRequest request) => BuildReport(request);
}

internal class EmailingReportGenerator : ReportGenerator
{
    public void SendEmail(Report report, string address) =>
        Smtp.Send(report, address);
}
```

`EmailingReportGenerator` is not a substitutable `ReportGenerator`; it is a `ReportGenerator` with an unrelated capability bolted on. Compose a `ReportMailerBase` collaborator instead.

---

## Review Questions

- Is each type clearly behavior-only or state-only, and never both?
- Is each class `internal` unless it is the domain facade, a boundary request/result model, part of the exception taxonomy, or a composition-root wiring seam?
- Does a behavior class with no collaborators to retain use a `static` class rather than an unused instance shape?
- Can a behavior method run twice without hidden state from the first call?
- Are retained collaborators stateless or governed by an explicit lifetime?
- Are data contracts immutable beyond the surface use of `record` or `init`?
- Does a state type's constructor store its data unchanged, with every business-rule transform left to the behavior class that owns the rule?
- Does each abstract base have genuine polymorphic value, expressed through the abstract base rather than an interface?
- Does each interface present serve one of the two sanctioned uses - capability ("-able") or genuine interface segregation - rather than standing in for polymorphism?
- Are finished concrete descendants sealed?
- Is inheritance used only for substitutable polymorphism?

---

## Code Review Checklist

When reviewing class design, verify:

### Visibility
- [ ] Class is `internal` unless it is the domain facade, a boundary request/result model, part of the exception taxonomy, or a composition-root wiring seam
- [ ] Cross-assembly test access uses `InternalsVisibleTo`, not `public`
- [ ] A behavior class with no collaborators to retain is a `static` class, not an unused instance shape
- [ ] A behavior class that retains a stateless collaborator, connection string, or settings assigned once in its constructor stays an instance class by design - never pushed toward `static`

### Class Type Separation
- [ ] Type is clearly either behavior-only OR state-only, never both
- [ ] Behavior classes have no mutable state that changes across invocations
- [ ] State types are immutable: `init` or no setter, and read-only collection contracts
- [ ] State-type constructors store values unchanged; business-rule transforms (canonicalization, normalization, clamping) happen in the behavior class that owns the rule, not in the constructor
- [ ] No hybrid types that mix behavior and mutable state

### Transitive Statelessness
- [ ] Behavior classes holding collaborator references follow all 5 conditions
- [ ] Collaborators are stateless services (gateways, loggers, validators)
- [ ] References are set once in the constructor, declared `readonly`, and never reassigned
- [ ] Same inputs produce same outputs (deterministic behavior)
- [ ] No mutable caches, counters, or accumulated state

### Polymorphic Naming
- [ ] Abstract base classes use the `Base` suffix
- [ ] All implementations share the family root of their abstract base
- [ ] Suffixes clearly describe implementation strategy (e.g., `RabbitMq`, `ServiceBus`)
- [ ] Related types appear together when alpha-sorted
- [ ] No abbreviated suffixes unless universally known (`S3` OK, `KV` not OK)
- [ ] Any self-defined interface is a capability ("-able") interface or a narrow, consumer-driven segregation - never a polymorphism contract with one or many implementations (consuming framework-defined interfaces such as `IConfiguration` is fine)
- [ ] No C# 8 default interface implementations

### Inheritance
- [ ] No inheritance for extension - hierarchies exist only for polymorphism
- [ ] Base classes expose no member that any descendant (present or future) does not need
- [ ] Capability subsets are composited from collaborator classes, not inherited and selectively exposed
- [ ] Concrete descendants that are finished implementations declare `sealed`
- [ ] Open descendants have explicit evidence that they are intentional extension contracts

### General Design
- [ ] Abstract bases used only when polymorphism is required; interfaces reserved for capability ("-able") types or genuine interface segregation, never for polymorphism
- [ ] No class, folder, or category description is named `Utility`, `Utilities`, `Helper`, or `Helpers` - behavior classes are named for what they do (validators, composers, parsers, canonicalizers, factories)
- [ ] No complex nested local functions - refactor to separate classes
- [ ] Properties are read-only or `init`-only; read/write properties are extremely rare
- [ ] Public methods of complex types orchestrate (describe WHAT, not HOW)
