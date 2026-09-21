---
title: Validation and Exception Handling
description: >-
  Lock the front door and the back doors, fail fast and visibly, exception messages that carry diagnostic context, and a logging policy that does not swallow failure.
datePublished: 2017-09-20
dateModified: 2026-09-19
tags:
  - error-handling
  - python
  - architecture
section: pwi
topic: validation-exception-handling
language: python
pillar: programming-to-exceptions
---

> **PWI responsibility boundary:** The organizational review lens owns
> validation placement, gateway translation, structured diagnostic context,
> exception taxonomy, and centralized boundary logging. Native language review
> owns generic catch correctness, swallowing, chaining, and concurrent-exception
> mechanics. Generated PWI review guidance must exclude those native concerns.

## Relevant Aphorisms

Canonical definitions live in the [Aphorism Glossary](/pwi/aphorisms/).

- "Lock the front door, lock the back door so you're safe in the house"
- "Don't let the boogieman in"
- "Caveat emptor"
- "Fail fast and fail visibly"
- "Rule of thirds"

---

## Validation Philosophy - "Lock the Doors"

Validations should only occur at the entry points ("doors") of the system, not throughout the codebase:

**Front Door:**

- Domain boundaries where data enters the system
- NOT at the API layer

**Back Doors:**

- Service calls (Gateways) - validate responses and translate protocol errors to custom exceptions
- Configuration - use a Configuration provider that returns strongly typed values after validation

All validations should throw custom exception types specific to the failure
contract, with meaningful, useful messages. If a value has a finite set of
possibilities, include that in the message. Identify the invalid value when
safe; never echo credentials or raw secret-bearing input to satisfy diagnostics.

Exceptions should carry detailed diagnostic data:

- Variable values
- Parameter values
- Step/stage where the issue occurred

Inside the system, avoid redundant validations - fix the root cause at the boundary.

When reviewing structured logging and exception context, report only concrete failures in the current code path:

- Do not claim mutation/corruption of exception context unless you verify the code is mutating shared internal state rather than a defensive copy returned from a property/helper.
- Do not report hypothetical secret leakage unless the current implementation actually emits, stores, or propagates the sensitive value.
- Do not escalate rare or contrived interpreter edge cases unless they are realistic for the package boundary being reviewed.

---

## Exception Handling - "Fail Fast and Fail Visibly"

Embrace exceptions for the value they bring rather than treating them as the enemy:

- Exceptions do not return. Throwing an exception means the current operation cannot fulfill its contract and cannot continue.
- Unless you can truly "handle" an exception (like retry logic), don't catch it
- Write only the happy path, letting exceptions propagate
- For specific errors (like database exceptions), catch, translate to custom exceptions with more useful business context, and rethrow
- Catch exceptions only in the designated outer boundary catcher. In an HTTP service that is middleware or a centrally registered exception handler before the route handler; the route handler itself never catches.
- No logging of exceptions anywhere except that designated outer boundary catcher
- Use inheritance for exception hierarchies (one of the few places where inheritance is preferred)
- Create specific, non-generic exceptions rather than "reusable" exceptions
- Special handling may exist for "retries exhausted" exceptions that would be reattempted later

Action and Query method contracts are defined in the Method Design chapter. The exception layer supports those contracts: actions return `None` or raise, and queries return the claimed type or do not return at all.
The Method Design chapter's narrow process-exit protocol exception also
applies: a CLI adapter may return its exit status while domain actions raise.

### Meaningful Handling

Catching an exception is justified only when the catch block takes meaningful action. Logging is not handling. Catching and rethrowing is not handling unless the exception is translated or enriched with context. Empty catch blocks are never handling.

Meaningful handling includes:

- Retrying a transient operation with a deliberate retry policy
- Switching to a backup provider or fallback path when the business contract allows it
- Opening or respecting a circuit breaker to prevent cascading failures
- Translating a provider/SDK exception into a domain exception with richer context
- Converting a domain exception into a boundary response in the designated outer boundary component

If the current layer cannot take meaningful action, do not catch the exception. Let it propagate with its context intact.

### Boundary Catch Strategy

