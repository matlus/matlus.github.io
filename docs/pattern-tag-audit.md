# Pattern tag audit

Reviewed on 2026-09-25 for issue #9. Each of the 16 published pages carrying
`design-patterns` was read in full and classified using the revised
`prompts/extract-description-and-tags.md`. Existing descriptions remain.

The Design Patterns collection covers named software design patterns.
Architectural Patterns covers system roles and boundaries. AI Workflow Patterns
covers coordination of model judgments with code. A specific pattern tag can
describe a supporting explanation without earning an umbrella tag.

| Page | Pattern collection | Reason |
| --- | --- | --- |
| Architecture Layers, C# | Architectural Patterns | Teaches Domain Facade, Service Locator, Configuration Provider, Gateway, and Data Manager responsibilities. |
| Architecture Layers, Python | Architectural Patterns | Teaches the same boundaries with Python exports and downward dependencies. |
| Design Nugget: Evolution To Strategy | Design Patterns | Develops a worked Strategy context and independent parsers. |
| C# 8 - Async Streams | Design Patterns | Explains Iterator through consumer-controlled enumeration, asynchronous movement, and disposal. |
| Clean Abstractions Around Libraries | Architectural Patterns | Develops Gateway, Data Manager, and Configuration Provider contracts. |
| The Configuration Provider | Architectural Patterns | Explains source abstraction, typed settings, validation, and failure ownership. |
| Async-Await in C# | None | Teaches asynchronous I/O and task composition; the Gateway reference does not develop the role. |
| Dependency Injection? No Thank You! | None | The worked example concerns exposed dependencies; Strategy, Factory, and Template Method are mentioned as options. |
| Factory Pattern | Design Patterns | Develops construction and product families, with an explained Strategy comparison. |
| Prefer Composition Over Inheritance | Architectural Patterns | Refactors system-specific Configuration Providers into composed capabilities. |
| Intentional Model Design | None | Model shape is central; the supporting Gateway translation explanation retains its specific tag. |
| Validating Formal Arguments? No Thank You! | Architectural Patterns | Validation and immutable-data trust depend on Domain Facade and Configuration Provider boundaries. |
| Jev: A Practical Reference | AI Workflow Patterns | Develops fan-out, confidence gates, composite scoring, and intent routing. |
| Interfaces? No Thank You! | Architectural Patterns | Applies a narrow Gateway capability contract to a Service Locator. |
| Factory Method Pattern | Design Patterns | Develops the two class families and creation hook, then compares a separate Factory. |
| Separate State from Behavior | Architectural Patterns | The worked Manager composes Service Locator, Configuration Provider, Gateway, and Data Manager roles. |

Four pages retain `design-patterns`, eight move to `architectural-patterns`,
one moves to `ai-workflow-patterns`, and three receive no umbrella replacement.
Async-Await also loses its passing `gateway-pattern` tag. Dependency Injection
loses its passing Strategy, Factory, and Template Method tags.

The architecture chapter manifest uses the same classification as its converted
pages. All existing tag and article URLs remain available, including tags whose
last passing reference was removed. New topic heroes and their exact prompts
are saved under `src/assets/heroes/`.
