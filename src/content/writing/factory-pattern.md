---
title: "Factory Pattern: The Enabler of Polymorphism"
description: "A Factory selects and constructs a member of a class family from meaningful input, letting clients use the shared contract while the Factory owns recurring implementation choices."
datePublished: 2019-09-10
hero: factory-pattern
dateModified: 2026-09-25
tags: ["class-design", "polymorphism", "factory-pattern", "strategy-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=HQLXUyb0T2w"
---

The Factory pattern solves a small but consequential problem: someone has to construct the concrete class, while the code using it should work through the family's shared contract. This chapter uses a thumbnailer example to explain that choice.

The Factory itself is not polymorphic. Its importance is that it enables the client to use another class family polymorphically.

This is a different pattern from [Factory Method](/writing/factory-method-pattern/). The names are close enough that people often use them interchangeably, but their structures differ.

## A family alone is not enough

Imagine a base `ThumbnailerBase` with descendants for images, audio, and video. The family gives us the *possibility* of polymorphism. The client gains its benefit when it can use a thumbnailer through `ThumbnailerBase` without choosing a descendant or knowing its name.

If the client decides whether to construct `ThumbnailerImage`, `ThumbnailerAudio`, or `ThumbnailerVideo`, that choice couples it to the family. Every new descendant gives the client another implementation to know about. The Factory takes responsibility for construction and for deciding which descendant fits the current input.

## Put the decision in the Factory

The video builds a thumbnailer family, then moves the selection into a separate Factory. The following C# excerpt illustrates that relationship. It is adapted from the existing chapter draft.

```csharp
public static class ThumbnailerFactory
{
    public static ThumbnailerBase CreateInstance(MimeType mimeType)
    {
        switch (mimeType)
        {
            case MimeType.Image:
                return new ThumbnailerImage();
            case MimeType.Audio:
                return new ThumbnailerAudio();
            case MimeType.Video:
                return new ThumbnailerVideo();
            default:
                throw new ArgumentException($"Unsupported MimeType: {mimeType}");
        }
    }
}
```

The Factory knows the descendants and returns the base type. It does not descend from `ThumbnailerBase` itself; it constructs members of that family. In this example it is stateless, so a static class is sufficient.

An unsupported identifier must fail visibly, as the `default` branch does here. Quietly choosing an image thumbnailer for an unknown media type would make a bad request look successful.

The client asks for a thumbnailer based on the media it has, then uses the returned object through the base contract:

```csharp
ThumbnailerBase thumbnailer = ThumbnailerFactory.CreateInstance(MimeType.Audio);
Image thumbnail = thumbnailer.CreateThumbnail(mediaFile);
```

The return type and variable type are deliberate: both are `ThumbnailerBase` because the client intends to use the selected thumbnailer polymorphically. The Factory chooses the concrete class; the client works through the operations common to the family.

In the video, the sample thumbnailers print to the console rather than return finished images. The `Image` return here shows how a client could use the contract in an application.

The client still knows `MimeType.Audio`, which is an input fact. It does not name `ThumbnailerAudio`. Once it has the instance, it can call the same method regardless of which descendant the Factory selected.

The client should not have to cast that product back to `ThumbnailerAudio` or branch on its concrete type. If it does, the shared contract may be missing a needed operation, or the decision may belong elsewhere.

## Give the Factory a meaningful identifier

`MimeType` is useful because it describes the media. A Factory might instead receive a state, an order type, several arguments, or a request model. Those values should say what the caller needs in the business, rather than act as disguised class names.

Suppose a system needs the rules for a particular state. The caller should supply the state and receive the appropriate rules through a common contract. It should not have to request `RulesVirginia` by name. If the selection grows beyond one switch, the Factory can delegate parts of that decision without changing what its caller asks for.

## When it earns its place

A Factory is useful when the selection recurs during the life of the application. One request may need a V6 engine, the next a V12, and the next a V8. The Factory owns that choice while callers use the shared engine contract.

When configuration chooses one implementation at startup and it stays fixed, construction at startup may be sufficient. There is little recurring decision for a Factory to contain.

The distinction from Strategy is also about who uses the selected object. Here the Factory hands the object to its client, which uses it through the base contract. In the Strategy shape I prefer, a context uses its selected behavior internally and returns the result. Both forms can be useful; the ownership of the object differs.

I name a Factory for the family, such as `ThumbnailerFactory`, and use `CreateInstance` for its construction method. I use `Make` for the creation hook in [Factory Method](/writing/factory-method-pattern/), so the two patterns are easier to recognize in code.
