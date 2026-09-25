---
title: "Dependency Injection? No Thank You!"
description: "Dependency injection exposes private collaborators to callers when used for every internal relationship. Keep classes self-contained and let business code choose real variation."
datePublished: 2019-10-06
dateModified: 2026-09-25
tags: ["public-surface", "class-design", "design-patterns", "csharp", "dependency-injection", "strategy-pattern", "factory-pattern", "template-method"]
youtube: "https://www.youtube.com/watch?v=UfBe_At-TGE"
---

I distinguish the dependency inversion principle from the habit of injecting every internal dependency, and ask whether the caller needs to know about those internals. The examples are illustrative; the video does not walk through a code repository.

## The Principle Is Not the Disease

I am not against dependency inversion as a principle. Let me get that out of the way before somebody starts arguing with a version of me I did not send into the room. If class A depends on class B, and the right design is that both depend on an abstraction, fine. That is a real idea. It is the D in SOLID for a reason.

**My problem starts when a good principle becomes a reflex.** People learn a technique, call it architecture, and then run it through every class in every system whether the system asked for it or not. That is where I get off the train.

Dependency injection is one form of inversion of control. Constructor injection, property injection, interface injection, and the rest of the family all have mechanics. I am not impressed by mechanics. The question is not whether you *can* inject the dependency. The question is whether the caller needs to know that dependency exists.

And most of the time, no, it does not.

That is the distinction I want held tightly: I am not objecting to passing something to a constructor when that something belongs at the call site. If the caller opened a stream, selected a business policy, chose a tenant, or owns a connection boundary, pass it. Say what you mean. What I reject is taking the private internals of a class, lining them up in the constructor, and pretending the consumer has been helped by seeing them.

## Just in Case Is Not Design

The sales pitch is reuse, extensibility, modularity, testing, and whatever else happens to be useful in the meeting. I have heard all of it. I have even used it. I have been reformed.

**Building every seam for a future you imagined is not foresight, it is clutter with confidence.** We have the audacity to think we can predict every direction a business may extend in. We imagine the angle, prepare the hook, wire the abstraction, and then the real requirement arrives two inches to the left. Now the system is complicated for a future it did not get.

I am not saying extensibility is bad. I am saying maintainability trumps it. A system that cannot be maintained has no point. Extensibility, reusability, and maintainability are not automatically friends. Push hard enough on the first two and you can crush the third.

This is the same caution I raise in **Interfaces? No Thank You!**. An interface can be correct. An interface in front of every class because some day, maybe, perhaps, who knows, is not design. It is a guess dressed up as architecture.

If your design is decomposed correctly, extension later is usually not the nightmare people pretend it is. You change the code where the new requirement lives. You introduce the abstraction when the variation becomes real. You do not ask every class to pay rent for a tenant that may never move in.

## The Graphics Card Does Not Ask for Its Parts

Hardware is where I reach first, partly because the word interface came from electronics long before it came from us. A motherboard has slots: PCIe for a graphics card, others for RAM. The graphics card has thousands of little parts on it. When I plug it into the motherboard, the motherboard does not ask me to supply those parts. It offers a slot, the card meets it, and the two of them agree on an interface. That is all either side knows about the other.

**A component should stand by itself at the level where it is being consumed.** I want to new it up and use it. I do not want to know its guts. I do not want to know its dependencies.

Here is the version I do not like.

```csharp
public sealed class MovieImporter
{
    private readonly IMetadataClient metadataClient;
    private readonly IGenreParser genreParser;
    private readonly IPosterDownloader posterDownloader;
    private readonly IClock clock;

    public MovieImporter(
        IMetadataClient metadataClient,
        IGenreParser genreParser,
        IPosterDownloader posterDownloader,
        IClock clock)
    {
        this.metadataClient = metadataClient;
        this.genreParser = genreParser;
        this.posterDownloader = posterDownloader;
        this.clock = clock;
    }

    public ImportResult Import(MovieFile movieFile)
    {
        var metadata = metadataClient.GetMetadata(movieFile);
        var genre = genreParser.Parse(metadata.Genre);
        var poster = posterDownloader.Download(metadata.PosterUrl);
        return new ImportResult(metadata.Title, genre, poster, clock.UtcNow);
    }
}
```

People look at that and say, look how explicit it is. I look at it and ask: explicit to whom, and for what purpose? The consumer wanted a movie importer. Now the consumer must know about metadata clients, genre parsers, poster downloaders, and clocks. That is not need to know basis. That is a class handing its private business to whoever happens to construct it.

Here is the shape I prefer unless there is a real reason not to.

