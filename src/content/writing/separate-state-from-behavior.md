---
title: "Separate State from Behavior? Yes Please!"
description: "Separating state from behavior simplifies object-oriented systems: immutable DTOs carry data, while managers compose collaborators and make operations explicit at call sites."
datePublished: 2020-12-05
dateModified: 2026-09-23
tags: ["class-design", "public-surface", "service-locator", "configuration-provider", "gateway-pattern", "data-manager", "design-patterns", "csharp", "data-transfer-objects"]
youtube: "https://www.youtube.com/watch?v=srCLY1n0HQI"
---

This chapter grows out of [my video on separating state from behavior](https://www.youtube.com/watch?v=srCLY1n0HQI). The video uses general examples; the code excerpts here come from [MovieServiceYouTube](https://github.com/matlus/MovieServiceYouTube) to illustrate the same argument. I want data to carry state without mutable behavior and behavior classes to operate on that data.

## The Real World Object Story Is the Trap

Sometimes I catch myself wondering why people do not separate state from behavior in their classes. Then I remember the story we were all sold: **objects are supposed to model real things.** A vehicle has make, model, wheels and cylinders, so naturally it also starts, accelerates, brakes and turns. Put the nouns and the verbs together and you have object oriented design. What could be more natural?

I bought into that, and I want to be clear that I am not criticizing from the outside. **When I argue against something, it is almost always because I have been there myself.** I did not read a blog post and get clever for ten minutes. I built those systems. Three or four years into my career, once I felt I understood object oriented programming, I designed what I thought were pure object oriented systems. Beautiful classes. Proper names. State and behavior sitting together. An object programmer could look at the chunks and not find fault.

And then the code grew. A team had to live in it. People complained, sometimes silently and sometimes out loud, about the clutter of classes and about how hard it was to understand who was doing what. I resisted it, because I had designed the thing. It made sense to me. *That is not the same as making sense to the team.*

There is a broader version of this that I recognized from my previous life in electronics. What you are taught in school and what the real world turns out to be are two different planets. Software has the same gap. A model that is elegant on a whiteboard, or in a book chapter about modeling, does not automatically survive contact with a growing system and a team of people who did not design it.

Our job is to simplify, not to complify. That sounds cute, but it is serious. Taking a simple problem and wrapping it in a beautiful object model is still making it complex.

## Information Is Not Knowledge

The part that made this hard for me was not lack of information. Information is cheap. You can get it from a book, from a video, from Google, from me. **Information only becomes knowledge when you do something with it.** Then knowledge exercised over time becomes experience. Do that long enough and it becomes skill.

That matters because skill lies to you. Ask an Olympic skater how hard it is to glide, twist, land, and keep moving. At that level, it feels easy. That does not mean it is simple. It means the complexity has become automatic for that person.

I have seen the same thing in machining. A guy who had been doing it for decades could shave off a thousandth of an inch by feel. I did not believe it. I measured it. He was right. Was the operation simple? No. It had become easy for him.

That is exactly what happens when you design a system for yourself. The complexity feels easy because you know every turn. You named the classes, you chose the methods, you know the call chain. Now put a new person on the team and ask them to debug it. If they cannot tell what is going on without living in your head, the system is not simple. It is only familiar to you.

## Smart Objects Make Dumb Call Sites

Here is the version I do not want:

```csharp
public sealed class Order
{
    public string Number { get; set; }
    public Customer Customer { get; set; }

    public void Save()
    {
        // write itself to storage
    }

    public void CreateInvoice()
    {
        // reach into Customer and coordinate more work
    }
}
```

It looks like good object oriented programming if you have bought the real world object story. The order knows how to save itself. The customer knows how to do customer things. The order calls the customer, the customer calls something else, and everyone applauds the model.

But what does the call site know? Almost nothing. You pass the order somewhere and now you have to wonder who is calling what on it. You give a customer to an order, or an order to a customer, and they coax data out of each other.

**When state and behavior travel together, the public surface becomes a set of possible surprises.** The object is no longer a piece of information. It is something that might act, and every method that receives it might make it act.

## State Should Be Harmless

When I say state, I mean information an instance carries around: properties, fields, values that remain with that instance until it disappears. When I say behavior, I mean methods that do things. My position is plain: **the things you pass around your system should be harmless.**

That is why I like DTOs that only carry state. Get only properties, values set through the constructor, and nothing else. Such an object cannot save itself, delete itself, copy itself into the database, call out to a service, or surprise you from a call site several frames away. It carries information and that is all it does.

There is a corollary that matters just as much and gets missed. **Behavior classes are not the things you pass around.** DTOs travel through the system; behavior classes are used from inside the class that needs them. If you find yourself threading a behavior class through three layers as an argument, ask what it is doing there.

The correction is not to remove behavior from the system. That would be silly. The correction is to put behavior in the classes whose job is behavior, and to keep those classes from carrying mutable business state around. In the MovieService code, `MovieManager` is the behavior class. It receives a `Movie`, validates it, and coordinates the work.

```csharp
public sealed record Movie(string Title, string ImageUrl, Genre Genre, int Year);

internal sealed class MovieManager : IDisposable
{
    private readonly ServiceLocatorBase _serviceLocator;

    private ConfigurationProviderBase ConfigurationProvider { get; }

    private ImdbServiceGateway? _imdbServiceGateway;

    private ImdbServiceGateway ImdbServiceGateway =>
        _imdbServiceGateway ??= _serviceLocator.CreateImdbServiceGateway();

    private DataFacade DataFacade { get; }

    public MovieManager(ServiceLocatorBase serviceLocator)
    {
        _serviceLocator = serviceLocator;
        ConfigurationProvider = serviceLocator.CreateConfigurationProvider();
        DataFacade = new DataFacade(ConfigurationProvider.GetDbConnectionString());
    }

    public Task<int> CreateMovie(Movie movie)
    {
        ValidatorMovie.EnsureMovieIsValid(movie);
        return DataFacade.CreateMovie(movie);
    }
}
```

Notice what this says at the call site. A movie is data. The manager creates a movie. `DataFacade` and `MovieDataManager` continue the same shape: methods receive `Movie`, `Genre`, or identifiers, and return DTOs or collections. The behavior is visible in the method you called, not hidden in the object you happened to hand over.

That is the key to the wall analogy. I can hand you a key, but if the key is a blanket, it is not going to open anything. You still have the information, but it cannot do damage. An immutable DTO moving through the system is available on a need to know basis. It carries data. It does not carry behavior.

## Behavior Belongs in Behavior Classes

There is a small but important qualification here. `MovieManager` has fields. It has references to collaborators, some lazy creation, and disposable infrastructure. So I am not playing word games and pretending there are no properties anywhere. The important point is narrower and more useful: **a behavior class should not carry mutable business state as an object identity that roams through the system.**

Private references to other stateless behavior classes are not the same as a customer or order object that can mutate itself while moving from method to method. Those collaborators are implementation details. They are used internally by the manager to perform behavior. They are not passed around as the business facts of the system.

This is also where composition matters. `MovieManager` composes `DataFacade`, the service gateway and configuration provider. It does not inherit from them to become some grand business creature. It uses what it needs, on a need to know basis, and exposes methods that say what the operation is. That is programming with intent at the class boundary.

## The Team Lead Does Not Ask You to Become Each Other

The best analogy from the transcript is the team. In a sprint, each person has work to do. The team lead or scrum master coordinates. You do your part, I do my part, someone else does their part, and the work comes back together.

Now imagine I do your part, you do somebody else's part, somebody else does mine, and each of us is doing ten other people's parts as well. Who is doing what? The team lead cannot know. That is chaos, and it is exactly what smart objects create in code.

A department works with customers and orders. It does not tell the customer to become an order processor. It gets information from the customer, creates or processes an order, and coordinates across multiple entities. The department is the behavior. The customer and order are information.

**Managers should orchestrate across DTOs the way a team lead orchestrates across people.** A call chain where A calls B, B calls C, and C calls D is not automatically clever. Sometimes A should coordinate B, C and D because A is the one with the business operation in view.

## Simple Is Not Easy

Once I started separating state from behavior, it took time to tune. But the result was immediate enough that people who had worked with me before noticed it. The systems had fewer classes. More importantly, they became easier to reason about. You could look at a DTO and know it was data. You could look at a manager and know it did behavior.

At this point, people reach for single responsibility and SOLID as if those words answer the question. They do not, and I want to be fair to the principle rather than dismissive of it. Single responsibility is a real thing, and Uncle Bob was not wrong to name it. **It becomes useful when you have a problem, which is usually at refactoring time**, not something you apply from the get go to a requirement you have barely understood. Do not begin by exploding a simple business requirement into a ceremony of tiny real world actors because you think the principle demands it.

I am not modeling the real world. I am modeling the business requirement. An order is a piece of paper with information on it. In software, that is a DTO. If something needs to process it, create another thing whose job is processing. Do not make the paper smart.

And I would genuinely like somebody to test this properly. Get in touch, pick a small system, and let us build it twice: you build it the pure object oriented way, I build it the separated way. Put both on GitHub and let people read them side by side and judge which is easier to understand, easier to debug, and easier to work in. I am not asking anyone to believe me because I said it.

## Summary

- Separating state from behavior can simplify an object-oriented system. A familiar model may feel easy to its author while remaining complex for everyone else.
- Immutable DTOs carry information without mutable business behavior. Behavior classes operate on them, and managers orchestrate work across boundaries.
- Single responsibility has value when an actual problem calls for refactoring. It is not a reason to turn a simple requirement into a cluttered object model at the outset.
- Simple is not easy. If you want to compare approaches, build the same small system both ways and see which is easier to understand, debug, and change. Simplicate, don't Complify.
