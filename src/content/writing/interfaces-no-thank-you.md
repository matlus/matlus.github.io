---
title: "Interfaces? No Thank You!"
description: "C# interfaces do not inherently create contracts or loose coupling. Composition handles hierarchy conflicts; capability interfaces and structural typing let consumers see only what they need."
datePublished: 2019-09-21
hero: interfaces-no-thank-you
dateModified: 2026-09-23
tags: ["service-locator", "gateway-pattern", "design-patterns", "csharp", "interfaces", "interface-segregation", "composition-over-inheritance"]
youtube: "https://www.youtube.com/watch?v=jgeDx9bT684"
---

## Debunking the Folklore, Keeping the "Able"s

This chapter tests the familiar arguments for interfaces against the way they work in C#. I distinguish an API from the interface keyword, examine contracts and coupling, and show where small capability interfaces and interface segregation earn their place. I also consider structural typing, including Python's Protocol, as a way for consumers to declare the shape they need.

## What This Is and Isn't

This is one of my Let's Talk rants, and the target is the reflex &#8212; every class in the system backed by an interface, nobody able to say why. There <em>are</em> uses of interfaces I agree with, and I'll end there. But first I want to debunk the supposed benefits, because my beef isn't that people like interfaces; it's that the standard justifications aren't even true statements, and we repeat them like gospel. When I interview a senior engineer and ask why they use interfaces, I get one of the following.

## Debunk #1: "Program to Interface, Not Implementation"

The phrase comes from the GoF book &#8212; published in the mid-nineties, when the languages in question <strong>didn't have an </strong><strong>interface</strong><strong> construct</strong>. "Interface" there means what it still mostly means: the way you interact with something &#8212; the API of the class. Program to the API and don't concern yourself with which descendant you're holding. The advice is perfectly fine &#8212; I espouse it &#8212; but it has <em>no bearing</em> on the interface keyword. You shouldn't be using interfaces because somebody said "program to interfaces"; they weren't talking about them.

## Debunk #2: "Interfaces Are Contracts"

You have an employment contract. How would you like it if your employer changed it without your signature? They can't &#8212; all parties sign a change. How many times have you changed an interface without the sign-off of everyone implementing it? Then let's not BS ourselves: it's not a contract. The only "contract" an interface offers is that it has certain methods with certain signatures &#8212; <strong>and classes have that too</strong>. There was a time when interfaces really were contracts: COM. A COM interface had a GUID welded to it and was <em>never</em> changed &#8212; a revision meant a whole new interface (IBlah2, IBlah3). That was a contract, because the discipline made it one. If you're willing to apply that discipline to interfaces, you can apply it to classes; the keyword contributes nothing.

## Debunk #3: "Interfaces Give You Loose Coupling"

Compared to <em>what</em>? These statements come from history &#8212; from languages where they were true. In Delphi (I programmed it for years) a uses clause coupled you to an actual .pas file with actual implementation in it, and interface-vs-implementation placement of that coupling had real consequences; interfaces genuinely bought you decoupling, and I used them constantly. C++ has the same story with .h files &#8212; which is why C++ never needed an interface construct. In .NET, using names a <em>namespace</em> &#8212; an idea, not an assembly, not a file. A namespace spans assemblies; an assembly holds many namespaces. You are coupled to an idea either way, and you're coupled to an interface and to a class <strong>to exactly the same extent</strong>. I carried my Delphi interface habit into C# &#8212; until I understood namespaces and realized the advantage I was buying had ceased to exist.

## Debunk #4: "Your Base Class Forces Me Into Your Hierarchy"

The library argument: my library makes you descend from my abstract base, and you already have a million-dollar class &#8212; ten years, fully vetted in production &#8212; from a different hierarchy. Are you stuck? No &#8212; and interfaces don't save you a single step here. Say my library demands you descend from ShivThumbnailer and implement ProduceThumbnail. If it were an interface, you'd <em>still</em> have to define a class implementing it. So define the same class descending from my base, hold a reference to your million-dollar thumbnailer inside it, and forward ProduceThumbnail to yourThumbnailer.GenerateThumbnail. Same steps, same amount of work: <strong>wrap, don't descend</strong> &#8212; composition rescues you from any hierarchy conflict, base class or not. Debunked.

## Debunk #5: "Interfaces Give You Multiple Inheritance"

