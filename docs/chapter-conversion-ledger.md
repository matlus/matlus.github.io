# Chapter Conversion Ledger

Status of every chapter in the corpus. The machine-readable version is
`tools/chapter-manifest.json`, which is also the input to
`tools/convert-chapters.py`, so the ledger and the conversion cannot drift apart.

The campaign runs across many sessions. Anything marked `ready` converts on the next
run; anything `pending` needs a description and tags first, which are judgment calls
rather than something derivable from the file.

**12 converted · 17 pending · 22 skipped · 51 total**

## Why chapters get skipped

Chapters fall into three shapes, and only one converts mechanically.

**Teaching prose** carries an argument and reads as a chapter. It converts with two
mechanical edits and no rewriting.

**Rule catalogues** are written for the review runtime, not for a reader. They carry
rule IDs such as `pwi.domain-facade.internal-classes-exposed-as-public`, evidence
scopes, and severities. Published raw, they would read as internal tooling
documentation. These need a decision: publish as-is, add framing that explains what a
rule ID is, or leave unpublished.

**Mixed** chapters are mostly prose with a few rule IDs embedded. They follow whatever
is decided for the catalogues.

Notably, the C# family is almost entirely teaching prose while several Python chapters
are catalogues, so the split is not even across languages.

## Converted

| Chapter | Topic | Language | Lines |
|---|---|---|---|
| `chapter-04-method-design-csharp.md` |  | csharp | 735 |
| `chapter-05-method-design.md` |  | python | 488 |
| `chapter-08-linq-query-semantics-csharp.md` |  | csharp | 345 |
| `chapter-10-type-annotations.md` |  | python | 391 |
| `chapter-01-architecture-layers-csharp.md` | architecture-layers | csharp | 498 |
| `chapter-01-architecture-layers.md` | architecture-layers | python | 292 |
| `chapter-04-class-design.md` | class-design | python | 296 |
| `chapter-05-class-design-csharp.md` | class-design | csharp | 456 |
| `chapter-03-naming-conventions-csharp.md` | naming-conventions | csharp | 535 |
| `chapter-09-naming-conventions.md` | naming-conventions | python | 467 |
| `chapter-06-validation-exception-handling-structured-logging.md` | validation-exception-handling | python | 668 |
| `chapter-09-validation-exception-handling-csharp.md` | validation-exception-handling | csharp | 803 |

## Pending: teaching prose, awaiting description and tags

| Chapter | Language | Lines |
|---|---|---|
| `chapter-11-anti-patterns.md` | python | 40 |
| `chapter-14-gateway-design-pattern-csharp.md` | csharp | 610 |
| `chapter-16-configuration-provider-csharp.md` | csharp | 754 |
| `chapter-16-messaging-patterns.md` | python | 243 |
| `chapter-18-code-correctness-runtime-safety.md` | python | 491 |
| `chapter-19-python-language-style.md` | python | 466 |
| `chapter-22-messaging-patterns-csharp.md` | csharp | 802 |
| `chapter-25-adapter-pattern.md` | python | 153 |
| `chapter-29-data-manager-design-csharp.md` | csharp | 525 |
| `chapter-50-testing-strategy-csharp.md` | csharp | 227 |
| `chapter-51-test-structure-organization-csharp.md` | csharp | 341 |
| `chapter-52-test-assertions.md` | python | 852 |
| `chapter-52-test-naming-conventions-csharp.md` | csharp | 252 |
| `chapter-53-test-assertions-csharp.md` | csharp | 376 |
| `chapter-54-test-mediators-and-spies-csharp.md` | csharp | 307 |
| `chapter-55-functional-acceptance-testing.md` | python | 50 |
| `chapter-55-service-boundary-testing-csharp.md` | csharp | 263 |

## Skipped, with reason

| Chapter | Rule IDs | Lines | Reason |
|---|---|---|---|
| `chapter-56-service-boundary-testing.md` | 17 | 797 | Rule catalogue (17 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-28-stored-procedure-data-access.md` | 9 | 489 | Rule catalogue (9 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-26-artifact-persistence-callbacks.md` | 8 | 281 | Rule catalogue (8 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-27-configuration-provider.md` | 8 | 608 | Rule catalogue (8 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-51-test-structure-organization.md` | 8 | 1069 | Rule catalogue (8 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-53-testing-strategy.md` | 8 | 751 | Rule catalogue (8 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-03-need-to-know-principle.md` | 6 | 332 | Rule catalogue (6 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-07-domain-facade.md` | 6 | 290 | Rule catalogue (6 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-08-llm-based-processor-design.md` | 6 | 416 | Rule catalogue (6 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-15-llm-gateway-implementation.md` | 6 | 603 | Rule catalogue (6 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-02-service-locator-configuration.md` | 5 | 273 | Rule catalogue (5 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-12-gateway-design-pattern.md` | 5 | 638 | Rule catalogue (5 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-13-async-resource-lifecycle.md` | 5 | 435 | Rule catalogue (5 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-21-strategy-pattern.md` | 5 | 349 | Rule catalogue (5 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-50-test-naming-conventions.md` | 5 | 494 | Rule catalogue (5 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-54-testing-test_mediators_and_spies.md` | 4 | 837 | Rule catalogue (4 rule IDs). Written for the review runtime rather than a reader. Needs a decision on framing before publishing. |
| `chapter-20-boundary-validation.md` | 3 | 470 | Mixed shape (3 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |
| `chapter-22-factory-pattern.md` | 3 | 210 | Mixed shape (3 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |
| `chapter-24-decorator-pattern.md` | 3 | 174 | Mixed shape (3 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |
| `chapter-14-encapsulating-third-party-libraries.md` | 2 | 307 | Mixed shape (2 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |
| `chapter-17-intentional-model-design.md` | 2 | 354 | Mixed shape (2 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |
| `chapter-23-factory-method-pattern.md` | 1 | 123 | Mixed shape (1 rule IDs in otherwise teaching prose). Worth converting once the rule-ID question is settled. |

## Known follow-ups

- **Domain Facade** needs authoring rather than conversion. The corpus file is a rule
  catalogue about facade signatures and locator retention. The fuller chapter also
  covers folder structure, levels of abstraction, and the sibling rule: a class talks
  one level down and no further, and a sibling needing a sibling is an abstraction
  failure calling for extraction. Some of that already lives in Architecture Layers,
  which has both a Levels of Abstraction and Folder Structure section and a Service
  Interface Layer section.
- **Need-to-know** is not a chapter on this site. It is an aphorism belonging to method
  design: pass a method exactly what it needs, nothing more.
- **Anti-patterns** is an index rather than a standalone chapter, at 40 lines. It may
  be better as navigation than as a page.
