---
title: "The Configuration Provider: An Abstraction With Roles and Responsibilities"
description: "A Configuration Provider hides the source, returns typed settings, validates required values, and reports useful errors. Composed providers let each system select its settings."
datePublished: 2019-08-11
dateModified: 2026-09-25
tags: ["class-design", "error-handling", "configuration-provider", "design-patterns", "csharp", "composition-over-inheritance"]
youtube: "https://www.youtube.com/watch?v=IPS8VSrGq94"
repositories:
  - label: Configuration Provider sample
    url: "https://github.com/matlus/ConfigurationProviderNetFramework"
    context: Code from the original video
  - label: Process Manager sample
    url: "https://github.com/matlus/Process-Manager-Using-Pub-Sub"
    context: Current C# examples
---

The point throughout is the **roles and responsibilities of a configuration provider**. It owns the source, strong typing, validation, and useful failure messages. The comparison of inheritance and composition follows from those responsibilities.

The original .NET Framework implementation is shown in the video linked below. The later discussion of composition and testing reflects my current practice. The current C# examples come from `PostBindOrchestrator.Core/SettingsProviders` and `PostBindOrchestrator.DomainLayer/Managers/ConfigurationProviders` in the linked Process Manager project.

## Not a Pattern, and I Do Not Much Care

I have never seen anyone call this a pattern, and I am not going to fight about the word. What I do know is that almost every large system I have worked on reaches into its configuration system directly, from anywhere, and pays for it forever.

The fix is an abstraction over configuration access. But an abstraction with nothing behind it is just another layer, so the useful part of this chapter is not the class, it is the **roles and responsibilities** the class takes on. Those have not changed in all the years since I first built one. The implementation has changed a great deal, and I will show you both.

## The Four Responsibilities

This is the part people miss, and missing it is why the whole idea gets dismissed. A configuration provider is not a thing that goes and gets a setting. **A thing that goes and gets a setting has done about a quarter of the job.** There are four responsibilities, and all four belong to this class.

**Abstract the source.** Is the configuration coming from a config file, a JSON file, a database, a service? Nobody in your system should know. The provider is the only class that does.

**Present a strongly typed surface.** Configuration is strings, all the way down. But you know perfectly well that this setting is an `int`, that one is a `bool`, and the other is a `DateTime`. The provider is where that conversion happens, once, so that everything downstream receives the type it actually wanted, already parsed and already checked.

**Lock the back door.** I talk about locking the front door and the back door so you are safe in the house, and I go into that idea properly in Programming with Intent. The front door is the arguments arriving from your callers. **The back door is data arriving from outside: the file system, the database, a service.** Configuration comes through the back door, so the provider is the thing standing at it. Its job is to make sure that data is clean before it gets into the system, and to throw if it is not.

**Know what is required and what is optional, and say so clearly when something is wrong.** Which settings a system cannot start without is a business rule, and it belongs in exactly one place. So does the quality of the message you get when one of them is absent, which is a large enough topic that it gets its own section below.

Take any one of those away and you have a different, much weaker thing. Take away the typing and every caller parses. Take away the validation and nothing is guarding the back door. Take away the required and optional knowledge and it is scattered across the system in null checks.

## Why All This Effort For a Configuration Provider?

I get asked this, in almost exactly these words. It is just configuration. Why the ceremony? Why the exception messages, why all these tests, why this and that?

Because **every system depends on it, and it runs before anything else does.** It is the one class whose output the entire system takes on trust. Everything downstream assumes the connection string is a connection string, the timeout is a number, and the path starts where it is supposed to start.

Now consider what happens when it does not do its job. The provider does not notice that a setting is missing, and hands back a null, or an empty string, or a silently defaulted value. **The system does not stop. That is the problem.** It hums happily along, doing work, appearing entirely healthy, until at some point far away it falls over with a null reference exception six degrees of separation from where the bad data actually entered.

Now somebody is debugging that null reference. It is nowhere near a config file. Nothing in the stack trace mentions configuration. So they spend a day, or several days, working backwards until eventually somebody says: hold on, is that setting even in the file? And the answer comes back, we did not know that setting existed.

That is the failure mode this class exists to prevent, and it is the worst kind there is: **the distance between the cause and the symptom is maximised.** A missing setting is one of the cheapest problems in software to diagnose if you catch it at the boundary, and one of the most expensive if you do not.

