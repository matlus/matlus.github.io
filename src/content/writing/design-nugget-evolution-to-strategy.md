---
title: "Design Nugget: Evolution To Strategy"
description: "Build a working baseline, then change the design for a concrete benefit; a log parser evolves through a switch, delegates, and Strategy to test that judgment."
datePublished: 2020-05-25
dateModified: 2026-09-23
tags: ["method-design", "csharp", "design-patterns", "strategy-pattern", "delegates"]
youtube: "https://www.youtube.com/watch?v=RozqbM7C5sE"
---

> Written chapter from the YouTube video [Design Nugget: Evolution To Strategy](https://www.youtube.com/watch?v=RozqbM7C5sE).  
> Source code: [matlus/DeisgnNuggetEvolutionToStrategy](https://github.com/matlus/DeisgnNuggetEvolutionToStrategy)

> **Review note:** The code excerpts and their match to the video still need to be checked against the recording and repository. The examples below have not been changed in this prose edit.

Design can be simple and still be hard to explain. A video makes that harder: you can't stop me to ask a question when something isn't clear. That's why I'm starting **Design Nuggets**. Each one is a small exercise in the process of design. I'll start somewhere, build a working version, and show you where the choices lead.

The lessons may be small. That doesn't make them unimportant.

## Requirements

Here's the requirement and the part of it we'll focus on.

<!-- diagram:start requirements-overview -->
<figure class="article-diagram">
<svg class="article-diagram__image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" role="img" aria-labelledby="requirements-overview-t requirements-overview-d">
  <title id="requirements-overview-t">Requirement pipeline &#8212; multi-source logs to Cosmos DB</title>
  <desc id="requirements-overview-d">MS SQL, Web Server, Splunk, and Others converge into Parse to Model, publish to Message Broker, dequeue, store in Cosmos DB.</desc>
  <rect width="1000" height="400" rx="12" fill="var(--diagram-surface)"/>
  <defs>
    <marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--diagram-label)"/></marker>
    <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--diagram-label)"/></marker>
    <!-- wavy document path helper via clip-ish: use path bottoms -->
  </defs>

  <!-- Sources with slight wavy bottoms (simplified document shape) -->
  <g font-family="system-ui,Segoe UI,Helvetica,Arial,sans-serif" font-size="13" fill="var(--diagram-label)" text-anchor="middle">
    <path d="M48 78 h140 v36 q0 10 -20 12 t-50 -4 t-50 4 t-20 -12 z" fill="var(--diagram-artifact)"/>
    <text x="118" y="104">MS SQL Logs</text>

    <path d="M48 138 h140 v36 q0 10 -20 12 t-50 -4 t-50 4 t-20 -12 z" fill="var(--diagram-artifact)"/>
    <text x="118" y="164">Web Server Logs</text>

    <path d="M48 198 h140 v36 q0 10 -20 12 t-50 -4 t-50 4 t-20 -12 z" fill="var(--diagram-artifact)"/>
    <text x="118" y="224">Splunk Logs</text>

    <!-- Others as stacked sheets -->
    <path d="M56 270 h140 v34 q0 8 -18 10 t-52 -3 t-52 3 t-18 -10 z" fill="var(--diagram-worker)" opacity="0.55"/>
    <path d="M52 262 h140 v34 q0 8 -18 10 t-52 -3 t-52 3 t-18 -10 z" fill="var(--diagram-worker)" opacity="0.75"/>
    <path d="M48 254 h140 v36 q0 10 -20 12 t-50 -4 t-50 4 t-20 -12 z" fill="var(--diagram-worker)"/>
    <text x="118" y="280">Others</text>
  </g>

  <!-- converging curves -->
  <g fill="none" stroke-width="2.2" opacity="0.95">
    <path d="M188 100 C250 100, 270 198, 320 205" stroke="var(--diagram-artifact)"/>
    <path d="M188 160 C255 160, 280 200, 320 205" stroke="var(--diagram-artifact)"/>
    <path d="M188 220 C255 220, 285 210, 320 205" stroke="var(--diagram-artifact)"/>
    <path d="M188 275 C250 275, 285 220, 320 205" stroke="var(--diagram-worker)"/>
  </g>

  <!-- Parse to Model -->
  <rect x="320" y="178" width="150" height="54" rx="4" fill="var(--diagram-ok)"/>
  <text x="395" y="210" fill="var(--diagram-surface)" font-family="system-ui,Segoe UI,sans-serif" font-size="14" font-weight="700" text-anchor="middle">Parse to Model</text>

  <!-- Publish Message -->
  <line x1="470" y1="205" x2="545" y2="205" stroke="var(--diagram-label)" stroke-width="2" marker-end="url(#a)"/>
  <text x="508" y="228" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="11" text-anchor="middle">Publish Message</text>

  <!-- Message Broker (striped) -->
  <g>
    <rect x="550" y="168" width="170" height="74" rx="3" fill="var(--diagram-artifact)"/>
    <rect x="568" y="176" width="12" height="58" fill="var(--diagram-fail)" opacity="0.55"/>
    <rect x="590" y="176" width="12" height="58" fill="var(--diagram-fail)" opacity="0.55"/>
    <rect x="612" y="176" width="22" height="58" fill="var(--diagram-artifact)"/>
    <rect x="644" y="176" width="12" height="58" fill="var(--diagram-fail)" opacity="0.55"/>
    <rect x="666" y="176" width="12" height="58" fill="var(--diagram-fail)" opacity="0.55"/>
    <rect x="688" y="176" width="12" height="58" fill="var(--diagram-fail)" opacity="0.55"/>
    <text x="635" y="212" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="13" font-weight="700" text-anchor="middle">Message Broker</text>
  </g>

  <!-- bidirectional to dequeuer -->
  <line x1="720" y1="200" x2="760" y2="200" stroke="var(--diagram-label)" stroke-width="2"/>
  <polygon points="720,200 728,196 728,204" fill="var(--diagram-label)"/>
  <polygon points="760,200 752,196 752,204" fill="var(--diagram-label)"/>

  <rect x="765" y="178" width="100" height="54" rx="4" fill="var(--diagram-artifact)"/>
  <text x="815" y="201" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="11" font-weight="700" text-anchor="middle">Message</text>
  <text x="815" y="217" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="11" font-weight="700" text-anchor="middle">Dequeuer</text>

  <line x1="865" y1="205" x2="900" y2="205" stroke="var(--diagram-label)" stroke-width="2" marker-end="url(#a2)"/>

  <!-- Cosmos DB cylinder -->
  <g>
    <ellipse cx="940" cy="178" rx="42" ry="14" fill="var(--diagram-worker)"/>
    <rect x="898" y="178" width="84" height="50" fill="var(--diagram-worker)"/>
    <ellipse cx="940" cy="228" rx="42" ry="14" fill="var(--diagram-worker)"/>
    <ellipse cx="940" cy="178" rx="42" ry="14" fill="var(--diagram-worker)"/>
    <text x="940" y="210" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="12" font-weight="700" text-anchor="middle">Cosmos DB</text>
  </g>

  <text x="24" y="380" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="11">D1 · video ~0:50–2:00 (clean recreation of requirement pipeline slide)</text>