For an HTTP service, the boundary catcher is middleware or a centrally registered exception handler, never the route handler. The route handler reads and converts the wire request, calls the domain once, composes the response, and lets every exception escape untouched; the staged Chapter 56 under `source/teaching_drafts/` owns that service-boundary split. A non-HTTP host without middleware may put the same single catch at its outer adapter.

At public system boundaries, catch exactly two categories:

1. The domain's base exception type. These are expected, first-class failure modes created by the system.
2. Unexpected exceptions. These are potential bugs or unclassified external failures and should be treated as critical/unexpected failures.

The boundary is where exceptions are logged, translated to API/UI/service responses, and enriched with the full input state that triggered the operation. Do not scatter logging throughout internal code.

Because there is exactly one logging boundary, there is exactly one place to **sanitize**: the boundary scrubs secrets, tokens, credentials, and sensitive payloads from exception context and request state before emitting the log. This is defense in depth: raise sites already keep secrets out of context data (see Exceptions as Reproduction Packages), and the boundary enforces it regardless of what an exception happens to carry.

### Technical vs Business Exception Branches

Beneath the domain's base exception, define exactly two branches, and make every custom exception descend from one of them:

```python
class MyAppError(Exception): ...            # domain base

class MyAppBusinessError(MyAppError): ...   # the caller must fix it
class MyAppTechnicalError(MyAppError): ...  # we must fix it
```

- **Business exceptions**: a requirement was not met by the caller, for example invalid input, out-of-range date, unknown identifier, failed login. The system is fine; the caller (user or consuming system) has something to correct. These are the exceptions you throw of your own accord when you don't like what you were given.
- **Technical exceptions**: the system's own machinery failed, for example misconfiguration, unreachable database, malformed file, provider outage. Nothing the caller sends differently will help; an operator or developer must intervene.

The branch is load-bearing downstream: boundaries map business exceptions to 4xx-style caller-facing responses and technical exceptions to 5xx-style responses with critical logging/alerting; monitoring treats a spike in business exceptions as caller behavior and a spike in technical exceptions as an incident. The branch also decides **who gets woken up**: business exceptions are triageable by analysts and support staff without paging the dev team; technical exceptions are dev/ops' problem and should reach them. When defining a new custom exception, choosing its branch is part of the design: "is this the caller's problem or ours?" must have an answer.

Below the two branches the hierarchy stays **broad, not deep**: one specific exception type per distinct scenario, all direct descendants of a branch. Do not build taxonomy trees within the branches.

### Foreign Exceptions Are Always Technical, and Always Diagnostic

A third category exists at triage time, though it never appears in the hierarchy: the **foreign exception**: a Python builtin (`KeyError`, `ValueError`, `TypeError`), an SDK exception, or any runtime exception that escaped to the boundary untranslated. Foreign exceptions are always technical, and they carry a second meaning: **an escaped foreign exception is itself a defect report.** It means one of:

- a **missing guard**: a door that should have validated and didn't
- a **missing translation**: a gateway or abstraction boundary that let its implementation's exception leak
- a **bad assumption**: code that trusted a condition the locked doors never actually guaranteed
- an **unhandled infrastructure condition**: a failure mode nobody classified

In a correctly built system, every exception reaching the boundary is one we authored. The boundary's `except Exception` catch exists to detect the ones that aren't: it is a defect detector, not a designed failure mode. A recurring foreign exception type in the boundary's critical logs is a to-do with an address: find the site that should have guarded or translated, and fix it there.

```python
async def translate_request_failure(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
    logger: Logger,
) -> Response:
    # Registered outer middleware; the route handler contains no catch.
    try:
        return await call_next(request)
    except PaymentDomainException as domain_exception:
        domain_exception.add_context(
            {
                "request": request.to_log_context(),  # sanitized/allow-listed
                "boundary": "payment_service",
            },
        )
        log_domain_exception_at_boundary(domain_exception, logger)
        return Response.from_domain_exception(domain_exception)
    except Exception as unexpected_exception:
        logger.critical(
            "Unexpected payment boundary failure",
            exc_info=unexpected_exception,
            extra={"request": request.to_log_context()},
        )
        return Response.internal_server_error()
```

The exact boundary mechanism can vary by framework, but the principle does not: domain exceptions are translated deliberately; unexpected exceptions are treated as bugs.
This schematic middleware's context projection and boundary logging helper
enforce sanitization. The helper uses the authored semantic branch for log
severity, and the response translator uses it for response classification; a
domain root catch does not assign every subtype the same response branch.

