---
title: "So You Think You Know C#? The Fundamentals"
description: "C# passes arguments by value by default. Integer, string and object examples explain what gets copied, how ref works and which changes reach the caller."
datePublished: 2020-03-01
dateModified: 2020-03-01
tags: ["method-design", "csharp"]
hero: csharp-value-reference-fundamentals-shared-object
youtube: "https://www.youtube.com/watch?v=7BepNnpU2UU"
draft: true
---

You may know what a small piece of C# will print. Can you explain why it prints that value? And does your explanation still work when we change an integer to a string, or put the string inside another object?

These are fundamentals. They are also the things we can skim over when learning a language and still be shaky on five years later. We recognize familiar behavior without having a clear picture of what produces it.

Let's build that picture. We need to understand what a variable contains, what gets copied when we pass it to a method, and what an assignment actually changes.

## What does the variable contain?

If I ask for the difference between a value type and a reference type, a common answer is that value types live on the stack and reference types live on the heap.

That answer leaves us with a problem as soon as a class contains an integer. Where does that integer live?

**A value-type variable contains its value. A reference-type variable contains a reference to an object.** Start there. We can then examine where the variable and the object are stored.

Consider an integer local:

```csharp
int i = 20;
```

In a simple memory model, looking at the storage for `i` gives us the value `20`. We do not have to follow a reference to a separate integer object.

Now consider a string local:

```csharp
string s = "Hello";
```

The variable `s` contains a reference to the string object. Following that reference takes us to the object containing the characters. The variable and the object it refers to are different things.

We often draw a local variable in a method's stack frame and its referenced object on the managed heap. That is a useful conceptual model, with a qualification: the runtime can optimize the physical storage. For example, modern .NET supports [stack allocation of some objects that do not escape](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/runtime). Register allocation and other optimizations also affect the final machine code. Those choices preserve the language's behavior; they do not turn a class into a value type.

## Value types are stored inline

Here is a struct containing three value-type fields:

```csharp
using System;

internal struct Info
{
    public int Id;
    public double Value;
    public DateTime Date;
}
```

All structs are value types. An `Info` variable therefore contains the struct's value, including the storage for its fields. `Id`, `Value` and `Date` are part of that value. They are stored *inline* within it.

Inline means that the field's value occupies storage in the containing value or object. It does not require a separate object reached through a reference. It also does not specify that the containing storage must be on the stack.

Now add a reference-type field:

```csharp
using System;

internal struct Info
{
    public int Id;
    public double Value;
    public DateTime Date;
    public string Name;
}
```

`Info` remains a value type. Its `Name` field contains a string reference, and the reference itself is part of the struct's storage. The string's characters belong to a separate string object.

After `Info info = new Info();`, these fields have their default values. In particular, `Name` is initially `null`. Assigning `info.Name = "Hello";` stores a reference to the string in that field. Adding a reference-type field does not move the entire struct somewhere else or make the struct a reference type.

![Conceptual stack and heap diagram before Name is assigned: the local Info struct occupies twenty-four cells in Main, with a zero reference in its final four cells and an empty heap.](/images/diagrams/csharp-info-struct-layout.svg)

*The local struct contains its fields inline. The final four highlighted cells represent the initially null Name reference. The twenty-four cells and address labels are a conceptual illustration, not a measurement of this struct on a particular runtime.*

Change the declaration from `struct` to `class`, retaining the same four fields. What changes?

`Info` is now a reference type. The local `info` contains a reference to an `Info` object. Inside that object, `Id`, `Value` and `Date` still occupy inline storage. `Name` still contains a reference to a separate string.