</svg>
<figcaption>Requirements overview: log sources flow into a parser, produce models, then a store</figcaption>
</figure>
<!-- diagram:end requirements-overview -->

We have multiple sources of data, and the piece in the middle needs to **parse** what comes from each one. The sources have different formats and produce different models. The classes we parse the data into differ too. We may add more sources later. For now, there are three.

We're building that middle piece: parse the logs and produce the model that belongs to each source. The models will eventually be persisted, but the store is outside the problem I'm exploring here.

## The Process

Before you read my implementation, think about how you would solve it. You might even write your own version.

I've used this process for years. Experience can make it tempting to skip straight to an answer, but working through the problem exposes things I would otherwise miss.

Some problems may need only a mental exercise. If you're new to design, though, write the code. Even after decades of experience, I still get value from doing that.

The process is: **establish a baseline**.

It's easy to imagine a design and end up somewhere in outer space, disconnected from the requirement. Let your imagination go when you first see the problem. Then **write the code**. A design you can run and inspect teaches you more than one that lives only in your head.

The baseline is the simplest *functional* form of the solution.

You may already be imagining multithreading or a producer-consumer pattern. Start with the baseline and see how it performs before adding either one.

I'll show you my baseline. Whether yours looks the same or not, we can use it as a concrete starting point.

> Before reading on, try building your own baseline.

Listening to me, reading books, and attending conferences can help. Experience comes from doing the experiment, learning from it, and doing it again.

## Log Sources

I'll start with the pieces that remain the same across these implementations.

The `LogSource` enum tells us where the data came from:

- **MSSQL:** SQL Server logs
- **NCSA:** web server logs
- **Splunk:** for this exercise, exception-style logs

NCSA is the common, W3C-related log format for web servers such as IIS and Apache when they claim conformance. They don't have to conform, but I call this source NCSA even when I refer to it more generally as "web server logs."

Splunk houses and parses application logs. Here it's another source of data. You decide the schema, so in that sense it's schema-less. For this exercise I've chosen my own shape for the data I log there, and that's what we'll parse.

Those are our three sources.

## Log Models

Now consider the models the logs are parsed into. `MsSqlLogInfo` descends from a base class in the later versions, but that base class is **not required** for the baseline. Your models don't need to inherit just to get started.

I'm not a big fan of model hierarchies merely to share properties. Whether two properties or ten happen to be common, each model still has its own details.

I don't use inheritance for extension. Putting two shared properties in a base class and five or ten more on each descendant is exactly that kind of extension.

The base class does become useful in later iterations, for a different reason.

<!-- audit-allow: Their exact fields aren't the point here. -->
Each model has different properties. Their exact fields aren't the point here. MSSQL has one shape. NCSA includes dates and HTTP details such as method, URI stem, and status code. For this example I use Splunk for exceptions, so I call its model `SplunkExceptionLogInfo`. I parse the exception information logged there into that model.

Data comes in from different sources. The system parses each source into its corresponding model. Those models eventually persist somewhere, but that step isn't our focus.

The models and enum stay consistent as the parsing implementation changes. The enum tracks the sources. The models don't change merely because we change how we parse.

With those pieces in place, let's build the baseline.

## Solution Structure

