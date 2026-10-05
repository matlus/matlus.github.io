---
title: "Builder Pattern and C# Expressions"
description: "Test-data builders keep each scenario's chosen values visible. C# expression trees select model properties, and stored overrides preserve explicit nulls."
datePublished: 2020-07-12
dateModified: 2020-07-12
hero: builder-pattern-csharp-expressions
tags: ["testing", "expression-trees", "immutability", "builder-pattern", "design-patterns", "csharp"]
youtube: "https://www.youtube.com/watch?v=lEqPX6_Q-qw"
repositories:
  - label: Builder Pattern and C# Expressions
    url: "https://github.com/matlus/Builder-Pattern-and-CSharp-Expressions"
    context: Test builders, configuration provider and configuration tests
draft: false
---

I have a love-hate relationship with the Builder pattern used for test data. It can make the arrangement of a test very clear. I do not recommend taking this style of builder, with its generated defaults and property-selection machinery, into production code.

The distinction matters. In production, I want the construction of an object to express the information it requires. In a test, I may need twenty arrangements of the same object, each changing one value while leaving everything else valid. Repeating the entire constructor in every test can hide the one thing that makes that test different.

This is a test-data builder. It is a different design from the Builder pattern described in the Gang of Four book. They both create objects, but the particular problem we are solving here is making test arrangements precise and easy to read.

Let's work through the design from the point of view of the person using it. Even when I think I know where a design will end up, I find value in writing the intermediate versions. Working through the choices can reveal something the mental shortcut missed.

## The test should show the scenario

Imagine a Configuration Provider that reads device-service settings. It returns a `DeviceServiceSettings` model containing a base URL, an access token, an optional HTTP proxy URL and a collection of devices. Each device has an identifier, a type and an over-the-air update key.

These are models with constructor-supplied, getter-only properties. Here are their relevant members, with display methods omitted:

```csharp
using System.Collections.Generic;

public sealed class Device
{
    public string Identifier { get; }
    public string Type { get; }
    public string OtaKey { get; }

    public Device(string identifier, string type, string otaKey)
    {
        Identifier = identifier;
        Type = type;
        OtaKey = otaKey;
    }
}

public sealed class DeviceServiceSettings
{
    public string BaseUrl { get; }
    public string AccessToken { get; }
    public string HttpProxyUrl { get; }
    public IEnumerable<Device> Devices { get; }

    public DeviceServiceSettings(string baseUrl, string accessToken,
        string httpProxyUrl, IEnumerable<Device> devices)
    {
        BaseUrl = baseUrl;
        AccessToken = accessToken;
        HttpProxyUrl = httpProxyUrl;
        Devices = devices;
    }
}
```

Every construction has to provide all four settings arguments. The constructors themselves do not validate those arguments. That lets a test deliberately supply `null` or invalid content to the Configuration Provider's input. Getter-only properties also do not make an externally supplied collection deeply immutable.

The provider has several things to check. The base URL must be usable. Required settings must be present. There must be at least one valid device. A base URL without a trailing slash is normalized to include it.

For that last scenario, I want the arrangement to say:

```csharp
var settings = new DeviceServiceSettingsBuilder()
    .Set(x => x.BaseUrl, "http://api.example.test")
    .Build();
```

Everything except the base URL should have a valid generated value. The arrangement tells us which value the test cares about. It does not bury that value among a collection of device identifiers, keys, tokens and proxy settings.

The builder must also let me deliberately supply `null`:

```csharp
var settings = new DeviceServiceSettingsBuilder()
    .Set(x => x.BaseUrl, null)
    .Build();
```

Those are two different arrangements. A third arrangement calls `Build()` without setting the base URL at all. That one should receive a generated base URL.

## There are three states to preserve

A constructor or build method with optional arguments looks like an easy solution. Give each argument a default of `null`, and generate a value when the argument is null.

But what happens when null is the very value I want to test?

The builder has to distinguish these cases:

| Arrangement | Meaning | Builder result |
|---|---|---|
| No override | This property is irrelevant to the scenario | Generate a valid value |
| Explicit non-null override | This exact value defines the scenario | Use that value |
| Explicit null override | Missing data defines the scenario | Keep null |

Looking only at the value cannot tell us whether it was supplied. We need to preserve that separate fact.

![An unspecified property uses a generated default, an explicit value uses that value, and an explicit null remains null. Dictionary key presence distinguishes the cases.](/images/diagrams/design-builder-three-states.svg)

*The builder records whether an override exists independently of the override's value.*

## First, make the simple version work

A fluent method per property is a reasonable first attempt. `BaseUrl(value)` could store a value and return the builder so calls can be chained. `Build()` then invokes the model's constructor.

It is workable, but the builder now has methods corresponding to the model's properties. As the model changes, we have another surface to keep synchronized. And the simple implementation still loses explicit null if it uses null to mean "generate a value."

