---
title: "Always Use the \"as\" Operator? No Thank You!"
description: "Use a cast instead of `as` when the type is expected, so a mismatch raises InvalidCastException. Use `is` when the type genuinely varies and keep only guards backed by a real case."
datePublished: 2021-01-17
dateModified: 2026-09-25
tags: ["error-handling", "csharp", "type-casting"]
youtube: "https://www.youtube.com/watch?v=buUVmKAFiFo"
repositories:
  - label: MovieServiceYouTube
    url: "https://github.com/matlus/MovieServiceYouTube"
    context: Code examples
---

My argument is about what a cast communicates and when a failed type expectation should throw.

## The Guideline Nobody Questions

Sometimes I catch myself wondering why people reach for the `as` operator instead of a cast. Then I remember: **it makes them feel safer.**

I've been at several companies whose coding standards said it outright, *always use `as`*. I believe Bill Wagner's books carry the same guidance, and it may well all trace back there; that's from many years ago and I won't pretend to remember the exact wording. The reasoning is always the same: `as` doesn't throw, a cast does, and there's usually a performance argument tacked on the end.

I think this is misguided guidance. It isn't practical, it isn't written for the real world, it's theoretical. And it rests on a confusion between two words that are not synonyms.

## Safety Is Not Security

Safety protects you from what you don't expect. You wear a hard hat not because you know a beam is coming, but in case one does. It's precautionary, reactionary, and there's an emotional component to it. Safety is partly about how you *feel*.

Security protects you from what you know is coming. Someone will try the door, so you put a badge reader on it. That's proactive. Software has both: the code in an automobile or a spacecraft goes through a far higher level of security analysis precisely in order to guarantee safety. Will this system behave correctly, at the right time?

`as` is a hard hat. It doesn't prevent the problem, it just means you don't feel the impact at the moment of impact. That's the whole trouble with it: **you end up feeling safer while being less secure.**

One aside before the code. `as` won't consider user-defined conversions, a cast will. I count that as a point in favor of `as`, not against it. If you don't know what a user-defined conversion is, good, you haven't missed anything. Like operator overloading, the feature has been sitting in C++ and C# for years and I wouldn't touch it. The one case where people reach for it is value semantics on reference types, and C# 9 record types hand you that out of the box. Let the compiler's lowering step do the work: automated, seamless, and no room left for misuse.

None of this is peculiar to C#, incidentally. Delphi has `as` and `is` too, they behave the same way, and the guidance I would give a Delphi developer is exactly the guidance here. This is a question about what your code is saying, not about one language's syntax.

Everything that follows assumes you know how `as`, `is` and the cast expression behave. I'm not teaching the mechanics here. It also assumes the code we're looking at lives deep inside the system rather than at its entry points. We lock the front door and we lock the back door, so inside the house the arguments are not null and nobody needs to check.

## Two Methods That Do the Same Thing

Here is the hierarchy. `Employee` is the base, `SoftwareEngineer` and `Accountant` both descend from it, and only `SoftwareEngineer` has a `Role`.

```csharp
public class Employee { }

public class Accountant : Employee { }

public class SoftwareEngineer : Employee
{
    public string Role { get; init; }
}
```

And here are two methods that do the same thing while saying entirely different things.

```csharp
private static void AssignWorkItem1(Employee employee)
{
    var softwareEngineer = employee as SoftwareEngineer;
    Console.WriteLine(softwareEngineer.Role);
}

private static void AssignWorkItem2(Employee employee)
{
    var softwareEngineer = (SoftwareEngineer)employee;
    Console.WriteLine(softwareEngineer.Role);
}
```

Before either implementation, the first thing I'd catch in review is the signature. Why is that parameter an `Employee` and not a `SoftwareEngineer`? If you don't have a good answer, change it. Your public surface is announcing *"I accept any employee"* while your body quietly accepts only one kind. Don't lie to me in the signature, and don't build generalized software for no reason. Fix the parameter type and the ambiguity disappears on the spot.

Sometimes `Employee` genuinely is correct. Polymorphism forces the signature up the hierarchy, or you're in a GUI event handler where `sender` is `object` because a button, a text box or a form could all be on the other end. So let's assume the signature is right and look at the implementations. But if you didn't catch the parameter first, rethink your code review strategy. That's exactly the sort of thing you should be hunting for.

