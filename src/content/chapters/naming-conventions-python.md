---
title: Naming Conventions
description: >-
  Naming a thing for what it is: variables named after their type, methods that state the domain outcome, and why inventing a fresh name at each site is where wrong names come from.
datePublished: 2017-09-20
hero: chapter-naming-conventions-python
dateModified: 2026-09-19
tags:
  - naming
  - python
  - method-design
section: pwi
topic: naming-conventions
language: python
pillar: programming-with-intent
---

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Express your intent in code, not comments"
- "Don't make me think"
- "Don't make me wonder"
- "Don't invent names"

---

## Variable and Parameter Naming

### 1.1 Single Instance in Scope

Use the complete type name (converted to snake_case) as the base of the variable or parameter name. This applies to parameters, local variables, and class member/property names. Use the base alone when no meaningful role needs expressing.

**Strict Adherence to 'Type Name as Variable Name' for Single Instances:**

When there is only one instance of a user-defined complex type active in the current, narrow scope (local variable, parameter), its name MUST retain the complete snake_case type name. Built-in exceptions such as `RuntimeError`, `ValueError`, and `Exception` are not user-defined classes; this rule does not require subtype-derived names for them.

**Comparison and arrangement roles:** `expected_`, `actual_`, and a meaningful arrangement or disambiguating qualifier may precede the complete type-derived base. The role must be established by supplied code: `scripted_order_placement_result` identifies a hook's arranged return; `actual_fulfillment_notification_payload` identifies the received representation; `actual_extra_fulfillment_notification_payload` distinguishes an additional observation. These roles remain meaningful when expected and actual have different types or the counterpart is a field of an aggregate. Do not require a second same-type local merely to justify them. A type name already beginning with `Expected` or `Actual` supplies that role once; do not double the prefix.

This permission does not permit a shortened synonym: `actual_fulfillment_message` does not retain `FulfillmentNotificationPayload`. A declared, named structured representation such as a `TypedDict` retains its complete name even though its runtime storage is a dictionary; it is distinct from an anonymous `dict` annotation. For `T | None`, retain the named `T` base when present, without adding an invented `optional` noun. Collections retain the complete element type name with ordinary pluralization. This does not grant a generic exception alias exemption for a specifically annotated application exception. Tests use Chapter 50 for local naming; reusable asserter parameters and support code retain this chapter's full-type and meaningful-role contract. A built-in exception caught as `e` is outside full-type naming; a specifically identified application exception is not.

- Avoid common but unnecessary prefixes or suffixes such as `new_`, `current_`, `the_`, `a_`, `an_`, `_obj`, `_instance`, `_item`, `temp_` when they do not serve to disambiguate between multiple, simultaneously active variables of the exact same type within that same narrow scope.
- The primary goal is to eliminate the need for readers to learn a secondary, "invented" name when the type name itself is already (or should be) descriptive. If the type name feels insufficient for a variable name, it's a strong signal the type name itself needs refinement.

**Python Underscore Convention:**

When converting type names to variable names, follow standard Python conventions for underscore prefixes:

- **Type names with underscore prefix** (e.g., `_PrivateClass`) indicate module-private classes - the underscore signals "internal implementation, don't import directly"
- **Local variable names should NOT include the underscore prefix** - local variables are already scoped to the function and don't need privacy markers
- Only use underscore prefix on variables when following Python's standard convention (e.g., `_` for unused variables, `_internal` for internal module-level variables)

```python
# Type is module-private (underscore prefix)
@dataclass(frozen=True)
class _CachedRfxDocumentData:
    pdf_bytes: bytes
    page_count: int

# Local variable drops the underscore (already local scope)
cached_rfx_document_data: _CachedRfxDocumentData = get_cached_data()  # GOOD

# Don't copy the underscore to local variable names
_cached_rfx_document_data: _CachedRfxDocumentData = get_cached_data()  # BAD - unnecessary underscore
```

**Example:**