### Exceptions as Reproduction Packages

A strong domain exception is a structured diagnostic package, not just a stack trace. It should carry enough context to reproduce and diagnose the failure without guessing:

- Operation or step/stage
- Relevant method parameters and local decision values
- Business identifiers such as customer ID, document ID, account tier, or correlation ID
- Provider status codes, error codes, request IDs, and response snippets when safe
- Action intent or operational category when the system distinguishes user action, support action, retry, or escalation

The boundary can add the full request/input state. After enrichment, structured logs become queryable by these fields, which makes production failures reproducible and searchable.

Do not add secrets, tokens, raw credentials, or sensitive payloads to exception context. Add enough safe context to reproduce the problem.

Malformed secret-bearing inputs require special care: a bounded substring is
not redaction. A connection-string parser can report the character position,
expected syntax, and corrective action without echoing a possible password.
An empty/no-attributes branch does not prove a secret leak. Before applying
the custom-domain diagnostic rule, establish that the construction is an
authored domain exception; other exception-taxonomy questions remain separate.

### When Catching Exceptions is Appropriate

**Retry logic:**

```python
async def call_external_service(request: ServiceRequest) -> ServiceResponse:
    for attempt in range(max_retries):
        try:
            return await self._client.send(request)
        except TransientServiceError as e:
            if attempt == max_retries - 1:
                raise ServiceUnavailableException(
                    message=f"Service unavailable after {max_retries} attempts",
                    context_data={"last_error": str(e)}
                ) from e
            await asyncio.sleep(backoff_delay)
```

**Exception translation with context enrichment:**

```python
async def download_document(document_id: str) -> bytes:
    try:
        return await self._storage_client.download(document_id)
    except AzureError as e:
        raise DocumentDownloadException(
            message=f"Failed to download document {document_id}",
            log_event=DocumentSteps.Download,
            context_data={
                "document_id": document_id,
                "azure_error": str(e),
                "status_code": getattr(e, "status_code", None)
            }
        ) from e
```

### Centralized Exception Transformation (Gateway Pattern)

When a class has multiple methods that all need to transform SDK exceptions into domain exceptions, **centralize the transformation logic immediately**. This is complex code, and the "Rule of thirds" exception applies: do not duplicate even once.

Centralize the implementation, not merely repeated catch syntax. Thin catches
may retain operation-specific semantics and context while delegating provider
parsing and exception construction to one translator. It may raise directly
or return a domain exception that the caller raises with chaining. Placement,
resubmission reads, and completion recording may legitimately use distinct
translator entry points. Similar calls do not require a callback wrapper.
The emitting duplication rule remains gateway-scoped; Chapter 28 owns the
Data Manager's stored-procedure translation seam.

**Problem - Duplicated Exception Handling:**

```python
# BAD - Same exception transformation logic duplicated in every method
class BlobStorageGateway:
    async def download_blob(self, path: str) -> bytes:
        try:
            return await self._client.download(path)
        except Exception as e:  # Too broad!
            raise BlobOperationsException(
                message=f"Failed to download: {path}",
                context_data={"path": path, "error": str(e)}
            ) from e

    async def upload_blob(self, path: str, data: bytes) -> None:
        try:
            await self._client.upload(path, data)
        except Exception as e:  # Same pattern repeated
            raise BlobOperationsException(
                message=f"Failed to upload: {path}",
                context_data={"path": path, "error": str(e)}
            ) from e

    # ... repeated in delete_blob, list_blobs, blob_exists, etc.
```

**Solution - Centralized, Failure-Specific Exception Transformation:**