Every language since C++ deliberately dropped multiple inheritance, and you're touting it as a virtue? There <em>is</em> a family of interfaces I believe in &#8212; the <strong>can-do's</strong>: IDisposable, IComparable, IEnumerable. Java's naming convention ends them in "-able," and I wish .NET had copied that (yes &#8212; I'm agreeing with something from Java). A class <em>is</em> one thing, <em>has</em> some things, and <em>can do</em> certain things; capability interfaces express the can-do relationship, and implementing several of them is honest. But if you preach single responsibility and your class implements five non-able interfaces, that class is doing more than one thing &#8212; your own principle convicts you.

(For completeness: interface dispatch is also slower than virtual calls &#8212; never the reason to avoid them, just one more thing they don't win at.)

## C# 8 Default Implementations: Making It Worse

The Framework Design Guidelines spend about seven pages telling you to prefer classes over interfaces, for one central reason: <strong>versioning resiliency</strong>. Change anything about a shipped interface and you break every implementer &#8212; which is why COM never changed one, and why Erich Gamma (GoF author, Eclipse, VS Code) described the Eclipse ecosystem's interface-versioning pain and said he'd steer away. C# 8's <em>default interface implementations</em> exist to mitigate exactly that wound. I think it's a terrible idea &#8212; even people who love interfaces don't like it. Once interfaces carry implementation, how do you distinguish them from classes at all? Anders Hejlsberg (Turbo Pascal, Delphi, C#, TypeScript &#8212; the man is a master, and his north star was always simplicity) has moved on to TypeScript, and in my opinion C# has been taking on clutter ever since. This feature is the clutter I'd hold up as proof.

## When I Do Use Them: Segregating the Interface

Do I use interfaces? Almost never &#8212; but yes, when classes don't fit. The real case from my own system: the ServiceLocator sits high on the totem pole with dozens of methods. The Gateway, far lower, needs exactly one of them &#8212; CreateHttpMessageHandler. Handing the gateway the whole ServiceLocator violates the rule that runs through all my method and API design: <strong>don't give a class more than it needs</strong> &#8212; today it uses one method, tomorrow somebody uses four, and all hell breaks loose. So the gateway asks for an interface with that single method, the ServiceLocator implements it, and the gateway sees only the sliver it requires. That's interface segregation in its useful sense: slicing a fat API down to what the consumer needs.

But know the con before you buy: the lowly gateway has just <strong>forced</strong> the mighty ServiceLocator to implement an interface &#8212; the dependency arrow bends backwards, like someone at the bottom of the org chart telling the CEO to fetch coffee. In some systems I accept that con; in others I don't. Don't be married to a tool &#8212; know its cons and decide per system.

And here's the wish that dissolves the con entirely: <strong>structural typing</strong>. In TypeScript, D, or Swift, the gateway can declare the shape it needs and the ServiceLocator satisfies it <em>without ever being told to implement anything</em> &#8212; the compiler checks that it quacks. I've been asking for that in C# for years. I'm not telling the CEO to fetch my coffee; I'm taking the coffee as the CEO walks by.

Python grants that wish through typing.Protocol: structural typing, compiler-checked at the consumer, with no forced implementation on the provider. I use Protocol for capability seams in my Python code, so the particular interface cost I described does not apply there.

## Coda: Preparation and Foundations

Two asides from the rant worth keeping. Design patterns are the worst thing to <em>start</em> with &#8212; you'll get them today, get them more next year, and understand them properly a decade in; foundations first, always. And any interview you must <em>prepare</em> for is testing memorization, not engineering: you either know your stuff or you don't. This field is still growing up &#8212; we can't even agree on how to produce software &#8212; so hold your practices to evidence, not folklore.

## Summary

- "Program to interface, not implementation" predates the interface keyword and means <em>program to the API</em> &#8212; it recommends nothing about interfaces.
- Interfaces are not contracts unless you version them like COM did &#8212; and that discipline works identically for classes.
- The loose-coupling claim is imported from Delphi/C++, where coupling was to real files; in .NET you couple to namespaces (ideas) either way.
- Forced into a foreign hierarchy with a priceless existing class? Wrap it and forward &#8212; composition costs the same steps an interface would.
- Good interfaces are the "-able" capability slivers, and interface segregation &#8212; giving a consumer only the methods it needs &#8212; is the one use I reach for; its con (the provider is forced to implement) disappears under structural typing, which Python's Protocol provides natively.
- C# 8 default interface implementations paper over the versioning wound and erase the class/interface distinction &#8212; understand the cons of your tools.
