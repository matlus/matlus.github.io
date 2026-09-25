---
title: "Prefer Composition Over Inheritance"
description: "Composition keeps a configuration provider's capabilities limited to what its project needs. The refactor uses self-contained settings providers, a shallow base, and restrained reuse."
datePublished: 2022-02-06
dateModified: 2026-09-23
tags: ["class-design", "configuration-provider", "design-patterns", "composition-over-inheritance"]
youtube: "https://www.youtube.com/watch?v=bS-EcmMur8Q"
---

## A Real-World Example

This chapter follows a real refactor of configuration providers across several systems. The [example project from the video](https://github.com/matlus/PreferCompositionOverInheritance) contains the resulting code. The chapter explains why a base class that offers every descendant more than it needs obscures intent, and how small, self-contained providers let each system compose only the capabilities it uses. I also explain why I resist inheritance for extension and premature reuse.

## Not Another Toy Example

"Prefer composition over inheritance" comes from the GoF book, and most explanations of it are regurgitations of the GoF's reasoning &#8212; encapsulation gets broken, or maybe it doesn't, and the nerdy academic argument goes round and round. I really don't care whether it breaks encapsulation. I'm interested in the real world: what this tenet is protecting you from in a living codebase, shown through a refactor I actually performed. The reason I gravitate toward composition isn't in the GoF book at all, and to my mind it matters a lot more.

Two pieces of standing context first, because they feed the example.

<strong>Two kinds of inheritance.</strong> The GoF distinguish inheritance for the sake of <em>extension</em> (inherit base functionality, add more on top) from inheritance for the sake of <em>polymorphism</em>. I don't use the first kind &#8212; I stay away from it. My opinion is that inheritance exists in object-oriented programming for the sake of polymorphism; it's very rare that you genuinely can't do without extension inheritance, and there are almost always other ways.

<strong>I'm not a big fan of reuse.</strong> Shared "core"/"utilities" packages are not my go-to. I copy-paste across projects <em>knowingly</em> &#8212; the rule of thirds: the first repetition you just do, the second you do consciously and everyone keeps account, and around the third (sometimes fourth) you rethink the strategy &#8212; because by then you understand all the scenarios and their variations, instead of jumping the gun with a reusable package on day one. I know people who start making libraries before they write any code, imagining reuse that never arrives.

## The Scenario

The application is comprised of multiple solutions (each solution is a separate deployment), each with multiple projects. The Azure services they use overlap: message broker, blob storage, Cosmos DB. But not every project needs all three &#8212; some need one, some need two, and it's a different two per project. For six-plus months we copy-pasted the config-provider code across projects, knowingly. Then the time came: we understood exactly how the solutions would pan out, so let's roll the config providers up into a library.

The default way: put <strong>all</strong> the functionality &#8212; get message broker settings, get Cosmos DB settings, get storage account settings &#8212; into one base configuration provider class, and let each project use it (or descend from it and choose which protected methods to make public).

## The Problem: Being Given More Than You Need

I have a problem with that right away. Now you're <em>hoping</em> the devs on each team know not to use functionality that is sitting right there, available, in their class. Make the methods protected and let descendants decide? Nothing stops somebody tomorrow from making blob storage public in a project that isn't supposed to touch blob storage &#8212; "oh, I've got blob storage, cool, I'll just use it."

This is the same tenet as method design, from the very first Programming with Intent video: <strong>methods should be given exactly what they need &#8212; nothing more, nothing less.</strong> The same applies to ancestors. If you're doing inheritance, the base class must not carry a single member that isn't required by <em>every</em> descendant, now or in the future. That's a hard bar to clear &#8212; and it's one of the reasons I stay away from inheritance for extension, which is exactly what this design is: the base has all the implementation, and descendants extend/expose their slice of it.

And it's the same problem I have with libraries: the project that needs one class from a two-hundred-class library now has <em>access</em> to things it's not supposed to use, nobody can tell which classes it should be using, and breaking the library into self-contained packages later is misery. (The ideal library does one thing &#8212; Newtonsoft does JSON, all ten of its classes are about JSON, that's fine.)

There's also the classic hierarchy mess: put settings at different levels and you end up needing blob-storage settings from <em>that</em> branch while you're in <em>this</em> branch, and the permutations turn into a hodgepodge. But the availability problem is my primary beef.

Why does availability matter so much? <strong>Intent.</strong> Programming with Intent is "show me your intent." If you don't give me a feature in a class, I understand your intent: you don't want that feature available. If I <em>can</em> see it and nobody's using it, I don't know what you're telling me &#8212; is it an option I should be using here or not? And no, I don't trust myself to remember either: I trust my past self, but I don't trust my future self to remember the past. Two years later nobody remembers the gyrations behind the design; the only reliable record of intent is what the class does and doesn't expose.

## The Solution: Composition

Look at the three features as three <em>capabilities</em>: something that can get you message broker settings, something that can get you Cosmos DB settings, something that can get you storage account settings. Encapsulate each into its own self-contained class &#8212; MessageBrokerSettingsProvider, CosmosDbSettingsProvider, StorageAccountSettingsProvider &#8212; each fully implemented (the code literally copy-pasted out of the original provider, including its validations). Your config provider is then nothing but a <strong>mix and match</strong> of these classes.

What's genuinely common to <em>all</em> descendants &#8212; loading the JSON files and environment files, and an InitializeConfigurationSectionRetriever that yields the configuration-section retriever &#8212; lives in a ConfigProviderBase. That's the inheritance that remains: a single-level, shallow hierarchy, justified because that functionality is truly required by every descendant. Each settings-provider class takes the configuration-section retriever in its constructor and uses it to pull its own section.

Each project's config provider descends from the base and <em>composites</em> exactly the providers it needs &#8212; this one all three, that one just message broker. Internally it holds the instances it created; externally you see only its public methods. You get the reuse &#8212; not through inheritance, but through composition &#8212; and no project is handed a gram of capability it doesn't need.

## Composition vs Aggregation

For precision: <strong>composition</strong> is an ownership relationship &#8212; the compositing class creates its parts, owns their lifetime, and is responsible for disposing them (which would make it disposable itself). <strong>Aggregation</strong> uses other classes without owning their lifetime &#8212; they're injected from outside. The net functional benefit is the same, and you could say "prefer aggregation over inheritance" too. I prefer composition where I can: I don't like injecting the parts from the outside, because then the outside is aware of what the inside needs &#8212; and to me that's worse than being self-encapsulated. From outside my config provider, you can't tell it's composed of anything at all. That's the point.

## Summary

- Two kinds of inheritance: for extension and for polymorphism. Use it for polymorphism; stay away from extension.
- Methods get exactly what they need, nothing more &#8212; and so do descendants. A base class must not expose any member some descendant shouldn't use; "available but unused" destroys intent, and your future self won't remember the design either.
- Reuse restraint: copy-paste knowingly under the rule of thirds; roll up only when the scenarios are understood; a library with unneeded classes has the same more-than-you-need disease as a fat base class.
- The refactor: capabilities become self-contained classes; a shallow base keeps only what every descendant truly needs; each config provider composites its exact mix. Reuse through composition, not inheritance.
- Composition owns lifetime (self-encapsulated &#8212; preferred); aggregation is handed its parts and lets the outside know the inside's business.
