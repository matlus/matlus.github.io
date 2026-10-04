---
title: "So You Think You Know C#? Static Classes"
description: "Choose static classes when instances serve no purpose. Shared type state, autonomous methods and immutable inputs explain the discipline that makes them useful."
datePublished: 2020-03-02
dateModified: 2026-10-03
tags: ["class-design", "csharp"]
hero: csharp-static-classes
youtube: "https://www.youtube.com/watch?v=IPGizw3YdMg"
draft: true
---

We use static methods all the time. `Convert` provides familiar examples, and `string` has static methods alongside the operations we call on string instances. Calling a static method does not require an instance of the declaring class.

That tells us how to call it. How do we decide that a class of our own should be static?

I start by wanting to make everything static. That may sound strange in an object-oriented language, but it is a position I have arrived at over years of designing systems. Then I look for the reason an instance is needed. Where that reason exists, I use an instance.

The decision comes from the responsibilities of the class. My reason for choosing a static class is not a performance saving. If I don't need an instance, why the heck am I creating one?

## Find the need for an instance

There are some immediate constraints. A static class cannot be instantiated, so you cannot pass an instance of it as a method argument or return one from a method. If that is what your design requires, the class cannot be static.

A static class also cannot participate in an instance inheritance hierarchy. If callers need to work through a base type while different descendants supply behavior, you need instance types. A static class cannot implement an interface either. These are language constraints, described in the [static classes guidance](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members).

These constraints quickly eliminate many candidates. They leave a useful question for the others: what is this instance going to represent?

If there is one instance for the whole application, it has no changing state, and nobody needs to pass it around or use it polymorphically, the reason for having an instance may have disappeared. That is where I consider making the class static.

The absence of an inheritance requirement is only the beginning of the design decision. The way the class handles state is what makes that decision workable.

## Two families of classes

At a high level, I separate the classes in my systems into two families: classes that hold state, and classes that provide behavior.

A customer DTO holds the values for one customer. If we are working with a thousand customers, we need a thousand sets of values. Instances serve a clear purpose here: each one carries different data.

I make these data objects immutable. Their values are supplied during construction and remain fixed afterward. They have state and no business behavior. Calling one a value object in this design does not imply that it must be a C# value type; an immutable class can serve this purpose.

Behavior classes contain the methods that operate on that data. I design their methods to be autonomous and/or pure, terms we will examine shortly. The class does not accumulate changing state as requests pass through it.

Some behavior classes need polymorphism. They remain instance types because callers need the abstraction and its alternative implementations. Others have behavior, no changing state, and no polymorphic use. Those are the classes I make static.

I would estimate that at least half the classes in my systems are static. I have not counted them, and there are also stateless classes I have left as instance types. The point is that static classes are a regular part of this design, supported by a deliberate separation of state and behavior.

## What is shared, and what belongs to an object?

Before looking at the design rules, it helps to understand the runtime picture. Consider an `Info` object with an integer `Id`, a double `Value`, a `DateTime` called `Date`, and a string `Name` containing `Hello`.

The following figure is a conceptual CLR memory model. It separates the object's field storage, the runtime information describing its type, and the separate string object. The boxes describe relationships; their sizes and positions are not a memory measurement.

![Conceptual Info object layout: Id, Value and Date occupy inline storage; Name points to Hello; the method table leads to shared type information and base methods.](/images/diagrams/csharp-static-type-layout.svg)

*The `info` reference leads to the object below its header. Its method table pointer leads to the `Info Method Table`, which connects to type information and inherited methods. The `Name` field independently refers to the `Hello` string. Constructor entries are shown separately from the object's data.*

The three value-type fields occupy storage within the object. The `Name` field contains a reference to a string elsewhere. A value-type field therefore need not be stored on a stack: here its storage is part of a reference-type object.

The object also has runtime overhead. In the CLR model, an object header carries synchronization and related information, and the object carries a method table pointer. The figure labels the header `Sync Block Index` to keep the explanation focused; that label should not be read as saying that every object has a separately allocated synchronization block.

On familiar CoreCLR configurations, a minimum object allocation is three pointer-sized words: 12 bytes on a 32-bit target and 24 on a 64-bit target. That explains why even a class with no fields has allocation overhead. Those are runtime and architecture details, not sizes promised by the C# language. The [CoreCLR GC interface](https://github.com/dotnet/runtime/blob/main/src/coreclr/gc/gcinterface.h) defines this minimum.

Remember the reason for choosing a static class. Understanding allocation gives us a useful picture of the machine, but my design decision still starts with whether the program needs an instance.

## The object does not contain a copy of every method

C# compilation commonly produces IL. In a JIT-based execution path, the runtime compiles a method into native instructions when needed and maintains the information required to reach that code.

The method table in our model helps explain how an object is associated with the methods of its type. The base-method connection leads to inherited operations such as `Object.Equals`, `Object.GetHashCode` and `Object.ToString`. The constructor entries distinguish instance construction, `Info.ctor`, from type initialization, `Info.cctor`.

