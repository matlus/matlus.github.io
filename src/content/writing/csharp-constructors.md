---
title: "So You Think You Know C#? Constructors"
description: "C# construction order determines which fields are ready. Field initializers, constructor chaining, virtual dispatch and static initialization explain what runs when."
datePublished: 2020-03-22
dateModified: 2020-03-22
tags: ["constructors", "static-initialization", "class-design", "polymorphism", "compilation", "csharp"]
hero: csharp-constructors
youtube: "https://www.youtube.com/watch?v=Hf063OqbK64"
---

When I came to C#, I had spent years working in Delphi. Delphi let me inherit constructors and override virtual constructors in descendants. That capability shaped how I designed classes. C# required me to think differently about construction, and it took some experimentation to understand exactly what happened and when.

The difference becomes important when you design a class hierarchy. Creating an object looks like one operation at the call site. Inside that operation, field initialization, ancestor constructors and descendant constructors have a particular order. Calling a virtual method during construction introduces another part of that order that is easy to overlook.

Let's work through it with a vehicle.

## Which constructor runs first?

This reduced example concentrates on construction. The fields are deliberately public so their initialization is easy to follow; they are not a recommendation for designing a public vehicle model.

```csharp
using System;

internal static class Program
{
    static void Main(string[] args)
    {
        var toyota = new VehicleToyota();
    }
}

internal abstract class VehicleBase
{
    public string Make;
    public string Model;
    public int Year;

    protected VehicleBase()
    {
        Console.WriteLine("VehicleBase.Ctor");
        PrintDetails();
    }

    private void PrintDetails()
    {
        Console.WriteLine($"Make: {Make}, Model: {Model}, Year: {Year}");
    }
}

internal sealed class VehicleToyota : VehicleBase
{
    public VehicleToyota()
    {
        Console.WriteLine("VehicleToyota.Ctor");
        Make = "Totoya";
        Model = "Land Cruiser";
        Year = 2020;
    }
}
```

We ask for a `VehicleToyota`, whose constructor assigns all three fields. But the output is:

```text
VehicleBase.Ctor
Make: , Model: , Year: 0
VehicleToyota.Ctor
```

The base constructor's body runs before the descendant constructor's body. When `PrintDetails` reads the fields, `Make` and `Model` still hold `null` and `Year` holds `0`. The string interpolation renders those null strings as empty text. Only afterwards does the body of `VehicleToyota()` assign its values.

There is one `VehicleToyota` object. Calling the ancestor constructors does not create a separate `VehicleBase` object. Each constructor initializes its part of that same object. With a deeper hierarchy, where `C` derives from `B` and `B` derives from `A`, the constructor bodies run from `A` through `B` to `C`.

## The base call is there even when you do not write it

The compiler supplies an implicit `base()` initializer when an instance constructor does not select another constructor. For our descendant, that is equivalent to writing:

```csharp
public VehicleToyota() : base()
{
    Console.WriteLine("VehicleToyota.Ctor");
    Make = "Totoya";
    Model = "Land Cruiser";
    Year = 2020;
}
```

`VehicleBase` in turn calls its own base constructor, which is `object`'s constructor here. In IL, instance constructors have the name `.ctor`; static constructors have the name `.cctor`. These are special method names that you will encounter when inspecting an assembly.

C# also supplies a parameterless instance constructor for an ordinary class that declares no instance constructors. As soon as you declare one yourself, the compiler no longer adds that constructor for you. Declaring a constructor with parameters therefore does not leave a second, implicit parameterless constructor behind.

That matters when we change the base constructor to require a make:

```csharp
protected VehicleBase(string make)
{
    Make = make;
    Console.WriteLine("VehicleBase.Ctor");
    PrintDetails();
}
```

The descendant's implicit `base()` call can no longer find a matching constructor. Select the constructor and supply its argument explicitly:

```csharp
public VehicleToyota() : base("Toyota")
{
    Console.WriteLine("VehicleToyota.Ctor");
    Model = "Land Cruiser";
    Year = 2020;
}
```

Now the base constructor assigns `Make` before printing the details. Its output contains `Toyota`, but the model remains empty and the year remains zero. Those assignments still belong to the descendant's constructor body, which has yet to run.