**`AssignWorkItem1` uses `as`**, assigns the result, then calls `.Role` on it with no null check. Read what that code is *saying*. "I'm not confident every employee arriving here is a software engineer," and then it turns around and behaves as though it certainly is. Which is it? I genuinely can't tell what you meant, and you've bought yourself a `NullReferenceException` for the trouble. This is extremely common. Go and look at your own codebase, you'll find `as` after `as` with no null check behind it.

**`AssignWorkItem2` uses a cast**, a hard cast, as I call it. It says one thing only: this is nothing but a software engineer, and if it isn't, throw. You get an `InvalidCastException`.

So which do you prefer? The null reference, or the cast exception? The cast exception, every time. A null reference tells me almost nothing, I have to go and *work out* what was null and why. A type cast exception tells me precisely what went wrong.

And here's the part most people skip. When it throws, the fix is almost never on the line that threw. That line is the symptom. The real question is how a non-software-engineer instance got all the way down here, into code written specifically for software engineers. The fix belongs somewhere up the call chain. Never solve a problem by treating the symptom, find the root cause and stop it occurring at the root.

Which brings us to the reflex fix.

```csharp
var softwareEngineer = employee as SoftwareEngineer;

if (softwareEngineer != null)
{
    Console.WriteLine(softwareEngineer.Role);
}
```

Fine. What goes in the `else`? Sometimes genuinely nothing, and that's a real scenario. But in every case I've run into, the `else` is empty because **the `else` should never have happened in the first place.** An `if` with nothing meaningful behind it isn't a guard, it's a pass-through. The man with no badge walks in through the back door and he's inside the building. That was never what security was for. You haven't solved the problem, you've evaded it, handed it to someone else, further away, with less information. That's a false sense of security, and it's worse than no security at all.

## Why We're All Scared of Exceptions

I learned this the hard way. When I started programming, exceptions were my nightmare. In those days a GUI application would simply fall over, and everyone was petrified of them, me included. So everything I wrote was defensive: whatever it takes, just don't let me see an exception.

That instinct is the wrong one, and I'm convinced it's where "always use `as`" comes from. **Exceptions are there to help you.** They're an early warning signal that something has gone wrong. Get scared of them and you start scattering try/catches and null checks to keep them out of sight, which doesn't remove the fault, it only removes your notification of it.

## A Second Example: Attributes That Can't Be Anything Else

Here's one from real code. The `Genre` enum carries description attributes, because enum fields are single identifiers while the human readable form often is not.

```csharp
public enum Genre
{
    Action,
    Comedy,
    Drama,
    [EnumDescription("Sci-Fi")]
    [EnumDescription("SciFi")]
    SciFi,
    Thriller,
}

[AttributeUsage(AttributeTargets.Field, AllowMultiple = true, Inherited = false)]
internal sealed class EnumDescriptionAttribute(string description) : Attribute
{
    public string Description { get; } = description;
}
```

`GenreParser` builds its lookup tables in a static constructor by walking those fields with reflection. Here is the version I want to pick apart.

```csharp
var enumDescriptionAttributes =
    fieldInfo.GetCustomAttributes(typeof(EnumDescriptionAttribute), false)
    as EnumDescriptionAttribute[];

if (enumDescriptionAttributes != null)
{
    if (enumDescriptionAttributes.Length == 0)
    {
        // fall back to the field name
    }
    else
    {
        // use the descriptions
    }
}
```

Two problems, and they're different in kind.

First, the `as`. You handed that method one specific attribute type, so what comes back **cannot be anything else.** Using `as` there confuses me all over again. Are you telling me it might be some other type and you're just hoping for the best? Cast it. Say what you mean.

Second, the null check. The BCL follows its own guidance that a method returning a collection never returns null, it returns an empty collection. So `enumDescriptionAttributes != null` is never false. That's a branch you can never reach and can never test, sitting in your code implying a possibility that does not exist. Take it out.

Here is what it should be, and is:

