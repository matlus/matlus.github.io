# Programming to Exceptions publication plan

Prepared October 2, 2026.

Publish both Programming to Exceptions articles with finished prose, embedded
diagrams, article heroes, and verified source links. Commit the related changes
to `origin/main`, verify the resulting GitHub Pages deployment, and complete the
applicable website, YouTube, and public code-repository cross-links.

**Completed October 2, 2026.** Both articles are live with finished diagrams,
heroes, metadata, and verified reciprocal video links. Repository visibility
is unchanged; public Meridian linkage remains deferred.

## Confirmed starting point

- Both articles are present as drafts:
  `src/content/writing/programming-to-exceptions-method-contracts.md` and
  `src/content/writing/programming-to-exceptions-diagnostics-and-boundaries.md`.
- Part 1 contains the approved order-placement comparison. It defines boundary
  handler as exception-handling middleware in a Web API before the diagram and
  repeats that connection in its caption.
- Part 2 contains the supplied custom-exception hierarchy. Both placed diagrams
  have descriptive alt text, captions, full-size links, and retained prompts.
- The raw transcript identifies the shared source as
  [Programming To Exceptions](https://www.youtube.com/watch?v=5IKczyor-f4).
  Live video metadata checked October 2 confirms Shiv Kumar's channel,
  public availability, and publication on **2019-10-28**. Both articles currently
  use the historical fallback date of 2017-09-20; replace it with the video date.
- The current video description contains the PWI and website links, with no
  GitHub repository link and no links to these unpublished articles.
- Live GitHub metadata checked October 2 confirms that both
  `matlus/Meridian-Ordering-CSharp` and `matlus/Meridian-Ordering` are private.
  Do not assume either is a public source destination or change visibility.
- The website checkout is on `main` and has uncommitted article, image, prompt,
  documentation, and previously approved typography work. Preserve other work.

## Roles and dependencies

| Role | Responsibility | Status |
| --- | --- | --- |
| Primary assistant as editor | Revise both articles, reconcile terminology, prepare examples and source links | Completed |
| Primary assistant as image author | Complete briefs, generate and inspect images, place optimized assets | Completed |
| Required metadata sub-agent | Read both final articles and the extraction prompt; report descriptions and tags | Completed by `publication_metadata` |
| Primary assistant as publisher | Run checks, commit and integrate into `origin/main`, verify deployment and cross-links | Completed |

Use the current chat's configured model and reasoning settings for execution.
The metadata sub-agent inherits those settings; no model overrides are selected.
No other agent work is proposed. The metadata agent runs after the final prose,
and publication follows completed images, metadata, and checks.

## Wave 1 Editorial completion

Revise the drafts using the professional-writing skill and the owner's accepted
clarifications. Preserve the direct, forceful teaching voice and the two-part
structure. Keep recording narration and editorial tasks out of the article bodies.

1. Make the opening and before-and-after example teach the core benefit quickly.
   Align the main comparison with the approved order-placement diagram. Start
   with the domain request; remove the invented member-mapping step from that
   comparison. Identify simplified teaching code and preserve the actual
   ordering and the source's business and recovery policies.
2. Use **Programming to Exceptions**, **action or command method**, and
   **query method** consistently. Match Method Design's required Get, optional
   Find/Search, and Boolean existence contracts. Verify the exact chapter anchors.
3. Keep the boundary-handler definition beside the diagram. Use
   **exception-handling middleware** consistently for the Web API role, and
   explain other hosts only where relevant. Keep the distinction between
   detecting a failure, translating it, logging it, and actually recovering.
4. Make deliberate business exceptions unmistakable: the system is doing what
   it was designed to do. Preserve the owner's operational point without adding
   unrelated security or auditing scenarios or claiming that silence measures
   every aspect of operational health.
5. Make the broad, shallow exception hierarchy and scenario-specific leaf types
   explicit. Give customer retrieval and order-placement failures distinct types
   in the examples. Validate the intentional single-origin rule and its explained
   request-validation exception. Do not modify the Meridian implementations;
   their separate issue work belongs to another conversation.
6. Check messages for the offending value where appropriate, the exact problem,
   the remedy or constraint, and a short bounded set of allowed values when useful.
   Keep internal diagnostic context and user-visible messaging clear.
7. Develop meaningful handling through bounded retry, Retry-After and jitter,
   specific retry-exhaustion exceptions, and understood database-to-domain
   translation with the original cause retained. Avoid unsupported SDK generalizations.
8. Verify the complete diagnostic contract: local context plus incoming request,
   Application Insights custom dimensions, filtering and alerts, reproduction,
   and HTTP transport of retained failure records through C, B, A, and the UI.
   Use the owner's main-log architecture consistently. Services may also log locally.
9. Check all diagrams, captions, types, code, and prose for the same names and
   relationships. Consolidate repeated explanation and retain the qualifications
   needed to apply the examples correctly.

Completion: both articles teach the accepted philosophy completely, with no
unexplained image terms, contradictory examples, or reader-facing review tasks.

## Wave 2 Images and placement

Use the approved flat fine-line diagram style and its saved reference for all
embedded diagrams. Each generated diagram gets a complete drawing prompt,
optimized workspace asset, descriptive alt text, caption, and full-size link.
Inspect exact labels, arrow origins and directions, branches, and retained context.

| Part | Diagram | Publication action |
| --- | --- | --- |
| 1 | Order-placement comparison | Retain the approved image and current placement; align nearby examples |
| 1 | Validate every front and back door | Generate from the saved entry-point brief; place in the boundary-validation section |
| 2 | Custom-exception hierarchy | Retain the supplied image and current placement |
| 2 | Exception-handling middleware | Generate request plus exception context, diagnostic log, and HTTP response; place at the outer-boundary explanation |
| 2 | HTTP failure chain through C, B, A, and UI | Generate nested upstream diagnostic records; place at the service-chain explanation |
| 2 | Application Insights custom dimensions | Generate capture, dimensions, filtering, alerts, and reproduction; place at the telemetry explanation |

The doors diagram must show the Domain Facade delegating and every public
Manager method validating through specialized validators. Configuration,
Gateway transformation and validation, database results, and file input are
additional admission points. No invalid path reaches internal domain work.

The two optional images, Parse versus TryParse and provider-to-domain exception
translation, are not publication dependencies. Their code explanations remain.
Remove those bracketed image notes rather than publish planning text.

Generate one distinct hero per article using the established editorial ink style.
Part 1's subject is dependable method contracts and the ordered happy path;
Part 2's subject is diagnostic context traveling to an actionable log.
Embedded diagram lettering and website reading typography retain their approved styles.

Completion: six embedded diagrams and two heroes are placed, readable, and
consistent with the adjacent teaching. No image placeholders remain.

## Wave 3 Metadata and publication checks

Run the required metadata sub-agent with both final articles,
`prompts/extract-description-and-tags.md`, and `src/data/tags.ts`. Apply the
verified descriptions and tags. Reuse appropriate existing tags; any justified
new tag must have its definition, distinct subject hero, and retained prompt.

Set both articles' source video to the same verified URL, their publication
date to 2019-10-28, and their modification date to the actual final editing date.
Keep video links in the site's resource metadata rather than narrating the
recording inside the articles. Keep reciprocal Part 1 and Part 2 links.

The canonical article URLs will be:

- `https://matlus.com/writing/programming-to-exceptions-method-contracts/`
- `https://matlus.com/writing/programming-to-exceptions-diagnostics-and-boundaries/`

Enable both routes together in the publication candidate. Inspect the rendered
articles on desktop and mobile, including headings, figures, code, links,
resource cards, dates, and the existing typography. Confirm both appear in
Writing, relevant topic pages, search, feeds, sitemap, and Markdown exports.

Run the required checks without hiding failures:

```text
npm run typecheck
npm run build
python tools/audit-copy.py src docs prompts
python tools/check-tags.py
python tools/check-links.py dist
```

Run the professional-writing audit on the revised prose and inspect all findings.
Recompile and exercise materially changed complete C# listings; verify integration
sketches against their declared scope. Inspect exported Markdown captions and
links as well as HTML. A build with draft routes excluded is insufficient.

Completion: the publication candidate renders both articles with working
assets and links, and all applicable checks pass.

## Wave 4 Commit and website deployment

Inspect the complete diff and current remote state before staging. Include both
articles, selected artwork and prompts, related documentation and metadata,
and the previously approved typography changes. Preserve unrelated edits and
discarded trials without accidentally publishing them as selected artwork.

Commit the scoped publication work and integrate it into `origin/main` without
overwriting remote changes. If the repository requires a pull request, use that
workflow and attach the created PR to this chat. No force push is proposed.

Match the GitHub Pages deployment to the exact resulting main commit SHA.
After deployment succeeds, verify both live canonical URLs, figures, resource
links, dates, Markdown twins, search results, and cross-links between the parts.

Completion: `origin/main` contains the publication changes, its deployment is
successful, and both articles are verified on the live website.

## Wave 5 Cross linking and closeout

After the two canonical URLs are live, update the shared YouTube description
with clearly labelled Part 1 and Part 2 links. Preserve existing description
text, PWI links, website links, and any repository link present at execution time.
Verify the saved description through fresh public metadata.

Recheck repository visibility and the actual source association before adding
code links. For every verified public repository supplying the article's code,
make the article resource card link to that repository, retain or add its video
link in the description, and update its README to link to the shared video and
both articles. Verify the saved README and the public destinations.

Neither full Meridian repository currently qualifies for public article source
links. Publication of the articles can proceed with inline examples. Track
Meridian's public repository links and reciprocal README work as deferred until
the code is public. Do not substitute an unrelated public repository or imply
that a starter project contains the illustrated implementation. Making the
repositories public is outside this plan.

Record publication evidence in the repository handoff and review backlog:
the website commit and deployment, two canonical URLs, selected assets, shared
video and verified description, each completed public README update, and any
explicitly deferred private-repository linkage. Report website publication and
cross-link completion separately so an unavailable repository is never counted
as a completed three-way link.

Completion: both articles are live, both point to the shared video, the video
points to both articles, and every applicable public code repository has the
reciprocal links. Any private-code dependency is explicitly recorded.

## Execution checks, October 2, 2026

The completed candidate contains six embedded diagrams and two article heroes.
The required read-only metadata agent returned 164-character and 163-character
descriptions and the reconciled tags. Structured Logging was added with its own
topic hero and prompt; Try-Parse uses the existing Design Patterns topic.

Current verification passed:

- Typecheck: zero errors, zero warnings, 33 existing hints.
- Build: 145 pages; Pagefind indexes 144 pages with no unresolved preload markers.
- Copy audit: zero hard findings. The 30 advisories were reviewed; the two new
  hero-prompt flags are literal rendering constraints, and the others predate this work.
- Both article writing audits: no findings.
- Tag check: 73 tags, no near-duplicates, complete hero assets and prompts.
- Generated local links: all resolve, including the Method Design anchors.
- .NET 10: current complete foundations and exact comparison listings compile
  with nullable analysis and warnings treated as errors. All six failure positions
  stop subsequent work; both successful paths complete. Diagnostic checks pass.
- Browser: desktop and phone layouts inspected. Body text remains 18px, the
  approved heading gap is retained, and dense figures scroll within their own
  container on phones with full-size links available. Both Markdown exports retain
  diagram explanations, historical dates, and the shared source-video link.

## Publication and cross-link evidence

Publication commit `f97196261f72035feedaf0577f0e6892c77111e3` reached `origin/main`.
[GitHub Pages run 37027699821](https://github.com/matlus/matlus.github.io/actions/runs/37027699821)
matched that exact SHA and completed successfully. Both canonical article URLs
returned HTTP 200 after deployment:

- [Part 1: Method Contracts and Failure](https://matlus.com/writing/programming-to-exceptions-method-contracts/)
- [Part 2: Diagnostics and Boundaries](https://matlus.com/writing/programming-to-exceptions-diagnostics-and-boundaries/)

Both article resource sections link to the public
[Programming To Exceptions recording](https://www.youtube.com/watch?v=5IKczyor-f4).
Its description was updated in YouTube Studio with labelled links to both articles,
preserving the existing text, website link, and PWI homepage link. Studio confirmed
"All changes saved." Fresh public video metadata independently confirmed both
canonical article links and the existing PWI link on October 2.

The closing documentation commit also removes inline formatting from the hierarchy
caption so the existing Markdown exporter retains its complete explanation. Local
checks cover both published articles and all six diagram explanations.

The full Meridian repositories were rechecked as private. Their README and article
resource links remain explicitly deferred; no repository was made public and no
unrelated repository was substituted. This is a completed website/video linkage,
with future public-code linkage recorded in the review backlog.