```python
# GOOD - one precise failure type, translated centrally with rich context
class StorageGatewayAzureAsync:
    def _raise_rate_limit_exceeded_exception(
        self,
        rate_limit_error: AzureRateLimitError,
        operation: str,
        context_data: dict[str, Any],
    ) -> NoReturn:
        exception_context: dict[str, Any] = {
            **context_data,
            "gateway_name": type(self).__name__,
            "provider_name": "Azure Blob Storage",
            "operation": operation,
            "status_code": 429,
            "retry_after_seconds": rate_limit_error.retry_after_seconds,
            "error_type": type(rate_limit_error).__name__,
        }

        raise BlobRateLimitExceededException(
            message=f"Azure Blob Storage rate limit persisted during {operation}",
            log_event=StorageGatewaySteps.RateLimitExceeded,
            context_data=exception_context,
        ) from rate_limit_error

    # Now each method is simple and consistent:
    async def download_blob(self, blob_path: str) -> bytes:
        try:
            # ... actual download logic
            return blob_bytes
        except AzureRateLimitError as e:
            self._raise_rate_limit_exceeded_exception(
                rate_limit_error=e,
                operation="download_blob",
                context_data={"blob_path": blob_path},
            )
```

Other classified failures use their own concrete exception types. Not-found, authentication, authorization, rate-limit, connection, and service-unavailable failures do not collapse into one `BlobOperationsException`. The shared helper centralizes translation for one precise failure family; structured context identifies the gateway, provider, operation, retry information, and resource.

**Key Benefits:**

1. **Catch the specific retryable provider failure** rather than broad `Exception`
2. **Preserve the precise failure family after retry exhaustion**
3. **Extract all available error details** (status, retry guidance, provider, operation)
4. **Consistent context structure** across all exceptions
5. **Single place to fix bugs** in error handling
6. **`NoReturn` or `Never` type hint** documents that the method always raises; Chapter 10 owns this annotation contract

### When NOT to Catch Exceptions

```python
# BAD - Catching just to log
try:
    process_document(doc)
except Exception as e:
    logger.error(f"Failed: {e}")
    raise  # This is NOT handling

# BAD - Swallowing exceptions
try:
    send_notification(user)
except Exception:
    pass  # Silent failure is never acceptable

# BAD - Catching too broadly
try:
    complex_operation()
except Exception as e:
    return None  # Hiding failures behind None
```

---

### Exception Groups and Concurrent Failures (Python 3.11+)

When multiple concurrent operations can each fail, most commonly inside `asyncio.TaskGroup` (see Chapter 13), failures are wrapped in an `ExceptionGroup` (or `BaseExceptionGroup`). The conventional `except SpecificError` does **not** catch them; you have to handle the group.

There are two correct patterns:

**Pattern A: Handle inner exceptions selectively with `except*`:**

```python
try:
    async with asyncio.TaskGroup() as task_group:
        for item in items:
            task_group.create_task(self._process(item))
except* ParseException as parse_group:
    # parse_group.exceptions is the tuple of ParseExceptions that occurred.
    # Other inner exception types (if any) are re-raised automatically.
    for parse_error in parse_group.exceptions:
        self._logger.warning("Item parse failed: %s", parse_error)
    raise
except* GatewayException:
    # Translate gateway failures to a domain exception, etc.
    raise
```

`except*` unpacks the group and lets you handle each inner type independently. Other inner exception types in the same group are re-raised automatically, preserving the structure.

**Pattern B: Preserve a prior single-exception API contract by unwrapping:**

```python
tasks: list[asyncio.Task[Result]]
try:
    async with asyncio.TaskGroup() as task_group:
        tasks = [
            task_group.create_task(self._process(item))
            for item in items
        ]
except ExceptionGroup as exception_group:
    # The caller used to see, say, JsonOutputEnsurerRetriesExhaustedException.
    # Surface the first inner exception so that contract still holds.
    raise exception_group.exceptions[0] from None
return [task.result() for task in tasks]
```

Use Pattern B when adopting `TaskGroup` in code whose callers already catch a specific exception type. Use Pattern A when the caller is being written fresh.

**Anti-pattern:** catching `ExceptionGroup` with `except Exception` and ignoring its structure. It "works" (the group inherits from `Exception`) but you lose the type information of every inner failure: debugging becomes impossible because the stringified exception only says "ExceptionGroup: 3 errors".

```python
# BAD - swallows the structure of multiple inner failures
try:
    async with asyncio.TaskGroup() as task_group:
        ...
except Exception as e:
    logger.error("Something failed: %s", e)
    raise
```

---

### `NoReturn` or `Never`: Document Terminal Domain Helpers

Domain exception translators, classifiers, and terminal raising helpers whose every reachable path raises (for example, `_raise_blob_operation_exception` or a `_classify_*_error` funnel) should be annotated `-> NoReturn` or the equivalent `-> Never`. Chapter 10 owns this bottom return contract; this chapter owns whether translation is centralized and raises the correct domain exception.

