---
title: "So You Think You Know C#? Generics Under the Hood"
description: ".NET generics retain runtime type arguments. Typed lists avoid boxing value-type elements, while CLR specialization and code sharing preserve distinct types."
datePublished: 2020-03-28
dateModified: 2020-03-28
tags: ["reflection", "csharp"]
hero: csharp-generics-under-the-hood
youtube: "https://www.youtube.com/watch?v=MIZFp5m3Pus"
draft: true
---

We use generics all the time. `List<int>`, `List<DateTime>`, perhaps a list of one of our own classes. The syntax is familiar. What does the runtime actually do with those different type arguments?

This explanation assumes you already use generic types and methods. I want to look underneath that syntax: what survives compilation, why value types receive specialized treatment, and how the runtime can share code without losing type information.

Collections give us a useful example because they also show a performance problem that generics helped solve.

## The compiler and runtime work together

Generics arrived in C# 2. Supporting them involved the C# compiler and the Common Language Runtime, or CLR. The compiler had to describe generic declarations and their type parameters in the assembly's intermediate language and metadata. The runtime had to understand that information and execute code using the supplied types.

Microsoft Research Cambridge contributed to this design. Andrew Kennedy and Don Syme's [2001 paper on CLR generics](https://www.microsoft.com/en-us/research/?p=145172) describes exact runtime types, just-in-time specialization and sharing code according to its representation. Those are central to the behavior we are examining.

That runtime involvement matters. A language feature that requires new CLR behavior brings a runtime compatibility requirement with it. Installing a compiler capable of accepting the syntax does not equip an older runtime to execute a feature it cannot support.

