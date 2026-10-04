# Transcript series preparation

Started October 3, 2026 as preparation for editorial review. On October 4, the
owner approved publishing all eleven completed drafts, including images, metadata,
source links and the complete publication workflow. All eleven are now published;
the publication register supersedes the preparation statuses below.
See [the publication register](transcript-series-publication.md).
The 53 recovered historical articles and their dates remain unchanged.

## Remaining Performance batch ready for review, October 4, 2026

The owner subsequently approved publication of all six articles, including tag
reconciliation and video/repository backlinks. Publication copies now live in
`src/content/writing/`. See the [publication register](performance-articles-publication.md);
the preparation status and local preview details below describe the review stage.

All six remaining articles now have complete drafts, source/code checks,
independent description/tag review, article heroes and inline figures. This is
a new preparation batch following the eleven published articles. The six drafts
remain outside the publication collection with `draft: true`; publication and
remote changes await the owner's review. All seventeen unique recordings now
have article drafts or publication copies.

| Article draft | Publication and revision date | Hero scene |
|---|---|---|
| [Memory Allocations and Performance, Part 2](drafts/transcript-series/dotnet-memory-allocations-part-2.md) | 2019-08-17 | A layered dispatch hall with nearby stores and distant supply routes |
| [Benchmarking .NET Applications](drafts/transcript-series/benchmarking-dotnet-applications.md) | 2019-11-27 | An instrumented laboratory comparing equivalent operations |
| [ASP.NET Core Web API by Hand](drafts/transcript-series/aspnet-core-web-api-by-hand.md) | 2020-04-26 | A cutaway movie archive showing two request paths |
| [Custom Data Structure: A One-to-Many Mapping](drafts/transcript-series/csharp-one-to-many-mapping.md) | 2020-05-17 | A working switchboard with grouped connections |
| [To LINQ or Not to LINQ](drafts/transcript-series/to-linq-or-not-to-linq.md) | 2021-03-28 | Customer cards moving through a sorting workshop |
| [High Performance Logging and Custom Objects](drafts/transcript-series/high-performance-logging-custom-objects.md) | 2022-01-16 | An operations room handling structured event information |

Both dates were checked against the expanded descriptions on public YouTube
watch pages, including corrections to saved export dates for Part 2 and Logging.
The generated HTML metadata and Markdown twins preserve those exact calendar
dates. The isolated preview's home feed retains chronological ordering: the six
articles occupy historical positions 43, 44, 46, 48, 57 and 58 rather than becoming
the newest entries. The site's sorting code is unchanged.

The six hero asset stems match the draft filenames. Each has an optimized
`.webp` and saved `.prompt.md` under `src/assets/heroes/`. Three new topics have
matching asset pairs: `tag-cpu-caches`, `tag-one-to-many-mapping` and
`tag-adapter-pattern`. All nine were created with the built-in imagegen tool.
Their fuller editorial ink scenes vary the setting and activity. Nine inline
SVGs under `public/images/diagrams/` preserve source figures or explicitly label
new explanations; the mapping chart uses the original workbook measurements.
See the [evidence and verification record](drafts/transcript-series/performance-verification.md)
for source snapshots, figure identities, tested behavior and retained limits.

Validation completed:

- Typecheck: zero errors, zero warnings; 34 existing deprecation hints.
- External-link policy tests: all six pass.
- Primary site build: 307 pages, 306 indexed; search checks pass.
- Isolated preview with all six articles: 313 pages, 312 indexed; search checks pass.
- Copy audit: zero hard errors; existing and new advisory flags reviewed.
- Tag check: 173 tags, no near-duplicates, all topic image/prompt pairs present.
- Generated-link checks pass for both builds, including external new-tab policy.
- All six rendered article pages load their heroes and inline figures without
  horizontal page overflow at the existing desktop viewport. The review gallery
  and all nine inline figures were visually inspected.
- Forty-eight grouped C# behavior checks pass. The BenchmarkDotNet and
  LoggerMessage draft examples compile with their actual package APIs.

Local review files and executable evidence are kept together outside the public
repository at `D:/Source/Workspaces/matlus-performance-2026-10-04/`. The static
preview is served on port 4322, with the six-article gallery at
`http://127.0.0.1:4322/review-performance/`. These local files are preparation
artifacts; the public repository contains only the intended drafts, records and
publication-ready artwork. The branch is `codex/remaining-performance-articles`.

## Earlier review pause, October 4, 2026

The following section records the earlier pause, before the first publication
batch and the six drafts above. Its counts and checks are historical.

Paused at the owner's request after completing the first memory-allocation
article's draft, source figures, executable checks, metadata review and writing
audits. Eleven of seventeen unique articles now have complete first drafts,
reviewed descriptions and article heroes. None has yet cleared final publication
acceptance. Six Performance articles remain to be drafted; Part 2 source reading
has begun, but no article draft has been created.

