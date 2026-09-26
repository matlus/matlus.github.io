---
title: Stampede at the Gates
description: >-
  AI generation exposed an already flawed SDLC: faster code review moves the queue
  to verification, which needs functional acceptance testing at the boundary.
datePublished: 2026-07-04
dateModified: 2026-09-26
tags:
  - verification
  - acceptance-testing
  - ai-assisted-development
  - code-review
  - testing
hero: stampede-at-the-gates-bulls
status: established
---

<!-- audit-allow: verified, not trusted -->

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
normal, a cost of doing business. The old SDLC was already flawed. Human coding speed kept
the volume within reach of the people compensating for it.

## The warning light was already flashing

Before AI enters the picture at all, look at what the industry was living with.

The unit suites ran green on every build. Isolated, mock-heavy, each component tested on a
bench. And QA kept finding backend defects those suites had missed. Production found more
still. Both facts were true for years, and almost nobody treated it as a contradiction.

The testing pyramid never answered that contradiction. If the unit tests are passing and
QA is still finding backend defects, what exactly did those tests establish about the
system we were about to ship? The industry kept running its suites and paying for the
human backstop. We accepted the defects without accepting what they said about our tests.

Unit testing has never given us the confidence that the whole system meets its
requirements and is ready for production. QA doing that verification afterward is the
gap made visible. AI generation now feeds that same gap at a speed the human backstop
cannot absorb.

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

<figure class="article-diagram article-illustration">
<a href="/images/writing/stampede-jalopy-engine.webp" aria-label="Open the jalopy and performance engine illustration at full size"><img src="/images/writing/stampede-jalopy-engine.webp" width="1942" height="809" loading="lazy" decoding="async" alt="Two workshop scenes show the same worn jalopy. First, its original engine remains installed while a large performance engine waits on a trolley. Then the large engine is forced into the jalopy, bending its panels and straining the old chassis."></a>
<figcaption>The Porsche engine represents AI code generation. Installing it leaves the old lifecycle carrying power it was never built to handle.</figcaption>
</figure>

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

<!-- diagram:start stampede-gates -->
<figure class="article-diagram article-gates-comparison">
<div class="article-gates-comparison__panels">
<section><h3>Before: the review queue</h3><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 470" role="img" aria-labelledby="gates-now-title gates-now-desc" style="font-family:var(--font-sans);font-size:17px;fill:var(--diagram-label)">
<title id="gates-now-title">Changesets queue at code review</title>
<desc id="gates-now-desc">AI-generated changesets accumulate before code review. Only a small number reach verification.</desc>
<defs><marker id="gates-now-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--diagram-line)"/></marker></defs>
<g style="fill:none;stroke:var(--diagram-line);stroke-width:2" marker-end="url(#gates-now-arrow)">
<path d="M180 70 V151"/><path d="M180 208 V289"/><path d="M180 346 V381"/>
</g>
<rect x="58" y="25" width="244" height="45" rx="8" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="180" y="53.5" text-anchor="middle">AI-generated changesets</text>
<rect x="58" y="160" width="244" height="48" rx="8" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="180" y="190" text-anchor="middle">Code review</text>
<rect x="58" y="298" width="244" height="48" rx="8" style="fill:var(--diagram-fail-fill);stroke:var(--diagram-fail);stroke-width:2"/><text x="180" y="328" text-anchor="middle">Verification</text>
<rect x="58" y="390" width="244" height="45" rx="8" style="fill:var(--diagram-ok-fill);stroke:var(--diagram-ok);stroke-width:2"/><text x="180" y="418.5" text-anchor="middle">Production</text>
<rect x="140" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="140" y="109" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="109" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="109" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="109" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="140" y="123" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="123" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="123" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="123" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/><rect x="140" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<text x="180" y="148" text-anchor="middle" style="fill:var(--diagram-fail);font-weight:600">Queue of changesets</text>
<text x="180" y="458" text-anchor="middle" style="fill:var(--color-text-muted)">Incoming work exceeds review capacity.</text>
</svg></section>
<section><h3>After: the verification queue</h3><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 470" role="img" aria-labelledby="gates-next-title gates-next-desc" style="font-family:var(--font-sans);font-size:17px;fill:var(--diagram-label)">
<title id="gates-next-title">The queue moves to verification</title>
<desc id="gates-next-desc">Accelerating code review sends the same incoming work to the unchanged verification gate, where the queue accumulates.</desc>
<defs><marker id="gates-next-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--diagram-line)"/></marker></defs>
<g style="fill:none;stroke:var(--diagram-line);stroke-width:2" marker-end="url(#gates-next-arrow)">
<path d="M180 70 V151"/><path d="M180 208 V289"/><path d="M180 346 V381"/>
</g>
<rect x="58" y="25" width="244" height="45" rx="8" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="180" y="53.5" text-anchor="middle">AI-generated changesets</text>
<rect x="58" y="160" width="244" height="48" rx="8" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="180" y="190" text-anchor="middle">Faster code review</text>
<rect x="58" y="298" width="244" height="48" rx="8" style="fill:var(--diagram-fail-fill);stroke:var(--diagram-fail);stroke-width:2"/><text x="180" y="328" text-anchor="middle">Verification</text>
<rect x="58" y="390" width="244" height="45" rx="8" style="fill:var(--diagram-ok-fill);stroke:var(--diagram-ok);stroke-width:2"/><text x="180" y="418.5" text-anchor="middle">Production</text>
<rect x="140" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="95" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/><rect x="140" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="233" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="140" y="247" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="247" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="247" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="247" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="140" y="261" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="160" y="261" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="180" y="261" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<rect x="200" y="261" width="16" height="10" rx="2" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker)"/>
<text x="180" y="286" text-anchor="middle" style="fill:var(--diagram-fail);font-weight:600">Queue of changesets</text>
<text x="180" y="458" text-anchor="middle" style="fill:var(--color-text-muted)">The bottleneck moves downstream.</text>
</svg></section>
</div>
<figcaption>Accelerating code review relocates the queue to verification. Both gates sit in series. The queued changesets must still pass the second gate before reaching production.</figcaption>
</figure>
<!-- diagram:end stampede-gates -->

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

