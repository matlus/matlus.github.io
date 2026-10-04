---
title: "So You Think You Know C#? ValueTuples and Deconstruction"
description: "Named ValueTuples make small results readable. Positional fields, copy behavior and Deconstruct methods explain the syntax and the limits of tuple return types."
datePublished: 2020-08-03
dateModified: 2020-08-03
tags: ["csharp"]
hero: csharp-valuetuples-deconstruction-workbench
youtube: "https://www.youtube.com/watch?v=x3At5Pq2__I"
draft: true
---

Sometimes a method needs to return two or three values that belong together for the operation you're performing. You could define a class to carry them. If that class represents something meaningful in your business, that is exactly what you should do. But sometimes all you need is a small group of results, and inventing a type for it feels unnecessary.

That is where tuples can help. The important questions are what the caller can understand from the returned values, what kind of value the caller receives, and what the compiler does with the convenient syntax.

Let's start with the older `Tuple` type. It shows why the syntax matters.

## Three results, three unhelpful names

Suppose we want to return a sum, an average and a maximum. This example uses fixed values to concentrate on the return type; it does not calculate aggregates from a collection.

```csharp
using System;

internal static class Program
{
    static void Main(string[] args)
    {
        var aggregates = ComputeAggregates();
        Console.WriteLine(aggregates.Item1);
        Console.WriteLine(aggregates.Item2);
        Console.WriteLine(aggregates.Item3);
    }

    static Tuple<double, double, int> ComputeAggregates()
    {
        return Tuple.Create(20d, 13d, 35);
    }
}
```

The factory method infers the three types from the arguments. The method returns one object containing three values, and the caller can read those values through `Item1`, `Item2` and `Item3`.

Which one is the sum? Which is the average? The caller has to know the order. Two of the elements even have the same type, so the types cannot help distinguish them.

I tried using tuples like this and stopped. I would rather define a type with meaningful property names than make someone work out what `Item2` means. The ability to group values was useful, but the resulting code was not pleasant to read.

Now change the return type and factory method to `ValueTuple`:

```csharp
static ValueTuple<double, double, int> ComputeAggregates()
{
    return ValueTuple.Create(20d, 13d, 35);
}
```

The caller still sees `Item1`, `Item2` and `Item3`. We have changed an important part of the behavior: `Tuple` is a reference type, and `ValueTuple` is a value type. But that change alone has done nothing for readability.

C# tuple syntax gives us the next part.

## Giving the return value some meaning

We can express the same value tuple with parentheses:

```csharp
static (double, double, int) ComputeAggregates()
{
    return (20d, 13d, 35);
}
```

The return type lists the element types. The return expression supplies their values in that order. We no longer have to write `ValueTuple` or call its factory method, but the unnamed elements still leave the caller with positional names.

For the next steps, let's use a make, model and year. A vehicle would normally deserve its own domain type. Here those familiar values let us concentrate on the language feature without introducing another calculation.

```csharp
using System;

internal static class Program
{
    static void Main(string[] args)
    {
        var vehicle = GetVehicle();
        Console.WriteLine(vehicle.Make);
        Console.WriteLine(vehicle.Model);
        Console.WriteLine(vehicle.Year);
    }

    static (string Make, string Model, int Year) GetVehicle()
    {
        return ("Mercedes", "AMG SL43", 2020);
    }
}
```

Now the method signature tells us what each returned element means. The caller can use `vehicle.Make`, `vehicle.Model` and `vehicle.Year`, and the editor can show those names in completion lists.

I prefer PascalCase for the element names in the return type. It makes them read like the public members of a result and distinguishes them visually from the method's input parameters. That is a naming preference, not a requirement of tuple syntax.

The method still has one return type. That type contains three elements. Describing this as returning multiple values is convenient, provided we understand what is being returned.

## Deconstruction gives the caller separate variables

The caller may want separate variables instead of a variable containing the whole tuple. Replace `Main` in the preceding program with this:

```csharp
static void Main(string[] args)
{
    var (make, model, year) = GetVehicle();
    Console.WriteLine(make);
    Console.WriteLine(model);
    Console.WriteLine(year);
}
```

