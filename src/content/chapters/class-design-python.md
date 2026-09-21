---
title: Class Design
description: >-
  Two kinds of class and why that separation holds, no inheritance for extension, and naming conventions for polymorphic types.
datePublished: 2017-09-20
dateModified: 2026-09-01
tags:
  - class-design
  - python
  - naming
section: pwi
topic: class-design
language: python
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Rule of thirds"
- "Express your intent in code, not comments"

---

## Two Types of Classes

There are two types of classes with an absolute separation between them:

### Behavior-only Classes

**Core Rules:**

- No mutable state that changes across method invocations
- Generally implemented as static classes (using `@staticmethod` or `@classmethod`) unless:
    - Polymorphism is required (approximately 10-15% of classes), OR
    - Dependency injection of stateless services is used
- **Public methods should orchestrate**: For classes with meaningful complexity, public methods should describe *what* the class does (the sequence of steps), while private methods handle *how* each step is implemented. This keeps public methods readable as high-level workflows. See Chapter 5 (Method Design) for detailed guidance.

**Transitive Statelessness Exception:**

A behavior-only class MAY hold references to stateless services as instance variables if ALL of the following conditions are met:

1. **Dependencies are stateless**: The referenced services are themselves stateless (or transitively stateless)
2. **References are immutable**: Set once in `__init__`, never reassigned
3. **Dependencies are services**: Gateways, loggers, validators, engines, processors - not data
4. **Behavior remains deterministic**: Same inputs → same outputs (no hidden state affects results)
5. **Practical necessity**: Multiple methods need the same services (avoids passing 5+ dependencies to every method)

```python
# COMPLIANT - Dependency injection of stateless services
class DocumentProcessor:
    def __init__(
        self,
        llm_gateway: LlmGateway,           # Stateless service
        logger: logging.Logger,            # Stateless logger
        validator: SchemaValidator,        # Stateless validator
        extractor: ContentExtractor        # Stateless extractor
    ) -> None:
        # These are immutable references to stateless services
        self.llm_gateway = llm_gateway
        self.logger = logger
        self.validator = validator
        self.extractor = extractor

    async def process(self, document: Document) -> ProcessedDocument:
        # Class is transitively stateless:
        # - No mutable state in this class
        # - All dependencies are stateless
        # - Same input always produces same output
        validated: ValidatedDocument = self.validator.validate(document)
        content: ExtractedContent = await self.extractor.extract(validated)
        return await self.llm_gateway.process(content)
```

```python
# VIOLATION - Mutable state
class DocumentProcessor:
    def __init__(self) -> None:
        self.processed_count: int = 0              # Accumulating state
        self.last_document: Document | None = None # Cached state
        self.cache: dict[str, Result] = {}         # Mutable cache

    def process(self, document: Document) -> ProcessedDocument:
        self.processed_count += 1  # Side effect across calls
        # ... This class is STATEFUL
```

**Test for Statelessness:**

Call any public method multiple times with the same inputs. If you always get the same outputs (or same external effects) without any hidden state affecting the results, the class is stateless.

**Transitive Statelessness:**

A class is transitively stateless if:

1. It holds no mutable state itself, AND
2. All dependencies it holds references to are also stateless (recursively)

This allows for:

- Thread-safe composition of stateless services
- Cleaner method signatures (don't pass logger/gateway to every method)
- Easier testing (mock dependencies once in constructor)
- Natural async/await patterns without concurrency issues

**Additional Rules:**

- Should implement Pure methods and/or Autonomous methods
- Properties allowed but must be immutable; read/write properties extremely rare
- Use abstract base classes or protocols (not interfaces) only when polymorphism required (approximately 10-15%)
- Consider refactoring complex local functions into separate behavior-only static classes rather than nested functions

---

### State-only Classes

- No behavior beyond data access
- Should be implemented as either:
    - **Pydantic frozen models (immutable)** - preferred when JSON serialization/deserialization is needed
    - **Dataclasses with frozen=True** - acceptable alternative for internal data structures
- These classes serve as DTOs (Data Transfer Objects)
- For performance-critical paths or objects requiring frequent modifications, immutability requirements may be relaxed
- Consider using patterns that create new instances from existing ones with property changes when modifications are needed

---

## No Inheritance for Extension

There are two kinds of inheritance, and this corpus permits only one:

- **Inheritance for polymorphism**: behavior varies across a family that callers treat uniformly through the base contract. Permitted (~10-15% of classes), preferably via `Protocol`.
- **Inheritance for extension**: inheriting base functionality to add more on top. **Not used.** Extension couples descendants to everything the ancestor exposes, produces hierarchies whose branches need each other's members, and invites future misuse. Prefer composition: a class that needs several capabilities composites the classes providing them (constructing and owning them internally).

### Need-to-Know Applies to Hierarchies

The Need-to-Know Principle (Chapter 3) extends to inheritance: **a base class must not expose any member that is not required by every descendant, today or in the future.** "Available but please don't use it" is not a design; a protected member one descendant shouldn't touch is one refactor away from being public in that descendant. If descendants need different subsets of functionality, the functionality belongs in composable collaborator classes, not in the ancestor.

When shared infrastructure is genuine (every descendant needs it), a shallow one-level base is acceptable: the composition-of-settings-providers refactor is the reference shape: a flat base holding truly-universal mechanics, descendants compositing exactly the capability classes they need.

### Close Concrete Descendants by Default

An inheritance declaration must also communicate whether another inheritance step is intended. A concrete class that descends from another class as a finished implementation is marked `@final`. This is the Python expression of the same intent that C# communicates with `sealed`: the class participates in a hierarchy, but it is not being offered as the start of another hierarchy.

Leaving a descendant open is exceptional. The source must establish that the class is itself an intentional extension contract, such as an abstract base with unresolved abstract members, a mixin, or a supported subclass API used by further descendants. The absence of `@final` alone is not enough to express that design decision.

Do not require `@final` on `Protocol` definitions or on enum families that Python already prevents from being extended once concrete members exist. A class that only satisfies a protocol structurally has not descended from that protocol and is also outside this rule. `@final` is enforced by type checkers rather than by the Python runtime, so it expresses and verifies intent without adding runtime sealing machinery.

If the inheritance relationship itself is inheritance-for-extension, remove or redesign that relationship. Adding `@final` does not repair an invalid hierarchy.

```python
from abc import ABC, abstractmethod
from typing import final, override


class ReportFormatterBase(ABC):
    @abstractmethod
    def format_report(self, title: str) -> bytes:
        raise NotImplementedError


@final
class ReportFormatterPdf(ReportFormatterBase):
    @override
    def format_report(self, title: str) -> bytes:
        return render_pdf(title)
```

---

## Polymorphic Type Naming Conventions

When designing systems with polymorphism (protocols, abstract base classes, or interfaces with multiple implementations), **consistent naming is critical** for code navigation and maintainability.

**Core Pattern:**

- **Concept Name**: The name you use when discussing the abstraction (`ConfigurationProvider`, `DocumentLoader`)
- **Protocol/Base Class**: Concept name + `Base` suffix (`ConfigurationProviderBase`, `DocumentLoaderBase`)
- **Implementations**: Concept name + descriptive suffix that differentiates the implementation

**Why This Matters:**

1. **Alpha-Sort Grouping**: All related types appear together in file explorers and imports
2. **Scannable Structure**: Instantly identify base class and all implementations
3. **Clear Differentiation**: Suffix makes implementation strategy obvious
4. **Code Navigation**: No guessing which file contains which implementation

**Good Example:**

```python
# Protocol/Base (defines the contract)
class ConfigurationProviderBase(Protocol):
    def get_azure_openai_config(self) -> AzureOpenAiConfig:
        ...

# Implementations (suffix describes strategy/source)
class ConfigurationProviderEnv:
    """Loads configuration from .env files."""
    def get_azure_openai_config(self) -> AzureOpenAiConfig:
        # Load from environment variables
        ...

class ConfigurationProviderKeyVault:
    """Loads configuration from Azure Key Vault."""
    def get_azure_openai_config(self) -> AzureOpenAiConfig:
        # Load from Key Vault
        ...

class ConfigurationProviderTableStorage:
    """Loads configuration from Azure Table Storage."""
    def get_azure_openai_config(self) -> AzureOpenAiConfig:
        # Load from Table Storage
        ...
```

**In file explorer (alpha-sorted):**

```
config_provider.py
    ConfigurationProviderBase      ← Protocol
    ConfigurationProviderEnv       ← Implementation 1
    ConfigurationProviderKeyVault  ← Implementation 2
    ConfigurationProviderTableStorage ← Implementation 3
```

**Instantly visible**: "This is a protocol with 3 implementations: Env, KeyVault, and TableStorage"

**Bad Example:**

```python
# BAD - Inconsistent naming makes navigation difficult
class ConfigProvider(Protocol):  # Missing 'Base' suffix
    ...

class EnvConfigProvider:  # Prefix differs from protocol name
    ...

class AzureKeyVaultConfig:  # Completely different name pattern
    ...

class ConfigFromTableStorage:  # Yet another different pattern
    ...
```

**Common Suffix Patterns:**

**By Source/Location:**
- `Env` - Environment variables or .env files
- `KeyVault` - Azure Key Vault
- `TableStorage` - Azure Table Storage
- `Filesystem` - Local filesystem
- `BlobStorage` - Azure Blob Storage
- `S3` - AWS S3
- `Database` - Database storage

**By Technology:**
- `Http` - HTTP-based implementation
- `Grpc` - gRPC-based implementation
- `InMemory` - In-memory implementation (often for testing)
- `Mock` - Mock implementation for testing

**By Strategy:**
- `Async` - Asynchronous implementation
- `Sync` - Synchronous implementation
- `Cached` - Cached/memoized implementation
- `Batched` - Batch processing implementation

**By Business Context:**
- `Production` - Production-ready implementation
- `Development` - Development/debugging implementation
- `Test` - Test implementation

---

## Code Review Checklist

When reviewing class design, verify:

### Class Type Separation
- [ ] Class is clearly either behavior-only OR state-only (never both)
- [ ] Behavior classes have no mutable state that changes across invocations
- [ ] State classes (DTOs) use `frozen=True` (dataclass) or Pydantic frozen models
- [ ] No hybrid classes that mix behavior and mutable state

### Transitive Statelessness
- [ ] Behavior classes holding service references follow all 5 conditions
- [ ] Dependencies are stateless services (gateways, loggers, validators)
- [ ] References are set once in `__init__`, never reassigned
- [ ] Same inputs produce same outputs (deterministic behavior)
- [ ] No mutable caches, counters, or accumulated state

### Polymorphic Naming
- [ ] Protocol/Base class has `Base` suffix (e.g., `ConfigurationProviderBase`)
- [ ] All implementations start with same prefix as base
- [ ] Suffixes clearly describe implementation strategy (e.g., `Env`, `KeyVault`)
- [ ] Related types appear together when alpha-sorted
- [ ] No abbreviated suffixes unless universally known (`S3` OK, `KV` not OK)

### Inheritance
- [ ] No inheritance for extension - hierarchies exist only for polymorphism
- [ ] Base classes expose no member that any descendant (present or future) does not need
- [ ] Capability subsets are composited from collaborator classes, not inherited and selectively exposed
- [ ] Concrete descendants that are finished implementations declare `@final`
- [ ] Open descendants have explicit evidence that they are intentional extension contracts

### General Design
- [ ] Abstract base classes or protocols used only when polymorphism required (~10-15%)
- [ ] No complex nested functions - refactor to separate classes
- [ ] Properties are immutable; read/write properties are extremely rare
- [ ] Public methods of complex classes orchestrate (describe WHAT, not HOW)
