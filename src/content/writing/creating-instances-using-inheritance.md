---
title: "Creating Instances, Using Inheritance: No Thank You!"
description: "Create instances for state or polymorphism and use inheritance for a common consumer. Static behavior and composition can keep testing from dictating every class's shape."
datePublished: 2020-12-13
dateModified: 2020-12-13
hero: creating-instances-using-inheritance
tags: ["class-design", "polymorphism", "static-classes", "composition-over-inheritance", "mocking", "csharp"]
youtube: "https://www.youtube.com/watch?v=80EYfd582PQ"
draft: false
---

Why do you create an instance of a class? And why do you make one class inherit from another?

These sound like elementary questions. Yet we often make both choices automatically. We create an interface, implement it with a class, register the class with a dependency injection container and inject an instance somewhere. We find some repeated members and move them into a base class. Before long, the system has a great many objects and inheritance relationships whose purpose is difficult to explain.

I want a reason for each of those decisions. For the designs I am discussing here, the reasons come down to state and polymorphism. Once you separate those concerns, a surprising amount of the machinery becomes unnecessary.

## An instance can hold somebody's state

A customer has a name and an address. An order has its own line items. If I have three customers, I need three sets of customer information. Creating instances for that purpose makes perfect sense.

These are state-only objects. They carry information from one part of the application to another. I keep their behavior elsewhere, as discussed in [Separate State from Behavior](/writing/separate-state-from-behavior/).

Consider this small illustrative model:

```csharp
public sealed class Movie
{
    public string Title { get; }
    public int Year { get; }

    public Movie(string title, int year)
    {
        Title = title;
        Year = year;
    }
}
```

Two `Movie` instances can hold different titles and years. That explains why the instances exist. It tells us nothing about needing a base class.

Suppose another model also contains `Title` and `Year`. Is that sufficient reason for both models to inherit from `MovieStateBase`? In my view, no. Saving a few property declarations is a poor reason to establish that relationship. The two models may serve different consumers and may change for different reasons. Similar declarations do not make them interchangeable.

## Two very different uses of inheritance

I bought the Gang of Four design-patterns book in 1996 and have read it many times. Two of its central ideas deserve more attention than they often receive: program to an interface, and favor object composition over class inheritance.

Here, *interface* means the public surface through which a caller uses an object. It need not be a C# `interface` declaration. An abstract base class can provide that surface too.

When people talk about inheritance, they commonly mean one of two things. They want a descendant to reuse or extend its ancestor's implementation, or they want a caller to treat different implementations uniformly through a common contract. Those purposes lead to very different designs.

I do not use inheritance as a code-reuse mechanism. I use it for polymorphism.

With polymorphism, the caller works with the base type. It asks for an operation without selecting the implementation itself. Each descendant provides the required behavior. The uniformity from the caller's point of view is the reason for the relationship.

That is a much stronger explanation than “these classes had several methods in common.” Repeated code may indicate a useful collaborator. It does not automatically indicate an ancestor.

## Can state-only objects inherit?

This is a useful challenge to the rule. I generally do not have DTOs inherit from one another, but a developer working with me once brought a case that justified it.

The application had a consumer that needed to process several kinds of data uniformly. Those objects supplied common information through a base type. Their other properties served other consumers. The reason for inheritance was the common consumer's use of polymorphism.

That is the question to ask: **who needs to treat these objects uniformly, and through which members?**

If you cannot identify that consumer, “they both have an ID” is not enough. If you can identify it and explain what it does with the common contract, you have a design reason to consider the relationship. The exception follows the same principle; it does not turn inheritance into a convenient place to collect repeated declarations.

## What state does this behavior class need?

Now consider a class whose job is to perform a calculation, validate supplied data or convert one representation to another. All the information for the operation arrives in its arguments. It holds no state between calls. There is one implementation, and callers have no need to select among alternatives.

Why does that class need an instance?

Here is an illustrative validator for the two-property model above:

```csharp
public static class MovieValidator
{
    public static void EnsureValid(Movie movie)
    {
        if (movie == null)
            throw new ArgumentNullException(nameof(movie));

        if (string.IsNullOrWhiteSpace(movie.Title))
            throw new ArgumentException("A title is required.", nameof(movie));

        if (movie.Year < 1900)
            throw new ArgumentException("The year must be at least 1900.", nameof(movie));
    }
}
```

The validation rules here are deliberately small. The point is the class's relationship to its input. `EnsureValid` receives a movie, checks it and returns or throws. It retains nothing for the next call. An instance would add no meaning to this design.