Before publishing any selected subset, reconcile its topic tags and topic art,
resolve its remaining source/code checks, inspect rendered pages and image crops,
and run the required audits, tag check, typecheck, full build and link checks.
The whole seventeen-article collection need not be finished before a selected
subset can proceed through those checks and an owner publication decision.

## Hero art direction, October 4, 2026

The owner preferred the revised delegates hardware image to its original sparse
music-box metaphor. For this collection, use fuller compositions, closer views,
believable objects, useful tools and visible activity. People can be working
at a computer, examining an execution view or manipulating parts. Choose each
scene from its article's idea and vary the settings. Avoid repeated small objects
on an otherwise empty bench, decorative slogans and unnecessary blank margins.
Readable code and labels are appropriate when they clarify the subject.

The owner clarified that fuller scenes should retain the established technical
editorial ink style: linework, cross-hatching, warm paper and selective color.
The supplied Two references, one shared object artwork is selected for
Fundamentals and serves as the style reference. Photographic variants of the
new workbench scenes are superseded. The owner separately approved the original
delegates hardware image and requested that it be retained.

The first refresh selects ValueTuples, Value/Reference Fundamentals, LINQ and
StringBuilder. These receive versioned hero assets and saved prompts; originals
are retained for comparison. The source-faithful explanatory diagrams inside
the articles retain their separate verification requirements.

The five original hero image/prompt pairs are tracked comparison assets. Each
uses its article slug without a suffix. Published articles and retained drafts
use the selected variants listed below.

| Original hero slug | Selected variant suffix |
|---|---|
| `csharp-delegates-higher-order-functions` | `hardware` |
| `csharp-linq-execution` | `profiler` |
| `csharp-stringbuilder-myth` | `assembly` |
| `csharp-value-reference-fundamentals` | `shared-object` |
| `csharp-valuetuples-deconstruction` | `workbench` |

Completed refreshed heroes: ValueTuples uses the workbench suffix, LINQ uses
profiler, and StringBuilder uses assembly. All three were restyled from the
fuller compositions using the supplied artwork as an ink-style reference.
Checked labels and preserved three tuple positions, the aaa/bbb/ccc customer
fixture with only aaa in both results, and the same sentence assembled by both
string tools. The delegates draft retains the approved hardware suffix.

The owner reattached the supplied Fundamentals PNG, restoring access to its
Downloads path. The optimized shared-object hero is now installed and referenced
by the Fundamentals draft. The supplied composition and labels are preserved.

Current site typecheck reports zero errors, zero warnings and 34 deprecation
hints. Full build and search checks pass (269 generated pages, 268 indexed).
Tag validation passes for the existing 146 tags. Targeted copy audit has zero
hard errors; one retained prompt advisory expresses a required illustration
constraint. These site checks do not render the drafts, which remain outside
the publication collections, or complete their outstanding topic reconciliation.

## Order and completion criteria

1. Locate complete transcripts, existing manuscripts, recordings and slide decks.
   Record source identity and compare substantive coverage with current articles.
2. Prepare **So You Think You Know C#?**, one standalone article per source video.
   Recover code and diagrams from readable recording frames or original sources.
3. Prepare the actual **Performance** playlist in the same way. Preserve separate
   articles for separate videos, even when a video belongs to both collections.
4. Retain **So You Want To Be A Code Reviewer?** as the next collection.
5. Verify code, source coverage and every diagram's labels, counts, containment
   and arrow directions. Record historical claims and contemporary conflicts.
6. Create article heroes, conduct independent description/tag review, reconcile
   tags across the collection, and create distinct heroes for any new topics.
7. Run writing audits, tag checks, typecheck, full build and generated-link checks.
   Inspect rendered articles and assets before requesting a publication decision.
8. After authorized publication, verify canonical HTML and Markdown against the
   deployed commit, then complete source-video and public-repository backlinks.

Private transcript identifiers and exported manuscripts stay in the local source
workspace outside this public repository. Public records identify the recording
and transcript title, without publishing private Drive links.

## Source access

- The Drive connector returned empty search and root results and a 404 for a
  known transcript. The signed-in browser successfully located the collection
  under Programming With Intent / transcripts.
- All ten named C# raw transcripts were exported locally, together with
  existing Fundamentals and Static Classes manuscript folders. Manuscripts are
  source material to compare; their presence does not establish code verification.
- All seven additional Performance raw transcripts were exported locally. LINQ
  appears in both collections and needs one article, giving 17 unique recordings.
- The first C# recording plays in the browser. Its archived Drive copy is 21 GB;
  the bulk-download attempt was cancelled at Drive's size warning. Frame recovery
  uses browser playback. Readable constants code and IL frames match the local
  sample. Fundamentals memory-layout frames are partially recovered.