```python
# Given a class:
# class UserProfile: ...
# class SystemConfiguration: ...
# class OrderItem: ...

# GOOD - Type name used as variable name for single instance
def process_user(user_profile: UserProfile) -> None:
    # ...
    pass

system_configuration: SystemConfiguration = load_system_configuration()
order_item: OrderItem = create_order_item()

# BAD - Invented prefix/suffix when not needed for disambiguation
def process_user(the_user_profile: UserProfile) -> None:  # "the_" is unnecessary
    # ...
    pass

new_system_configuration: SystemConfiguration = load_system_configuration()  # "new_" is unnecessary if it's the only one
current_order_item: OrderItem = create_order_item()  # "current_" is unnecessary if it's the only one
```

If you find yourself needing to distinguish between `user_profile_active` and `user_profile_archived`, this falls under rule 1.2 (Multiple Instances in Scope), where suffixes are used for disambiguation based on business intent.

### Reusable Asserter Comparison Parameters

Reusable asserters, including non-throwing comparisons and terminal assertion
wrappers, name the specification parameter `expected_<domain_intent>` and the
observed parameter `actual_<domain_intent>`. A named application type retains
its complete snake_case base, including a named TypedDict or T in T-or-None;
its own Expected/Actual prefix already carries the role. Configuration,
context, count, arrangement, and unpaired prerequisite parameters are not
comparison sides merely because they occur in an asserter. Prove each role
from the supplied comparisons, including unlike representations and values
inside aggregates. Domain suffixes alone do not replace a comparison prefix.

Operational owner: `pwi.naming-conventions.asserter-comparison-parameter-roles`.
A missing role on an otherwise conforming base is one warning per parameter.
When a named type base also needs repair, the existing full-type rule owns one
rename including both corrections. When a primitive or collection base lacks
its required domain meaning, that existing naming rule owns the combined
base-and-role rename at its usual severity, including error for a vague
primitive/scalar parameter. Do not duplicate that correction under the role
rule. Chapter 52 owns class
and public assertion-method spelling, and Chapter 50 owns collected test names.

### 1.2 Multiple Instances in Scope

Use the format `type_name_business_intent`, or a justified comparison/arrangement prefix followed by the complete type name, where:

- `type_name` is the object's type (in snake_case).
- `business_intent` describes its distinct business purpose or differentiating characteristic, using domain language. This suffix is crucial for disambiguation.

**Examples:**

```python
def compare_models(
    azure_openai_config_gpt_5_mini: AzureOpenAIConfig,
    azure_openai_config_gpt_5_nano: AzureOpenAIConfig
) -> None:
    # ...
    pass

azure_openai_config_marketing: AzureOpenAIConfig = get_azure_openai_config(model_name="gpt-5-mini-marketing")
azure_openai_config_support: AzureOpenAIConfig = get_azure_openai_config(model_name="gpt-5-mini-support")
```

Do not use non-descriptive or purely technical qualifiers such as `config1`, `primary_config`, `secondary_config`, `item1`, `item2` etc., when a business-driven or domain-specific differentiator is available.

**Note:** If you find yourself struggling to create meaningful `business_intent` suffixes, it may indicate that your type names need refinement or the scope of your function/method is too broad and handling too many distinct concepts of the same type. Fix the type names or refactor the code rather than creating artificial variable names.

### 1.3 Abbreviations

Abbreviations are acceptable only if they are well-known and universally understood within the team and organization.

If the "config" suffix is used for one configuration type, it must be used for all configuration types.

Use the business's actual vocabulary. If the business uses a specific acronym or term of art, use that spelling consistently instead of inventing a more technical synonym. If the code is talking about invoices, subscriptions, renewals, RFQs, or TOCs, the names should use those terms directly.

Rename without fear when understanding improves. A name that was good during discovery may become too vague once the domain becomes clearer. Fix the type, method, or variable name rather than adding comments to explain the old one.

### 1.4 Primitives, Collections, and Dictionaries

**Primitives:** Use business/domain names to describe their role and purpose. The "type name as variable name" rule does **not** apply to primitive types (str, int, float, bool) - these require descriptive names that convey business meaning.

