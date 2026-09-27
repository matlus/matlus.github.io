---
title: "Architecture with Intent"
description: "The Domain Facade exposes business operations while internal classes call one level down. Managers orchestrate workflows and own configuration and service boundaries."
datePublished: 2012-10-29
dateModified: 2026-09-27
tags: ["architecture", "public-surface", "levels-of-abstraction", "naming", "method-design", "domain-facade", "service-locator", "configuration-provider", "gateway-pattern", "data-manager", "architectural-patterns", "design-patterns"]
topic: architecture-layers
---

Architecture with Intent makes the shape of an application explain how it works. The public entry point names the business operations. Managers show their steps. Each class delegates to the level below it, and the folder structure makes those levels visible.

<!-- diagram:start domain-architecture -->
<figure class="article-diagram article-diagram--raster">
<a href="/images/diagrams/domain-architecture.png" aria-label="Open the full-size domain architecture diagram">
<img class="article-diagram__image" src="/images/diagrams/domain-architecture.webp" width="1774" height="887" loading="lazy" alt="Domain Facade at level 0 calls one Manager at level 1. The Manager calls nine direct collaborators at level 2: Validator, Configuration Provider, Gateway, Publisher, Emailer, Processor, LLM Processor, Engine, and Data Manager. The Engine calls its own LLM Processor and Processor at level 3. The Data Manager calls Command Factory, Model Adapter, Data Record Adapter, and Database. Gateway calls Web API Services, Publisher calls Message Brokers, and Emailer calls Email Services." />
</a>
<figcaption>The Domain Facade is the application entry point. The Manager orchestrates its direct collaborators; the Engine and Data Manager each call their own subordinate classes. Gateway, Publisher, and Emailer reach their respective external services, and the Data Manager reaches the database directly. Both LLM Processors use the same Gateway instance owned by the Manager.</figcaption>
<p class="article-diagram__full"><a href="/images/diagrams/domain-architecture.png">Open full-size diagram</a></p>
</figure>
<!-- diagram:end domain-architecture -->

The diagram shows one Manager and one Data Manager to keep the relationships clear. An application can have several of each. The service interface layer and Service Locator are omitted from the drawing; the creation responsibilities of the Service Locator are explained below.

## The Domain Facade is the entry point

The Domain Facade presents the operations the application offers. Each public method simply forwards the call to the appropriate Manager and returns its result. The facade has no business logic, conditional statements, validation, or exception handling.

In C#, it is typically the only public behavior class in the domain assembly. Managers, Engines, Processors, Gateways, Data Managers, and their subordinate classes are internal.

The public surface also includes the input and output models in the Domain Facade's method signatures, and the system's domain exceptions. A caller must be able to construct a request, understand a result, and catch a failure. Any additional types exposed through public constructors, members, or those models must also be public: C# requires the types in a public contract to be accessible to its callers.

A separate test assembly uses that same public surface. With the implementation classes kept internal and without granting the test assembly access to those internals, a test invokes a business operation through the Domain Facade. It cannot call a Manager or Processor directly. The architecture makes the application's entry point the testing boundary.

For the testing consequences of that choice, see [Functional Acceptance Testing at the Boundary](/writing/functional-acceptance-testing-at-the-boundary/).

### Where the facade came from

The Domain Facade originated in larger applications that served several areas of an enterprise. These applications contained multiple domain-based Managers. The facade gave outside consumers one place to call a business operation and forwarded each call to the appropriate Manager. Consumers did not have to choose a Manager or know how the application was divided internally.

Some business operations required a sequence across those Managers. The facade called the first Manager, passed its result to the second, and returned the second result or a combination of both results. For those operations alone, the Domain Facade orchestrated the sequence. It still contained no conditional statements or business decision logic.

That cross-Manager orchestration belongs to the historical monolithic arrangement. In the smaller services I build today, the Domain Facade generally forwards each call to a Manager. The workflow orchestration is visible in that Manager.

## Levels are visible in the folder structure

The Domain Facade is level 0. Managers are level 1. A Manager's direct collaborators occupy level 2. The Engine's Processors and the Data Manager's subordinate classes occupy level 3.

A level describes an architectural position expressed by the folder structure. A collaborator does not have to live in a folder directly beneath its caller's folder. It can live in another folder at the required depth. The directory layout identifies the level; the responsibilities determine the conversation.

The communication rule is simple: classes call one level down. Siblings do not call each other, and a class does not skip a level to reach another class's subordinate.

The Manager can call its own LLM Processor or its Engine. When work belongs to the LLM Processor under that Engine, the Manager calls the Engine, and the Engine calls its LLM Processor. The Manager does not reach through the Engine.