The [GitHub repository](https://github.com/matlus/DeisgnNuggetEvolutionToStrategy) contains four versions of the solution. Its structure will help you follow the progression:

Common pieces live outside the implementations: enums, exceptions, models. Those are shared.

Then each implementation has its own folder:

- `BaselineImplementation`
- `IntermideateImplementation` (intermediate)
- `IntermideateImplementation2` (delegates)
- `FinalImplementation` (strategy)

We move from the baseline to a final Strategy implementation. You could take it further, but please don't do that without a reason.

The shared pieces stay in place while the implementation changes.

## Baseline Implementation

Now that we have the models and enum, look at the baseline implementation.

Each version has client code that calls into it. The examples below show the parsing implementation, **not** that call site.

I named the class `BaselineParseLogic`. It's not a name I'd necessarily choose in production, but it distinguishes this version from the others.

### Parse Logic

The `Parse` method takes log content. That could be one record, many records, or an entire file. In a real system, you have to decide how you ingest from SQL Server, Splunk, and the web servers.

For now, set aside *how* the data arrives. The string might hold a whole file or a chunk, but assume it contains complete records rather than partial lines.

### Determine Source

First, inspect the raw content to determine its source. The formats differ, so something must recognize SQL Server, NCSA, or Splunk exception logs. `DetermineLogSource` returns a `LogSource` value.

Once we have that value, the simplest next step is a switch.

There's a separate question about when to use a switch rather than if-then-else. I'll leave that for another discussion.

For SQL Server, call the method that parses MSSQL logs and returns the log info. I'm treating the result as one record for simplicity, though it could be a collection.

Then persist the model with a separate method. Both parsing and persistence differ by source because the models differ.

You could make this more generic later. This is the **baseline**: bare bones, first principles, no magic, no polymorphism, and no generics.

<!-- Source: DeisgnNuggetEvolutionToStrategy/BaselineImplementation/BaselineParseLogic.cs -->
```csharp
internal sealed class BaselineParseLogic
{
    public void Parse(string logContent)
    {
        var logSource = DetermineLogSource(logContent);

        switch (logSource)
        {
            case LogSource.MsSql:
                var msSqlLogInfo = ParseMsSqlLogs(logContent);
                PersistMsSqlLogModel(msSqlLogInfo);
                break;
            case LogSource.Ncsa:
                var ncsaLogInfo = ParseNcsalLogs(logContent);
                PersistNcsaLogModel(ncsaLogInfo);
                break;
            case LogSource.Splunk:
                var splunkExceptionLogInfo = ParseSplunkLogs(logContent);
                PersistSplunkExceptionLogModel(splunkExceptionLogInfo);
                break;
        }
    }

    private static LogSource DetermineLogSource(string logContent)
    {
        throw new NotImplementedException();
    }

    private static MsSqlLogInfo ParseMsSqlLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static NcsaLogInfo ParseNcsalLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static SplunkExceptionLogInfo ParseSplunkLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static void PersistMsSqlLogModel(MsSqlLogInfo msSqlLogInfo)
    {
        throw new NotImplementedException();
    }

    private static void PersistNcsaLogModel(NcsaLogInfo ncsaLogInfo)
    {
        throw new NotImplementedException();
    }

    private static void PersistSplunkExceptionLogModel(SplunkExceptionLogInfo splunkExceptionLogInfo)
    {
        throw new NotImplementedException();
    }
}
```

### Simple Implementation

The example leaves the parsing details unimplemented because I want to show the *flow*: determine the source, parse for that source, then persist its model. All three steps live in one class.

Once those methods are implemented and tested, this may be all the design you need. You don't have to move to another version just because one exists.

## When Do You Stop?

When do you need SOLID and the rest? That's a subject for another chapter. For now, stay focused:

**If the implementation meets the requirement and is understandable, you can stop here.**

We often complicate designs because of a *what-if*, a *just in case*, or a desire to show what we can build. None of those is the requirement.

If it works and people can maintain it, that's what matters. Not my ego, yours, or anyone else's. Think about the next person who has to change this system, or about yourself ten years from now, returning to C# and wondering what this code does.

Design isn't a contest with your past self.

> Design is keeping it simple. Design is a deductive process, not an additive one.

The client gives you a requirement. Your job is to **Simplicate, don't Complify.**

This is the simplest implementation. I can see shortcomings in it, but if those shortcomings don't matter here, I can live with them.

Write tests that cover the feature. One class is fine. The tests let you and your colleagues verify that it meets the scenarios and expectations.

## Problems With the Baseline

Look at the baseline and consider what might cause trouble. Here's what I see.

Everything is in one place: source detection, parsing for each source, and persistence for each model.

Is that a problem? You might invoke single responsibility and split the class. I wouldn't do it for that reason alone. The code is clear, and splitting it would add moving parts. I want a concrete benefit before taking that step.

There are no objects dancing around, just methods. You can test the behavior without testing every method directly. If you later move the parsing or persistence logic to another class, the logic and its required behavior remain the same.

### The Name Lies a Little

The method is called `Parse`, but it also persists the result. The name hides that second action. `ParseAndPersist` would at least tell the truth, but I prefer to separate those actions at the call site.

I want the call site to say *parse*, then *persist*.

In the baseline, A calls B, and B calls C. The caller invokes `Parse`, and `Parse` also persists. Looking at the caller, you can't see that persistence happened.

I don't like work disappearing down a chain of calls. From the starting point, I want to see what the system does.

I'd rather have A call B, then C, then D. That's **orchestration**: the top level shows the *what* without burying actions in deeper calls. Determine and parse can remain together for now. Persistence should be visible as its own step.

The parsing logic itself can remain the same. We're changing where the steps are coordinated, not what each step does.

That leads to the next implementation.

## Intermediate Implementation

The intermediate version makes that separation.

`Parse` still takes log content as a string. Now it returns a `LogInfoBase`: it determines the source, switches on it, and returns the parsed model. Persistence moves to the caller.

<!-- Source: DeisgnNuggetEvolutionToStrategy/IntermideateImplementation/IntermeateParseLogic.cs -->
```csharp
internal sealed class IntermideateParseLogic
{
    public LogInfoBase Parse(string logContent)
    {
        var logSource = DetermineLogSource(logContent);
        switch (logSource)
        {
            case LogSource.MsSql:
                return ParseMsSqlLogs(logContent);                    
            case LogSource.Ncsa:
                return ParseNcsalLogs(logContent);                    
            case LogSource.Splunk:
                return ParseSplunkLogs(logContent);
            default:
                throw new LogSourceNotSupportedException("The Log Content provided is not an expected Log Source format");
        }
    }

    private static LogSource DetermineLogSource(string logContent)
    {
        throw new NotImplementedException();
    }

    private static MsSqlLogInfo ParseMsSqlLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static NcsaLogInfo ParseNcsalLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static SplunkExceptionLogInfo ParseSplunkLogs(string logContent)
    {
        throw new NotImplementedException();
    }
}
```

### A C# Nuance I Hate

Here's a C# detail I dislike. The previous method returned `void`, so the switch didn't need a default. This one returns `LogInfoBase`, and the compiler requires a return or throw on every path. It can't infer that my `DetermineLogSource` implementation would throw for unsupported content.

So I have to include a default case. Why does that bother me?

**I can never test that line through this implementation.** `DetermineLogSource` either returns one of the supported values or throws. If it throws, the switch never runs. The compiler still requires the default.

### Simplify

The switch remains, but this class only parses. The caller can invoke `Parse` and then persist the returned model. That's the separation I wanted; we can leave persistence outside this example.

We've *removed* persistence from this class. For me, that is design: take away what doesn't belong and make the remaining purpose clearer.

Now we can ask whether the switch itself should change.

## Intermediate 2: Delegates

The next version keeps the parse methods and `DetermineLogSource`. It changes how we select a parser.

I use a dictionary keyed by `LogSource`. Each value is a delegate: a method that takes a string and returns `LogInfoBase`. The parse methods share that signature.

<!-- Source: DeisgnNuggetEvolutionToStrategy/IntermideateImplementation2/IntermideateParseLogic2.cs -->
```csharp
internal sealed class IntermideateParseLogic2
{
    private readonly Dictionary<LogSource, Func<string, LogInfoBase>> parsersDictionary = new Dictionary<LogSource, Func<string, LogInfoBase>>
    {
        {LogSource.MsSql, ParseMsSqlLogs },
        { LogSource.Ncsa, ParseNcsalLogs },
        { LogSource.Splunk, ParseSplunkLogs }
    };

    public LogInfoBase Parse(string logContent)
    {
        var logSource = DetermineLogSource(logContent);
        var parseMethod = parsersDictionary[logSource];
        return parseMethod(logContent);
    }

    private static LogSource DetermineLogSource(string logContent)
    {
        throw new NotImplementedException();
    }

    private static MsSqlLogInfo ParseMsSqlLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static NcsaLogInfo ParseNcsalLogs(string logContent)
    {
        throw new NotImplementedException();
    }

    private static SplunkExceptionLogInfo ParseSplunkLogs(string logContent)
    {
        throw new NotImplementedException();
    }
}
```

### Poor Man's Polymorphism

I call this **poor man's polymorphism**.

Classical polymorphism often brings a hierarchy: a base class, descendants, and the decisions that come with them. Delegates can give me the behavior I need without creating that hierarchy. Three methods share a signature, and I can select and call one of them uniformly.

The shared signature alone isn't enough. What matters is how the **call site** uses it: I call one shape of method without handling each implementation separately. I don't need to know whether I got A, B, or C.

That's where the benefit lies. A hierarchy by itself doesn't give the call site that simplicity.

The dictionary maps each enum value to its parse method. After determining the source, we look up the delegate and call it. If delegates are unfamiliar, I cover them in a separate video.

The dictionary gives us a `Func<string, LogInfoBase>`: a method that accepts the log content and returns a model. We call it and return its result.

### When Teammates Struggle, Rewrite

Years on small teams can make you very comfortable with your own code. You know where everything is because you wrote it.

On a larger team, I have to ask whether other people will understand it. If someone struggles, I treat that as a problem with the code's shape. I want to know exactly where they got lost.

I can explain my design, but an explanation won't help the next reader who wasn't in the room. If someone asks, "What's going on here?", I may **rewrite** the code so that the explanation is no longer necessary.

Keep it simple for the people who have to read it.

### Simple Is Not Easy

> Simple is not easy.

I'll return to that throughout this series. The opposite of simple is complex. The opposite of easy is difficult or hard.

Something can be simple in structure and still be difficult for you because you've never done it. I may find it easy because I've done it a thousand times. Familiarity doesn't determine complexity.

Conversely, a complicated design may feel easy to me because I know it so well. That doesn't make it simple.

As a designer or architect, I want to **simplicate**. I've seen people take a simple problem and make its implementation complicated.

I can explain a shopping cart in thirty seconds, or perhaps a minute.

**Why does it take twenty or fifty classes to build me one?**

Simplifying is hard. It may be the hardest work you do in software design. That's still the direction I want to go.

Back to the dictionary: we retrieve the delegate, call it with the log content, and return the model. I don't need a separate call path for each parser. I'm treating *methods* uniformly.

Everything else stays the same. I've largely replaced the switch with a lookup. There may be no practical benefit in this small example. I wanted to show how delegates can provide this behavior, and I prefer how this version reads.

It also makes the orchestration easy for me to read: determine the source, get the parse method, return its result. I can test that behavior, and I can understand the sequence in three lines.

I don't want readers to hold too many moving parts in their heads. Perhaps you can follow a more elaborate design easily; the next person may not.

When you design a system, it feels obvious to you. Then I arrive and have to reconstruct it. If I struggle, take that as a **signal to reconsider the design**.

Now let's see what changes when we introduce Strategy.

## Final Implementation: Strategy

The final version introduces the Strategy pattern.

The baseline and both intermediate versions each used one class. The final version uses more. What do those extra classes buy us?

<!-- diagram:start strategy-structure -->
<figure class="article-diagram">
<svg class="article-diagram__image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 480" role="img" aria-labelledby="strategy-structure-title strategy-structure-desc">
  <title id="strategy-structure-title">Final implementation &#8212; strategy structure</title>
  <desc id="strategy-structure-desc">LogParserContext selects among LogParseStrategyMsSql, Ncsa, and Splunk; each strategy has a format-invalid exception.</desc>
  <rect width="920" height="480" fill="var(--diagram-surface)" rx="12"/>
  <text x="32" y="36" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="18" font-weight="600">Final implementation &#8212; strategy structure</text>
  <text x="32" y="58" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Baseline / intermediates: one class · Final: context + strategies (+ format exceptions)</text>

  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--diagram-validation)"/>
    </marker>
  </defs>

  <!-- Context -->
  <rect x="300" y="90" width="320" height="70" rx="10" fill="var(--diagram-ok)"/>
  <text x="460" y="120" fill="var(--diagram-surface)" font-family="system-ui,Segoe UI,sans-serif" font-size="16" font-weight="700" text-anchor="middle">LogParserContext</text>
  <text x="460" y="142" fill="var(--diagram-surface)" font-family="system-ui,Segoe UI,sans-serif" font-size="11" text-anchor="middle">Parse(log) · DetermineLogSource · switch → strategy</text>

  <!-- arrows down -->
  <path d="M360 160 C360 200, 160 200, 160 230" stroke="var(--diagram-validation)" stroke-width="2" fill="none" marker-end="url(#arr)"/>
  <path d="M460 160 V230" stroke="var(--diagram-validation)" stroke-width="2" fill="none" marker-end="url(#arr)"/>
  <path d="M560 160 C560 200, 760 200, 760 230" stroke="var(--diagram-validation)" stroke-width="2" fill="none" marker-end="url(#arr)"/>

  <!-- Strategies -->
  <g font-family="system-ui,Segoe UI,sans-serif" text-anchor="middle">
    <rect x="50" y="240" width="220" height="70" rx="8" fill="var(--diagram-artifact)"/>
    <text x="160" y="270" fill="var(--diagram-label)" font-size="13" font-weight="600">LogParseStrategyMsSql</text>
    <text x="160" y="292" fill="var(--diagram-label)" font-size="11" opacity="0.9">Parse · IsLogFormatValid</text>

    <rect x="350" y="240" width="220" height="70" rx="8" fill="var(--diagram-artifact)"/>
    <text x="460" y="270" fill="var(--diagram-label)" font-size="13" font-weight="600">LogParseStrategyNcsa</text>
    <text x="460" y="292" fill="var(--diagram-label)" font-size="11" opacity="0.9">Parse · IsLogFormatValid</text>

    <rect x="650" y="240" width="220" height="70" rx="8" fill="var(--diagram-fail)"/>
    <text x="760" y="270" fill="var(--diagram-label)" font-size="13" font-weight="600">LogParseStrategySplunk</text>
    <text x="760" y="292" fill="var(--diagram-label)" font-size="11" opacity="0.9">Parse · IsLogFormatValid</text>
  </g>

  <!-- Exceptions lightly -->
  <g font-family="system-ui,Segoe UI,sans-serif" text-anchor="middle" fill="var(--diagram-line)" font-size="10">
    <rect x="60" y="340" width="200" height="36" rx="6" fill="var(--color-surface-sunken)" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="160" y="362">MsSqlLogFormatInvalidException</text>
    <rect x="360" y="340" width="200" height="36" rx="6" fill="var(--color-surface-sunken)" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="460" y="362">NcsaLogFormatInvalidException</text>
    <rect x="660" y="340" width="200" height="36" rx="6" fill="var(--color-surface-sunken)" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="760" y="362">SplunkLogFormatInvalidException</text>
  </g>
  <path d="M160 310 V340" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M460 310 V340" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="3 3"/>
  <path d="M760 310 V340" stroke="var(--diagram-line)" stroke-width="1" stroke-dasharray="3 3"/>

  <text x="32" y="420" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Returns LogInfoBase to the call site (persist at caller).</text>
  <text x="32" y="450" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="11">From FinalImplementation folder structure in the video.</text>
