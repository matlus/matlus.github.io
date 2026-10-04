---
title: ".NET Memory Allocations and Performance"
description: ".NET allocation costs follow what gets stored and copied. Structs, classes, arrays and strings explain object layout, references and garbage collection."
datePublished: 2017-10-15
dateModified: 2026-10-04
tags: ["csharp"]
hero: dotnet-memory-allocations
youtube: "https://www.youtube.com/watch?v=aylUPfOVM90"
draft: true
---

You can write a good program without knowing what every allocation looks like. But when you need to understand why one design creates more work than another, it helps to be able to picture the values, references and objects involved.

That is the purpose of this memory model. We will follow a small `Info` type through local variables, structs, classes and arrays, then look at the machinery surrounding an object and the effect of string immutability. The question throughout is simple: what storage does this operation require, and what does copying it actually copy?

You have probably heard that value types live on the stack and reference types live on the heap. That statement breaks down as soon as we put an integer in an array or a field in a class. Start with what a variable contains. Then ask where that particular storage belongs.

The drawings use a conceptual 32-bit model, illustrative addresses and simplified cells. They explain ownership and references. They are not memory dumps, promises about field offsets, or a claim that the JIT must give every local a stack slot. Registers, captured locals and compiler-generated state machines can change the physical storage while preserving the program's behavior.

## A local value and a reference

Here is our starting point:

```csharp
static void Main(string[] args)
{
    int i = 20;
    string s = "Hello World";
    Info info = new Info();
}

internal struct Info
{
    public int Id;
    public double Value;
    public DateTime Date;
}
```

Picture an active call to `Main` with its own stack frame. A thread has a call stack, and a nested call can add another frame. In this drawing of the program, the local `i` has storage containing the integer `20`.

The local `s` contains a reference. Following that reference leads to the string object containing `Hello World`. Copying `s` would copy that reference; it would not create a second copy of the characters. The literal may already be present through string interning, so executing its assignment does not imply a fresh string allocation each time.

`Info` is a struct. Its value contains its fields together: an `int`, a `double`, and a `DateTime`. With this declaration, `new Info()` produces their defaults. `Id` is zero, `Value` is zero, and `Date` is the default `DateTime` value.

An `int` occupies four bytes and a `double` eight. A `DateTime` value also has an eight-byte representation in .NET. Adding those sizes gives the field payload, but it does not establish the struct's complete physical size. Alignment and padding can add space. Nor should the arrangement in a teaching drawing be treated as a field-offset contract.

The important feature is inline storage. An ordinary unboxed `Info` value carries its fields as part of that value. It does not need a separately referenced object for each integer or date.

When an interop contract requires a particular field arrangement, `StructLayout` can give us control over that layout. Ordinary managed code should not depend on the apparent offsets in this drawing. An explicit layout is a separate contract that needs to be verified against the system consuming it.

## Add a reference field to the struct

Now add `Name`:

```csharp
internal struct Info
{
    public int Id;
    public double Value;
    public DateTime Date;
    public string Name;
}
```

Use the value like this:

```csharp
Info info = new Info();
info.Name = "Hello";
```

`Name` adds a reference slot inside the struct. Initially that slot is `null`. Assigning `Hello` makes it refer to a string object. The characters do not become inline fields of `Info` just because the containing type is a struct.

