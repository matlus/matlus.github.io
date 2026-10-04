---
title: "So You Think You Know C#? Constants and Default Parameter Values"
description: "C# embeds constants and default parameter values in compiled callers. Library-only builds and IL inspection explain why callers must be rebuilt to adopt changed values."
datePublished: 2020-03-23
dateModified: 2020-03-23
tags: ["csharp", "method-design"]
hero: csharp-constants-default-parameters
youtube: "https://www.youtube.com/watch?v=OrpPfOu4PQ0"
draft: true
---

Suppose you change a constant in a class library, build the library, and copy its new DLL into an application's directory. You run the application, and it still prints the old value.

You check the source. The new value is there. You check the DLL. It is the one you just built. What have you missed?

The application has its own compiled copy of that value. Understanding how it got there also explains a less obvious consequence of default parameter values.

## A constant has a value at compile time

First, let's get the terminology right. Calling something a “constant variable” obscures the distinction we need. A constant does not vary. In C#, its value must be available to the compiler.

Create a class library called `ConstantsLib`. Its first class is deliberately simple:

```csharp
namespace ConstantsLib
{
    public static class Messages
    {
        public const string Hello = "Hello World.";
    }
}
```

Now create a console application called `ConstantsAndDefaults`, add a reference to the library, and use the constant:

```csharp
using ConstantsLib;
using System;

namespace ConstantsAndDefaults
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(Messages.Hello);
        }
    }
}
```

Build both projects and run the application. It prints:

```text
Hello World.
```

So far, there is nothing surprising. Change the declaration in the library:

```csharp
public const string Hello = "Hello World II.";
```

This time, rebuild **only the library** and replace `ConstantsLib.dll` beside the already-built application. Run that application directly. Do not build the solution again as part of launching it.

The output is still:

```text
Hello World.
```

Why doesn't the application read the new value from the library?

## Look at what the caller contains

When the C# compiler compiles `Console.WriteLine(Messages.Hello)`, it substitutes the constant's value into the caller. For this use, the compiled application contains the equivalent of:

```csharp
Console.WriteLine("Hello World.");
```

The relevant intermediate language, or IL, makes that substitution visible. These are the two instructions that load the text and print it; surrounding method instructions are omitted:

```il
ldstr "Hello World."
call void [mscorlib]System.Console::WriteLine(string)
```

`ldstr` loads the string literal. There is no instruction here to retrieve `Messages.Hello` from the library when the application runs. The `[mscorlib]` assembly qualification is from .NET Framework; newer .NET targets can use different assembly qualifications without changing the substitution being demonstrated.

Replacing the library cannot change that literal inside the application. Rebuild the application against the updated library and it prints `Hello World II.`.

This matters when you distribute a library to several applications. Each compiled consumer can retain the value it saw when it was built. Changing the declaration in your library does not reach into those other assemblies and rewrite them.

I learned this the hard way. In the early days, uploading an application could take long enough that I would deploy only the DLLs I had changed. Changing a constant and uploading its DLL seemed sufficient. The applications using it still needed to be rebuilt.

Use constants for values you intend to remain constant. A value that changes every week or every month is a poor candidate. Even an infrequent correction has a deployment consequence: **rebuild and redistribute the consumers that need the new value.**

## An omitted argument still has to reach the method

Now add a second class to `ConstantsLib`:

```csharp
namespace ConstantsLib
{
    public static class TaxCalculator
    {
        public static double Calculate(
            double taxableIncome,
            double percentage = 30)
        {
            return (percentage / 100) * taxableIncome;
        }
    }
}
```

This is a deliberately small arithmetic example. It applies one percentage to an income; it is not a model of tax rules, rounding, or financial calculations.

The `percentage` parameter has a default value. A caller can provide it explicitly:

```csharp
TaxCalculator.Calculate(70000, 30);
```

Or omit it:

```csharp
TaxCalculator.Calculate(70000);
```

Both calls calculate thirty percent of 70,000, which is 21,000. Replace the console application's `Main` method with this version:

```csharp
static void Main(string[] args)
{
    Console.WriteLine(Messages.Hello);
    Console.WriteLine("Calculated Tax: " + TaxCalculator.Calculate(70000));
}
```

Build the library with the default of `30`, then build and run the application. Its tax line reads:

```text
Calculated Tax: 21000
```

Now change the library's default from `30` to `50`:

```csharp
public static double Calculate(
    double taxableIncome,
    double percentage = 50)
{
    return (percentage / 100) * taxableIncome;
}
```

Rebuild only the library, replace its DLL, and run the existing application again. What value do you expect?

It still prints `21000`.

## The compiler supplies the default at the call site

The method takes two arguments. Omitting one in C# source does not make the compiled call pass only one value. For this statically bound call, the compiler reads the default and supplies the missing argument while compiling the caller.

The original call therefore behaves like this:

```csharp
TaxCalculator.Calculate(70000, 30);
```

The relevant IL loads two floating-point values and calls the two-parameter method:

```il
ldc.r8 70000
ldc.r8 30
call float64 [ConstantsLib]ConstantsLib.TaxCalculator::Calculate(float64, float64)
```

Changing the default in the library changes the default recorded in that library's metadata. It does not change the `30` already emitted into the application's call. The newly deployed method receives `30`, performs its arithmetic, and correctly returns `21000`.

Rebuild the application against the library whose default is `50`, and the compiler supplies `50` instead. The output becomes:

```text
Calculated Tax: 35000
```

Notice the distinction between the method's implementation and the caller's argument. Replacing the library can replace the method body. The already-compiled caller continues to provide the argument that was compiled into it.

The complete experiment has three observable states:

| What has been built? | Greeting | Calculated tax |
|---|---|---:|
| Library and application, using `Hello World.` and `30` | `Hello World.` | 21000 |
| Updated library only, using `Hello World II.` and `50` | `Hello World.` | 21000 |
| Application rebuilt against the updated library | `Hello World II.` | 35000 |

Be careful when inspecting this with a decompiler. A C# view reconstructs convenient C# source from the assembly. It may display an omitted argument when it recognizes a value matching the default. An IL view lets you inspect the actual arguments passed by the compiled caller.

## Choose the API you want callers to use

I looked forward to default parameter values before they arrived in C#. In practice, I have not used them in my production code. I tend to find two or three overloads clearer when I want to expose different ways of calling a method.

That preference is about the method's design and the intent communicated to its callers. A long parameter list with many optional values can make those choices harder to understand. The [Method Design guidelines](/pwi/method-design/csharp/) develop that broader concern.

You may choose optional parameters. When you do, understand where the default is applied. With an ordinary statically bound C# call, updating the library's default alone will not change an existing application's argument. The caller must be compiled again to adopt it.

For the language rules behind these examples, see Microsoft's documentation on [constants](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constants) and [named and optional arguments](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/named-and-optional-arguments).