This is **deconstruction**. The compiler infers `string`, `string` and `int` from the tuple and declares three local variables. The first receives the first element, the second receives the second element, and the third receives the third element.

You can spell out their types if that helps make the declaration clear:

```csharp
(string make, string model, int year) = GetVehicle();
```

There is another declaration that looks similar but does something different:

```csharp
(string make, string model, int year) vehicle = GetVehicle();
```

The name `vehicle` after the parentheses makes this a declaration of one tuple variable. The lowercase names inside the parentheses are its element names. In the deconstruction declaration there is no `vehicle` variable; `make`, `model` and `year` are separate locals.

The caller can give the elements different names from those in the method's return type. That ought to make you curious. If `GetVehicle` returns elements called `Make`, `Model` and `Year`, how can this caller receive elements called `make`, `model` and `year` without a conversion to another kind of object?

## What happened to the names?

The underlying constructed type is `ValueTuple<string, string, int>`. Its fields are `Item1`, `Item2` and `Item3`. Writing a name such as `Make` does not add another field to that struct.

Conceptually, the compiler can express the method using the underlying type:

```csharp
static ValueTuple<string, string, int> GetVehicle()
{
    return new ValueTuple<string, string, int>("Mercedes", "AMG SL43", 2020);
}
```

This is an alternative way to express the returned value, not a second method to add alongside the existing `GetVehicle`. A call that reads `vehicle.Make` ultimately reads the first field. A call that uses a different name for that same element still reads the first field.

The names have a useful life in source code and in metadata. For a method return type, the compiler records them using `TupleElementNamesAttribute`, so another compiler consuming the assembly can recover the intended names. They do not become distinct runtime fields or distinguish two otherwise identical tuple types. Microsoft's [explanation of C# tuple compilation](https://devblogs.microsoft.com/premier-developer/dissecting-the-tuples-in-c-7/) shows this attribute and the underlying fields.

This distinction also explains assignment. Compatible tuples are matched by position and element type; their names need not match. The meaning you give each position is your responsibility. Naming an element `Year` does not make the runtime validate that it contains a year.

When inspecting this in a decompiler, remember that its C# output is a reconstruction of the compiled program. A tool that understands tuple syntax may put the friendly names and parentheses back. A lower-level view may show `ValueTuple`, its fields and the attribute instead. Neither view means the compiler literally produced a second C# source file as an intermediate artifact.

The disappearance of the friendly field names from runtime field access is sometimes compared with type erasure. Keep that comparison narrow. The generic arguments `string`, `string` and `int` remain part of the constructed .NET type.

## How anonymous types differ

We can group the same values using an anonymous object:

```csharp
var vehicle = new
{
    Make = "Mercedes",
    Model = "AMG SL43",
    Year = 2020
};
```

Here the compiler generates a class with properties called `Make`, `Model` and `Year`, backing fields and a constructor that accepts their values. The generated class also supplies `Equals`, `GetHashCode` and `ToString`. Its unusual generated name prevents accidental collisions with the types you name in your own source.

That is a different mechanism from using the existing generic `ValueTuple` struct. The anonymous object has reference-type behavior, and its properties are read-only. The value tuple has value-type behavior, and its fields can be changed.

Anonymous types are useful when the compiler can infer and carry their type, as it does in a LINQ projection. You cannot write the generated class name as an ordinary declared return type in your source. A named tuple return type lets you describe the result directly in a method signature.

The compiler can reuse an anonymous type within an assembly when the property names, types and order match. Its generated `Equals` compares property values, so two separate objects of that same anonymous type can be equal without being the same object. The [anonymous types documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/anonymous-types) describes both rules.

Notice that reference-type behavior and reference equality are separate questions. A class can provide value-based equality. Anonymous types do exactly that.

## Value tuples are mutable

When designing your own structs, make them immutable. Mutable value types can produce surprises when you forget where copies are made.

Value tuples themselves are mutable. In the vehicle program, this is legal:

```csharp
(string make, string model, int year) vehicle = GetVehicle();
vehicle.make = "Toyota";
```

The assignment changes the first field of this local tuple. It does not create a newly named tuple type, and it does not make the tuple a reference type.