Deployment makes that distinction practical. Modern .NET allows an application to use an installed compatible runtime or to carry its runtime in a self-contained deployment. The [deployment documentation](https://learn.microsoft.com/en-us/dotnet/core/deploying/) explains those choices. They give applications more control than assuming the required runtime is simply part of the machine's operating-system environment.

C# 8 default interface implementations provide another example of a language feature requiring runtime work. I consider implementations in interfaces one of the most useless features added to the language. Why put that implementation in the interface? That is my design objection; the separate technical point is that supporting the feature required changes described in the [language proposal](https://github.com/dotnet/csharplang/blob/main/proposals/csharp-8.0/default-interface-methods.md). These two examples do not constitute a complete history of language-driven CLR changes.

With generics, that compiler/runtime cooperation lets the runtime preserve the actual type arguments. Let's see why that is useful.

## The cost of treating a value as object

Before generic collections, `ArrayList` was a familiar way to hold a growing collection. Its elements are exposed as `object`. An integer is a value type, so adding it to an `ArrayList` involves boxing: putting a copy of the value inside an object that can be referenced as `object`.

The following small teaching program makes the collection comparison executable:

```csharp
using System;
using System.Collections;
using System.Collections.Generic;

internal static class Program
{
    static void Main()
    {
        var untyped = new ArrayList();
        untyped.Add(20);
        int first = (int)untyped[0];

        var typed = new List<int>();
        typed.Add(20);
        int second = typed[0];

        Console.WriteLine(first);
        Console.WriteLine(second);
    }
}
```

Both lines print `20`, but the element operations differ. `ArrayList.Add` receives the boxed integer. Retrieving an integer requires the cast and unboxing operation. `List<int>.Add` accepts an `int`, and its indexer returns an `int`.

The generic collection can store those integer elements directly in its backing array. It still has a list object and array storage; avoiding boxing does not make the entire collection allocation-free. It avoids creating a separate boxed object for each integer added through these typed operations.

That distinction can save allocations and reduce the number of objects the garbage collector must manage. It also removes the need to recover the element's intended type through an object cast at each access. A `List<DateTime>` receives the same kind of benefit for its value-type elements.

Measuring the speedup requires a workload. The number of elements and operations will affect the result in a real application.

## What survives compilation?

.NET generics are *reified*: the runtime retains the actual generic type arguments. An instance of `List<int>` has that constructed type at runtime. It has not become a `List<object>` just because the C# compilation step has finished.

Here is a separate teaching program that checks the distinction:

```csharp
using System;
using System.Collections.Generic;

internal static class Program
{
    static void Main()
    {
        var integers = new List<int>();
        var dates = new List<DateTime>();
        var names = new List<string>();
        var objects = new List<object>();

        Console.WriteLine(integers.GetType().GetGenericArguments()[0].Name);
        Console.WriteLine(dates.GetType().GetGenericArguments()[0].Name);
        Console.WriteLine(names.GetType().GetGenericArguments()[0].Name);
        Console.WriteLine(objects.GetType().GetGenericArguments()[0].Name);
        Console.WriteLine(names.GetType() == objects.GetType());
    }
}
```

The output is:

```text
Int32
DateTime
String
Object
False
```

Reflection sees the type argument of each constructed list type. `List<string>` and `List<object>` are distinct types, even though both have reference-type arguments. Keep that distinction in mind when we come to shared code.

Java takes a different approach. Its generic implementation uses *type erasure*. The compiler replaces type parameters with their bounds, or with `Object` for an unbounded parameter, and inserts casts and bridge methods as needed. It does not create a new runtime class for each parameterized use. [Oracle's explanation of erasure](https://docs.oracle.com/javase/tutorial/java/generics/erasure.html) describes that transformation.

That does not mean Java has no generic information available through reflection. Generic declarations can retain signatures that reflection exposes, including through [`ParameterizedType`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/reflect/ParameterizedType.html). The important distinction is that an ordinary Java `ArrayList<String>` instance does not acquire a separate runtime class carrying `String` as a reified instance type argument in the .NET sense.

There is another familiar comparison: C++ templates. A compiler instantiates a template for particular arguments during compilation. You can think of the result as generating the needed definitions, but calling templates macros is only a loose analogy. They are a typed language mechanism, with rules for instantiation and specialization, rather than preprocessor text substitution. The [C++ template guide](https://learn.microsoft.com/en-us/cpp/cpp/templates-cpp?view=msvc-170) explains that compilation model.

The different approaches place work in different parts of the toolchain. In the ordinary CLR JIT model, much of the specialization we care about happens at runtime.

## Value types get specialized code

Suppose an application starts using `List<int>`. The runtime can specialize the generic code for integer values, using their actual representation. Operations do not have to treat every element as an object reference and box the integers to fit.

Now the application starts using `List<DateTime>`. That is another value-type instantiation, with its own representation and specialized code. `List<long>` and a list of a custom struct likewise need treatment appropriate to their respective value types.

Making a second `List<int>` does not mean generating the entire implementation again for that new list object. The two objects can use the same specialization. The distinction is between a constructed type and an instance of it.

In the usual JIT execution model, methods are compiled as execution requires them. Merely imagining or declaring thousands of possible generic combinations does not mean the JIT eagerly emits all their method bodies. If execution uses only a small subset, the others need not acquire JIT-compiled bodies merely because those combinations are possible.

Specialization also has a space cost. As an application uses more value-type combinations, it can require more specialized native code. The working set includes more than your original source or assembly file. This is one reason a feature that removes work from individual element operations can still increase the amount of generated code.

## Reference types can share code

For reference-type arguments, the runtime has a useful common representation: an object reference. A reference to one class and a reference to another have the same size on a given runtime architecture, even when the objects themselves differ greatly in size.

That allows generic machine code to be shared across reference-type instantiations. The implementation still has access to the type context it needs. Sharing instructions does not erase the identity of `List<string>` or make it interchangeable with `List<object>`.

| Generic use | Typical CLR treatment | What remains distinct |
| --- | --- | --- |
| Two `List<int>` instances | Reuse the integer specialization | The two list objects and their contents |
| `List<int>` and `List<DateTime>` | Specialized code for the different value-type arguments | Constructed types, element representation and instances |
| `List<string>` and `List<object>` | Can share code operating on references | Constructed types, type arguments and instances |

Microsoft's [runtime generics guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generics-in-the-run-time) describes the value-type specialization and reference-type sharing model. The reflection program above checks the type identities; it does not inspect native code or prove that two particular methods share an instruction address.

This is a conceptual account of the usual CLR JIT implementation. Ahead-of-time compilation changes when native code is produced, and tiered compilation can produce further versions of a method. “One specialization” is not a guarantee that the process will contain exactly one permanent native body for every relevant method.

The useful consequence is that generic type identity and machine-code identity are separate questions. C# preserves enough type information to know what your collection contains, while the runtime can choose specialized or shared code according to the representations it has to handle.
