---
title: "Refactoring and Adopting Boundary Testing"
description: "Boundary scenarios protect public outcomes while internals change. Adopt the discipline one feature at a time, preserve useful failure contracts, and justify smaller production boundaries."
datePublished: 2026-06-15
dateModified: 2026-09-27
tags: ["acceptance-testing", "refactoring", "architecture", "error-handling", "boundary-validation", "gateway-pattern", "architectural-patterns", "csharp"]
hero: refactoring-and-adopting-boundary-testing
---

Suppose the order manager is becoming difficult to maintain. You want to split
its responsibilities without changing what an accepted order records or sends.
The existing acceptance scenarios give you a way to verify those obligations
while the internal organization changes.

> **About the examples:** Meridian Ordering is a private training reference project. The inline listings illustrate the techniques; the full C# and Python repositories are not currently public.

The test still invokes the same public operation, reads its results from the
database and broker, and compares its email capture. That stability comes from
asserting behavior through the boundary and retaining the real production path.
Architecture, coding, failure handling, and review make the path understandable
and its failures meaningful.

## Keep the contract stable while changing the internals

<!-- diagram:start stable-boundary-refactoring -->
<figure class="article-diagram">
<svg id="stable-boundary-refactoring" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 650" role="img" aria-labelledby="stable-boundary-refactoring-title stable-boundary-refactoring-desc" style="display:block;width:100%;max-width:640px;height:auto;margin:auto">
<title id="stable-boundary-refactoring-title">Stable outcomes through internal refactoring</title>
<desc id="stable-boundary-refactoring-desc">A refactor reorganizes internal implementation while keeping the public operation and required observable effects stable. The same scenario and outcome comparisons continue to verify that contract; support may change when genuine transport seams change.</desc>
<defs><marker id="stable-boundary-refactoring-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="fill:var(--diagram-line)"/></marker></defs>
<text x="170" y="35" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170" dy="0">Before</tspan></text><text x="470" y="35" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470" dy="0">After</tspan></text><rect x="30" y="75" width="280" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="170.0" y="139.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Public operation</tspan></text><rect x="330" y="75" width="280" height="110" rx="10" style="fill:var(--diagram-validation-fill);stroke:var(--diagram-validation);stroke-width:2"/><text x="470.0" y="139.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Same operation</tspan></text><path d="M 170 185 L 170 230" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#stable-boundary-refactoring-arrow)"/><path d="M 470 185 L 470 230" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#stable-boundary-refactoring-arrow)"/><rect x="30" y="235" width="280" height="110" rx="10" style="fill:var(--diagram-controller-fill);stroke:var(--diagram-controller);stroke-width:2"/><text x="170.0" y="282.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Original internal</tspan><tspan x="170.0" dy="33">organization</tspan></text><rect x="330" y="235" width="280" height="110" rx="10" style="fill:var(--diagram-worker-fill);stroke:var(--diagram-worker);stroke-width:2"/><text x="470.0" y="282.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Reorganized</tspan><tspan x="470.0" dy="33">implementation</tspan></text><path d="M 170 345 L 170 390" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#stable-boundary-refactoring-arrow)"/><path d="M 470 345 L 470 390" style="fill:none;stroke:var(--diagram-line);stroke-width:2.5" marker-end="url(#stable-boundary-refactoring-arrow)"/><rect x="30" y="395" width="280" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="170.0" y="459.0" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="170.0" dy="0">Required effects</tspan></text><rect x="330" y="395" width="280" height="110" rx="10" style="fill:var(--diagram-artifact-fill);stroke:var(--diagram-artifact);stroke-width:2"/><text x="470.0" y="442.5" text-anchor="middle" style="font:600 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="470.0" dy="0">Same required</tspan><tspan x="470.0" dy="33">effects</tspan></text><text x="320" y="580" text-anchor="middle" style="font:400 26px var(--font-sans, sans-serif);fill:var(--diagram-label)"><tspan x="320" dy="0">Same scenario and outcome comparisons</tspan><tspan x="320" dy="33">Test support may change with real seams</tspan></text>
</svg>
<figcaption>Keep assertions tied to the public contract and required effects. Internal reorganization can preserve the behavioral suite while legitimate setup or transport-support changes remain explicit.</figcaption>
</figure>
<!-- diagram:end stable-boundary-refactoring -->

The public invocation stays visible:

```csharp
/// Act: the public operation remains the same across an internal refactor.
OrderPlacementResult actualOrderPlacementResult = await domainFacade.PlaceOrderAsync(orderPlacementRequest);
```