Tests that mirror the implementation inherit its assumptions. They mock its internals,
and when the assistant regenerates the code it can regenerate the tests to agree with it.
Calling that an eval changes nothing about what has been checked. The independent research
reports AI-generated tests that over-mock and use weak assertions. Generating more of those
tests does not establish that the feature meets its requirements.

Gate two runs the full regression suite of **functional acceptance tests at the boundary**.
Each feature adds its scenarios to that suite. Every subsequent change runs against the
accumulated behaviour the system must continue to satisfy.

Functional acceptance testing at the boundary exercises the entire running system. Nothing
inside it is mocked or altered to make it testable. Carefully arranged data and conditions
establish the scenario, and the action enters through the system's real boundary. Assertions
then inspect the actual outcomes at its true edges.

The order-confirmation email really sends and really lands in a real inbox. We assert the
recipient, the order number in the subject, and the line items and total in the body. The
database write is checked column by column. A message to the broker is picked up by a real
subscriber on the far end and its attributes asserted. Each assertion has an expected value
derived from the requirement. A check that something ran without error cannot establish
these outcomes.

<!-- diagram:start functional-acceptance-at-the-boundary -->
<figure class="article-diagram article-boundary">
<div class="article-boundary__panels">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420" role="img" aria-labelledby="fatb-system-title fatb-system-desc" style="font-family:var(--font-sans);font-size:18px;fill:var(--diagram-label)">
<title id="fatb-system-title">Functional acceptance testing at the boundary exercises the whole running system</title>
<desc id="fatb-system-desc">Precise scenario arrangements supply real inputs to the entire system. Nothing inside the system is mocked. Actual outcomes leave the system and are asserted at its boundaries.</desc>
<defs><marker id="fatb-system-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--diagram-line)"/></marker></defs>
<rect x="15" y="15" width="330" height="76" rx="8" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/>
<text x="180" y="43" text-anchor="middle" font-weight="600">Arrange the exact scenario</text>
<text x="180" y="72" text-anchor="middle">Data, state, inputs and conditions</text>
<path d="M180 91 V132" marker-end="url(#fatb-system-arrow)" style="fill:none;stroke:var(--diagram-line);stroke-width:2"/>
<rect x="15" y="144" width="330" height="220" rx="12" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:3"/>
<text x="180" y="197" text-anchor="middle" font-size="23" font-weight="600">The entire</text>
<text x="180" y="230" text-anchor="middle" font-size="23" font-weight="600">running system</text>
<text x="180" y="273" text-anchor="middle">Exercise its real boundary.</text>
<text x="180" y="305" text-anchor="middle">Nothing inside is mocked.</text>
<text x="180" y="337" text-anchor="middle">Observe actual outcomes.</text>
</svg>
<span class="article-boundary__connector" aria-hidden="true">→</span>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 490" role="img" aria-labelledby="fatb-outcomes-title fatb-outcomes-desc" style="font-family:var(--font-sans);font-size:18px;fill:var(--diagram-label)">
<title id="fatb-outcomes-title">Assert actual outcomes at the system boundary</title>
<desc id="fatb-outcomes-desc">Verify a delivered email's recipient, subject, order number, line items and total. Check every required database column value. Receive the broker message with a real subscriber and check its required attributes. Expected values come from the requirements.</desc>
<text x="180" y="25" text-anchor="middle" font-weight="600">Assert actual boundary outcomes</text>
<rect x="15" y="45" width="330" height="126" rx="8" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/>
<text x="180" y="74" text-anchor="middle" font-weight="600">Delivered email</text>
<text x="180" y="104" text-anchor="middle">Verify recipient and subject.</text>
<text x="180" y="129" text-anchor="middle">Assert order number, line items</text>
<text x="180" y="154" text-anchor="middle">and total in the delivered body.</text>
<rect x="15" y="187" width="330" height="126" rx="8" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/>
<text x="180" y="216" text-anchor="middle" font-weight="600">Stored database row</text>
<text x="180" y="246" text-anchor="middle">Query the real database.</text>
<text x="180" y="271" text-anchor="middle">Assert every required column</text>
<text x="180" y="296" text-anchor="middle">against its expected value.</text>
<rect x="15" y="329" width="330" height="126" rx="8" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/>
<text x="180" y="358" text-anchor="middle" font-weight="600">Received broker message</text>
<text x="180" y="388" text-anchor="middle">Receive with a real subscriber.</text>
<text x="180" y="413" text-anchor="middle">Assert the message's required</text>
<text x="180" y="438" text-anchor="middle">attributes and payload values.</text>
<text x="180" y="484" text-anchor="middle" style="fill:var(--color-text-muted)">Expected values come from requirements.</text>
</svg>
</div>
<figcaption>Functional acceptance testing at the boundary runs the entire system with precise arrangements and deep assertions against actual outcomes. The depth of verification determines what a passing test establishes.</figcaption>
<p class="article-boundary__coverage"><strong>Verify the tests against the specification.</strong> Establish that the functional acceptance tests at the boundary demonstrate every required scenario for the feature. Then run the full accumulated regression suite.</p>
</figure>
<!-- diagram:end functional-acceptance-at-the-boundary -->

