# Metadata review

A read-only metadata sub-agent applied `prompts/extract-description-and-tags.md`
to the complete article on October 5, 2026.

Before publication, the sub-agent re-read the activated copy against the current
178-tag vocabulary. The 171-character description and all four tags remain valid;
no changes or additional pattern tags are needed. The full tag check passed.

## Description

Use null-conditional calls only when skipping work is correct. Required logging and optional disposal expose the difference between nullable warnings and runtime behavior.

## Reasoning

The article teaches conditional access only when the receiver may legitimately
be null and skipping the operation satisfies the intended behavior. Required
logging demonstrates omitted work, nullability and suppression distinguish
compiler analysis from runtime behavior, and disposal provides a valid skip.
There is no sibling article.

## Tags

- `null-conditional-operator`: new subject. Label: Null-Conditional Operator.
  Description: Conditional member or element access that stops evaluation when
  its receiver is null. Its use determines whether missing objects legitimately
  skip work or conceal a broken assumption.
- `nullable-reference-types`: new subject. Label: Nullable Reference Types.
  Description: C# annotations and compiler analysis that describe whether
  references may be null. Initialization, flow analysis and warning suppression
  determine the promises expressed in source code without adding runtime null checks.
- `error-handling`: existing subject.
- `csharp`: existing language.

Candidate checks found no duplicate. `optional-parameters` concerns omitted
arguments rather than conditional execution. `value-and-reference-types` concerns
storage and copying rather than static null analysis. Both new topics now have
distinct hero images and entries in the publication vocabulary. All four tags
above are applied to the retained draft.

Both distinct topic illustrations are now generated and visually checked. Their
native 2120 x 742 dimensions preserve 20:7. The owner approved retaining those
dimensions without upscaling and requested a more interesting conditional-access
screen. Its revised blog workspace shows an article preview and an activity
timeline with an omitted log entry. Final WebPs and complete prompts are in
`src/assets/heroes/`. The article's separate 2100 x 455 exception remains applied.