If two siblings need the same behavior, extract that behavior into a clearly named class one level below them. Both can then call it. Needing to call sideways is a sign that the abstraction needs to be separated.

The external destinations in the diagram identify system boundaries. A Web API Service or database is outside the application's folder hierarchy.

## Give each responsibility a specific name

Folders and classes have names that explain what belongs in them. Names such as `Utils`, `Utilities`, `Mappers`, and `Common` are not used. A generic container gives the next person little guidance about what should go into it.

Name a class for the responsibility it performs and the domain it serves. An Order Model Adapter, for example, names a particular adaptation responsibility. A `Mappers` folder can accumulate unrelated conversions with no clear owner.

The labels in the diagram identify architectural roles. In an application, a Manager, Engine, Processor, or Gateway also has a name tied to its business responsibility. Method names use the domain's vocabulary throughout.

## Public methods show the steps

A Manager orchestrates. It hands each part of the work to the class responsible for it. Reading its method should reveal the business workflow: validate the request, obtain the required information, perform the operation, publish the result, or send the confirmation, according to that feature's requirements.

The same principle applies at every level. A public method that performs several steps shows those steps through calls to downstream classes or private methods. The details live in those collaborators and private methods.

A method should let a reader understand what happens at its level without having to work through the implementation of every step. Following a call takes the reader into the detail needed for that step.

An Engine handles a more involved part of a workflow. The Manager delegates that part to the Engine, and the Engine orchestrates its own Processors or LLM Processors. This keeps the Manager's sequence readable while giving the complex operation a clear owner.

## Creation, configuration, and lifetime stay with the Manager

The Service Locator creates the classes whose construction needs that boundary. Only the Manager uses it to obtain the Configuration Provider and create the Gateways. Those are the main components the Manager creates through the Service Locator.

The Service Locator and Configuration Provider stay at the Manager's level. Neither is passed downstream. A class receives the particular settings or property values it needs, with their types already established.

For example, an LLM Processor can receive the model settings relevant to its operation. It receives no Configuration Provider to consult and no Service Locator from which to request additional capabilities.

The Manager creates a Gateway once and maintains its lifetime. It passes that same instance to its LLM Processor or to an Engine. The Engine can pass the instance on to its own LLM Processor. Those classes use the reference supplied to them; they do not create separate Gateways.

Creation also establishes disposal responsibility. The Manager disposes the resources it creates. A Gateway contains the SDK or client it uses and handles that client's lifetime as part of its own disposal. The Processors that borrow the Gateway do not dispose it independently.

[The Configuration Provider: Roles and Responsibilities](/writing/configuration-provider-design-pattern/) explains configuration access, typing, validation, and useful errors in more detail.

## Keep external services behind domain operations

Each external conversation has an owner.

| Component | Destination | Responsibility |
| --- | --- | --- |
| Gateway | Web API services, large language models, or other downstream services | Present the service capability in domain language and contain its SDK or protocol details. |
| Publisher | Message brokers | Publish the messages required by the business operation. |
| Emailer | Email services | Send the email required by the business operation. |
| Data Manager | Database | Provide domain operations while containing database access and its supporting classes. |

The Manager can call a Gateway directly for a straightforward step. When the work requires more coordination, it delegates to an Engine that carries out the more involved operation using the supplied Gateway and its own collaborators.

A Data Manager gives the rest of the system a clean abstraction over database access. It talks directly to the database and calls its Command Factory, Model Adapter, and Data Record Adapter for the supporting work. The Manager calls the Data Manager directly. There is no Data Facade in this structure.

Gateway methods use domain names and domain models. The SDK remains inside the Gateway. The same boundary principle applies to the Data Manager: its caller asks for a business operation without needing to know how the database call is assembled.

[Clean Abstractions Around Libraries](/writing/clean-abstractions-around-libraries/) explains how these boundaries contain library types, resource models, and failure conventions.

## Follow the domain name all the way down

A business operation keeps its name as it moves through the application. If the operation is Place Order, that name follows the call path:

```text
DomainFacade.PlaceOrder
    Manager.PlaceOrder
        DataManager.PlaceOrder
            PlaceOrder stored procedure
```

The casing follows the language's conventions; the business meaning stays the same. Each method expresses the part of Place Order that belongs at its level.

This makes the path easier to follow when diagnosing a problem. If the failure is in the stored procedure for Place Order, its name tells you where to look. Callers do not have to translate the feature's name into an unrelated technical operation such as persisting rows into a particular table.

## Further reading

- [Programming with Intent](/pwi/) brings together the architecture, class, method, and naming guidance.
- [Acceptance Testing](/acceptance-testing/) covers verifying business behavior through the application's public boundary.

This explanation reflects my current account of the architecture. It takes precedence where older recordings describe a different arrangement.
