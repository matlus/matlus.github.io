---
title: Stampede at the Gates
description: >-
  AI did not break the software lifecycle. It removed the speed limit that was
  concealing how fragile the lifecycle already was.
datePublished: 2026-07-17
dateModified: 2026-09-20
tags:
  - verification
  - acceptance-testing
  - ai-assisted-development
  - code-review
  - testing
hero: stampede-at-the-gates
diagrams:
  - stampede-gates
status: established
---

For decades, software delivery held a balance nobody designed.

Developers produced code at the pace of human cognition, carrying the requirement, the
existing system, the design, the edge cases and the consequences in their heads, revising
earlier decisions as understanding changed. Every change went through code review, and
those reviews landed where they have always landed, on the leads and senior engineers.
Who else would an organisation trust with them?

Verification sat downstream. A QA function ran its cycle toward the end of every release,
alongside the unit suites every company runs, since no company on earth has ever publicly
claimed not to test.

So many features shipped per quarter. Defects came back at a rate everyone had learned to
live with. The cadence held, because every stage downstream of writing code was calibrated
to one speed.

Keep that word. Calibrated. This whole story is what happens when one part of the system
stops honouring the calibration, and what was hiding underneath it the entire time.

Because that equilibrium was never evidence the system worked. The defects returning from
production were evidence it did not. They simply arrived slowly enough to be accepted as
normal.

## The warning light was already flashing

Before AI enters the picture at all, look at what the industry was living with.

The unit suites ran green on every build. Isolated, mock-heavy, each component tested on a
bench. And QA kept finding backend defects those suites had missed. Production found more
still. Both facts were true for years, and almost nobody treated it as a contradiction.

It is worth being precise about what a green suite proves in that setup. Mocks replace
evidence with assumptions. An isolated test proves that a simulation agreed with itself,
which is a different claim from the assembled system behaving correctly. A component can
pass every isolated test and still be absent from the running system: registered
incorrectly, disabled by configuration, never called at all. Testing an engine on a bench
does not prove the engine is connected to the wheels.

Which leaves one explanation for why QA was manually verifying backend behaviour: the
automated verification beneath it had never proved the system as a whole. QA was the human
backstop for that gap, and its workload was the measure of how much the tests were
missing. Without that human layer, more would have escaped.

So the recurring defect stream was not an unavoidable property of software. It was
evidence that the verification model was insufficient, and the industry learned to live
with it.

## A Porsche engine in a jalopy

Then organisations installed AI coding assistants. They dropped a Porsche engine into the
old frame and expected to break speed records.

Developers accepted generated code a block at a time, then a feature at a time. Generation
speed climbed away from human cognition speed. The adoption dashboards looked wonderful.

The numbers a board cares about did not move, and the reason sits exactly where code goes
after it is written. Faster generation does not make the downstream work disappear. It
makes that work arrive faster at two fixed checkpoints, code review and verification, both
staffed by humans whose capacity is bounded by headcount.

The moment anyone pressed the accelerator, the existing weaknesses amplified. The wheels
came off. The chassis buckled under machine-speed torque. Testing that was already porous
became visibly porous once code started arriving at machine speed.

AI did not create the weakness. It made the weakness impossible to ignore. The engine was
never the problem, and the fix is not another engine.

## Stampede at the gates

Code is now written at machine speed. It is still reviewed and verified at human cognition
speed. Between written and shipped sit two gates in series, each with fixed throughput.
Gate one is code review, human judgement on every change. Gate two is verification, proof
that the system still works.

The bottleneck has moved, from writing code to trusting it.

The name borrows from the thundering herd problem in systems engineering, where many
processes wake at once and contend for a single scarce resource. The mapping is exact
rather than decorative. Many generated changesets arrive together and contend for scarce
reviewer attention, then for scarce verification capacity.

One difference makes this version worse than the classic. A thundering herd wakes on an
event and then disperses. This herd is continuously generated. It never stops arriving.

A caution on the metaphor before going further. The stampede describes volume dynamics.
The herd is the changesets, never the engineers producing them.

## The numbers are already in

This is not a prediction. Every slice of the pipeline anyone has pointed an instrument at
reports the same direction.

**Code output roughly doubles.** An enterprise that mandated AI assistance saw pull request
throughput reach 2.09 times its baseline, with reviewer load doubling alongside it. The
study's own title says it: "AI Writes Faster Than Humans Can Review." (CMU and Stanford,
2026, 802 developers and 196,000 pull requests.)