</svg>
<figcaption>Strategy structure: LogParserContext and LogParseStrategy classes</figcaption>
</figure>
<!-- diagram:end strategy-structure -->

Set the three exception classes aside. We still have four classes instead of one. Whether that helps depends on what is likely to change.

Will we add more sources? Will we use parsers from third parties? Suppose we use a SQL Server parser from Microsoft and an NCSA parser from another vendor. They may have different interfaces and unrelated class hierarchies. We still need to use both.

This implementation can accommodate that situation.

If you *know* more sources or independent parsers are coming, this may be a useful direction for the parsing logic.

What's wrong with adding one more switch case and an enum value instead? Nothing.

Of course, someone could object on SOLID grounds.

### A Dig at SOLID

Uncle Bob might say the baseline violates open-closed or single responsibility. My answer, in this situation:

**I don't care.**

I care whether the code works and whether people can understand and maintain it. I don't need to call the baseline wrong because it doesn't follow a principle in the way someone expects. I'm being practical, not chasing an abstract "best design."

<!-- audit-allow: That history isn't the point of this example. -->
The individual ideas behind SOLID have a history of their own. Bob Martin brought them together; Michael Feathers reordered the initials into SOLID. That history isn't the point of this example.

Even Bob Martin will tell you that SOLID isn't the end goal at every step. Design has to serve the problem in front of you. Adding classes just to satisfy a principle may make the design harder to work with.

