---
title: "Abstraction in Software Design"
description: "Useful abstractions express the caller's needs precisely. Broker, database and charting examples show where SDK types, storage details and excess generality get in the way."
datePublished: 2021-02-13
dateModified: 2021-02-13
hero: abstraction-in-software-design
tags: ["library-boundaries", "public-surface", "method-design", "data-access", "interface-segregation", "adapter-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=hOrpppzEX14"
repositories:
  - label: Adapter Design Pattern and Message Brokers
    url: "https://github.com/matlus/Adapter-Design-Pattern-Message-Brokers"
    context: Publisher and subscriber abstractions with two broker implementations
draft: false
---

Abstraction is one of the most important ideas in software design. Yet ask someone what makes an abstraction good, and the answer often becomes vague very quickly.

“Hide the implementation details.” Fine. Which details? What should remain visible? How do you recognize that you have hidden too much, or too little?

These questions matter because a bad abstraction is worse than having no abstraction. A team can spend a great deal of time working around an interface that seemed clever when it was introduced. If you do not yet understand what that interface needs to express, wait. More experience with the problem may give you a much better design.

## Precision at the right level

Dijkstra described abstraction as creating a semantic level at which we can be precise. That is a useful starting point: abstraction should help us express an intention clearly. Generality by itself is no achievement. [The Humble Programmer](https://www.cs.utexas.edu/~EWD/transcriptions/EWD03xx/EWD340.html)

Suppose you need to retrieve a customer's orders. A method that accepts a customer identifier and returns orders can express that intention precisely. The caller need not know how the data is stored, which query runs or how the returned rows become order objects.

Now imagine replacing that operation with `Execute`, taking a collection of arbitrary names, values and switches. Have we improved the abstraction? We may have made it capable of more things, but we have also made it harder to understand the particular thing the application needs.

There is a spectrum. With too little abstraction, the caller still deals with the machinery we intended to hide. With too much, the vocabulary becomes so general that the caller struggles to express an ordinary requirement.

The right place is not automatically the middle. It depends on this application's need.

Consider the names `Database`, `DataStore` and `Storage`. Each can suggest a wider range of implementations. If your application actually uses a database, an in-memory cache and blob storage through one contract, that broader term may be useful. If you chose it because you imagined every storage mechanism the application might someday use, you may be paying for generality you do not need.

Libraries serve many callers and can reasonably offer a broad set of options. An application-level abstraction has a more specific job. Design it for that application.

## The first abstraction is often a method

A method gives the caller a name, arguments and a result while hiding the work needed to produce that result. Class design builds on the same idea.

This is why I pay so much attention to method design. If your method signatures express the right operations at the right level, you have already done much of the difficult work of designing useful classes.

The temptation is to generalize too early. You implement one operation, imagine three possible variations and add parameters for them. A boolean selects one path; another boolean modifies that path; eventually the supposedly general method contains a collection of conditional implementations.

I do not permit boolean mode arguments in my designs. Here I mean flags that tell a method which behavior to perform, not a boolean value that is itself meaningful business data. Those mode flags are a warning that the method is collecting different jobs under one name.

I am comfortable allowing some duplication while I learn what actually varies. My rule of thirds is a point at which to stop and reconsider: after using similar code three times, look at the commonality and the differences. Sometimes three examples are still insufficient. The fourth may teach you something important.

Remember the duplication and revisit it. Leaving it visible temporarily is a deliberate design step. Forgetting it is something else.

Once you understand the variations, you have several choices. A focused method may suffice. Polymorphism can retain one signature while descendants supply different implementations. A delegate may represent a varying operation. You can make that decision much more confidently after seeing the actual requirements than while inventing possibilities in the first implementation.

## Who is this interface for?

Let's take a concrete case: an application uses a message broker. Some applications publish messages. Others subscribe. Some do both.

Why should a publishing-only application have to understand subscription machinery? The public surface it uses should describe publishing. A subscriber needs a different set of operations.

The following is the public shape of the publisher contract in the [Adapter example](/writing/adapter-pattern-rabbitmq/), with the disposal members omitted here:

```csharp
internal abstract class MessageBrokerPublisherBase
{
    public Task Publish(Message message)
    {
        return PublishCore(message);
    }

    protected abstract Task PublishCore(Message message);
}
```

`Message` is the application's model. It contains the body and the metadata the application needs, including its message identifier, content type and correlation identifier. It is not a Service Bus SDK message or a RabbitMQ property collection.

That ownership is fundamental. The publisher works for the application. Its arguments speak the application's language.

The implementations translate that model. The Service Bus publisher creates the SDK's message type and assigns its properties before sending it through a topic client. The RabbitMQ publisher creates basic properties, populates headers where needed and publishes the body through a channel. The two implementations perform different work behind the same public method.

![Application-owned message passes through one publishing contract to either broker adapter; each adapter maps it to its own SDK representation.](/images/diagrams/design-abstraction-boundary.svg)

*New explanatory diagram of the verified publisher design. The common contract owns the application vocabulary; provider-specific types remain inside the implementations.*

Now consider a deceptively similar signature:

```csharp
// A deliberately leaky application-facing contract.
Task Publish(Microsoft.Azure.ServiceBus.Message message);
```

The caller must learn and reference Service Bus to construct the argument. Even if the class implementing this method hides its topic client, the SDK has already crossed the boundary. A RabbitMQ implementation would receive a Service Bus model because the contract says it must.

Extracting that signature into an interface would preserve the leak. The interface declaration would not repair the abstraction.

## Receiving needs translation too

Publishing makes the mapping easy to see. Subscribing asks more of the design.

One broker may use events; another may register an asynchronous handler. They expose different message objects and different ways to acknowledge delivery. The application's subscription contract still needs to express what its caller does: register a callback, receive application data and acknowledge the delivery when appropriate.

The relevant public signatures are:

```csharp
public void Subscribe(Action<MessageReceivedEventArgs> receivedCallback);
public void Acknowledge(string token);
```

These are signatures from a class, not a complete class declaration. `MessageReceivedEventArgs` belongs to the application and carries its message, an acknowledgement token and a cancellation token. The subscriber implementation translates the broker's received data into those arguments before invoking the callback. Acknowledgement translates the application's token back into the form required by that broker.

Notice how much work can be hidden behind a small public surface. “Forward the call” can involve subscribing to an event, mapping properties and adapting a callback. A small interface does not imply a trivial implementation.

I arrived at this design after using both brokers across multiple projects. I understood their commonality and their differences. You cannot expect to invent a good common abstraction after glancing at two SDKs for the first time.

The contract also has limits. The historical implementation uses a synchronous acknowledgement method even though Service Bus completes a message asynchronously. That mismatch matters when deciding whether acknowledgement has finished. The full Adapter article explains the sample's settlement and delivery limitations. An abstraction deserves scrutiny of its behavior as well as its names and types.

## You can abstract without a base class

What if the application only ever uses Service Bus?

I would still keep the broker SDK behind a class whose public methods serve the application. Its caller still benefits from a small, useful surface and application-owned types.

I would not automatically add an abstract base class and one descendant. That extra relationship serves polymorphism. If there is no need to select among implementations, the concrete class can provide the abstraction itself.

This distinction is easy to miss. The abstraction is the useful view offered to the caller. An abstract class is one language mechanism for expressing a shared contract. They are not interchangeable concepts.

## The database example should look ordinary

The same reasoning applies to data access. Imagine an application that stores videos and associates them with tags. Its caller wants to save a video or retrieve videos matching a tag. A reduced illustrative contract could look like this:

```csharp
public sealed record Video(string Id, string Title);

public interface IVideoStore
{
    Task SaveVideo(Video video);
    Task<IReadOnlyList<Video>> GetVideosForTag(string tag);
}
```

I have kept this teaching contract small and used a record to make its data shape visible. There is no storage implementation in this listing. The important point is what the signatures require the caller to know.

Could this be implemented with Cosmos DB? Yes. With SQL Server, an in-memory store or files? Potentially, provided the implementation can fulfill the required behavior. Nothing in these signatures makes a Cosmos container or SQL connection part of the caller's vocabulary.

Inside a Cosmos DB implementation, someone must understand clients, containers, query iterators and all the details needed to perform the operation. That is the implementer's job. The entire application should not have to learn them just to retrieve videos.

The domain model also belongs to the application. Storing a video across several tables does not require the caller to start passing several table-shaped objects. A different storage layout should be handled inside the data boundary while the business requirement remains the same.

Contrast that with a method accepting a SQL string. The caller must now know SQL and enough of the schema to write the query. Two kinds of knowledge have escaped: the database language and the data model. Calling the receiving class a repository or a gateway does not hide either one.

## A charting library illustrates another benefit

I have used charting libraries with an impressive range of capabilities: different chart types, shading, three-dimensional effects and many options. Most applications need only a small subset of that capability.

An application may need a particular bar chart, pie chart and line chart, all using the same theme. Its abstraction can express those requirements directly. The implementation chooses the library objects and applies the agreed presentation rules.

This makes the library easier to use correctly. Each caller does not have to rediscover the configuration or remember the theme. If a different library later supplies the same required charts, the implementation can change while the application-facing contract remains useful.

That possibility is a benefit, but the abstraction already earns its place by simplifying today's calls. It need not be justified by a speculative migration.

## An API needs business operations

An abstraction can leak even when it crosses a network. Suppose completing one business operation requires updates to three tables. Exposing three table-level CRUD endpoints makes the caller responsible for coordinating those updates and knowing why they belong together.

Give the caller an operation that expresses the business intention and asks for the information only that caller can supply. The service should own the work needed to fulfill it, including the required updates and their consistency rules.

This is the same method-design question at a different scale. What does the caller want done? What information does it have? What result does it need? The service's storage arrangement should not dictate those answers.

## Similar shapes, different intentions

A Facade, a Gateway and an Adapter can all present a useful surface while hiding complicated work. Looking only at a small diagram of boxes and methods can make them appear interchangeable.

Consider their intent and location. A Facade is the front of a subsystem. A Gateway serves the application when it reaches out to another service. An Adapter translates an existing interface into the interface its client needs. Their implementation guidelines differ because those responsibilities differ.

All of them still owe the caller a clean abstraction. Naming a class after a pattern does not establish that it provides one.

If an abstraction is making the system harder to understand, do not assume that adding another parameter will rescue it. Sometimes the useful move is to undo the abstraction, return to the concrete cases and reconsider what they actually share. I would rather remove the cause of the problem than keep solving problems created by the wrong design.

Start with the caller's need. Keep its vocabulary precise. Let the implementation carry the knowledge that belongs inside it. Those choices give an abstraction its value.