**Key principle:** Name describes **what the value represents**, not what type it is.

```python
# GOOD - Descriptive business/domain names for primitives
user_id: str = "12345"
max_retry_count: int = 3
is_active_user: bool = True
document_name_without_extension: str = Path(document_name).stem  # Clear what this string represents
connection_timeout_seconds: float = 30.0

# BAD - Using type name or generic terms
string_value: str = "12345"  # What does this string represent?
integer: int = 3  # What is this counting?
flag: bool = True  # What condition does this indicate?
stem: str = Path(document_name).stem  # "stem" is a Path API term, not business meaning
document_stem: str = Path(document_name).stem  # Still too generic - stem of what for what purpose?
```

**Why `document_name_without_extension` is better than `document_stem`:**

- `stem` is a technical term from the Path API, not domain language
- Business stakeholders understand "without extension" immediately
- Name documents its purpose (will be used in output filenames)
- Descriptive names prevent confusion when code is maintained months later

Avoid overly generic names like `value`, `string`, `number`, `data`, `result` unless the context is exceptionally clear and the scope is very narrow (2-3 lines).

Purely technical local values may use plain technical names when there is no domain meaning to add and only one such value exists in scope:

```python
# GOOD - one obvious technical object
http_client: httpx.AsyncClient = httpx.AsyncClient()
html: str = response.text

# GOOD - multiple technical objects need business intent
http_client_identity: httpx.AsyncClient = create_identity_client()
http_client_billing: httpx.AsyncClient = create_billing_client()
```

Do not force business language onto a value that is genuinely just a technical object. Do add intent as soon as there are multiple objects of the same technical type or the value represents a domain concept.

**Collections (lists, sets):** Use the plural form of the specific domain entity or data item they contain. The name should clearly indicate what the collection holds.

- Example: `users: list[User]`, `order_items: list[OrderItem]`, `customer_profiles: list[CustomerProfile]`.
- For collections of raw data (e.g., dictionaries fetched from a database or API before being mapped to DTOs), the name should still reflect the underlying domain concept these raw items represent.
- Example: If fetching raw data that will become User DTOs, use `raw_user_data_items: list[dict]` or `user_dictionaries: list[dict]` rather than a generic `raw_data` or `raw_entities`.
- The prefix `raw_` can be used to distinguish pre-DTO collections from collections of DTO instances, but the core noun (e.g., `user_data_items`) should still be domain-specific.

**Dictionaries/Maps:** This applies to anonymous key/value maps; a named structured representation such as TypedDict instead retains its complete declared type name. Use a plural form representing the collection of values, or a name describing the mapping relationship, typically `key_description_to_value_description_map` or `value_description_by_key_description_map`. The key components should be domain-specific.

- Example: `user_orders_map: dict[UserId, list[Order]]`, `customer_balances_dict: dict[CustomerId, BalanceAmount]`, `product_stock_by_sku_map: dict[ProductSKU, StockQuantity]`.

---

## Method Naming

Method names, parameter names, local variable names should be descriptive, full form and convey their intended use/purpose. No shortforms unless the shortforms are well known and understood, e.g. TOC

Chapter 52 exclusively owns a public dedicated assertion-wrapper rename under
`pwi.test-assertions.public-assertion-method-name`. Do not duplicate that same
rename as method intent here; non-throwing comparison/report methods remain
eligible for an independently proved ordinary method-intent defect.

Method and function names should reflect their domain/business intent, not technical implementation:

- Good: `calculate_invoice_total`, `send_marketing_email`
- Bad: `process_data`, `handle_request`

For purely technical or private helper functions where no business meaning applies, technical names may be used, but this should be the exception.

**Retrieve vs Search: the name chooses the failure semantics**

Two different query intents get two different verbs, and the verb tells the caller whether an exception is possible:

- `retrieve_*` (by identity): the caller asked for a specific thing that should exist. If it does not, the method **raises**. It never returns `None` or an empty result as an apology.
- `search_*` / `find_*` (by criteria): an empty result is a valid answer, returned as an empty collection, the Google contract: no matches is not an error.

