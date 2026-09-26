---
title: Type Annotations
description: >-
  Annotations as intent rather than decoration: None used deliberately, dictionaries kept out of method boundaries, and capability types that tell the truth.
datePublished: 2017-09-20
hero: chapter-type-annotations-python
dateModified: 2026-09-01
tags:
  - python
  - method-design
  - class-design
section: pwi
topic: type-annotations
language: python
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Don't make me wonder"
- "Express your intent in code, not comments"

---

## Type Annotation Requirements

Chapter 50 owns missing collected-test parameter/direct-local annotations and
missing or non-None test returns. Chapter 10 retains present-but-incomplete
parameter/local annotations in those tests, including unparameterized `list`;
there is one owner for each correction. Reusable support callables and asserters
remain under Chapter 10 annotation rules.

- Use built-in collection types for type annotations, not imports from typing
- For complex nested collections (e.g., dictionary of lists of tuples with mixed types), create a Pydantic frozen model or dataclass instead of attempting complex nested annotations
- Callback and higher-order function contracts must be explicitly typed. A lambda gets its parameter and return types from an explicit typed callable context; Python has no inline lambda-parameter annotation syntax
- Prefer local type inference when the right-hand side makes the type obvious to a human reader and the variable name expresses domain intent
- Use explicit local annotations when the right-hand side is ambiguous, the variable is declared before its real value exists, the value starts as `None`, or the value starts as an empty collection
- Treat Python `Enum` members as declarations of the enum's values, not as ordinary mutable class state; individual enum members do not require type annotations

---

## None is Intentional, Not Defensive

**The default assumption is that all values are required. `None` is never the starting position.**

`| None` should only be added to a type annotation when there is a clear, intentional reason for the value to be absent. Adding `| None` "just to be safe" or "in case it might be needed" weakens the type system and hides bugs that should be caught at development time.

### When `| None` is Appropriate

1. **Constructor parameters controlling optional features** - When a feature can be disabled, its dependencies may legitimately be `None`:

   ```python
   def __init__(self, enable_caching: bool) -> None:
       self.cache_manager: CacheManager | None = None
       if enable_caching:
           self.cache_manager = CacheManager()
   ```

2. **External data sources with genuinely optional fields** - LLM responses, API responses, or user input where certain fields may be absent despite best efforts:

   ```python
   class DocumentMetadata:
       title: str  # Always present
       author: str | None  # Sometimes missing in legacy documents
   ```

3. **Domain models where absence has business meaning** - When "no value" is a valid state in the business domain:

   ```python
   class Order:
       shipped_date: datetime | None  # None means not yet shipped
   ```

4. **Resource lifecycle management** - When resources transition to `None` after cleanup (see Async Resource Lifecycle chapter):

   ```python
   self._client: BlobServiceClient | None = BlobServiceClient(...)  # Becomes None after close()
   ```

### When `| None` is NOT Appropriate

1. **Defensive local optionality** - A local may use `T | None` when a real branch or external contract intentionally produces `None`, including a comparison report that is absent on success. Do not add `| None` merely as a placeholder before assigning a required value.

2. **"Just in case"** - Never add `| None` defensively. If a value is required, the type should enforce that.

3. **Instance variables set in `__init__`** - If a value is always assigned during initialization, don't mark it as `| None`:

   ```python
   # BAD - logger is always assigned
   def __init__(self, logger: logging.Logger) -> None:
       self.logger: logging.Logger | None = logger

   # GOOD - type reflects reality
   def __init__(self, logger: logging.Logger) -> None:
       self.logger: logging.Logger = logger
   ```

4. **Parameters that must have values** - Don't make parameters optional when the code can't function without them.

### The Discovery Process

Start with everything required. If during testing or production you discover a property genuinely needs to be nullable, update the type annotation then. Let reality inform the design rather than preemptively weakening types.

