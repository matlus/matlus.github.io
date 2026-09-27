---
title: "The Configuration Provider: Roles and Responsibilities"
description: "A Configuration Provider hides the source and returns validated, typed settings. Useful exceptions and composed settings providers keep configuration rules in one place."
datePublished: 2019-08-11
dateModified: 2026-09-27
hero: configuration-provider-design-pattern-v2
tags: ["error-handling", "boundary-validation", "composition-over-inheritance", "testing", "configuration-provider", "template-method", "architectural-patterns", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=IPS8VSrGq94"
repositories:
  - label: Configuration Provider sample
    url: "https://github.com/matlus/ConfigurationProviderNetFramework"
    context: Original .NET Framework implementation
  - label: Process Manager sample
    url: "https://github.com/matlus/Process-Manager-Using-Pub-Sub"
    context: Composed settings providers in C#
---

A Configuration Provider turns configuration from an external source into values the application can trust. It knows where those values come from, their types, which are required, and what makes them valid. The rest of the application receives those answers through a small, explicit API.

I have used this abstraction for years. Its implementation has changed, but its responsibilities have remained consistent. Reading a setting is only the beginning of the job.

## Four responsibilities

**Hide the source.** Configuration might come from an XML or JSON file, environment variables, a database, or another service. The provider owns that knowledge. A caller asking for the payment service address should not have to know which file or section contains it.

**Return strongly typed values.** A setting stored as a string may represent a Boolean, a date, an integer, or an enum. The provider converts it once. Callers receive the type they need, with no repeated parsing or interpretation.

**Validate incoming data.** Configuration is another way for outside data to enter the application. I call this locking the back door: validate the value before other classes use it. A value that parses successfully may still violate a requirement, such as a timeout outside the permitted range.

**Apply requirements and report failures clearly.** The provider knows which settings must exist and which have defaults. When a value is unusable, it throws an exception that identifies the setting, explains the problem, and tells the person reading the log how to fix it.

These responsibilities belong together. If callers read raw strings and decide for themselves whether to parse, default, or reject them, configuration rules spread through the system.

<!-- diagram:start configuration-provider-settings-flow -->
<figure class="article-diagram article-diagram--raster">
  <img src="/images/diagrams/configuration-provider-settings-flow.webp" alt="Raw configuration values flow through the Configuration Provider, which reads, converts, validates and applies requirements. The Manager receives typed settings and gives downstream classes only their needed values." width="2009" height="783" loading="lazy" />
  <figcaption>These arrows show data flow. The Configuration Provider supplies validated settings to the Manager. The Manager passes the needed values downstream; the provider itself stays with the Manager.</figcaption>
</figure>
<!-- diagram:end configuration-provider-settings-flow -->

In the architecture I use, the Manager is the class that talks to the Configuration Provider. A Gateway receives its service address and other settings from the Manager. A Processor receives the settings it needs for its work. Neither receives the Configuration Provider or the Service Locator.

## Catch the cause where it enters

A missing setting is easy to diagnose when the provider catches it. It becomes harder when a null or an empty string travels through several classes before something fails.

The resulting exception may refer to an operation far removed from configuration. The person investigating has to work backward from that symptom to the setting that caused it. Validation at the provider makes the cause visible at the point where the value enters the application.

That is why I put effort into this class and its exceptions. In production, the log may be the only information available to the person doing triage. A message should give them enough information to act without opening the solution and reproducing the problem in a debugger.

For example:

```text
The NotifyOnUpload configuration setting value of 'T' is not a valid Boolean.
Possible values are 'true' and 'false'.
```

The message names the setting, shows the invalid value, and supplies the valid choices. For settings containing credentials, identify the setting and the defect without copying the secret into the log.

## Missing, empty and blank are different

A required string setting can fail in several ways:

| State | What happened | What needs correcting |
|---|---|---|
| Missing | No value was found for the key. | Add the required setting to the source the application reads. |
| Empty | The value is an empty string. | Supply a value. |
| Blank | The value contains only whitespace. | Supply a meaningful value. |
| Invalid | A value exists but violates its type or requirements. | Correct it to the stated format or permitted value. |

Decide what those words mean and use them consistently in exceptions and tests. The distinction helps someone reading a log locate the problem quickly.

For optional settings, absence has a defined meaning. In my original example, `NotifyOnUpload` defaults to `true` when its value is missing, empty, or blank. A supplied value such as `T` is still an error. Optional does not mean that any value is acceptable.

## Share requirements while varying the source

The original .NET Framework implementation has an abstract `ConfigurationProviderBase` and a sealed descendant named `ConfigurationProvider`. The base holds the requirements; the descendant knows how to retrieve values from the framework's configuration system.

Here are the requirements from that example:

| Setting | Requirement |
|---|---|
| `EmailTemplatesPath` | Required. Return the configured path fragment with a leading backslash. |
| `PaymentGatewayServiceUrl` | Required. Return the base address with a trailing forward slash. |
| `FiscalYearStart` | Optional. Default to October 1. Preserve the month and day, with the year normalized to 1. |
| `NotifyOnUpload` | Optional. Default to `true`; reject a supplied value that cannot be parsed as a Boolean. |

The path and address conventions let callers combine those values with the application's root path or a service endpoint consistently. These are requirements of that example, so another application must choose conventions appropriate to its own paths and addresses.

The source-specific retrieval method is small. This excerpt comes from the original repository:

```csharp
protected override string GetConfigurationSettingValue(
    string configurationSettingKey)
{
    return ConfigurationManager.AppSettings[configurationSettingKey];
}
```

The base can call that method while remaining independent of `ConfigurationManager`. A descendant reading from a database would implement retrieval differently and inherit the same setting rules.

This reduced example shows the Boolean requirement and its complete implementation. It adapts the original code to nullable annotations and keeps the retrieval method abstract:

```csharp
using System;

internal abstract class ConfigurationProviderBase
{
    public bool NotifyOnUpload => GetNotifyOnUpload();

    protected abstract string? GetConfigurationSettingValue(string key);

    private bool GetNotifyOnUpload()
    {
        string? value = GetConfigurationSettingValue(nameof(NotifyOnUpload));

        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        if (bool.TryParse(value, out bool notifyOnUpload))
        {
            return notifyOnUpload;
        }

        throw new ConfigurationSettingInvalidException(
            $"The {nameof(NotifyOnUpload)} configuration setting value " +
            $"of '{value}' is not a valid Boolean. " +
            "Possible values are 'true' and 'false'.");
    }
}

public sealed class ConfigurationSettingInvalidException : Exception
{
    public ConfigurationSettingInvalidException(string message) : base(message) { }
}
```

The public property states what the caller needs. The private method performs the parsing and applies the default. A different source can supply the raw value without reimplementing either rule.

I put the varying part at the end of a class name: `ConfigurationProviderBase`, `ConfigurationProviderDatabase`, `ConfigurationProviderLocal`. The family then sorts together in the solution explorer. When there is one production implementation, its name is simply `ConfigurationProvider`.

## Compose the settings areas each system needs

Source variation is one reason to use inheritance. A different problem arises when applications need different combinations of settings.

One application may need blob storage and SQL Server. Another may need a message broker and an identity service. A base class containing every setting area gives each application requirements and dependencies it does not use. Inheritance cannot select an arbitrary subset of its base.

My later approach uses composition. Each settings area has a stateless provider that reads and validates that area. A small application-specific Configuration Provider selects the areas the application needs.

The Process Manager sample uses this arrangement for message broker, identity, telemetry, and key vault settings. Its providers read configuration into an unvalidated shape, validate that shape, and return typed settings. The following self-contained teaching version keeps that sequence while making the validation and conversion explicit. It uses `Microsoft.Extensions.Configuration`, selects the sample's two active broker choices, and retains its `ServiceBus` default. The sample's additional `None` enum member is omitted here.

```csharp
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

public enum MessageBrokerType { ServiceBus, RabbitMq }

public sealed record MessageBrokerSettings(
    string ConnectionString,
    MessageBrokerType MessageBrokerType);

public static class MessageBrokerSettingsProvider
{
    public const string SettingsKey = "MessageBroker";

    public static MessageBrokerSettings GetMessageBrokerSettings(
        IConfiguration configuration)
    {
        string connectionKey = $"{SettingsKey}:{nameof(MessageBrokerSettings.ConnectionString)}";
        string typeKey = $"{SettingsKey}:{nameof(MessageBrokerSettings.MessageBrokerType)}";
        string? connectionString = configuration[connectionKey];
        string? typeValue = configuration[typeKey];

        List<string> errors = new();
        ValidateConnectionString(connectionKey, connectionString, errors);
        MessageBrokerType brokerType = GetMessageBrokerType(typeKey, typeValue, errors);

        if (errors.Count > 0)
        {
            throw new ConfigurationSettingInvalidException(
                string.Join(Environment.NewLine, errors));
        }

        return new MessageBrokerSettings(connectionString!, brokerType);
    }

    private static void ValidateConnectionString(
        string key, string? value, List<string> errors)
    {
        string? problem = value switch
        {
            null => "missing",
            "" => "empty",
            _ when string.IsNullOrWhiteSpace(value) => "blank (only whitespace)",
            _ => null
        };

        if (problem is not null)
        {
            errors.Add($"The {key} setting is {problem}. Supply the required connection string.");
        }
    }

    private static MessageBrokerType GetMessageBrokerType(
        string key, string? value, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return MessageBrokerType.ServiceBus;
        }

        foreach (string name in Enum.GetNames<MessageBrokerType>())
        {
            if (string.Equals(value, name, StringComparison.OrdinalIgnoreCase))
            {
                return Enum.Parse<MessageBrokerType>(name);
            }
        }

        errors.Add($"The {key} value '{value}' is invalid. Valid values are ServiceBus and RabbitMq.");
        return MessageBrokerType.ServiceBus;
    }
}
```

`connectionString!` is justified only after validation has proved that the required string is present. The returned record is the typed result. No partially validated result is returned when the error list contains a problem.

The enum check deliberately accepts names rather than numeric strings. A successful `Enum.TryParse` alone would not establish that a supplied number is a supported broker type.

This version collects presence and broker-type problems before throwing. The repository's implementation collects its string-validation errors, but parses the enum separately and may throw earlier. The teaching example extends aggregation to both checks so their relationship is visible.

The composed application provider delegates to that settings provider:

```csharp
using Microsoft.Extensions.Configuration;

internal sealed class ConfigurationProvider
{
    private readonly IConfiguration configuration;
    private MessageBrokerSettings? messageBrokerSettings;

    public ConfigurationProvider(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public MessageBrokerSettings GetMessageBrokerSettings() =>
        messageBrokerSettings ??=
            MessageBrokerSettingsProvider.GetMessageBrokerSettings(configuration);
}
```

The application chooses the settings areas. The area providers own reading, validation, defaults, and messages. Other applications can reuse those providers and their library tests. Each application still needs to verify that its chosen settings reach the right collaborators.

The instance above memoizes the successful result on first use. It is a settings snapshot; it does not implement live configuration reload or synchronized initialization across concurrent callers. For a shared provider, establish its settings before concurrent work starts or choose an initialization strategy suitable for that lifetime.

Eager resolution exposes required configuration problems during construction or startup. Lazy resolution validates a settings area when it is first requested. Choose deliberately for the system, keeping invalid values from reaching consumers in either case.

## Test with a real configuration source

Modern .NET supplies an in-memory configuration source. That lets you exercise the real provider with controlled input without deriving from it or replacing its behavior.

This complete usage example runs with the teaching types above and the `Microsoft.Extensions.Configuration` package:

```csharp
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

internal static class ConfigurationExample
{
    public static MessageBrokerSettings ReadSettings()
    {
        Dictionary<string, string?> values = new()
        {
            ["MessageBroker:ConnectionString"] = "example-connection-string",
            ["MessageBroker:MessageBrokerType"] = "RabbitMq"
        };

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();

        ConfigurationProvider provider = new(configuration);
        return provider.GetMessageBrokerSettings();
    }
}
```

Use scenarios that distinguish missing, empty, blank, valid, defaulted, and invalid values. In particular, verify that an absent broker type selects `ServiceBus`, while a supplied unsupported type produces a useful failure.

The literal keys in the example also verify the external spelling of the configuration contract. `nameof` is useful when referring to a model member in code: a reference to a removed member becomes a compile error. A coordinated rename of that member and all its `nameof` expressions can still compile while leaving a deployed configuration file unchanged. Test the names the external source actually supplies.

At the application level, run functional acceptance tests through the Domain Facade. The test setup supplies controlled configuration through the Manager's construction seam while retaining the real Configuration Provider. Reusing area-provider tests does not replace that system-level verification.

## Keep the file and its names understandable

I keep configuration focused on values that change between environments, such as a service address or database connection string. Each additional switch is another deployment choice someone has to understand and verify.

Where a setting has a production default, make that default explicit in the provider. `NotifyOnUpload` can default to `true`, allowing the production configuration to omit the setting. A configured override still needs testing.

Configuration changes go through the same environments and verification as code changes. A switch can change application behavior as substantially as a method change.

Names should survive the journey. `NotifyOnUpload` is the configuration key, the provider property, and the name in its exception message. Someone looking only at the file should have a reasonable idea of what the setting controls. Avoid abbreviations that require private knowledge of the application.

The practical result is a provider whose callers can trust its answers. It owns the uncertainty at the source and gives the rest of the application a small set of named, validated values.

## Further reading

- [Programming With Intent](/pwi/) collects the architecture and implementation guidance.
- [Functional acceptance testing](/acceptance-testing/) explains verification through the application's public boundary.
