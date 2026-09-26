---
title: Naming Conventions
description: >-
  Deriving names rather than inventing them, domain suffixes over indices, the Async exception, and why Retrieve and Search choose different failure contracts.
datePublished: 2017-09-20
hero: chapter-naming-conventions-csharp
dateModified: 2026-09-19
tags:
  - naming
  - csharp
  - method-design
section: pwi
topic: naming-conventions
language: csharp
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Express your intent in code, not comments"
- "Don't make me think"
- "Don't make me wonder"
- "Don't invent names"

---

## Intent

Names are the primary way a program expresses what it is doing, to a reader who was not in the room when it was written. A type name, a property name, a method name, a formal argument name, a local variable name - every one of these is a decision about what a future reader will understand without asking anyone. Get the name right, and the code needs no further explanation. Get it wrong, and every comment written to compensate is a patch over a defect that renaming would have removed outright.

**We write code once and read it a thousand times.** The first pass through a new method is about making it work; naming is a second pass, done with the reader in mind, and it is not vanity work. A name that felt fine while a method was still being written can turn out to be wrong once the method's shape has settled, and a name that was accurate on day one can go stale once the domain is better understood two months later. Today's tooling makes renaming close to free. There is no reason to leave a name that no longer tells the truth.

**Names use the vocabulary of the business domain**, not the vocabulary of the implementation. This is not limited to literal commerce - "the business" here means whatever domain the software serves, a game as much as a general ledger. When the right domain word is not obvious, the fix is to ask the person who owns that domain, not to invent a plausible-sounding technical synonym.

This chapter is strictly additive to what the C# compiler and Roslyn analyzers already enforce. **Casing is not this chapter's subject.** `camelCase` for locals and parameters, `PascalCase` for types and members, leading-underscore private fields - these are IDE1006 and the native C# style guideline's job, and a reviewer following this chapter never restates them. What this chapter owns is a narrower and more specific question that no casing rule can answer: given that a name is going to be `camelCase` or `PascalCase` either way, **which words does it actually contain, and did the author invent them or derive them?** Casing asks "is this shaped right?" This chapter asks "does this name tell the truth?" A single naming defect can fail both questions at once, and a reviewer notes each separately rather than picking one.

---

## Single Instance in Scope: Name It for Its Type

This is the production naming default. Test and reusable Asserter comparison bindings follow CS52: retain the full type-derived base and justified expected/actual, arrangement, or disambiguating roles. The counterpart may use a different representation or live inside an expected aggregate. Do not remove a supported role because a second instance of the same concrete type is absent. Count declarations across the complete enclosing scope before claiming a sole instance.

When exactly one instance of a user-defined type is active in a scope - a parameter, a local variable, a private field - **the name is the type name, case-converted and nothing else.** `camelCase` for a parameter or local, `PascalCase` for a member. No `the`, no `new`, no `current`, no `_temp`, no `_instance`, no `_obj`. This rule does not apply to primitives, scalar value types, built-in containers, or callable values - the next section covers those, because a good primitive name is never just its type.

```csharp
// COMPLIANT - single instance, camelCase parameter matches the type name
public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest orderPlacementRequest)
{
    // ...
}
```

```csharp
// VIOLATION - invented qualifiers add nothing; there is only one instance
public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest theOrderPlacementRequest) { /* ... */ }
public async Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest newRequest) { /* ... */ }
```

This is not limited to parameters. `ManagerOrdering`'s constructor holds every long-lived collaborator it is given, and every field is the case-converted name of its type:

```csharp
internal sealed class ManagerOrdering : IAsyncDisposable
{
    private readonly LoggerBase _logger;
    private readonly DataManagerOrdering _dataManagerOrdering;
    private readonly PublisherBase _publisherFulfillmentNotifications;
    private readonly GatewayEmailService _gatewayEmailService;
    // ...
}
```

`_dataManagerOrdering` and `_gatewayEmailService` are exactly this rule in its plainest form: the field name is the type name, nothing invented. The other two fields need a closer look, because each illustrates a corollary of this same rule.

### A Base-Suffixed Type's Variable Drops the Suffix

Class Design (`cs05`) already covers the *type*-naming side of a polymorphic family: an abstract base takes the `Base` suffix (`PublisherBase`), and its concrete implementations take a differentiating suffix (`PublisherRabbitMq`, `PublisherServiceBus`). This chapter owns the corollary on the *variable* side: **a variable, parameter, or property holding an instance of a `Base`-suffixed type drops the `Base` suffix.** The suffix exists to distinguish the abstract contract from its implementations at the type-declaration level; it says nothing about the instance a variable holds, and repeating it there is exactly the kind of invented name this chapter exists to catch. A `PublisherBase`-typed field is named `publisher`, not `publisherBase` - the field is polymorphic by construction (that is what holding the base type means), and the suffix would only restate that fact redundantly at every use site.