What about an action that assigns properties?

```csharp
// Desired usage, but invalid for the getter-only model:
// builder.Set(x => x.BaseUrl = "http://api.example.test");
```

If `x` is a `DeviceServiceSettings`, that assignment cannot compile. The property has no setter. We should not add setters to the production model just to make a testing helper easier to write.

We could instead give the *builder* a writable `BaseUrl` property and accept an `Action<DeviceServiceSettingsBuilder>`. The action would receive the builder and set its property. A backing flag can then remember that a setter ran, even if the assigned value was null:

```csharp
private string _baseUrl;
private bool _baseUrlIsSet;

public string BaseUrl
{
    get => _baseUrl;
    set
    {
        _baseUrl = value;
        _baseUrlIsSet = true;
    }
}
```

Construction now asks `_baseUrlIsSet` rather than asking whether `_baseUrl` is null. We have all three states.

That version is useful because it exposes the real requirement: **remember the selection separately from the selected value**. Its drawback is the repeated properties, backing fields and flags. Can we preserve the same information without reproducing the model's public surface on the builder?

## Ask for the property, rather than assigning it

Look again at the usage I want:

```csharp
builder.Set(x => x.BaseUrl, "http://api.example.test");
```

The first argument identifies a property. The second supplies its value. We are not assigning the property on an existing settings object. We are describing how a future object should be constructed.

A delegate such as `Func<DeviceServiceSettings, string>` can execute code and return a string. An expression tree gives us a description of the code instead. The compiler can represent this particular lambda as a parameter followed by a member access.

The parameter is `x`, of type `DeviceServiceSettings`. The body is the access to `BaseUrl`. That body's member information includes the property's name and type. We do not need to create a settings object or call its getter to discover which property the user selected.

This ability to inspect an operation is also why LINQ providers can translate supported expression trees into another form, such as SQL. A provider examines the requested operations and builds the corresponding query. It does not have to execute a C# predicate separately against every database row inside the application.

For our much smaller problem, we only need the selected member's name:

```csharp
public DeviceServiceSettingsBuilder Set<T>(
    Expression<Func<DeviceServiceSettings, T>> propertyNameExpression,
    T value)
{
    var memberExpression = (MemberExpression)propertyNameExpression.Body;
    var propertyName = memberExpression.Member.Name;
    _propertiesToBuild[propertyName] = value;
    return this;
}
```

The generic type `T` connects the lambda's result type to the supplied value. Selecting `BaseUrl` lets the compiler infer `string`. The editor offers the real model's properties because `x` is the real model type.

The intended input is a direct property selector such as `x => x.BaseUrl`. This compact implementation does not validate arbitrary expression trees. Method calls, conversions, captured values and nested selections are outside its intended contract; some will fail the cast, and others can yield a member name that is not the property we intended. Do not mistake the short cast for a general expression parser.

## A dictionary gives us the missing state

Store the property name as a key and the chosen value as its value. Then dictionary membership answers the question that a null check could not:

```csharp
private T GetPropertyValue<T>(string propertyName, T defaultValue)
{
    return _propertiesToBuild.TryGetValue(propertyName, out var value)
        ? (T)value
        : defaultValue;
}
```

An absent key means use the default. A present key means use its value, including null. Setting the same property again replaces the earlier override.

Here is a complete small builder using that design. The default-data routines are deliberately reduced so the construction mechanism can be read in one place. They supply syntactically suitable values and one device; they do not reproduce a production device catalogue or credential service. The example uses the historical model's null-permitting signatures so negative test arrangements remain possible.

