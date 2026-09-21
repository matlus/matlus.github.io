---
title: Architecture Layers
description: >-
  Layered architecture, the public surface, the Service Interface layer, Manager orchestration, and how levels of abstraction map onto folder structure.
datePublished: 2017-09-20
dateModified: 2026-09-19
tags:
  - architecture
  - python
  - class-design
section: pwi
topic: architecture-layers
language: python
pillar: architecture-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "We don't expose our privates"
- "Need-to-know basis"
- "Don't make me think"

---

This chapter is the structural core of **Architecture with Intent (AWI)**, the author's overarching philosophy and the name for this whole body of work. AWI is the umbrella; under it sit the disciplines you practice *within* the architecture: **Programming with Intent** (the code), **Verification with Intent** (verification at the boundary), and **Programming to Exceptions** (failure handling). This chapter is AWI's architectural heart, the system's shape, and the governing principle is the same one that runs through the code, now at the scale of the whole system: **structure communicates intent.**

## Layered Architecture Pattern

Projects should follow a layered architecture with strict access control to infrastructure components:

```
┌─────────────────────────────────────────────────┐
│ Domain Facade (Public API)                      │
│ - Only publicly visible class(es)               │
│ - Creates ServiceLocator (production)           │
│ - Passes ServiceLocator to Manager              │
│ - Surfaces all domain operations                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Manager(s)                                       │
│ - PRIMARY ROLE: System-level orchestration      │
│ - Knows WHAT, delegates HOW to downstream       │
│ - Receives ServiceLocator from Facade           │
│ - Gets ConfigurationProvider from ServiceLocator│
│ - Extracts config DTOs from ConfigurationProvider│
│ - Creates downstream components                 │
│ - STOPS HERE: No ServiceLocator/Config below    │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Engines/Processors/Extractors                   │
│ - Receive only specific values they need        │
│ - Completely autonomous                          │
│ - No access to ServiceLocator or ConfigProvider │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Gateways (Leaf Nodes)                           │
│ - External service communication                │
│ - Clean, domain-owned boundary contract         │
└─────────────────────────────────────────────────┘
```

**Access Rules:**

- **ServiceLocator**: Accessible only by Domain Facade and Manager
- **ConfigurationProvider**: Accessible only by Manager (obtained from ServiceLocator)
- **Config Values/DTOs**: Extracted by Manager, passed downstream as explicit parameters
- **Downstream Components**: Receive only the specific values they need, never the providers
- **Public Imports**: External callers import only from the boundary package export file (`__init__.py`), never from internal modules below it

---

## Python Public Surface with `__init__.py`

Python does not enforce public/internal/private visibility the way .NET does. This guideline set uses package exports to define the public domain surface.

The boundary package `__init__.py` is the public export list:

- If the domain has a Domain Facade, the domain package exports the Facade, public input/output DTOs, public composed DTO types, and domain exceptions.
- If the domain intentionally has no Domain Facade, the managers package exports the public Manager and the public input/output DTOs and exceptions needed to call it.
- Internal Managers, processors, engines, extractors, gateways, validators, ServiceLocators, ConfigurationProviders, resource models, and support classes are not exported.

All lower-level `__init__.py` files should be empty or limited to package markers. They should not re-export internal classes for convenience.

External imports should flatten to the boundary package:

```python
# GOOD - public import from boundary package
from rfx_document_domain import RfxDocumentDomainFacade, ProcessDocumentRequest

# BAD - caller reaches into internal implementation
from rfx_document_domain.managers.rfx_manager import RfxManager
from rfx_document_domain.managers.gateways.customer_gateway import CustomerGateway
```

If a caller imports beyond the boundary package to reach an internal module, the public surface is leaking or the caller is violating the boundary. Either export the type intentionally from the boundary `__init__.py`, or keep it internal and fix the caller.

**The export rule is mechanical:** every type that appears in a public method signature, whether on the Domain Facade or on a public Manager, is exported from the boundary `__init__.py`. That means all input/output DTOs and value objects in those signatures, and **all** domain exceptions. Nothing a caller can receive or must catch is reachable only by a deep import.