```python
def _classify_provider_error(self, e: Exception, operation: str) -> NoReturn:
    """Translate ANY exception into a domain exception. ALWAYS raises."""
    if isinstance(e, RateLimitError):
        raise RateLimitException(...) from e
    if isinstance(e, (ConnectionError, TimeoutError)):
        raise TransportException(...) from e
    raise GatewayException(f"{type(e).__name__}: {e!s}") from e
```

Why a bottom return type matters:

1. **Documents intent.** Readers see immediately that this is a terminal helper, not a function that might return and continue.
2. **Type checkers enforce it.** If you forget a `raise` on one branch, pyright/mypy will flag it.
3. **Eliminates dead-code warnings at call sites.** Code after `self._classify_provider_error(e, "...")` is correctly seen as unreachable.

Use `NoReturn` or `Never` only when complete control flow proves that every path raises a domain exception. A conditional validation guard such as `_raise_if_negative(...)` returns normally for valid input and therefore uses `-> None`.

---

## Exception Design Principles

### Specific, Not Generic

```python
# GOOD - Specific exceptions
class CustomerNotFoundException(DomainException):
    pass

class PaymentDeclinedException(DomainException):
    pass

class DocumentParsingException(DomainException):
    pass

# BAD - Generic "reusable" exceptions
class NotFoundException(Exception):  # Too generic
    pass

class ProcessingException(Exception):  # What processing?
    pass
```

A useful heuristic: **each exception type usually maps to one throw site** (or one centralized transformer). Reuse is valid across any number of sites or gateways only when every use represents the same precise failure condition and requires the same response. Wrapping the same broad provider or SDK exception class in different operations does not establish one precise condition. Treat those construction sites as related only when the source proves the same terminal failure and response, or when every operation delegates to one centralized terminal transformer. For example, a persistent HTTP 429 may raise the same rate-limit exception from Azure OpenAI and Together AI gateways while structured context identifies the gateway, provider, operation, attempt count, status, and retry guidance. By contrast, one object-storage-operation exception spanning upload and deletion failures is too general: context cannot make a generalized type specific. Technical, business, and validation classification belongs in exception ancestry rather than being repeated in every concrete exception name.

Judge the failure contract and meaningful handling need, not the number of
settings, messages, or human edits. An established ConfigurationSettingException
may represent missing required settings and invalid values when callers handle
both as configuration-setting failures and actionable messages/context identify
the setting and condition. Do not invent a type per setting solely because an
operator edits different values. Retain useful existing failure-mode families;
one type must not conflate a retryable outage and a business rejection needing
different recovery or operational routing. Missing diagnostics are their own
defect and do not by themselves prove that another subclass is required.

### Rich Context Data

Exceptions should carry everything needed for diagnosis:

```python
class BlobNotFoundException(GatewayException):
    def __init__(
        self,
        message: str,
        log_event: LogEvent,
        context_data: dict[str, Any]
    ) -> None:
        super().__init__(message)
        self.log_event: LogEvent = log_event
        self.context_data: dict[str, Any] = context_data

# Usage
raise BlobNotFoundException(
    message="Blob 'path/to/file.pdf' was not found",
    log_event=BlobOperationSteps.BlobNotFound,
    context_data={
        "blob_path": "path/to/file.pdf",
        "container": "documents",
        "status_code": 404,
        "error_code": "BlobNotFound"
    }
)
```

### Inheritance for Exception Hierarchies

```python
# Base exception for the domain
class DomainException(Exception):
    pass

# Category-level exceptions
class ValidationException(DomainException):
    pass

class GatewayException(DomainException):
    pass

# Specific exceptions
class InvalidEmailFormatException(ValidationException):
    pass

class PaymentGatewayTimeoutException(GatewayException):
    pass
```

---

## Exception Messages

Exception messages should be:

1. **Clear and actionable** - State what went wrong and what might fix it
2. **Include the invalid value** - Don't just say "invalid"; show what was invalid
3. **Include valid options** - If there's a finite set of valid values, list them

### Write for the People Resolving the Failure