Prefer local type inference when the right-hand side makes the type obvious to a human reader and the variable name expresses domain intent. Use an explicit local annotation when the right-hand side is ambiguous, the variable is declared before its real value exists, the value starts as `None`, or the value starts as an empty collection. Do not use placeholder values such as `""`, `0`, `False`, `[]`, or `{}` merely to avoid an explicit annotation. Empty collections should normally be annotated because their element types are otherwise invisible.

### Why This Matters

- **Type safety** - The compiler catches bugs when required values are missing
- **Clear contracts** - Types document what's truly optional vs required
- **Validation location** - Required values are validated at entry points; `| None` everywhere pushes validation downstream
- **Intentional design** - Each `| None` represents a deliberate decision, not fear

---

## Dictionary Usage and Method Boundaries

### Core Principle

Complex, loosely-typed dictionaries (`dict[str, Any]`, nested structures, mixed types) must not carry domain data across method boundaries. They normally exist as implementation details confined within a single method.

**Raw invalid boundary fixtures:** a test may construct and pass an intentionally malformed JSON-shaped dictionary to the parser or validator under test, including through a narrowly scoped fixture builder. Its missing keys, wrong value types, or invalid nesting are the input being tested; a valid domain model would reject or normalize them before the target boundary sees them. Keep the raw shape confined to that boundary-test path and use an honest annotation. This exception does not permit unchecked complex dictionaries between ordinary domain collaborators, validated outputs returned as unstructured dictionaries, or omitted annotations. Establish the fixture's purpose and consumer from the supplied test and helper bodies; a test folder alone is insufficient.

### Acceptable Dictionary Usage

**Within Method Boundaries:**

Transient raw dictionaries may remain inside parsing/conversion, and the raw invalid boundary-fixture path above is permitted. Confinement inside a method does not waive the model triggers for structured domain records described below:

```python
# GOOD - Complex dict confined within method
def process_raw_api_response(response_json: str) -> UserProfile:
    # This messy dict never escapes this method
    raw_data: dict[str, Any] = json.loads(response_json)
    nested_stuff: dict = raw_data.get("user", {}).get("profile", {})
    permissions: dict[str, list[dict]] = raw_data.get("permissions", {})

    # Map to proper type before returning
    return UserProfile(
        user_id=nested_stuff["id"],
        name=nested_stuff["full_name"],
        permission_count=len(permissions.get("active", []))
    )
```

**Simple Dictionaries as Method Parameters/Returns:**

Genuine homogeneous primitive lookup maps are acceptable regardless of entry count. Distinct domain record fields are not lookup entries merely because all their values share one primitive type:

```python
# GOOD - Simple string-to-string mapping
def get_environment_tags() -> dict[str, str]:
    return {"environment": "prod", "region": "us-east", "team": "ingestion"}

# GOOD - Clear primitive mapping
def calculate_category_totals(items: list[Item]) -> dict[str, float]:
    # Returns category name → total amount
    totals: dict[str, float] = {}
    for item in items:
        totals[item.category] = totals.get(item.category, 0.0) + item.amount
    return totals
```

### Unacceptable Dictionary Usage

**Complex Dictionaries Crossing Boundaries:**

A domain-data dictionary requiring the caller to "know the shape" is unacceptable; the intentionally malformed parser/validator fixture exclusion remains separate:

```python
# BAD - Caller must guess structure
def parse_document(content: bytes) -> dict[str, Any]:
    # What keys exist? What are their types? What's nested?
    return {
        "sections": [...],  # List of what?
        "metadata": {"pages": 10, "author": {...}},  # Author is what shape?
        "extracted": {"tables": [...], "images": [...]}  # What do these contain?
    }

# BAD - Nested structure unclear
def get_user_permissions(user_id: str) -> dict[str, list[dict[str, Any]]]:
    # What's in the inner dictionaries? How do I access them?
    return {...}
```

### Solution: Create Pydantic Frozen Models

Replace complex dictionaries with explicit Pydantic frozen models:

```python
# GOOD - Explicit structure with proper types
@dataclass(frozen=True)
class ParsedDocumentData:
    sections: list[DocumentSection]
    metadata: DocumentMetadata
    extracted_content: ExtractedContent

@dataclass(frozen=True)
class DocumentMetadata:
    page_count: int
    author: AuthorInfo
    creation_date: datetime

def parse_document(content: bytes) -> ParsedDocumentData:
    # Caller knows exactly what they're getting
    # Type system enforces correct usage
    # IDE provides autocomplete
    return ParsedDocumentData(...)
```

### When to Create a Model

**Create a Pydantic frozen model or dataclass when ANY of these is true:**

1. A structured record has 3 or more distinct schema fields (not three entries of a homogeneous primitive lookup map)
2. Dictionary contains any nested structures
3. Dictionary values have mixed or complex types
4. Dictionary structure is used in 2 or more places
5. The structure represents a domain concept
6. You find yourself writing comments explaining the dictionary structure

The threshold is intentionally low for structured domain records. Any one trigger is enough; they are not cumulative. Distinguish record fields from homogeneous lookup entries regardless of count. Transient raw wire data inspected only to convert it into typed domain data is not itself a domain record. The raw invalid boundary-fixture exclusion above remains applicable even when the fixture has many keys or nested invalid values.

The operational local owner is `pwi.type-annotations.local-structured-domain-data-without-model`: one suggestion per local record schema, anchored at its first construction or assignment, with complete method/consumer evidence. A model correction already owned by the boundary-crossing rule is not duplicated locally. The model should be a frozen dataclass or frozen Pydantic model; ordinary annotation requirements remain independent.

**Keep simple dictionaries when:**

1. True key-value pairs with consistent types (e.g., `dict[str, str]`)
2. Dictionary is only used for basic lookup/mapping
3. Structure is obvious from context and usage
4. No nesting or complexity

---

## Honest Capability Types

Types should tell the truth about the capabilities a method needs and provides.

For parameters, ask for the least capability the method actually uses. Import abstract collection contracts from `collections.abc`, not legacy `typing` aliases:

- Use `Iterable[T]` only when the method merely iterates once.
- Use `Collection[T]` when the method needs membership or length plus iteration.
- Use `Sequence[T]` when the method needs ordering, indexing, or slicing.
- Use `MutableSequence[T]` or `list[T]` when the method mutates the collection.
- Use `Mapping[K, V]` for read-only dictionary-like access.
- Use `MutableMapping[K, V]` or `dict[K, V]` when the method mutates the mapping.

Do not annotate a parameter as `Iterable[T]` and then call `len()`, index into it, sort it in place, or convert it to a list just to use capabilities the annotation did not promise. Either ask for the honest type or move the materialization to the boundary where the ownership decision is visible.

Do not overcorrect this rule. A method may accept `Iterable[T]`, call `sorted(iterable)`, and return `list[T]` when the method's purpose is to create an ordered materialization. `sorted()` itself accepts an iterable; the input contract remains least-capability and the return annotation honestly advertises the stronger output. Consuming the iterable is not a contract violation in this shape because `Iterable` promises one-pass iteration, not reusability.

For return values, return the most honest domain type the caller is meant to rely on. Do not hide a concrete domain model behind `object`, `Any`, a broad protocol, or an under-specified collection when callers need its real capabilities. Conversely, do not promise a mutable concrete type when callers should only receive an immutable DTO or read-only view.

The primary exception is the factory pattern: a factory method whose purpose is to choose one of several polymorphic implementations should return the base abstraction that callers are meant to program against. In that case, returning the base class, abstract base class, or protocol is the honest contract because the concrete subtype is deliberately hidden behind the polymorphic boundary.

```python
# GOOD - factory returns the polymorphic contract callers should use
def create_gateway(gateway_kind: GatewayKind) -> Gateway:
    if gateway_kind == GatewayKind.OPENAI:
        return OpenAIGateway()
    if gateway_kind == GatewayKind.AZURE_OPENAI:
        return AzureOpenAIGateway()
    raise UnsupportedGatewayKindException(gateway_kind)
```

This is different from a normal query or builder that always creates one known concrete type. If there is no polymorphic selection, return the concrete domain type or `Self` as appropriate.