Suppose we do know that new sources are coming. What changes when we add one?

In the baseline, we add an enum value, a switch case, and methods to parse and persist the new model. Those methods have to exist somewhere regardless of the design.

Someone may object that changing both the enum and the parser violates open-closed, or that touching the enum forces other classes to recompile. I understand the objection. I still want to weigh its practical cost against the cost of adding a larger design.

I don't follow SOLID as a rule that overrides the needs of this system.

### LogParserContext

The entry point is `LogParserContext`. Here "context" refers to the **Strategy pattern**, not ASP.NET. I've covered Strategy separately. The Gang of Four presentation uses a shared strategy hierarchy. I don't use or recommend that presentation here. I use another shape hinted at there, one that doesn't require the parsers to share a base type.

In this version, the context is the doorway. The caller invokes `LogParserContext.Parse` and receives a model. The context knows about the MSSQL, NCSA, and Splunk strategies; the caller doesn't have to. Whether one parser or ten sit behind that entry point, the call remains the same.

When a team shares an understanding of a pattern, its name can communicate the broad shape quickly. That only works if we mean the same thing by "Strategy." The name cannot replace readable code.

If I join your team and recognize the pattern, I have a starting point. I can learn the details after I understand the shape.

The context still resembles the switch-based intermediate version. It only parses; the caller persists. The difference is that each parser lives in a separate class, potentially one supplied by a third party.