So the effort is not ceremony. Failing loudly, at the back door, with a message that names the setting and tells you what a valid value looks like, converts a multi-day archaeology exercise into a thirty second fix. That is the return on the two days. And it is the same principle I argue in the code review chapter, fail fast and fail visibly, and fix the cause rather than the symptom, applied to the one place in the system where outside data first gets in.

## The Exception Is the Product

Since the provider throws, the exceptions it throws are a large part of what it delivers. I have rules for this, and they apply to every exception in my systems, not just this one.

An exception message must explain the problem clearly and in as much detail as possible. It must **include the offending value**, because "I did not like the value" without telling me the value is close to useless. And it must tell me how to fix it: the valid values, the expected range, the format you wanted.

Here is the reasoning, and it is not academic. **In production you usually cannot get to the machine. You get the log file.** So picture yourself reading that log, and ask what you would want to see there in order to know exactly what is wrong. You should not have to open the solution, reproduce it locally, and debug your way to an answer that the message could have given you.

Now make it worse. Another team in your organization is consuming your system as a service. Every time they see an exception whose message does not explain itself, they contact you, because the message gave them nothing to act on.

So a good one reads something like this: the `NotifyOnUpload` configuration setting value of `T` is not a valid boolean. Possible values are `true` and `false`. Somebody doing triage, even an analyst who does not know that part of the system, can repeat that message down the phone to a developer, and the developer knows exactly what the problem is instantly.

That is the standard. **If you are throwing exceptions, you cannot be mean, you cannot be cute, and you cannot be short.** Take the extra time over the wording. It goes a long way for the people who use your library, your service, or your system.

I once took a call about this while driving on vacation. Somebody asked what "missing" meant in one of these messages. It meant the key is not in the config file at all, so the fix was to go and add the setting. That conversation was short because the vocabulary had been decided in advance, and that is the entire point.

## Missing, Blank, Empty

That vocabulary has to be precise. People often wave away the differences.

A setting can be in several different states, and they are not the same problem with different spellings. The key can be absent entirely. The key can be present with an empty value. The key can be present with a value of nothing but whitespace. In the original implementation I made that explicit with a state enum, and then threw a distinct message for each case.

```csharp
internal enum ConfigurationSettingState
{
    IsPresent,
    IsMissing,
    IsEmpty,
    IsWhiteSpaces
}
```

Missing means the key is not there. Blank means the value is whitespace. Empty means the value is an empty string. Pick your words once, use the same ones in every message, and make sure the team and the tests use them too. When somebody says "the setting is blank," everyone should already know which of the three things happened.

The routine that enforces presence took the retrieval as a delegate rather than doing the retrieval itself, which kept the requirement in one place and the source specific work in another. If higher order functions are unfamiliar, my chapter on delegates and higher order functions covers the mechanics; this is a good small example of why they are worth having.

## Requirements in the Base, Extraction in the Descendant

The original design was two classes. `ConfigurationProviderBase`, abstract, and `ConfigurationProvider`, the production implementation.

A note on the naming, because it is deliberate. The varying part goes at the **tail** of the name, not the front. `ConfigurationProviderBase`, `ConfigurationProviderDatabase`, `ConfigurationProviderLocal`. That way they sort together in the solution explorer and you can see the whole family at a glance. And when there is only one production implementation, it is called `ConfigurationProvider`. Not `ProductionConfigurationProvider`. The plain name is the real one.

The split of work mattered more than the class count. **The base class baked in the requirements. The descendants only knew how to fetch a value for a key.**

So the base class is where it is written down that the email templates path is required, and that it always comes back starting with a backslash, whatever the config file happens to contain. That URLs always come back ending with a forward slash, because you are storing a base address and tacking endpoints onto it. That the fiscal year start is optional, defaults to the first of October, and has its year normalized because only the month and day matter. That `NotifyOnUpload` is optional and defaults to true.

Every one of those is a business rule. None of them has anything to do with where the data came from. So a .NET Framework descendant, a .NET Core descendant, a database backed descendant and a service backed descendant all inherit the same rules and implement one thing each: how to get a string for a key. That is real reuse, and at the time it was the right call.

## Keep the Config File Small