The guiding rule is simple: parameter types should avoid demanding unnecessary power; return types should not conceal useful guarantees.

---

## String Properties

No empty strings. A string either has a valid value or is nullable (None).

Design should be to prevent None unless it makes sense or is a business requirement or other constraint.

**Why disallow the empty string?** It is the classic *string trap*: `""` passes a `str` type check but almost always violates a domain invariant ("a name", "a path", "a SKU": none of these are meaningfully empty). Allowing empty strings forces every downstream method to add a defensive `if not value` check that the type system itself should have eliminated. If "no value" is a legitimate state, model it as `None`; if only meaningful strings exist, type the field as `str` and validate at the boundary so internal code can trust it (see Chapter 6).

---

## Modern Type Annotations (Python 3.11+)

The codebase targets Python 3.14. Use the modern typing features below where they apply: they make intent explicit and let pyright catch a class of refactoring bugs that older annotations miss.

### `Self`: Builder, Factory, and Fluent Returns

When a method guarantees the same runtime type as the receiver, annotate the return as `Self` (from `typing`), not the hardcoded declaring-class name. This includes methods that return `self`, fluent and clone methods, and classmethods that construct or return `cls(...)`.

```python
from typing import Self

class CapabilityRequestBuilder:
    def with_max_tokens(self, max_tokens: int) -> Self:
        self._max_tokens = max_tokens
        return self

    def with_temperature(self, temperature: float) -> Self:
        self._temperature = temperature
        return self
```

Why `Self`, not `CapabilityRequestBuilder`:

1. **Subclass-correct.** If `SpecializedRequestBuilder(CapabilityRequestBuilder)` calls `.with_max_tokens(...)`, the return type is `SpecializedRequestBuilder`, what the caller actually has, not the parent. The hardcoded name silently lies in subclasses.
2. **Refactoring-safe.** Rename the class and the `Self`-annotated methods need no edits.

`Self` is a runtime-type promise, not a naming convention. Do not require it for a static or ordinary factory that intentionally constructs one fixed concrete class. A polymorphic factory that selects among concrete implementations should return the base class or protocol that callers are intended to use; hiding the selected implementation is the factory's honest public contract.

### `@override`: Document Subclass Intent and Catch Refactoring Bugs

When a method overrides a member declared by an explicitly inherited base class or protocol, decorate it with `@override` (from `typing`, Python 3.12+).

```python
from typing import override

class ExtractionGatewayException(GatewayException):
    @property
    @override
    def reason(self) -> str:
        return "Capability extraction failed"
```

Why `@override` matters:

1. **Catches signature drift.** If a base method gets renamed or its signature changes, every subclass override marked `@override` becomes a type error at the override site; pyright tells you immediately. Without `@override`, the subclass silently becomes a new (unrelated) method and nothing breaks until runtime when callers go through the base.
2. **Documents intent.** A reader of the subclass knows this is a deliberate override, not an accidental name collision.

Apply it to every proven override: properties, `__aenter__`, `__aexit__`, `__str__`, `reason`, and domain-specific methods. Do not require it for `__init__` or `__init_subclass__`. Structural protocol conformance without explicit inheritance is not an override declaration, and a matching method name alone is not proof of an override.

`@override` says that a method deliberately replaces a parent member; it does not close the inheritance chain. Whether a concrete descendant should be `@final` is a separate Class Design decision.

### `type` Aliases (PEP 695)

For a type-level domain concept, use the `type` statement (Python 3.12+) instead of `TypeAlias`, `TypeAliasType`, or a bare assignment whose type intent is otherwise ambiguous.

```python
# Modern (Python 3.12+)
type DocumentId = str
type PageIndex = int
type CapabilityByPage = dict[int, list[ExtractedCapability]]

# Old style
DocumentId: TypeAlias = str  # don't use
DocumentId = str             # invisible to type checkers as an alias
```

Why:

1. **Lazy-evaluated.** The right-hand side is not evaluated at module load; forward references work without quoted strings.
2. **Explicit.** `type X = ...` is unambiguous to readers and to pyright/mypy; bare assignments look like module-level state.
3. **Generic-friendly.** PEP 695 also brings the new generic-class syntax (`class Foo[T]: ...`); when you need it, type aliases align with the same grammar.

One clear declaration is enough; an alias does not need two use sites before its intent is legitimate. An explicit `TypeAlias`/`TypeAliasType` declaration proves type intent by itself, and one annotation use is enough to prove that a bare assignment is being used as a type. Do not convert runtime compatibility aliases, class re-exports, constants, or ordinary module state into PEP 695 aliases. Avoid a private alias that merely adds indirection to one otherwise clear annotation without domain or public-contract meaning.

### `NoReturn` for Terminal Helpers

Annotate a domain exception translator, classifier, or terminal raising helper whose every reachable path raises as `-> NoReturn` or the equivalent `-> Never`. Both bottom types truthfully state that control cannot return to the caller.

This rule is deliberately narrow. A conditional validation guard such as `_raise_if_negative(...)` returns normally for valid input and therefore returns `None`, not `NoReturn`. Do not apply the PWI rule to unrelated non-returning functions such as infinite event loops, `sys.exit()` wrappers, or test helpers that always raise `ImportError`. The reviewer must be able to prove from the complete helper control flow that every path raises a domain exception directly or delegates to another proven terminal domain helper.

---

## Code Review Checklist

When reviewing type annotations and data structures, verify:

### Type Annotations
- [ ] All ordinary class members are type annotated; `Enum` members are excluded
- [ ] All method parameters are type annotated
- [ ] Local variables use inference only when the right-hand side and variable name make the type obvious to a human reader
- [ ] Local variables starting as `None` or empty collections have explicit type annotations
- [ ] Local variables are not initialized with placeholder values merely to avoid an explicit annotation
- [ ] Collection types specify their contents (`list[str]`, not `list`)
- [ ] Built-in collection types used (not `typing.List`, `typing.Dict`)
- [ ] Callbacks are fully annotated; lambdas have an explicit typed callable context establishing parameter and return types

### None Usage
- [ ] `| None` only used when absence has clear, intentional meaning
- [ ] No defensive `| None` "just in case"
- [ ] Local `| None` reflects a real branch or external contract, never defensive placeholder state
- [ ] Instance variables set in `__init__` don't use `| None` unless legitimately optional
- [ ] Each `| None` represents a deliberate design decision

### Dictionary Usage
- [ ] Complex dictionaries (`dict[str, Any]`) confined within single methods
- [ ] Complex domain dictionaries do not cross method boundaries; raw invalid validator fixtures retain their narrow exclusion
- [ ] Return types use proper models, not `dict[str, Any]`
- [ ] Simple dictionaries have clear, consistent types (`dict[str, str]`)
- [ ] Nested structures replaced with frozen dataclasses or Pydantic models

### Honest Capability Types
- [ ] Parameter annotations ask for only the capabilities the method uses (`Iterable`, `Collection`, `Sequence`, `Mapping`, mutable variants as appropriate)
- [ ] Code does not annotate broadly and then cast/materialize/index to recover capabilities it needs
- [ ] Return annotations expose the honest domain type and guarantees callers are meant to rely on

### String Properties
- [ ] No empty string checks - strings are either valid or None
- [ ] String properties designed to prevent None unless business requirement

### Modern Type Annotations (Python 3.11+)
- [ ] Methods that guarantee the receiver's runtime type use `Self`; fixed and polymorphic factories retain their intentional concrete or base-abstraction contracts
- [ ] Proven overrides of explicitly inherited members use `@override`; `__init__`, `__init_subclass__`, and structural-only protocol conformance are excluded
- [ ] Type-level domain aliases use PEP 695 `type X = ...`; runtime aliases and re-exports remain ordinary assignments
- [ ] Terminal domain exception helpers whose every path raises use `NoReturn` or `Never`; conditional guards remain `-> None`
