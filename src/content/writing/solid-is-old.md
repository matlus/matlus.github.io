---
title: "SOLID IS OLD: Dependency Inversion Needs a Good Abstraction"
description: "Dependency inversion needs domain-owned contracts that hide implementation knowledge. Follow a show query from source dependencies through models to a stored procedure."
datePublished: 2021-02-21
dateModified: 2021-02-21
hero: solid-is-old
tags: ["dependency-inversion", "architecture", "polymorphism", "data-access", "stored-procedures", "csharp"]
youtube: "https://www.youtube.com/watch?v=IZ_7K7XOABM"
repositories:
  - label: MovieServiceYouTube
    url: "https://github.com/matlus/MovieServiceYouTube"
    context: Supplementary examples of domain, data and gateway boundaries
draft: false
---

“We designed the system using SOLID principles.”

Whenever someone tells me that, I still want to see the design. The statement tells me very little about whether the system is understandable, whether its boundaries are useful or whether its abstractions express the problem it is meant to solve.

Put ten people in a room and ask them to explain the principles. You are likely to hear different interpretations. Even when they agree on the words, the implementations can be very different. Reciting an acronym gives us no assurance about the result.

That is the complaint behind **SOLID IS OLD**. Remove S and I, and you have O, L and D: Open/Closed, Liskov Substitution and Dependency Inversion. In the object-oriented designs I care about here, polymorphism does much of the practical work associated with those three ideas.

That observation does not make their formal meanings identical. Substitutability asks more than whether a virtual call can reach a descendant. It asks whether that descendant preserves the expectations of the contract. Nor does every possible form of extension require an inheritance hierarchy. My point is that understanding the actual design mechanisms is more useful than treating the acronym as a guarantee.

I do not give Single Responsibility and Interface Segregation the same prominence as Dependency Inversion. Broad phrases such as “one reason to change” leave too much room for interpretation, and giving a caller the surface it needs should already be part of designing a useful interface. I would rather explain those decisions through code.

Let's concentrate on Dependency Inversion, and on the ingredient that makes it useful: a good abstraction.

## Which dependency are we inverting?

Robert Martin's [Dependency Inversion paper](https://d3s.mff.cuni.cz/f/teaching/nprg043/extras/martin96-dependency_inversion_principle.pdf) makes two connected demands. Higher-level policy and lower-level mechanisms should meet through abstractions. Those abstractions should be independent of implementation detail, with the details conforming to their contracts.

Before applying that idea, we need to agree on *higher-level*, *lower-level* and *dependency*.

In a chain of methods, the levels can be easy to see. One method coordinates a few steps. Each step performs more detailed work, perhaps calling another method that deals directly with a database command or a file. We descend from intention toward mechanism.

At the system level, the position of a box in a diagram can be misleading. A UI is often drawn above a domain layer, with a data layer below it. That does not make the UI the higher-level policy I want to protect.

The domain is the system's purpose. A web UI, desktop UI, console application or service interface can use it. I want to be able to add or replace those entry points without changing the domain. In that sense, the UI is an implementation detail that depends on the domain.

The data layer is closer to the domain in my designs, but it still has a boundary. Think of two rooms within one house: they belong to the same system, yet the doorway still matters. Database details should not spread into the business operations.

## Calls and source references are different arrows

Suppose a domain manager directly uses `SqlShowStore`. The domain calls the store and references that concrete type. Both arrows point toward the SQL implementation.

Introduce a domain-owned contract, `ShowStoreBase`, and have `SqlShowStore` implement it. The domain manager can now reference the contract, while the SQL implementation references that same contract to fulfill it.

At runtime, the domain manager still asks the selected store to do work. We have not made the database call the business operation in reverse. What changed is the direction of the source dependency on the concrete implementation.

![Before inversion, the domain references the SQL store directly. After inversion, the domain and SQL store both reference a domain-owned contract; the runtime call still reaches the selected SQL implementation.](/images/diagrams/design-dependency-inversion.svg)

*New explanatory diagram. Solid arrows show source dependencies; the separate dashed arrow shows runtime dispatch. Keeping these meanings separate avoids “inverting” the wrong relationship.*

Here is a complete small contract and caller for a television application. The model has been reduced to the fields needed for this example:

```csharp
public sealed record Show(int Id, int ChannelId, string Title);

public abstract class ShowStoreBase
{
    public abstract Task<IReadOnlyList<Show>> GetShowsForChannel(int channelId);
}

public sealed class ChannelManager
{
    private readonly ShowStoreBase store;

    public ChannelManager(ShowStoreBase store)
    {
        this.store = store;
    }

    public Task<IReadOnlyList<Show>> GetShowsForChannel(int channelId)
    {
        return store.GetShowsForChannel(channelId);
    }
}
```

`ChannelManager` has no reference to a SQL store, a Cosmos client or an Oracle connection. Some construction code must still create the chosen implementation and supply it. That wiring belongs where the concrete choice is made. It does not need to spread through the callers of `GetShowsForChannel`.

Passing the dependency in the constructor is one way to supply the object. Dependency injection and dependency inversion are separate decisions: passing a concrete `SqlShowStore` would inject a dependency without removing the domain's reference to that concrete type.

## The missing salt

Imagine following a recipe meticulously, then serving a dish that tastes flat. You followed the steps, but an essential ingredient was missing: salt.

I see the same problem in demonstrations of dependency inversion. Someone starts with a concrete dependency, extracts an interface and announces that the design is now correct. The example quietly assumes that the extracted interface was a good abstraction to begin with.

That is the salt. Without it, the procedure does not produce the promised result.