```csharp
public sealed class MovieImporter
{
    private readonly MetadataClient metadataClient = new();
    private readonly GenreParser genreParser = new();
    private readonly PosterDownloader posterDownloader = new();

    public ImportResult Import(MovieFile movieFile, DateTimeOffset importedAt)
    {
        var metadata = metadataClient.GetMetadata(movieFile);
        var genre = genreParser.Parse(metadata.Genre);
        var poster = posterDownloader.Download(metadata.PosterUrl);
        return new ImportResult(metadata.Title, genre, poster, importedAt);
    }
}
```

Notice what stayed and what went. The helpers are not the caller's business. They are part of how the importer works, and they belong behind the public surface. If I cannot simply new the thing up and have it be fully functional, it is useless to me.

That is the whole test. **They should just bloody well work.**

## The Container Should Not Make Business Decisions

Sometimes the defense is polymorphism. I need to swap behavior at runtime, they say, so I use dependency injection. My answer is: why is the container making that decision?

**Runtime variation is a business decision, and business decisions belong in business code.** If there are three strategies for calculating something, I want the class, or a factory it owns, to choose from business information. Something meaningful, drawn from the domain. Not a container configuration quietly deciding which implementation appears today.

Strategy pattern, template method, factory, these are not foreign ideas. Use them when the variation is real. But keep the decision where the knowledge lives. If the decision requires business information, pass the business information. Do not inject a ready-made answer from the outside and call the result flexible.

Imagine fifty places in the system that need different behavior. Now imagine the IoC container making fifty decisions. That is not architecture. That is a second program hiding beside your program, with its own rules, its own failure modes, and often no decent public surface for a new developer to read.

And then the team wonders why debugging is miserable.

## Consistency Is the Baseline

I have worked on production systems that used dependency injection. I have also worked on systems, in more than one company, where the teams came to the same conclusion: the same decomposition was fine, the same classes existed, but the injected version was not worth the pain.

**The problem was not that the classes were badly decomposed; the problem was that every relationship had been made public.** New people joined and struggled to understand the system. Runtime exceptions came from wiring. Debuggability got worse. Complexity bloated around the code that was supposed to make the system cleaner.

I have also had people join my team as big dependency injection fans. At first they were disappointed. By the end of the project, some of them told me they would not use dependency injection again. Seeing is believing? I think it is the other way around. Believing is seeing. If you will not allow the possibility that there is another way, you will never see it.

There is another thing I tell teams: consistency is key. If you do something wrong consistently, it is easy to find and fix later. Inconsistency is poison. A system where some objects are self-contained and others require container wiring for no clear reason becomes a guessing game. Dependency injection, in the inject-everything style, is not a sometimes thing. Either it is the architectural model or it is not. Mixing paradigms casually just makes the reader pay twice.

## What I Do

I design classes as black boxes on purpose. That does not mean the inside is a ball of mud. It means the inside is inside. The public surface says what the consumer may do and what the consumer must know. Everything else is an implementation detail.

**I expose dependencies only when the dependency is part of the caller's legitimate responsibility.** If a class needs collaborators to do its work, it composes them. If the collaboration has real runtime variation, I model that variation with polymorphism where the business rule lives, through a factory, a strategy, or a template method.

Let me be blunt about where I actually stand, because I have been circling it. In my own work I do not use dependency injection. Not sparingly, not as a last resort. There has not been a single occasion where I needed it. I have used it, years ago, and I have been reformed since.

If you are seeing genuine value from it, then use it. I am not going to pretend the choice is beyond argument. But I want the choice made on the right basis. **Anyone can list the pros of a technique, because the pros are what the advocates published. A professional understands the cons before imposing a choice on a client or an employer.** That is the harder homework, and it is the one almost nobody does before adopting a container.

Yes, my approach has cons. Every approach has cons. If somebody tells you their technique has no cons, they either have not used it enough or they are selling you something. The trade-off I accept is that when a real variation appears, I may have to change the code then. Good. At that moment I have facts. I know the direction of change. I can design for the requirement in front of me, not for the ghost of a requirement I imagined two years earlier.

One more thing, about how minds actually change on this. The saying is seeing is believing. In my experience it works the other way round: **believing is seeing.** If you are convinced that inject-everything is what good design looks like, every codebase you meet will confirm it. I have watched people arrive as committed advocates, work in a system built this way, and later say they would never go back. Nothing was proved to them. They stopped needing it to be true.

## Summary

- Dependency inversion is a sound principle when the abstraction is needed. Injecting every internal dependency exposes details the caller has no business knowing.
- Constructor parameters are appropriate when the caller owns the resource or chooses the policy. Business decisions belong in business code, not hidden in an IoC container.
- "Just in case" extensibility has a maintenance cost. I prefer self-contained classes, narrow public surfaces, and abstractions introduced when variation is real.
- I do not use dependency injection in my own work, though you may find value in it. Understand the costs as well as the benefits before making it a rule.