`ManagerOrdering._logger` is this rule with nothing else going on: the field type is `LoggerBase`, and the field is `_logger`, suffix dropped, no qualifying word needed because only one logger is ever in scope.

`_publisherFulfillmentNotifications` shows the rule combined with a genuine business-role qualifier. The field's type is still `PublisherBase` - base suffix still dropped - but the field also states *what this publisher is for*, because knowing that this particular publisher exists to emit fulfillment notifications is domain information a bare `_publisher` would lose. This is not a violation of "don't invent names": Section "Multiple Instances of the Same Type," below, and the Python guideline's own carve-out for genuine business meaning both cover exactly this case. The suffix that must go is `Base`; a business-role qualifier is not the same thing as an invented name, and the two are evaluated independently.

```csharp
// COMPLIANT - Base suffix dropped; business role retained where it adds real information
private readonly LoggerBase _logger;
private readonly PublisherBase _publisherFulfillmentNotifications;

// VIOLATION - the type's Base suffix leaks into the instance name
private readonly LoggerBase _loggerBase;
private readonly PublisherBase _publisherBase;
```

### Technical Objects: Name the Type, Don't Invent

Some variables hold a technical object with no business meaning of its own
- an `HttpClient`, an `HttpResponseMessage`, a raw response body. These get the same treatment as any other single instance: name it after its type, in `camelCase`, and stop thinking about it. The author's own worked example makes the point directly. Before:

```csharp
private static async Task<string> GetWebPage(string website)
{
    var client = new HttpClient();
    var result = await client.GetAsync(website);
    var page = await result.Content.ReadAsStringAsync();

    return page;
}
```

After:

```csharp
private static async Task<string> GetWebPageHtmlAsync(string webPageUrl)
{
    var httpClient = new HttpClient();
    var httpResponseMessage = await httpClient.GetAsync(webPageUrl);
    var html = await httpResponseMessage.Content.ReadAsStringAsync();

    return html;
}
```

`client` became `httpClient` - the type name, nothing invented. `result` became `httpResponseMessage` - again, the type name; `result` was a generic placeholder telling the reader nothing (see the next section). The method's own name changed too: `GetWebPage` said nothing about *what* was being returned - HTML? a rendered screenshot? - so it grew a `GetWebPageHtmlAsync` name that states the payload, and its argument `website` became `webPageUrl`, because a website is not a URL and the parameter is specifically the latter. And `page`, the string actually returned, was renamed `html` - not because `html` is a type name, but because it is the accurate domain word for what that string holds once the method's own name has committed to returning HTML specifically. One worked example, four separate corrections, each answering a different question this chapter asks.

The moment two technical objects of the same type coexist in one scope, this default stops applying and Section "Multiple Instances of the Same Type" (below) takes over - a real distinguishing role must be found, because the type name alone can no longer identify either one.

### Renaming a Library's Own Bad Name Is Sanctioned, Not Inventing

"Don't invent names" governs the vocabulary a developer chooses. It does not protect a third-party library's own bad naming choice. When a dependency names something in a way that actively misleads - not merely a name a developer personally dislikes, but one that names the wrong concept - taking the correct domain name at your own boundary is the sanctioned exception, not a violation of this chapter. The canonical illustration involves the RabbitMQ .NET client's connection-channel type. In the client library version discussed on this point, the type was named `IModel` - a name that described nothing about what the object actually is, which is a channel over a broker connection:

> "This is called an `IModel`... I'm going to call this `channel` though,
> because this has more meaning... even though I'm inventing a name for
> whatever reason, the RabbitMQ people just give it the wrong name. If I
> called it `model`, it's just going to be confusing, so I'm going to call
> it `channel`."

The reference implementation's own `PublisherRabbitMq` follows exactly this precedent, and the current RabbitMQ .NET client has since renamed the type to `IChannel` - independent confirmation that `channel`, not the library's original name, was always the correct domain word:

```csharp
internal sealed class PublisherRabbitMq : PublisherBase
{
    private IConnection? _connection;
    private IChannel? _channel;
    // ...
}
```

The test for whether a rename at a boundary is sanctioned or is itself "inventing" is narrow: the library's own name must describe the wrong thing, not merely a name you would have picked differently. `channel` for `IModel` passes that test; renaming a perfectly accurate library type just to match house style does not, and is an invented name like any other.

