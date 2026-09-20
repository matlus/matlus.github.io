---
title: Stampede at the Gates
description: >-
  AI did not remove the bottleneck in software delivery. It moved the bottleneck
  downstream, to the gate that is more expensive to fail at.
datePublished: 2026-07-17
dateModified: 2026-09-20
tags:
  - verification
  - acceptance-testing
  - ai-assisted-development
  - code-review
hero: stampede-at-the-gates
diagrams:
  - stampede-gates
status: established
---

When AI enters the software development lifecycle, code generation stops being the
constraint. Work that used to take a team a sprint now arrives in a day.

The pipeline downstream of generation did not change. It still runs at human speed, and
it contains two gates in series, each with fixed throughput. First code review. Then
verification.

The industry has noticed the crowd forming at the first gate. Almost nobody is talking
about the second. And here is the trap: relieving the first gate does nothing to
disperse the crowd. It relocates the crowd to the second gate, which is the last gate
before production and therefore the expensive one to fail at.

## Why call it a stampede

The name borrows from the thundering herd problem in systems engineering, where many
processes wake at once and contend for a single scarce resource. The mapping is exact
rather than decorative. Many AI-generated changesets arrive together and contend for
scarce reviewer attention, then for scarce verification capacity.

One difference makes this version worse than the classic. A thundering herd wakes on an
event and then disperses. This herd is continuously generated. It never stops arriving.

A caution on the metaphor before going further. The stampede describes volume dynamics.
The herd is the changesets, never the engineers producing them.

## Gate one: code review

Reviewer attention was always scarce. What AI changed is the volume of work arriving at
that fixed resource, without changing the resource.

Under that pressure, review depth degrades quietly. Reviews get faster and shallower.
Approval starts tracking plausibility instead of correctness, and plausibility is
precisely what generated code is best at. The gate does not visibly break. It stops
filtering while continuing to look like a gate.

This is the gap most of the industry conversation is about, and it is real. The problem
is what happens next.

## The trap

Every intuitive response to the review gap shares one property. AI-assisted review, more
reviewers, lighter-weight review, higher trust in generated code: all of them increase
the flow rate through gate one. None of them reduce the herd.

Whatever passes gate one arrives at gate two immediately, and in volume.

This is textbook Theory of Constraints. Speed up a non-constraint and system throughput
does not move. All you have done is accumulate inventory in front of the real
constraint. In software, that inventory is unverified code, and a queue of unverified
code is risk sitting in a holding pen.

The traffic analogy works too. What causes a motorway pile-up is speed differential
between adjacent lanes rather than speed by itself, and generation now moves at a
radically different speed from everything downstream of it.

## Gate two: verification

The second gate is boundary testing. Proving that code behaves correctly at its
functional boundaries, against real infrastructure, before release. It is the
authoritative pre-release gate, the last point at which a defect is still cheap.

It is also far less visible than review. Review queues surface in tooling dashboards, in
pull request aging reports, in developers complaining. Verification shortfall surfaces
later, as production incidents that nobody traces back to the moment the herd was waved
through.

Failing gate two costs more than failing gate one, and the gap widens the further a
defect escapes. That asymmetry is why relocating the stampede downstream is worse than
leaving it where it was.

## What actually earns confidence to ship

I have held this position since long before AI code generation existed. While humans
maintain code, review matters for maintainability. But if I could keep only one of the
two practices, I would keep functional acceptance testing at the boundary, because it is
the thing that produces evidence rather than opinion.

In the AI-generated era that position stops being a preference and becomes the only
available answer. Ask yourself plainly: without functional acceptance tests at the
boundary, what is giving you the confidence to put generated code into production? The
reviewer who read it quickly? The tests the same model wrote to check its own work?

At the speed code is now produced, review alone cannot carry that weight. Boundary
testing can, because it exercises the system through its front door as a black box and
does not care who or what wrote the implementation.

## The resolution

You do not relieve a stampede by opening the gates wider. Widening a gate means lowering
its standard, and a gate with no standard is a hole in the fence.

The answer is to engineer both gates as one system. Intent-driven, AI-assisted review at
gate one. Boundary testing elevated to the authoritative release gate at gate two. The
two designed together, so that relieving one does not drown the other.

That is a larger conversation than the review-tooling one the industry is currently
having. It is also the more useful one, because it addresses where the risk actually
lands.

Anyone selling a fix for gate one alone is selling a stampede relocation service.

## A note on numbers

There are no percentages in this argument, and that is deliberate. The mechanism holds
because it is self-evidently true once drawn, rather than because a survey said so. Any
figure I attached here would be invented, and an invented figure is the fastest way to
lose a reader who knows the subject.

If you want to measure it in your own organisation, the quantities worth counting are
changeset arrival rate, review time per changeset over time, and the proportion of
releases covered by boundary tests. Those are observable. Watch the second one fall
while the first one climbs.