## Field initializers run before the base constructor call

Return to the original parameterless constructors and give the base fields initial values:

```csharp
public string Make = "Honda";
public string Model = "Acura";
public int Year = 2019;
```

The base constructor now prints:

```text
Make: Honda, Model: Acura, Year: 2019
```

Where did those assignments happen? They appear outside any method in the source, but they still have to execute somewhere.

For an instance constructor that calls `base(...)`, the compiler emits the class's instance field initializers before that base call. In the `VehicleBase` constructor's IL, the assignments to `Make`, `Model` and `Year` precede the call to `object`'s constructor. The statements we wrote inside `VehicleBase()` come after it.

That is a useful distinction: a **field initializer** and an assignment in a **constructor body** occupy different positions in construction. Moving an assignment between them can change what earlier-running code sees.

For ordinary class construction, field initializers in the inheritance chain run before its constructor bodies. Within a class, their source order matters. The [C# specification's constructor rules](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/classes#15113-instance-variable-initializers) describe the precise placement.

## Chain constructors through one initialization path

Suppose `VehicleBase` has several constructors and each independently calls its base constructor. Each of those constructors needs the field-initializer instructions. With many initializers and several overloads, the compiler repeats that code.

The answer is to chain the constructors. I consider this a design rule: when a class offers multiple construction paths, have them converge on the constructor that performs the initialization.

Here is the relevant part of `VehicleBase`, with the diagnostic printing removed so the chain is clear:

```csharp
internal abstract class VehicleBase
{
    public string Make = "Honda";
    public string Model = "Acura";
    public int Year = 2019;

    protected VehicleBase() : this(null, null, 0)
    {
    }

    protected VehicleBase(string make) : this(make, null, 0)
    {
    }

    protected VehicleBase(string make, string model, int year)
    {
        Make = make;
        Model = model;
        Year = year;
    }
}
```

`this(...)` selects another constructor on the same class. The first two constructors forward to the three-argument constructor. That final constructor runs the field initializers, calls `object`'s constructor, and then assigns the supplied arguments. Its body completes before control returns to the forwarding constructor's body.

Notice that the forwarding constructors explicitly pass null strings and zero. Those arguments overwrite the field initializers. Field initializers establish earlier values; they do not prevent later constructor assignments. In a real domain model, choose construction paths whose supplied values make sense for that model.

The constructors are `protected` because this is an abstract base class, used through descendants. Keep argument order consistent across overloads as well. If the full constructor takes make, model and year, a two-argument overload should take make and model in that order. Making callers remember different orders is an unnecessary source of mistakes.

## A virtual call can reach a descendant that is still being constructed

There is a second consequence of constructor order that affected my own designs: calling virtual methods from a constructor.

Our vehicle can have a public `Drive` method that calls two protected abstract methods:

```csharp
public void Drive()
{
    StartEngine();
    ShiftIntoGear();
}

protected abstract void StartEngine();
protected abstract void ShiftIntoGear();
```

Add those members to the original `VehicleBase` and these overrides to `VehicleToyota`:

```csharp
protected override void StartEngine()
{
    Console.WriteLine($"VehicleToyota.StartEngine: {Make}\t{Model}\t{Year}");
}

protected override void ShiftIntoGear()
{
    Console.WriteLine("VehicleToyota.ShiftIntoGear");
}
```

Calling `Drive` lets the base class define the sequence while the descendant supplies the behavior for each step. Return to fields without initializers and change the base constructor to call `Drive` after `PrintDetails`:

```csharp
protected VehicleBase()
{
    Console.WriteLine("VehicleBase.Ctor");
    PrintDetails();
    Drive();
}
```

Creating `VehicleToyota` now prints the following sequence. The tabs in `StartEngine` separate two empty string fields from the zero year:

```text
VehicleBase.Ctor
Make: , Model: , Year: 0
VehicleToyota.StartEngine: 		0
VehicleToyota.ShiftIntoGear
VehicleToyota.Ctor
```

If the base constructor calls `Drive`, it indirectly calls those overridable methods during construction. `Drive` itself does not need to be virtual for this to happen.

In C#, virtual dispatch selects the override for the actual object type. While constructing a `VehicleToyota`, the call therefore reaches `VehicleToyota.StartEngine` even though the `VehicleToyota` constructor body has not run yet. This is the dispatch behavior I expect from polymorphism, but it creates a responsibility for the implementation.

If `StartEngine` depends on a field that the descendant constructor body will assign, it is too early to use that field. The values are still those established before that body. Reading a null reference as part of an interpolated string can conceal the problem by printing empty text; calling a method on that reference can throw `NullReferenceException`.

This is why code analyzers warn about overridable calls from constructors, including indirect calls through another method. Follow the entire call chain when assessing that warning.

I still deliberately use this capability when designing a hierarchy whose initialization behavior varies by descendant. I want constructing the object to establish that behavior without asking the caller to remember a separate `Initialize` call. But I need to understand the dependencies of the override. If it requires work that a later constructor body has not done, I cannot use it that way.

When I deliberately retain such a call, I document the reason and the assumptions behind it. Suppressing the warning alone explains nothing to the next person changing the descendant. Those construction-time assumptions are part of the hierarchy's contract.

## Static constructors initialize the type

A static constructor concerns the type's initialization. It has the class's name, the `static` modifier, no parameters and no access modifier. You cannot overload it or call it directly in ordinary C# code. The runtime invokes it.

This complete example isolates static initialization from the vehicle example:

```csharp
using System;

internal static class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine(MyStatic.GetData());
        Console.WriteLine(MyStatic.GetData());
    }
}

internal static class MyStatic
{
    private static string data = "This is data";

    static MyStatic()
    {
        Console.WriteLine("MyStatic.Cctor");
    }

    public static string GetData()
    {
        return data;
    }
}
```

The output is:

```text
MyStatic.Cctor
This is data
This is data
```

The constructor's message appears once. Calling `GetData` a second time does not run the static constructor again.

The `data` field has a static field initializer. That assignment runs before the statements in the explicit static constructor body. Inspecting `.cctor` in IL reveals the assignment followed by the `Console.WriteLine` call.

Now remove the explicit `static MyStatic()` declaration and its body, leaving the field initializer and `GetData`. The method still returns `This is data`. The compiler emits a type initializer to perform the field assignment even though you did not write a static constructor body.

There is a scheduling distinction here. An explicit static constructor prevents the compiler from marking the type `beforefieldinit`. Without an explicit constructor, that flag can give the runtime more freedom about when it initializes static fields. Do not add an empty static constructor solely because the class is static, and do not assume every static class needs an emitted initializer.

That distinction can affect optimization. It is not a useful reason to obscure required initialization. Keep the work simple and understand when it must complete. Microsoft's [static constructor documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-constructors) explains the runtime guarantees and the `beforefieldinit` consequence.

## Referring to a method is different from running it

There is a subtle case with event handlers. You can subscribe a static method to an event by creating a delegate that refers to it. That subscription does not mean the method has executed.

For a class with an explicit static constructor, initialization occurs before the first invocation of its static method. If that method is an event handler, the invocation may happen only when the event is raised later. Merely seeing the method's name in the subscription code is not evidence that the constructor has already run.

This distinction matters when you are trying to explain initialization order. Identify the operation that requires the initialized type.

## A failed static constructor is not retried on the next call

An exception during static initialization has a lasting consequence. The runtime records that initialization failed. A subsequent use does not simply rerun the constructor and give it another chance. The failure is commonly reported through `TypeInitializationException`, with the original exception available as its inner exception.

In the .NET Framework application-domain model, that failed initialization remains associated with the type in that application domain. Restarting the application creates a fresh lifetime in which initialization can be attempted again. Catching the exception and repeating the same call within the failed lifetime is not a recovery strategy.

That is a much more consequential issue than a small initialization overhead. Keep static construction straightforward, and be especially deliberate about work that can fail because something outside the type is unavailable. The caller does not control a static constructor in the way it controls an ordinary operation it can choose to retry.

Construction establishes what later code can rely on. When you understand which initializers have run, which constructor body is active, and whether a call can dispatch into a descendant, the surprising outputs become explainable. Use that understanding when you design the hierarchy, and record any construction-time assumptions that its descendants must preserve.