### Native Collision: IDE1006 Owns Casing, This Chapter Owns Derivation

Roslyn's IDE1006 naming-style analyzer already enforces `camelCase` for locals and parameters and `PascalCase` for members. This chapter's rule overlaps that surface without contradicting it: IDE1006 checks that a name is *shaped* correctly; this chapter checks that a name's *content* is derived from the type it names rather than invented. A reviewer applying both never reports the same defect twice under two different names - a mis-cased but correctly derived name (`OrderPlacementRequest` used verbatim as a parameter name) is IDE1006's finding; a correctly cased but invented name (`theRequest`) is this chapter's finding.

---

## Multiple Instances of the Same Type: A Domain Suffix, Not an Index

When two or more instances of the same type are active in one scope, the type name alone can no longer identify either one, and a qualifier becomes necessary. The qualifier must state that value's distinct **business role**. Numeric, ordinal, positional, or lifecycle-flavored qualifiers - `config1`/`config2`, `primaryOrder`/`secondaryOrder`, `orderOld`/`orderNew`
- are violations, because they encode nothing a reader can act on: which one is "primary," and why does that matter to this method?

`ManagerOrdering.PlaceOrderAsync` has exactly this situation - the request as it arrived, and the same request after SKU casing has been normalized - and resolves it with a business-meaningful suffix:

```csharp
// COMPLIANT - two instances of OrderPlacementRequest, disambiguated by business role
var canonicalOrderPlacementRequest = NormalizeToCanonicalForm(orderPlacementRequest);

ValidatorOrderPlacementRequest.Validate(canonicalOrderPlacementRequest);
```

`orderPlacementRequest` is the single-instance default from the previous section; `canonicalOrderPlacementRequest` earns its prefix because "this is the canonicalized version of the same request" is real information a reader needs to track which one is safe to compare, store, or log.

```csharp
// VIOLATION - technical qualifiers convey no business meaning
AzureOpenAiConfig config1 = GetAzureOpenAiConfig(modelName: "gpt-5-mini-marketing");
AzureOpenAiConfig config2 = GetAzureOpenAiConfig(modelName: "gpt-5-mini-support");

// COMPLIANT - the suffix states each config's distinct business role
AzureOpenAiConfig azureOpenAiConfigMarketing = GetAzureOpenAiConfig(modelName: "gpt-5-mini-marketing");
AzureOpenAiConfig azureOpenAiConfigSupport = GetAzureOpenAiConfig(modelName: "gpt-5-mini-support");
```

If a business-meaningful suffix is hard to find, treat that difficulty as a signal rather than push through with a weak one: either the type itself is underspecified (an earlier design mistake, not a naming one), or the method holding both instances is doing too much and should be split so each instance gets its own narrower scope.

---

## Primitives, Scalars, and Collections Say What They Hold

The "name it for its type" default from the first section applies only to user-defined complex types. A `string`, an `int`, a `bool`, a `DateTime`, a `Decimal` - and a `Dictionary<TKey, TValue>` or `List<T>` built from any of these - is named for the **domain value it represents**, never for its runtime type. `string stringValue`, `int count`, `bool flag` tell a reader nothing they did not already know from the declaration; the annotation already says the type, so a name that only repeats the type wastes the one thing a name is for. The name states what the value means to the business - an `int` that carries how many is a `quantity`; a `decimal` that carries money is a `price` or a `cost`. The name declares the variable's business purpose, its intent, not its storage type.

```csharp
// VIOLATION - the name repeats the type instead of stating the domain value
string stringValue = customerId;
int number = retryAttempts;
bool flag = customerIsActive;

// COMPLIANT - the name states what the value represents
string customerId = "12345";
int maxRetryCount = 3;
bool customerIsActive = true;
```

Boolean names are judged as complete conditional expressions, not by a
mandatory prefix. A local or parameter normally carries its subject, so
`if (customerIsActive)` and `if (orderIsNew)` read naturally. A property may be
`IsActive` because `if (customer.IsActive)` already supplies the subject.
`CanRetry`, `HasItems`, and `ShouldPublish` are equally valid when their complete
expressions read naturally. Do not require every boolean to begin or end with
the same word, and do not reverse the phrase into names such as
`isActiveCustomer` or `isNewOrder`.

This is not limited to `string`/`int`/`bool`. A `Decimal`, a `TimeSpan`, a `DateTime`, a `Guid` are all scalar value types subject to the same rule - `Decimal result` or `DateTime data` hides the domain value exactly as thoroughly as `string stringValue` does, and the type annotation does not rescue it.

