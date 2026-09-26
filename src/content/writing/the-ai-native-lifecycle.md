---
title: The AI-Native Lifecycle
description: >-
  An AI-native SDLC engineers both gates through certified code review, functional
  acceptance tests at the boundary ratified by humans, and verification against
  the specification.
datePublished: 2026-08-19
dateModified: 2026-09-26
tags:
  - verification
  - acceptance-testing
  - ai-assisted-development
  - code-review
  - testing
hero: ai-native-lifecycle
status: established
---

<!-- audit-allow: verified, not trusted -->

[Stampede at the Gates](/writing/stampede-at-the-gates/) sets out the problem. Code is
written at machine speed and still reviewed and verified at human cognition speed, so a
queue forms at each of the two gates between written and shipped. Relieving the first gate
relocates that queue to the second, which is the last checkpoint before production and the
expensive one to miss at.

This is the other half. What it actually takes to engineer both gates.

Start with a distinction that decides everything downstream. Most of what gets called an
AI lifecycle today is the existing lifecycle with AI sprinkled into individual tasks: same
process, same gates, faster typing. An AI-native lifecycle is the lifecycle re-engineered
around AI as the implementation engine, with humans repositioned as deciders and verifiers.

You cannot get to the second by sprinkling. The engine was never the problem. The vehicle
has to be rebuilt.

## Principle one: shift left, to its actual limit

Every stage a defect travels rightward, it costs more to fix. The rightmost stage is the
customer debugging your product in production.

The usual reading of "shift left" stops at moving tests earlier. Taken to its limit it
means something stronger: every check moves to the leftmost point that exists, the
developer's own machine, and then runs again in CI as a gated check rather than as advice.

That limit includes requirements. A defective requirement is a defect like any other, and
it is cheapest to fix before anyone builds against the wrong answer. So a completeness
analysis interrogates the requirement first, looking for missing scenarios, unstated
expectations, contradictions, and the technical obligations that business documents almost
universally omit. When it finds them, the requirement goes back to the business that wrote
it.

## Principle two: verified, not trusted

Every use of AI that is not generating code arrives as an independent examiner of finished
work. A fresh session, on a different model family, holding the requirement rather than the
author's intentions.

Nothing in the pipeline certifies its own output.

That sentence carries more weight than it first appears to. It rules out the assistant
grading its own homework, and it rules out the comfortable arrangement where the same
context that produced the code also judges it. A fresh context is a weak form of
independence on its own, so the model family differs too, and the examiner is handed the
requirement rather than the story of how the code came to be.

## The human stays in the cockpit

Judgment precedes generation.

A named engineer authors the arrangements and assertions that define correct, ratifies
them, and signs a commit containing nothing but the failing test. Only then does the
assistant implement, under constraints it cannot argue with: no write access to the
protected test suite, no ability to merge, and its own identity in the audit trail so the
record shows what the machine authored and what a human judged.

The ordering matters more than any individual control. Deciding what correct means, before
anything exists to be judged, is what keeps the definition honest.

## Engineering gate one

You do not widen the review gate. You re-architect it.

The architecture team writes the review standard once, stricter than the default rather
than looser, and compiles it into a versioned rules package. Written guidance becomes
operationalized rules: specific enough that a reviewer, human or machine, applies each one
the same way twice.

That single package drives two enforcement points. The assistant on the developer's own
machine reviews against it while the code is being written, and the same package backs the
gated check in CI. Same rules, same bar, checked at two moments, invented nowhere twice.

The piece that makes this more than paperwork is the integrity receipt. A file that passes
local review travels with a checksum proving it reaches the merge gate unchanged. If the
receipt checks out, that file is not reviewed again. Review workload gets absorbed in
parallel at every developer's desk instead of piling up at one central chokepoint, and
nobody pays for the same AI review twice.

The bar goes up. The queue disappears.

### Certified, not assumed

Generic AI review is where this usually falls down. Independent benchmarks put frontier
models somewhere between 15% and 31% of what human reviewers flag, which is not a
foundation to build a gate on.

The answer is certification. Every rule sits an exam against every model before it is
allowed near production code: code with known violations it must catch, clean code it must
pass, and the graded papers kept as evidence. No pass, no deployment. Because certification
is per model, each rule can then be routed to the cheapest model certified to enforce it.

