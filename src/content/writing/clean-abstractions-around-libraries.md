---
title: "Clean Abstractions Around Libraries"
description: "A library boundary owns the application's contract even when its terms match the library's. It contains provider types, validation, failures, and configuration, and keeps replacement possible."
datePublished: 2026-09-25
hero: clean-abstractions-around-libraries-v2
tags: ["architecture", "public-surface", "library-boundaries", "gateway-pattern", "data-manager", "configuration-provider", "design-patterns"]
---

I put a boundary around a library when the rest of the system should depend on a capability I own instead of the library's contract. Sometimes the library's vocabulary is a poor fit for the domain. Sometimes its words are exactly right. In either case, I still need to decide what inputs are valid, what types callers receive, how failures are represented, and which details remain inside the boundary.

This applies to a third-party SDK, a database driver, a message-broker client, or a standard library. Whether the library runs in our process matters less than who owns the application-facing contract and its guarantees.

## What the boundary owns

Suppose the domain needs to store an order. It passes an Order model to a Data Manager. That model might identify the customer and contain line items, but it does not need to know whether the database has an order header table, a line item table, or some other schema. The Data Manager owns the driver call and the store's response.

A stored procedure can provide a second boundary inside the database. The Data Manager might call `StoreOrder` with order-shaped inputs. The procedure decides which values belong in header and line item tables. If the tables change while the procedure's contract stays the same, that change stays behind the procedure. Neither the domain model nor the Data Manager has to adopt the new schema.

The same idea applies to other seams:

| Domain request | Boundary that can fulfill it | Detail kept inside |
| --- | --- | --- |
| Send an order confirmation | Publisher or message broker adapter | Exchange names, client message types, acknowledgements |
| Retrieve a customer's information | Gateway | SDK requests, resource models, status codes |
| Authorize a payment | Payment Gateway | Provider request and response types, failure conventions |
| Get validated storage settings | Configuration Provider | Environment variables, configuration keys, parsing |
| Store an order | Data Manager and stored procedure | Driver calls, store errors, table layout |

Those are examples of roles, not a rule that every library needs a new class. The boundary earns its place when it gives the caller a contract the application controls and contains responsibilities the caller should not own.

The application-facing surface includes method names, parameter names and types, return models, and failures. If a provider-specific type crosses that surface, callers must understand the provider. Internal methods can use library types freely; translating them is part of the boundary's work.

Vocabulary alone cannot decide whether to build that boundary. A payment SDK might already use the words *payment*, *authorization*, and *refund*, just as our domain does. A Payment Gateway may keep those names and still protect the application from the SDK's models, response codes, failure behavior, and configuration. The names can match while the contract remains ours.

A configuration API may look like a familiar dictionary lookup. In .NET, `IConfiguration` gathers values from files, environment variables, and other sources. The [Options API](https://learn.microsoft.com/en-us/dotnet/core/extensions/options) can bind and validate those values, but it is one way to implement the application contract. In Meridian, our Configuration Provider reads `IConfiguration` through one internal seam, validates the settings it needs, and exposes typed values and settings models through its own methods. A missing or invalid required setting fails when the provider is constructed. Callers do not look up raw keys or repeat decisions about defaults, validation, and failures.

## Translate at the seam

Inside the boundary, technical detail is expected. A Gateway may construct an SDK request and map between domain and provider models. A Data Manager may call a stored procedure and interpret the database's response. A Configuration Provider may read loose external values, validate them, and return typed settings. Each accepts the application's inputs and returns its own models or values.

A library can report failure by throwing an exception, returning a sentinel or error result, or sending a status code such as an HTTP error. The boundary interprets each form against its contract. When it is a failure, it raises a domain exception with a useful reason and message. Callers should not have to recognize provider exceptions, codes, or special values. The same translation responsibility applies to gateways, data managers, and configuration providers.

A wrapper that forwards calls while exposing the library's objects and failures gives callers little protection. A useful boundary owns its models, validation, and failure behavior as well as its method names.

This is the general principle behind the [clean seams in Architecture Layers](/pwi/architecture-layers/python/). The architecture chapter explains where these classes sit and how dependencies flow. This article concentrates on the responsibilities each boundary keeps under our control.

## A library can be low level without being external

Our test support offers another example. It uses cryptographic randomness to produce numbers and strings. Tests usually do not want to ask the cryptographic API for a number and then remember how to shape it into an email address, first name, last name, or synthetic Social Security number. They ask for those values directly.

The implementation has two layers. A small generator contains the platform's cryptographic API and offers reusable random primitives. A second layer turns those primitives into the values the tests need. Python uses `secrets`; C# uses `RandomNumberGenerator`. The tests can request a random email address without knowing either API.

This is still a clean abstraction even though those libraries are part of the language platforms and everything runs in one process. The test's vocabulary is about the data it needs. Random selection and string assembly are implementation details. The same approach would let an image-processing class offer an operation such as preparing a print image at a requested resolution while containing the pixel and file-format APIs it uses.

## What replacement really means

Containing a library gives us the option to replace it when the business capability stays the same. A Gateway might switch providers; a Data Manager might use a different store; an image class might use another imaging library. Callers keep asking for the same capability through the same contract. The boundary absorbs differences in library calls, types, and error conventions.

That does not make every replacement effortless. A new implementation may have different limits or semantics. We still have to check that it can meet the contract and the business requirements.

The benefit is present even if we never replace the library. Without a boundary, its types, imports, error handling, and configuration can spread through many classes. A change then touches every place that depends on those details. Keeping that coupling in one boundary also gives us one place to validate inputs, translate failures, and decide what the application can rely on. The Configuration Provider illustrates this well: if raw configuration lookups spread through the system, required settings, parsing, defaults, and error messages can differ from one caller to another.

This also explains why the domain model matters. A good boundary cannot remain business-shaped if the models passed through it are really SDK models with new names. [Intentional Model Design](/writing/intentional-model-design/) looks at how our own types make their promises clear. [Validation and Exception Handling](/pwi/validation-exception-handling/python/) covers the checks and failure translation that make incoming values trustworthy.
