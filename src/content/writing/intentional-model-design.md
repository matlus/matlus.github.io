---
title: "Intentional Model Design"
description: "A model should express required fields, genuine absence, and distinct variants in its type. Python unions and C# records encode those promises, while boundaries check external values."
datePublished: 2026-09-25
hero: intentional-model-design
tags: ["class-design", "model-design", "boundary-validation", "gateway-pattern", "design-patterns", "python", "csharp"]
---

I want a model's type to tell me what it carries. If a field is required for this kind of object, its declaration should say so. If absence is a real state, the type should show that too. Otherwise every consumer has to reconstruct the model's intent from guards, comments, and usage scattered through the system.

The [Python Class Design chapter](/pwi/class-design/python/) and [C# Class Design chapter](/pwi/class-design/csharp/) explain why I keep state in immutable models and behavior in separate classes. Intentional model design asks a more specific question: **does each model describe one honest shape of data?**

Examples: [Python](#python-examples) · [C#](#c-examples). The design question is the same; the languages express variants and absence differently.

## Python examples

### An optional field that never really is optional

Imagine one `ToolDefinition` type serving two kinds of tool. A function tool always has a schema; a server tool never does.

```python
@dataclass(frozen=True)
class ToolDefinition:
    type: Literal["function", "web_search"]
    function: FunctionSchema | None = None
```

The declaration says `function` may be absent from *any* `ToolDefinition`. Consumers that work with function tools must therefore check it. One check becomes another in every gateway and processor that handles the model. Those checks are a symptom: the type combines two concepts with different required fields.

When that confusion spreads, I would give each concept its own model:

```python
@final
@dataclass(frozen=True)
class FunctionToolDefinition:
    function: FunctionSchema

@final
@dataclass(frozen=True)
class ServerToolDefinition:
    type: Literal["web_search", "code_interpreter", "file_search"]

ToolDefinition = FunctionToolDefinition | ServerToolDefinition
```

Now a function tool has a schema by definition. Code handling the union can dispatch on `isinstance`, and the type checker can narrow the variant. Once code has a `FunctionToolDefinition`, it need not check whether `function` is `None`.

### Let absence mean something

`None` is appropriate when absence is part of the concept. A `shipped_date: datetime | None` can mean an order has not shipped. The optional type tells the truth. An `email: str | None` on a model that represents only registered customers would tell a different story if every registered customer must have an email.

Defaults also need to mean what they say. A default empty string may be a valid state for one field and an attempt to hide missing data for another. The model's constructor should make the distinction visible.

### Keep boundary uncertainty at the boundary

A Gateway may need to inspect an SDK object, check a missing field, or convert loosely typed JSON. It performs those checks while translating the external value into a domain model. Within trusted code, `isinstance` chooses among genuine variants of a union. A Python `cast` can state an assertion when a contract guarantees the type but the checker cannot infer it; it does not validate an external value at runtime.

An incoming request dataclass should hold what arrived. Trimming a value, changing case, or replacing a missing field inside `__post_init__` hides a rule where a reader sees only data. If a business rule calls for normalization, the Manager can create a new request in a named step before validation and orchestration. The original request remains an honest record of the input.

The [Python Validation and Exception Handling chapter](/pwi/validation-exception-handling/python/) describes those entry checks.

## C# examples

### Give each variant its required fields

The same two tool kinds could be put into one record:

```csharp
public enum ToolKind { Function, WebSearch }

public sealed record ToolDefinition(
    ToolKind Kind,
    FunctionSchema? Function = null);
```

Here `Function` is nullable even when `Kind` identifies a function tool. Every consumer must check it, and the type permits a function tool with no schema. A small hierarchy can express the actual variants:

```csharp
public abstract record ToolDefinition;

public sealed record FunctionToolDefinition(
    FunctionSchema Function) : ToolDefinition;

public enum ServerToolKind { WebSearch, CodeInterpreter, FileSearch }

public sealed record ServerToolDefinition(
    ServerToolKind Kind) : ToolDefinition;
```

Code can use `is FunctionToolDefinition functionTool` to select that variant. Its `Function` property is declared as required. C# does not have the Python union alias used above; the base record gives callers a common type for the variants.

### Make nullable fields deliberate

In C#, `DateTimeOffset? ShippedAt` can mean an order has not shipped. For a registered customer who must have an email, use `string Email` rather than `string? Email`. With nullable reference types enabled, the compiler warns about a possible null passed as `Email`. That annotation does not check values arriving from JSON or another external source at runtime. The boundary must establish the guarantee before constructing a trusted domain model.

### Keep the record honest

A positional record should store the values it receives. If the Manager needs to normalize a request, a named step can produce a changed copy with a `with` expression. The record's constructor should not silently trim, change case, or replace missing input. The [C# Validation and Exception Handling chapter](/pwi/validation-exception-handling/csharp/) shows where normalization and validation occur.

Splitting a model has a cost in either language: more types, files, imports, and decisions for readers. I do it when variants have genuinely different shapes and repeated guards show that several consumers are paying for the ambiguity. One local guard alone does not call for a family of types.

In both languages, [Clean Abstractions Around Libraries](/writing/clean-abstractions-around-libraries/) explains why a Gateway keeps foreign types and their uncertainty inside its boundary. A consumer should be able to trust a successfully constructed domain model and understand from its type what is required, what may be absent, and which variants are real.