The reason I prefer this form of Strategy is that **the parsers don't need a shared hierarchy**. They may have one, but it isn't required. That matters if the SQL Server and NCSA parsers come from different vendors or packages.

Imagine a Microsoft parser for SQL Server, another vendor's parser for NCSA, and our own parser for Splunk. I want the system to work with those independent pieces.

> How would you bring those parsers together without changing their classes?

You could keep your own hierarchy and wrap the third-party types. Your `Parse` method could call whatever method each vendor provides. That works, but I don't want the additional ceremony here.

This context hides the parsers from the caller without requiring the parsers themselves to form a family.

My three classes happen to use the name `Parse`, but they don't have to. The context returns a value, so it includes that default case again.

### Parsers Know Their Own Format

Each parser should be able to recognize its own format. The SQL Server parser validates SQL Server logs; the NCSA parser validates NCSA logs; and so on.

I've moved that knowledge into the strategy classes. The context asks them whether they recognize the content, then returns the matching source.

Earlier, source detection lived apart from parsing. Here each parser exposes `IsLogFormatValid`. Its `Parse` method checks the format before parsing and returning a model, or throws when the content is invalid. That lets the context ask each parser: *Is this your format?*

The caller uses `LogParserContext.Parse`, receives a `LogInfoBase`, and then persists the result.

<!-- Source: DeisgnNuggetEvolutionToStrategy/FinalImplementation/LogParserContext.cs -->
```csharp
internal static class LogParserContext
{
    public static LogInfoBase Parse(string logContent)
    {
        var logSource = DetermineLogSource(logContent);

        switch (logSource)
        {
            case LogSource.MsSql:
                return LogParseStrategyMsSql.Parse(logContent);
            case LogSource.Ncsa:
                return LogParseStrategyNcsa.Parse(logContent);
            case LogSource.Splunk:
                return LogParseStrategySplunk.Parse(logContent);
            default:
                throw new LogSourceNotSupportedException("The Log Content provided is not an expected Log Source format");
        }
    }

    private static LogSource DetermineLogSource(string logContent)
    {
        if (LogParseStrategyMsSql.IsLogFormatValid(logContent))
        {
            return LogSource.MsSql;
        }
        else if (LogParseStrategyNcsa.IsLogFormatValid(logContent))
        {
            return LogSource.Ncsa;
        }
        else if (LogParseStrategySplunk.IsLogFormatValid(logContent))
        {
            return LogSource.Splunk;
        }

        throw new LogSourceNotSupportedException("The Log Content provided is not an expected Log Source format");
    }
}
```

<!-- Source: DeisgnNuggetEvolutionToStrategy/FinalImplementation/LogParseStrategyMsSql.cs -->
```csharp
internal static class LogParseStrategyMsSql
{
    public static MsSqlLogInfo Parse(string logContent)
    {
        EnsureLogFormatIsValid(logContent);
        throw new NotImplementedException();
    }

    private static void EnsureLogFormatIsValid(string logContent)
    {
        if (!IsLogFormatValid(logContent))
        {
            throw new MsSqlLogFormatInvalidException("The log content is not valid format for an MS SQL Log file");
        }            
    }

    public static bool IsLogFormatValid(string logContent)
    {
        throw new NotImplementedException();
    }
}
```

### Naming Convention

One more detail matters to me: the names of the three parser classes.

