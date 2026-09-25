---
title: "Factory Method Pattern: The Most Beautiful Pattern We Lost"
description: "Factory Method lets consumer subclasses choose dependencies through an overridable creation hook. C# member managers and Windows Forms show its two class families, distinguishing it from a Factory."
datePublished: 2013-02-10
dateModified: 2026-09-25
tags: ["class-design", "composition-over-inheritance", "polymorphism", "factory-method", "factory-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=7q3T0gGISyk"
youtubeLabel: Watch the C# demonstration
additionalVideos:
  - label: Watch the later discussion
    url: "https://www.youtube.com/watch?v=8PwI3yskj0I"
    context: Cars and engines example
---

The Factory Method pattern is, in my opinion, the most beautiful and elegant pattern in the Gang of Four book. Its short definition has helped the industry confuse it with the much simpler [Factory pattern](/writing/factory-pattern/). I think we have largely lost the real pattern to that naming collision. In the C# demonstration, I build it with member managers and email services, then with Windows Forms and user controls. A later discussion uses cars and engines to unpack the definition with a little more fun.

The definition is beautifully compact once you know the pattern. When I was teaching it, I had some fun with how little help that compact wording gives someone hearing it for the first time. It can sound written to impress the people who already know the answer. I would rather stop and answer four plain questions: Which interface? Which object? Whose subclasses? An instance of what? Then the elegance becomes useful.

## What the creation method belongs to

The definition says to provide an interface for creating an object and let subclasses decide which class to instantiate. Here, *interface* describes the way a class offers that creation operation. The pattern does not require a language `interface` type.

What object is being created? A dependency of the class that defines the method. Imagine a `Car` that needs an `Engine`. The `Car` base class offers a method to make an engine. Subclasses of `Car` can override that method to choose a different engine.

I make that method protected and virtual: descendants need to override the choice, while callers have no reason to select an engine by invoking the hook themselves. A base class can supply a default engine or leave the method abstract.

Now there are two families in view:

1. The consumers: `Car` and its descendants.
2. The dependencies: `Engine` and its descendants.

The two hierarchies are the telltale sign of Factory Method. The creation hook belongs to the consumer hierarchy, where a descendant overrides it. The hook returns the dependency hierarchy's base type, even though the override may construct a particular descendant. The families do not need matching numbers of descendants. A separate Factory also returns a product through its base type, but it does not have this consumer hierarchy with an overridable creation hook.

## The member manager demonstration

The C# video starts with a `MemberManagerBase` that uses an `EmailServiceBase` during its `DoSomeWork` sequence. Initially, the manager constructs an email service directly. I extract a protected creation hook, `MakeEmailService`, whose return type is `EmailServiceBase`. The production `MemberManager` overrides that hook to create the real `EmailService`.

The inherited workflow uses the email service through its base type. The recording initializes it through a property when first needed, then reuses that instance. The timing of construction is a detail of this example; the pattern is the override that chooses which member of the email-service family the manager receives.

Then I add an `EmailServiceStub` and a test manager that overrides the same hook. The workflow still runs, but the stub reports that no emails were sent. If the test is meant to exercise behavior in `MemberManager`, the test subclass should descend from `MemberManager` and change only the creation hook. I correct that inheritance choice during the recording. The test is useful because it changes the dependency without replacing the manager behavior under test.

## The Windows Forms demonstration

The second example makes both hierarchies visible on screen. `FormBase` has a `MakeUserControl` hook that returns `UserControlBase`. The base form can supply the base control itself; `FormChildOne` and `FormChildTwo` override the hook to supply their own descendant controls. One child control displays a check box, and the other a combo box. After the overrides, each form displays the control chosen by its descendant.

The video's references to a control's Windows Forms `Parent` property concern where the control appears on screen. That parent is separate from the two class hierarchies: the forms are one family, and the user controls are the other. The base form can use the result as `UserControlBase` in every case.

## A shorter way to see the hook

The later discussion uses cars and engines to strip away the application details. This C# sketch adapts its chapter draft and makes the consumer's use of its own hook explicit. These exact lines are not claimed to appear in either recording.

```csharp
public abstract class Car
{
    public void Drive()
    {
        Engine engine = MakeEngine();
        engine.Start();
    }

    protected virtual Engine MakeEngine()
    {
        return new StandardEngine();
    }
}

public sealed class SportsCar : Car
{
    protected override Engine MakeEngine()
    {
        return new V12Engine();
    }
}
```

Both families are used through their base types. A caller can hold a `SportsCar` as a `Car` and invoke `Drive` without depending on the car's concrete class. Inside `Drive`, the variable is declared `Engine engine`, even when `MakeEngine` creates a `V12Engine`. The inherited operation calls the public `Engine` contract without knowing which engine descendant it received. The subclass knows what it constructs; the code using the returned engine does not. These are intentional uses of polymorphism, and neither requires a separate language `interface` type.

The hook can have a default implementation, as in this sketch and the Windows Forms demonstration, or be abstract when every subclass must make the choice, as in the member manager demonstration.

A car may also need tires, seats, and lights. Each dependency whose construction a subclass must control can have its own `Make` hook. The two families remain the clue: the family containing the hooks and the family whose objects those hooks create.

The word `Make` is my naming convention for this hook. I use `CreateInstance` for the separate [Factory pattern](/writing/factory-pattern/). The prefix is a small signal in code where these similar names otherwise cause confusion.

## How this differs from a Factory

A Factory is a separate construction class. It can inspect business input and return a concrete descendant through a base type. It does not have to participate in an inheritance hierarchy of consumers.

Factory Method puts the construction operation on a consumer's base class and lets that consumer's subclasses override it. The subclasses decide how to create a dependency used by the inherited behavior. A method that merely creates an object is not enough to establish this pattern; the override relationship matters.

In the discussion video, I also explain “program to an interface” as a rule about the *call site*. The variable's base type gives the caller the base class's public contract, while the actual object may be any compatible descendant. A language `interface` type is one way to express such a contract, but it is not required here.

## A later design preference

Both recordings explain and admire Factory Method. Since recording them, my design preference has moved toward protocols and composition when a dependency must vary. A class can receive a dependency or a focused factory, or a context can own the choice. I avoid inheritance for extension in new designs, so I would rarely choose Factory Method there. That preference is later material from the book-chapter draft, not a claim made in either video.

I still want the pattern understood and named correctly. The two families and the overridable creation hook explain what it does. Whether I would use inheritance for that variation in a new system is a separate decision.