![Conceptual class layout: the local info reference points to an Info object on the heap. The object's value fields are inline, and its Name field points to the separate Hello string.](/images/diagrams/csharp-info-class-layout.svg)

*The local info reference points to the object at 0x001513ec. Inside that object, Name points to Hello at 0x3543. The address of the local, 0x015D, is distinct from both referenced addresses. These are illustrative addresses.*

This is why “value types live on the stack” is an inadequate definition. An integer field inside a heap-allocated class instance lives within that instance. The integer remains a value type.

There are two references to keep track of in the class example: the local reference to the `Info` object, and the object's field referencing a string. Confusing those two locations is a common source of confusion in method calls.

## Passing by value makes a copy

By default, C# passes an argument by value. The parameter receives a copy of the argument's value. Apply that rule to what the variable actually contains.

Here is a complete console example:

```csharp
using System;

internal class Program
{
    static void Main(string[] args)
    {
        int i = 10;
        DoSomething(i);
        Console.WriteLine(i);
    }

    static void DoSomething(int i)
    {
        i = 20;
    }
}
```

The output is `10`. `Main` has a variable containing `10`. The call gives `DoSomething` a separate parameter containing a copy of that value. Assigning `20` to the parameter changes that parameter. The caller's variable still contains `10`.

Imagine you want to borrow my book and I give you a printed copy. Write all over your copy if you like. I still have the original book, and your changes do not appear in it.

For a struct, the copied value includes its fields. If a struct contains references, those references are copied too; the objects they refer to are not recursively duplicated. A large struct can therefore involve substantially more copying than an integer. I aim to keep structs small in their memory requirements. That is a design consideration, not a claim that every struct copy is expensive or that the runtime emits a literal copy for every source-level operation.

The same default passing rule applies to reference types. We will use it shortly.

## Passing by reference exposes the caller's variable

Replace the two methods with these:

```csharp
static void Main(string[] args)
{
    int i = 10;
    DoSomething(ref i);
    Console.WriteLine(i);
}

static void DoSomething(ref int i)
{
    i = 20;
}
```

The output is now `20`. The `ref` parameter refers to the caller's variable. Assigning through it changes that variable.

Notice that `ref` appears at the declaration and the call site. Both sides say that the method is being given access to the variable itself. We have changed how the argument is passed; its type is still `int`.

“Reference type” and “passed by reference” answer different questions. The first describes the kind of value a variable holds. The second describes the relationship between an argument variable and a method parameter. The [C# method guidance](https://learn.microsoft.com/en-us/dotnet/csharp/methods) makes this distinction explicit.

## A string makes the question more interesting

Consider this complete replacement program:

```csharp
using System;

internal class Program
{
    static void Main(string[] args)
    {
        var s1 = "Hello";
        DoSomething(s1);
        Console.WriteLine(s1);
    }

    static void DoSomething(string s)
    {
        s += " World";
    }
}
```

The output is `Hello`. You may already know that. Can you explain it using the same rule we used for the integer?

`string` is a reference type, so `s1` contains a reference. Passing it by value copies that reference into the parameter `s`. At entry to the method, both variables refer to the same string object containing `Hello`. The call has not copied the characters into another string.

The expression `s += " World"` then concatenates the strings and assigns the resulting reference to `s`. For this example, the result is a new string containing `Hello World`. The existing `Hello` string is unchanged, and the caller's variable is unchanged. Only the method's parameter receives the new reference.

**String immutability concerns the string object's contents. It does not prevent a variable from receiving a different string reference.**

We can expose the same sequence without a method call. Replace `Main` with:

```csharp
static void Main(string[] args)
{
    var s1 = "Hello";
    var s2 = s1;
    s2 += " World";
    Console.WriteLine(s1);
    Console.WriteLine(s2);
}
```

This prints `Hello` followed by `Hello World`. The assignment `s2 = s1` copies the reference. The concatenation later gives `s2` a different reference. Neither operation changes `s1`.

The presence of a method is incidental to this part of the explanation. We need to track which variable receives the assignment and whether the operation changes an existing object's contents.

Passing the string variable with `ref` would let the method replace the caller's reference. The result of concatenation would still be a different string; `ref` would not make strings mutable.

## Immutability has a cost when we build new strings

Suppose you have a string containing about a megabyte of data and append one character. That character cannot be written into the existing string's contents. Building the larger result requires storage for it and copying the existing characters into it, followed by the new character.

We now have allocation work and copying work. If the previous string is no longer needed and is eligible for collection, there is eventual garbage-collection work too. Repeating this operation can mean repeatedly copying the growing content.

That explains a cost. It does not mean you should never concatenate strings. The shape of the expression, the amount of data and the number of repetitions matter. The compiler and runtime can also simplify some operations. You cannot turn the word “immutable” into a performance result for every use of `+`.

The lifetime of the old string also depends on the program. Another reference can keep it reachable. String literals such as `"Hello"` participate in interning, so reassigning a variable that held a literal does not establish that the literal's object will be collected. The useful question is which objects remain reachable and which new values the operation needs to produce.

## What if the string belongs to another object?

Now put the name inside an `Info` class and pass an `Info` reference to a method. To isolate the operation, this reduced teaching version retains just the mutable `Name` property. The `Id`, `Value` and `Date` fields from the layout example do not participate in the change, and the object initializer supplies the starting name directly.

```csharp
using System;

internal class Program
{
    static void Main(string[] args)
    {
        var info = new Info { Name = "Shiv" };
        DoSomething(info);
        Console.WriteLine(info.Name);
    }

    static void DoSomething(Info info)
    {
        info.Name = "Jack";
    }
}

internal sealed class Info
{
    public string Name { get; set; } = "";
}
```

The output is `Jack`. Why did this change reach the caller when the string concatenation did not?

The caller's `info` and the method's parameter contain references to the same `Info` object. The parameter received a copy of the reference, just as the string parameter did earlier.

The assignment is different. `info.Name = "Jack"` follows the reference to the shared `Info` object and changes that object's property. The property now holds a reference to the string `Jack`. Reading the property through the caller's reference reaches that same object and retrieves the new value.

The string `Shiv` has not become mutable. Its characters have not been overwritten with `Jack`. We have changed the string reference stored by the `Info` object. Assigning a string literal also need not allocate a fresh string at that line; an interned string can supply the reference.

Compare the two assignments carefully:

| Assignment | Location receiving the new reference | Visible through the caller afterward? |
| --- | --- | --- |
| `s += " World"` | The method's own string parameter | No; the caller's string variable is separate |
| `info.Name = "Jack"` | The Name property of the shared Info object | Yes; both references reach that object |

Adding `ref` to the `Info` parameter and call would still produce `Jack` for this particular method. The method already has access to the object whose property it changes. It does not need access to the caller's variable to perform that mutation.

Replacing the caller's `Info` reference would be a different operation. A by-value parameter can itself be assigned another object without replacing the reference stored in the caller's variable. `ref` matters when the method needs to assign that caller variable.

## Make the intended result visible

This brings me to a pet peeve. When a method accepts an object and modifies it, I prefer the signature to return the modified object. I want the call to communicate that I am supplying something and receiving a result.

Here is that adaptation of the preceding example:

```csharp
static void Main(string[] args)
{
    var info = new Info { Name = "Shiv" };
    info = DoSomething(info);
    Console.WriteLine(info.Name);
}

static Info DoSomething(Info info)
{
    info.Name = "Jack";
    return info;
}
```

This still returns the same instance. Returning an object does not automatically create a replacement or make the operation pure. Whether the implementation modifies an existing instance or constructs another one is a separate decision, and callers need the relevant contract.

My preference is about communicating the operation through its signature and call. I don't want readers to rely on an invisible change they happen to know can travel through a shared reference. The name `DoSomething` is deliberately generic for examining language behavior; a real method also needs a name that explains its responsibility.

When an example seems surprising, trace the storage: what does the variable contain, what was copied, and which location received the assignment? That gives you a way to explain the result even after the example changes.