## C# source register

The following sequence is provisional until full source comparison. Every row
requires transcript coverage, code/frame verification, prose, illustrations,
metadata, and site checks. Destination slugs are proposed and not published.

| Source | Video ID | Proposed destination | Current evidence |
|---|---|---|---|
| So You Think You Know C#? | `7BepNnpU2UU` | `csharp-value-reference-fundamentals` | Complete first draft; ten executable checks pass; two verified diagrams, metadata review and article hero done; final acceptance pending |
| Constructors | `Hf063OqbK64` | `csharp-constructors` | Complete first draft; six executable checks pass; metadata review and article hero done; final acceptance pending |
| Static classes | `IPGizw3YdMg` | `csharp-static-classes` | Complete first draft; source diagram recreated and inspected; metadata review and article hero done; final acceptance pending |
| Constants & Default Parameter Values | `OrpPfOu4PQ0` | `csharp-constants-default-parameters` | Complete first draft; code experiment passes; metadata review and article hero done; final acceptance pending |
| ValueTuples & Deconstruction | `x3At5Pq2__I` | `csharp-valuetuples-deconstruction` | Complete first draft; ten executable checks pass; metadata review and article hero done; final acceptance pending |
| Generics Under the hood | `MIZFp5m3Pus` | `csharp-generics-under-the-hood` | Complete first draft; two teaching programs pass; metadata review and article hero done; historical qualifications documented; final acceptance pending |
| Delegates & Higher Order Functions | `q1BCmwnkFfM` | `csharp-delegates-higher-order-functions` | Complete first draft; eleven executable checks pass; original helper and movie data recovered; metadata review and hero done; final acceptance pending |
| LINQ | `4sHcMxKwBZI` | `csharp-linq-execution` | Complete first draft; eleven executable checks pass with recorded fixture; historical table recovered; metadata review and hero done; final acceptance pending |
| The StringBuilder Myth | `B71rabZtWWI` | `csharp-stringbuilder-myth` | Complete first draft; twelve grouped behavior checks pass; exact historical chart and copy diagram recreated; metadata and hero done; final acceptance pending |
| For vs Foreach | `9bTpI86bA5E` | `csharp-for-foreach` | Complete first draft; thirteen executable checks pass; original loop and iterator code and historical results recovered; metadata and hero done; final acceptance pending |

Public recording URLs use `https://www.youtube.com/watch?v=<video ID>`.
No sample repository was linked in the ten descriptions inspected by the
coordinating task; further source discovery remains open.

## Performance and remaining inventory

Playlist: https://www.youtube.com/playlist?list=PLJ0hAqAAdnpChYeBTabBzFPMASw8qCPzI

The signed-in browser verified all eight entries in the public playlist. Branch
Prediction is a separate inventory candidate, not part of this playlist.

| Known source | Video ID | State |
|---|---|---|
| .Net Memory Allocations and Performance | `aylUPfOVM90` | Complete first draft; fourteen executable checks pass; six source diagrams verified; metadata and hero done; final acceptance pending |
| .Net Memory Allocations and Performance - Part 2 | `Ge0tyJqdhxY` | Raw transcript exported; source frames pending |
| Benchmarking .Net Applications | `KDkB_lu5Ng8` | Raw transcript and existing manuscript exported |
| Asp.Net Core Web API By Hand | `2AQld3TLMac` | Raw transcript exported |
| So You Think You Know C#? LINQ | `4sHcMxKwBZI` | Shared with the C# collection; one destination article |
| Custom Data Structure: A One To Many Mapping | `e27RquJS_Tc` | Raw transcript exported; local PowerPoint source candidate found |
| To LINQ Or Not To LINQ - That is the Question | `D1m-RIWFrhM` | Raw transcript exported |
| High Performance Logging and Custom Objects | `mxlh1v-2S1U` | Raw transcript exported |
| So You Want To Be A Code Reviewer? | Multiple recordings | Drive collection and several raw transcripts located; remains after C# and Performance |

## Coverage and conflicts

Initial text searches found incidental StringBuilder uses and a mention of
default parameter values in existing articles. These do not establish duplicate
teaching coverage. Compare full sources against the existing LINQ, performance,
class/method design and state/behavior material before drafting.

The Fundamentals transcript covers inline value storage, references, structs
with reference members, class fields, passing values and references, string
immutability and allocation costs, mutation of a shared object's Name property,
and the author's preference for explicit method results over hidden mutation.
Its conceptual memory-layout explanation must retain its stated conceptual
scope. Check stack/heap absolutes, interned string lifetime and reference-width
labels against the source frames and current runtime documentation. Do not
silently present these historical simplifications as universal runtime guarantees.
