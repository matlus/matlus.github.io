# TypeScript Guidelines

Status: seed draft, 2026-09-19
Scope: all TypeScript and Astro code in this repository.

These guidelines start from the PWI C# chapters. The two languages agree on most
design questions, so the default rule is simple: **if a C# chapter says it, it
applies here.** This document records only two things. Where a C# rule needs
restating in TypeScript terms, and where TypeScript genuinely diverges.

The code in this repository is meant to double as a worked TypeScript sample, so
nothing here is aspirational. If a rule is written down, the code follows it.

---

## 1. Compiler settings are part of the guidelines

`tsconfig.json` extends `astro/tsconfigs/strictest` and adds several options on top.
These are not tuning knobs. Turning one off to make an error go away is a change to
the guidelines and needs the same scrutiny as changing a chapter.

| Option | Why |
|---|---|
| `strictNullChecks` | `null` and `undefined` become part of the type, which is what makes the cardinality rules in cs04 expressible at all. |
| `noUncheckedIndexedAccess` | `arr[0]` is `T \| undefined`. Without this, every array index silently lies. |
| `exactOptionalPropertyTypes` | Distinguishes "property absent" from "property present and undefined". |
| `noImplicitOverride` | The `override` keyword becomes mandatory, recovering the intent signal C# gets from `virtual`/`override`. |
| `noPropertyAccessFromIndexSignature` | Forces `obj['key']` for index signatures, so genuine properties stay visually distinct. |
| `verbatimModuleSyntax` | Type-only imports must say `import type`, keeping the runtime graph honest. |

---

## 2. Chapter map

| C# chapter | TypeScript status |
|---|---|
| cs01 architecture layers | Applies unchanged. |
| cs03 naming conventions | Applies, with casing and `Async` divergences below. |
| cs04 method design | Applies, with visibility and virtuality restated below. |
| cs05 class design | Applies, with `internal`, static classes, and polymorphism restated below. |
| cs08 LINQ query semantics | Applies in spirit to array and iterable pipelines. Deferred execution differs. |
| cs09 validation and exception handling | Applies, with the untyped-catch divergence below. |
| cs14 gateway design | Applies unchanged. |
| cs16 configuration provider | Applies unchanged. |
| cs22 messaging patterns | Applies unchanged. |
| cs29 data manager design | Applies unchanged. |
| cs50 to cs55 testing | Apply unchanged, including test mediators and spies. |

---

## 3. Restated rules

### Visibility: modules replace `internal`

C# starts members explicitly private and types internal by default. TypeScript has no
`internal`, and its `private` keyword is erased at runtime.

The module is the unit of visibility. A file exports the smallest surface that its
consumers need, and everything else stays unexported. Unexported is the TypeScript
equivalent of `internal`, and it is enforced by the module system rather than by
convention.

Within a class, prefer `#private` fields over the `private` keyword. `#private` is a
real runtime boundary. `private` is a compile-time suggestion that disappears in the
emitted JavaScript.

### Virtuality: there is no `virtual`, so prefer composition

cs04 says public and internal members are never virtual. TypeScript cannot express
that, because every method on a class is overridable and there is no `sealed`.

The rule survives as a design constraint rather than a keyword. Reach for composition
first. Where a class hierarchy is genuinely warranted, `noImplicitOverride` at least
forces an override to announce itself, and the cs05 rule about closing concrete
descendants becomes a review question rather than a compiler guarantee.

### Static classes become modules

C# uses static classes for collaborator-less behavior. TypeScript does not. A module
exporting plain functions is the idiomatic form, and a class with only static members
is a code smell here even though it is correct in C#.

Instance classes with retained collaborators, as in cs05, stay classes.

### Casing

TypeScript casing follows its own conventions and overrides any C# casing rule:
`PascalCase` for types, interfaces, and classes, `camelCase` for functions, methods,
variables, and properties, `SCREAMING_SNAKE_CASE` only for true module-level
constants.

Everything cs03 says about *derivation*, meaning how a name is chosen, still applies.
Only the casing layer differs.

### No `Async` suffix

cs03 sanctions the `Async` suffix because the .NET framework established it.
TypeScript has no such convention and the return type already says `Promise<T>`.
Do not suffix async functions.

### Exceptions are untyped at the catch site

cs09 depends on catching specific exception types. TypeScript types every `catch`
binding as `unknown`, which is correct and cannot be configured away.

So a catch block narrows before it does anything else. Custom error classes still
carry the domain meaning cs09 asks for, and narrowing happens through `instanceof`
against those classes. A catch block that touches `error.message` without narrowing
first is a defect.

---

## 4. TypeScript rules with no C# parallel

**`any` is banned.** Untrusted or unshaped input is `unknown`, narrowed at the
boundary. A cast through `as any` is a defect.

**No `enum`.** Use a union of string literals, or an `as const` object when a runtime
value is needed. TypeScript enums have surprising runtime semantics and numeric enums
accept arbitrary numbers.

**Discriminated unions before inheritance.** Where cs05 would reach for a closed
hierarchy, a discriminated union gives the same closure with exhaustiveness checking
the compiler enforces. Use a `never` assertion in the default branch so adding a
variant breaks the build.

**`readonly` by default.** Mark properties, arrays, and parameters `readonly` unless
mutation is the point. `as const` for literal data.

**One of `null` or `undefined`, not both.** This codebase uses `undefined` for absence
and reserves `null` for values arriving from external systems that use it, converted
at the boundary.

**Branded types for domain scalars.** Where C# would use a value type to stop a raw
`string` standing in for a `Slug`, TypeScript uses a branded type. This keeps the cs03
rule that a name must say what the thing is enforceable rather than advisory.

---

## 5. Astro-specific

Component props are declared with an exported `Props` interface and are `readonly`.

Content collection schemas are the single source of truth for frontmatter shape, and
types flow from the schema via `z.infer` rather than being declared separately. A
hand-written type that duplicates a schema will drift.

Anything computed at build time stays in the frontmatter fence. Client-side scripts
exist only for behavior that genuinely needs the browser, which in this project means
tag filtering, search, and the navigation menu.

---

## 6. Open questions

- Whether to adopt a linter beyond `astro check`, and if so which rule set.
- Whether the cs08 LINQ chapter needs a real TypeScript counterpart or only the note
  above.
- Whether these guidelines eventually graduate into a PWI chapter family of their own.