<!-- diagram:start strategy-naming -->
<figure class="article-diagram">
<svg class="article-diagram__image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 420" role="img" aria-labelledby="strategy-naming-title strategy-naming-desc">
  <title id="strategy-naming-title">Strategy naming convention</title>
  <desc id="strategy-naming-desc">LogParseStrategy* prefix keeps related strategy classes grouped together in Solution Explorer.</desc>
  <rect width="780" height="420" fill="var(--diagram-surface)" rx="12"/>
  <text x="32" y="36" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="18" font-weight="600">Naming convention &#8212; strategies stay grouped</text>
  <text x="32" y="58" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Prefix pattern: LogParseStrategy + Source</text>

  <!-- Explorer panel -->
  <rect x="40" y="90" width="340" height="280" rx="8" fill="var(--color-surface-sunken)" stroke="var(--color-border)"/>
  <text x="56" y="118" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Solution Explorer · FinalImplementation</text>
  <line x1="56" y1="130" x2="360" y2="130" stroke="var(--color-border)"/>

  <g font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13">
    <text x="64" y="158" fill="var(--diagram-line)">▾ FinalImplementation</text>
    <text x="84" y="186" fill="var(--diagram-ok)">📄 LogParserContext.cs</text>
    <rect x="76" y="200" width="280" height="28" rx="4" fill="var(--diagram-ok-fill)"/>
    <text x="84" y="220" fill="var(--diagram-ok)">📄 LogParseStrategyMsSql.cs</text>
    <rect x="76" y="234" width="280" height="28" rx="4" fill="var(--diagram-ok-fill)"/>
    <text x="84" y="254" fill="var(--diagram-ok)">📄 LogParseStrategyNcsa.cs</text>
    <rect x="76" y="268" width="280" height="28" rx="4" fill="var(--diagram-ok-fill)"/>
    <text x="84" y="288" fill="var(--diagram-ok)">📄 LogParseStrategySplunk.cs</text>
    <text x="84" y="322" fill="var(--diagram-line)" font-size="11">📄 *LogFormatInvalidException.cs</text>
  </g>

  <!-- Callout -->
  <rect x="420" y="120" width="320" height="220" rx="10" fill="var(--color-surface-sunken)" stroke="var(--diagram-artifact)" stroke-width="1.5"/>
  <text x="440" y="155" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="14" font-weight="600">Why this order?</text>
  <text x="440" y="185" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="13">Not MsSqlLogParser&#8230;</text>
  <text x="440" y="210" fill="var(--diagram-label)" font-family="ui-monospace,Menlo,monospace" font-size="13">LogParseStrategyMsSql</text>
  <text x="440" y="235" fill="var(--diagram-label)" font-family="ui-monospace,Menlo,monospace" font-size="13">LogParseStrategyNcsa</text>
  <text x="440" y="260" fill="var(--diagram-label)" font-family="ui-monospace,Menlo,monospace" font-size="13">LogParseStrategySplunk</text>
  <text x="440" y="295" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Same prefix ⇒ they sort together.</text>
  <text x="440" y="318" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="12">Name signals “these are strategies.”</text>

  <text x="32" y="400" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="11">Matches the naming beat in the chapter / video.</text>
</svg>
<figcaption>Strategy naming convention: LogParseStrategy classes grouped together</figcaption>
</figure>
<!-- diagram:end strategy-naming -->

The names `LogParseStrategyMsSql`, `LogParseStrategyNcsa`, and `LogParseStrategySplunk` group together in Solution Explorer. I can find them and see their relationship at a glance.

I've also named classes the other way, such as `MsSqlLogParser`. Here I use `LogParseStrategy` plus the source, and `Context` for the entry point. It's a little wordy, but it tells readers what these classes do and that they have siblings.

Those are the four implementations. The important question now is when to stop moving from one to the next.

## Why the Baseline Matters

The baseline gives you a platform to stand on. Once it works, you can ask what problem another version would solve. Is it too slow? Is it hard to maintain? Do you know that more sources are coming? A change should buy you something concrete.

If the system doesn't need exceptional performance, don't invent machinery to provide it. If the baseline meets the requirement, it may be enough.

If you *know* these will remain the only three sources, the baseline may be all you need.

> Keep it simple.

You've heard KISS: "keep it simple, stupid." I prefer to stop at "keep it simple."

Starting with a collection of interfaces and classes just to apply SOLID misses the point. Bob Martin has also said not to apply it indiscriminately from the start. Use it when the design needs it.

Design for what you know now. Don't build for more sources merely because they might arrive someday. Keeping it simple means leaving out what you don't need yet.

### Recognize Flaws, Then Do Nothing Until Required

Recognize the baseline's shortcomings. A good designer sees the flaws without assuming they all need to be fixed immediately.

Suppose the implementation works and the tests pass. Saying "single responsibility, let's rip it apart" isn't enough. What actual problem will the change solve?

Ask whether each flaw matters *here*, in this system, for this team, right now. All the logic sits in one class. So what? If moving to a later version brings no value, stay with the baseline.

Design Nuggets aren't just a tour of techniques. I want you to see when a technique is worth using. Simplify and remove where you can. Know what you *would* do if circumstances changed, without building for those circumstances today.

> The mark of a good designer is recognizing the problem and doing nothing about it until required.

That restraint is a design decision.

### Branching Variations From Baseline

There's another reason to build a baseline: it gives you a place from which to explore.