Creating another `Info` object gives us another set of instance fields. It does not mean copying every method body into the new object. Objects of the same runtime type share the relevant type information and method machinery.

This model deliberately leaves out details of dispatch and compilation. A direct or inlined call need not follow every drawn step, and ahead-of-time compilation need not wait for a first call to produce native code. The relationship we need here is that instance data and executable code have different ownership and lifetimes. The runtime's [type-system documentation](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/type-system.md) describes the implementation in more detail.

## The type has a runtime representation too

We write a class definition, but the runtime needs its own representation of that type: what fields it has, how instances are laid out, and how its methods can be called. Reflection exposes information about a type through `System.Type` objects.

The figure calls the shared side `Type Instance`. This is a useful way to distinguish an object representing type information from an `Info` object representing one set of application data. Every new `Info` object belongs to the same runtime type; we do not define a new type each time we create an instance.

Keep that picture conceptual. `MethodTable`, the reflection type object and storage for static fields are distinct runtime structures. The `Static Members` box associates those members with the type; it does not claim that their values are ordinary instance fields inside a `System.Type` object. The [CoreCLR type-loader description](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/type-loader.md) explains these separate structures.

Visual Basic calls static members `Shared`. I am not suggesting C# should rename them, but that word makes the relationship easier to remember. Static state is associated with the type and shared by its callers. It does not belong to a separate application object for each request.

Historically, .NET Framework described this sharing within an application domain. Each application domain had its own static data for a type. An application domain is a runtime isolation boundary; it is not simply another name for an operating-system process. A process could host more than one domain. See the [application domains documentation](https://learn.microsoft.com/en-us/dotnet/framework/app-domains/application-domains).

Modern .NET supports a single default application domain and uses `AssemblyLoadContext` for assembly loading and unloading. So do not carry “one per AppDomain” into a claim that every type name has one process-global set of state across all loading contexts. Microsoft's [assembly unloadability guidance](https://learn.microsoft.com/en-us/dotnet/standard/assembly/unloadability) explains that change.

For the ordinary static class we are designing here, the practical point is straightforward: callers share the class's static state. That shared state is why a careless implementation can produce bugs far from the code that introduced them.

## Autonomous methods and pure methods

*Autonomous method* is my term for a method that operates on the information supplied through its signature, without depending on changing state accumulated by the class.

It may use fixed information, such as a constant string or immutable configuration. What matters is that the class does not carry values from one operation into the next and quietly use them as additional inputs. “Unchanging” here describes the data; it does not mean every such value must be expressible using the C# `const` keyword.

An autonomous method can perform an operation that changes the outside world. It might update a database, send an email or write a file. Those operations are side effects, even if all the information needed to perform them arrived as method arguments.

A pure function has the stronger requirement that it produces its result from its inputs without side effects. The same inputs produce the same result. Updating a database or sending an email therefore makes a method impure, although it can still be autonomous in the sense I use here.

That is why I say autonomous **and/or** pure. I am not requiring every static method to be a calculation with no external effects. I am requiring a disciplined relationship between its arguments, its work and the state held by its class.

When you design a static behavior class, make its methods autonomous and/or pure. Give the class no changing operational state. Those two rules are fundamental to using this design safely.

## Immutable inputs matter too

Removing mutable fields from the static class does not prevent a caller from handing it a mutable object.

Suppose two threads pass the same DTO instance to methods that modify it. Neither method needs to store that DTO in a static field for the threads to interfere with each other. They already share the object supplied as an argument.

This is another reason my DTOs are immutable. A method can inspect a customer's values without another operation changing those values halfway through its work. When the state must change, the design must represent that change explicitly instead of mutating a shared input behind another caller's back.

Immutability removes that shared-object mutation problem. It does not make concurrent database writes, file operations or other external side effects automatically safe. Those operations still have their own coordination rules. The distinction between autonomous and pure methods helps us keep those responsibilities visible.

## Give the class a specific job

There is another failure mode that has little to do with memory layout: the static class becomes a dumping ground.

Someone names it `Utility` or `Helper`, and unrelated methods accumulate there. Eventually the name tells us nothing about what belongs in the class. If I see one of those names, it is a sign that we have not thought hard enough about the responsibility.

Give the class a specific name for the work it does. Its methods should form a cohesive group that carries out that work. This applies to instance classes too, but static classes make it particularly easy to add one more convenient method without asking whether it belongs.

I also make these classes `internal` by default. They usually perform specialized work inside the system, so another assembly has no reason to know about them. A top-level class cannot be private; a nested class can, but that is a different placement decision.

Sometimes I make a static class public because it provides a specific, sufficiently complex capability that another assembly should reuse. That is a deliberate boundary decision. Public visibility should follow a reason to share the functionality.

Shared type state also plays a part in singleton implementations, but choosing a static behavior class does not require turning this into a singleton design. First settle the question in front of you: whether an instance has a purpose, what state is shared, and whether the methods obey the discipline that makes that sharing manageable.