To see the copy boundary, extend that local example:

```csharp
var copy = vehicle;
copy.make = "Honda";
Console.WriteLine(vehicle.make);
Console.WriteLine(copy.make);
```

The output is `Toyota` followed by `Honda`. Assigning the tuple to `copy` copied its fields. Changing the first field of `copy` leaves the first field of `vehicle` alone. If an element refers to a mutable object, both tuple copies can still refer to that same object; copying the tuple does not clone an object graph.

Value tuples also provide value-based `Equals` and `GetHashCode`, which makes them useful as small composite dictionary keys. Element values participate in equality. The friendly names you gave those elements do not. Changing a tuple's local element names therefore cannot turn otherwise equal tuple values into unequal ones. The [tuple reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples) covers assignment, equality and element names.

## Your own types can support deconstruction

Deconstruction is useful beyond tuples. Suppose `Vehicle` is a type we own, with read-only properties initialized by its constructor. We can give callers the same convenient syntax by supplying a method named `Deconstruct` with `out` parameters.

This complete example preserves the fixed values used in the demonstration. The `Deconstruct` method illustrates the compiler pattern; because it returns constants, it does not yet extract an arbitrary vehicle's actual property values.

```csharp
using System;

internal static class Program
{
    static void Main(string[] args)
    {
        var (make, model, year) = new Vehicle("Mercedes", "AMG SL43", 2020);
        Console.WriteLine(make);
        Console.WriteLine(model);
        Console.WriteLine(year);
    }
}

internal sealed class Vehicle
{
    public string Make { get; }
    public string Model { get; }
    public int Year { get; }

    public Vehicle(string make, string model, int year)
    {
        Make = make;
        Model = model;
        Year = year;
    }

    public void Deconstruct(out string make, out string model, out int year)
    {
        make = "Mercedes";
        model = "AMG SL43";
        year = 2020;
    }
}
```

How does the compiler know to call this method? The method's name and shape establish the pattern. There is no deconstruction interface that `Vehicle` must implement. The method returns `void` and supplies the individual values through its `out` parameters.

The declaration in `Main` has the effect of declaring the local variables and passing them to `Deconstruct`:

```csharp
var vehicle = new Vehicle("Mercedes", "AMG SL43", 2020);
string make;
string model;
int year;
vehicle.Deconstruct(out make, out model, out year);
```

For a reusable vehicle implementation, those three assignments inside `Deconstruct` would read `Make`, `Model` and `Year`. With the fixed demonstration values, constructing a different vehicle would still deconstruct to Mercedes, AMG SL43 and 2020. The compiler does not inspect the properties and correct the method for us.

You can provide more than one `Deconstruct` overload when there are useful alternative groups of values to extract. Choose them carefully so the intended call is unambiguous. You can also write a `Deconstruct` extension method for a type you do not own. That can be convenient when a library type has many properties but your callers repeatedly need the same small subset. The language's [deconstruction guidance](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/deconstruct) covers both instance and extension methods.

## Discard the values you do not need

If the caller only needs the model and year, it can discard the first value:

```csharp
var (_, model, year) = new Vehicle("Mercedes", "AMG SL43", 2020);
```

The underscore in this declaration says that the first result is intentionally unused. It helps the reader distinguish a deliberate choice from a forgotten variable.

There is a small trap here. This declaration creates a variable whose name is an underscore:

```csharp
var _ = GetVehicle();
```

It does not discard the method's return value. For a standalone discard assignment, write `_ = GetVehicle();` in a scope where `_` is not already a variable. Avoid naming a local `_` and then expecting every later underscore to act as a discard.

## Keep the result small enough to understand

I would normally use a value tuple for two results. Three is already enough to make me consider whether a named type would communicate better. That is my design limit, not the language's element limit.

A long tuple return type can become difficult to read before you even reach the method name and its input parameters. Complex element types make that worse. If the values form a meaningful business concept, give that concept a type and a name. If the group is becoming large, look for a useful name even when the result is only part of an internal operation.

For a small result, named tuple elements and deconstruction can make the caller clear without adding another class. Use that convenience with an understanding of the positional fields, the copy behavior and the method calls underneath it.