The complete test
does not assert the number of manager methods or the identity of an internal
helper. It verifies the returned outcome and the required effects. Moving
composition or splitting orchestration can leave those assertions intact.

This is a refactoring example, not a claim that a particular refactor was applied
for this article. The executable suite supplies the verification a real refactor
would run. If an externally meaningful contract changes, review and change the
affected scenarios deliberately.

## Recognize legitimate test-support changes

Behavior-based tests still depend on observation contracts. A schema change can
require a readback query update. A wire-field change requires new capture mapping
and consumer expectations. A different broker requires appropriate topology and
isolation. New configuration can require setup changes.

Treat those as changes to what the system uses or exposes. Keep requirements,
support code, and assertions consistent without silently weakening comparisons.
A test that fails because its spy reads an obsolete field needs investigation,
just as a production consumer using that field would.

## Begin adoption with one complete feature

For an existing system:

1. Identify a public operation and its required caller, store, and downstream outcomes.
2. Establish business requirements, acceptance criteria, functional requirements,
   and non-functional requirements with their owners.
3. Derive scenarios and independently review their arrangements and expectations.
4. Make required failures observable through meaningful production contracts.
5. Provision the real infrastructure and isolate records and message observations.
6. Introduce a selected transport seam where recipient safety or precise failure
   arrangement requires it, retaining production behavior above that seam.
7. Implement one complete accepted scenario, then refusals and failure states.
8. Protect that feature's required suite in CI and continue feature by feature.

Starting with one feature makes the work concrete. It does not mean declaring
the whole system verified when only that feature has correct coverage. Record
what has been brought under the discipline and what remains outside it.

## Make production failures useful

A meaningful domain exception tells the caller and operator which condition
occurred. Gateways translate provider failures into that language while preserving
appropriate cause and context. Required post-commit handling records pending
obligations and logs the failure according to the feature's policy.

These contracts support both production diagnosis and assertions. They reduce
the need for tests to infer failures from arbitrary nulls or vague success flags.
The [failure article](/writing/refusals-failures-and-work-still-owed/) shows those results
in Meridian.

Validate at the owning trust boundary. After that boundary establishes typed
domain data and the required invariants, internal methods can rely on their
documented contracts. Database and external-provider responses remain separate
boundaries requiring translation and validation. Removing duplicated internal
checks must not remove validation of untrusted input.

## Use a smaller production boundary for inherited rule complexity

I once inherited a badly structured cluster
implementing USPS address formatting rules. Refactoring safely required coverage
of its rule permutations first. We placed an abstraction around the cluster,
verified the rules through that boundary, and then reorganized its internals.

That is the reason for conditional class-composite verification: a dense inherited
cluster can make full-system arrangement structurally impractical for all of its
rule cases. The abstraction remains a real production boundary around the cluster,
and system-level scenarios still verify that it participates in the assembled
operation. It is not a license to replace that operation's acceptance suite.

Meridian does not demonstrate that USPS cluster or a class-composite suite.
It does demonstrate independently tested composers that its expectations borrow.
Their complete email
and fulfillment
tests verify those components' content responsibilities.

## Distinguish development tools from the maintained release artifact

A developer may use a small temporary check to understand or construct code.
The thesis does not prohibit that activity. The maintained authority for the
feature remains its reviewed boundary scenarios with complete outcomes.

Supporting tests need an explicit responsibility: oracle verification, assertion
infrastructure, interface translation, or an admitted dense rule boundary.
Avoid retaining arbitrary internal-interaction tests merely because they were
convenient during construction. The suite should explain which requirement each
maintained scenario verifies.

## Protect the gate under delivery pressure

Detailed testing takes time. The business needs to understand the purchase:
continuing regression protection and confidence in the functionality it deploys.
Agree that required scenarios and expectations are reviewed and that the required
suite must pass before behavioral release readiness is claimed.

Developers own readable arrangements, complete comparisons, useful failures, and
appropriate support maintenance. Review owns gaps that a green run cannot discover
on its own. The approach is a team discipline; a testing technique cannot create
competence or resolve missing business decisions automatically.

Adoption grows by preserving verified behavior as features and internals change.
The [regression article](/writing/the-regression-suite-the-business-is-paying-for/) explains the continuing
business value, and the [release article](/writing/from-a-green-suite-to-a-release/)
explains the responsibilities after the suite is green.

---

[Previous article](/writing/the-regression-suite-the-business-is-paying-for/) | [Series contents](/acceptance-testing/) | [Next article](/writing/from-a-green-suite-to-a-release/)