```python
# Raises MovieNotFoundError if absent - the name says so
async def retrieve_movie(self, movie_id: MovieId) -> Movie: ...

# Empty tuple is a legitimate answer - the name says so
async def search_movies(self, criteria: MovieSearchCriteria) -> tuple[Movie, ...]: ...
```

Avoid ambiguous `get_*` for a public domain query when supplied identity/criteria and absence behavior establish that retrieve/search semantics matter to the caller. This is a warning anchored at that public declaration, requiring complete method/caller or contract evidence. Technical property access, framework-required names, and unproven domain-query semantics are excluded. Pick the verb pair once per codebase and apply it consistently. Chapter 9 exclusively owns retrieve/search absence contracts and mid-flow name consistency; Chapter 5 excludes the same return-or-raise correction. For `get_*`, Chapter 9 owns the ambiguous-verb rename only; Chapter 5 may independently own a proved single-entity return-contract defect, without duplicate return-or-raise recommendations.

**Names Don't Change Through the Flow**

A business operation keeps **one name across every layer it flows through**. If the business calls it *create movie*, then the manager method is `create_movie`, the data manager method is `create_movie`, and the stored procedure or persistence operation is `create_movie`. We don't invent names mid-flow.

```text
# GOOD - one operation, one name, every layer (Manager -> Data Manager directly)
MovieManager.create_movie
    -> MovieDataManager.create_movie -> sproc create_movie

# BAD - three names for one operation; every trace requires translation
MovieManager.create_movie
    -> MovieDataManager.save_movie_record -> sproc usp_AddMovie
```