For example, this contract still depends on database details:

```csharp
// Deliberately unsuitable as a domain-facing abstraction.
public interface IShowReader
{
    Task<DbDataReader> Execute(SqlConnection connection, string sql);
}
```

The caller must create a SQL connection, supply a query and interpret a data reader. The interface has moved the declaration of the dependency without removing the knowledge we wanted to contain. A caller cannot use it while remaining ignorant of SQL and the schema.

This is why the second part of Dependency Inversion matters. It gives us a question to ask about the abstraction itself: **does this contract require knowledge of the details it is supposed to hide?**

## Read the signature without looking at the class name

Look again at:

```csharp
Task<IReadOnlyList<Show>> GetShowsForChannel(int channelId);
```

What implementation does it imply?

It describes the domain operation. Given a channel identifier, return its shows. You cannot tell whether the data comes from SQL Server, a service or an in-memory collection, and the caller does not need to know that to understand the request.

`Show` is the domain's model. The business determines what information represents a show. The database schema does not get to dictate that model merely because it stores the information.

The name is also part of the abstraction. A UI-facing facade, a domain manager and a data manager can all use `GetShowsForChannel` when they are serving that same operation. The name need not become `FetchRows` halfway through the system simply because the implementation has reached a database.

Keeping that language consistent makes a request easier to follow. You can recognize the business operation at each boundary without translating a succession of implementation names.

## Follow the request into the database

A SQL implementation must eventually create a connection and a command, execute it, read records and construct the domain models. Those details are necessary. Their location is the design decision.

One useful arrangement gives a command factory the job of creating the command for `GetShowsForChannel`. That command calls a stored procedure with the same name and supplies the channel identifier. The stored procedure performs the joins and returns the columns needed to construct the shows. A reader-to-model adapter maps each returned record into a `Show`.

The public data-manager method still returns shows. It does not hand the caller a reader and ask it to finish the mapping.

Here is a reduced SQL illustration of the stored-procedure boundary. It uses two hypothetical tables so the relationship is visible; it is not a reproduction of a production schema:

```sql
CREATE PROCEDURE dbo.GetShowsForChannel
    @ChannelId int
AS
BEGIN
    SET NOCOUNT ON;

    SELECT s.Id, cs.ChannelId, s.Title
    FROM dbo.ChannelShow AS cs
    INNER JOIN dbo.Show AS s ON s.Id = cs.ShowId
    WHERE cs.ChannelId = @ChannelId;
END;
```

The caller supplies a channel identifier and receives the agreed show data. If the schema later requires more joins, the stored procedure can absorb that change while preserving its result contract.

That protection has a scope. If the business requirement changes, the contract may need to change too. A clean abstraction protects the caller from changes in implementation that leave the required behavior intact. It does not freeze business requirements forever.

Notice the direction of the responsibility. The SQL implementation maps its records into the domain model. The domain is not required to reshape itself into whatever is most convenient for the SQL implementation. That is what it means here for the details to depend on the abstraction.

## You may not need a hierarchy yet

Suppose the current data manager already exposes good domain-centered methods, and SQL Server is the only implementation you need. Must you introduce a base class immediately?

I do not think so. The concrete class already provides an abstraction through its public surface. You can give it clean signatures before there is any reason for polymorphism.

If the requirement changes to use Oracle instead, you might replace the implementation behind that same surface. If the application needs to select between two stores, you can introduce a common base or interface and provide both implementations.

The important preparation was the method design. Extracting an interface from a clean contract preserves a clean contract. Extracting one from a leaky class preserves its leaks.

This is also why I object to inverting every dependency by reflex. A system with a hundred classes does not automatically need roughly another hundred interfaces. More declarations mean more things for people to navigate and maintain. Each one should have a reason.

## Look for the boundaries

![The system boundary encloses Domain Facade surfaces, managers and data managers with their collaborators. The Service Interface Layer and database sit outside. Manager-B and Data Manager-B illustrate the calls to their immediate collaborators.](/images/diagrams/design-system-boundary-source.svg)

*The dashed outline marks the system boundary. The expanded paths from Manager-B and Data Manager-B show the collaborators for those responsibilities. Entry points and storage remain outside that boundary.*

The useful places to pay attention include configuration providers, gateways, email senders and data access. They reach beyond the application's own behavior into files, services, protocols or infrastructure.

A validator that works on supplied data in memory has a different role. It may be a focused static class with no need for an alternative implementation. Treating both situations identically because they both involve a method call misses the reason for the boundary.

I protect the domain and make dependencies flow downward through levels of abstraction. In my arrangement, a service interface uses the Domain Facade. The facade forwards each operation to its manager. Managers use their specialists. A class uses the next level down rather than reaching through several levels to manipulate a distant detail.

That is a design convention with consequences for visibility and physical organization. Keeping implementation classes internal to an assembly can help make the intended entry point the only entry point available to another assembly.

Ports and Adapters, Hexagonal and Onion descriptions address related concerns about boundaries and protecting application policy. I draw dependencies in a downward arrangement because I want the permitted relationships and levels to be obvious. The drawing is useful only when the code respects the relationships it claims to show.

## What makes inversion worthwhile?

Take the contract in isolation. Can you understand it in the domain's language? Do its arguments and results belong to that domain? Can the implementation change without requiring callers to learn its replacement's machinery?

Then decide whether the system needs interchangeable implementations and where their selection belongs.

Those questions are more demanding than extracting an interface, but they are also more useful. A good abstraction gives dependency inversion something worth protecting. Without that ingredient, we have followed the recipe and missed the flavor.