While we are here, some opinions about configuration files themselves, because a good provider cannot save you from a bad one.

**Only things that change from environment to environment belong in the config file.** Connection strings change as you move through environments, because environments are siloed. Service endpoint URLs change. That is what the file is for.

**I stay very far away from feature switches.** I have watched a team discover, months later, that no data had been saved in production, because a switch was set one way and nobody remembered what it meant. If you genuinely need one, then arrange the defaults so that **production does not need the setting at all.** `NotifyOnUpload` defaults to true, so the production config file does not mention it. Fewer settings, fewer things to get wrong, smaller files. That is the direction to push.

And I do not treat a config change as a small thing you can slip into production. Any change goes through the same environments and the same testing as code, because the thing you switch on in production is precisely the thing nobody tested.

## The Name Has to Survive the Whole Journey

The property is called `NotifyOnUpload`. The key in the config file is called `NotifyOnUpload`. If it were a method it would be `GetNotifyOnUpload`. The exception message says `NotifyOnUpload`.

People think this is a small thing. It is not. Somebody looking at a production config file needs to be able to map what they see to something real in the system, and if the key is called `NOU` or `notify_flag` they cannot. **Name the key so that a person who is not on your team, reading only the config file, can form a decent idea of what it does.** Descriptive, not wordy.

There is a nice corollary. If you find yourself wanting to change the name in one place, you have probably got the wrong name in the other places too. Do not shy away from renaming, especially when the new name is better. Names should flow unchanged through method names, property names, config keys, and database columns.

## Where the Hierarchy Runs Out

The design above uses inheritance, and it earned it. Descendants varied by source, which is genuine polymorphism, and the base class held rules that every source shared. I would not call it a mistake.

But it only works while the thing that varies is *where the data comes from*. That is not the variation that actually shows up in a working team.

A team does not build one system, it builds several. One system needs blob storage. Another needs blob storage and table storage. A third needs table storage and SQL Server. A fourth needs SQL Server, Cosmos DB and blob storage. The source is not what differs between them. **What differs is which settings each one has at all.**

Now look at what a hierarchy does to that. The base class has to hold the requirements for every settings area any system might want, so every system inherits knowledge of storage it does not use, validation it will never run, and required settings it must somehow opt out of. You cannot inherit a subset. Inheritance gives you all of it or none of it, and here you want a different some of it every time.

That is the whole case for composition in one sentence, and it is the same argument I make in Prefer Composition Over Inheritance, arriving from a different direction: **inheritance binds you to the whole of what you descend from, and composition lets you take the parts you need.**

## Take Only What You Need, and Get It For Free

So make each settings area a **self-contained, stateless provider**, put them in a shared library, and test them there.

Each one knows one area: how to read it, how to validate it, what is required, what is optional, and what to say when it is wrong. It knows nothing about any other area, nothing about any particular system, and it holds no state.

```csharp
public static class MessageBrokerSettingsProvider
{
    private const string messageBrokerSettingsKey = "MessageBroker";

    public static MessageBrokerSettings GetMessageBrokerSettings(IConfiguration configuration)
    {
        var messageBrokerSettingsConfig = GetMessageBrokerSettingsUnValidated(configuration);
        Validate(messageBrokerSettingsConfig);
        return messageBrokerSettingsConfig;
    }
}
```

Two details there are worth pausing on.

The first is the split between an **unvalidated config shape** and a **validated settings result**. Binding and validating are different jobs, and separating them means the validation rules are visible rather than tangled into the binding.

The second is how validation reports. Each area accumulates its problems and throws once:

```csharp
private static void Validate(MessageBrokerSettingsConfig messageBrokerSettingsConfig)
{
    var errorMessages = new StringBuilder();

    errorMessages.AppendLineIfNotNull(ValidatorString.Validate(
        $"{messageBrokerSettingsKey}.{nameof(MessageBrokerSettings.ConnectionString)}",
        messageBrokerSettingsConfig.ConnectionString));

    if (errorMessages.Length is not 0)
    {
        throw new ConfigurationSettingMissingException(errorMessages.ToString());
    }
}
```

**A misconfigured deployment should tell you everything that is wrong, not the first thing that is wrong.** Otherwise you fix one setting, redeploy, and discover the next one. In a system with a large number of settings that is a genuinely miserable loop, and it is why people start to distrust the whole configuration layer.

