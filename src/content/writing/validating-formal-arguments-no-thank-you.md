---
title: "Validating Formal Arguments? No Thank You!"
description: "Validate and clean data at the front and back doors; skip checks on internal formal arguments. Immutable DTOs preserve trust, one exception reports all errors, and black box tests exercise the doors."
datePublished: 2020-12-20
hero: validating-formal-arguments-no-thank-you
dateModified: 2026-09-23
tags: ["error-handling", "testing", "domain-facade", "configuration-provider", "design-patterns", "boundary-validation"]
youtube: "https://www.youtube.com/watch?v=2BJ11M9rrzY"
---

## Lock the Doors and There's No Boogeyman in the House

This video was where I first put the front-door and back-door rule into words. Validate and clean data at the system boundaries, then trust the immutable data that moves inside. The chapter shows why validating every formal argument duplicates work and why accumulating all boundary errors into one useful exception matters.

## The Guideline Everyone Follows and Nobody Reads

Sometimes I catch myself wondering why we validate formal arguments inside all our methods &#8212; and what would happen if we didn't. As you can probably imagine, I'm <em>for</em> not validating, which puts me against most of the community and against the famous Framework Design Guidelines book &#8212; a book I largely like, organized beautifully: each guideline is followed by commentary from Microsoft insiders, who sometimes disagree with it outright. Which itself teaches something: not every guideline makes sense to everyone, or for everything.

Guideline 5.8.2, "Validating Arguments," says rigorous argument checks are crucial to modern reusable libraries; that they cost a little performance but end users will pay it <strong>for the benefit of better error reporting</strong> &#8212; which becomes possible if arguments are validated <strong>as high up on the call stack as possible</strong>. Rico Mariani of the .NET runtime team adds the sharpest comment: the key words are <em>high on the call stack</em> &#8212; the lower down you go, the less relevant validation becomes and the more it costs.

Hold those two phrases. Because the practice this guideline spawned &#8212; the .NET framework source, the open-source ecosystem, most enterprise codebases validating <em>every argument of every method of every class</em> &#8212; satisfies neither of them. And my practice, which looks like heresy, satisfies both better than anyone. Is our application higher up the call stack than the runtime and the frameworks it sits on? Of course &#8212; so it's better that <em>our application</em> does the validation than the layers below. So far the guideline and I agree. The question is where in the application.

Common practice is not common sense. All you can truthfully say about a common practice is that it is a practice, practiced commonly &#8212; it carries no evidence of being right. And (the quote is attributed to Asimov, and I don't much care if that's accurate) our assumptions are our windows on the world: scrub them once in a while or no light comes in. I followed this practice for years before questioning what it was actually buying me.

## The One Slide: Front Door, Back Door

If you lock the front door and you lock the back door, you're safe in the house.

The <strong>front door</strong> is input coming in from the front &#8212; the UI, your API. The <strong>back door</strong> is everything else the system touches: the database, external services, the file system, the config file. (People treat the config provider as no big deal; to me it's a full back door &#8212; mine returns strongly-typed data, validates every value on the way in, and throws if anything is off. No garbage enters the system through configuration.) The system itself &#8212; the domain layer, not the UI &#8212; is the black box I protect with my life: one public class, the domain facade; immutable DTOs shuttling data in and out; no behavior classes visible. (Mechanically the front-door validation lives in the managers just inside the facade &#8212; the facade is a pass-through with no logic &#8212; but conceptually it's the front door.)

Lock both doors &#8212; <strong>validate and clean up at the boundaries</strong> &#8212; and there is no boogeyman in the house: not under the bed, not in the closet, nowhere. Inside the system, classes trust each other completely. Anything I hand you is valid by construction; you never check.

Two details of what "locking" means:

- <strong>Cleanup.</strong> In my systems a string has two states, not three: null, or a valid value. Empty strings do not exist inside the system. Trim the padded spaces a SQL char column sends you (that's the back door's job &#8212; once, at the boundary, not in the fifteen call sites that happen to consume it); an empty string cleans up to null; if null is legal for that property it enters as a proper null, and if it isn't, the door throws. The moment you see a null-or-empty check <em>inside</em> a system, something is a mess: either you're imagining a boogeyman or somebody let one in.
- <strong>Accumulate, then throw once.</strong> When a DTO with ten properties comes through the door, validate all of it, accumulate every problem, and throw <strong>one</strong> exception that details every issue and its fix. Ten exceptions for ten fields is tedium for the caller; the point of door validation is <em>better error reporting</em>, remember.

And notice: the doors are the <strong>top of the call stack</strong> &#8212; the point of entry. It does not get any higher. Validated there, with the offending input in hand, errors are reported with everything needed to reproduce the failure: log the exception with the input, replay the input, watch it blow up. That is the guideline's own "better error reporting, high on the call stack," delivered &#8212; by <em>not</em> validating formal arguments everywhere.

## The Game: Caveat Emptor

Let's play. I'm a class with a method; you're a class with a method. Your signature asks for a string. I call you &#8212; with a null. You, per this talk, do no validation; you operate on it and blow up with a NullReferenceException. I come to you: "Dude, why are you throwing?" Your response &#8212; and it <em>needs</em> to be this response &#8212; is:

<strong>Caller's data, caller's problem. Buyer beware.</strong>

So I look at the data. And I never created that string &#8212; my caller gave it to me. So I go catch <em>him</em> and say the same thing you told me. If every class in the chain plays the game &#8212; "you asked for a string, you got a string, it was null, not my problem" &#8212; the defect travels upstream, and upstream, and where does it land? <strong>The front door.</strong> Which means: if the front door had validated and cleaned up properly, the problem could never have existed. The chain of refusal is precisely what makes the root cause findable.

Contrast the common alternative. Something throws deep in the system; the dev "fixes" it &#8212; with a null check, right there. That's treating the <em>symptom</em> at the site where it appeared, not the <em>cause</em> &#8212; and it applies far beyond validation: wherever you see a problem, don't patch it where you see it; ask why it reached you at all. Every just-in-case null check buried in the system is a question mark permanently welded into the code: is that check load-bearing? Is somebody actually sending nulls? Are we cleaning up data that was already clean? Nobody will ever know. That's the clutter &#8212; and the confusion &#8212; that validating formal arguments everywhere buys you.

One supporting discipline makes the trust chain airtight: the only things that move through my system are <strong>immutable DTOs</strong>, cleaned and validated at the doors, frozen thereafter. Behavior classes don't travel; data does &#8212; and once it's in, nobody can corrupt it mid-flight, so there is nothing to re-check.

## The Culprit

Why does everyone validate everywhere? I think the biggest culprit is <strong>testing in isolation</strong>. If you test at the class level, you must be able to feed each class bad data and watch it defend itself &#8212; so every class must validate. The style of testing <em>forces</em> the style of code. I don't do class-level testing; I test the system as a black box through its public surface, the way it will actually be used &#8212; and from out there, bad data <em>cannot get past the doors</em>. The deep-in-the-guts validation isn't just unnecessary; it's untestable through any legitimate path, because the scenario it defends against cannot occur. It defends the class as if that one class were going to rule the world someday. It isn't. It has a place on the totem pole, a level of abstraction it lives at, and callers above it that already went through the doors.

This is a proven practice for me &#8212; not a belief system. Teams that didn't believe it were converted by watching the system run. And as always: prove to me there's a better way and I'll switch overnight &#8212; I've switched languages, careers, and diets that way. But it has to be proof, not common practice.

## Summary

- The Framework Design Guidelines ask for better error reporting via validation high on the call stack. The doors of the system &#8212; front (UI/API) and back (database, services, file system, config) &#8212; <em>are</em> the top of the call stack. Validate and clean up there; nowhere else.
- Lock both doors and there's no boogeyman in the house: classes inside trust each other absolutely; immutable DTOs guarantee nothing degrades in flight.
- Strings inside the system have two states: null or valid. An empty-string check inside the system is a symptom that a door is unlocked.
- Door validation accumulates every problem and throws one exception that says exactly what's wrong with everything &#8212; that's what good error reporting means.
- Inside the system: caveat emptor. Caller's data, caller's problem. Push bad data upstream to its source; never patch the symptom with a local null check.
- The culprit behind validate-everywhere is class-level testing in isolation. Test the system through its doors and interior validation has no reason to exist.
- Common practice is not common sense.
