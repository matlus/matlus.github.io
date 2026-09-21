/**
 * The aphorism glossary.
 *
 * Canonical definitions for the recurring phrases used across the chapters.
 * Chapters list which aphorisms apply to them; the meanings live here, so a
 * phrase carries one meaning across the whole corpus.
 *
 * Generated from the corpus glossary. Each entry carries a slug, so a chapter
 * can link to a specific definition rather than to the page as a whole.
 */

export interface Aphorism {
  readonly slug: string;
  readonly phrase: string;
  readonly meaning: string;
  readonly category: string;
}

export const APHORISMS: readonly Aphorism[] = [
  {
    "slug": "express-your-intent-in-code-not-comments",
    "phrase": "Express your intent in code, not comments",
    "meaning": "Names, types, signatures, and structure should communicate what the code means. Comments explain why, constraints, or protocol quirks; they do not narrate obvious code.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "don-t-make-me-think",
    "phrase": "Don't make me think",
    "meaning": "Code should read as a clear sequence of domain intent. High-level methods show what happens; lower-level methods and collaborators handle how.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "don-t-make-me-wonder",
    "phrase": "Don't make me wonder",
    "meaning": "Remove ambiguity from contracts. If absence is impossible, do not mark a value optional. If only `None` has absence meaning, do not also treat empty strings or other sentinels as absence.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "we-don-t-expose-our-privates",
    "phrase": "We don't expose our privates",
    "meaning": "Internal implementation stays hidden. Public surface area is intentional, and foreign/provider details do not leak across system boundaries.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "need-to-know-basis",
    "phrase": "Need-to-know basis",
    "meaning": "Pass only the values a method needs. Do not pass broad objects or providers when a smaller, explicit value or DTO expresses the contract.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "don-t-invent-names",
    "phrase": "Don't invent names",
    "meaning": "A single instance of a well-named type is named after the type (`http_client`, `xml_schema`); what `get_x` returns is called `x`; an operation keeps one name through every layer it flows through. Inventing a fresh name at each site is where wrong names come from — and if the type's name keeps feeling insufficient, fix the *type's* name, not the variable's.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "caveat-emptor",
    "phrase": "Caveat emptor",
    "meaning": "Internal methods trust their callers. Validation happens at domain entry points and external boundaries, not repeatedly inside trusted internal flows.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "lock-the-front-door-lock-the-back-door-so-you-re-safe-in-the-house",
    "phrase": "Lock the front door, lock the back door so you're safe in the house",
    "meaning": "Validate and normalize data at every ingress boundary. The front door is the normal business entry point. Back doors are all other places foreign data enters, such as configuration, external services, files, messages, or structured LLM output. Inside the house, data is clean and trusted.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "don-t-let-the-boogieman-in",
    "phrase": "Don't let the boogieman in",
    "meaning": "Invalid states must be blocked at boundaries so internal code never has to defend against impossible values.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "rule-of-thirds",
    "phrase": "Rule of thirds",
    "meaning": "Do not generalize until the pattern has appeared enough times to prove its shape. Complex repeated logic may justify earlier extraction when duplication itself creates risk.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "fail-fast-and-fail-visibly",
    "phrase": "Fail fast and fail visibly",
    "meaning": "Fail at the point of truth with a clear exception instead of silently producing wrong results, fabricated defaults, or hidden partial success.",
    "category": "Core Design Aphorisms"
  },
  {
    "slug": "common-practice-is-not-common-sense",
    "phrase": "Common practice is not common sense",
    "meaning": "The fact that a practice is widely followed says only that it is widely followed. Question every convention against the value it actually delivers; adopt or reject on evidence, not popularity.",
    "category": "Design Process Aphorisms"
  },
  {
    "slug": "we-do-what-we-can-not-what-we-should",
    "phrase": "We do what we can, not what we should",
    "meaning": "The streetlight trap: people gravitate to the work they know how to do (and then rationalize it) instead of the work the problem requires. Catch yourself choosing a technique because it is familiar rather than because it is right.",
    "category": "Design Process Aphorisms"
  },
  {
    "slug": "never-be-married-to-your-design",
    "phrase": "Never be married to your design",
    "meaning": "A week of design work is not a reason to keep a design. When a better idea arrives — from anyone — throw yours away without ceremony. Designs earn their keep continuously or not at all.",
    "category": "Design Process Aphorisms"
  },
  {
    "slug": "when-in-doubt-leave-it-out",
    "phrase": "When in doubt, leave it out",
    "meaning": "If the requirement in hand does not demand a parameter, property, method, or abstraction, do not add it. Imagining the future makes APIs worse, not safer; certainty comes from requirements, not speculation.",
    "category": "Design Process Aphorisms"
  },
  {
    "slug": "a-bad-abstraction-is-worse-than-no-abstraction",
    "phrase": "A bad abstraction is worse than no abstraction",
    "meaning": "Wrong abstractions actively mislead every reader and harden into load-bearing structure. If you are not sure an abstraction is right, don't abstract yet — duplication is recoverable, a wrong abstraction resists removal (Sandy Metz: \"the best way forward is to go back\").",
    "category": "Design Process Aphorisms"
  },
  {
    "slug": "orchestrate-or-implement-never-both",
    "phrase": "Orchestrate or implement, never both",
    "meaning": "A method either coordinates named steps or performs low-level work. Mixing both creates inconsistent abstraction levels.",
    "category": "Structure and Boundary Aphorisms"
  },
  {
    "slug": "show-me-the-what-not-the-how",
    "phrase": "Show me the what, not the how",
    "meaning": "Public workflows and tests should reveal intent at a glance. Detailed mechanics belong behind named methods, collaborators, or assertion helpers.",
    "category": "Structure and Boundary Aphorisms"
  },
  {
    "slug": "protocols-over-inheritance",
    "phrase": "Protocols over inheritance",
    "meaning": "Prefer structural contracts via `Protocol` when behavior depends on a shape rather than a shared implementation hierarchy.",
    "category": "Structure and Boundary Aphorisms"
  },
  {
    "slug": "infrastructure-once-domain-every-time",
    "phrase": "Infrastructure once, domain every time",
    "meaning": "Shared infrastructure handles wiring and cross-cutting mechanics. Domain classes and subclasses focus on domain-specific behavior.",
    "category": "Structure and Boundary Aphorisms"
  },
  {
    "slug": "frozen-immutability",
    "phrase": "Frozen immutability",
    "meaning": "Message and DTO instances do not mutate after creation. Use replacement/copy construction when a modified value is required.",
    "category": "Messaging and Test Aphorisms"
  },
  {
    "slug": "state-behavior-separation",
    "phrase": "State/behavior separation",
    "meaning": "State-only models are immutable DTOs. Behavior lives in separate classes that do not accumulate mutable state across calls.",
    "category": "Messaging and Test Aphorisms"
  },
  {
    "slug": "tests-are-executable-specifications",
    "phrase": "Tests are executable specifications",
    "meaning": "Test names, structure, and assertion messages should document system behavior in language a non-implementer can understand.",
    "category": "Messaging and Test Aphorisms"
  },
  {
    "slug": "the-prompt-drives-the-design",
    "phrase": "The prompt drives the design",
    "meaning": "An LLM processor exists to execute a specific prompt contract; the prompt's requirements shape the processor's API and responsibilities.",
    "category": "Messaging and Test Aphorisms"
  }
];

export const APHORISM_CATEGORIES: readonly string[] = [
  "Core Design Aphorisms",
  "Design Process Aphorisms",
  "Structure and Boundary Aphorisms",
  "Messaging and Test Aphorisms"
];

export function aphorismBySlug(slug: string): Aphorism | undefined {
  return APHORISMS.find((a) => a.slug === slug);
}
