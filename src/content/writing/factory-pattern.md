---
title: "Factory Pattern: The Enabler of Polymorphism"
description: "A Factory selects and constructs a concrete descendant while callers program to an interface through the base class's public contract. C# thumbnailers show selection and polymorphic dispatch."
datePublished: 2019-09-10
hero: factory-pattern
dateModified: 2026-09-27
tags: ["class-design", "polymorphism", "factory-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=HQLXUyb0T2w"
---

The Factory pattern enables client code to program to an interface. Someone has to construct the concrete class, while the code using it should work through the family's shared contract. A Factory owns the construction and the choice of implementation, allowing its caller to use the result through the base type.

The Factory itself is not polymorphic. Its importance is that it enables the client to use another class family polymorphically.

This is a different pattern from [Factory Method](/writing/factory-method-pattern/). The names are close enough that people often use them interchangeably, but their structures differ.

## A family alone is not enough

Imagine a base `ThumbnailerBase` with descendants for images, audio, and video. The family gives us the *possibility* of polymorphism. The client gains its benefit when it can use a thumbnailer through `ThumbnailerBase` without choosing a descendant or knowing its name.

If the client decides whether to construct `ThumbnailerImage`, `ThumbnailerAudio`, or `ThumbnailerVideo`, that choice couples it to the family. Every new descendant gives the client another implementation to know about. The Factory takes responsibility for construction and for deciding which descendant fits the current input.

## Program to an interface

“Program to an interface, not an implementation” describes how the *call site* uses an object. Here, the interface is the public contract of `ThumbnailerBase`: the methods available to a variable typed as that base class. It does not require a C# `interface` declaration. An abstract base class can supply that contract.

The object may actually be a `ThumbnailerAudio`. The caller's variable is still declared `ThumbnailerBase`, and the caller operates purely through methods on `ThumbnailerBase`. When the object overrides an operation, runtime dispatch selects its implementation. The caller needs no knowledge of the descendant's name, additional methods, or construction details.

A hierarchy makes that use possible, but the hierarchy alone does not establish it. Code can declare a base-typed variable and still depend on every descendant if it chooses concrete constructors, checks concrete types, or casts the result back to a descendant. The Factory removes the construction decision from that call site so the rest of the operation can use the family uniformly.

## Define the contract the caller needs

I start from how I want to use a class when designing its API. For this family, the caller needs a thumbnail operation and a way to obtain the appropriate thumbnailer for its media. It does not need three different construction paths.

This runnable teaching example uses console output to show which implementation runs. It demonstrates selection and dispatch; it does not implement media decoding or image generation. The family exposes one public method and delegates its implementation to a protected abstract method:

```csharp
public enum MimeType
{
    Image,
    Audio,
    Video
}

public abstract class ThumbnailerBase
{
    public void CreateThumbnail(string mediaFile)
    {
        CreateThumbnailCore(mediaFile);
    }

    protected abstract void CreateThumbnailCore(string mediaFile);
}

public sealed class ThumbnailerImage : ThumbnailerBase
{
    protected override void CreateThumbnailCore(string mediaFile)
    {
        Console.WriteLine($"Image thumbnail for {mediaFile}");
    }
}

public sealed class ThumbnailerAudio : ThumbnailerBase
{
    protected override void CreateThumbnailCore(string mediaFile)
    {
        Console.WriteLine($"Audio thumbnail for {mediaFile}");
    }
}

public sealed class ThumbnailerVideo : ThumbnailerBase
{
    protected override void CreateThumbnailCore(string mediaFile)
    {
        Console.WriteLine($"Video thumbnail for {mediaFile}");
    }
}
```

The caller sees `CreateThumbnail`. The protected `CreateThumbnailCore` operation is the extension point for the descendants. Each supplies different behavior behind the same public contract.

## Put the decision in the Factory

The Factory constructs the descendant that fits the supplied media type and returns it as `ThumbnailerBase`:

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
                throw new ArgumentException($"Unsupported MimeType: {mimeType}", nameof(mimeType));
        }
    }
}
```

The Factory knows the descendants and returns the base type. It does not descend from `ThumbnailerBase` itself; it constructs members of that family. In this example it is stateless, so a static class is sufficient.

An unsupported identifier must fail visibly, as the `default` branch does here. Quietly choosing an image thumbnailer for an unknown media type would make a bad request look successful.

The client asks for a thumbnailer based on the media it has, then uses the returned object through the base contract:

```csharp
ThumbnailerBase thumbnailer = ThumbnailerFactory.CreateInstance(MimeType.Audio);
thumbnailer.CreateThumbnail("interview.wav");
```

The return type and variable type are deliberate: both are `ThumbnailerBase`. The Factory constructs a `ThumbnailerAudio`, but that concrete name appears only in the Factory and the family. The client calls `CreateThumbnail` on its base-typed variable. That method reaches the audio implementation through `CreateThumbnailCore` and prints `Audio thumbnail for interview.wav`.

This is programming to an interface at the call site. The Factory's return type makes the shared contract available; the caller's variable type and method calls show that it is actually using that contract.

The client still knows `MimeType.Audio`, which is an input fact. It does not name `ThumbnailerAudio`. Once it has the instance, it can call the same method regardless of which descendant the Factory selected.

The client should not have to cast that product back to `ThumbnailerAudio` or branch on its concrete type. If it does, the shared contract may be missing a needed operation, or the decision may belong elsewhere.

When another descendant can satisfy the same contract, the Factory can select it without changing this consuming code. The Factory and the new descendant need implementation changes. The caller changes only if its requirements or the shared contract change.

## Give the Factory a meaningful identifier

`MimeType` is useful because it describes the media. A Factory might instead receive a state, an order type, several arguments, or a request model. Those values should say what the caller needs in the business, rather than act as disguised class names.

Suppose a system needs the rules for a particular state. The caller should supply the state and receive the appropriate rules through a common contract. It should not have to request `RulesVirginia` by name. If the selection grows beyond one switch, the Factory can delegate parts of that decision without changing what its caller asks for.

## When it earns its place

A Factory is useful when the selection recurs during the life of the application. One request may need a V6 engine, the next a V12, and the next a V8. The Factory owns that choice while callers use the shared engine contract.

When configuration chooses one implementation at startup and it stays fixed, construction at startup may be sufficient. There is little recurring decision for a Factory to contain.

The distinction from Strategy is also about who uses the selected object. Here the Factory hands the object to its client, which uses it through the base contract. In the Strategy shape I prefer, a context uses its selected behavior internally and returns the result. Both forms can be useful; the ownership of the object differs.

I name a Factory for the family, such as `ThumbnailerFactory`, and use `CreateInstance` for its construction method. I use `Make` for the creation hook in [Factory Method](/writing/factory-method-pattern/), so the two patterns are easier to recognize in code.
