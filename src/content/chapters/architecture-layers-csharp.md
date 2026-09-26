---
title: Architecture Layers
description: >-
  Structure communicates intent: strict layers from Domain Facade to Gateway, internal by default with a public surface the compiler enforces, and folder depth that marks each class's level of abstraction.
datePublished: 2017-09-20
hero: chapter-architecture-layers-csharp
dateModified: 2026-09-25
tags:
  - architecture
  - public-surface
  - levels-of-abstraction
  - service-interface-layer
  - architectural-patterns
  - domain-facade
  - service-locator
  - configuration-provider
  - gateway-pattern
  - data-manager
  - csharp
section: pwi
topic: architecture-layers
language: csharp
pillar: architecture-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "We don't expose our privates"
- "Need-to-know basis"
- "Don't make me think"

---

## Intent

This chapter is the structural core of **Architecture with Intent (AWI)**, the overarching philosophy and the name for this whole body of work. AWI is the umbrella; under it sit the disciplines practised *within* the architecture: **Programming with Intent** (the code), **Verification with Intent** (verification at the boundary), and **Programming to Exceptions** (failure handling). This chapter is AWI's architectural heart, the system's shape, and the governing principle is the same one that runs through the code, now at the scale of the whole system: **structure communicates intent.**

**The bar this chapter is written to.** A model given only this chapter, starting from a clean slate, must be able to reconstruct the entire architecture scaffold of the reference implementation packaged with this system, without ever having seen it: the folder structure with classes in the right places, correct visibilities, and the creation seams. A rule such as "Managers are internal" is necessary but not sufficient; reconstruction also requires knowing which classes exist at all, which folder each lives in, what each one's constructor takes, which of those constructor arguments become fields and which are used once and discarded, and exactly which types the mechanics of C# visibility force to be public whether or not that was ever the intent. Every section below is written to answer that harder question, using the real ordering domain's own classes as the worked example throughout, not as decoration on top of a rule stated in the abstract.

---

## Layered Architecture Pattern

Solutions follow a layered architecture with strict access control to infrastructure components:

```text
┌─────────────────────────────────────────────────┐
│ Domain Facade (Public API)                      │
│ - The only public type(s) in the assembly       │
│ - Creates the ServiceLocator (production)       │
│ - Passes the ServiceLocator to the Manager       │
│ - Surfaces all domain operations                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Manager(s)                                      │
│ - PRIMARY ROLE: system-level orchestration      │
│ - Knows WHAT, delegates HOW to downstream       │
│ - Receives the ServiceLocator from the Domain Facade │
│ - Gets the ConfigurationProvider from the Locator│
│ - Extracts settings objects from the provider    │
│ - Creates downstream components                 │
│ - STOPS HERE: no Locator/provider below         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Engines / Processors / Extractors               │
│ - Receive only the specific values they need    │
│ - Completely autonomous                         │
│ - No access to the Locator or config provider   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Gateways (leaf nodes)                           │
│ - External service communication                │
│ - Clean, domain-owned boundary contract         │
└─────────────────────────────────────────────────┘
```

**Access rules:**

- **ServiceLocator**: used to resolve dependencies only by the Manager. The Domain Facade may accept it solely to pass the same instance into the Managers it constructs; it never invokes it.
- **ConfigurationProvider**: accessible only by the Manager, obtained from the ServiceLocator.
- **Settings objects and configuration values**: extracted by the Manager and passed downstream as explicit arguments.
- **Downstream components**: receive only the specific values they need, never the providers.
- **External callers**: reference only `public` types on the domain assembly's surface, never internal implementation types.

---

## The Public Surface Is a Language Feature

Python has no enforced visibility, so the Python chapter uses package exports and an `__init__.py` convention to *simulate* a public surface. **C# does not need a convention here, the compiler enforces it.** This is one of the places where the C# expression of the doctrine is genuinely stronger than the Python one.

The rules are therefore mechanical and compiler-checked:

- The Domain Facade is `public`. If the domain intentionally has no Domain Facade, the entry-point Manager is `public` instead.
- Public input and output DTOs, public composed types, and **all** domain exceptions are `public` by default.
- Everything else, internal Managers, engines, processors, extractors, gateways, validators, service locators, configuration providers, resource models, and support types, is `internal`.

**The surface rule is mechanical:** every type that appears in a `public` member signature on the Domain Facade or on a public Manager is itself `public`, and so is every domain exception a caller must catch. Nothing a caller can receive or must handle may be `internal`.

```csharp
// GOOD - the caller sees only the boundary
using Ordering;

var domainFacade = new DomainFacade(serviceLocator);
var orderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);
```

```csharp
// BAD - these types are internal; this does not compile, and that is the point
using Ordering.Managers;
using Ordering.Managers.Gateways;

var managerOrdering = new ManagerOrdering(serviceLocator);       // internal
var gatewayEmailService = new GatewayEmailService(baseUrl, 3, httpMessageHandler);   // internal
```

In Python a boundary violation is a convention breach that a reviewer must catch. In C# it is a build error. Review effort therefore shifts away from "did someone reach past the boundary" and toward the question the compiler cannot answer: **is the right set of types public in the first place?** An over-broad `public` surface is the C# defect; a deep import is not, because it cannot happen.

### The Mechanical Closure: How to Compute the Public Surface by Hand

Visibility in a domain shaped like the reference implementation is not a list a designer writes down; it is the closure of a single starting fact: **the Domain Facade's public members**. Walk the closure by asking, for every type reachable so far, "what types appear in *its* public constructors, public methods, and public properties?" and add each answer to the set. Stop when nothing new is added. Anything never reached by this walk is free to be `internal`; anything the walk does reach must be `public`, whether or not that was ever the design goal.

Trace it start to finish on the real ordering domain:

1. `DomainFacade` is `public` by the base rule (it is the entry point). Its constructor is `public DomainFacade(ServiceLocatorBase serviceLocator)`. `ServiceLocatorBase` therefore joins the closure and must be `public`, even though nothing about "the Service Locator is for swapping test doubles" demanded that on its own. It is public because it is a constructor parameter of a public type. Full stop.
2. `ServiceLocatorBase` is now public, so its own public members are inspected: `GetConfigurationProvider()` returns `ConfigurationProvider`, `CreateHttpMessageHandler()` returns `HttpMessageHandler` (a BCL type, not the reference implementation's concern), and `CreateLogger()` returns `LoggerBase`. `ConfigurationProvider` and `LoggerBase` both join the closure and must be `public`.
3. `ConfigurationProvider` is now public, so its own public methods are inspected: `GetOrderStoreSettings()`, `GetMessageBrokerSettings()`, `GetFulfillmentMessagingSettings()`, `GetEmailServiceSettings()`. Their return types, `OrderStoreSettings`, `MessageBrokerSettings`, `FulfillmentMessagingSettings`, `EmailServiceSettings`, all join the closure and must be `public`.
4. `DomainFacade.PlaceOrderAsync` and `RegisterCustomerAsync` name `OrderPlacementRequest`, `OrderPlacementLineItem`, `OrderPlacementResult`, and `CustomerRegistrationRequest` directly in their signatures. Each joins the closure and must be `public`.
5. Every domain exception the caller might catch joins the closure the same way: `OrderingException`, its two direct descendants `OrderingBusinessException` and `OrderingTechnicalException`, and every concrete leaf a Manager can let through uncaught (`OrderPlacementRequestValidationException`, `CustomerNotFoundException`, `CustomerNotActiveException`, `UnknownProductsException`, `OrderReferenceAlreadyExistsException`, `OrderReferenceConflictException`, `OrderStoreUnavailableException`, `CustomerRegistrationValidationException`, `CustomerAlreadyRegisteredException`, `EmailRegisteredToDifferentNameException`, `CustomerStoreUnavailableException`, and the rest) are `public`.
6. The base exception is itself public and exposes public properties: `LogEvent` (type `LogEventBase`), `Cause` (type `ExceptionCause`), and `ContextualDataByName` (type `ContextualData`), plus a public `Severity` enum. A caller catching any of these exceptions can read every one of those properties, so `LogEventBase` (and every concrete log-event token such as `OrderPlacementLogEvent`), `ExceptionCause`, `ContextualData`, and `Severity` all join the closure and are `public` too, even though none of them was ever meant as part of the domain's "business contract." They are public purely because the walk reached them. This is not a mistake to design around; it is the compiler being asked an honest question and giving an honest answer.

Now trace what the walk **never reaches**, and therefore what stays `internal`: `ManagerOrdering` and `ManagerCustomers` (never appear in any public signature; the Domain Facade constructs them itself). `DataManagerOrdering`, `DataManagerCustomers`, and every `CommandFactory`. `GatewayEmailService` (constructed and owned entirely inside the internal Manager). `PublisherBase` and its RabbitMQ/Service Bus adapters (created from configuration inside the Manager, never returned or accepted by anything public). `ComposerConfirmationEmail`, `MessageJsonSerializer`, and the resource models under `MessageComposers/ResourceModels/`. Every `Validators/` class. The concrete `ServiceLocator` production implementation, `LoggerApplication`, and `ConfirmationEmailMessage` are worth naming individually because they show the rule cuts both ways in the same family:

- `ServiceLocatorBase` is public (reached by the closure), but its production implementation `ServiceLocator` is *also* public, for a different, additive reason: the host's composition root constructs it directly (`new ServiceLocator(configuration, loggerFactory)`) before handing it to the Domain Facade, so `ServiceLocator` is itself a constructor argument the host code names by type. A concrete class the host must name to construct is public even when its abstract base already is.
- `LoggerBase` is public (reached by the closure through `CreateLogger()`), but its production implementation `LoggerApplication` stays `internal`, because nothing outside the domain ever constructs it directly; the Service Locator constructs it and hands back the already-public base type. The same asymmetry explains why `GatewayEmailService` and `PublisherBase`'s adapters stay fully internal top to bottom: neither their abstract shape nor their concrete implementation is ever named outside the domain.
- `ConfirmationEmailMessage`, the model `GatewayEmailService` sends to the email API, is `internal`, because it never appears in any public signature; it happens to double as its own JSON wire shape (every field is a string, and `JsonPropertyName` attributes state the wire contract directly on the record), but "looks like a DTO" is irrelevant to its visibility. Only reachability from the Domain Facade's public surface decides that.

**The one deliberate exception the closure would otherwise force.** Two exception types in the ordering domain, `OrderStoreContractViolationException` and `MessageBrokerReceiveException`, describe the downstream store or broker answering *outside its own contract*: a defect, not a documented business or technical outcome of calling the operation. Nothing in the Manager catches them by name, so a strict reading of the closure would make them public. They are marked `internal` anyway, as a deliberate override of the mechanical default: a caller is never handed a name for "the store broke its own promise" to catch specifically, because that is not a category anyone should write code against. If one of these escapes uncaught, an external caller still sees it as a plain `Exception`, unnamed and uncatchable by type, which is exactly the point. Every other leaf exception in the domain stays public by the ordinary rule; this pair is the two-item exception list, not a loophole to generalize from.

**Assembly boundaries.** The domain assembly is the boundary. Namespaces organise the interior; they do not restrict access. `internal` is scoped to the assembly, so splitting a domain across several assemblies for convenience will force types public that should not be, keep one domain in one assembly.

**Test access.** Acceptance tests drive the public Domain Facade like any other caller. Where a test genuinely needs an internal seam, a test Service Locator, for example, grant it with `InternalsVisibleTo` in the domain assembly rather than widening a type to `public`. Widening production accessibility to satisfy a test is a boundary leak with a test-shaped excuse.

**Physical placement and accessibility are independent.** Public DTOs and exceptions live deep in the folder tree (under `Managers/Models/` and `Managers/Exceptions/`) yet are `public`. They are **state, not behavior**, passed and thrown, not called, so the one-level-down communication rule does not constrain where they live. The same independence shows up a second time one level further in: the settings records `OrderStoreSettings`, `EmailServiceSettings`, `MessageBrokerSettings`, and `FulfillmentMessagingSettings` are `public` (reached by the closure through `ConfigurationProvider`), yet they live locally under `Managers/ConfigurationProviders/SettingsModels/`, not in the domain-wide `Models/` folder, because only the `ConfigurationProviders/` family ever constructs or consumes them. Namespaces may be flattened with a `namespace Ordering;` declaration on those files so callers are not taught the interior layout.

A note on the models themselves: these are **anemic** domain models, state only, immutable, no behavior, and that is a deliberate preference, not a compromise. Domain-Driven Design treats the anemic model as an anti-pattern; this doctrine embraces it. Behavior lives in stateless behavior classes; state lives in immutable records. The two are kept apart on purpose (Chapter 5).

---

## The Domain Facade

The Domain Facade is `public`, `sealed`, and, in every domain with one, the **only** public behavior type on the assembly. Its roles and responsibilities are narrow on purpose:

- **It forwards, it does not decide.** Every public method on the ordering domain's `DomainFacade` is a bare delegation to the relevant Manager and returns its result. `PlaceOrderAsync` awaits `_managerOrdering.PlaceOrderAsync(...)`. `RegisterCustomerAsync` awaits `_managerCustomers.RegisterCustomerAsync(...)`. There is no validation, normalization, conditional, business rule, or multi-step workflow in this class; those belong one level down in a Manager. A Domain Facade that makes a decision has stopped being a Domain Facade.
- **It owns construction of the Managers, once.** Its constructor takes the `ServiceLocatorBase` the host's composition root built and passes that same instance to every Manager it constructs: `_managerOrdering = new ManagerOrdering(serviceLocator); _managerCustomers = new ManagerCustomers(serviceLocator);`. The Domain Facade does not keep the locator as a field for later use; it hands it down once and is done with it. A complex domain's Domain Facade constructs one Manager per subsystem this way; a simple domain's Domain Facade constructs one.
- **It owns disposal at the top of the chain.** `DomainFacade` implements `IAsyncDisposable` and its `DisposeAsync()` disposes the Managers that own disposable resources. Disposal flows downward like every other dependency: Domain Facade disposes Manager, Manager disposes what it owns. This is teaching context in the current partial chapter set; the general disposal mechanics, idempotence, and complete ownership chain remain non-emitting until the Async Resource Lifecycle chapter is admitted.
- **It is the one type that names business capability, not layer mechanics.** Its public method names read as what the business asked for, `PlaceOrderAsync`, `RegisterCustomerAsync`, not as anything about validators, data managers, or gateways. A caller never needs to know those exist.

If a domain intentionally has no Domain Facade, a single-Manager service so small that a wrapper would add nothing, the Manager is the public entry point. It remains a Manager: it performs the same high-level validation and orchestration that Managers ordinarily perform and delegates implementation mechanics downward. It is not renamed or treated as a Domain Facade. A Manager never calls or coordinates another Manager; when coordination across Managers is required, a logic-free Domain Facade becomes the entry surface and delegates each operation to the relevant Manager.

This chapter owns the Domain Facade's role as the logic-free entry surface and the rule that a host may not reach past it or use host dependency injection to own the domain interior. Exact construction and disposal mechanics remain teaching-only until their dedicated C# chapters are admitted.

---

## The Service Locator: What It Creates and Why

The Service Locator is a narrow, purpose-built factory, not a general dependency-injection container. `ServiceLocatorBase` is `public` and `abstract`; the production `ServiceLocator` is its only implementation in the current domain, `public` because the host's composition root constructs it by name.

**The creation charter is exactly one sentence: the Service Locator creates only the things that must be swappable, directly or indirectly.** In the ordering domain that charter produces exactly three abstract members:

```csharp
public abstract ConfigurationProvider GetConfigurationProvider();
public abstract HttpMessageHandler CreateHttpMessageHandler();
public abstract LoggerBase CreateLogger();
```

Read each one against the charter:

- **`CreateHttpMessageHandler()`.** `GatewayEmailService` itself is never swapped; a test never substitutes a different gateway class. What must be swappable is what the gateway talks *through*: production hands back a real `SocketsHttpHandler`, a test hands back a Test Mediator's handler. Because the swap happens one level *inside* the gateway rather than at the gateway itself, `GatewayEmailService`'s own request-building, retry policy, and exception translation run as real production code in every test, only the wire differs. This is the pattern the charter is named for: the Locator provides the gateway with something swappable, so the gateway can stay real. Python's equivalent seam is the HTTP transport object handed to the client library; C#'s is `HttpMessageHandler`.
- **`GetConfigurationProvider()`.** Tests need to substitute in-memory configuration instead of the environment the host reads from. The Locator is the seam: a test-side `ServiceLocatorBase` implementation overrides this one method to hand back a `ConfigurationProvider` built from a test `IConfiguration`, and every Manager that asks the Locator for configuration gets the substituted values without knowing a substitution happened.
- **`CreateLogger()`.** The same reasoning again: production wires a logger over the host's `ILoggerFactory`; a test wires a capturing logger it can assert against afterward. The Locator is the one place that decision is made.

**Get the name right.** There is no `IConfigProvider` interface anywhere in this architecture. The concrete class is `ConfigurationProvider`, and it consumes .NET's own `IConfiguration` (from `Microsoft.Extensions.Configuration`) as its one constructor argument. `IConfiguration` is the .NET platform's raw key/value configuration abstraction; `ConfigurationProvider` is the reference implementation's own typed wrapper around it, composed from one settings provider per cohesive settings group (`SettingsProviderOrderStore`, `SettingsProviderMessaging`, `SettingsProviderEmailService`), each of which reads and validates its values eagerly at construction so a missing or malformed setting fails at startup, not mid-request. `ConfigurationProvider` is never swapped for a test double; it is real in every test run, reading from whatever `IConfiguration` the test's Service Locator handed it.

**How a Manager uses the Locator.** A Manager takes `ServiceLocatorBase` as a constructor parameter, calls what it needs immediately during construction, and does not keep the Locator itself as a field afterward. `ManagerOrdering`'s constructor calls `serviceLocator.CreateLogger()`, `serviceLocator.GetConfigurationProvider()` (extracting the settings it needs from the result), and `serviceLocator.CreateHttpMessageHandler()`, in each case immediately handing the *value* to whatever it constructs next; the `ServiceLocatorBase` parameter itself never becomes `private readonly` state. This is the concrete shape of the "STOPS HERE" rule in the layering diagram: the Locator's own lifetime inside the Manager is exactly one constructor call, and nothing downstream of the Manager ever sees it at all.

This chapter owns who may use the Service Locator and the domain's independence from host dependency injection. Only a Manager resolves dependencies through it. A Domain Facade merely transports the host-supplied instance into Manager constructors and neither invokes nor retains it. Configuration Provider (`cs16`) owns the typed provider contract and the rule that configuration access and Settings stop at the Manager. Broader Service Locator construction doctrine remains non-emitting until its dedicated C# chapter is admitted.

---

## The Service Interface Layer (Host Layer)

Above the Domain Facade sits the **Service Interface Layer (SIL)**, the host that interfaces the outside world with the system: an ASP.NET Core application, a Minimal API, a console application, a Worker Service, an Azure Function, a message consumer. Layers are conceptual, not deployment tiers.

Three rules keep the SIL swappable:

1. **The SIL does almost nothing.** Endpoints and controllers may bind transport input, convert framework or resource schemas, translate them to typed arguments, and forward to the Domain Facade. They contain no business logic and do not replace domain validation, validation lives in the system so that no host can lose it and no two hosts duplicate it.
2. **The domain is self-sufficient.** It bootstraps its own configuration and logging through the ServiceLocator path. The domain never depends on the host's dependency injection container or startup pipeline. A system that must be assembled by `IServiceCollection` registrations in `Program.cs` is coupled to ASP.NET Core as surely as if the logic lived in the endpoints. Registering the Domain Facade itself in the host container is fine; requiring the container to assemble the domain's interior is not.
3. **The portability test**: the system must be drivable from a plain console application, construct the Domain Facade, call methods, done. No `WebApplication`, no `IHost`, no `IServiceProvider`. If that works, nothing has silently coupled to the host. Use it whenever host coupling is in doubt.

Systems built this way migrate between hosts, web application to worker to function, without touching the domain, and the same code base serves multiple hosts simultaneously.

For finding ownership, Architecture Layers reports thin-host responsibility violations, a host that reaches past the Domain Facade or entry Manager, and host dependency injection that owns the domain interior. Service-Boundary Testing (`cs55`) owns controller transport parsing and mapping; Validation and Exception Handling (`cs09`) owns Manager/domain validation. This anchor-based split prevents the same host-boundary defect from being emitted twice.

---

## Manager Orchestration Principle

The Manager's primary responsibility is **orchestration at the system level**. It does not do the work; it directs the work. Every public method on a Manager should read like a high-level workflow description:

- The method knows **what** needs to happen.
- Each step delegates **how** to a downstream component.
- The Manager coordinates: step 1, step 2, step 3.

**Orchestration methods ideally have no conditionals.** Because of the exception-based programming philosophy, you do not check for error conditions, you let exceptions handle them. Conditionals in orchestration exist only for genuine business branching (draft processed one way, final another), never for defensive checks.

---

## Levels of Abstraction and Folder Structure

The folder structure of a project communicates architecture. The depth of a class in the folder hierarchy indicates its level of abstraction:

- **Top level**, high-level orchestration (Manager).
- **One level down**, major subsystem components.
- **Two levels down**, specific processing logic.
- **Third level and beyond**, implementation details (file I/O, HTTP, protocols).

### Levels, Not Subfolders

The governing unit is the **level**, folder depth as abstraction altitude, not literal parent-child nesting. The bounded internal-collaborator exception below permits same-depth calls starting at Level 6; it does not change the architectural ruler. Required spacing applies through ColumnReader (Level 5); from DiagnosticFactory (Level 6), do not add a class or folder solely to enforce literal spacing. Established responsibility owners must still not be bypassed. "One level down" means *the next level down*, in whatever folder sits at that depth; it does **not** have to be a subfolder of the calling class. A class at level 2 may talk to any class at level 3, whether or not that class is nested directly beneath it. The subfolder is simply the most common way a level-down relationship is realised; what actually governs is the depth. Classes are arranged in **levels**.

The same principle also runs the other way: an *extra* folder can exist purely for organisation without adding a level of its own. Data access in the ordering domain sits at `Managers/DataLayer/DataManagers/`, one folder deeper than `Managers/DataManagers/` might suggest. `DataLayer/` is not an abstraction level; it is a namespace grouping that keeps every data-access concern together under one name, the way a complex domain's internal Data Facade used to live there before it was removed from current practice (see "Simple vs Complex Systems" below). `DataManagerOrdering` is still Level 3, exactly one level below `ManagerOrdering`, regardless of the extra folder between them.

Picture a vertical ruler:

- **Level 1**, Domain Facade.
- **Level 2**, Manager.
- **Level 3**, everything the Manager depends on (Data Manager, gateways, validators, configuration providers, processors, LLM processors, publishers, service locators).
- **Level 4**, everything *those* depend on (a Data Manager's command factories; a gateway's resource models). In the example `Manager -> Engine -> Mapper`, the Mapper is at this level.
- **Level 5**, ColumnReader in `Manager -> Engine -> Mapper -> ColumnReader`. The one-level-down rule remains mandatory here.
- **Level 6 and deeper**, DiagnosticFactory and subsequent implementation levels. This is the fifth level when counting Manager as the first, or four levels below Manager. Literal folder-depth spacing becomes optional for eligible small internal collaborators here; an organisational wrapper folder does not advance the count.

### One Archetype Per Folder

By default a folder holds **one** kind of class, and is named (plural) for that kind: `Managers/` holds only managers, `Gateways/` only gateways, `Validators/` only validators. Different archetypes remain separate except for the bounded Level 6+ internal collaborators described below. Because a Manager *depends on* a ServiceLocator but is not one, the ServiceLocator does not live in `Managers/`, it lives in `ServiceLocators/`, one level down. The dependency direction is therefore visible as folder nesting: **what a class needs sits at the level below it.**

"One kind of class" is a statement about role, not about business area or direction. `MessageBrokers/` holds `PublisherBase`, `PublisherRabbitMq`, `PublisherServiceBus`, `SubscriberBase`, `SubscriberRabbitMq`, `SubscriberServiceBus`, and `MessageBrokerFactory` together, publish and subscribe are opposite directions of the same archetype, a broker adapter, the same way `Exceptions/` holds `OrderPlacementExceptions.cs` and `CustomerRegistrationExceptions.cs` together because both files hold the same archetype (exceptions), split by business area rather than by folder.

In C# the folder path and the namespace conventionally agree, so the namespace carries the same information as the folder. `Ordering.Managers.Gateways` tells you the archetype and the altitude without opening the file.

### Small Internal Collaborators and Exclusive Ownership

At Level 6 and deeper, small classes performing distinct parts of one internal operation may share a folder and call one another in a clear, acyclic direction. For example, beneath `Manager -> Engine -> Mapper -> ColumnReader`, a `DiagnosticFactory` at Level 6 may use a cohesive diagnostic formatter at that same level. The Level 5 ColumnReader cannot call a Level 5 diagnostic factory, and the Level 4 Mapper still cannot call a Level 4 ColumnReader. Manager, Engine, Mapper and ColumnReader retain the general prohibition on peer calls. Moving an orchestrator into a deeper folder does not make it an eligible internal collaborator.

The exception concerns cohesive implementation responsibilities within an established owner. It does not permit an upstream call, a cycle, a dependency that skips a required level, or an unrelated component reaching past the class responsible for an operation to use its implementation directly. Merely being small, sharing a folder, or having no cycle is insufficient. Folder names still describe the operation's owning archetype; do not create a general `Helpers/` or `Shared/` collection.

Within this eligible lower-level scope, a class used exclusively by one caller may instead be declared as a separate, non-nested type in that caller's source file. This communicates that the companion belongs to that caller and is not intended for unrelated consumers. It is optional: a separate file remains valid. Neither nested classes nor one file per type are required to express this relationship. Source-file placement communicates intent; it does not itself prove exclusive use. Review the supplied callers and responsibilities, and do not infer an outside caller or a cycle from missing source. Co-locating prohibited peers in one file does not exempt their calls.

These are explicit exceptions to literal folder-depth and one-archetype placement. Eligible collaborators need no extra folder for each internal call, but remain at Level 6 or deeper. Other public-surface, naming, namespace and responsibility rules still apply.

### The Canonical Domain Tree

```text
Ordering/                                  # one domain, one assembly
    DomainFacade.cs                        # Level 1 - the only public behavior type
    Managers/
        ManagerOrdering.cs                 # Level 2 - Managers/ holds ONLY managers
        ManagerCustomers.cs                # Level 2 - a second Manager under one Domain Facade
        DataLayer/                         # organisational grouping, not a level of its own
            DataManagers/                  # Level 3 - data access orchestration
                DataManagerOrdering.cs
                DataManagerCustomers.cs
                CommandFactories/          # Level 4 - builds SqlCommands and parameters
                    CommandFactoryOrders.cs
                    CommandFactoryCustomers.cs
                    SqlParameterAdder.cs
        ServiceLocators/                   # Level 3
            ServiceLocatorBase.cs
            ServiceLocator.cs
        ConfigurationProviders/            # Level 3 - named for the archetype, never bare "Configuration"
            ConfigurationProvider.cs
            SettingsModels/                # settings records the provider returns (public, locally placed)
                OrderStoreSettings.cs
                EmailServiceSettings.cs
                MessagingSettings.cs
            SettingsProviders/             # Level 4 - one settings group each
                SettingsProviderOrderStore.cs
                SettingsProviderMessaging.cs
                SettingsProviderEmailService.cs
                SettingsSource.cs
                RequiredSettingReader.cs
        Gateways/                          # Level 3
            GatewayEmailService.cs
        MessageBrokers/                    # Level 3 - publisher and subscriber adapters, one archetype
            PublisherBase.cs
            PublisherRabbitMq.cs
            PublisherServiceBus.cs
            SubscriberBase.cs
            SubscriberRabbitMq.cs
            SubscriberServiceBus.cs
            MessageBrokerFactory.cs
        MessageComposers/                  # Level 3 - builds outbound message content
            ComposerConfirmationEmail.cs
            ComposerFulfillmentNotification.cs
            MessageJsonSerializer.cs
            ResourceModels/                # Level 4 - a composer's own private wire shape
                FulfillmentNotificationResource.cs
        Validators/                        # Level 3
            ValidatorOrderPlacementRequest.cs
            ValidatorCustomerRegistrationRequest.cs
            PrimitiveValidators/           # Level 4
                ValidatorString.cs
                ValidatorWholeNumber.cs
        Loggers/                           # Level 3
            LoggerBase.cs
            LoggerApplication.cs
        Models/                            # anemic, immutable domain records (public where reached)
        Exceptions/                        # base plus one file per business area (public where reached)
```

Folder names describe the archetype and the domain purpose. There is no `Helpers/`, `Utilities/`, `Common/`, `Shared/`, `Infrastructure/`, or `Misc/`, those are the tells of a class that dodged the altitude question. This ordering domain has no `Engines/`, `Processors/`, or `LlmProcessors/` folder today because nothing in it currently needs a sub-manager step or an in-memory or LLM worker; the vocabulary for those archetypes still applies the moment a domain grows one (see "Archetype Vocabulary" below), it is not missing from the *language*, only from this particular domain's current tree.

### Simple vs Complex Systems

- A **simple** system has a **single Manager**. This is the default and the norm, a service is generally one business Manager plus one Data Manager. We do not build monoliths.
- A **complex** system has **multiple Managers** under the Domain Facade, each owning a distinct subsystem. The ordering domain is already this shape in a small way: `ManagerOrdering` and `ManagerCustomers` sit side by side under one `DomainFacade`, each with its own Data Manager, neither one calling the other. Managers never coordinate other Managers; needing that coordination is the signal that the Domain Facade is required.

Historically a complex system also had an internal **Data Facade** fronting several Data Managers. That internal Data Facade has been **removed** from current practice: the Manager now talks **directly to a Data Manager** one level down. The Domain Facade at the top remains, only the *internal data* facade is gone. Data managers live in `Managers/DataLayer/DataManagers/`; there is no data-facade class anywhere in the tree, the `DataLayer/` folder is namespace grouping only, as covered under "Levels, Not Subfolders" above.

### Data Manager: Roles and Responsibilities

Data Manager Design (`cs29`) is the dedicated owner of production Data Manager behavior. This section retains only the architecture context needed to place the Data Manager one level below its Manager and to keep every store conversation behind that seam.

- **It owns the entire store conversation for its slice of the domain.** `DataManagerOrdering` owns every order-store access; `DataManagerCustomers` owns every customer-store access. Neither reaches into the other's tables, and nothing above the Manager ever talks to the store directly.
- **One round trip per operation.** Each public method opens exactly one connection, executes exactly one command, and lets ADO.NET's connection pooling reclaim the connection immediately afterward, the classic using-connection pattern. `PlaceOrderAsync` is one `ExecuteReaderAsync` call reading two result sets (the order header and its lines) in a single round trip, not two separate queries. The Data Manager holds no disposable state of its own between calls and therefore needs no entry in the Domain Facade-to-Manager disposal chain.
- **It translates store faults into domain exceptions, in one place.** The stored procedures raise coded errors, `THROW 50xxx` with a stable error number, sometimes with a pipe-delimited detail. Translation matches on that **stable error number**, never on engine-formatted message text, so a wording or locale change inside SQL Server can never silently break translation. A single `switch` expression keyed on the number produces one specific business or technical exception per case, each with its own message and `Reason`; whatever the switch does not recognise falls through to the generic "store unavailable" exception rather than guessing.
- **It delegates command construction downstream, one level below itself.** `DataManagerOrdering` never builds a `SqlCommand` or adds a `SqlParameter` directly; `CommandFactoryOrders` builds the command and names its parameters exactly as the stored procedure's own parameters are named, and `SqlParameterAdder` further factors the individual parameter-adding calls one level below that. This is the same one-level-down discipline every other archetype follows, applied to data access.
- **Its abstraction stays business-shaped even though its implementation is not.** See "Clean Abstractions at System Seams" immediately below for the general form of this rule, which the Data Manager and the Gateway share.

### Clean Abstractions at System Seams

Classes at owned system seams speak for the business system, not for the technology behind them. A Data Manager presents the data operations the domain needs; its concrete implementation may use SQL Server, Informix, Oracle, Postgres, or another store. A Gateway presents the downstream capability the domain needs; its concrete implementation may use Azure, Amazon, or another provider. Provider names, SDK types, resource models, status codes, and technology-shaped method signatures stay behind that seam.

The goal is a clean abstraction. Changing the implementation while preserving the same business capability must not change the business-side conversation with the Data Manager or Gateway. That replacement may be:

- **runtime selection**, such as choosing among several payment Gateways for each transaction according to amount or another business rule;
- **deployment-time selection**, such as composing `PublisherRabbitMq` or `PublisherServiceBus` from environment configuration through `MessageBrokerFactory`, or Azure or AWS storage classes the same way; or
- **a one-time migration**, such as replacing SQL Server with Postgres from the next release onward.

Abstract bases, factories, configuration, or runtime dispatch may support those choices, but they are mechanisms rather than the governing intent.

[Clean Abstractions Around Libraries](/writing/clean-abstractions-around-libraries/) develops this seam with Gateways, Data Managers, Configuration Providers, message brokers, and an in-process library example. [Intentional Model Design](/writing/intentional-model-design/) explains why the domain models crossing these seams must express their own requirements clearly. The [Validation and Exception Handling chapter](/pwi/validation-exception-handling/csharp/) covers the checks and failure translation at those doors.

### Gateways: Roles, Responsibilities, and Self-Containment

A gateway is **constructed and owned by the Manager**, the construction owner, and lives in a **single `Gateways/` folder under `Managers/`**, never duplicated elsewhere in the tree. The Manager **passes the gateway by reference** down to any engine or LLM processor that needs it; an Engine in turn passes it to its own LLM processors. This is passing what you were handed, not folder navigation: the receiver uses what it was given, so passing a gateway down neither violates the one-level-down rule nor creates a second `Gateways/` folder beneath the consumer. An Engine owns its own processors and LLM processors, but **not** gateways, those always come from the Manager's one gateways folder. Along with the gateway, the Manager passes down the **configuration values** a downstream engine or processor needs, the data, never the `ConfigurationProvider` itself, which stops at the Manager.

**Self-containment is the discipline that lets a gateway be deleted as one unit.** A gateway's folder is meant to be a deletable unit: gateway-specific exceptions, mappers between domain models and the downstream service's own models, and anything else pertinent only to talking to that one service live in subfolders under the gateway's own folder. If the downstream service is dropped tomorrow, deleting that one folder should remove every trace, no residue anywhere else in the system.

**The test for what nests under the gateway versus what lives in the domain-wide `Exceptions/` or `Models/` folder is the same test that exempts Models and Exceptions from the one-level-down rule in the first place: does anything outside the gateway ever need to name this type?** If the answer is no, a resource model that describes only the external service's private wire shape, or a mapping type nobody but the gateway constructs, it is gateway-private and nests under the gateway, staying `internal` so nothing outside ever depends on it. If the answer is yes, a Manager one level up needs to catch it by name, or a human reviewer needs to see every failure category the domain can produce in one place, it graduates to the domain-wide, cross-cutting `Exceptions/` or `Models/` folder for the same reason every other public exception and model lives there.

The ordering domain's own `GatewayEmailService` shows both halves of that test in a single, real gateway:

- It needs **no resource-model subfolder**, because the email API's wire shape and the domain's own `ConfirmationEmailMessage` record are identical in shape: every field is already a string, and `JsonPropertyName` attributes on the domain record state the wire contract directly, so there is no typed-to-loosey mapping left to make explicit. When a downstream service's wire shape genuinely diverges from the domain's own shape, exactly this kind of file is what belongs in a subfolder beside its owner, `MessageComposers/ResourceModels/FulfillmentNotificationResource.cs` is the domain's real example of that pattern, one level below the composer that owns it, holding money and timestamps as strings while the domain model above it keeps them as `decimal` and `DateTime`.
- Its failure vocabulary (`EmailServiceUnavailableException`, `EmailServiceTooBusyException`, `EmailServiceRequestRejectedException`) answers yes to the naming test: `ManagerOrdering` catches all three by name in a single `when` pattern to decide when to absorb a failed send behind a Pending record. Because the Manager one level up must name them, they live in the domain-wide `Managers/Exceptions/` folder alongside every other business area's exceptions, not nested under `Gateways/GatewayEmailService/`, the same way the domain-wide `Models/` folder, not a per-consumer subfolder, is where every type any outside caller might need to name belongs.

The full contract for a gateway's exact roles, responsibilities, and the mapping discipline between domain and provider models is the Gateway Design Pattern (cs14); this section states only what self-containment means and how to decide what belongs inside the gateway's own folder.

### Archetype Vocabulary

Downstream classes fall into two families. Knowing which family a class belongs to is how you know its name and its folder.

**Orchestrators**, know *what*, delegate *how*:

- **Manager**, the top-level orchestrator under the Domain Facade. A public method reads as a high-level workflow of a few steps; each step delegates its *how* to a downstream component.
- **Engine**, a **subordinate orchestrator**, a sub-manager. When one of a Manager's steps is itself complex, a single step at the Manager's altitude that is really many steps at a lower altitude, the Manager delegates that step to an Engine. The Engine then orchestrates *exactly as a Manager does*: it breaks the step into its own sub-steps and drives processors and LLM processors one level below it, LLM calls and all. The Manager hands the Engine the **gateways and configuration values** it needs; the Engine owns its processors and LLM processors but **passes those same gateways down** to them rather than owning a gateways folder of its own. It differs from a Manager only in being **subordinate by placement and duty**, not in kind. An Engine is an orchestrator, **not** a worker, do not conflate it with a processor. (The name is historical: it arose as the word for a sub-manager in a system where "Manager" was already taken.) Neither Manager in the ordering domain currently needs one; every step in `PlaceOrderAsync` and `RegisterCustomerAsync` is simple enough to stay directly in the Manager.

**Workers**, do the work, return the result:

- **Processor**, an in-memory worker: code logic, in-memory data, possibly the file system, but **not** the LLM. A processor **may** use extractors one level below it.
- **LLM Processor**, a worker whose entire job is the large language model: it sends the prompt, encapsulates retry logic and whatever else the call requires, and returns a domain model or the content that came back. It does **not** use extractors, working the LLM is its only responsibility.
- **Extractor**, a focused low-level worker a Manager, Engine, or Processor uses for one specific extraction task, placed one level below its consumer. LLM processors do not use extractors.

The dividing axis is orchestration versus work: Manager and Engine orchestrate; Processor, LLM Processor, and Extractor do the work. The Engine is the one that surprises people, it sits downstream like a worker but behaves like a Manager.

### "Helper" and "Utility" Are Not in the Vocabulary

The words **helper** and **utility** do not exist in this architecture, not as a folder name, and **not as a class-name suffix**. There is no `Helpers/` folder and no `XyzHelper` or `XyzUtility` class. C# adds two more tells of the same avoidance: a `Common` or `Shared` project, and a `static class XyzUtils` full of unrelated methods. A class that feels like a "helper" is really an extractor, a processor, or a validator, something with a real job and a real name. The words may be fine in casual conversation ("just write a helper"), and the team hears them as shorthand; they never reach the code. A class or folder named for helping is a class that never answered *what it actually does*.

### Communication Rules and Bounded Exceptions

1. **Calls in the mandatory region descend ONE level.** Through ColumnReader (Level 5), a class calls the next architectural level without skipping an intermediate level. Use the component responsible for that intermediate operation. From DiagnosticFactory (Level 6), eligible small internal collaborators have optional folder-depth spacing; do not invent an extra class or folder solely for spacing, and do not bypass an established responsibility owner.

2. **Classes NEVER talk upstream.** Lower-level components do not call classes in folders above them. They do their specialised work and return results. This maintains dependency direction.

3. **Peers remain independent through Level 5.** Managers (Level 2), their immediate downstream components (Level 3), Mapper (Level 4), and ColumnReader (Level 5) do not call their peers. At Level 6 and deeper, only the bounded internal collaboration described above is exempt. Otherwise, extract shared functionality one level down for each peer to access independently. Existing narrow exceptions remain: an Engine, Processor or LLM Processor may invoke the exact Gateway instance constructed and supplied by its Manager; references to state-only models, exceptions and settings are not behavior calls.

### The Dependency Law, Resolved

Ordinary dependencies descend **one architectural level**. Eligible small collaborators at Level 6 and deeper may also depend on one another at the same depth within their established owner, in a clear acyclic direction. The existing Manager-supplied Gateway exception remains narrow. Upstream calls and skipped required levels remain defects; spacing alone is optional from Level 6 without waiving established responsibility ownership. At protected levels, extract shared capability one level below both peers instead of introducing a sideways dependency.

The ordering domain lives this resolution rather than merely stating it. `ManagerOrdering` and `ManagerCustomers` are siblings under one `DomainFacade`, and both need the order store's connection string. Neither manager asks the other for it, and neither one reaches sideways. Each independently calls `serviceLocator.GetConfigurationProvider()` and then `configurationProvider.GetOrderStoreSettings()` in its own constructor, the identical call, made twice, once per sibling, both landing on the same `ConfigurationProvider` one level below them both. That duplication of the *call* is the resolution working correctly: the shared capability lives one level down, and each sibling depends on it there, rather than either sibling becoming a path to the other.

### Why These Rules Matter

- **Violation symptoms**: circular dependencies, unexpected breakage, difficult testing, inability to understand parts in isolation.
- **When the rules are followed**: architecture is visible in the folder structure, refactoring is safe, and new team members navigate by understanding the hierarchy.
- **If a class seems to need communication that violates these rules**, it signals an abstraction problem requiring refactoring.

### Circular Dependencies in C#

C# splits this concern in two, and only one half is a review concern.

**Between assemblies**, the compiler forbids circular project references outright. That half needs no rule; the build fails.

**Within an assembly**, namespaces impose no restriction at all, two types in sibling namespaces may freely reference each other and the code compiles. The compiler will not help, but the cycle is a symptom rather than a separate correction unit: review and report each illegal edge under the fundamental rule it violates. Prohibited sideways edges, including edges in a same-depth cycle among otherwise eligible collaborators, belong to the no-sibling rule; upward edges belong to no-upstream, and skipped required levels or established-owner bypass to one-level-down. Do not add a second circularity finding for the same dependency. A mutual dependency never qualifies for the internal-collaborator exception. Extract the common capability one level below the peers and let each depend downward on it independently.

---

## Boundaries With Other Chapters

Several ideas touched on in this chapter are owned by name elsewhere in this corpus rather than repeated here:

- **The Gateway's exact roles and responsibilities**, working for the business, keeping a clean domain-shaped surface, and containing provider coupling, mapping, and failure translation, belong to the Gateway Design Pattern (`cs14`). Replacement of one production implementation by another is a consequence of that clean seam, not a testing technique. Acceptance-test transport Spies and Test Mediators are separately owned by the testing strategy chapter (`cs50`) and the test mediators and spies chapter (`cs54`).
- **The Domain Facade's exact construction and disposal mechanics** remain teaching-only until their dedicated C# chapters are admitted. This chapter owns its logic-free entry-surface role, its relationship to Managers, and the host rule against reaching past it.
- **How the ServiceLocator is itself constructed, and how the ConfigurationProvider validates and returns strongly typed settings** belong to Service Locator and Configuration (`cs12`) and Configuration Provider (`cs16`); this chapter states only what the Locator is for and which layers may hold a reference to it or the configuration provider.
- **Whether an individual class is `internal` or `public` by default, and the full behavior/state separation behind anemic domain models** belong to Class Design (`cs05`); this chapter states only which architectural layer's types must sit on the public surface for the surface to work at all, and how to compute that surface by hand.
- **How narrowly a downstream component's own method signature should be scoped** belongs to the Need-to-Know Principle (`cs02`); this chapter governs only which layer may hold a reference to the ServiceLocator or the configuration provider, not how a signature below that is shaped.
- **Transport parsing and mapping** at a controller boundary belongs to Service-Boundary Testing (`cs55`), while Manager/domain validation belongs to Validation and Exception Handling (`cs09`). This chapter owns the architectural rule that the host does not replace domain validation.

---

## Review Questions

- Is the ServiceLocator accessible only to the Domain Facade and the Manager, and the configuration provider accessible only to the Manager?
- Does every type that appears in a `public` Domain Facade or Manager signature, and every domain exception a caller must catch, sit on the public surface, with everything else `internal`?
- Can you walk the mechanical closure by hand, starting from the Domain Facade's own public constructor and methods, and name every type it forces public, including ones (log event tokens, contextual data, a settings record) that were never meant as part of the domain's business contract?
- Is there a documented, deliberate reason for any exception marked `internal` despite being reachable from an uncaught catch path, rather than an accident of the closure being ignored?
- Where a test needs an internal seam, is it granted through `InternalsVisibleTo` rather than by widening a type to `public`?
- Does the domain stay in one assembly, rather than being split in a way that forces types `public` for convenience?
- Does every public Domain Facade method forward to exactly one Manager call with no decision-making of its own, and does the Domain Facade construct its Managers once without retaining the ServiceLocator as a field?
- Does a Manager use the ServiceLocator only at construction, taking what it needs and discarding the locator reference itself, never storing it as a field?
- Does the Service Interface Layer do nothing but bind transport input, translate it, and forward to the Domain Facade, with no business logic and no substitute for domain validation?
- Would the system still run if driven from a plain console application, with no host framework or DI container assembling the domain's interior?
- Does a Manager's public method read as a short sequence of named orchestration steps, with conditionals reserved for genuine business branching rather than defensive checks?
- Does a class's folder depth match its abstraction level, and does its namespace agree with its folder, independent of any organisational wrapper folder that adds no level of its own?
- Does each folder communicate its owning archetype, with mixed implementation roles limited to eligible cohesive Level 6+ collaborators?
- Is a Data Manager's or Gateway's seam stated entirely in business-shaped terms, with provider names, SDK types, and protocol vocabulary staying behind the seam?
- Does a Data Manager complete each operation in exactly one round trip, translate store faults by stable error number rather than message text, and delegate command construction to a factory one level below it?
- Would replacing a database or downstream-service implementation change the business-side conversation with its Data Manager or Gateway? (It should not.)
- Is a gateway constructed once by the Manager and passed by reference downstream, rather than constructed again by a consumer?
- For anything nested under a gateway's own folder, would deleting that folder remove every trace of the downstream service, and does nothing outside the gateway name the nested type directly?
- When protected peers need shared capability, does each depend downward on it independently; and do deeper same-depth collaborators satisfy the bounded Level 6+ exception?
- Do ordinary calls descend one level, with same-depth calls limited to the stated exceptions and no upstream calls or cycles?
- Are the illegal sideways, upward, or skipped-level edges that form an intra-assembly cycle caught under their fundamental dependency rules without a duplicate circularity finding?

---

## Code Review Checklist

When reviewing code for architecture compliance, verify:

### Layer Access
- [ ] Only Managers invoke the ServiceLocator; a Domain Facade may pass the same instance into Manager constructors but neither invokes nor retains it
- [ ] `ConfigurationProvider` is accessed only by the Manager
- [ ] Downstream components (engines, processors, gateways) receive explicit values, not providers
- [ ] No type below the Manager has access to the ServiceLocator or the configuration provider
- [ ] A Manager takes the ServiceLocator only as a constructor parameter and does not retain it as a field once construction completes

### Public Surface
- [ ] The Domain Facade (or the entry-point Manager) is the only `public` behavior type
- [ ] Every type in a `public` Domain Facade or Manager signature is itself `public`, traced by walking the mechanical closure rather than by inspection alone
- [ ] Every domain exception a caller must catch is `public`; any exception left `internal` despite being reachable is a deliberate, documented "should never happen" signal, not an oversight
- [ ] Everything else is `internal`; nothing is `public` "just in case"
- [ ] The domain is one assembly; it is not split in a way that forces types public
- [ ] Tests reach internal seams via `InternalsVisibleTo`, not by widening production accessibility
- [ ] A settings record or other locally-scoped public type is placed near its owner rather than moved into a domain-wide folder just because it is `public`

### Domain Facade
- [ ] Every public Domain Facade method forwards to exactly one Manager call, with no validation, normalization, or business branching of its own
- [ ] The Domain Facade constructs its Managers once, from the ServiceLocator it was given, and disposes them in the same order responsibility flows downward

### Service Locator
- [ ] The Service Locator creates only what must be swappable, directly or indirectly, never a component that is itself swapped as a whole (a gateway, a data manager)
- [ ] There is no `IConfigProvider` interface; the concrete `ConfigurationProvider` consumes .NET's `IConfiguration` directly
- [ ] The HTTP message handler (or equivalent transport primitive) is provided by the Locator specifically so the component that uses it runs as real production code in every test

### Manager Design
- [ ] Manager methods orchestrate, they describe WHAT, not HOW
- [ ] Manager methods read like high-level workflow descriptions
- [ ] Conditionals exist only for genuine business branching
- [ ] No defensive checks or error-condition handling in orchestration

### Folder Structure and Communication
- [ ] Through ColumnReader (Level 5), ordinary calls descend one architectural level; from DiagnosticFactory (Level 6), eligible small internal collaborators have optional folder spacing, including same-depth calls, without bypassing an established owner
- [ ] No class calls upstream
- [ ] Managers, immediate downstream components, Level 4 and Level 5 peers remain independent; qualifying Level 6+ collaborators stay cohesive and acyclic within their established owner
- [ ] Folder depth reflects abstraction level, and namespaces agree with folders; an organisational wrapper folder (such as a `DataLayer/` grouping) does not itself count as a level
- [ ] Folders communicate their owning archetype; eligible Level 6+ internal collaborators may share a folder, and an exclusive companion may optionally share its sole caller's source file as a separate non-nested type
- [ ] A complex Manager step is delegated to an Engine, not crammed into the Manager or mislabeled as a processor
- [ ] LLM processors do not use extractors; only Managers, Engines, and in-memory Processors do
- [ ] No `Helpers/`, `Utilities/`, `Common/`, `Shared/`, `Infrastructure/`, or `Misc/` folders, no `XyzHelper`/`XyzUtility` types, and no grab-bag `static class XyzUtils`
- [ ] `ConfigurationProviders/` (not bare `Configuration/`); `ServiceLocators/` folder; `Models/` and `Exceptions/` under `Managers/`, not at the domain top level
- [ ] Data access is a Data Manager one level below the Manager, no internal Data Facade
- [ ] A Data Manager completes each operation in one round trip, translates store faults by stable coded error number, and delegates command construction to a factory one level below it
- [ ] Data Manager and Gateway seams expose business-shaped operations/models; database, provider, SDK, resource, and protocol vocabulary stays behind the concrete implementation
- [ ] Replacing a database or downstream-service implementation does not change the business-side conversation with its Data Manager or Gateway
- [ ] Gateways are constructed once by the Manager in a single `Gateways/` folder and passed by reference to engines and LLM processors; the Manager passes configuration *values* downstream, never the provider
- [ ] Gateway-private types (a resource model, a mapper, an exception nothing outside the gateway ever needs to name) nest under the gateway's own folder; anything a Manager or reviewer must name by type lives in the domain-wide `Models/` or `Exceptions/` folder instead

### Service Interface Layer
- [ ] Host endpoints only bind and translate transport data and forward to the Domain Facade, no business logic, and no replacement for domain validation
- [ ] The domain does not depend on the host's DI container or startup pipeline
- [ ] The system passes the portability test, drivable from a plain console application with no `IHost` or `IServiceProvider`

### Dependency Direction
- [ ] Dependencies flow toward lower-level responsibilities; permitted same-depth internal collaboration has a clear direction and no cycle
- [ ] No illegal sideways, upward, or skipped-level dependencies; when those edges form an intra-assembly cycle, each edge is reported under its fundamental rule without a duplicate cycle finding
- [ ] Lower-level components are autonomous and do not depend on higher-level ones
