# Pipeline Breadcrumbs: preparation and evidence

Requested October 5, 2026 as a standalone teaching article derived from the design
document in the public Pipeline Breadcrumbs repository. Title: **Pipeline Breadcrumbs**.
The initial request covered drafting. The owner subsequently authorized
publication, commit, push, PR merge and the repository backlink. This retained
draft is a preparation snapshot; future edits belong in the publication copy.

## Sources

Primary source: [docs/design.md](https://github.com/matlus/pipeline-breadcrumbs/blob/13c6b48bfb089c0de7f7c894488205a61d967eb6/docs/design.md).
Current inspected revision: `13c6b48bfb089c0de7f7c894488205a61d967eb6`, on
`artifact-sink-protocol` in open source PR #3 at the time of inspection.
This includes the naming changes merged in PR #2. The earlier draft used
`257cd6edf54cca6a1b2b87bb45466ef95a4f67a4`; its verification evidence remains
retained separately. The article's setup commands pin the newer revision.
The complete document and README were read alongside step identity, scopes,
artifacts, manifest, run lifecycle, clock, filesystem hosting, demo orchestration,
classification and detection implementations. The source is retained externally at
`D:/Source/Workspaces/matlus-pipeline-breadcrumbs-2026-10-05/source/`.

The repository blog-writing skill, shared clarity guidance and original SelectMany
teaching sample informed the flow: recognizable failure, visible output, a working
baseline, nesting, diagnostic evidence, failure policy, deployment boundaries and
future possibilities. The article teaches directly without narrating its source.

## Coverage

| Source material | Article treatment |
|---|---|
| Two outputs from one source | Logs explain progress; artifacts preserve work |
| Run folders, discriminators, step ordering | Worked directory listing and exact filename components |
| Operators without source access | Opening purpose and production experience |
| Coding assistant use | Shared evidence, run comparison and limits of the claim |
| Step declarations and stable keys | Explicit renumbering and display-name example |
| Scope tree and nested engines | Diagram, StepHostProtocol and argument lifetime |
| Boundaries, outcomes and skipped steps | Working example and explicit conditional reason |
| Raw response persistence | Emit-before-parse source excerpt and failing demo |
| Concurrent page collection | Processor-owned gather policy, bounded concurrency |
| Failure context and logging once | Innermost step stamp, propagation and batch continuation |
| Artifact roles and sink errors | Retention responsibility, host-selected sink object and storage failures |
| Callback versus protocol decision | Two valid alternatives; state, lifetime, discoverability, composition and testing |
| Run artifacts and immutable manifest events | No fake work item, preserved execution history |
| Structured fields and formatting | Attribute table, fixed namespace, one record per event, time modes |
| Local versus hosted | Distinct filesystem and blob stand-in sink classes, artifact locations and log handlers |
| Acceptance tests | Observable contract and supplied recorders |
| Restart, blob storage and portability | Built capability separated from future extensions |
| Earlier implementation defects | Relevant lessons integrated at the point they explain a decision |

The document's stale unpublished-repository status, review finding counts, billing
figures and internal project names are excluded from the lesson. The repository
is public. No claim of a new PWI review or actual Azure deployment is made.
The proposed C# twin is not needed to explain the implemented Python capability.

## Source qualifications

- Ordering is by step path, then artifact kind and discriminator. It is not exact
  emission order within a step or execution order across work item folders.
- Local step numbers are constrained to 1 through 99.
- Derived keys change with display names unless the caller preserves an explicit key.
- The manifest preserves execution records, but the filesystem sink overwrites a
  repeated filename. The draft distinguishes record history from artifact versioning.
- The manifest is emitted at context-manager exit, so abrupt termination or storage
  failure can leave no completed manifest.
- Every emission is offered to the host sink; successful persistence requires that
  sink to work. The demo persists all roles in both host profiles.
- The hosted demo writes exception telemetry locally and simulates a blob container
  using a separate directory. It has no Azure connection or real cloud uploads.
- Restart-from-step, a production blob-storage integration and a C# implementation
  are not implemented here. The demo's blob sink class is implemented.
- Source log timings are identified as illustrative offline-demo values.

## Verification

For the current revision, the source acceptance suite passed: **122 tests**. Four demo runs produced expected
exit codes: clean local 0, failed local 1, clean hosted 0 and failed hosted 1.
Both failure manifests record the first document failed and the second complete;
all four detection replies for the failed document were retained. Hosted failure
produced one exception telemetry record. Clean hosted execution produced no
telemetry file. The full article's runnable listing was extracted and executed
against the current pinned source. The two renamed public calls are
`PipelineRun(pipeline_name=..., artifact_sink=...)` and `open_work_item(...)`.
The implementation excerpt now uses `_model_gateway_protocol`. Manifest examples
use `work_item_name`, `step_path`, `step_key` and `step_name`.
Evidence for this refresh is in the external workspace's
`verification/revision-13c6b48/` directory. The four-profile verification also
asserts that hosted artifacts are under `artifact-container/<run name>/`, no
hosted `run.log` is created, and local manifests remain in the run directory.

The metadata sub-agent re-read the full revised draft against all 178 tag
definitions. The revised description covers exceptions and incorrect results.
Five subject tags and the Python language tag are existing vocabulary; the new
sink-design explanation earns `dependency-injection`. No new topic asset or
pattern tag is needed; the full tag check passes.

Writing audits report no hard findings or punctuation errors. The word
"navigate" refers literally to locating files. The manifest/checkpoint distinction
is a necessary technical qualification. Two authored SVG diagrams follow the
pastel boxology guide; their captions explain the same relationships in prose.

For the earlier draft, all six site checks passed with a temporary publication copy: typecheck (zero
errors or warnings), six link-policy tests, full build, copy audit, tag check and
generated-link check. The temporary content file was removed after verification;
the draft remains outside published content. Check logs are retained in the
external verification directory. Both diagrams were visually inspected, and the
desktop and phone previews showed no page overflow. The local static preview is
at `http://127.0.0.1:4325/writing/pipeline-breadcrumbs/`.

Refresh checks also passed: the extracted article program ran and its two exact
page texts, completed manifest and log boundaries were verified; Pyright reports
zero errors or warnings for that program. Site typecheck reports zero errors or
warnings, the complete build and search index pass, and generated links resolve
with the external-link policy intact. Writing audits report no hard findings.
The two retained wording advisories have their rationale above. Independent
metadata review confirms all tags exist and the tag check passes. The updated
storage diagram was rendered and inspected. The revised browser preview loads
the approved hero, current API example and new sections without page overflow.
Logs and JSON receipts remain under `verification/revision-13c6b48/`.

The owner subsequently requested a creative hero while the source code and design
document are changing. The owner then supplied a workshop scene showing a
developer and assistant investigating pipeline artifacts, and approved the
proposed crop after seeing its dimensions. This replaces the earlier landscape
and numbered-bench candidates. The selected asset's provenance is recorded in
`src/assets/heroes/pipeline-breadcrumbs-v3-crop.prompt.md`. Its approved temporary
export is 1980 x 429, exact 60:13, without upscaling.

The requested source refresh is complete. The current implementation still orders
filenames by step path, artifact kind and discriminator; exact emission ordering
within a step remains future work in the updated design document. The draft
preserves that distinction and now introduces incorrect outcomes without
exceptions alongside its opening failure scenario.

The publication recheck confirms the same source revision and open PR #3.
The article pins this tested public commit; no newer source refresh is needed.
The [publication register](../../pipeline-breadcrumbs-publication.md) records
the deployment and backlink workflow. The earlier Let's Talk publication completed through PR #64; its
follow-up automation is stopped.