I use static classes for this kind of behavior, including important application behavior. A class with one, two or three focused methods can be exactly the right class. It does not need to grow into a large “utilities” collection to justify its existence.

The supplementary [MovieService sample](https://github.com/matlus/MovieServiceYouTube) has a fuller example in `ValidatorMovie`: a static validator checks a domain model, while `MovieManager.CreateMovie` coordinates validation and persistence. That manager is an instance class with collaborators and lifecycle responsibilities. Different responsibilities justify different choices.

## Static does not mean shared mutable state

You need to understand static classes before using them. A static field shared by many calls is a very different proposition from a static method working entirely with its arguments and local variables.

C# permits mutable static fields. Declaring a class `static` does not make it stateless, thread-safe or pure. Those are properties of its implementation. If you put per-request information into shared fields, you have introduced a shared-state problem, and it may be difficult to diagnose.

The behavior I am advocating does not accumulate that state. Its inputs are explicit. Its temporary work belongs to the invocation. That is the context in which my recommendation about statics applies.

In systems I have designed, more than half the classes have sometimes been static. That is an observation about those designs, not a target percentage for another application. Start with the responsibilities and the reasons for instances. Let the proportion follow.

## Polymorphism supplies another reason for an instance

Suppose the application really does need alternative implementations. A caller may publish through RabbitMQ in one environment and Service Bus in another. A common publisher contract allows that caller to operate without knowing which implementation it received.

Now an instance has a purpose. It represents the selected implementation, and calls through the base contract dispatch to that implementation. The [Adapter example](/writing/adapter-pattern-rabbitmq/) develops that case in detail.

Delegates and higher-order functions can also vary behavior. I tend to prefer polymorphism when the design needs a named contract and a family of implementations. I have called delegates “poor man's polymorphism” because they can supply behavior with less class machinery. The phrase is about the mechanism and ceremony; delegates still provide a useful way to pass different behavior.

Choose the mechanism for the actual variation. A possible future variation, imagined while writing the first implementation, is weak justification for a hierarchy today.

## Reuse through composition

How do we reuse behavior without inheriting it?

A class can use another class through its public surface. A coordinator can call a validator, a parser and a persistence component. Each collaborator remains responsible for its own work. The coordinator does not need access to their internal implementation.

That is the important distinction behind favoring composition. Inheritance for reuse can make a descendant depend on protected members, ancestor initialization and the sequence in which overridden methods run. Understanding the descendant then requires understanding the ancestor's internals. The relationship spreads knowledge of implementation.

With composition, the collaborator can remain a black box. Its public contract tells the caller how to use it.

Composition and aggregation have different ownership and lifetime meanings. For this discussion, I am concerned with the broader choice to combine collaborators instead of building an inheritance chain. A call to a static validator is another way to reuse behavior through a public surface; it does not imply ownership of a validator instance.

## Do tests require all those objects?

The objection usually arrives here: “But I need an interface so I can inject a mock.”

Why do you need to mock that particular collaborator? What behavior are you trying to test?

If class A performs useful work by calling B and C, I often want a test of A's resulting behavior with the real B and C involved. Replacing both with mocks can leave me testing a set of programmed responses and call expectations while avoiding the functionality I care about.

This does not mean every test must exercise an entire deployed system. Choose an appropriate composite to test. A critical or complex component may deserve tests of its own. External services require deliberate treatment. The choice follows the behavior and the risk, rather than a rule that every class must be tested alone.

My concern is designing the application around the mechanics of a mocking framework: an interface for every class, an instance for every behavior and constructor parameters exposing every internal collaborator. That can force the caller to understand the construction details of what should be a useful black box.

I have achieved very high coverage while testing composed behavior. Coverage alone does not establish that a test is useful, of course. The important result is that the tests exercise the application's behavior without requiring every small implementation detail to become a replaceable public dependency.

## Make the intended use visible

A `sealed` class tells the reader that descendants are not part of the design. A `static` class says instances are not part of the design. Use these declarations deliberately. They communicate constraints and let the compiler enforce them.

Avoiding an unnecessary instance also avoids that instance's allocation. There can be performance consequences, but this is primarily a design argument. It is not a claim that replacing any instance method with a static method guarantees a faster application. The runtime, the work performed and the way the method is called all matter.

Where inheritance is justified, I prefer a broad, shallow hierarchy: a common base and the implementations that fulfill it. Long chains make it harder to understand where behavior comes from and which assumptions a change will disturb.

The next time you write `new`, ask what the object represents. The next time you add a base class, identify the caller that needs its common contract. If the only explanation is “that is how we always write classes,” keep thinking. The language offers these mechanisms; the design still needs to justify using them.
