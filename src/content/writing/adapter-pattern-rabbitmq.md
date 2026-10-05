---
title: "Adapter Design Pattern: Testing Service Bus Using RabbitMQ Locally"
description: "The Adapter pattern keeps application messaging independent of broker SDKs by translating messages, callbacks and acknowledgements between RabbitMQ and Service Bus."
datePublished: 2020-06-21
dateModified: 2020-06-21
hero: adapter-pattern-rabbitmq
tags: ["library-boundaries", "polymorphism", "message-brokers", "adapter-pattern", "factory-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=xHDoQvhW9VQ"
repositories:
  - label: Message broker adapters
    url: "https://github.com/matlus/Adapter-Design-Pattern-Message-Brokers"
    context: RabbitMQ and Service Bus publisher and subscriber implementations
draft: false
---

Suppose your application publishes messages to Azure Service Bus. Several developers need to run tests, and all of them are using the same topics and subscriptions in the cloud. One person's test can consume another person's message. Running the tests requires a connection to Azure, and the shared environment becomes part of everybody's working day.

I want each developer to be able to use a local message broker. RabbitMQ can do that job. The application should still publish and receive messages in its own terms, regardless of which broker carries them.

That last requirement is where the design starts. If Service Bus types have already spread throughout the application, changing the broker means changing application code. I want the dependency contained from the beginning.

<div class="article-callout" role="note" aria-label="Note">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#note"></use></svg>
  <div class="article-callout__content">
    <p>This example comes from 2020. Microsoft now provides a <a href="https://learn.microsoft.com/en-us/azure/service-bus-messaging/overview-emulator">Service Bus emulator</a> for local development. RabbitMQ remains useful here for demonstrating a contract implemented by two different brokers. Running against one broker does not verify the other broker's delivery guarantees.</p>
  </div>
</div>

## Start with the interface the caller wants

An Adapter converts the interface of something we have into the interface its caller needs. By *interface*, I mean the public surface of a class: the methods, properties and types through which another class uses it. I do not necessarily mean a C# `interface` declaration.

Think of plugging a USB-A device into a USB-C port. The device has one connection, the caller has another, and the adapter makes the two fit. A headphone connector and an HDMI connector make the same idea familiar. There are different things on either side, with a specific conversion between them.

Software has less visible connectors. A method name, an argument type, a return value or a callback can be part of the mismatch.

The client in this example wants to publish a message. It should be able to say, in effect, "Here is my message. Publish it." It should also be able to subscribe and receive that same application-owned message type. It should not need to construct a Service Bus message or understand RabbitMQ's channel API.

I use an abstract base class to express each contract. Concrete descendants implement it and contain the SDK objects they need. The caller works through the base class.

![Client depends on Adapter, the common interface. Implementation 1 and Implementation 2 inherit that contract and each owns its corresponding Adaptee.](/images/diagrams/design-adapter-source.svg)

*The client knows the Adapter contract. Each implementation adapts and owns a different underlying object.*

You can have one implementation and still have an Adapter. Supporting two providers is useful in this example, but it is not a prerequisite for the pattern.

## Why put the adapter there?

There are two related reasons: simplify what the caller must deal with, and keep the caller independent of another library.

A charting library might offer dozens of chart types and hundreds of styling options. Your application may need a small, consistent subset. An application-facing contract can express that subset and make the decisions you do not want every developer to make independently.

The same reasoning applies to messaging. I do not want to expose every capability of either broker. I want to expose the capabilities my application needs.

Decoupling matters even when a library is pleasant to use. I treat code owned by another team, a vendor library, and relevant framework facilities as external dependencies. If their types become the language of my application, the application is tied to their decisions.

The [Configuration Provider](/writing/configuration-provider-design-pattern/) is another example of taking responsibility for the contract the application sees. Reading a setting is only part of that job. The caller should receive the application's settings in a usable form without reconstructing the configuration mechanism at every call site.

### But doesn't a Facade do something similar?

Patterns can look very similar when all you see is a box forwarding calls to another box. Their intent and context distinguish them.

An Adapter reconciles interfaces. A Facade offers an entry point to a subsystem and makes that subsystem easier to use. A Gateway represents an external service in the application's terms, including the translation of its data and failures. These designs may all contain mapping code. Mapping code by itself does not tell you which role a class plays.

Here I am adapting infrastructure libraries to a message-broker contract. Calling everything a *wrapper* hides that purpose. I want the name and public surface to tell me what responsibility the class has.

Recognizing those distinctions takes practice. Go back to the intent when two patterns seem interchangeable. A similar-looking implementation does not make their purposes identical.

## We can design the target contract ourselves

Sometimes both interfaces are fixed. An existing application expects one thing, a library supplies another, and neither can be changed. That is an obvious place for an Adapter.

It is also reasonable to define the application's contract while building the application. I do not have to wait until a dependency becomes painful before isolating it.

Consider voice-controlled lights. I want to say "turn on the video lights." The lights do not understand that sentence. The voice-control system translates the request into operations the devices understand. As the caller, I am choosing the interaction I want. The devices' control mechanisms remain behind it.

For our broker, the desired surface is similarly small: publish, subscribe, and acknowledge receipt. The hard work is deciding what each operation promises and what information crosses the boundary.

## The message belongs to the application

Start by comparing the information the application needs with the facilities the brokers provide. Both may have a message identifier and a correlation identifier. Other information may need to travel as a custom property.

Do not simply copy the first SDK's message class. That would reproduce the dependency under a new name. Work out which fields the application needs, then work out how each implementation carries them.

Here is the message shape. This excerpt keeps the full constructor and omits two convenience overloads that supply default values:

```csharp
using System;

internal sealed class Message
{
    public byte[] Body { get; }
    public string MessageId { get; }
    public string ContentType { get; }
    public string ApplicationId { get; }
    public string CorrelationId { get; }
    public DateTime CreationDateTime { get; }

    public Message(byte[] body, string messageId, string contentType,
        string applicationId, string correlationId, DateTime creationDateTime)
    {
        Body = body;
        MessageId = messageId;
        ContentType = contentType;
        ApplicationId = applicationId;
        CorrelationId = correlationId;
        CreationDateTime = creationDateTime;
    }
}
```

The body is bytes. The caller decides how to encode its content and describes that encoding with `ContentType`. The identifiers and creation time remain available independently of the body format.

The properties have getters, but the byte array is still mutable. This model expresses the sample's message shape; it does not make a deep-immutability guarantee.

Designing this small type takes thought. What happens if one provider lacks a native property? Can its custom-property mechanism carry the value? What conversion is required on receipt? Those questions are part of designing the abstraction. Be willing to throw away an early design when comparison with another provider exposes a better one.

## Publishing through the base class

The publisher contract has a public operation and a protected implementation point:

```csharp
using System;
using System.Threading.Tasks;

internal abstract class MessageBrokerPublisherBase : IDisposable
{
    public Task Publish(Message message)
    {
        return PublishCore(message);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected abstract Task PublishCore(Message message);
    protected abstract void Dispose(bool disposing);
}
```

The caller sees `Publish`. Descendants supply `PublishCore` and release the resources they own. No broker SDK type appears in this contract.

I name the descendants `MessageBrokerPublisherRabbitMq` and `MessageBrokerPublisherServiceBus`. Keeping the role at the front of the name groups the implementations together in an alphabetical listing and makes their relationship apparent.

### RabbitMQ maps properties and the body

The RabbitMQ implementation owns an `IConnection` created by `ConnectionFactory`. Its constructor receives the connection string and topic-exchange name. Publishing creates a channel, builds the broker properties, and supplies the body separately:

```csharp
protected override Task PublishCore(Message message)
{
    using (var channel = _connection.CreateModel())
    {
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.ContentType = message.ContentType;
        properties.MessageId = message.MessageId;
        properties.AppId = message.ApplicationId;
        properties.CorrelationId = message.CorrelationId;

        var propertiesDictionary = new Dictionary<string, object>();
        properties.Headers = propertiesDictionary;
        propertiesDictionary.Add("CreationDateTime",
            message.CreationDateTime.ToString("o"));

        channel.BasicPublish(_topicExchange, routingKey: string.Empty,
            properties, message.Body);
    }

    return Task.CompletedTask;
}
```

This method belongs to the RabbitMQ descendant and uses `RabbitMQ.Client` 6.1.0, `System.Collections.Generic`, and `System.Threading.Tasks`. `_connection` is its owned connection; `_topicExchange` is the configured exchange. These are historical SDK calls, so use the matching package when examining this implementation.

Notice the mapping. `ApplicationId` becomes `AppId`. Creation time becomes a custom header in round-trip date/time format. The application has no reason to know either detail.

### Service Bus constructs its own message

The Service Bus implementation owns a `TopicClient`, constructed from the connection string and topic name. It aliases `Microsoft.Azure.ServiceBus.Message` as `SbMessage` to distinguish it from our `Message`:

```csharp
protected override async Task PublishCore(Message message)
{
    var sbMessage = new SbMessage(message.Body);
    sbMessage.UserProperties.Add("ApplicationId", message.ApplicationId);
    sbMessage.CorrelationId = message.CorrelationId;
    sbMessage.ContentType = message.ContentType;
    sbMessage.MessageId = message.MessageId;
    sbMessage.UserProperties.Add("CreationDateTime",
        message.CreationDateTime.ToString("o"));

    await _topicClient.SendAsync(sbMessage);
}
```

This implementation uses `Microsoft.Azure.ServiceBus` 4.1.3. It puts the application identifier into user properties and sends the provider's message through `_topicClient`. The package and API are part of this historical example, not a recommendation to start a new application on that SDK.

The public contract returns a `Task` because the Service Bus operation is asynchronous. The RabbitMQ 6.1 implementation performs its publish call synchronously and returns `Task.CompletedTask`. The `async` modifier is an implementation detail; it is not part of the method signature that descendants must share.

A completed task here means the implementation completed its operation as written. The RabbitMQ code does not wait for publisher confirms, so it does not establish that the broker durably accepted the message. [Publisher confirms](https://www.rabbitmq.com/docs/confirms) are a separate concern that must be designed when the application needs that guarantee.

## Receiving requires translation in the other direction

The subscriber exposes three operations: subscribe, acknowledge, and dispose. Subscription accepts an `Action<MessageReceivedEventArgs>` callback. The event data is also ours:

```csharp
using System;
using System.Threading;

internal sealed class MessageReceivedEventArgs : EventArgs
{
    public Message Message { get; }
    public string AcknowledgeToken { get; }
    public CancellationToken CancellationToken { get; }

    public MessageReceivedEventArgs(Message message, string acknowledgeToken,
        CancellationToken cancellationToken)
    {
        Message = message;
        AcknowledgeToken = acknowledgeToken;
        CancellationToken = cancellationToken;
    }
}
```

The subscriber base delegates through protected methods in the same way as the publisher:

```csharp
internal abstract class MessageBrokerSubscriberBase : IDisposable
{
    public void Subscribe(Action<MessageReceivedEventArgs> receiveCallback)
    {
        SubscribeCore(receiveCallback);
    }

    public void Acknowledge(string acknowledgeToken)
    {
        AcknowledgeCore(acknowledgeToken);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected abstract void SubscribeCore(
        Action<MessageReceivedEventArgs> receiveCallback);
    protected abstract void AcknowledgeCore(string acknowledgeToken);
    protected abstract void Dispose(bool disposing);
}
```

The RabbitMQ descendant creates an `EventingBasicConsumer`, subscribes to its `Received` event, and starts consumption with `autoAck: false`. On receipt, it constructs our `Message` from the received body and basic properties. It decodes the creation-time header, turns the delivery tag into the acknowledgement token, and invokes our callback.

The Service Bus descendant registers a message handler on `SubscriptionClient` with `AutoComplete = false`. It maps `UserProperties`, the body and the native identifiers into our message. The lock token becomes our acknowledgement token, and the handler's cancellation token is carried into our event data.

| Application value | RabbitMQ representation | Service Bus representation |
|---|---|---|
| Body | Received body bytes | `Message.Body` |
| Application ID | `BasicProperties.AppId` | `UserProperties["ApplicationId"]` |
| Creation time | UTF-8 bytes in the custom header | String in `UserProperties` |
| Acknowledgement token | Delivery tag converted to a string | `SystemProperties.LockToken` |
| Acknowledge operation | `BasicAck(tag, multiple: false)` | `CompleteAsync(lockToken)` |

The token is opaque to the application. It must be returned to the subscriber that supplied it. A RabbitMQ delivery tag belongs to its receiving channel, so it is not a portable identifier that another connection can acknowledge.

The callback can now read the application's message, process it, and acknowledge through the same subscriber. It never needs to cast the event data to a broker type.

There is an important limit in the historical implementation: the public acknowledgement method returns `void`, while the Service Bus implementation starts `CompleteAsync` without awaiting its task. Returning from `Acknowledge` therefore does not establish completed settlement. The synchronous disposal surface has a similar limitation around asynchronous Service Bus cleanup. An application that needs those completion guarantees must make them observable in its contract and await them.

## Similar constructors are a design choice

Both subscriber constructors take a connection string, a topic/exchange name, and a queue/subscription name. Service Bus needs the topic and subscription together to create its subscription client. RabbitMQ consumes from a queue; its subscriber does not use the topic-exchange argument.

C# does not require sibling descendants to have the same constructor signature. I chose consistency here so creating the two implementations looks similar. That is a choice made while reconciling the providers, not a rule imposed by the base class.

The provider-specific objects are owned by their adapter. Cleanup belongs with those objects, rather than becoming another detail every caller must know.

## Keep selection in the Factory

If application code directly constructs the RabbitMQ descendant, it still knows which implementation it is using. Move that selection into a Factory. In this example, `MessageBrokerFactory.Create` accepts a `MessageBrokerType` and returns a tuple containing the publisher base and subscriber base.

For `RabbitMq`, it constructs the RabbitMQ pair. For `ServiceBus`, it constructs the Service Bus pair. An unsupported identifier raises `MessageBrokerTypeNotSupportedException`. Connection information belongs in configuration; it is not part of the application message.

This is a [Factory](/writing/factory-pattern/). A method that creates objects does not automatically make the design the [Factory Method pattern](/writing/factory-method-pattern/). The role here is to translate a requested broker choice into concrete instances while returning the common contracts.

The application-facing code can consequently have this shape:

```csharp
var (publisher, subscriber) = MessageBrokerFactory.Create(brokerType);

using (publisher)
using (subscriber)
{
    subscriber.Subscribe(args =>
    {
        args.CancellationToken.ThrowIfCancellationRequested();
        Console.WriteLine(System.Text.Encoding.UTF8.GetString(args.Message.Body));
        subscriber.Acknowledge(args.AcknowledgeToken);
    });

    await publisher.Publish(new Message(
        System.Text.Encoding.UTF8.GetBytes("A video is ready for processing"),
        messageId: "video-42", contentType: "text/plain; charset=utf-8",
        applicationId: "video-service", correlationId: "upload-42",
        creationDateTime: DateTime.UtcNow));

    Console.ReadLine();
}
```

This reduced caller subscribes before publishing and keeps the process alive to receive the message. `brokerType` is the configured choice; the Factory supplies the SDK-backed implementations described above. The input pause is only a console-demonstration lifetime, not a background-service shutdown protocol.

The broker topology must already exist. The sample uses corresponding exchange/topic and queue/subscription names on both providers. RabbitMQ also needs the binding that routes a publication with the sample's empty routing key to the intended queue.

## What the local test tells us

Changing the broker choice should leave the publishing and receiving application logic unchanged. That is the benefit the design is trying to deliver.

Local tests can exercise serialization, application processing, and the RabbitMQ adapter without competing for a shared cloud subscription. They do not prove Service Bus configuration, settlement behavior, retries, or delivery semantics. Those need checks against that provider as well.

The useful abstraction is the contract the application can rely on. It earns its place by containing the SDK types and the translation work, while leaving the application free to express what it wants to do.