**The review gate is already being bypassed.** 61% of AI-authored pull requests merge with
no review at all. Only 8% receive human-only review. Teams are not absorbing the volume;
they are waving it through. (Duma and others, 2026, in-the-wild data.)

**Waving it through has a price.** Telemetry across 22,000 developers shows bugs per
developer up 54%, production incidents per pull request up 242.7%, and median review time
up 441%. (Faros AI, 2026, 4,000 or more teams.)

**Deployments break more often.** Every 25% increase in AI adoption correlates with a 7.2%
drop in delivery stability, meaning how often changes break production and how long
recovery takes. That association has been negative for two annual reports running. (DORA,
2024 to 2025, around 5,000 respondents.)

**Tests multiply, verification does not.** 81% of enterprise leaders report more production
issues, and 70% say maintaining the test suite now outweighs writing the code itself. AI
multiplies tests too, but tests coupled to the implementation break with every change.
Volume went up. Verification realism did not. (CloudBees, 2026, 200 or more enterprise
technology leaders.)

Different studies, different methods, different commercial incentives, same direction.
DORA's own phrase for the mechanism is that AI amplifies what is already there, including
your weaknesses.

## Why widening gate one fails

The intuitive response is to relieve the first gate. Add reviewers, loosen the bar, accept
more on trust, point a generic AI reviewer at the queue.

Every one of those increases the flow rate through gate one. None of them reduces the
herd.

Two of them fail on their own terms before we even get to the relocation problem. Waving
work through is already the de facto behaviour, and that is what the 61% figure describes.
Pointing a generic AI reviewer at the problem runs into independent benchmarks showing
frontier models catch somewhere between 15% and 31% of what human reviewers flag.

But suppose you did relieve gate one. You have not removed the queue. You have relocated
it to gate two, the last checkpoint before production, where a miss costs the most and is
caught the latest.

This is textbook Theory of Constraints. Speed up a non-constraint and system throughput
does not move. All you have done is accumulate inventory in front of the real constraint,
and in software that inventory is unverified code sitting in a holding pen.

The traffic analogy works too. What causes a motorway pile-up is speed differential between
adjacent lanes rather than speed by itself, and generation now moves at a radically
different speed from everything downstream of it.

## Who is checking whom

Gate two is where the herd actually lands, and here the instinct is always the same:
testing, we already do that.

So start with a question instead. If the AI writes the code, and the AI writes the tests,
who is checking whom?

Conventional tests are coupled to the implementation. They mirror the code's structure,
they mock its internals, and when the assistant regenerates the code it regenerates the
tests too. The auditor and the accountant become the same party. The independent research
says it plainly: AI-generated tests over-mock, use weak assertions, and are supplements to
rather than substitutes for human-designed verification against real behaviour.

That phrase describes what boundary testing already is. The system is treated as a sealed
black box, with nothing inside mocked or altered to make it testable. Interception happens
only at the true edges. The order-confirmation email really sends and really lands, and
gets asserted line by line: correct recipient, order number in the subject, line items and
total in the body. The database write is checked column by column. A message to the broker
is picked up by a real subscriber on the far end and its attributes asserted. Nothing here
is a shallow check that something ran without error.

Because such tests never look inside the system, they are decoupled from the
implementation, which is the property the industry has discussed for years without
producing many working examples. In an AI-native lifecycle that property changes what a
test is for. These are the only tests that stay valid when the code underneath them is
rewritten.

The tests become the durable asset. The code becomes regenerable output.

## Engineer the gates, do not widen them

I have held this position since long before AI code generation existed. While humans
maintain code, review matters for maintainability. If I could keep only one of the two
practices, I would keep functional acceptance testing at the boundary, because it produces
evidence rather than opinion.

In the AI-generated era that stops being a preference and becomes the only available
answer. Without functional acceptance tests at the boundary, ask plainly what is giving
you the confidence to put generated code into production. The reviewer who read it
quickly? The tests the same model wrote to check its own work?

You do not relieve a stampede by opening the gates wider. Widening a gate means lowering
its standard, and a gate with no standard is a hole in the fence.

Engineer both gates as one system, so the pipeline moves as fast as the code being written
without quietly losing what review and verification were there to catch. The alternative
is on the record, in five separate studies, pointing the same way.

Anyone selling a fix for gate one alone is selling a stampede relocation service.