Now the composition itself. Each system writes one small class that pulls in the areas it needs, and nothing else:

```csharp
public sealed class ConfigurationProvider
{
    private readonly IConfiguration configuration;
    private MessageBrokerSettings? messageBrokerSettings;

    public ConfigurationProvider(IConfiguration configuration) => this.configuration = configuration;

    public MessageBrokerSettings GetMessageBrokerSettings() =>
        messageBrokerSettings ??= MessageBrokerSettingsProvider.GetMessageBrokerSettings(configuration);
}
```

A system that needs table storage and blob storage composes those two. A system that needs SQL Server, Cosmos DB and blob storage composes those three. Neither one writes any validation, and neither one writes any tests for it.

That is what I mean by getting it for free, and it is worth being literal about it. **No code to write, because the reading and validating already exist. No tests to write, because those providers were tested when they went into the library.** Adding blob storage to a system is a line in a constructor and a section in a config file. Adding it to a fifth system next month is the same line again.

Compare that to the hierarchy. There, adding an area means touching a base class that four systems already depend on, and every one of them inherits the change whether it wanted it or not.

Note the caching, and note where it lives. **The provider owns its own memoization**, so a consumer never thinks about it and never invents its own cache elsewhere. Whether to resolve everything eagerly in the constructor or lazily on first use is a genuine choice rather than a rule. Eager gives you a single loud failure at startup. Lazy avoids a constructor that throws for reasons far from the call site, which in a system with a great many settings is its own kind of confusion. Decide per system, and write down which you chose and why.

## You Do Not Need to Inherit It to Test It

Here is the part that makes the composition version pay off twice.

In the old design, testing meant deriving from the provider and overriding the fetch, because the fetch was the seam. That is why the base class was abstract and why some members were protected.

You do not need any of that now, because **.NET already gives you a substitutable configuration source.** Build one in memory and hand it to the real provider:

```csharp
private static IConfiguration InitializeInMemoryConfiguration()
{
    var inMemoryConfigurationSettings = new Dictionary<string, string?>
    {
        [$"{MessageBrokerSettingsKey}:{nameof(MessageBrokerSettings.ConnectionString)}"] = "some-connection-string",
        [$"{MessageBrokerSettingsKey}:{nameof(MessageBrokerSettings.MessageBrokerType)}"] = "ServiceBus"
    };

    return new ConfigurationBuilder()
        .AddInMemoryCollection(inMemoryConfigurationSettings)
        .Build();
}
```

`ConfigurationBuilder` produces an `IConfigurationRoot`, which is an `IConfiguration`, which is exactly what the provider's constructor takes. So the test constructs the **real** provider over configuration it completely controls, and passes it into the domain facade. You are then testing at the facade boundary, with real production code all the way down, and no inheritance anywhere.

Two things follow from that, and both are improvements.

There is no longer any reason for the provider to expose protected members or to be inheritable at all, so seal it. If you find protected members on your provider today, check whether anything actually derives from it. In the code above, nothing does; they are a leftover from the era when deriving was the only way to test.

And notice the keys are built with `nameof` rather than string literals, so the test breaks at compile time if a property is renamed. That is the naming rule from earlier, enforced by the compiler.

The wider point is one I have made elsewhere and will keep making. People skip testing a configuration provider because it touches the file system and that feels hard. It is not hard, it is just unfamiliar, and a class that stands at the back door validating everything entering your system is a strange thing to decide is not worth testing.

## Summary

- A configuration provider hides the source, gives callers strongly typed settings, validates incoming values, and knows which settings are required. Its exception messages name the setting, show the offending value, and explain what is valid.
- Missing, empty, and blank mean different things. Catch each at the boundary, and report all configuration problems together so a deployment does not fail one setting at a time.
- The original base class shared requirements while descendants fetched values from different sources. When systems differ by which settings they need, tested, self-contained providers let each system compose only those areas.
- Keep configuration files limited to values that change by environment. Use consistent names across keys, properties, methods, and messages. Test configuration changes as you would code changes.
- Test the real provider with an in-memory `IConfiguration` at the domain facade boundary. Build keys with `nameof`, let the provider own caching, and choose eager or lazy resolution deliberately. Inheritance is not required to create a test seam.