A genuinely technical value with no domain meaning to add, and only one such value in scope, may keep a plain technical name - `httpClient`, `html`, from the previous section, are exactly this. The moment a second one of the same technical type appears, or the value represents something the business actually talks about, a domain-specific name is required.

**Collections** take the plural of the specific domain entity they hold, not a generic container word: `IReadOnlyList<PlacedOrderLine> placedOrderLines`, never `items` or `data`. A collection name should not append a redundant container suffix - `_list`, `_set`, `_dict` - when the plural noun already says enough; the one exception is when two different *representations* of the same domain value genuinely coexist in scope (a raw row list alongside its mapped-DTO list, for instance), where the suffix is the only thing telling them apart.

**Dictionaries** name both sides of the mapping. `ManagerOrdering`'s resubmission check builds exactly this shape, twice, for the two sides of a comparison:

```csharp
// COMPLIANT - both key and value meaning are named
Dictionary<string, int> requestedQuantitiesBySku = orderPlacementRequest.OrderPlacementLineItems.ToDictionary(
    orderPlacementLineItem => orderPlacementLineItem.Sku,
    orderPlacementLineItem => orderPlacementLineItem.Quantity);
Dictionary<string, int> originalQuantitiesBySku = originalPlacedOrderLines.ToDictionary(
    placedOrderLine => placedOrderLine.Sku,
    placedOrderLine => placedOrderLine.Quantity);
```

`requestedQuantitiesBySku` names the value (`quantities`, plural - there is one per key), the key (`Sku`), and which of the two coexisting dictionaries this is (`requested` vs. `original`) - three separate naming obligations, each satisfied, in one identifier. `Dictionary<string, int> mapping` or `Dictionary<string, int> data` would have satisfied none of them.

---

## A Name Must Say What the Thing Is

