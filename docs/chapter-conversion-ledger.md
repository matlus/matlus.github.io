# Chapter Conversion Ledger

Status of the corpus chapters considered for this website. The machine-readable version is
`tools/chapter-manifest.json`, which is also the input to
`tools/convert-chapters.py`, so the ledger and the conversion cannot drift apart.
Review-only rule catalogs remain in the PWI code review system and are outside
this site's manifest and conversion workflow.

The campaign runs across many sessions. Anything marked `ready` converts on the next
run; anything `pending` needs a description and tags first, which are judgment calls
rather than something derivable from the file.

**12 converted · 17 pending · 6 skipped · 35 total**

## Why chapters get skipped

The site tracks teaching prose and mixed chapters. Teaching prose converts mechanically.

**Teaching prose** carries an argument and reads as a chapter. It converts with two
mechanical edits and no rewriting.

**Mixed** chapters are mostly prose with a few rule IDs embedded. The six mixed
chapters now have individual editorial routes. They stay skipped by the mechanical
converter; their reader-facing material comes from videos or purpose-written posts,
or joins a related published chapter.

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
| `chapter-20-boundary-validation.md` | 3 | 470 | Its teaching material belongs in the published Validation chapter. The Python chapter now includes a manager-front-door section; the C# chapter already covers the validator sequence. Keep this review-specific source skipped. |
| `chapter-22-factory-pattern.md` | 3 | 210 | Use the ratified Factory Pattern video chapter at `/writing/factory-pattern/`. Its useful non-review points about unknown identifiers and concrete downcasts were incorporated. Keep this review-specific source skipped. |
| `chapter-24-decorator-pattern.md` | 3 | 174 | Hold for a video-led Decorator article. Keep this review-specific source skipped. |
| `chapter-14-encapsulating-third-party-libraries.md` | 2 | 307 | Reader-facing treatment is `/writing/clean-abstractions-around-libraries/`, with links to the relevant PWI chapters. Keep this review-specific source skipped. |
| `chapter-17-intentional-model-design.md` | 2 | 354 | Reader-facing treatment is `/writing/intentional-model-design/`, linked both ways with Class Design. Keep this review-specific source skipped. |
| `chapter-23-factory-method-pattern.md` | 1 | 123 | Use the ratified Factory Method video chapter at `/writing/factory-method-pattern/`. The consumer's use of its own creation hook is now explicit in the illustrative code. Keep this review-specific source skipped. |

## Known follow-ups

- **Domain Facade** needs authoring rather than conversion. A reader-facing chapter
  should cover folder structure, levels of abstraction, and the sibling rule: a class talks
  one level down and no further, and a sibling needing a sibling is an abstraction
  failure calling for extraction. Some of that already lives in Architecture Layers,
  which has both a Levels of Abstraction and Folder Structure section and a Service
  Interface Layer section.
- **Need-to-know** is not a chapter on this site. It is an aphorism belonging to method
  design: pass a method exactly what it needs, nothing more.
- **Anti-patterns** is an index rather than a standalone chapter, at 40 lines. It may
  be better as navigation than as a page.