Renaming at a layer boundary is justified only when the boundary genuinely changes the concept (a gateway translating an external vendor's vocabulary into domain vocabulary, see Chapter 12). Between layers you own on both sides, a name change is noise: it costs a translation at every trace, every debug session, and every review.

---

## Comments and Docstrings

Comments and docstrings are part of the same intent-expression contract as names. The goal is not "no docstrings"; the goal is that code should not need comments or docstrings to explain obvious what. Names, signatures, type annotations, and method shape should carry the normal explanation burden.

Use comments or docstrings when they explain why, constraints, domain context, boundary behavior, protocol quirks, regex meaning, or public API intent that cannot fit cleanly into a readable name.

Do not use docstrings to duplicate parameter names, return types, or type information already expressed by annotations. Do not use comments to narrate the next line of code. If a comment is needed because a variable, method, or intermediate step has a vague name, fix the name or method shape first.

### The Explanation Test

A compensating what-comment is a `suggestion`; a missing comment identifying
an external constraint or justified non-obvious choice is a `warning`. An
independently bad name or method shape keeps its own rule and severity.

If a colleague has to ask you to explain a piece of code, the correct response is not an explanation, and not a comment. It is "let me fix the code." The request itself is the finding: an experienced reader could not follow what the code is doing, which means the names, shape, or structure failed. Explaining it (verbally or in a comment) treats the symptom and leaves the defect in place for every future reader, who will have to ask again.

One boundary on this rule: explaining the **business domain** is legitimate. A reader may genuinely not know what a rate lock or a policy endorsement is, and no code shape can teach them the insurance industry. But if what needs explaining is *the code*: what this block does, what this variable holds, or why control ends up here, you have already lost the battle. Fix the code.

The comments that survive this test are the whys the code cannot express:

```python
# GOOD - Workaround for a tooling/library defect, with the reason pinned.
# orjson 3.9 mis-serializes timezone-aware datetimes inside tagged unions
# (see orjson#412); route through str() until the fix ships.
serialized_payload: str = json.dumps(payload, default=str)


# GOOD - Empirically chosen approach that would otherwise look like the wrong pick.
# Linear scan beats the index here: profiling on production-sized batches
# (2026-05) showed dict construction cost dominates below ~200 items.
matching_record: Record | None = next(
    (record for record in records if record.key == target_key), None
)
```

Both comments answer "why is it done this way?": a question the code cannot answer, because the answer lives outside the code (a bug tracker, a profiling session). Neither explains *what* the code does.

```python
# GOOD - Docstring explains domain behavior that would make the name awkward.
def normalize_customer_name(customer_name: str) -> str:
    """Preserve legal suffixes while applying display-name casing rules."""
    ...


# GOOD - Comment explains a surprising exception.
if customer_name.startswith("Mc"):
    # Brand exception: "McDONALD" must stay fully capitalized in legacy exports.
    return customer_name


# BAD - Docstring duplicates the signature.
def get_timeout(settings: LlmSettings) -> int:
    """
    Get the timeout value.

    Args:
        settings: The LLM settings object.

    Returns:
        int: The timeout in seconds.
    """
    return settings.timeout_seconds


# BAD - Comment narrates obvious code.
# Split the result into lines
items: list[str] = result.split("\n")
```

---

## Don't Invent Names

The principle "Don't Invent Names" is primarily targeted at variables holding instances of complex types. If a type name is well-chosen (descriptive and unambiguous), then that type name (in snake_case) is the best variable name for a single instance of that type.

**Example 1 (Illustrating a bad type name leading to an invented variable name for a collection):**

```python
lines: list[str]  # BAD - Type name 'str' is too generic. "Lines of what?" Reader will need to find where 'lines' is instantiated.
markdown_lines: list[str]  # GOOD - Variable name is more descriptive. Ideally, if these are distinct items,
                          # one might even consider a type alias or simple DTO if 'MarkdownLine' has specific meaning.
                          # But for simple list[str], markdown_lines is a good descriptive variable name for the collection.
```

**Example 2 (Illustrating an invented variable name because the type name was not good enough):**

```python
# BAD TYPE NAME leads to an INVENTED VARIABLE NAME
# Type name 'TocLocation' is okay, but perhaps not specific enough to be used directly as a variable.
found_location_for_item = TocLocation(
    page_number=page_number,
    # ...
)

# If you feel the need to invent a variable name for a single instance
# (like 'found_location_for_item') rather than using the type name ('toc_location'),
# then you've likely not named the TYPE correctly to convey its full intent.

# GOOD - Improve the TYPE NAME, then use the type name as the variable name (Rule 1.1)
# Type name changed to 'TocItemLocation' to be more specific.
toc_item_location = TocItemLocation(  # Variable name 'toc_item_location' matches the improved type name.
    page_number=page_number,
    # ...
)
# You wouldn't have a location if you didn't find an item; the type name conveys this.
```

The core idea is: Invest effort in clear, precise type names. This makes variable naming for single instances straightforward (use the type name) and provides a strong base for disambiguating multiple instances (`type_name_suffix`). If naming a variable for a single instance of a type feels awkward using just the type name, the type name itself is the primary suspect for improvement.

---

## Multiple Variables of the Same Type

When you need multiple variables of the same type in the same scope, use the type name with a meaningful suffix that clearly differentiates them based on business intent or domain context, as per rule 1.2 (`type_name_business_intent`).

**Example:**

```python
toc_item_location_page_one: TocItemLocation
toc_item_location_page_two: TocItemLocation
```

The qualifier should have meaning in the domain and clearly convey the distinct purpose or context of the variable. Expected/actual and meaningful extra-observation qualifiers may precede the complete type name. Avoid generic suffixes like `_1`, `_2`, `_a`, `_b` if a domain-relevant distinction can be made.

---

## Tuple Unpacking and Return Values

When unpacking tuples returned from methods, the variable names at the call site **must** follow the same naming conventions as any other variable. Pre-declare type annotations before unpacking to maintain clarity and strong typing.

**Core Principle:** The variable names used when unpacking a tuple should match the conceptual names of what's being returned, following the "type name as variable name" convention.

**Pattern for Tuple Unpacking:**

```python
# GOOD - Pre-declared type annotations with proper variable names
vision_metadata_by_page: VisionMetadataByPage
content_start_page: int
(vision_metadata_by_page, content_start_page) = await self._execute_phase_2(...)

# GOOD - Multiple complex types with full annotations
toc_items_by_page: dict[int, list[TocItem]]
structural_heading_candidates_by_page: dict[int, list[StructuralHeadingCandidate]]
(toc_items_by_page, structural_heading_candidates_by_page) = await self._execute_phase_3(...)

# BAD - Abbreviated or invented names
metadata, start_page = await self._execute_phase_2(...)  # What metadata? What start page?
items, candidates = await self._execute_phase_3(...)  # Too generic

# BAD - Missing type annotations
vision_metadata_by_page, content_start_page = await self._execute_phase_2(...)  # No types declared
```

**Why Pre-Declare Types:**

1. **Readability** - Reader immediately sees what types are expected before the unpacking
2. **Strong Typing** - Compiler/IDE can verify the types match
3. **Self-Documentation** - The type annotations document the method's return structure
4. **Consistency** - Follows the same pattern as other variable declarations

**When to Consider Alternatives:**

If a method returns more than 2-3 values in a tuple, consider:

1. **Creating a result DTO** - A frozen dataclass or Pydantic model with named fields
2. **Splitting the method** - Perhaps the method is doing too much
3. **Using out parameters** - Pass mutable containers (less preferred in Python)

However, for 2-3 related values that are always used together, tuples with disciplined naming at call sites are perfectly acceptable and avoid unnecessary class proliferation.

---

## Constants

If a domain-significant string represents the same intended value more than once in a production class, declare it as a class constant as `Final[str]`. Equal spellings in independent semantic roles do not establish a shared value. Language syntax, ordinary punctuation, short whitespace scaffolding, protocol-mandated tokens, and empty strings do not require extraction solely because they repeat. Significant repeated domain fragments in formatted strings remain eligible. Chapter 50 owns literals in test methods, including its typed per-scenario locals; do not impose class constants on those values through this chapter.

---

## Code Review Checklist

When reviewing naming, verify:

### Single Instance Variables
- [ ] Variable name is snake_case version of type name for single instances
- [ ] No invented prefixes (`the_`, `new_`, `current_`, `a_`) when only one instance exists
- [ ] Local variables from private types don't carry the underscore prefix

### Multiple Instance Variables
- [ ] Complete type base retained, with a domain suffix or justified comparison/arrangement prefix
- [ ] Suffix describes business purpose, not technical qualifier (`_1`, `_2`)
- [ ] Suffix uses domain language
- [ ] Business acronyms and terms of art are used consistently with the business vocabulary

### Primitives and Collections
- [ ] Primitive variables describe what value represents, not type
- [ ] No generic names like `value`, `data`, `result`, `string`, `number`
- [ ] Technical local values use plain technical names only when no domain meaning exists
- [ ] Collections use plural form of domain entity
- [ ] Dictionaries describe the mapping relationship

### Method Names
- [ ] Methods describe domain/business intent, not technical implementation
- [ ] No generic names like `process_data`, `handle_request`
- [ ] Full words used (no abbreviations unless universally known)

### Comments and Docstrings
- [ ] No docstrings that merely repeat parameter names, return types, or annotations
- [ ] No comments that narrate obvious what instead of useful why
- [ ] Comments explain constraints, domain context, protocol quirks, regexes, or surprising decisions
- [ ] Code that needed explaining (in review, in a comment) was fixed instead: the explanation request is the finding
- [ ] Why-comments that record workarounds or empirically validated choices cite the external reason (bug reference, profiling result)
- [ ] Public API docstrings explain consumer-facing purpose or behavior when names and types are not enough
- [ ] A comment/docstring is not compensating for a vague name or muddled method structure

### Tuple Unpacking
- [ ] Type annotations pre-declared before unpacking
- [ ] Variable names follow "type name as variable name" convention
- [ ] No abbreviated or generic names at unpack site

### Constants
- [ ] Repeated domain strings with one shared meaning declared as class constants; test-method values use Chapter 50
- [ ] Constants typed as `Final[str]`