```csharp
var enumDescriptionAttributes = (EnumDescriptionAttribute[])fieldInfo
    .GetCustomAttributes(typeof(EnumDescriptionAttribute), false);

if (enumDescriptionAttributes.Length == 0)
{
    StringToGenreMappings.Add(fieldInfo.Name.ToLower(CurrentCulture), genre);
    GenreToStringMappings.Add(genre, fieldInfo.Name);
}
else
{
    GenreToStringMappings.Add(genre, enumDescriptionAttributes[0].Description);

    foreach (var enumDescriptionAttribute in enumDescriptionAttributes)
    {
        StringToGenreMappings.Add(enumDescriptionAttribute.Description.ToLower(CurrentCulture), genre);
    }
}
```

Now compare the two checks, the one that got deleted and the one that stayed, because this is the whole lesson in miniature. The **null check was unreachable**, so it goes. The **length check is reachable and meaningful**, so it stays. `Action`, `Comedy`, `Drama` and `Thriller` carry no attribute at all, and the empty case has a real job to do, falling back to the field name. One check encoded a fear, the other encodes a requirement.

A note on how that changed, because it makes the point better than the tidy version would. When I first talked about this code, the rule was that *every* enum field had to be decorated, and under that rule the length check was unnecessary: if it ever hit zero, the fix was to go back and decorate the enum rather than patch the parser. The code has since moved to a rule where an undecorated field legitimately falls back to its own name, and now the same check earns its place. The check did not change. The requirement did. That is exactly the question to ask of any guard: not "is this defensive," but "which requirement is this encoding, and is that still the requirement?"

That distinction is the one to carry away. Not "checks are bad." Ask what a check is *saying*, and whether the case it describes can actually happen. If it can't, deleting it makes the code more honest, not less safe.

## When I Do Use `is`

Now the legitimate case. `ExceptionToHttpTranslator` has one responsibility, translating a .NET exception into HTTP: set the status code, put the message in the body, and add a header naming the exception type, because the client, itself an internal service, may need to rehydrate an exception of that same type and rethrow it.

```csharp
public static async Task Translate(HttpContext httpContext, Exception exception)
{
    var httpResponse = httpContext.Response;
    httpResponse.Headers["Exception-Type"] = exception.GetType().Name;

    if (exception is MovieServiceBaseException movieServiceBaseException)
    {
        httpContext.Features.Get<IHttpResponseFeature>()!.ReasonPhrase =
            movieServiceBaseException.Reason;
    }

    httpResponse.StatusCode = MapExceptionToStatusCode(exception);
    await httpResponse.WriteAsync(exception.Message);
    await httpResponse.Body.FlushAsync();
}

private static int MapExceptionToStatusCode(Exception exception)
{
    if (exception is MovieServiceNotFoundBaseException)
    {
        return 404;
    }
    else if (exception is MovieServiceBusinessBaseException)
    {
        return 400;
    }

    return 500;
}
```

The entry point takes the `Exception` base class, and here that really is the right signature. Any and every exception in the system arrives through this method, so there's nothing to narrow it to.

Our exceptions all descend from `MovieServiceBaseException`, which forks into a technical branch and a business branch, both broad and flat rather than deep. Only *our* exceptions carry a `Reason`. So to set that header I have to ask whether this particular exception is one of ours, and the type genuinely varies. That is what `is` is for. C# 7 pattern matching does it in one breath, testing and binding together, which is really an `as` with the null check built in, expressed as a single intention rather than two loose steps.

The same question drives the status code. A not-found business exception is a 404, any other business exception is a 400, and everything else, all our technical exceptions and every .NET exception, which I treat as technical, is a 500. Note what the type test is doing here. It isn't guarding against a mistake, it's reading a genuine fact about which kind of failure occurred. The types differ because the situations differ.

That's it. That is very nearly the only place I've used `is` or `as` in years. Everywhere else, I cast.

## Summary

- "Always use `as`" treats a type mismatch as something to suppress. A cast states an expectation and produces a useful `InvalidCastException` if the expectation is wrong.
- Do not replace a clear type failure with a later `NullReferenceException` or an empty branch. Follow the wrong value back to its source and fix the cause.
- Keep checks for cases that can happen, such as an empty attribute array. Remove null branches for values the API guarantees are present.
- Use `is` or pattern matching when the type genuinely varies and the behavior must vary with it. In the other cases, cast.