<!-- diagram:start baseline-variations-graph -->
<figure class="article-diagram">
<svg class="article-diagram__image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 520" role="img" aria-labelledby="baseline-variations-graph-t baseline-variations-graph-d">
  <title id="baseline-variations-graph-t">Evolution tree &#8212; baseline variations and design principles</title>
  <desc id="baseline-variations-graph-d">Baseline branches to Variation 1–3, then further variations; right side lists Baseline Implementation, Design, and Refactoring principles.</desc>
  <rect width="1100" height="520" rx="12" fill="var(--diagram-surface)"/>

  <!-- LEFT: graph -->
  <rect x="36" y="200" width="100" height="44" rx="4" fill="var(--diagram-artifact)"/>
  <text x="86" y="228" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="13" font-weight="700" text-anchor="middle">Baseline</text>

  <g font-family="system-ui,Segoe UI,sans-serif" font-size="12" font-weight="700" fill="var(--diagram-label)" text-anchor="middle">
    <rect x="220" y="90" width="108" height="38" rx="4" fill="var(--diagram-artifact)"/><text x="274" y="114">Variation 1</text>
    <rect x="220" y="200" width="108" height="38" rx="4" fill="var(--diagram-artifact)"/><text x="274" y="224">Variation 2</text>
    <rect x="220" y="310" width="108" height="38" rx="4" fill="var(--diagram-artifact)"/><text x="274" y="334">Variation 3</text>
  </g>

  <g fill="none" stroke="var(--diagram-validation)" stroke-width="2">
    <path d="M136 222 C175 222, 175 109, 220 109"/>
    <path d="M136 222 H220"/>
    <path d="M136 222 C175 222, 175 329, 220 329"/>
  </g>

  <!-- Level 3: from V1 three (Variation 4 + 2 blank); V2 two blank; V3 two blank = 7 terminal? Slide said 9 total in column.
       Inventory: further branch → column of 9 boxes; top Variation 4, rest blank. From V1:3, V2:3, V3:3 = 9. -->
  <g>
    <rect x="420" y="48" width="86" height="30" rx="3" fill="var(--diagram-artifact)"/>
    <text x="463" y="68" fill="var(--diagram-label)" font-family="system-ui,Segoe UI,sans-serif" font-size="11" font-weight="700" text-anchor="middle">Variation 4</text>
    <rect x="420" y="86" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="120" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="168" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="202" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="236" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="286" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="320" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
    <rect x="420" y="354" width="86" height="26" rx="3" fill="var(--diagram-fail)"/>
  </g>
  <g fill="none" stroke="var(--diagram-validation)" stroke-width="1.6">
    <path d="M328 109 C370 109, 370 63, 420 63"/>
    <path d="M328 109 C370 109, 370 99, 420 99"/>
    <path d="M328 109 C370 109, 370 133, 420 133"/>
    <path d="M328 219 C370 219, 370 181, 420 181"/>
    <path d="M328 219 C370 219, 370 215, 420 215"/>
    <path d="M328 219 C370 219, 370 249, 420 249"/>
    <path d="M328 329 C370 329, 370 299, 420 299"/>
    <path d="M328 329 C370 329, 370 333, 420 333"/>
    <path d="M328 329 C370 329, 370 367, 420 367"/>
  </g>

  <!-- RIGHT: bullets -->
  <g font-family="system-ui,Segoe UI,Helvetica,Arial,sans-serif" fill="var(--diagram-label)">
    <text x="560" y="56" font-size="15" font-weight="700">Baseline Implementation</text>
    <g font-size="12" fill="var(--diagram-line)">
      <text x="560" y="80">• Always start with a baseline implementation</text>
      <text x="560" y="98">• Helps with understanding all of the nuances and complexities of the domain</text>
      <text x="560" y="116">• Verify complete functionality by writing tests</text>
      <text x="560" y="134">• Leaving yourself open to a multitude of possibilities (not married to a solution)</text>
      <text x="560" y="152">• With decades of experience you might arrive at the best/correct design in one step, but&#8230;</text>
    </g>

    <text x="560" y="200" font-size="15" font-weight="700" fill="var(--diagram-label)">Design</text>
    <g font-size="12" fill="var(--diagram-line)">
      <text x="560" y="224">• Simplicity</text>
      <text x="560" y="242">• Reduction process not an additive process</text>
      <text x="560" y="260">• Complexity undermines your ability to comprehend</text>
    </g>

    <text x="560" y="308" font-size="15" font-weight="700" fill="var(--diagram-label)">Refactoring</text>
    <g font-size="12" fill="var(--diagram-line)">
      <text x="560" y="332">• To clean up</text>
      <text x="560" y="350">• To improve readability and maintainability</text>
      <text x="560" y="368">• Verify proper functionality using tests written previously</text>
      <text x="560" y="386">• Not to design for “What if” and “Just in case” scenarios (KISS &amp; YAGNI)</text>
    </g>
  </g>

  <text x="24" y="500" fill="var(--diagram-line)" font-family="system-ui,Segoe UI,sans-serif" font-size="11">D2 · video ~55:00–55:25 (clean recreation of evolution tree slide)</text>
</svg>
<figcaption>Baseline variations branching from a baseline implementation</figcaption>
</figure>
<!-- diagram:end baseline-variations-graph -->

Once it exists, you can try one change, then another. The graph shows several variations branching from the same working implementation. Each one can reveal a problem or a solution you hadn't considered.

The important word is *build*. Even after twenty years, writing the baseline can reveal things I missed while thinking about it. Only then can I compare the possible directions against something real.

If I jump straight from a problem to my familiar solution, I may never see the other paths. Sometimes the highway makes sense. When I'm learning or exploring a design, I also want to take the scenic route.

One of those paths may suit this system, company, or team better than the path I've taken throughout my career. Each variation can lead to more variations. I don't want to lose those possibilities by treating my first idea as *the* solution.

I'm guilty of skipping the baseline myself. I've seen a problem before and wanted to announce the answer. But when someone asks what I think, I'd rather experiment, perhaps with the team, before committing to a design.

Be comfortable saying, **"I didn't think of that."** Twenty years of experience don't mean I've seen every possibility. Once someone shows me a better path, I know more than I did before.

### Same Tests Across Implementations

Write tests that verify the required behavior. As you try other implementations, run the same tests against them. They tell you whether a new design still conforms to the requirement. That's one of the benefits of starting with a working baseline.

### Design Is Simplification

> Simple is not easy.

Design is a reduction process. Complexity makes the system harder to understand and change. A design may be easy *for you* because you wrote the damn thing. Then I come along and have to keep all those pieces in my head. Keep it simple for both of us.

To be a good designer, learn to simplify.

The refactoring begins after the baseline is functional and tested. It may already be suitable for production. If I change it, I want the change to improve readability or maintainability, or solve another problem I can name.

> Maintainability trumps everything I do in my design.

If a design isn't maintainable, I don't care that someone calls it "better." I'm not chasing an award for the best software design. There isn't one. If there were an award for simplicity, though, I'd pay attention.

Readability and maintainability are what drive my choices.

I design for what I know now, not every possible *what-if*.

Simple systems have been easier for me to extend, even in directions I didn't anticipate. The more I complify, the harder it becomes to change course. I can recognize the flaws in the baseline and still decide they don't matter yet. Leaving it there, deliberately, is design.

Design matters deeply to me. I can show you my process, but you have to build, test, and explore for yourself. That's how this judgment develops.