Every finding is also an anonymous, aggregated data point. Measure problems, not people.
When the same issue keeps recurring, that is a signal to engineer it away by sharpening the
guideline, fixing the context the assistant is given, or training on the topic. The defect
arrival rate falls over time, which means the gate gets cheaper the longer it runs. A gate
with a fixed cost is a toll. This one is a flywheel.

## Engineering gate two

Gate two is where the herd actually lands, and the instinct is always the same: testing, we
already do that.

So start with the question instead. If the AI writes the code, and the AI writes the tests,
who is checking whom?

Conventional tests are coupled to the implementation. They mirror the code's structure,
they mock its internals, and when the assistant regenerates the code it regenerates the
tests alongside. The auditor and the accountant become the same party. The independent
research says it plainly: AI-generated tests over-mock, use weak assertions, and are
supplements to rather than substitutes for human-designed verification against real
behaviour.

### What high fidelity means

Functional acceptance testing at the boundary treats the system as a sealed black box. Nothing
inside it is mocked or altered to make it testable. Interception happens only at the true
edges, in the framework layer, never in the team's own code.

Concretely, that means the order-confirmation email really sends and really lands in a real
inbox, and gets asserted line by line: correct recipient, order number in the subject, line
items and total in the body. The database write is checked column by column. A message to
the broker is picked up by an actual subscriber on the far end and its attributes asserted.

None of that is a shallow check that something ran without error.

The arrangements must establish the exact scenario and the assertions must demonstrate
its required outcomes. AI assistance follows explicit guidelines for functional acceptance
testing at the boundary, and the human sponsor judges the result before ratification.

Verified, not trusted. Verification compares the feature specification with the functional
acceptance tests at the boundary to establish whether the tests demonstrate every required
scenario, business requirement, and acceptance criterion. Relevant technical and
non-functional obligations need appropriate evidence too. A passing suite cannot establish
a requirement its scenarios and assertions never exercised.

That examination runs through a controlled workflow, with explicit stages, retained
evidence, and executable checks for missing work. A directed graph governs progression.
Models perform bounded examinations within it; their judgments remain fallible. The
workflow must establish which obligations were examined and which remain unresolved.

### Ratification

Architecture gives these tests their independence. Process locks it in.

A human sponsor personally authors every arrange and every assert, signs a commit
containing nothing but the failing test, and from that moment the test is immutable to the
assistant. The constraint is mechanical rather than a matter of discipline: the test
project is write-protected and the signature is verified at the build server.

A human authors the verdict, signs it, and the machine is physically unable to touch it.
That is the answer to who is checking whom.

## The inversion

Because these tests never look inside the system, they are decoupled from the
implementation. That is the property the industry has discussed for years without producing
many working examples.

In an AI-native lifecycle the property changes what a test is for. These are the only tests
that stay valid when the code underneath them is rewritten, which happens constantly once
generation is cheap.

So the relationship inverts. The tests become the durable asset, the executable statement
of business intent, the thing you own and accumulate. The code becomes regenerable output.

Every feature adds its functional acceptance tests at the boundary to the regression
suite. Gate two runs that entire accumulated suite against the current implementation.
The business retains an executable record of its requirements. Engineering has the
evidence to make a release decision and to check that a refactor preserves required behaviour.

QA concentrates on UI and UX, where human judgment evaluates the experience. During each
sprint, QA tests the new features and uses AI assistance to automate their repeatable UI
checks. Those checks become part of the UI regression suite. Previous features run through
that automation instead of requiring a complete manual retest every sprint. Backend
verification is already carried by the functional acceptance tests at the boundary.

Gate two stops being the bottleneck.

## What this adds up to

Two principles run underneath all of it. Push every check to the leftmost point it can
exist. Let nothing certify its own output.

Two gates enforce the result. One reviews the code against a standard authored once and
enforced everywhere. The other verifies behaviour through the system's real boundary,
against tests a human signed and the machine cannot edit.

Verified, not trusted. The tests themselves are verified against the specification before
their passing results become evidence for the release decision.

Engineer both, and the pipeline moves as fast as the code being written without quietly
losing what review and verification were there to catch.