![The Info struct is inside Main's stack frame. Its Name reference points to a separate Hello string in the heap.](/images/diagrams/dotnet-info-struct-name.svg)

*The conceptual struct contains 24 cells. Its final four cells display the illustrative reference 3543, leading to the separate Hello string. The address digits and cell counts preserve the teaching model; they do not specify byte order or a current runtime layout.*

This is why choosing a struct does not automatically eliminate all heap objects from a design. The struct can contain references to strings, arrays or other objects. Their storage and lifetimes still matter.

Copying this struct copies the three value fields and the `Name` reference. The two struct values can subsequently have different `Id` values or different `Name` references. Immediately after the copy, both name references can still identify the same string. That copy is shallow with respect to referenced objects. The [C# value-type reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) describes these value and reference-field semantics.

## Change Info to a class

Keep the fields and replace `struct` with `class`:

```csharp
internal class Info
{
    public int Id;
    public double Value;
    public DateTime Date;
    public string Name;
}
```

The two statements that create `info` and assign its name can remain the same. Their storage relationship changes. Now the local `info` contains a reference to an `Info` object. The integer, double, date and name-reference slot are fields inside that object.

![Main's info reference points to an Info object in the heap, whose Name field points to a separate Hello string.](/images/diagrams/csharp-info-class-layout.svg)

*The class version introduces another reference: the local refers to the Info object, and the object's Name field refers to the string. The same value fields remain inline within their containing object.*

Where is the integer now? It is inside the heap object. Its type is still `int`; changing its location did not turn it into a reference type.

This gives us a more useful way to reason than assigning every type a permanent stack or heap destination. A value field belongs to the storage of its containing value or object. A reference field holds a reference to another object, or `null`.

The distinction also explains assignment. If `Info` is a class, assigning `second = first` makes both variables refer to the same instance. Changing `second.Id` changes that shared instance. If `Info` is a struct, the assignment gives `second` its own copy of the fields, so changing `second.Id` leaves `first.Id` alone.

Equality is a related choice, but it needs its own precision. The default `ValueType.Equals` behavior compares fields. A custom struct can override equality, and a plain struct does not automatically acquire an `==` operator. Classes normally inherit reference equality unless they supply value equality; strings are a familiar example of a reference type with value-based equality. Decide which contract the type needs instead of inferring all equality behavior from its storage category.

## An array of integers lives on the heap too

Consider this array:

```csharp
int[] nums = { 1, 2, 3, 4, 5, 6, 7, 8 };
```

Is it a value type because its elements are integers?

The array itself is a reference type. `nums` refers to the array object, and the eight integer values are stored inline in its element area. Those elements are contiguous, even though the source diagram wraps them into rows to fit on the page.

![The nums local references a heap array containing eight inline integers, shown in four rows of eight conceptual cells.](/images/diagrams/dotnet-integer-array-layout.svg)

*Each illustrated group ends with one of the values 1 through 8. The array is one object whose element storage contains the integers themselves. The unused Info declaration is retained from the source diagram.*

Once again, value-type storage appears inside a reference-type object. Assigning this array to another variable copies an array reference. It does not copy all eight integers into a new array. The [array type documentation](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays) describes arrays as reference types and explains their element initialization.

Arrays receive direct support from the runtime and provide useful, regular storage. They are a good candidate when a fixed-size sequence matches the problem. A resizable collection or a keyed lookup may be a better fit for another operation. Choose the required behavior first, then measure the relevant access pattern.

## An array of class instances contains references

Keep `Info` as a class and make an `Info[]`. In the source diagram, the initializer is abbreviated because the point is the resulting layout:

![An infos reference points to an array of references. One illustrated array entry points to a separate Info object below it in the heap.](/images/diagrams/dotnet-reference-array-layout.svg)

*The array's eight element slots contain references. One referenced Info instance is expanded below the array. The initializer's three dots deliberately omit its contents, and the small cell values are schematic, rather than real object addresses.*

The reference slots are contiguous. The objects they identify need not be adjacent to the array or to one another. Each object's `Name` can introduce another reference to a string.

There is also a construction distinction worth making explicit. `new Info[8]` creates an array containing eight `null` references. It does not create eight `Info` objects. Creating and assigning those objects is additional work. If `Info` were instead a struct, the array would hold eight inline `Info` values initialized to their defaults.

This starts to explain why data layout affects performance. A sequential scan through inline values has a regular access pattern. Following references may require the processor to obtain additional cache lines before it can continue. The issue is locality and cache behavior, rather than a rule that a numerically more distant address always takes longer to read.

Allocation order can influence locality. Creating objects consecutively can place them near each other; interleaving other allocations can change the arrangement. The garbage collector can also relocate objects. Those effects make layout worth understanding, but they do not establish a reliable address-spacing guarantee for application code.

In C++, the programmer can choose automatic or dynamically allocated storage for a class object, and arrays can contain class objects inline. Ordinary managed C# class references express a different storage model. C# structs let us express inline values, but replacing a class with a struct also changes copying and identity semantics. Make that decision with both behavior and cost in view.

## Why the stack is cheap to reclaim

The stack is not a special kind of faster RAM. Stack and heap describe ways of organizing storage and managing lifetimes within a process's virtual address space.

A call frame has a nested lifetime. When an ordinary call returns, its frame can be released by restoring the relevant stack state. The runtime does not need to discover which independently referenced heap objects are still alive before reclaiming that frame. Releasing a frame also does not mean that every byte in it has been physically erased.

The managed heap supports objects whose lifetimes do not follow the call stack. A method can create an object and return a reference that remains useful after the method returns. The runtime must therefore account for references from outside the object's creating frame.

This is a model of lifetimes, not a diagram of two fixed physical regions growing toward one another. Real virtual-memory reservations, heap segments and thread stacks are runtime and operating-system details. A 32-bit address space is measured in gigabytes; a four-megabyte sketch would not describe the process's total virtual address space.

## Allocation and collection are both work

.NET's garbage collector determines which objects are reachable from roots such as active stack/register references, static fields and GC handles. It follows references through the object graph. This is tracing collection; the CLR does not generally maintain a reference count on each managed object and free it when that count reaches zero.

An object becoming unreachable makes its storage eligible for reclamation. It does not promise an immediate collection. Objects that refer to one another can still be collected when the whole group is unreachable from the application's roots.

Managed allocation is often inexpensive because its fast path can advance an allocation pointer. It still requires work and capacity. As allocation proceeds, collections must identify survivors and reclaim space, sometimes moving objects and updating references. Both allocation volume and surviving data affect collection frequency and duration. Microsoft's [garbage collection fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals) explains the allocation and reachability model.

The practical consequence is to recognize unnecessary objects in frequently executed code. Creating fewer short-lived objects can reduce allocation pressure. Retaining every object forever to avoid allocating again can create a different problem. Measure allocation rate, live memory and collection behavior together when this becomes a bottleneck.

## An object includes runtime overhead

The fields we wrote are only part of the story. The CLR also needs information that lets it identify an object's type and manage that object.

![Conceptual Info object layout connects its method table pointer to shared type information and inherited methods, while Name points to a separate string.](/images/diagrams/csharp-static-type-layout.svg)

*The conceptual diagram separates instance fields, a method table, type information, inherited operations and a referenced string. It preserves the original labels and five connections. It is not a physical map of the System.Type object or a guarantee that every method call follows these arrows.*

At the left, `Storage for Id`, `Storage for Value` and `Storage for Date` belong to the individual `Info` instance. `Pointer to Name` is its reference to the string. The header and method-table information let the runtime associate the instance with the information it needs to operate on it.

The method code is not copied into every `Info` object. A thousand instances have a thousand sets of instance fields, while runtime type information and executable method code can be shared. The diagram uses `Object.Equals`, `Object.GetHashCode` and `Object.ToString` to make the relationship to inherited behavior visible.

`Info.ctor` denotes an instance constructor and `Info.cctor` a type initializer. They illustrate different roles; they do not mean that every class declaration necessarily emits both methods. Method tables, descriptors and dispatch structures are runtime implementation details. The CLR's [type system overview](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/type-system.md) distinguishes those structures from the reflection type system exposed to managed code.

For the traditional CLR layouts discussed here, a minimum-sized ordinary object is commonly 12 bytes on x86 and 24 bytes on x64, including overhead and alignment. CoreCLR's [object layout definitions](https://github.com/dotnet/runtime/blob/main/src/coreclr/vm/object.h) express the minimum in terms of pointer and header sizes. Those are implementation observations, not the size of every object. Adding fields, changing runtime or architecture, and using special types such as arrays and strings changes the calculation. An `int` itself remains four bytes on either architecture.

Boxing illustrates why overhead matters. Converting an integer to `object` can create a boxed object containing the copied integer plus the object's overhead. A small value can therefore require substantially more storage when boxed. The [boxing documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing) explains the conversion and its allocation cost.

The drawing should not persuade you to remove useful methods to save imagined pointer lookups. The JIT can inline calls or specialize their execution. Keep the abstractions that let you understand and maintain the program, and investigate their measured cost when the application gives you a reason.

## Static members belong to the type

Before the runtime can use an `Info`, it needs a runtime representation of that loaded type. That representation is shared by instances of the same loaded type. Static fields likewise belong to the type rather than to each ordinary instance.

The diagram collects this idea under `Type Instance`, with `Type Information` and `Static Members`. Read that as a conceptual grouping. A managed `System.Type` object is not literally a container whose instance fields hold all of a type's static variables and executable methods. A static class also does not gain an ordinary instance just because the runtime has type metadata for it.

For historical .NET Framework applications, AppDomains were an important boundary for loaded types and static state. An AppDomain is not synonymous with an operating-system process: a process could host multiple domains. Current .NET has different loading and isolation mechanisms, and different constructed generic types can have separate static state. The useful rule here is to identify the loaded type and its boundary, rather than treating a static field as one global value across every process.

## Passing an argument copies its value by default

The same distinction applies at a method call. With an ordinary by-value parameter, passing an `Info` struct gives the callee a copy of that struct value. Passing an `Info` class reference gives the callee a copy of the reference.

In the class case, both copies can refer to one object. The callee can change a field on that object, and the caller will observe the change. Reassigning the callee's local parameter to a different object does not reassign the caller's variable.

Passing a variable by reference using `ref` is a separate choice. It lets the callee operate on the caller's variable itself. Avoid using “reference type” and “passed by reference” interchangeably: they answer different questions about the call.

## Follow a string through an append

Strings make the final example easy to observe:

```csharp
string s1 = "Hello World";
string s2 = s1;
s1 += ", Welcome";

Console.WriteLine(s1);
Console.WriteLine(s2);
```

The output is:

```text
Hello World, Welcome
Hello World
```

After the second line, `s1` and `s2` refer to the same string. The append combines the original characters with the suffix to produce a new string, then assigns that result to `s1`. `s2` retains its reference to the original.

![s2 points to the original eleven-character Hello World string, while s1 points to the new twenty-character Hello World, Welcome string.](/images/diagrams/dotnet-string-alias-layout.svg)

*The original string has length 0x000B, or 11; the result has length 0x0014, or 20. Character cells preserve the two strings exactly. The final statement is corrected to s1 += ", Welcome"; the original diagram repeated the string type keyword on that assignment.*

The string's characters form a contiguous sequence, with additional runtime storage for information such as length. Each .NET `char` is a UTF-16 code unit; one drawn character cell is not one byte. The simplified header cells also do not specify the full physical string layout.

Immutability explains why changing `s1` leaves `s2` alone. It also explains the potential cost of repeatedly building a larger string: a succession of results can copy earlier characters again. The appropriate construction method depends on whether we are combining a fixed set of values or growing a result over time. That is a performance question we can now investigate with a concrete allocation model.

## Know the engine and the road

A good driver can use a car without knowing how its engine works. Understanding the engine and the road gives that driver more information: when to change gear, how to approach a turn, and which conditions will cause trouble.

The runtime and hardware provide that context for our code. Inline fields, copied references, separate objects and temporary strings all lead to different amounts of work. Knowing those relationships helps us form a useful hypothesis when a profiler identifies a problem.

Keep the program understandable. Use this model to explain a measurement, choose an experiment, and verify whether a change helps. The next step is to examine the processor's caches and the access patterns that let it use those values efficiently.