**Why export from the root:** the public import path is deliberately decoupled from physical location. Callers import `from rfx_document_domain import ...` and never learn where a class physically sits in the tree. This buys **freedom to restructure the internal folders at will**: move a model deeper, split a managers folder, relocate a gateway, without breaking a single existing import. The boundary package is a stable contract over a fluid interior.

This is also why physical placement and export are independent. Public DTOs and exceptions live deep in the tree (under `managers/models/` and `managers/exceptions/`, see the canonical tree below) yet are exported from the root. They are **state, not behavior**: they are passed and raised, not "called," so the one-level-down communication rule does not constrain where they live.

A note on the models themselves: these are **anemic** domain models, state-only, immutable, no behavior, and that is a deliberate preference, not a compromise. Domain-Driven Design treats the anemic model as an anti-pattern; this doctrine embraces it. Behavior lives in stateless behavior classes; state lives in frozen DTOs (Chapter 4's behavior/state separation). The two are kept apart on purpose.

---

## The Service Interface Layer (Host Layer)

Above the Domain Facade sits the **Service Interface Layer (SIL)**, the host that interfaces the outside world with the system: a FastAPI application, a CLI, a message consumer, a scheduled worker, a cloud function. Layers are conceptual, not deployment tiers.

Three rules keep the SIL swappable:

1. **The SIL does almost nothing.** Handlers may parse transport input, bind or convert framework/resource schemas, translate them to typed arguments, and forward to the Domain Facade. They contain no business logic and do not replace domain validation: validation lives in the system (Chapter 20) so that no host can lose it and no two hosts duplicate it.
2. **The domain is self-sufficient.** It bootstraps its own configuration and logging through the ServiceLocator path (Chapter 2). The domain never depends on the host's dependency-injection container or startup framework: a system that must be assembled by FastAPI's DI is coupled to FastAPI as surely as if the logic lived in the route handlers.
3. **The portability test**: the system must be drivable from a plain console script: construct the Facade, call methods, done. If that works, nothing has silently coupled to the host. Use it whenever host coupling is in doubt.

Systems built this way migrate between hosts (web app → worker → cloud function) without touching the domain: the same code base serves multiple hosts simultaneously.

For finding ownership, Architecture Layers reports thin-host responsibility violations and import-only package-boundary evidence. Domain Facade reports a host that actually reaches past the Facade to use internal behavior, and domain construction that requires a host framework or DI container. This anchor-based split prevents the same host-boundary defect from being emitted twice.

---

## Manager Orchestration Principle

The Manager's primary responsibility is **orchestration at the system level**. It does not do the work; it directs the work. Every public method on a Manager should read like a high-level workflow description:

- The method knows **what** needs to happen
- Each step delegates **how** to downstream components
- The Manager coordinates: Step 1, Step 2, Step 3

**Orchestration methods ideally have no conditionals.** Because of the exception-based programming philosophy, you don't check for error conditions; you let exceptions handle them. Conditionals in orchestration should exist only for genuine business logic branching (e.g., "if draft, process this way; if final, process that way"), not for defensive checks.

---

## Levels of Abstraction and Folder Structure

The folder structure of a project communicates architecture. The depth of a class in the folder hierarchy indicates its level of abstraction:

- **Top level**: High-level orchestration (Manager)
- **One level down**: Major subsystem components
- **Two levels down**: Specific processing logic
- **Third level and beyond**: Implementation details (file I/O, HTTP, protocols)

### Levels, Not Subfolders

The governing unit is the **level**, folder depth as abstraction altitude, not literal parent-child nesting. "One level down" means *the next level down*, in whatever folder sits at that depth; it does **not** have to be a subfolder of the calling class. A class at level 2 may talk to any class at level 3, whether or not that class is nested directly beneath it. The subfolder is simply the most common way a level-down relationship is realized; what actually governs is the depth. Classes are arranged in **levels**.

Picture a vertical ruler:

- **Level 1**: Domain Facade
- **Level 2**: Manager
- **Level 3**: everything the Manager depends on (Data Manager, gateways, validators, configuration providers, processors, LLM processors, publishers, service locators)
- **Level 4**: everything *those* depend on (a Data Manager's adapters and command factories; a gateway's resource models), and so on downward

### One Archetype Per Folder

A folder normally holds exactly **one** kind of class, and is named (plural) for that kind: `managers/` holds only managers, `gateways/` only gateways, `validators/` only validators. Eligible small internal collaborators under the lower exception below may share a folder, including separate files with distinct cohesive roles. The exclusive same-file option is an additional placement choice within that same lower scope. These bounded placements qualify the one-archetype convention; they do not waive concrete responsibility names or ownership. Because a Manager *depends on* a ServiceLocator but is not one, the ServiceLocator does not live in `managers/`; it lives in `service_locators/`, one level down. The dependency direction is therefore visible as folder nesting: **what a class needs sits at the level below it.**

### The Canonical Domain Tree

```text
domain/
    domain_facade.py                 # Level 1: the only public class
    __init__.py                      # public surface: Facade + public DTOs + all exceptions
    managers/
        rfx_manager.py               # Level 2: managers/ holds ONLY managers
        data_managers/               # Level 3: data access orchestration (see below)
            rfx_data_manager.py
        engines/                     # subordinate orchestrators for complex steps
            enrichment_engine.py     # owns its OWN processors/llm_processors; gateways are passed in by the Manager
        service_locators/
            rfx_service_locator.py
            rfx_service_locator_protocol.py
        configuration_providers/     # named for the archetype, never bare "configuration"
            configuration_provider.py
            customer_gateway_settings.py
        validators/
        processors/
        llm_processors/
        gateways/
            customer_gateway.py
            customer_gateway_resources/   # Level 4: resource models owned by the gateway
        publishers/
        models/                      # anemic, frozen domain DTOs
        exceptions/                  # base + business/technical branches
```

Folder names describe the archetype and the domain purpose. There is still no `helpers/`, `utilities/`, `common/`, or `misc/`: those are the tells of a class that dodged the altitude question.

### Simple vs Complex Systems

- A **simple** system has a **single Manager**. This is the default and the norm: a service is generally one business Manager plus one Data Manager. We do not build monoliths.
- A **complex** system has **multiple Managers** under the Facade, each owning a distinct subsystem.

Historically a complex system also had an internal **Data Facade** fronting several Data Managers. That internal Data Facade has been **removed** from current practice: the Manager now talks **directly to a Data Manager** one level down. The Domain Facade at the top remains; only the *internal data* facade is gone. Data managers live in `managers/data_managers/`; there is no data-facade folder.

### Clean Abstractions at System Seams

Classes at owned system seams speak for the business system, not for the technology behind them. A Data Manager presents the data operations the domain needs; its concrete implementation may use SQL Server, Informix, Oracle, Postgres, or another store. A Gateway presents the downstream capability the domain needs; its concrete implementation may use Azure, Amazon, or another provider. Provider names, SDK types, resource models, status codes, and technology-shaped method signatures stay behind that seam.

The goal is a clean abstraction. Changing the implementation while preserving the same business capability must not change the business-side conversation with the Data Manager or Gateway. That replacement may be:

- **runtime selection**, such as choosing among several payment Gateways for each transaction according to amount or another business rule;
- **deployment-time selection**, such as composing Azure or AWS storage classes, or Service Bus or RabbitMQ messaging classes, from environment configuration; or
- **a one-time migration**, such as replacing SQL Server with Postgres from the next release onward.

Interfaces, protocols, factories, configuration, or runtime dispatch may support those choices, but they are mechanisms rather than the governing intent.

### Where Gateways and Resource Models Live

A gateway is **constructed and owned by the Manager**, the construction owner, and lives in a **single `gateways/` folder under `managers/`**, never duplicated elsewhere in the tree. The Manager **passes the gateway by reference** down to any engine or LLM processor that needs it; an Engine in turn passes it to its own LLM processors. This is injection, not folder navigation: the receiver uses what it was handed, so passing a gateway down neither violates the one-level-down rule nor creates a second `gateways/` folder beneath the consumer. An Engine owns its own processors and LLM processors, but **not** gateways: those always come from the Manager's one gateways folder. Along with the gateway, the Manager passes down the **configuration values** a downstream engine or processor needs (the data, never the ConfigurationProvider itself, which stops at the Manager).

A gateway talks to an external service, so it owns the models that service demands for its input/output schema. Those **resource models** live one level *below the gateway*. They are **not domain models**: the external service dictates their shape, they may be loosely typed, and the system does not control them. They **never leak past the gateway**: the gateway's method names and signatures are entirely domain-centric (domain models in, domain models out), and the resource models stay quarantined inside. The payoff is disposability: to drop the external service, delete the gateway and its resource-model subfolder as one self-contained unit and nothing in the domain notices. The full contract is the Gateway Design Pattern (Chapter 12).

Chapter 12 owns the Gateway's exact roles and responsibilities: it works for the business, keeps a clean domain-shaped surface, and contains provider coupling, mapping, and failure translation. Replacement of one production implementation by another is a consequence of that clean seam, not a testing technique. Chapters 53 and 54 separately govern acceptance-test transport Spies and Test Mediators.

### Archetype Vocabulary

Downstream classes fall into two families. Knowing which family a class belongs to is how you know its name and its folder.

**Orchestrators** know *what*, delegate *how*:

- **Manager**: the top-level orchestrator under the Facade. A public method reads as a high-level workflow of a few steps; each step delegates its *how* to a downstream component.
- **Engine**: a **subordinate orchestrator**, a sub-manager. When one of a Manager's steps is itself complex, a single step at the Manager's altitude that is really many steps at a lower altitude, the Manager delegates that step to an Engine. The Engine then orchestrates *exactly as a Manager does*: it breaks the step into its own sub-steps and drives processors and LLM processors one level below it, LLM calls and all. The Manager hands the Engine the **gateways and configuration values** it needs; the Engine owns its processors and LLM processors but **passes those same gateways down** to them rather than owning a gateways folder of its own. It differs from a Manager only in being **subordinate by placement and duty**, not in kind. An Engine is an orchestrator, **not** a worker: do not conflate it with a processor. (The name is historical: it arose as the word for a sub-manager in a system where "Manager" was already taken.)

**Workers** do the work, return the result:

- **Processor**, an in-memory worker: code logic, in-memory data, possibly the file system, but **not** the LLM. A processor **may** use extractors one level below it.
- **LLM Processor**, a worker whose entire job is the large language model: it sends the prompt, encapsulates retry logic and whatever else the call requires, and returns a domain model or the content that came back. It does **not** use extractors: working the LLM is its only responsibility.
- **Extractor**: a focused low-level worker a Manager, Engine, or Processor uses for one specific extraction task, placed one level below its consumer. LLM processors do not use extractors.

The dividing axis is orchestration vs work: Manager and Engine orchestrate; Processor, LLM Processor, and Extractor do the work. The Engine is the one that surprises people: it sits downstream like a worker but behaves like a Manager.

### "Helper" and "Utility" Are Not in the Vocabulary

The words **helper** and **utility** do not exist in this architecture: not as a folder name, and **not as a class-name suffix**. There is no `helpers/` folder and no `XyzHelper` or `XyzUtility` class. A class that feels like a "helper" is really an extractor, a processor, or a validator: something with a real job and a real name. The words may be fine in casual conversation ("just write a helper"), and the team hears them as shorthand; they never reach the code. A class or folder named for helping is a class that never answered *what it actually does*.

### Communication Rules and the Lower Collaborator Exception

1. **Behavior dependencies go one level down** - A class normally calls classes at the next literal folder depth. This remains mandatory for Manager, its immediate downstream level, and the next level (Mapper in the Manager → Engine → Mapper example). Do not bypass an established responsibility owner to reach its implementation. The bounded same-depth exception below does not authorize arbitrary level skipping.

2. **Classes NEVER talk upstream** - Lower-level components do not call classes in folders above them. They do their specialized work and return results. This maintains dependency direction.

3. **Higher-level siblings do not collaborate directly** - Managers, their immediate downstream collaborators, and Mapper-level collaborators cannot call their peers. Shared behavior belongs one level below. Beginning one level below Mapper, small cohesive internal collaborators may share folder depth or a folder, including separate files, when the supplied implementation establishes a clear dependency direction and responsibility ownership.

Count Manager as level 1: its immediate collaborators are level 2, their next collaborators are level 3, and the exception starts at level 4 (Manager+3). On the Domain Facade-first ruler above, that is level 5. Eligible lower collaborators may continue to follow strict downward depth; same-depth collaboration is optional. Small size, a class name, or absence of a cycle alone does not establish eligibility. Moving an orchestrator or adding an organizational folder does not lower its architectural responsibility.

Within that eligible lower scope, a class used exclusively by one other class may optionally be a separate, non-nested class in its caller's source file. Supplied usages must establish that exclusive relationship; file placement alone does not enforce it. This bounded option also qualifies the one-archetype-per-folder convention. It does not permit high-level peer collaboration, upstream dependencies, cycles, or bypassing an established responsibility owner. Keep concrete responsibility names; the exception introduces no generic `helpers/` folder or `Helper` class convention.

### Why These Rules Matter

- **Violation symptoms**: circular imports, unexpected breakage, difficult testing, inability to understand parts in isolation
- **When rules are followed**: architecture is visible in folder structure, refactoring is safe, new team members navigate by understanding hierarchy
- **If a class seems to need communication that violates these rules**, it signals an abstraction problem requiring refactoring

---

## Code Review Checklist

When reviewing code for architecture compliance, verify:

### Layer Access
- [ ] ServiceLocator is only accessed by Domain Facade and Manager
- [ ] ConfigurationProvider is only accessed by Manager
- [ ] Downstream components (Engines, Processors, Gateways) receive explicit values, not providers
- [ ] No class below Manager has access to ServiceLocator or ConfigurationProvider

### Manager Design
- [ ] Manager methods orchestrate - they describe WHAT, not HOW
- [ ] Manager methods read like high-level workflow descriptions
- [ ] Conditionals exist only for genuine business logic branching
- [ ] No defensive checks or error condition handling in orchestration (exceptions handle that)

### Folder Structure and Communication
- [ ] Classes follow next-level depth unless an established exception applies; the lower internal collaborator exception begins at Manager+3 and never permits bypassing a responsibility owner
- [ ] No class calls upstream (higher folder levels)
- [ ] No Manager, immediate downstream, or Mapper-level peers collaborate directly; eligible small internal collaborators at Manager+3 or deeper may share depth with proven directed ownership
- [ ] Folder depth reflects abstraction level
- [ ] Typed folders communicate archetypes; any shared-folder lower collaborators satisfy the bounded scope and directed ownership conditions, and any exclusive separate same-file class has supplied usage evidence of exclusive ownership
- [ ] Orchestration of a complex Manager step is delegated to an Engine (subordinate orchestrator), not crammed into the Manager or mislabeled as a processor
- [ ] LLM processors do not use extractors; only Managers, Engines, and (in-memory) Processors do
- [ ] No "Utilities", "Helpers", "Common", "Misc" folders, and no `XyzHelper`/`XyzUtility` class names: the words are not in the vocabulary at all
- [ ] `configuration_providers/` (not bare `configuration/`); `service_locators/` folder (not a flat `service_locator.py` beside managers); `models/` and `exceptions/` under `managers/`, not at the domain top level
- [ ] Data access is a Data Manager one level below the Manager: no internal Data Facade
- [ ] Data Manager and Gateway seams expose business-shaped operations/models; database, provider, SDK, resource, and protocol vocabulary stays behind the concrete implementation
- [ ] Replacing a database or downstream-service implementation does not change the business-side conversation with its Data Manager or Gateway
- [ ] Gateways are constructed once by the Manager in a single `gateways/` folder and passed by reference to engines/LLM processors (never a second `gateways/` folder below a consumer); the Manager passes configuration *values* (not the provider) downstream too
- [ ] Gateway resource models sit one level below the gateway and never leak into the domain
- [ ] Public callers import only from the boundary package `__init__.py`
- [ ] Every type in a public Facade/Manager signature, and every domain exception, is exported from the boundary `__init__.py`
- [ ] Lower-level `__init__.py` files do not re-export internal classes

### Service Interface Layer
- [ ] Host handlers only parse/bind transport data, translate it, and forward to the Facade (no business logic and no replacement for domain validation)
- [ ] Domain does not depend on the host's DI container or startup framework
- [ ] The system passes the portability test (drivable from a console script)

### Dependency Direction
- [ ] Dependencies flow downward only (high-level → low-level)
- [ ] No circular imports
- [ ] Lower-level components are autonomous and don't depend on higher-level ones
