---
title: "Separate State from Behavior? Yes Please!"
description: "Business operations are easier to trace when immutable DTOs carry facts and stateless managers validate inputs and coordinate work through named methods at the call site."
datePublished: 2020-12-05
dateModified: 2026-09-27
hero: separate-state-from-behavior
tags: ["class-design", "data-transfer-objects", "csharp"]
youtube: "https://www.youtube.com/watch?v=srCLY1n0HQI"
repositories:
  - label: MovieServiceYouTube
    url: "https://github.com/matlus/MovieServiceYouTube"
    context: Related implementation
---

I separate the classes that carry information from the classes that do work. An order carries the facts about an order. A manager validates and processes it. That distinction makes it easier to see what can change, which class performs an operation, and where to look when the operation fails.

The system still needs both data and behavior. The design choice is which objects carry them and which objects move through the system.

## Why I Changed My Mind

I used to build the kind of object model that looks natural in a book. A vehicle has a make, a model, and wheels; it can start, accelerate, and brake. So an `Order` holds its details and also saves itself, creates an invoice, and perhaps asks a `Customer` to do more work. I designed systems like that and was proud of them.

As those systems grew, my teammates struggled to find out who did what. I knew the classes and call chains because I had designed them. A new developer debugging a failing order had to discover which objects called which other objects. The design felt easy to me because it was familiar. Familiarity had hidden its complexity.

That experience made me ask a different question: what does the business operation require, and where should a reader find it? An order is information about a transaction. Processing it is work done *with* that information. Those responsibilities need different homes.

The difference between *easy* and *simple* matters here. A skilled developer can follow a complicated call chain quickly because they know every turn. That makes the work easy for them; it does not make the design simple for the team. I learned the distinction by building these systems, hearing the feedback, and trying a different way. Reading a rule gives you information. Trying it on a real requirement is how you find out whether you understand it.

## Two Roles in the Design

**A state-only class carries facts.** Its instance has values such as an order number, customer identifier, and amount. Set those values when the instance is created, then leave them unchanged. It has no business methods that save, delete, validate, or process itself. These immutable objects are often called data transfer objects, or DTOs.

**A behavior-only class performs operations.** Its methods accept the facts they need as arguments and may return new DTOs. It does not retain the current order or customer as mutable instance state between calls. A manager may hold private references to a validator or data store; those are collaborators it uses to do the work, not business facts that accumulate inside it.

Here is a small, illustrative C# example. It shows the roles without depending on any particular framework or repository:

```csharp
public sealed record Customer(int Id, string Name);
public sealed record Order(int CustomerId, string Number, decimal Amount);

internal sealed class OrderManager
{
    private readonly OrderValidator _validator;
    private readonly OrderStore _store;

    public OrderManager(OrderValidator validator, OrderStore store)
    {
        _validator = validator;
        _store = store;
    }

    public void PlaceOrder(Customer customer, Order order)
    {
        _validator.EnsureCanPlace(customer, order);
        _store.Save(order);
    }
}
```

`Customer` and `Order` describe the inputs. The records have values fixed at construction and no business methods. `OrderManager.PlaceOrder` names the operation. It gives the same inputs to the validator, then asks the store to save the order. The example leaves the validation rules and storage implementation out because the class boundary is the point here.

There is a useful distinction in the manager's fields. `_validator` and `_store` are references to behavior collaborators. They do not make the manager a mutable *order*. The manager does not remember a particular customer or order after `PlaceOrder` returns. Its next call can work with different DTOs without depending on the previous call's business data. This is what I mean by stateless behavior, even though the class has private fields.

The constructor supplies those collaborators once so the manager can use them internally. `PlaceOrder` receives the DTOs for the current operation. Passing a validator into a constructor is different from threading a behavior object through several business methods as if it were transaction data.

## What Changes at the Call Site

Imagine giving `Order` methods such as `Save()` and `CreateInvoice()`, then passing it to `Customer` or another object that can call those methods. The resulting call might read `customer.Place(order)`. That line does not show whether `Customer` checks the order, asks the order to save itself, or asks another object to create an invoice. A reader has to follow those calls to learn where the operation happens.

With the separation, the operation starts at a named behavior method: `orderManager.PlaceOrder(customer, order)`. The manager has the whole operation in view. It can validate the two inputs and coordinate the classes that do the next pieces of work. The DTOs can pass from one operation to another without acquiring new values or triggering work of their own.

A validator and a store still have their own jobs. The question is whether responsibility for the *business operation* stays visible. If `Order` calls `Customer`, which calls another object, which eventually saves something, you have to follow the chain to discover who owns the operation. When the manager coordinates those steps, the entry point tells you where to begin.

Think of a team lead coordinating a sprint. Each person does a defined part and reports back. If everyone quietly hands their work to someone else, the lead cannot tell who is responsible for the result. A manager class serves the same coordinating role when an operation involves a customer, an order, validation, and storage. The customer and order supply information; neither has to become the order processor.

## Why Immutability Matters

Separating methods from data is only half the choice. If any caller can change an `Order` after construction, a later operation may receive different facts from the ones an earlier operation saw. A get-only DTO removes that possibility for its own values. To change an order, create a new value and make the transition explicit in a behavior method.

For the simple record above, `with` creates a new `Order`; it does not change the old one:

```csharp
Order revised = order with { Amount = 125m };
```

The guarantee applies to the data the DTO actually contains. If a field points to a mutable object or collection, a get-only property alone does not freeze that object's contents. Choose immutable members too when you need the whole DTO to stay unchanged.

The practical benefit is reasoning. A method receiving an immutable `Order` can read its facts without expecting the order to save itself or silently change its amount. The method may still call a gateway or write to a database; that behavior belongs to an explicitly named collaborator.

## Model the Work, Then Refine It

I model the business requirement. A department may work with customers and orders to complete one operation. In software, a manager can accept their data and coordinate that work. The model stays close to the operation someone actually needs to understand.

This does not require a manager for every noun or a pile of tiny classes on day one. Start with the operation and its data. Extract another behavior class when there is a real responsibility to give it. Single responsibility is useful when a design needs refactoring; it is not a reason to split a simple requirement before you know what the work is.

The point is to make the system simpler for the next person. I call that “Simplicate, don't Complify.” Keeping immutable DTOs and stateless behavior classes distinct reduces the number of surprising places an operation can hide. If the approach sounds too strict, try the same small requirement both ways. Ask another developer to trace the operation and change it. The comparison is more useful than taking my word for it.
