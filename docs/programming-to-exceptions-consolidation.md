# Programming to Exceptions consolidation

Updated: 2026-10-02

The owner requested a shared teaching series instead of separate C# and Python
Validation and Exception Handling articles. Useful material from both reference
chapters is retained below; C# supplies the worked examples. The original corpus
files remain in the repository with `draft: true`. Their prose is unchanged.

## Reading order and source coverage

| Reference material | Published destination |
| --- | --- |
| Complete the operation or throw; required retrieval versus optional search; Try-Parse; visible failure; cleanup ownership | Part 1: Method Contracts and Failure |
| Front and back doors; typed domain input; normalization before validation; specialized validators; internal callers' responsibilities | Part 1, with links to Intentional Model Design and Method Design |
| Shallow business/technical hierarchy; specific concrete failures; clear messages with safe rejected values and corrections; branch defaults and response policies | Part 2: Diagnostics and Boundaries |
| Shared diagnostic base, typed log events, contextual data, text/JSON snapshots, original causes, predictable recorded values | Part 2 |
| Gateway and Data Manager translation; original provider details; shared classification helpers; terminal throw helpers | Part 2, with links to Gateway and Method Design |
| Actual recovery, bounded transport retries, durable pending work, cancellation ownership | Part 2 |
| Concurrent failures and the difference between the exception surfaced by await and all failures held by the combined task | Part 2's developed C# batch example |
| Request enrichment, caller-safe response, cross-service diagnostic transport, originating service and complete causal chain | Part 2 |
| Boundary-owned failure recording, logging-site severity, host-owned providers, SDK scope configuration | Part 3: Logging and Progress |
| Application Insights custom dimensions, individually searchable fields, KQL, alerts, property limits and durable reproduction records | Part 3; moved from Part 2 without dropping its figure |
| Stable typed progress events, shared step presentation, run/item identity, counts, elapsed time and host-configured destinations | Part 3 |
| Acceptance checks of input-aware messages, text/JSON agreement, actual telemetry dimensions, all item failures and honest progress events | Parts 2 and 3 |
| Pure data models and visible normalization rather than hidden constructor behavior | Existing Intentional Model Design, linked from Part 1 |
| Method return contracts and visibility | Existing Method Design, linked from the series |
| Context-free LINQ failures | Existing LINQ chapter; application-specific failure messages and required retrieval developed in Parts 1 and 2 |

## Conflicts resolved

- Follow the owner's specific-exception policy. Shared extraction or provider
  classification can be reused; concrete exceptions identify one originating
  operation and failure scenario. Generic reusable timeout or operations failures
  are not carried forward.
- Keep the approved hierarchy's shared-policy sub-branch where needed. The aim is
  shallow and broad, rather than a prohibition on every extra abstract branch.
- Require diagnostic inputs in the teaching base. Convenience constructors must
  not silently omit the operation's log event and context.
- Preserve all concurrent item failures. Do not choose the first child merely to
  fit a single-failure response.
- A business exception is an intentional refusal, not evidence of a broken system.
  Alerting policy follows the owner's guidance on unexpected defects and repeated
  technical failures. Progress reporting addresses work that is still running.
- Describe `DoesNotReturn` as analysis metadata and verify the implementation's
  terminal behavior; do not claim the attribute itself enforces every path.
- Logger scopes require actual exporter configuration. Inspect recorded telemetry
  rather than assuming a diagnostic dictionary automatically becomes custom dimensions.

Internal analyzer rules, review-override syntax and repository review checklists
remain in the archived corpus. They are tooling policy rather than additional
reader-facing exception teaching. Python-only syntax is represented by the shared
concept or corresponding C# example, rather than a parallel language article.

## URL preservation

The old topic hub and both language-specific HTML URLs redirect to
`/pwi/programming-to-exceptions/`. On this static GitHub Pages site those are HTML
redirect documents, rather than server-issued HTTP redirects. The legacy C# and
Python `.md` URLs return a shared reading guide linking to all three articles and
their Markdown versions. Retired chapters are excluded from listings, search,
aphorism backlinks, and the sitemap. Internal links now point directly to the
appropriate series section.

Part 2 retains the published headings for its diagnostic-record and Application
Insights sections, with direct links to Part 3. Existing links to those anchors
therefore still have useful destinations.

The shared source recording remains public. Part 3 carries the recording's
2019-10-28 date because its detailed exception-logging material was moved from
Part 2; the October 2 revision records the progress material and consolidation.
Both full ordering repositories remain private, so public repository cross-links
remain deferred until the owner publishes them.

## Publication verification

Local verification passed on October 2:

- Writing audits: no findings across all three articles.
- Site copy audit: zero hard findings; existing advisories reviewed.
- Tag check: 75 tags, no near-duplicates, complete prompts and heroes.
- Typecheck: zero errors, zero warnings, 33 existing hints.
- Build and search check: 145 pages built, 144 indexed, no unresolved preload markers.
- Generated link check: all local links resolve.
- Structural checks: three-part order, legacy HTML redirects and Markdown guides,
  retained Part 2 anchors, moved diagram and excluded duplicate retrieval content.
- .NET 10: the exact concurrent-batch listing compiles with nullable analysis and
  warnings treated as errors. Two item failures and their diagnostic evidence
  survive; successful work and cancellation retain their separate outcomes.
- Browser: new article hero and text inspected at desktop and phone widths;
  no page overflow, and the moved diagram loads.

Run the writing audit, site copy audit, tag check, typecheck, build and link check.
Inspect the generated reading order, redirects, legacy Markdown guides and absence
of duplicate chapter bodies. Check the new article and hero in desktop and narrow
layouts. Match the Pages deployment to the exact pushed commit, verify canonical
live URLs, and add Part 3 to the public source video's existing article links.

## Live publication evidence

Commit `7e6de669fd5487b74ae1e5db04c477d73c8df8f8` reached `origin/main`.
[Pages run 37041511666](https://github.com/matlus/matlus.github.io/actions/runs/37041511666)
matched that exact SHA and succeeded. All three canonical articles, the shared hub,
the three legacy HTML redirects and both legacy Markdown guides returned HTTP 200
with their expected content. The browser confirmed the three cards in reading order.

The public [source recording](https://www.youtube.com/watch?v=5IKczyor-f4) now has
labelled Part 1, Part 2 and Part 3 links in its description. The existing description
and PWI link were preserved. Studio confirmed the saved state; a fresh public
metadata retrieval independently confirmed all three canonical article URLs and
the PWI link. All three articles link back to that recording.

Both full Meridian repositories were rechecked as private. Reciprocal public-code
links remain deferred, as in the original publication plan. No visibility change
or unrelated repository substitution was made.

The optimized hero assets and their built-in image-generation prompts are saved as
`src/assets/heroes/programming-to-exceptions-logging-and-progress.{webp,prompt.md}`,
`src/assets/heroes/tag-try-parse.{webp,prompt.md}`, and
`src/assets/heroes/tag-progress-reporting.{webp,prompt.md}`. The generated originals
remain outside the repository in the owner's generated-image workspace.