```csharp
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

internal sealed class DeviceServiceSettingsBuilder
{
    private readonly Dictionary<string, object> _propertiesToBuild =
        new Dictionary<string, object>();

    public DeviceServiceSettingsBuilder Set<T>(
        Expression<Func<DeviceServiceSettings, T>> propertyNameExpression,
        T value)
    {
        var memberExpression = (MemberExpression)propertyNameExpression.Body;
        _propertiesToBuild[memberExpression.Member.Name] = value;
        return this;
    }

    public DeviceServiceSettings Build()
    {
        return new DeviceServiceSettings(
            GetPropertyValue(nameof(DeviceServiceSettings.BaseUrl),
                $"http://api.example.test/{Guid.NewGuid():N}/"),
            GetPropertyValue(nameof(DeviceServiceSettings.AccessToken),
                Guid.NewGuid().ToString("N")),
            GetPropertyValue(nameof(DeviceServiceSettings.HttpProxyUrl),
                "http://proxy.example.test:8080"),
            GetPropertyValue<IEnumerable<Device>>(
                nameof(DeviceServiceSettings.Devices),
                new[] { new Device(Guid.NewGuid().ToString("N"),
                    "thermostat", Guid.NewGuid().ToString("N")) }));
    }

    public DeviceServiceSettings With(DeviceServiceSettings existing)
    {
        return new DeviceServiceSettings(
            GetPropertyValue(nameof(DeviceServiceSettings.BaseUrl),
                existing.BaseUrl),
            GetPropertyValue(nameof(DeviceServiceSettings.AccessToken),
                existing.AccessToken),
            GetPropertyValue(nameof(DeviceServiceSettings.HttpProxyUrl),
                existing.HttpProxyUrl),
            GetPropertyValue(nameof(DeviceServiceSettings.Devices),
                existing.Devices));
    }

    public DeviceServiceSettings BuildWithDefaults()
    {
        return new DeviceServiceSettings(
            GetPropertyValue<string>(nameof(DeviceServiceSettings.BaseUrl), null),
            GetPropertyValue<string>(nameof(DeviceServiceSettings.AccessToken), null),
            GetPropertyValue<string>(nameof(DeviceServiceSettings.HttpProxyUrl), null),
            GetPropertyValue<IEnumerable<Device>>(
                nameof(DeviceServiceSettings.Devices), null));
    }

    private T GetPropertyValue<T>(string propertyName, T defaultValue)
    {
        return _propertiesToBuild.TryGetValue(propertyName, out var value)
            ? (T)value
            : defaultValue;
    }
}
```

`nameof` connects the lookup keys to the model's declared properties. Renaming or removing a property can now be checked by the compiler. We still have to maintain the constructor call in `Build`; expression trees do not remove that responsibility. What we have removed is a separate fluent method or mutable builder property for every model property.

The default expressions are ordinary method arguments, so they are evaluated before `GetPropertyValue` runs, even when an override wins. That is acceptable for these small in-memory values. Keep this mechanism in test arrangement code and do not hide expensive operations inside those defaults.

## Build from an existing value

Sometimes the arrangement is already available. I want an expected value that looks exactly like it, except for one or two changes:

```csharp
var arranged = new DeviceServiceSettingsBuilder()
    .Set(x => x.BaseUrl, "http://api.example.test")
    .Build();

var expected = new DeviceServiceSettingsBuilder()
    .Set(x => x.BaseUrl, "http://api.example.test/")
    .Set(x => x.HttpProxyUrl, "http://proxy.example.test:8080")
    .With(arranged);
```

`With` uses the existing model's property whenever the builder has no override. The original remains unchanged. The new model shares the original devices collection unless we explicitly replace it; this is not a deep-cloning facility.

`BuildWithDefaults` has a different purpose. It uses each property's language default unless an override exists. All four properties here are reference types, so an entirely default arrangement contains nulls. That is useful for testing missing settings, but it is intentionally not valid application configuration.

The same builder design can be applied to `Device`. A device builder can control an identifier or update key for a specific scenario, while a settings builder supplies a nonempty collection of valid devices for unrelated scenarios. Each builder keeps the requirements of the model it constructs in one place.

## Feed the arrangement through the real configuration path

Building a settings model is only the arrangement. The component under test is the Configuration Provider. We still need to feed it configuration in the form it reads.

The JSON root has an `AppSettings` section and a `DeviceService` section. The provider gets the HTTP proxy from `AppSettings`, so that placement matters. Putting a proxy property only inside the device-service arrangement will not test the intended configuration source.

We can serialize the root into a memory stream and pass that stream to `ConfigurationBuilder.AddJsonStream`:

```csharp
using System.IO;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

var inputRoot = new
{
    AppSettings = new { HttpProxyUrl = "http://proxy.example.test:8080" },
    DeviceService = arranged
};

using var stream = new MemoryStream();
JsonSerializer.Serialize(stream, inputRoot);
stream.Position = 0;

using var configuration = (ConfigurationRoot)new ConfigurationBuilder()
    .AddJsonStream(stream)
    .Build();
```

This setup requires the `Microsoft.Extensions.Configuration.Json` package. Resetting the stream position makes the serialized bytes available to the configuration loader. The test passes the resulting configuration root to the provider's internal configuration-taking constructor through its test assembly access.

Now call `GetDeviceServiceSettings` and compare the actual model with the expected model, including the devices. For the missing-base-URL scenario, expect the provider's configuration exception. For the trailing-slash scenario, expect the normalized URL and preservation of the unrelated data.

No application settings file needs to be rewritten between tests. The arrangement controls the input while the provider still performs binding, validation and mapping.

## Keep the machinery behind the test

The expression tree and dictionary are implementation details of a testing helper. At the call site, the scenario should be obvious:

```csharp
new DeviceServiceSettingsBuilder()
    .Set(x => x.BaseUrl, null)
    .Build();
```

I want that clarity. I also want the ordinary production constructor to keep asking for the data its model needs. Giving each of those jobs its own place is what makes this builder useful.