The care in the arrangements and the depth of the assertions determine what a passing
test means. AI can help author these tests, but it must follow specific guidelines for
functional acceptance testing at the boundary. A human reviews and ratifies the scenarios,
arrangements, and assertions before they become the standard the implementation must meet.
The implementation assistant cannot change that standard to make its code pass.

**Verified, not trusted.** That applies to the tests themselves. Verification compares the
feature specification with the functional acceptance tests at the boundary and checks
whether those tests actually demonstrate every required scenario. Every business
requirement, acceptance criterion, and relevant technical and non-functional obligation
must have appropriate verification. A requirement mentioned in a test name or comment is
not enough. The arrangement must exercise it and the assertions must establish its outcome.
Where an obligation needs another method, such as a load test, that evidence belongs in
the release decision too.

This verification requires a controlled workflow with explicit stages, evidence, and
checks for incomplete work. A directed graph defines the permitted progression through
those stages. Models can examine the evidence within that workflow; maintained executable
controls enforce its required steps and retain the results. A skill can supply the
guidance, but a prompt telling a model to verify everything cannot establish that every
required check occurred. Model judgments still need scrutiny.

Only after the tests have been verified against the specification does a passing suite
provide the evidence we intended it to provide. A green run of an incomplete suite leaves
the missing scenarios unverified.

Because functional acceptance tests at the boundary judge observable behaviour, they can
survive an implementation rewrite while the required behaviour remains the same. The tests
become the durable asset. The code becomes regenerable output.

QA can then concentrate on UI and UX, where human judgment decides whether an experience
is correct and how it should improve. During each sprint, QA evaluates the new features
and uses AI assistance to automate repeatable UI checks. Those checks join the UI
regression suite, so previous features do not require another complete manual pass every
sprint. Human experience judgments remain human work. Backend behaviour is already covered
by the regression suite of functional acceptance tests at the boundary.

[The AI-Native Lifecycle](/writing/the-ai-native-lifecycle/) explains how the review gate,
test ratification, and verification gate fit together. The
[Verification with Intent section](/acceptance-testing/) collects the guidance on testing
strategy, arrangements, and assertions.

## Engineer the gates, do not widen them

I reached this position long before AI code generation. I wrote unit tests, questioned
what they were establishing, and stopped using them. I moved to functional acceptance
testing at the boundary around 2008 to 2010. I did not need a QA team
manually verifying my backend services. QA focused on UI and UX.

Writing functional acceptance tests at the boundary took as much time as writing the
production code, sometimes more. The arrangements had to be exact and the assertions
had to establish the outcomes. That work gave me the confidence to go to production.

I care deeply about maintainable code. Programming With Intent is built around it. But
if I had to choose where to spend my time, I would choose functional acceptance testing
at the boundary. Maintainability matters throughout the life of the code. These tests
give me the evidence I need to decide whether to ship it.

You do not relieve a stampede by opening the gates wider. Widening a gate means lowering
its standard, and a gate with no standard is a hole in the fence.

Engineer both gates as one system, so the pipeline moves as fast as the code being written
without quietly losing what review and verification were there to catch.

**Verified, not trusted.** Verify that the functional acceptance tests at the boundary
demonstrate every required scenario for the feature. Ratify their arrangements and deep
assertions against the requirements. Run the full accumulated regression suite against
the actual system. Passing that suite is the evidence I rely on for the backend release
decision. Unit tests and an assistant approving its own work have never given me that
confidence.

Anyone selling a fix for gate one alone is selling a stampede relocation service.