A mapping-contract failure may identify its result set, row, column,
expected/actual representation, and compatible-deployment remedy. These are
useful to the developer or operator correcting the fault; the fact that they
also appear in structured context does not require a vaguer message.

The **message** must help the person triaging, diagnosing, or correcting the
failure understand what happened and what to do next. Business failures may be
resolved by analysts, business users, or support staff. Technical failures may
require developers, infrastructure staff, or operators. Use plain, actionable
language appropriate to that failure; do not assume every message is for a
business analyst.

The **structured context** supplies diagnostics for searching, correlating,
and reproducing the failure: relevant inputs, identifiers, provider codes, and
the failed operation or stage. Necessary facts may appear in both the message
and context. Context supplements an actionable message; it is not a reason to
remove facts needed to fix the problem.

For configuration failures, explicitly identify the setting or environment
variable, its non-sensitive rejected value, the validation failure, and the
permitted values, units, or corrective action. These are operational facts,
not automatically developer-only jargon. Avoid unexplained implementation
names, stack-trace fragments, and diagnostic dumps that do not help explain or
correct the failure. Secret redaction remains a separate requirement and does
not justify hiding a setting name or an ordinary timeout value. This exception
message policy does not change assertion-message guidance.

Meridian's timeout exception correctly names the setting and rejected value
while retaining both in `contextual_data_by_name`:

```python
return ConfigurationSettingException(
    message=(
        f"Configuration setting '{self.COMMAND_TIMEOUT_SECONDS_VARIABLE_NAME}' received '{command_timeout_setting}'. "
        f"{command_timeout_validation_problem} "
        "Enter an integer greater than or equal to 0. "
        f"The maximum supported value is {self.MAXIMUM_COMMAND_TIMEOUT_SECONDS}. "
        "Use 0 for no command timeout, or a positive integer for the timeout in seconds; leave the setting unset to use 0."
    ),
    log_event=ConfigurationLogEvent.ORDER_STORE_SETTINGS_RETRIEVAL,
    contextual_data_by_name={
        "Configuration.EnvironmentVariableName": self.COMMAND_TIMEOUT_SECONDS_VARIABLE_NAME,
        "Configuration.EnvironmentValue": command_timeout_setting,
    },
)
```

Do not flag this construction for including an environment-variable name or
raw non-sensitive timeout value. The reader can identify what to change and
the constraint to satisfy without first retrieving structured context.

```python
# GOOD - Clear, actionable, includes value and options
raise InvalidDocumentTypeException(
    f"Document type '{document_type}' is not supported. "
    f"Valid types are: {', '.join(SUPPORTED_TYPES)}"
)

# BAD - Vague, no context
raise InvalidDocumentTypeException("Invalid document type")
```

---

## Logging Policy

### Default: Log Exceptions Only

In a system programmed to exceptions, the default logging policy is: **log exceptions, log nothing else**. If you don't hear from the system, it's all good. Informational logging scattered through business flows is the sibling of defensive validation, code written because the author doesn't trust the system, and in decades of production business systems the need for it essentially never materializes. Logging happens at boundaries (see Boundary Catch Strategy); interior code neither logs nor swallows.

### The Sanctioned Exception: Long-Running Stepped Processes

Long-running, multi-step pipelines (document-processing runs of 17-18 steps per document; ingestions running hours to weeks over thousands of documents) earn **progress logging**, because the operational question they raise is one exceptions cannot answer: *"this has been going on for 18 hours, where are we at?"* Rules:

1. **Step-boundary events, named from a shared vocabulary.** Progress logs and exceptions draw from the same `LogEvent` enum taxonomy: one event vocabulary for the whole pipeline. Event values encode position and name (`Step_2.4_VisionMetadataTextConversion`), grouped by phase, so a log line places you in the pipeline exactly.
2. **A step-boundary logger owns the format.** One class renders events (banner separators, `STEP 2.4: Vision Metadata Text Conversion - STARTED/COMPLETED`, optional detail line). Steps never hand-format progress banners.
3. **In-step progress carries counts.** Within a long step, per-unit lines include the measurable ("Completed page 12 (34 metadata lines)"), enough to see rate and detect stalls, never payload dumps.
4. **A decent amount, not too much, structured as if a human needs to read it.** Because one will: progress logs exist for a person (or a coding assistant) staring at a run trying to understand what happened. Human-readable step names (PascalCase-parsed to display names), message-first formatting, no noise. Logs are breadcrumbs in the same sense as Chapter 26's artifacts, and land beside them.
5. **Renumbering steps is a breaking change for monitoring.** Retain legacy event values (marked as such) when steps are reorganized; dashboards and alerts key on them.
6. **Logger configuration is composition-root-owned.** Console + timestamped run file (colocated with the run's artifacts), handler setup and third-party logger decisions (e.g., deliberately surfacing an SDK's retry logger at INFO) happen once, at the entry point, never inside steps.