*(Source: secondary transcript, "So You Want To Be a Code Reviewer? #5, Part 1" - a real code-review ruling in the author's voice, not present in the primary C# source document.)*

"Don't invent names" is usually about a name that adds words the type doesn't need. It also covers the opposite failure: a name that claims to be something more specific than what it actually holds. A property populated from a machine's `Environment.MachineName` and called `MachineId` makes a promise its own value does not keep - a reader sees "id" and reasonably assumes a stable, possibly-numeric identifier distinct from the display name, when the value underneath is simply the name:

> "If your machine ID is nothing but the machine name, why are you
> inventing a name? Give it a machine name... You're going to have to
> justify why you want it to be called machine ID."

```csharp
// VIOLATION - the name promises an identifier; the value is the name
public string MachineId { get; }  // populated from Environment.MachineName

// COMPLIANT - the name states what the value actually is
public string MachineName { get; }
```

The test is not "is this name specific enough" but "does this name correctly describe the thing it is naming." A name can be perfectly well-formed and still be a defect if it describes a different concept than the one the value holds. Where a genuine business reason exists for the two to diverge - an actual stable ID computed *from* the machine name, say - the name is correct as `MachineId` and the reviewer's question becomes whether that derivation is real, not whether the name is wrong.

---

## Naming Symmetry in Paired and Enumerated Members

*(Source: secondary transcript, "So You Want To Be a Code Reviewer? #5, Part 1" - net-new C# naming guidance with no equivalent Python rule and no row in the translation matrix; see the authoring ledger's disposition of this section.)*

An enum (or any small family of named constants) that represents the two ends of one lifecycle should name both ends from the **same pair of opposites**, never mix vocabulary between them. `Start`/`Finish` and `Begin`/`End` are both fine pairs on their own; `Start`/`End` is not, because it silently borrows the second half of a different pair:

```csharp
// VIOLATION - mismatched pair: Start implies Finish, not End
internal enum MonitorEventType
{
    MonitorStart,
    MonitorEnd,
    StepStart,
    StepEnd,
}

// COMPLIANT - one consistent pair throughout
internal enum MonitorEventType
{
    MonitorStart,
    MonitorFinish,
    StepStart,
    StepFinish,
}
```

The reasoning is the same "don't make me wonder" principle behind every other rule in this chapter: a reader who sees `Start` forms an expectation about its counterpart, and a mismatched counterpart forces a re-read to confirm whether `End` is a typo, a different concept, or genuinely means the same thing as `Finish` would have. Pick one pair per family and hold it for every member.

---

## Method Names State the Domain Outcome

A method name says what the method accomplishes for the business, not how it accomplishes it mechanically. `process_*`, `handle_*`, `do_*`, `execute_*`, and `perform_*` as leading verbs are mechanics-only unless a specific domain noun follows them - `ProcessOrder` still fails this test, because "process" is not what the business calls placing an order.

```csharp
// VIOLATION - describes mechanics, not the domain outcome
public Task ProcessAsync(OrderPlacementRequest orderPlacementRequest) { /* ... */ }
public Task HandleAsync(byte[] payload) { /* ... */ }

// COMPLIANT - domain outcome is the name
public Task<OrderPlacementResult> PlaceOrderAsync(OrderPlacementRequest orderPlacementRequest) { /* ... */ }
public Task RegisterCustomerAsync(CustomerRegistrationRequest customerRegistrationRequest) { /* ... */ }
```

`ManagerOrdering.PlaceOrderAsync` and `DataManagerCustomers.RegisterCustomerAsync` are both real methods from the reference implementation and both already satisfy this: neither name describes a technical step; both name the business operation being carried out. A private, purely technical method with no domain content of its own - a byte-parsing routine, a checksum calculator - is the one exception, and even then a technical name should be the fallback used because no domain concept exists at that scope, not the default reached for out of habit.

### The `Async` Suffix Is a Sanctioned Exception

Every method above ends in `Async`, and that suffix is not this chapter contradicting itself. `Async` is the one sanctioned exception to "a method name describes domain outcome, not mechanics" - it is the C# team's own convention (Task-based Asynchronous Pattern), carried into this corpus with the same standing as the `Core` suffix discussed in Method Design (`cs04`): a technical marker with no domain meaning of its own, whose entire job is to tell a caller "this returns a `Task`, `await` it." Every asynchronous method in this corpus carries it; a method that returns a `Task` without the suffix is the defect, not the reverse.

---

## Retrieve vs. Search: The Verb Chooses the Failure Contract

Two different query intents get two different verbs, and the verb tells the caller whether an exception is possible before they read a single line of the implementation:

- **Identity retrieval** - the caller asked for one specific thing that should exist. If it does not, the method **throws**. It never returns `null` or an empty result as a quiet apology.
- **Criteria search** - an empty result is a legitimate answer, returned as an empty collection. No matches is not an error.

**C# realization.** The author's own worked example of this rule uses `GetCustomer`, not `RetrieveCustomer`, as the identity-retrieval verb - `Get*` throwing on absence is the idiomatic .NET shape (mirrored by the BCL pairing of `Get*` with `TryGet*` for the criteria-style alternative), and The reference implementation's own `DataManagerOrdering.GetOriginalOrderForResubmissionAsync` follows exactly this convention:

```csharp
public async Task<(PlacedOrder PlacedOrder, CustomerContact CustomerContact, OrderMessagingState OrderMessagingState)>
    GetOriginalOrderForResubmissionAsync(string orderReference)
{
    using var getOriginalOrderCommand = CommandFactoryOrders.CreateGetOriginalOrderForResubmissionCommand(orderReference);
    // ...
    // never returns a missing/empty result - ExecuteOrderReturningProcedureAsync
    // throws OrderStoreContractViolationException when the expected row is absent
}
```

Pick one verb pair for identity retrieval (`Get*`, throwing) and one for criteria search (`Find*` or `Search*`, returning an empty collection) and apply the pair consistently across the codebase. `Get*` for a method that can quietly hand back `null` breaks the promise its own name makes - exactly the ambiguity this rule exists to remove.

```csharp
// VIOLATION - Get* implies "exists," but the method apologizes with null instead
public Customer? GetCustomer(string customerId) { /* returns null if not found */ }

// COMPLIANT - the verb and the behavior agree
public Customer GetCustomer(string customerId)
{
    var customer = _customers.SingleOrDefault(c => c.CustomerId == customerId);
    if (customer is null)
    {
        throw new CustomerNotFoundException(customerId);
    }
    return customer;
}

// COMPLIANT - an empty result is a legitimate answer for a criteria search
public IReadOnlyList<Customer> FindCustomers(CustomerSearchCriteria customerSearchCriteria) { /* ... */ }
```

### Names Don't Change Through the Flow

A business operation keeps **one name across every layer it flows through**. The reference implementation's own place-order flow is the model to point to: the business operation is *place order*, and it is `PlaceOrderAsync` at every layer that owns it -

```text
ManagerOrdering.PlaceOrderAsync
    -> DataManagerOrdering.PlaceOrderAsync -> sproc PlaceOrder
```

No layer along that chain invents a synonym - no `SaveOrderRecord`, no `usp_InsertOrder`. Renaming at a boundary is justified only when the boundary itself changes the concept, which is precisely what the RabbitMQ `IModel`-to-`channel` rename earlier in this chapter is: a gateway translating an external vendor's vocabulary into this codebase's own domain vocabulary (Gateway Design Pattern, `cs14`). Between two layers this codebase owns on both sides, a name change is pure friction - it costs a translation step at every trace, every debugger session, and every code review, for no benefit anyone can point to.

---

## Typed Deconstruction, Not Anonymous Tuples

C#'s `ValueTuple` deconstruction is the direct equivalent of Python's tuple unpacking, and it inherits the same discipline: **every deconstruction target is declared with an explicit type before the deconstructing assignment**, and every target name follows the same naming rules as any other variable in this chapter - no abbreviations, no generic placeholders.

`ManagerOrdering.PlaceOrderAsync` deconstructs a three-element tuple twice, and both sites pre-declare every target:

```csharp
// COMPLIANT - every target pre-declared, every name follows the type-derivation rule
PlacedOrder placedOrder;
CustomerContact customerContact;
OrderMessagingState orderMessagingState;
bool orderIsNew = true;
try
{
    (placedOrder, customerContact, orderMessagingState) =
        await _dataManagerOrdering.PlaceOrderAsync(canonicalOrderPlacementRequest);
}
catch (OrderReferenceAlreadyExistsException)
{
    (placedOrder, customerContact, orderMessagingState) = await ResolveResubmissionAsync(canonicalOrderPlacementRequest);
    orderIsNew = false;
}
```

```csharp
// VIOLATION - inline var deconstruction skips both pre-declaration and naming discipline
(var order, var contact, var state) = await _dataManagerOrdering.PlaceOrderAsync(request);
```

**Named tuple elements change what "evidence" looks like here.** Unlike Python, a C# tuple type can carry its own element names in the method signature - `Task<(PlacedOrder PlacedOrder, CustomerContact CustomerContact, OrderMessagingState OrderMessagingState)>` already documents what each position holds before any caller deconstructs it. The pre-declared local names at the call site are expected to agree with those declared tuple element names (case-converted) - a caller who deconstructs `PlacedOrder` into a local called `header` has invented a name the method's own signature already contradicts. Reviewing a C# deconstruction site therefore checks two things Python's version does not separate as cleanly: are the locals pre-declared and well-named at all, and do the chosen names actually match the tuple element names the callee already published.

If a declared element name does not read right at the call site, the fix is to change the method's declared name - it is your method, and once its names are right, every caller inherits them. The one sanctioned exception is a tuple coming from a third-party library not under your control, whose element names carry no meaning in your domain: there, renaming at the call site to the name the value has in your business is the same library-rename allowance the first section grants for `IModel` becoming `channel`. In practice this is rare.

If a returned tuple grows past two or three elements, or the elements are not always consumed together, that is usually a sign the return value wants to be a small named record instead of a tuple - a call this chapter defers to Method Design (`cs04`), since it is about a signature's shape rather than a name's derivation.

---

## Repeated Domain Strings Become Constants

An identical domain-significant string literal used more than once inside one class is declared once, as a class-level constant, and referenced through that constant everywhere else. `DataManagerOrdering` already does this correctly for its action-type literals:

```csharp
// COMPLIANT - declared once, referenced everywhere the literal was needed
public const string FulfillmentNotificationActionType = "FulfillmentNotification";
public const string ConfirmationEmailActionType = "ConfirmationEmail";
```

The same class's error-number constants (`ErrorNumberCustomerNotFound`, `ErrorNumberOrderReferenceExists`, and the rest) are the same discipline applied to `int` rather than `string` values - repeated significant literals of any kind earn a name, not just strings.

The corpus also contains a live counterexample worth naming directly, so this rule is not only ever illustrated by tidy code. `ManagerOrdering` builds a `ContextualData` entry keyed `"Order.Reference"` in three separate methods (`ResolveResubmissionAsync`, `TryPublishFulfillmentNotificationAsync`, and `TrySendConfirmationEmailAsync`), and none of the three references a shared constant:

```csharp
// VIOLATION (real, currently unaddressed) - the same literal, three times, no constant
var contextualDataByName = new ContextualData { { "Order.Reference", orderPlacementRequest.OrderReference } };
// ...
messageBrokerPublishException.AddContextualData(new ContextualData { { "Order.Reference", placedOrder.OrderReference } });
// ...
emailServiceException.AddContextualData(new ContextualData { { "Order.Reference", placedOrder.OrderReference } });
```

The fix is a single `private const string ContextualDataKeyOrderReference = "Order.Reference";` on `ManagerOrdering`, referenced from all three sites. Language syntax tokens, protocol-mandated literals, and the empty string are outside this rule; a coincidentally identical literal that means two different things in two different classes is not a repeat of "the same" literal and does not need a shared constant.

---

## Comments and XML Doc Comments

Comments and XML doc comments are part of the same intent-expression contract as names. The goal is not zero documentation; it is that code should not *need* a comment or an XML doc comment to explain its obvious what. Names, signatures, type annotations, and method shape carry that burden. A comment or `<summary>` earns its place only when it explains *why*
- a constraint, a domain fact, a protocol quirk, an external reason - that no name or signature could carry.

```csharp
// VIOLATION - the XML doc comment only repeats the signature
/// <summary>Gets the timeout.</summary>
/// <param name="emailServiceSettings">The settings.</param>
/// <returns>The timeout in seconds.</returns>
private static int GetTimeoutSeconds(EmailServiceSettings emailServiceSettings)
{
    return emailServiceSettings.TimeoutSeconds;
}
```

```csharp
// COMPLIANT - the summary states a constraint and a design fact the signature cannot express
/// <summary>Holds one long-lived connection, established lazily on first publish and reused
/// until disposal. A failed publish abandons the connection so the next attempt
/// reconnects fresh - the publisher heals itself across broker restarts.</summary>
internal sealed class PublisherRabbitMq : PublisherBase
{
    // ...
}
```

The second example is the reference implementation's own `PublisherRabbitMq` class summary, unedited: it tells a reader something the class's public surface genuinely cannot - a lazily-established connection and a self-healing reconnect policy are behavioral facts, not signature facts, and no method name could carry them without becoming unreadable.

```csharp
// VIOLATION - the comment narrates the next line instead of explaining anything
// Split the response into lines
var lines = response.Split('\n');
```

```csharp
// COMPLIANT - the comment explains a non-obvious external constraint
// NFR-1: the adapter uses the integration library's own transport RECOVERY when the
// library provides one - this is RabbitMQ's automatic connection recovery. Recovery
// (reconnecting a broken transport) is a different policy from request RETRY.
AutomaticRecoveryEnabled = true,
```

### The Explanation Test

If a colleague has to ask what a piece of code does, the correct response is never an explanation and never a comment added after the fact - it is "let me fix the code." The request to explain *is* the finding: an experienced reader could not follow the code, which means a name, a shape, or a structure failed. Answering the question verbally, or with a comment, treats the symptom and leaves the actual defect in place for the next reader to trip over.

The one boundary on this rule is the business domain itself. A reader may genuinely not know what a fulfillment notification or a resubmission policy is, and no amount of renaming teaches a reader the domain the software serves - a comment or an XML doc comment explaining domain vocabulary is legitimate. What is not legitimate is a comment explaining *the code* - what a block does, what a variable holds, why control ends up somewhere. That is always a renaming or restructuring problem wearing a comment as a disguise.

The comments that survive this test cite an external reason the code itself cannot express - a library defect, a profiling result, a protocol requirement - exactly like the `AutomaticRecoveryEnabled` example above and `DataManagerOrdering.ExtractUnknownSkus`'s own comment: `// Coded error messages have the shape "ERR_TOKEN|detail"; the detail for unknown products is a comma-separated SKU list.` No method name could carry a wire-format fact like that; the comment states an external protocol constraint the code otherwise gives no clue about. A workaround with no comment pinning its external reason invites a future maintainer to "clean it up" back into the bug it was written to avoid.

---

## Boundaries With Other Chapters

- **Casing itself** (`camelCase`/`PascalCase`, leading-underscore private fields) is Roslyn IDE1006's job; this chapter never restates it. See the native collision note in "Single Instance in Scope," above.
- **A polymorphic family's type-level naming** - the abstract base's `Base` suffix, each implementation's differentiating suffix, and the alpha-sort grouping that naming produces - belongs to Class Design (`cs05`). This chapter owns only the corollary that an instance of a `Base`-suffixed type drops the suffix.
- **The banned category words** ("utility," "utilities," "helper," "helpers") for a class or folder name are Class Design's prohibition (`cs05`); this chapter's "name a method by its domain outcome, not its mechanics" rule is the method-level sibling of that same discipline, not a restatement of it.
- **Whether a returned tuple should become a named record instead** is a signature-shape question owned by Method Design (`cs04`); this chapter owns only the naming discipline once a tuple is the chosen shape.
- **General naming rules also apply in test code.** Test Naming Conventions (`cs52`) adds and solely owns test-specific BDD, role, path-family, Asserter, and test-comment grammar. It does not duplicate a general naming occurrence already owned here.
- **Boundary input cleanup** - trimming, null-vs-empty string handling - is outside this chapter; this chapter only asks that the resulting value, once clean, be named for what it is. Broader C# boundary-model doctrine remains non-emitting until a dedicated chapter is admitted.

---

## Review Questions

- Is a single instance of a user-defined type named after its type, with no invented prefix or suffix?
- Does a variable, parameter, or property holding a `Base`-suffixed type drop the `Base` suffix, retaining only a business-role qualifier where one is genuinely earned?
- Where a name renames a third-party library's own concept, does the library's original name actually describe the wrong thing - or would a developer just prefer different words?
- When two or more instances of the same type coexist, does the disambiguating suffix state a business role, not an index or a lifecycle flag?
- Does a primitive, scalar, or collection name state the domain value it holds, rather than echoing its own type?
- Does a dictionary name identify both its key and its value?
- Does a property's name accurately describe the value it holds, not a more specific concept the value does not actually represent?
- Do the members of one enum (or similar family) share one consistent pair of opposite terms, never a mix?
- Does a method name state a domain outcome, and is `Async` the only suffix present that does not?
- Does an identity-lookup method throw on absence, and does a criteria search return an empty collection rather than throwing?
- Does a business operation keep the same name at every layer this codebase owns, with a rename reserved for a genuine vocabulary boundary (a gateway)?
- Is every tuple-deconstruction target pre-declared with an explicit type, and do the chosen names agree with any element names the tuple's own type already publishes?
- Is a domain-significant string literal used more than once in a class pulled into a named constant?
- Does a comment or XML doc comment add information a name, signature, or visible control flow could not - or does it merely restate what is already there?
- When code needed an explanation during review, was the finding "fix the name or the shape," rather than accepting the explanation as sufficient?

---

## Code Review Checklist

When reviewing naming, verify:

### Single Instance Variables
- [ ] A single instance of a user-defined type is named the case-converted type name, with no invented prefix (`the`, `new`, `current`) or suffix (`Temp`, `Instance`, `Obj`)
- [ ] A variable, parameter, or property of a `Base`-suffixed type drops the `Base` suffix
- [ ] A business-role qualifier on a single instance states real domain information, not a restated type name
- [ ] A renamed third-party library concept genuinely mismatches what the library's own name describes, not merely a stylistic preference

### Multiple Instance Variables
- [ ] Multiple instances of the same type are disambiguated by a business role, never by number, position, or lifecycle flag
- [ ] A disambiguating suffix that is hard to phrase in business terms is treated as a signal to fix the type or split the method, not as license for a weak suffix

### Primitives and Collections
- [ ] Primitive and scalar names (`string`, `int`, `bool`, `Decimal`, `DateTime`, `Guid`, and similar) state the domain value, never the type
- [ ] Collection names use the plural of the specific domain entity, with no redundant `_list`/`_set`/`_dict` suffix unless two representations genuinely coexist
- [ ] Dictionary names identify both the key and the value side of the mapping

### Naming Accuracy and Symmetry
- [ ] A property or variable's name matches what its value actually is, not a more specific or different concept
- [ ] An enum or similarly paired family uses one consistent pair of opposite terms throughout, never a mixed pair

### Method Names
- [ ] Public method names state a domain outcome, not a mechanical verb (`Process`, `Handle`, `Do`, `Execute`, `Perform`) without a domain noun attached
- [ ] Every method returning `Task`/`Task<T>`/`ValueTask` carries the `Async` suffix, and no non-async method carries it
- [ ] An identity-lookup method (`Get*`) throws when its target is absent, never returning `null` or an empty result
- [ ] A criteria-search method (`Find*`/`Search*`) returns an empty collection for no matches, never throwing
- [ ] A business operation's name is unchanged across every layer this codebase owns; a rename occurs only at a genuine vocabulary boundary

### Typed Deconstruction
- [ ] Every deconstruction target is declared with an explicit type before the deconstructing assignment
- [ ] Deconstruction target names follow this chapter's naming rules and agree with any tuple element names the callee's signature already publishes

### Constants
- [ ] A domain-significant string (or other) literal repeated within a class is declared once as a named constant and referenced from every site

### Comments and XML Doc Comments
- [ ] No XML doc comment merely repeats the signature's parameter names, types, or return type
- [ ] No comment narrates the next line or block instead of explaining why it exists
- [ ] A surviving comment cites an external reason (a library defect, a protocol requirement, a measured result) the code itself cannot state
- [ ] Code that required an explanation during review was renamed or reshaped, not merely explained or commented
