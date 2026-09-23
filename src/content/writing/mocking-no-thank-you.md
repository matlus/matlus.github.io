---
title: "Mocking? No Thank You!"
description: "Test whole features through the public surface so regression tests survive later design changes. Class mocks bind tests to internals; transport doubles cover rare external failures."
datePublished: 2019-10-12
dateModified: 2026-09-23
tags: ["testing", "acceptance-testing", "mocking", "test-driven-development"]
youtube: "https://www.youtube.com/watch?v=9BaDj8SSsdM"
---

## Stop Mocking and Start Testing

This chapter takes the argument from my video beyond the joke in its title: test whole features through the public surface, use a stand-in only at an external transport when a failure cannot be produced on demand, and keep tests stable as the design changes. I also examine the isolation premise behind mocking and the TDD process Kent Beck described.

## Who Came Up With This Term?

Mocking means making fun of someone insultingly. I don't like mocking because it's insulting &#8212; and that's all I've got to say about it. See you next time.

...Alright. Today I'm mocking mocking, and since you only mock when you test, we're talking about testing: what Kent Beck actually said about TDD, what the mockists (Martin Fowler's term, not my insult) do instead, and what I do.

## Testing in Isolation: The Premise I Reject

Mocking exists to serve one idea: <strong>testing classes in isolation</strong>. Class A depends on B and C; the mockist wants to test A <em>without</em> B and C, so B and C get mocked and injected. At first blush, why not? Look closer.

I come from electronics, and the metaphor I always reach for is the graphics card: thousands of components on the board, and the board itself a component of the PC. The manufacturer tests the assembled card in a test jig that simulates the PC's interface &#8212; they don't re-test every resistor in place. And when did you last buy a TV that died in five years? That industry tests the <em>assembled television</em> &#8212; heat, humidity, vibration, years of soak time &#8212; not the parts in isolation and a quick "does it turn on." A colleague put it perfectly: the mockists' car dealer praises how thoroughly the manufacturer tested every part and piece &#8212; but nobody ever test-drove the car.

From a design standpoint, when I build class A with dependencies B, C, D &#8212; <strong>I don't want to know.</strong> I'm not kidding. A class is like a car: I turn the key; it works. If it's missing something at construction it throws, once, at setup &#8212; after that, no complaints. So when I test A, I test A &#8212; doing whatever it really does, with whatever it really uses. And to the objection "without isolation you can't tell whether B or C failed": really? Is your software written so badly you can't tell? My exception messages tell me exactly what went wrong, and you're debugging at test time with the best debuggers the industry has ever had &#8212; you're not diagnosing via mock configuration in production.

## The Streetlight

A man on his hands and knees under a streetlight is asked, "Lost something?" &#8212; "My keys." The passerby kneels and helps him search. Finding nothing, he asks, "Are you sure you lost them here?" &#8212; "No, I lost them over there." &#8212; "Then why are we searching here?!" &#8212; <strong>"Because the light is here."</strong>

We do what we <em>can</em>, not what we <em>should</em> &#8212; I'm as human as anyone, so I include myself. Integration testing looks hard (hard is relative &#8212; a marathoner doesn't call five miles hard), mocking is where the light is, so we search under the streetlight and then build an entire story justifying it: isolation is a virtue, integration is slow, classes must expose their dependencies... You first do what you're doing, <em>then</em> define it as a principle. In my honest opinion the biggest driver of inject-every-single-class dependency injection <strong>is mocking</strong> &#8212; if people would just own up to that. There is no other explanation for backing every class in the system with an interface and injecting it.

## What Kent Beck Actually Said

Kent Beck introduced TDD to this community, and the mockists cite him while doing the opposite of what he wrote. Points of order from the book:

- <strong>A unit is a functional unit of work.</strong> Not a class, not a method, not a property &#8212; a feature with its N scenarios. (Roy Osherove says the same.) The "unit = class" reading is where test-in-isolation snuck in.
- <strong>It's test-driven </strong><strong><em>development</em></strong><strong>, not test-driven design.</strong> Beck is explicit: while testing, you are not designing. Write the test for the scenario, then make it pass <strong>"as simply as possible"</strong> &#8212; by which he does <em>not</em> mean stupid placeholder code; he means full production-quality code, the entire feature, in one class, one method, without trying to decompose it into a design. One feature, one method, all the tests green.
- <strong>Red, green, refactor &#8212; refactor the </strong><strong><em>tests</em></strong><strong>.</strong> The refactor leg keeps the <em>test code</em> clean and production-quality, because tests are yours for a lifetime.
- <strong>The designer hat comes later.</strong> After the suite is green, design the system &#8212; decompose, introduce classes, collapse classes &#8212; and the tests <strong>must not break</strong>. Requirements didn't change, so behavior didn't change, so green stays green. Adding new classes is not a signal to add new tests.

Now: how can a mockist pull that off? Refactoring the design <em>creates and destroys classes</em> &#8212; and their tests are wired to the classes.

## The Coupling, and What It Costs You

To mock B, your test must know A depends on B. And which method A calls on B. And that method's parameters, their types, and its return type. The strict-mode mockists go deeper still: A internally hydrates a DTO through its own private logic before passing it to B, and the mock setup asserts <em>that DTO's exact property values</em> &#8212; intimate knowledge of intermediate state the test has no business knowing. I get goosebumps thinking about it. Sneeze on the production side, <strong>earthquake on the testing side</strong>.

Fine &#8212; you're willing to pay the cleanup? Then you've lost the one thing the business is paying for. The reason a customer gives you time to write tests is <strong>regression</strong>: as features accrete, what worked before must keep working, which means the suite must be <strong>carved in stone</strong> once green. Refactor freely, run the same untouched tests, ship with confidence &#8212; <em>that's</em> the guarantee you sell. The moment a refactor forces you to rewrite the tests, what exactly is your regression suite regressing against? An architect at work told me his devs fix a bug in two days and then spend two weeks fixing the tests, and asked how I sort that out. I said: we don't do your kind of testing. (They migrated to mine.)

## What I Do

I start with <strong>end-to-end integration tests</strong> &#8212; functional tests, acceptance tests, every scenario of every business requirement, through the system's public surface. If the system is a thousand components, five services, and a database &#8212; I test the whole thing, my database, my stored procs, everything. I can't go to production without complete faith in the system I'm building; and if you shouldn't ship without testing every scenario end-to-end anyway, why spend the schedule testing parts and pieces on the side? When the business asked me, on short notice, "can we take what's in the repository to production tomorrow?" &#8212; the answer was yes. That confidence is the entire product. My goal writing that suite is to <strong>lock the system down like superglue</strong>: if the system drifts the slightest bit, at least one test <em>must</em> break.

Rarely &#8212; and only at the extremities &#8212; I use what I call a <strong>test double</strong> (a stunt double): when I cannot make a real external service throw the exception a scenario requires, I stand in for it <em>at the transport</em>. In .NET the thing I replace is a framework class, not mine &#8212; which means <strong>I am still testing 100% of the code I wrote</strong>. That's the line: stand-ins for the world outside the system, never mocks of my own classes inside it.

Two objections, quickly. "Integration tests are slow": what exactly are you writing? The service on the other side was built by programmers as good as you; a network hop costs ~100ms; databases are not slow. And "you have so many tests to maintain": other way around &#8212; I have orders of magnitude <em>fewer</em> tests, because features number far fewer than classes, and mine never get rewritten.

Years ago some Google engineers titled a talk "<strong>Stop mocking and start testing</strong>." That's the most apt statement I can offer anyone who mocks &#8212; though as always: show me a double-blind-quality proof that mocking buys what it claims, and I'll make the "Mocking? Yes Please!" video tomorrow. I'm not married to my practices. So far, nobody's even come close.

## Summary

- Mocking exists to serve test-in-isolation, and test-in-isolation is the streetlight: we do what we can, not what we should. It &#8212; not architecture &#8212; is what drives inject-everything dependency injection.
- Kent Beck's actual TDD: unit = functional unit of work; write the whole feature as simply as possible (real production code, one class, one method) while wearing the testing hat; refactor the <em>tests</em>; design later &#8212; without breaking the tests. Adding classes is not adding tests.
- Mock-based tests know your dependencies, methods, signatures, return types, and (strict mode) intermediate DTO values: sneeze on production, earthquake on tests &#8212; and a rewritten test suite can regress nothing. Tests are carved in stone or they are not a regression suite.
- Test end-to-end through the public surface, every scenario of every feature, real database included; lock the system down so any drift breaks a test.
- Stand-ins only at the transport, for failure scenarios the real world won't produce on demand &#8212; replacing framework plumbing, never your own classes: you still test 100% of the code you wrote.
- Stop mocking and start testing.