Review lens: informational logging in a *non*-long-running business flow is a finding (default policy applies); a long-running pipeline with **no** step-boundary logging is equally a finding (operations is blind); hand-rolled per-step banner formatting, payload dumps, and step events invented outside the LogEvent taxonomy are findings.

For a decentralized-progress finding, establish the existing shared taxonomy
and logger and the concrete bypass. A standalone test/setup runner's one
console-output mechanism does not prove a parallel logging framework. Creating
a shared logger where none exists is a separate design proposal; print calls
alone cannot supply the missing evidence.

The build blueprint (normalized from the RFX Classification and Metadata Verification MoE workspaces) is `code_implementation_guidelines/progress-logging-implementation-guidelines.md`.

---

## Code Review Checklist

When reviewing validation and exception handling, verify:

### Validation Location

- [ ] Validation occurs at system boundaries (front door, back door), not everywhere
- [ ] No redundant validation inside the system
- [ ] Gateway validates external service responses
- [ ] Configuration provider validates and returns strongly-typed values

### Exception Usage

- [ ] Exceptions caught only when truly handled (retry, translation with context)
- [ ] No catching exceptions just to log and rethrow
- [ ] No silent exception swallowing (`except: pass`)
- [ ] No broad `except Exception` that hides failures behind `None`
- [ ] Exceptions propagate to entry point layer for logging
- [ ] Foreign/runtime exceptions reaching the boundary are treated as defects (missing guard or missing translation), not as a designed failure mode
- [ ] The logging boundary sanitizes context and request state before emitting

### Gateway Exception Translation

- [ ] Catch SDK's root exception class (e.g., `AzureError`, `DBException`, `HttpError`) not Python's generic `Exception`
- [ ] All SDK exceptions are translated to domain exceptions - no SDK exceptions leak to callers
- [ ] Implementation details don't leak (caller can't tell if it's SQL Server, Postgres, Azure, AWS)

### Centralized Exception Transformation (Gateways)

- [ ] Exception transformation logic is centralized (not duplicated in each method)
- [ ] Error codes are mapped to user-friendly messages
- [ ] All available error details are extracted (status codes, error codes, request IDs)
- [ ] Transformation is terminal on every path when designed as a raising helper (Chapter 10 owns whether its return annotation is `NoReturn` or `Never`)
- [ ] Context structure is consistent across all exceptions

### Exception Design

- [ ] Exception types identify precise failure contracts; shared configuration handling does not require one type per setting
- [ ] Reused types do not conflate materially different recovery, caller handling, or operational routing
- [ ] Exceptions carry rich context data (values, parameters, stage)
- [ ] Exception messages include the invalid value
- [ ] Exception messages include valid options when applicable
- [ ] Exception messages help the people resolving the failure, including developers and infrastructure staff; actionable setting names, non-sensitive values, and corrections remain in the message alongside structured diagnostics
- [ ] Exception hierarchies use inheritance appropriately

### Happy Path Code

- [ ] Code is written for the happy path only
- [ ] No defensive checks for "just in case" scenarios
- [ ] No `if result is None` patterns after internal calls
- [ ] Execution reaching next line implies success

### Concurrent Failures (Python 3.11+)

- [ ] `ExceptionGroup` raised by `asyncio.TaskGroup` is handled: either with `except*` per inner type, or unwrapped to the first inner exception to preserve a prior single-exception API contract
- [ ] `ExceptionGroup` is NOT caught with bare `except Exception` (which loses the structure of every inner failure)

### Terminal Raise Helpers

- [ ] Domain transformers and classifiers designed as terminal helpers raise on every reachable path; conditional validation guards may return normally (Chapter 10 owns `NoReturn`/`Never` annotation findings)
